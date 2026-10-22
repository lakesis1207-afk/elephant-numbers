// 공룡 나라 게임 3종 (key는 villages/dino.js의 games[].key와 같다)
import { boardGame } from './board.js';
import { stepsGame } from './steps.js';
import { makeAddSubGame } from '../shared/addsub.js';
import { eggsAdd, eggsSub } from '../../audio/villageScript.js';

// 알 더하기·빼기 (doll-math "바구니 더하기·빼기"): 둥지에 알이 더 오거나, 아기 공룡이 가져간다
const eggsGame = makeAddSubGame({
  key: 'eggs',
  background: 'dino-base',
  levels: [
    [2, 5],
    [2, 8],
    [3, 10],
  ],
  item: { kind: 'prop', name: 'dino-egg' },
  container: { kind: 'prop', name: 'nest' },
  prompts: { add: eggsAdd, sub: eggsSub },
});

export const DINO_GAMES = Object.freeze({ board: boardGame, steps: stepsGame, eggs: eggsGame });
