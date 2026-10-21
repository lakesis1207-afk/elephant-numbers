// 숲속 마을 (2단계, 11~20): 다람쥐의 겨울 준비

export const FOREST = Object.freeze({
  key: 'forest',
  animals: [
    { key: 'rabbit', name: '토끼' },
    { key: 'squirrel', name: '다람쥐' },
    { key: 'panda', name: '판다' },
    { key: 'fox', name: '여우' },
    { key: 'owl', name: '부엉이' },
    { key: 'hedgehog', name: '고슴도치' },
  ],
  story: {
    title: '다람쥐의 겨울 준비를 도와요!',
    icon: { kind: 'prop', name: 'acorn' },
    enterVoice: '숲속 마을이야! 다람쥐가 겨울 준비를 해. 친구들을 도와줘!',
    storyVoice: '다람쥐의 겨울 준비를 도와요! 풍선도 터뜨리고, 도토리도 세어 봐!',
  },
  games: [
    {
      key: 'balloon',
      name: '풍선 터뜨리기',
      scene: [
        { kind: 'character', name: 'rabbit', style: 'height:20cqh;left:0;bottom:2cqh' },
        { kind: 'prop', name: 'balloon-red', style: 'right:0;bottom:8cqh;width:11cqh;height:15cqh' },
        { kind: 'prop', name: 'balloon-blue', style: 'right:8cqh;bottom:12cqh;width:9cqh;height:12cqh' },
      ],
    },
    {
      key: 'trees',
      name: '어느 쪽이 많아?',
      scene: [
        { kind: 'prop', name: 'tree', style: 'left:0;bottom:1cqh;width:17cqh;height:22cqh' },
        { kind: 'prop', name: 'tree', style: 'right:0;bottom:1cqh;width:14cqh;height:18cqh' },
        { kind: 'character', name: 'squirrel', style: 'height:11cqh;left:11cqh;bottom:0' },
      ],
    },
    {
      key: 'acorns',
      name: '도토리 세기',
      scene: [
        { kind: 'character', name: 'squirrel', style: 'height:19cqh;left:0;bottom:2cqh' },
        { kind: 'prop', name: 'acorn', style: 'right:1cqh;bottom:2cqh;width:10cqh;height:10cqh' },
        { kind: 'prop', name: 'acorn', style: 'right:5cqh;bottom:12cqh;width:9cqh;height:9cqh' },
      ],
    },
  ],
});
