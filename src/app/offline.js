// 오프라인 저장(service worker) 등록: 빌드한 완성본에서만. 한 번 열면 인터넷 없이도 열린다.
// sw.js는 vite.config.js가 빌드할 때 만든다.
// 새 버전 확인: 앱 화면으로 돌아올 때마다 확인하고, 받은 새 버전은 다음에 앱을 열 때 적용된다.
export function registerOffline() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('./sw.js');
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState !== 'visible') return;
        registration.update().catch((error) => console.warn('[offline] 새 버전을 확인하지 못했습니다.', error));
      });
    } catch (error) {
      console.warn('[offline] 오프라인 저장을 켜지 못했습니다.', error);
    }
  });
}
