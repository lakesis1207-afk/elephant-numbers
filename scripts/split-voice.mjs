// 클로바 더빙 녹음 나누기 (npm run voice:split [원본 폴더])
// 원본 폴더(기본: 프로젝트 밖 ../녹음 원본/)의 "<묶음 이름>.zip"을 읽어 문장마다
// public/audio/voice/<파일 이름>.mp3 로 만든다. 다시 압축하지 않아 음질이 그대로다.
//  - zip 안에 mp3가 하나면: 문장 부호 뒤의 쉼을 찾아 줄마다 자른다.
//  - zip 안에 mp3가 줄 수만큼 있으면: 순서대로 이름만 바꿔 넣는다.
// 소리를 읽는 데는 브라우저 검사용 크로미움(Playwright)을 쓴다.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { VOICE_LINES } from '../src/audio/voiceLines.js';
import { readZip } from './lib/zip.mjs';
import { readMp3, cutMp3 } from './lib/mp3.mjs';
import { findSegments, alignLines, piecesOf } from './lib/voice-align.mjs';

const STEP_MS = 10; // 소리 크기를 재는 간격
const LEAD_MS = 120; // 말 시작 전 여유
const TAIL_MS = 220; // 말 끝난 뒤 여유
const DECODER_DELAY_SAMPLES = 529; // mp3를 풀면 소리가 이만큼 늦게 나온다
const OUT_DIR = fileURLToPath(new URL('../public/audio/voice/', import.meta.url));
const SRC_DIR = resolve(process.argv[2] ?? fileURLToPath(new URL('../../녹음 원본/', import.meta.url)));

// 파일 이름의 +는 띄어쓰기 (내려받을 때 바뀜). 맥은 한글 자모가 풀려 있어 NFC로 맞춘다.
const groupOf = (zipName) => basename(zipName, '.zip').replace(/\+/g, ' ').normalize('NFC');
const linesOf = (group) => VOICE_LINES.filter((l) => l.group === group);

/** 브라우저에서 mp3를 풀어 10ms마다의 소리 크기와 전체 길이를 잰다 */
async function measure(page, mp3) {
  return page.evaluate(async ({ b64, stepMs }) => {
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const audio = await new OfflineAudioContext(1, 1, 44100).decodeAudioData(bytes.buffer);
    const data = audio.getChannelData(0);
    const win = Math.round((audio.sampleRate * stepMs) / 1000);
    const rms = [];
    for (let i = 0; i < data.length; i += win) {
      let sum = 0;
      const end = Math.min(i + win, data.length);
      for (let j = i; j < end; j += 1) sum += data[j] * data[j];
      rms.push(Math.sqrt(sum / win));
    }
    return { rms, durationMs: audio.duration * 1000 };
  }, { b64: mp3.toString('base64'), stepMs: STEP_MS });
}

/** 줄마다 자를 구간: 말 앞뒤로 여유를 두되, 옆 줄과의 쉼 가운데를 넘지 않게 */
function cutRanges(ranges, totalMs) {
  return ranges.map(([start, end], i) => {
    const prevEnd = i > 0 ? ranges[i - 1][1] : 0;
    const nextStart = i < ranges.length - 1 ? ranges[i + 1][0] : totalMs;
    return [Math.max(start - LEAD_MS, (prevEnd + start) / 2, 0), Math.min(end + TAIL_MS, (end + nextStart) / 2, totalMs)];
  });
}

async function splitOne(page, mp3Buf, lines) {
  const mp3 = readMp3(mp3Buf);
  const { rms, durationMs } = await measure(page, mp3Buf);
  const segments = findSegments(rms, STEP_MS);
  const pieceCount = lines.reduce((n, l) => n + piecesOf(l.text).length, 0);
  const { ranges, warnings, skipped } = alignLines(lines.map((l) => l.text), segments);
  skipped.forEach(([a, b]) => console.warn(`  맨 앞뒤의 짧은 소리(${a}~${b}ms)는 잡음으로 보고 뺐어요.`));
  const delayMs = (DECODER_DELAY_SAMPLES / mp3.sampleRate) * 1000;
  const files = cutRanges(ranges, durationMs).map(([a, b]) => cutMp3(mp3Buf, mp3, a - delayMs, b - delayMs));
  return { files, warnings, note: `구간 ${segments.length}개 / 문장 ${pieceCount}개` };
}

/** 잘라 낸 파일을 다시 풀어서 소리가 들어 있는지 확인. 길이(ms)를 돌려준다 */
async function check(page, id, file) {
  const { rms, durationMs } = await measure(page, file);
  if (!findSegments(rms, STEP_MS, { silenceDb: -30 }).length) throw new Error(`${id}.mp3 에 말소리가 없어요.`);
  return durationMs;
}

async function handleZip(page, zipName) {
  const group = groupOf(zipName);
  const lines = linesOf(group);
  if (!lines.length) {
    console.warn(`[voice] ${zipName}: 대본에 "${group}" 묶음이 없어 건너뛰어요.`);
    return 0;
  }
  const mp3s = readZip(readFileSync(join(SRC_DIR, zipName)))
    .filter((e) => e.name.toLowerCase().endsWith('.mp3'))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true })); // 2가 10보다 먼저

  let result;
  if (mp3s.length === lines.length) result = { files: mp3s.map((e) => e.data), warnings: [], note: '문장별 파일' };
  else if (mp3s.length === 1) result = await splitOne(page, mp3s[0].data, lines);
  else throw new Error(`${zipName}: mp3가 ${mp3s.length}개예요. 하나로 합친 파일이거나 문장 수(${lines.length}개)만큼이어야 해요.`);

  const lengths = [];
  for (const [i, file] of result.files.entries()) {
    lengths.push(await check(page, lines[i].id, file));
    writeFileSync(join(OUT_DIR, `${lines[i].id}.mp3`), file);
  }
  const sec = (ms) => (ms / 1000).toFixed(1);
  console.log(`[voice] ${group}: ${lines.length}개 (${result.note}), 길이 ${sec(Math.min(...lengths))}~${sec(Math.max(...lengths))}초`);
  result.warnings.forEach(({ line, ratio }) => {
    const how = ratio > 1 ? '길어요' : '짧아요';
    console.warn(`  확인해 주세요: ${lines[line].id}.mp3 — 문장에 비해 ${how} (${ratio.toFixed(1)}배) "${lines[line].text}"`);
  });
  return lines.length;
}

const zips = readdirSync(SRC_DIR).filter((f) => f.toLowerCase().endsWith('.zip'));
if (!zips.length) {
  console.error(`[voice] ${SRC_DIR} 에 녹음 압축 파일(.zip)이 없어요.`);
  process.exit(1);
}
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  let total = 0;
  for (const zipName of zips) total += await handleZip(page, zipName);
  const missing = [...new Set(VOICE_LINES.map((l) => l.group))].filter((g) => !zips.some((z) => groupOf(z) === g));
  const note = missing.length ? ` 녹음 없는 묶음(기기 음성으로 읽음): ${missing.join(', ')}` : '';
  console.log(`[voice] 문장 파일 ${total}개를 만들었어요.${note}`);
} finally {
  await browser.close();
}
await import('./voice-manifest.mjs');
