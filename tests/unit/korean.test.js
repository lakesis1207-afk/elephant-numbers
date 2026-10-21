import { describe, test, expect } from 'vitest';
import { withTopic, withSubject } from '../../src/app/korean.js';

describe('은/는 붙이기', () => {
  test('받침이 있으면 "은"', () => {
    expect(withTopic('숲속 마을')).toBe('숲속 마을은');
    expect(withTopic('바다·극지 마을')).toBe('바다·극지 마을은');
  });

  test('받침이 없으면 "는"', () => {
    expect(withTopic('공룡 나라')).toBe('공룡 나라는');
  });
});

describe('이/가 붙이기', () => {
  test('받침이 있으면 "이", 없으면 "가"', () => {
    expect(withSubject('숲속 마을')).toBe('숲속 마을이');
    expect(withSubject('공룡 나라')).toBe('공룡 나라가');
  });
});
