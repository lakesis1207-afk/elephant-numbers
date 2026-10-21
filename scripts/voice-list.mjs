// 음성 목록 문서(docs/음성 목록.md)를 만든다: 녹음할 문장과 파일 이름. (npm run voice:list)
import { writeFileSync } from 'node:fs';
import { VOICE_LINES } from '../src/audio/voiceLines.js';

const groups = [...new Set(VOICE_LINES.map((l) => l.group))];
const parts = [
  '# 음성 목록',
  '',
  '아이 목소리로 녹음해서 `public/audio/voice/<파일 이름>.mp3` 로 넣으면 그 녹음이 나와요.',
  '파일이 없는 문장은 브라우저 기본 음성으로 읽어요. 이 문서는 `npm run voice:list` 로 다시 만들 수 있어요(직접 고치지 마세요).',
  '',
  `모두 ${VOICE_LINES.length}개`,
];
for (const g of groups) {
  const rows = VOICE_LINES.filter((l) => l.group === g);
  parts.push('', `## ${g} (${rows.length}개)`, '', '| 파일 이름 | 문장 |', '|---|---|');
  rows.forEach((l) => parts.push(`| ${l.id}.mp3 | ${l.text.replace(/\|/g, '\|')} |`));
}
writeFileSync(new URL('../docs/음성 목록.md', import.meta.url), `${parts.join('\n')}\n`);
console.log(`[voice] docs/음성 목록.md 에 ${VOICE_LINES.length}개를 적었어요.`);
