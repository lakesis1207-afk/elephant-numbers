// 묶음 녹음(대본 여러 줄을 한 번에 만든 mp3)을 줄마다 나눌 위치를 찾는다.
// 클로바 더빙은 문장 부호(. ! ?) 뒤마다 약 0.6초 쉰다. 그래서
//  1) 소리 크기로 "말하는 구간"을 찾고 (길게 조용한 곳에서 나눔)
//  2) 줄마다 문장 수만큼 구간을 차례로 나눠 준다. 수가 안 맞으면(쉼표에서도 길게 쉼 등) 말 길이가 가장 맞게 고른다.
const SILENCE_DB = -40; // 가장 큰 소리보다 이만큼 작으면 조용한 것
const MIN_GAP_MS = 450; // 이만큼 이상 조용하면 구간을 나눈다
const COUNT_PENALTY = 2; // 문장 수와 구간 수가 다를 때의 벌점 (말 길이 차이보다 크게)
const STRAY_MAX_MS = 150; // 맨 앞뒤의 이보다 짧은 구간은 잡음(숨소리·딸깍)일 수 있다
const SKIP_COST = 1; // 잡음으로 보고 버릴 때의 벌점 (문장 수가 안 맞는 것보다 작게)
const WARN_RATIO = 2; // 말 길이가 예상의 2배 넘게 길거나 절반보다 짧으면 확인할 줄

/** 문장 부호(. ! ?) 뒤에서 나눈 조각들 */
export const piecesOf = (text) => text.trim().split(/(?<=[.!?])\s+/).filter(Boolean);

/** 소리 내는 글자 수 (띄어쓰기·문장 부호 제외) */
export const speakingLength = (text) => (text.match(/[\p{L}\p{N}]/gu) ?? []).length;

/**
 * @param rms 일정 간격(stepMs)마다의 소리 크기
 * @returns {[startMs, endMs][]} 말하는 구간들
 */
export function findSegments(rms, stepMs, { silenceDb = SILENCE_DB, minGapMs = MIN_GAP_MS } = {}) {
  const max = rms.reduce((m, v) => (v > m ? v : m), 0); // 긴 녹음도 되게 (Math.max(...)는 너무 길면 멈춤)
  if (max === 0) return [];
  const threshold = max * 10 ** (silenceDb / 20);
  const minGap = Math.ceil(minGapMs / stepMs);
  const segments = [];
  let start = -1;
  let lastLoud = -1;
  rms.forEach((level, i) => {
    if (level < threshold) return;
    if (start >= 0 && i - lastLoud - 1 >= minGap) {
      segments.push([start * stepMs, (lastLoud + 1) * stepMs]);
      start = -1;
    }
    if (start < 0) start = i;
    lastLoud = i;
  });
  if (start >= 0) segments.push([start * stepMs, (lastLoud + 1) * stepMs]);
  return segments;
}

const speechOf = (segs, from, to) => segs.slice(from, to).reduce((sum, [a, b]) => sum + (b - a), 0);

/**
 * 구간들을 대본 줄에 나눠 준다. 줄마다 구간이 1개 이상.
 * @param lines 대본 줄(문장) 목록
 * @param segments findSegments 결과
 * 맨 앞뒤의 짧은 구간은 잡음으로 보고 버릴 수 있다(skipped).
 * @returns {{ ranges: [startMs, endMs][], warnings: { line, ratio }[], skipped: [startMs, endMs][] }}
 */
export function alignLines(lines, segments) {
  if (segments.length < lines.length) {
    throw new Error(`녹음에서 찾은 구간(${segments.length}개)이 대본 줄(${lines.length}개)보다 적어요. 대본과 녹음이 맞는지 확인해 주세요.`);
  }
  const lens = lines.map((l) => Math.max(1, speakingLength(l)));
  const pieces = lines.map((l) => piecesOf(l).length);
  const msPerChar = speechOf(segments, 0, segments.length) / lens.reduce((a, b) => a + b, 0);
  const ratioOf = (i, from, to) => speechOf(segments, from, to) / (msPerChar * lens[i]);
  const lineCost = (i, from, to) => Math.log(ratioOf(i, from, to)) ** 2 + COUNT_PENALTY * Math.abs(to - from - pieces[i]);

  const cuts = bestCuts(lines.length, segments, lineCost);
  const first = cuts[0];
  const last = cuts[cuts.length - 1];
  const ranges = lines.map((_, i) => [segments[cuts[i]][0], segments[cuts[i + 1] - 1][1]]);
  const warnings = lines
    .map((_, i) => ({ line: i, ratio: ratioOf(i, cuts[i], cuts[i + 1]) }))
    .filter(({ ratio }) => ratio > WARN_RATIO || ratio < 1 / WARN_RATIO);
  return { ranges, warnings, skipped: [...segments.slice(0, first), ...segments.slice(last)] };
}

/** segments[from..to)가 모두 짧은 잡음 후보인지 */
const allStray = (segments, from, to) => segments.slice(from, to).every(([a, b]) => b - a < STRAY_MAX_MS);

/**
 * 벌점이 가장 작은 나눔. 돌려주는 cuts[i]~cuts[i+1]이 i번째 줄의 구간.
 * cuts[0] 앞과 마지막 cut 뒤는 버린 잡음.
 */
function bestCuts(L, segments, lineCost) {
  const S = segments.length;
  // best[i][j]: 앞의 i줄이 j번째 구간에서 끝날 때 가장 작은 벌점
  const best = Array.from({ length: L + 1 }, () => Array(S + 1).fill(Infinity));
  const from = Array.from({ length: L + 1 }, () => Array(S + 1).fill(-1));
  for (let j = 0; j <= S; j += 1) if (allStray(segments, 0, j)) best[0][j] = j * SKIP_COST;
  for (let i = 1; i <= L; i += 1) {
    for (let j = i; j <= S; j += 1) {
      for (let k = i - 1; k < j; k += 1) {
        if (best[i - 1][k] === Infinity) continue;
        const cost = best[i - 1][k] + lineCost(i - 1, k, j);
        if (cost < best[i][j]) {
          best[i][j] = cost;
          from[i][j] = k;
        }
      }
    }
  }
  const total = (j) => best[L][j] + (S - j) * SKIP_COST; // 뒤에 남은 구간은 잡음으로 버림
  let end = S;
  for (let j = L; j < S; j += 1) if (allStray(segments, j, S) && total(j) < total(end)) end = j;
  if (best[L][end] === Infinity) throw new Error('녹음 구간을 대본 줄에 나눌 수 없어요.');
  const cuts = [end];
  for (let i = L; i > 0; i -= 1) cuts.unshift(from[i][cuts[0]]);
  return cuts;
}
