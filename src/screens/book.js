// 스티커북: 사바나 동물 9칸 + 특별 친구 1칸. 모은 친구는 색깔, 아직 없는 친구는 흐린 그림자.
// X를 누르면 스티커북을 열기 전 화면으로 돌아간다.
import { h, art, roundButton } from '../widgets/dom.js';
import { SAVANNA } from '../villages/savanna.js';
import { bookCount, NOT_MET } from '../audio/script.js';
import { stopVoice } from '../audio/voice.js';

const SPECIAL = { key: 'unicorn', name: '유니콘', missingLabel: '특별 친구, 아직 없음' };

function slot(animal, has, app, extraClass = '') {
  const tap = () => {
    if (has) {
      app.sfx.pop();
      app.say(animal.name);
    } else {
      app.sfx.boing();
      app.say(NOT_MET);
    }
  };
  return h(
    'button',
    {
      class: `slot ${has ? 'has' : 'miss'} ${extraClass}`.trim(),
      'data-animal': animal.key,
      'aria-label': has ? animal.name : animal.missingLabel ?? '아직 없음',
      onclick: tap,
    },
    art('character', animal.key),
  );
}

export const bookScreen = {
  showBook: false,

  render(root, app, { back = { name: 'map', params: {} } } = {}) {
    const p = app.progress;
    const slots = [
      ...SAVANNA.animals.map((a) => slot(a, p.stickers.includes(a.key), app)),
      slot(SPECIAL, p.special, app, 'sp'),
    ];
    const close = () => {
      app.sfx.pop();
      app.go(back.name, back.params);
    };
    root.append(h('div', { class: 'slots' }, slots), roundButton('close', '스티커북 닫기', close, 'bookclose'));
    app.say(bookCount(p.stickers.length + (p.special ? 1 : 0)));
  },

  leave: stopVoice,
};
