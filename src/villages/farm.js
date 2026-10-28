// 농장 마을 (복습, 생활 속 수): 농장 친구들을 돌봐요

export const FARM = Object.freeze({
  key: 'farm',
  animals: [
    { key: 'dog', name: '강아지' },
    { key: 'cat', name: '고양이' },
    { key: 'chick', name: '병아리' },
    { key: 'pig', name: '돼지' },
  ],
  story: {
    title: '농장 친구들을 돌봐요!',
    icon: { kind: 'prop', name: 'basket' },
    enterVoice: '농장 마을이야! 돼지가 농장 친구들을 돌봐. 친구들을 도와줘!',
    storyVoice: '농장 친구들을 돌봐요! 달걀도 세고, 숫자도 따라 써 봐!',
  },
  games: [
    {
      key: 'basket',
      name: '달걀 바구니',
      scene: [
        { kind: 'prop', name: 'basket', style: 'left:0;bottom:1cqh;width:22cqh;height:16cqh' },
        { kind: 'prop', name: 'egg', style: 'right:2cqh;bottom:4cqh;width:8cqh;height:10cqh' },
      ],
    },
    {
      key: 'trace',
      name: '숫자 따라 그리기',
      scene: [
        { kind: 'character', name: 'chick', style: 'height:13cqh;left:0;bottom:2cqh' },
        { kind: 'prop', name: 'board', style: 'right:0;bottom:3cqh;width:15cqh;height:15cqh' },
      ],
    },
    {
      key: 'rowfind',
      name: '숫자 찾기',
      scene: [
        { kind: 'character', name: 'pig', style: 'height:20cqh;left:0;bottom:2cqh' },
        { kind: 'prop', name: 'board', style: 'right:0;bottom:3cqh;width:15cqh;height:15cqh' },
      ],
    },
  ],
});
