import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

const getProducts = async (page: Page) => {
  await page.goto('/products');
  await page.getByText('All Products').nth(0).waitFor();

  await expect(page.locator('div[product-item]').nth(0), {
    message: 'No products found',
  }).toBeVisible();
};

export const productsTest = {
  getProducts,
};
