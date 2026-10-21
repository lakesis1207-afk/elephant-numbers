// 음성 문서 만들기 (npm run voice:list) — 앱 대사(src/audio)가 바뀌면 다시 실행한다.
//  1) docs/음성 목록.md            : 파일 이름 ↔ 문장 목록
//  2) docs/클로바 더빙 대본.md       : 녹음용 대본 표 (묶음·번호·파일 이름·문장·말투, 체크 칸)
//  3) docs/클로바 더빙 붙여넣기/*.txt : 묶음별 한 줄에 한 문장 (클로바 더빙 입력창에 붙여 넣기)
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { VOICE_LINES } from '../src/audio/voiceLines.js';

const docs = (p) => new URL(`../docs/${p}`, import.meta.url);
const groups = [...new Set(VOICE_LINES.map((l) => l.group))];
const linesOf = (g) => VOICE_LINES.filter((l) => l.group === g);
// 녹음하지 않고 기기(휴대폰·태블릿) 기본 음성으로 읽는 묶음
const DEVICE_VOICE_GROUPS = Object.freeze(['시간·잠금']);
const isDeviceVoice = (g) => DEVICE_VOICE_GROUPS.includes(g);
const recordGroups = groups.filter((g) => !isDeviceVoice(g));
const recordCount = recordGroups.reduce((n, g) => n + linesOf(g).length, 0);
const pad2 = (n) => String(n).padStart(2, '0');
const cell = (s) => s.split('|').join('\\|'); // 표 칸 나눔 기호(|)가 문장에 있으면 글자로 보이게

// 말투 메모: 문장 종류별
function toneOf({ group, id }) {
  if (group === '수 세기') return '또박또박, 짧게';
  if (group === '시간·잠금') {
    if (id === 'unlock') return '반갑게';
    if (id === 'warn-1min') return '다정하게 알려 주듯';
    return '졸린 듯 느리게';
  }
  if (id.startsWith('praise')) return '밝고 신나게';
  if (id === 'retry' || id === 'idle') return '다정하게';
  if (id.includes('hint') || id.startsWith('pond-few') || id.startsWith('pond-many') || id === 'pond-empty') {
    return '천천히, 같이 하는 느낌';
  }
  if (id.includes('-q') || id === 'spots-look') return '다정하게 묻는 말투';
  if (id.startsWith('sticker') || id.startsWith('special')) return '신나게 축하하듯';
  if (id.startsWith('name-')) return '또박또박, 반갑게';
  if (id.startsWith('locked') || id === 'not-met') return '아쉽지만 상냥하게';
  return '밝고 상냥하게';
}

// 1) 음성 목록
function voiceList() {
  const parts = [
    '# 음성 목록',
    '',
    '아이 목소리로 녹음해서 `public/audio/voice/<파일 이름>.mp3` 로 넣으면 그 녹음이 나와요.',
    '파일이 없는 문장은 브라우저 기본 음성으로 읽어요. 이 문서는 `npm run voice:list` 로 다시 만들 수 있어요(직접 고치지 마세요).',
    '녹음은 `docs/클로바 더빙 대본.md` 를 보면서 하면 편해요.',
    '',
    `모두 ${VOICE_LINES.length}개`,
  ];
  for (const g of groups) {
    parts.push('', `## ${g} (${linesOf(g).length}개)`, '', '| 파일 이름 | 문장 |', '|---|---|');
    linesOf(g).forEach((l) => parts.push(`| ${l.id}.mp3 | ${cell(l.text)} |`));
  }
  writeFileSync(docs('음성 목록.md'), `${parts.join('\n')}\n`);
}

// 2) 클로바 더빙 대본 표
function dubbingScript() {
  const parts = [
    '# 클로바 더빙 대본',
    '',
    `녹음할 문장 모두 ${recordCount}개, 묶음 ${recordGroups.length}개. (\`npm run voice:list\` 로 만든 문서예요. 직접 고치지 마세요.)`,
    `${DEVICE_VOICE_GROUPS.join(', ')} 묶음은 녹음하지 않고 기기(휴대폰·태블릿) 기본 음성으로 읽어요.`,
    '',
    '## 녹음 방법',
    `1. 클로바 더빙에서 **아이 목소리 하나**를 고르고, ${recordCount}개 모두 **같은 목소리·같은 속도**로 만들어요. (중간에 목소리가 바뀌면 어색해요)`,
    '2. 묶음마다 `docs/클로바 더빙 붙여넣기/` 의 txt 파일을 열어 내용을 통째로 복사해 붙여 넣어요. 한 줄이 한 문장이고, 순서는 아래 표의 번호와 같아요.',
    '3. 묶음마다 mp3로 받아요(압축 파일 zip). 파일 이름은 **묶음 이름**으로 해요. 예: `수 세기.zip` (띄어쓰기 대신 + 도 돼요)',
    '4. zip 파일을 프로젝트 밖 `어린이 앱 개발/녹음 원본/` 폴더에 넣고 `npm run voice:split` 을 실행해요. 문장 부호 뒤의 쉼을 찾아 문장마다 `public/audio/voice/<파일 이름>.mp3` 로 나눠 줘요. (`public` 에 zip을 넣으면 웹에 그대로 공개되니 넣지 마세요)',
    '5. 결과에 "확인해 주세요"가 나오면 그 파일을 들어 보세요. 괜찮으면 올리면(커밋·푸시) 반영돼요. 녹음이 없는 문장은 기본 음성으로 읽어요.',
    '6. 끝낸 줄은 표의 ☐ 를 ☑ 로 바꿔 표시하면 편해요.',
    '',
    '## 주의',
    '- 문장의 글자를 바꾸지 마세요. 앱은 문장 그대로를 보고 녹음 파일을 찾아요. (발음만 어색하면 클로바 더빙의 발음·쉼 조절 기능을 쓰세요)',
    '- 숫자 읽기 확인: "1분"은 "일 분"으로, "하나·둘…"은 고유어로 읽히는지 들어 보세요.',
    '- 공개 웹 앱에서 쓰므로 클로바 더빙 이용 약관(상업적 이용, 출처 표기 등)을 확인하세요.',
    '',
    '## 목차',
    ...groups.map((g, i) => {
      const where = isDeviceVoice(g) ? '녹음 안 함(기기 음성)' : `붙여넣기 파일 \`${pad2(i + 1)}-${g}.txt\``;
      return `${i + 1}. ${g} (${linesOf(g).length}개) — ${where}`;
    }),
  ];
  groups.forEach((g, gi) => {
    const device = isDeviceVoice(g);
    const title = `## ${gi + 1}. ${g} (${linesOf(g).length}개)${device ? ' — 녹음 안 함(기기 음성)' : ''}`;
    parts.push('', title, '', '| 완료 | 번호 | 파일 이름 | 문장 | 말투 |', '|---|---|---|---|---|');
    const mark = device ? '기기 음성' : '☐';
    linesOf(g).forEach((l, i) => parts.push(`| ${mark} | ${gi + 1}-${i + 1} | ${l.id}.mp3 | ${cell(l.text)} | ${toneOf(l)} |`));
  });
  writeFileSync(docs('클로바 더빙 대본.md'), `${parts.join('\n')}\n`);
}

// 3) 묶음별 붙여넣기 텍스트
function pasteFiles() {
  const dir = docs('클로바 더빙 붙여넣기/');
  rmSync(dir, { recursive: true, force: true }); // 묶음 이름이 바뀌어도 예전 파일이 남지 않게
  mkdirSync(dir, { recursive: true });
  groups.forEach((g, gi) => {
    if (isDeviceVoice(g)) return; // 녹음하지 않는 묶음
    writeFileSync(new URL(`${pad2(gi + 1)}-${g}.txt`, dir), `${linesOf(g).map((l) => l.text).join('\n')}\n`);
  });
}

voiceList();
dubbingScript();
pasteFiles();
console.log(`[voice] 음성 목록·클로바 더빙 대본·붙여넣기 ${recordGroups.length}개 파일을 만들었어요 (${VOICE_LINES.length}문장).`);
