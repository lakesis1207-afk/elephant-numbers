// 시작 화면: 코끼리 인사 + ▶
import { h, art, roundButton } from '../widgets/dom.js';
import { GREETING } from '../audio/script.js';

export const startScreen = {
  showBar: false,
  render(root, app) {
    const start = () => {
      app.startSound();
      app.go('map');
      app.say(GREETING);
    };
    root.append(
      art('character', 'elephant', { class: 'hero', alt: '코끼리' }),
      h('h1', {}, '코끼리와 숫자 친구들'),
      roundButton('play', '시작', start),
    );
  },
};
