import { test, expect } from './fixtures.js';

// 오프라인 저장(service worker)은 빌드한 완성본에서만 켜진다
test.skip(({ baseURL }) => !baseURL.includes('/elephant-numbers/'), '빌드본(built)에서만 검사');

test('설치 정보(manifest)와 아이콘이 있다', async ({ page, request, baseURL }) => {
  await page.goto('./');
  const href = await page.locator('link[rel="manifest"]').getAttribute('href');
  const res = await request.get(new URL(href, baseURL).href);
  expect(res.ok()).toBe(true);
  const manifest = await res.json();
  expect(manifest).toMatchObject({ name: '코끼리와 숫자 친구들', display: 'fullscreen', orientation: 'landscape', start_url: './' });
  for (const icon of manifest.icons) {
    expect((await request.get(new URL(icon.src, baseURL).href)).ok(), icon.src).toBe(true);
  }
});

test('한 번 열면 인터넷이 끊겨도 앱이 열리고 게임까지 할 수 있다', async ({ page, context }) => {
  await page.goto('./');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  // 저장이 끝나 이 페이지를 맡을 때까지 기다린다
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);

  await context.setOffline(true);
  await page.reload();
  await page.getByRole('button', { name: '시작' }).click();
  await page.getByRole('button', { name: '사바나 마을', exact: true }).click();
  await page.getByRole('button', { name: '과일 세기' }).click();
  await expect(page.locator('.tray .fruit').first()).toBeVisible();

  const broken = await page.locator('img').evaluateAll((imgs) =>
    imgs.filter((img) => !img.complete || img.naturalWidth === 0).map((img) => img.getAttribute('src')),
  );
  expect(broken).toEqual([]);
  expect(await page.evaluate(() => document.fonts.check('16px Jua', '코끼리'))).toBe(true);
  await context.setOffline(false);
});
