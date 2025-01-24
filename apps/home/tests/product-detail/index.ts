import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { ShareData } from 'tests/utils';

const getProductDetail = async (page: Page) => {
  await page.goto(`/product/${ShareData.productDetail.data._id}`);
  await page.getByText('About').nth(0).waitFor();

  await expect(page.locator('p[product-code-detail]').nth(0), {
    message: 'No product code detail found',
  }).toHaveText(ShareData.productDetail.data.productCode);
};

export const productDetailTest = {
  getProductDetail,
};
