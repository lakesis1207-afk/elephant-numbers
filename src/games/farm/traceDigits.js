// 따라 그리기용 숫자 0~9의 획 (숫자 하나는 폭 60, 높이 100 안에 그린다). 획 순서대로 쓴다.
const CURVE_STEPS = 10; // 곡선 점 사이를 이만큼 잘게 나눈다

/** 점들을 지나는 부드러운 곡선 (캣멀-롬 곡선: 점을 모두 지나면서 매끄럽게 잇는다) */
function curve(...pts) {
  const at = (i) => pts[Math.max(0, Math.min(pts.length - 1, i))];
  const out = [pts[0]];
  for (let i = 0; i < pts.length - 1; i += 1) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    for (let k = 1; k <= CURVE_STEPS; k += 1) {
      const t = k / CURVE_STEPS;
      const t2 = t * t;
      const t3 = t2 * t;
      const f = (a, b, c, d) => 0.5 * (2 * b + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (3 * b - a - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  return out;
}

/** 곧은 선 */
const line = (...pts) => pts;

/** 조각들을 한 획으로 잇는다 (이음점은 한 번만) */
const join = (...parts) => parts.reduce((all, part) => (all.length ? all.concat(part.slice(1)) : part), []);

/** 0을 그리는 타원 (위에서 시작해 시계 반대 방향) */
const ZERO = Array.from({ length: 49 }, (_, i) => {
  const t = (i / 48) * Math.PI * 2;
  return [30 - 21 * Math.sin(t), 50 - 40 * Math.cos(t)];
});

const DIGITS = Object.freeze([
  [ZERO],
  [line([30, 10], [30, 90])],
  [join(curve([12, 28], [18, 14], [30, 9], [43, 13], [48, 26], [44, 41], [30, 58], [12, 90]), line([12, 90], [52, 90]))],
  [join(curve([12, 18], [26, 9], [42, 12], [48, 26], [40, 41], [27, 47]), curve([27, 47], [43, 53], [50, 70], [44, 86], [28, 92], [12, 85]))],
  [line([38, 10], [8, 64], [54, 64]), line([42, 34], [42, 92])],
  [join(line([16, 10], [13, 44]), curve([13, 44], [28, 38], [44, 44], [50, 62], [45, 82], [30, 91], [12, 86])), line([16, 10], [48, 10])],
  [curve([44, 12], [30, 22], [18, 40], [12, 62], [16, 82], [30, 91], [44, 84], [49, 68], [42, 54], [29, 50], [17, 56], [13, 66])],
  [join(line([10, 12], [50, 12]), curve([50, 12], [39, 38], [31, 64], [28, 92]))],
  [curve([45, 21], [30, 9], [15, 18], [16, 33], [30, 46], [46, 60], [48, 78], [30, 92], [13, 80], [14, 61], [30, 46], [44, 33], [45, 21])],
  [join(curve([47, 30], [40, 15], [28, 10], [15, 17], [12, 32], [20, 45], [32, 47], [44, 38], [47, 30]), curve([47, 30], [47, 60], [46, 90]))],
]);

/** 숫자 하나(0~9)의 획들. 획마다 [x, y] 점 목록 */
export function strokesOf(digit) {
  const strokes = DIGITS[digit];
  if (!strokes) throw new Error(`[trace] 0~9 숫자만 그릴 수 있습니다: ${digit}`);
  return strokes;
}
