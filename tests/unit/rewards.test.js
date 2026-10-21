import { describe, test, expect } from 'vitest';
import { finishGame } from '../../src/app/rewards.js';
import { SAVANNA } from '../../src/villages/savanna.js';
import { DEFAULT_PROGRESS, freezeProgress } from '../../src/storage/progress.js';

const ALL = SAVANNA.animals.map((a) => a.key);
const progressWith = (change) => freezeProgress({ ...DEFAULT_PROGRESS, ...change });
const first = () => 0; // 가짜 Math.random: 늘 목록의 첫 번째

describe('게임을 끝냈을 때 보상', () => {
  test('끝낸 게임에 별 표시를 하고, 아직 없는 동물 스티커를 준다', () => {
    const r = finishGame(progressWith({ stickers: ['elephant'] }), SAVANNA, 'fruit', first);
    expect(r.progress.done.fruit).toBe(true);
    expect(r.sticker).toEqual({ key: 'giraffe', name: '기린' });
    expect(r.isNew).toBe(true);
    expect(r.progress.stickers).toEqual(['elephant', 'giraffe']);
  });

  test('다 모은 뒤에는 이미 있는 동물을 "또" 주고 모은 수는 그대로다', () => {
    const r = finishGame(progressWith({ stickers: ALL, special: true }), SAVANNA, 'pond', first);
    expect(r.isNew).toBe(false);
    expect(ALL).toContain(r.sticker.key);
    expect(r.progress.stickers).toHaveLength(ALL.length);
  });

  test('게임 3개를 다 끝내면 숲속 마을이 열린다 (한 번만 알린다)', () => {
    const before = progressWith({ done: { fruit: true, pond: true } });
    const r = finishGame(before, SAVANNA, 'spots', first);
    expect(r.opened).toBe('forest');
    expect(r.progress.forestOpen).toBe(true);

    const again = finishGame(r.progress, SAVANNA, 'fruit', first);
    expect(again.opened).toBeNull();
    expect(again.progress.forestOpen).toBe(true);
  });

  test('게임이 남아 있으면 마을은 열리지 않는다', () => {
    const r = finishGame(progressWith({ done: { fruit: true } }), SAVANNA, 'fruit', first);
    expect(r.opened).toBeNull();
    expect(r.progress.forestOpen).toBe(false);
  });

  test('마지막 동물을 모으면 특별 친구가 오고, 아이가 본 뒤에는 다시 나오지 않는다', () => {
    const r = finishGame(progressWith({ stickers: ALL.slice(0, 8) }), SAVANNA, 'fruit', first);
    expect(r.sticker.key).toBe(ALL[8]);
    expect(r.special).toBe(true);
    expect(r.progress.special).toBe(true); // 스티커북 칸은 바로 채운다

    const seen = freezeProgress({ ...r.progress, specialSeen: true });
    expect(finishGame(seen, SAVANNA, 'pond', first).special).toBe(false);
  });

  test('유니콘이 나오기 전에 앱을 닫았으면 다음 게임 뒤에 다시 보여 준다', () => {
    const r = finishGame(progressWith({ stickers: ALL.slice(0, 8) }), SAVANNA, 'fruit', first);
    const again = finishGame(r.progress, SAVANNA, 'pond', first);
    expect(again.special).toBe(true);
  });

  test('원래 기록은 바뀌지 않고, 새 기록은 얼려 있다', () => {
    const before = progressWith({});
    const r = finishGame(before, SAVANNA, 'fruit', first);
    expect(before.stickers).toEqual([]);
    expect(before.done).toEqual({});
    expect(Object.isFrozen(r.progress)).toBe(true);
    expect(Object.isFrozen(r.progress.stickers)).toBe(true);
  });

  test('없는 게임 이름이면 오류를 낸다', () => {
    expect(() => finishGame(progressWith({}), SAVANNA, 'oops', first)).toThrow();
  });
});
