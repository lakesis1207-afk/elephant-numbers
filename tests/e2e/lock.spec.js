import { test, expect } from './fixtures.js';
import { startWith, hold } from './helpers.js';

test.setTimeout(60_000);



test('놀이 시간이 다 되면 지도에서 잠기고, 부모님이 2초 누르면 다시 논다', async ({ page }) => {
  await startWith(page, { limitMin: 1, usedMs: 58_000 });
  await expect(page.getByText('코끼리가 졸려요. 내일 또 놀자!')).toBeVisible({ timeout: 6000 });
  await expect(page.locator('.lock .mission')).toContainText('볼까?');
  await expect(page.locator('#bar')).toBeHidden();

  // 짧게 누르면 풀리지 않는다
  await hold(page, page.locator('.hold'), 500);
  await expect(page.locator('.hold')).toBeVisible();

  await hold(page, page.locator('.hold'));
  await expect(page.locator('.vcard')).toHaveCount(5);
  // 1분 더 놀 수 있어서 바로 다시 잠기지 않는다
  await page.waitForTimeout(2000);
  await expect(page.locator('.vcard')).toHaveCount(5);
});

test('게임 중에는 하던 문제를 맞힌 뒤에 잠기고, 풀면 마을로 간다', async ({ page }) => {
  await startWith(page, { limitMin: 1, usedMs: 50_000 });
  await page.getByRole('button', { name: '사바나 마을', exact: true }).click();
  await page.getByRole('button', { name: '반짝 무늬 보기' }).click();

  await page.waitForTimeout(11_000); // 시간이 다 됨 (게임 중이라 아직 안 잠김)
  await expect(page.locator('.card')).toBeVisible();

  const n = Number(await page.locator('.card').getAttribute('data-count'));
  await page.locator(`.opts .opt[aria-label="${n}"]`).click();
  await expect(page.locator('.screen.lock')).toBeVisible({ timeout: 5000 });

  await hold(page, page.locator('.hold'));
  await expect(page.locator('.gcard')).toHaveCount(3);
});

test('자물쇠를 톡 누르면 안내만, 2초 누르면 부모님 메뉴가 열린다', async ({ page }) => {
  await startWith(page, {});
  const lock = page.getByRole('button', { name: '부모님 메뉴, 2초 동안 누르고 있기' });

  await lock.click();
  await expect(page.locator('#toast')).toHaveText('2초간 꾹 눌러주세요');
  await expect(page.getByRole('dialog', { name: '부모님 메뉴' })).toBeHidden();

  await hold(page, lock);
  const menu = page.getByRole('dialog', { name: '부모님 메뉴' });
  await expect(menu).toBeVisible();
  await expect(menu).toContainText('오늘 남은 놀이 시간');
});

test('부모님 메뉴: 모든 마을 열기, 기록 지우기(두 번 확인)', async ({ page }) => {
  await startWith(page, { stickers: ['elephant'], done: { fruit: true } });
  await hold(page, page.getByRole('button', { name: '부모님 메뉴, 2초 동안 누르고 있기' }));
  const menu = page.getByRole('dialog', { name: '부모님 메뉴' });

  await menu.getByRole('button', { name: '모든 마을 열기' }).click();
  await expect(menu.getByRole('button', { name: '모든 마을 열기' })).toHaveAttribute('aria-pressed', 'true');

  await menu.getByRole('button', { name: '지우기' }).click();
  await menu.getByRole('button', { name: '한 번 더 누르면 지워져요' }).click();
  await expect(menu).toBeHidden();
  await expect(page.locator('.vcard:not(.locked)')).toHaveCount(1);

  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('elephant-numbers')));
  expect(saved).toMatchObject({ stickers: [], done: {}, allOpen: false });
});

test('부모님 메뉴: 모든 마을 열기를 켜면 지도에서 바로 열리고, 닫기로 닫힌다', async ({ page }) => {
  await startWith(page, {});
  await hold(page, page.getByRole('button', { name: '부모님 메뉴, 2초 동안 누르고 있기' }));
  const menu = page.getByRole('dialog', { name: '부모님 메뉴' });
  await menu.getByRole('button', { name: '모든 마을 열기' }).click();
  await expect(page.locator('.vcard.locked')).toHaveCount(0);
  await menu.getByRole('button', { name: '닫기' }).click();
  await expect(menu).toBeHidden();
});

test('게임 중 부모님 메뉴에서 게임을 나갈 수 있다', async ({ page }) => {
  await startWith(page, {});
  await page.getByRole('button', { name: '사바나 마을', exact: true }).click();
  await page.getByRole('button', { name: '과일 세기' }).click();
  await hold(page, page.getByRole('button', { name: '부모님 메뉴, 2초 동안 누르고 있기' }));
  await page.getByRole('button', { name: '마을로 나가기' }).click();
  await expect(page.locator('.gcard')).toHaveCount(3);
});
