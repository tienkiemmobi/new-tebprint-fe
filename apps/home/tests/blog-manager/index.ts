import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

const getBlogManager = async (page: Page) => {
  await page.goto('/blog-manager');

  const blogManagerResponse = await page.waitForResponse((response) => response.url().includes('/blogs'));
  const blogManagerData = await blogManagerResponse.json();

  expect(blogManagerData.success, {
    message: blogManagerData.message || 'get blog manager must return success',
  }).toBe(true);

  if (blogManagerData.total === 0) return;

  await page.waitForTimeout(500);
  await expect(page.locator('div[blog-manager-title]').nth(0), {
    message: 'blog title not match',
  }).toHaveText(blogManagerData.data[0].title);
};

export const blogManagerTest = {
  getBlogManager,
};
