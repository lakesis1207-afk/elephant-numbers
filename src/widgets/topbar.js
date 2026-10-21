// 위쪽 막대: 왼쪽 자물쇠(부모 메뉴)·돌아가기, 가운데 문제 점, 오른쪽 스티커북 버튼
import { h, art } from './dom.js';
import { holdable, consumeHeld, PARENT_HOLD_MS } from './hold.js';

export function createTopbar(el, app) {
  // 부모 메뉴: 3초 동안 누르고 있어야 열린다. 아이가 톡 누르면 안내만.
  const lock = h(
    'button',
    {
      class: 'pbtn',
      'aria-label': '부모님 메뉴, 3초 동안 누르고 있기',
      onclick: () => {
        if (!consumeHeld(lock)) app.toast('부모님은 3초 동안 누르고 있어 주세요');
      },
    },
    art('icon', 'lock', { class: 'ico' }),
  );
  holdable(lock, PARENT_HOLD_MS, () => app.openParentMenu());

  // 게임 중에만 보이는 돌아가기 버튼
  let onBack = null;
  const back = h(
    'button',
    { class: 'backbtn press', hidden: true, onclick: () => { app.sfx.pop(); onBack?.(); } },
    art('icon', 'home', { class: 'ico' }),
  );

  // 문제 진행 점 (게임 중에만)
  const dots = h('div', { class: 'qdots', 'aria-hidden': 'true' });

  // 스티커북: 누르면 스티커북 화면 (닫으면 지금 화면으로 돌아옴)
  const count = h('b', {}, '0');
  const book = h(
    'button',
    { class: 'bookbtn press', 'aria-label': '스티커북', onclick: () => { app.sfx.pop(); app.openBook(); } },
    art('icon', 'star', { class: 'ico' }),
    count,
  );

  el.replaceChildren(lock, back, h('div', { class: 'spacer' }), dots, book);

  return {
    update({ visible, showBook = true }) {
      el.hidden = !visible;
      book.hidden = !showBook;
      const p = app.progress;
      count.textContent = String(p.stickers.length + (p.special ? 1 : 0));
      this.setDots(0, 0);
      this.setBack(null);
    },
    /** done개 채운 점 total개. total이 0이면 점을 숨긴다. */
    setDots(done, total) {
      dots.replaceChildren(...Array.from({ length: total }, (_, i) => h('i', { class: i < done ? 'on' : '' })));
      dots.setAttribute('data-done', String(done));
    },
    setBack(handler, label = '') {
      onBack = handler;
      back.hidden = !handler;
      back.setAttribute('aria-label', label);
    },
  };
}
