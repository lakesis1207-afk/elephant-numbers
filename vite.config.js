import { defineConfig } from 'vite';
import { offlineServiceWorker } from './scripts/sw-plugin.mjs';

export default defineConfig({
  // GitHub Pages는 https://계정.github.io/저장소이름/ 아래에서 열리므로 상대 경로로 묶는다.
  base: './',
  server: { port: 5173 },
  // 빌드할 때 오프라인 저장 파일(sw.js)을 만든다
  plugins: [offlineServiceWorker()],
  test: {
    include: ['tests/unit/**/*.test.js'],
  },
});
