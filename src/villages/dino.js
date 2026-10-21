// 공룡 나라 (4단계, 1~100 숫자판): 공룡 알을 지켜요

export const DINO = Object.freeze({
  key: 'dino',
  animals: [
    { key: 'trex', name: '티라노사우루스' },
    { key: 'brachio', name: '브라키오사우루스' },
    { key: 'stego', name: '스테고사우루스' },
    { key: 'ptera', name: '프테라노돈' },
  ],
  story: {
    title: '공룡 알을 지켜요!',
    icon: { kind: 'prop', name: 'dino-egg' },
    enterVoice: '공룡 나라야! 티라노가 알을 지키고 있어. 친구들을 도와줘!',
    storyVoice: '공룡 알을 지켜요! 숫자판도 찾고, 발자국 숫자도 맞혀 봐!',
  },
  games: [
    {
      key: 'board',
      name: '숫자판 찾기',
      scene: [
        { kind: 'character', name: 'trex', style: 'height:20cqh;left:0;bottom:2cqh' },
        { kind: 'prop', name: 'board', style: 'right:0;bottom:3cqh;width:15cqh;height:15cqh' },
      ],
    },
    {
      key: 'steps',
      name: '발자국 빈칸',
      scene: [
        { kind: 'prop', name: 'footprint', style: 'left:2cqh;bottom:2cqh;width:9cqh;height:11cqh' },
        { kind: 'prop', name: 'footprint', style: 'left:13cqh;bottom:9cqh;width:9cqh;height:11cqh' },
        { kind: 'prop', name: 'footprint', style: 'right:1cqh;bottom:3cqh;width:9cqh;height:11cqh' },
      ],
    },
    {
      key: 'eggs',
      name: '알 더하기·빼기',
      scene: [
        { kind: 'prop', name: 'nest', style: 'left:0;bottom:1cqh;width:24cqh;height:13cqh' },
        { kind: 'prop', name: 'dino-egg', style: 'left:6cqh;bottom:7cqh;width:8cqh;height:10cqh' },
        { kind: 'prop', name: 'dino-egg', style: 'right:2cqh;bottom:4cqh;width:8cqh;height:10cqh' },
      ],
    },
  ],
});
