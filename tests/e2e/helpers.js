// 브라우저 검사 공통 도우미
import { expect } from '@playwright/test';

/**
 * 오늘 날짜로 진행 기록을 넣고 앱을 연 뒤 ▶를 누른다.
 * 앱이 뜨기 전에 넣어야 한다: 열린 앱을 새로고침하면 앱이 화면을 떠나며 자기 기록을 다시 저장하기 때문.
 */
export async function startWith(page, saved, { pressStart = true } = {}) {
  await page.addInitScript((data) => {
    if (sessionStorage.getItem('seeded')) return; // 첫 로드에만
    sessionStorage.setItem('seeded', '1');
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const day = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    localStorage.setItem('elephant-numbers', JSON.stringify({ ...data, day }));
  }, saved);
  await page.goto('./');
  if (pressStart) await page.getByRole('button', { name: '시작' }).click();
}

/** 버튼을 ms 동안 꾹 누른다 */
export async function hold(page, locator, ms = 3300) {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(ms);
  await page.mouse.up();
}
