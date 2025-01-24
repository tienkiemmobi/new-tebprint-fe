import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

const getMyMockup = async (page: Page) => {
  await page.goto('/my-mockups');
  await page.getByText('My Mockups').nth(0).waitFor();

  const myMockupResponse = await page.waitForResponse((response) => response.url().includes('/mockups?page'));
  const myMockupData = await myMockupResponse.json();

  expect(myMockupData.success, {
    message: myMockupData.message || 'get my mockup must return success',
  }).toBe(true);

  if (myMockupData.total === 0) return;

  await page.waitForTimeout(1000);
  await expect(page.locator('span[data-tooltip-id]').nth(0), {
    message: 'Filename not match',
  }).toHaveText(myMockupData.data[0].fileName);
};

export const myMockupTest = {
  getMyMockup,
};
