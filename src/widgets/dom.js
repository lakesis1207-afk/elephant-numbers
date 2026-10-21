// 화면 요소 만들기 도우미. innerHTML 대신 써서 글자가 코드로 해석되지 않게 한다.
import { artUrl } from '../art/registry.js';

/** h('button', { class: 'x', onclick: fn, 'aria-label': '시작' }, 자식...) */
export function h(tag, props = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value == null || value === false) continue;
    if (key === 'class') el.className = value;
    else if (key === 'style') el.style.cssText = value;
    else if (key.startsWith('on')) el.addEventListener(key.slice(2), value);
    else el.setAttribute(key, value === true ? '' : String(value));
  }
  el.append(...children.flat().filter((c) => c != null && c !== false));
  return el;
}

/** 그림 한 장. alt를 주지 않으면 꾸밈 그림(읽지 않음)으로 둔다. */
export const art = (kind, name, props = {}) =>
  h('img', { src: artUrl(kind, name), alt: '', draggable: 'false', ...props });

/** 동그란 그림 버튼 (시작, 지도 등) */
export const roundButton = (iconName, label, onclick, extraClass = '') =>
  h('button', { class: `rbtn press ${extraClass}`.trim(), 'aria-label': label, onclick }, art('icon', iconName, { class: 'ico' }));
