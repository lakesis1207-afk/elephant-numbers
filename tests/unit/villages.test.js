import { describe, test, expect } from 'vitest';
import { VILLAGES, findVillage, isVillageOpen } from '../../src/villages/index.js';
import { SAVANNA } from '../../src/villages/savanna.js';
import { DEFAULT_PROGRESS } from '../../src/storage/progress.js';

const fresh = { ...DEFAULT_PROGRESS, day: '2026-10-21' };

describe('마을 목록', () => {
  test('지도에는 마을 5개가 순서대로 있다', () => {
    expect(VILLAGES.map((v) => v.key)).toEqual(['savanna', 'forest', 'sea', 'dino', 'farm']);
  });

  test('사바나 마을에는 동물 9마리와 게임 3개가 있다', () => {
    expect(SAVANNA.animals).toHaveLength(9);
    expect(SAVANNA.animals[0].key).toBe('elephant');
    expect(SAVANNA.games.map((g) => g.key)).toEqual(['fruit', 'pond', 'spots']);
  });

  test('없는 마을을 찾으면 오류를 낸다', () => {
    expect(() => findVillage('moon')).toThrow();
  });
});

describe('마을 열림 규칙', () => {
  test('처음에는 사바나만 열려 있다', () => {
    const open = VILLAGES.filter((v) => isVillageOpen(v.key, fresh)).map((v) => v.key);
    expect(open).toEqual(['savanna']);
  });

  test('사바나를 다 끝내면(forestOpen) 숲속 마을이 열린다', () => {
    expect(isVillageOpen('forest', { ...fresh, forestOpen: true })).toBe(true);
    expect(isVillageOpen('sea', { ...fresh, forestOpen: true })).toBe(false);
  });

  test('부모님이 모든 마을을 열면 다 열린다', () => {
    const all = { ...fresh, allOpen: true };
    expect(VILLAGES.every((v) => isVillageOpen(v.key, all))).toBe(true);
  });
});
