// 마을 지도: 마을 5개. 열린 마을은 들어가고, 잠긴 마을은 "뽀잉" + 안내
import { h, art } from '../widgets/dom.js';
import { VILLAGES, isVillageOpen } from '../villages/index.js';
import { lockedVillage, soonVillage } from '../audio/script.js';

function villageCard(village, app) {
  const open = isVillageOpen(village.key, app.progress);

  const enter = () => {
    if (!open) {
      app.sfx.boing();
      app.say(lockedVillage(village.name));
      return;
    }
    app.sfx.pop();
    if (village.detail) {
      app.go('village', { village: village.key });
      app.say(village.detail.story.enterVoice);
    } else {
      app.go('soon', { village: village.key });
      app.say(soonVillage(village.name));
    }
  };

  return h(
    'button',
    {
      class: `vcard press${open ? '' : ' locked'}`,
      'data-village': village.key,
      'aria-label': open ? village.name : `${village.name}, 잠김`,
      onclick: enter,
    },
    art('character', village.character, { class: village.round ? 'round' : '' }),
    open ? null : h('span', { class: 'lk' }, art('icon', 'lock', { class: 'ico' })),
    h('span', {}, village.name),
  );
}

export const mapScreen = {
  render(root, app) {
    root.append(h('div', { class: 'path' }, VILLAGES.map((v) => villageCard(v, app))));
  },
};
