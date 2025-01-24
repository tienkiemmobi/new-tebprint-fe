import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

const getMailManager = async (page: Page) => {
  await page.goto('/mail-manager');
  await page.getByText('Mail Manager').nth(0).waitFor();

  const mailManagerResponse = await page.waitForResponse((response) => response.url().includes('/mails?page'));
  const mailManagerData = await mailManagerResponse.json();

  expect(mailManagerData.success, {
    message: mailManagerData.message || 'get mail manager must return success',
  }).toBe(true);

  if (mailManagerData.total === 0) return;

  await page.waitForTimeout(500);
  await expect(page.locator('div[mail-manager-title]').nth(0), {
    message: 'mail title not match',
  }).toHaveText(mailManagerData.data[0].title);
};

export const mailManagerTest = {
  getMailManager,
};
