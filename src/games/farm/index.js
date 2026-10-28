// 농장 마을 게임 3종 (복습. key는 villages/farm.js의 games[].key와 같다)
import { rowFindGame } from './rowfind.js';
import { traceGame } from './trace.js';
import { makeAddSubGame } from '@공통/games/shared/addsub.js';
import { basketAdd, basketSub } from '../../audio/villageScript.js';
import { FRUIT_HINT_START, fruitHintEnd } from '../../audio/script.js';

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
  prompts: { add: basketAdd, sub: basketSub },
  hints: { start: FRUIT_HINT_START, end: fruitHintEnd },
});

export const FARM_GAMES = Object.freeze({ basket: basketGame, trace: traceGame, rowfind: rowFindGame });
