// 바닷가 마을 게임 3종 (key는 villages/sea.js의 games[].key와 같다)
import { patternGame } from './pattern.js';
import { fishnetGame } from './fishnet.js';
import { shellsGame } from './shells.js';

export const SEA_GAMES = Object.freeze({ pattern: patternGame, fishnet: fishnetGame, shells: shellsGame });
