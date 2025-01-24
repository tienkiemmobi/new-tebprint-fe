import { faker } from '@faker-js/faker';
import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

const getCategoryManager = async (page: Page) => {
  await page.goto('/category-manager');
  await page.getByText('Category Manager').nth(0).waitFor();

  const categoryManagerResponse = await page.waitForResponse((response) => response.url().includes('/categories?page'));
  const categoryManagerData = await categoryManagerResponse.json();

  expect(categoryManagerData.success, {
    message: categoryManagerData.message || 'get category manager must return success',
  }).toBe(true);

  if (categoryManagerData.total === 0) return;

  await page.waitForTimeout(500);
  await expect(page.locator('p[category-manager-name]').nth(0), {
    message: 'category full name not match',
  }).toHaveText(categoryManagerData.data[0].name);
};

const createCategory = async (page: Page) => {
  await page.goto('/category-manager');
  await page.getByText('New Category').waitFor();
  const fakeData = `TEST ${faker.string.nanoid(4)}`;

  await page.getByText('New Category').click();
  await page.getByPlaceholder('Name').fill(fakeData);
  await page.getByPlaceholder('Code').fill(fakeData);
  await page.getByPlaceholder('Description').fill(fakeData);
  await page.locator('button[role="combobox"]:has-text("Select category")').click();
  await page.locator('div[role="option"]').nth(0).click();
  await page.locator('button[type="submit"]:has-text("Save")').click();

  const createCategoryResponse = await page.waitForResponse((response) => response.url().includes('/categories'));
  const createCategoryData = await createCategoryResponse.json();

  expect(createCategoryData.success, { message: 'create category response must return success' }).toBe(true);

  await page.waitForTimeout(200);
  await expect(page.locator('table'), { message: 'Table should contain data just add' }).toContainText(fakeData);
};

export const categoryTest = {
  createCategory,
  getCategoryManager,
};
