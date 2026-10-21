// 마을 목록과 열림 규칙. 새 마을은 여기에 한 줄 추가하고, 마을 파일(savanna.js처럼)을 만든다.
import { SAVANNA } from './savanna.js';

export const VILLAGES = Object.freeze([
  { key: 'savanna', name: '사바나 마을', character: 'elephant', round: false, detail: SAVANNA },
  { key: 'forest', name: '숲속 마을', character: 'rabbit', round: false, detail: null },
  { key: 'sea', name: '바다·극지 마을', character: 'penguin', round: false, detail: null },
  { key: 'dino', name: '공룡 나라', character: 'trex', round: true, detail: null },
  { key: 'farm', name: '농장 마을', character: 'cow', round: true, detail: null },
]);

export function findVillage(key) {
  const village = VILLAGES.find((v) => v.key === key);
  if (!village) throw new Error(`[villages] 없는 마을입니다: ${key}`);
  return village;
}

/** 사바나는 늘 열림, 숲속은 사바나를 다 끝내면, 부모님이 열면 모두 열림 */
export function isVillageOpen(key, progress) {
  if (key === 'savanna' || progress.allOpen) return true;
  if (key === 'forest') return Boolean(progress.forestOpen);
  return false;
}
