import { faker } from '@faker-js/faker';
import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

const getStore = async (page: Page) => {
  await page.goto('/stores');
  await page.getByText('My Stores').nth(0).waitFor();

  const storeResponse = await page.waitForResponse((response) => response.url().includes('/stores'));
  const storeData = await storeResponse.json();

  expect(storeData.success, {
    message: storeData.message || 'get my stores must return success',
  }).toBe(true);

  if (storeData.total === 0) return;

  await page.waitForTimeout(1000);
  await expect(page.locator('div[store-item]').nth(0), {
    message: 'store name not found',
  }).toHaveText(storeData.data[0].name);
};

const createStore = async (page: Page) => {
  await page.goto('/stores');
  await page.waitForResponse((response) => response.url().includes('/stores'));
  await page.waitForTimeout(500);

  const store = {
    name: faker.person.fullName(),
    description: faker.commerce.product(),
  };
  await page.getByText('New Store').click();
  await page.getByPlaceholder('Name').fill(store.name);
  await page.getByPlaceholder('Description').fill(store.description);
  await page.locator('button[type="submit"]:has-text("Create")').click();

  const createStoreResponse = await page.waitForResponse((response) => response.url().includes('/stores'));
  const createStoreData = await createStoreResponse.json();

  expect(createStoreData.success, { message: 'create store response must return success' }).toBe(true);

  await page.waitForTimeout(200);
  await expect(page.locator('div[store-list]'), { message: 'store list should contain data just add' }).toContainText(
    store.name,
  );
};

export const storeTest = {
  getStore,
  createStore,
};
