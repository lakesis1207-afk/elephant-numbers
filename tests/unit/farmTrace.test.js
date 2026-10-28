import { describe, test, expect } from 'vitest';
import { strokesOf } from '../../src/games/farm/traceDigits.js';
import { DIGITS_BY_LEVEL, pickDigit, traceGame } from '../../src/games/farm/trace.js';
import { traceLinePrompt } from '../../src/audio/villageScript.js';
import { buildPath } from '../../src/games/lineTrace.js';

describe('숫자 따라 그리기 (농장)', () => {
  test('0~9 모든 숫자에 획이 있고, 획마다 길이 만들어진다', () => {
    for (let d = 0; d <= 9; d += 1) {
      const strokes = strokesOf(d);
      expect(strokes.length).toBeGreaterThan(0);
      strokes.forEach((s) => expect(buildPath(s).length).toBeGreaterThan(20));
    }
  });

  test('0~9가 아닌 수는 오류를 낸다', () => {
    expect(() => strokesOf(10)).toThrow();
    expect(() => strokesOf(-1)).toThrow();
  });

  test('난이도별 숫자는 계획대로다', () => {
    expect(DIGITS_BY_LEVEL.map((d) => [...d])).toEqual([[1, 0, 7], [4, 6, 9], [2, 3, 5, 8]]);
    expect(traceGame.levels).toHaveLength(3);
  });

  test('같은 난이도에서 바로 앞 숫자는 되도록 피한다', () => {
    for (let level = 0; level < 3; level += 1) {
      DIGITS_BY_LEVEL[level].forEach((last) => {
        for (let i = 0; i < 30; i += 1) expect(pickDigit(level, last)).not.toBe(last);
      });
    }
  });

  test('묻는 말은 숫자를 소리 나는 대로 읽는다', () => {
    expect(traceLinePrompt(1)).toBe('숫자 일을 따라 써 봐! 초록 점부터 시작해.');
    expect(traceLinePrompt(0)).toContain('숫자');
  });
});
