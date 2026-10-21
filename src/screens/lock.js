// 잠금 화면: 놀이 시간이 다 되면. 잠든 코끼리 + 화면 밖 미션. 부모님이 3초 누르면 다시 논다.
import { h, art } from '../widgets/dom.js';
import { holdable, PARENT_HOLD_MS } from '../widgets/hold.js';
import { pickMission, unlockChange } from '../app/playtime.js';
import { stopVoice } from '../audio/voice.js';
import { LOCK_TEXT, lockLine, UNLOCK_TEXT } from '../audio/script.js';
const STAR_COUNT = 22;

function stars() {
  return h(
    'div',
    { class: 'stars', 'aria-hidden': 'true' },
    Array.from({ length: STAR_COUNT }, () =>
      h('i', { style: `left:${2 + Math.random() * 96}%;top:${3 + Math.random() * 57}%` }),
    ),
  );
}

export const lockScreen = {
  showBar: false,

  render(root, app, { resume = { name: 'map', params: {} } } = {}) {
    const mission = pickMission();
    const hold = h('button', { class: 'hold', 'aria-label': '부모님: 3초 동안 누르면 다시 놀 수 있어요' }, '🔒 부모님: 3초 동안 누르기');
    holdable(hold, PARENT_HOLD_MS, () => {
      app.update((p) => unlockChange(p));
      app.sfx.yes();
      app.go(resume.name, resume.params);
      app.say(UNLOCK_TEXT);
    });

    root.append(
      stars(),
      h('div', { class: 'zzz', 'aria-hidden': 'true' }, 'Z z z'),
      art('character', 'elephant', { class: 'sleepy', alt: '잠든 코끼리' }),
      h('p', {}, LOCK_TEXT),
      h('p', { class: 'mission' }, mission),
      hold,
    );
    app.say(lockLine(mission));
  },

  leave: stopVoice,
};
