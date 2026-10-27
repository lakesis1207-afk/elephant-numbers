// 음성 목록 중 숲속·바닷가·공룡·농장 마을 부분. (voiceLines.js가 이어 붙인다)
// 이미 녹음한 묶음(시작·지도, 수 세기, 동물·스티커 …)은 그대로 두고, 새 문장은 새 묶음에 넣는다.
// 그래야 예전 녹음 zip을 다시 나눠도 줄 수가 맞는다.
import * as S from './script.js';
import * as V from './villageScript.js';
import { NATIVE } from '@공통/games/logic.js';
import { nativeCount, sinoWord } from '@공통/games/numbers.js';
import { VILLAGES, previousVillage, nextVillage } from '../villages/index.js';

const range = (a, b, step = 1) => Array.from({ length: Math.floor((b - a) / step) + 1 }, (_, i) => a + i * step);
const line = (group, id, text) => ({ group, id, text });
const MAX_ADD_SUB = 10;
// 더하기: 처음 a개 + b개 (합 10 이하) / 빼기: 처음 a개 - b개 (남는 것 1개 이상)
const ADD_PAIRS = range(1, MAX_ADD_SUB - 1).flatMap((a) => range(1, MAX_ADD_SUB - a).map((b) => [a, b]));
const SUB_PAIRS = range(2, MAX_ADD_SUB).flatMap((a) => range(1, a - 1).map((b) => [a, b]));
const addSubLines = (g, key, add, sub) => [
  ...ADD_PAIRS.map(([a, b]) => line(g, `${key}-add-${a}-${b}`, add(a, b))),
  ...SUB_PAIRS.map(([a, b]) => line(g, `${key}-sub-${a}-${b}`, sub(a, b))),
];

const MAX_FOREST = 20; // 풍선·도토리
const MAX_FISH = 39; // 물고기 묶기
const MAX_BOARD = 100;
const MAX_ROWFIND = 50; // 숫자 찾기

function villageLines() {
  const later = VILLAGES.slice(1);
  return [
    // 숲속 다음 마을부터는 바로 앞 마을을 알려 준다 (숲속은 "사바나 마을을 먼저…"로 시작·지도 묶음에 있음)
    ...later.slice(1).map((v) => line('마을 열림', `locked-after-${v.key}`, S.lockedVillage(v.name, previousVillage(v.key).name))),
    ...later.flatMap((v) => [
      line('마을 열림', `${v.key}-enter`, v.detail.story.enterVoice),
      line('마을 열림', `${v.key}-story`, v.detail.story.storyVoice),
    ]),
  ];
}

function forestLines() {
  const g = '숲속 마을';
  return [
    ...range(1, MAX_FOREST).map((n) => line(g, `balloon-q-${n}`, V.balloonPrompt(n))),
    line(g, 'balloon-hint', V.BALLOON_HINT),
    ...range(1, MAX_FOREST).map((n) => line(g, `balloon-hint-${n}`, V.balloonHintEnd(n))),
    line(g, 'trees-more', V.TREES_MORE),
    line(g, 'trees-fewer', V.TREES_FEWER),
    line(g, 'pair-hint', V.PAIR_HINT),
    line(g, 'pair-hint-more', V.PAIR_HINT_MORE),
    line(g, 'pair-hint-fewer', V.PAIR_HINT_FEWER),
    line(g, 'acorns-q', V.ACORNS_PROMPT),
    line(g, 'acorns-hint', V.ACORNS_HINT),
    ...range(11, MAX_FOREST).map((n) => line(g, `count-hint-${n}`, V.countHintEnd(n))),
  ];
}

function seaLines() {
  const g = '바닷가 마을';
  return [
    line(g, 'pattern-q', V.PATTERN_PROMPT),
    line(g, 'pattern-hint', V.PATTERN_HINT),
    line(g, 'pattern-hint-end', V.PATTERN_HINT_END),
    line(g, 'fish-q', V.FISH_PROMPT),
    line(g, 'fish-hint', V.FISH_HINT),
    ...range(11, MAX_FISH).map((n) => line(g, `fish-hint-${n}`, V.fishHintEnd(n))),
    line(g, 'shells-q', V.SHELLS_PROMPT),
    line(g, 'shells-hint', V.SHELLS_HINT),
    ...range(10, 100, 10).map((n) => line(g, `shells-hint-${n}`, V.shellsHintEnd(n))),
  ];
}

function dinoLines() {
  const g = '공룡 나라';
  return [
    ...range(1, MAX_BOARD).map((n) => line(g, `board-q-${n}`, V.boardPrompt(n))),
    line(g, 'board-hint', V.BOARD_HINT),
    line(g, 'steps-q-end', V.STEPS_PROMPT),
    line(g, 'steps-q-mid', V.STEPS_PROMPT_MID),
    line(g, 'steps-hint-end', V.STEPS_HINT_END),
    ...addSubLines(g, 'eggs', V.eggsAdd, V.eggsSub),
  ];
}

function farmLines() {
  const g = '농장 마을';
  return [
    ...addSubLines(g, 'basket', V.basketAdd, V.basketSub),
    line(g, 'farm-more', V.FARM_MORE),
    line(g, 'farm-fewer', V.FARM_FEWER),
    ...range(1, MAX_ROWFIND).map((n) => line(g, `rowfind-q-${n}`, V.rowFindPrompt(n))),
    line(g, 'rowfind-hint', V.ROWFIND_HINT),
  ];
}

function numberLines() {
  return [
    // 열(10)까지는 "수 세기" 묶음에 있다
    ...range(NATIVE.length, MAX_FISH).map((n) => line('수 세기 2', `count-${n}`, nativeCount(n))),
    ...range(1, MAX_BOARD).map((n) => line('숫자 읽기', `num-${n}`, sinoWord(n))),
  ];
}

function stickerLines() {
  const g = '동물·스티커 2';
  const later = VILLAGES.slice(1);
  const animalCount = VILLAGES.reduce((n, v) => n + v.detail.animals.length + (v.detail.special ? 1 : 0), 0);
  const savannaCount = VILLAGES[0].detail.animals.length + 1; // 사바나 동물 + 특별 친구까지는 "동물·스티커"에 있다
  return [
    ...later.flatMap((v) => v.detail.animals.map((a) => line(g, `name-${a.key}`, a.name))),
    ...later.flatMap((v) => {
      const next = nextVillage(v.key);
      return v.detail.animals.flatMap((a) => [
        line(g, `sticker-${a.key}`, S.stickerLine(a.name, true)),
        line(g, `sticker-again-${a.key}`, S.stickerLine(a.name, false)),
        ...(next ? [
          line(g, `sticker-${a.key}-open-${next.key}`, S.stickerLine(a.name, true, next.name)),
          line(g, `sticker-again-${a.key}-open-${next.key}`, S.stickerLine(a.name, false, next.name)),
        ] : []),
      ]);
    }),
    ...range(savannaCount + 1, animalCount).map((n) => line(g, `book-${n}`, S.bookCount(n))),
  ];
}

export const villageVoiceLines = () => [
  ...villageLines(), ...forestLines(), ...seaLines(), ...dinoLines(), ...farmLines(), ...numberLines(), ...stickerLines(),
];
