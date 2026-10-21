// 빌드가 끝나면 dist의 모든 파일 목록으로 오프라인 저장 파일(dist/sw.js)을 만든다.
// 파일 내용이 바뀌면 저장 이름(CACHE)도 바뀌어서, 새로 올린 버전을 받으면 예전 저장본을 지운다.
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { createHash } from 'node:crypto';

const SW_FILE = 'sw.js';

function listFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? listFiles(full) : [full];
  });
}

const swSource = (cache, files) => `// 자동으로 만든 파일 (scripts/sw-plugin.mjs). 직접 고치지 마세요.
const CACHE = ${JSON.stringify(cache)};
const FILES = ${JSON.stringify(files)};

// 저장할 때는 브라우저 임시 저장(HTTP 캐시)을 거치지 않고 서버에서 새로 받는다.
// (새 버전 직후 예전 index.html이 섞여 들어가 빈 화면이 되는 일을 막는다)
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES.map((f) => new Request(f, { cache: 'reload' })))));
});

// 새 버전은 앱을 쓰는 중에 끼어들지 않고, 앱을 완전히 닫았다 다시 열 때 바뀐다.
// 바뀐 뒤에 예전 저장본을 지운다.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith('elephant-') && k !== CACHE).map((k) => caches.delete(k)))),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  // 소리 파일의 부분 요청(Range)은 서버로 보낸다. 저장본으로 답하면 아이패드 사파리가 재생하지 못한다.
  // (인터넷이 없으면 재생 실패 → 앱이 기본 음성으로 읽는다)
  if (request.headers.has('range')) return;
  // 녹음 목록은 새 녹음을 넣었을 때 바로 반영되게 인터넷 먼저
  if (request.url.endsWith('/audio/voice/manifest.json')) {
    event.respondWith(fetch(request).catch(() => caches.match(request)));
    return;
  }
  // 그 밖에는 저장본 먼저 (인터넷이 없어도 열린다). 페이지 열기는 index.html로.
  // ignoreVary: 서버가 붙이는 Vary(Origin 등) 때문에 저장본을 못 찾는 일이 없게
  event.respondWith(
    caches.match(request, { ignoreSearch: true, ignoreVary: true })
      .then((hit) => hit || (request.mode === 'navigate' ? caches.match('./index.html', { ignoreVary: true }) : null))
      .then((hit) => hit || fetch(request)),
  );
});
`;

export function offlineServiceWorker() {
  let outDir = 'dist';
  return {
    name: 'offline-service-worker',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      const files = listFiles(outDir)
        .map((f) => relative(outDir, f).split(sep).join('/'))
        .filter((f) => f !== SW_FILE)
        // 옛날 브라우저용 .woff(같은 글꼴의 .woff2가 있음)와 숨김 파일(.gitkeep)은 저장하지 않는다
        .filter((f) => !f.endsWith('.woff') && !f.split('/').pop().startsWith('.'))
        // 녹음 파일(mp3)은 저장하지 않는다 (위 Range 설명 참고). 녹음 목록(manifest.json)은 저장한다.
        .filter((f) => !f.endsWith('.mp3'))
        .sort();
      const hash = createHash('sha256');
      hash.update(swSource('', [])); // 저장 방식(sw.js 내용)이 바뀌어도 새 이름
      files.forEach((f) => hash.update(f).update(readFileSync(join(outDir, f))));
      const cache = `elephant-${hash.digest('hex').slice(0, 12)}`;
      writeFileSync(join(outDir, SW_FILE), swSource(cache, ['./', ...files.map((f) => `./${f}`)]));
      console.log(`[offline] ${SW_FILE}: 파일 ${files.length}개 저장 (${cache})`);
    },
  };
}
