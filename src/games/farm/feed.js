// 반짝 몇 개? (농장, 1~10 바로 알기 복습): 접시 위 옥수수(10칸, 다섯씩 두 줄)를 2초 보여 주고 보자기로 덮는다.
// 보자기를 누르면 1.5초 다시 보여 준다. 다섯 묶음 모양이라 세지 않고 알아보게 한다.
import { h, art } from '../../widgets/dom.js';
import { NATIVE, pickNumber, tenFrame, wait } from '../logic.js';
import { numberOptions, pickHandler } from '../widgets.js';
import { HINT_START_MS, HINT_STEP_MS } from '../shared/counting.js';
import { SPOTS_LOOK } from '../../audio/script.js';
import { FEED_PROMPT, FEED_HINT, feedHintEnd } from '../../audio/villageScript.js';

const MAX = 10;
const FIRST_LOOK_MS = 2000;
const PEEK_MS = 1500;
const RECHECK_MS = 200;

export const feedGame = {
  key: 'feed',
  background: 'farm-base',
  levels: [
    [1, 5],
    [3, 8],
    [5, 10],
  ],

  ask(play, { run, say, bubble, sfx }, { range, last }) {
    const n = pickNumber(range[0], range[1], last);
    let coverTimer = null;

    const corns = [];
    const cells = tenFrame(n).map((on) => {
      if (!on) return h('span', { class: 'fcell' });
      const corn = art('prop', 'corn', { class: 'corn' });
      corns.push(corn);
      return h('span', { class: 'fcell' }, corn);
    });
    const cover = h('button', { class: 'cloth', 'aria-label': '다시 보기', hidden: true });
    const plate = h('div', { class: 'plate', 'data-count': n }, cells, cover);

    const coverLater = (ms, after) => {
      clearTimeout(coverTimer);
      coverTimer = setTimeout(() => {
        if (run.state.stopped) return;
        // 틀린 답 직후 잠깐 잠긴 때라면 조금 뒤에 다시 덮는다 (힌트·정답 때는 reveal이 타이머를 지운다)
        if (run.state.busy) return coverLater(RECHECK_MS, after);
        cover.hidden = false;
        after?.();
      }, ms);
    };
    const showFor = (ms, after) => {
      cover.hidden = true;
      coverLater(ms, after);
    };
    const reveal = () => {
      clearTimeout(coverTimer);
      cover.hidden = true;
    };
    cover.addEventListener('click', () => {
      run.poke();
      if (run.state.busy) return;
      sfx.ding();
      showFor(PEEK_MS);
    });

    play.replaceChildren(h('div', { class: 'feedq' }, plate, numberOptions(n, 1, MAX, pickHandler(run, n, reveal))));
    run.setPrompt(SPOTS_LOOK);
    showFor(FIRST_LOOK_MS, () => run.setPrompt(FEED_PROMPT));

    async function hint() {
      reveal();
      bubble(FEED_HINT, true);
      await wait(HINT_START_MS);
      for (let i = 0; i < corns.length; i += 1) {
        if (run.state.stopped) return;
        corns[i].classList.add('hl');
        say(NATIVE[i + 1]);
        await wait(HINT_STEP_MS);
      }
      if (run.state.stopped) return;
      corns.forEach((c) => c.classList.remove('hl'));
      bubble(feedHintEnd(n), true);
    }

    return { n, hint };
  },
};
