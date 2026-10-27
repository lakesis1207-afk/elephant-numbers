// 마을 화면: 이야기 버튼 + 게임 카드 3개. 카드를 누르면 게임이 시작되고, 끝낸 게임에는 별이 붙는다.
import { h, art } from '../widgets/dom.js';
import { findVillage } from '../villages/index.js';

function gameCard(game, village, app) {
  const play = () => {
    app.sfx.pop();
    app.go('game', { village, game: game.key });
  };
  // 카드 그림 칸: 마을 배경을 깔고 그 위에 동물·소품을 올린다
  const backdrop = art('background', `${village}-base`, { class: 'scenebg', alt: '' });
  const scene = [backdrop, ...game.scene.map((item) => art(item.kind, item.name, { style: item.style }))];
  return h(
    'button',
    { class: 'gcard press', 'data-game': game.key, 'aria-label': game.name, onclick: play },
    app.progress.done[game.key] ? h('span', { class: 'star' }, art('icon', 'star', { class: 'ico' })) : null,
    h('div', { class: 'scene' }, scene),
    h('span', {}, game.name),
  );
}

export const villageScreen = {
  background: ({ village = 'savanna' } = {}) => `${village}-base`,

  render(root, app, { village = 'savanna' } = {}) {
    const { detail } = findVillage(village);
    if (!detail) throw new Error(`[village] 아직 준비되지 않은 마을입니다: ${village}`);

    const story = h(
      'button',
      { class: 'story press', 'aria-label': '이야기 다시 듣기', onclick: () => app.say(detail.story.storyVoice) },
      h('span', { class: 'cake' }, art(detail.story.icon.kind, detail.story.icon.name, { class: 'ico' })),
      h('span', {}, detail.story.title),
    );
    root.append(story, h('div', { class: 'games' }, detail.games.map((g) => gameCard(g, village, app))));
    // 마을이 여럿이라 지도로 돌아가는 버튼 (위쪽 막대의 돌아가기 자리)
    app.bar?.setBack(() => {
      app.sfx.pop();
      app.go('map');
    }, '지도로 가기');
  },
};
