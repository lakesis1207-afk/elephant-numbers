// 숲속 마을 게임 3종 (key는 villages/forest.js의 games[].key와 같다)
import { balloonGame } from './balloon.js';
import { acornsGame } from './acorns.js';
import { makeCompareGame } from '../shared/compare.js';
import { TREES_MORE, TREES_FEWER } from '../../audio/villageScript.js';

// 어느 쪽이 많아? (doll-math "어느 쪽이 많아?"): 두 나무의 도토리 비교
const treesGame = makeCompareGame({
  key: 'trees',
  background: 'forest-base',
  levels: [
    [1, 5, 2],
    [2, 8, 1],
    [3, 10, 1],
  ],
  rows: [
    { label: '위쪽 나무', icon: { kind: 'prop', name: 'tree' }, item: { kind: 'prop', name: 'acorn' } },
    { label: '아래쪽 나무', icon: { kind: 'prop', name: 'tree' }, item: { kind: 'prop', name: 'acorn' } },
  ],
  prompts: { more: TREES_MORE, fewer: TREES_FEWER },
});

export const FOREST_GAMES = Object.freeze({ balloon: balloonGame, trees: treesGame, acorns: acornsGame });
