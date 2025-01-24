import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

const getProductManager = async (page: Page) => {
  await page.goto('/product-manager');
  await page.getByText('Product Manager').nth(0).waitFor();

  const productManagerResponse = await page.waitForResponse((response) => response.url().includes('/products?page'));
  const productManagerData = await productManagerResponse.json();

  expect(productManagerData.success, {
    message: productManagerData.message || 'get product manager must return success',
  }).toBe(true);

  if (productManagerData.total === 0) return;

  await page.waitForTimeout(500);
  await expect(page.locator('p[product-manager-title]').nth(0), {
    message: 'product full title not match',
  }).toHaveText(productManagerData.data[0].title);
};

export const productManagerTest = {
  getProductManager,
};
