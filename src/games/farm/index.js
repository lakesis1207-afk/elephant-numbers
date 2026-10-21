// 농장 마을 게임 3종 (복습. key는 villages/farm.js의 games[].key와 같다)
import { feedGame } from './feed.js';
import { makeAddSubGame } from '../shared/addsub.js';
import { makeCompareGame } from '../shared/compare.js';
import { BASKET_ADD, BASKET_SUB, FARM_MORE, FARM_FEWER } from '../../audio/villageScript.js';

// 달걀 바구니 (doll-math "바구니 더하기·빼기")
const basketGame = makeAddSubGame({
  key: 'basket',
  background: 'farm-base',
  levels: [
    [2, 5],
    [2, 8],
    [3, 10],
  ],
  item: { kind: 'prop', name: 'egg' },
  container: { kind: 'prop', name: 'basket' },
  prompts: { add: BASKET_ADD, sub: BASKET_SUB },
});

// 누가 더 많아? (doll-math "어느 쪽이 많아?" 복습): 병아리 줄과 돼지 줄 비교
const farmCompareGame = makeCompareGame({
  key: 'farmcompare',
  background: 'farm-base',
  levels: [
    [1, 6, 2],
    [2, 8, 1],
    [3, 10, 1],
  ],
  rows: [
    { label: '병아리', item: { kind: 'character', name: 'chick' } },
    { label: '돼지', item: { kind: 'character', name: 'pig' } },
  ],
  prompts: { more: FARM_MORE, fewer: FARM_FEWER },
});

export const FARM_GAMES = Object.freeze({ basket: basketGame, farmcompare: farmCompareGame, feed: feedGame });
