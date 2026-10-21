// 그림 목록: 이름 → 파일 위치. 그림을 바꿀 때는 public/images 안의 파일만 같은 이름으로 바꾸면 된다.

const BASE = `${import.meta.env.BASE_URL}images/`;

const CHARACTERS = [
  'elephant', 'giraffe', 'hippo', 'rhino', 'lion', 'tiger', 'zebra', 'lemur', 'capybara',
  'unicorn', 'rabbit', 'penguin', 'trex', 'cow',
];
const ICONS = [
  'play', 'check', 'home', 'close', 'map', 'star', 'lock', 'speaker', 'cake',
  'game-fruit', 'game-pond', 'game-spots',
];
const BACKGROUNDS = ['savanna-base', 'savanna-fruit', 'savanna-pond', 'savanna-spots'];
const PROPS = [
  'fruit-apple', 'fruit-strawberry', 'fruit-orange', 'fruit-banana', 'fruit-grape', 'fruit-peach',
  'giraffe-spot', 'bush', 'pond',
];

const KINDS = {
  character: { dir: 'characters', ext: 'webp', names: CHARACTERS },
  icon: { dir: 'icons', ext: 'svg', names: ICONS },
  background: { dir: 'backgrounds', ext: 'svg', names: BACKGROUNDS },
  prop: { dir: 'props', ext: 'svg', names: PROPS },
};

/** 그림 파일 주소. 목록에 없는 이름이면 바로 오류를 내서 오타를 빨리 찾는다. */
export function artUrl(kind, name) {
  const group = KINDS[kind];
  if (!group) throw new Error(`[art] 없는 그림 종류입니다: ${kind}`);
  if (!group.names.includes(name)) throw new Error(`[art] 없는 그림입니다: ${kind}/${name}`);
  return `${BASE}${group.dir}/${name}.${group.ext}`;
}

/** 모든 그림 주소 (오프라인 저장용, 7단계 PWA에서 사용) */
export const allArtUrls = () =>
  Object.keys(KINDS).flatMap((kind) => KINDS[kind].names.map((name) => artUrl(kind, name)));
