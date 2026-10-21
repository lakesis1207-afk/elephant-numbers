// 사바나 마을 게임 3종 (key는 villages/savanna.js의 games[].key와 같다)
import { fruitGame } from './fruit.js';
import { pondGame } from './pond.js';
import { spotsGame } from './spots.js';

export const SAVANNA_GAMES = Object.freeze({ fruit: fruitGame, pond: pondGame, spots: spotsGame });
