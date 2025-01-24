import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

const getStoreManager = async (page: Page) => {
  await page.goto('/store-manager');
  await page.getByText('Store Manager').nth(0).waitFor();

  const storeManagerResponse = await page.waitForResponse((response) => response.url().includes('/stores?page'));
  const storeManagerData = await storeManagerResponse.json();

  expect(storeManagerData.success, {
    message: storeManagerData.message || 'get store manager must return success',
  }).toBe(true);

  if (storeManagerData.total === 0) return;

  await page.waitForTimeout(1000);
  await expect(page.locator('b[store-manager-name]').nth(0), {
    message: 'store name not match',
  }).toHaveText(storeManagerData.data[0].name);
};

export const storeManagerTest = {
  getStoreManager,
};
