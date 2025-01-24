import { faker } from '@faker-js/faker';
import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

const getUserManager = async (page: Page) => {
  await page.goto('/user-manager');
  await page.getByText('User Manager').nth(0).waitFor();

  const userManagerResponse = await page.waitForResponse((response) => response.url().includes('/users?page'));
  const userManagerData = await userManagerResponse.json();

  expect(userManagerData.success, {
    message: userManagerData.message || 'get user manager must return success',
  }).toBe(true);

  if (userManagerData.total === 0) return;

  await page.waitForTimeout(500);
  await expect(page.locator('div[user-manager-name]').nth(0), {
    message: 'user full name not match',
  }).toHaveText(userManagerData.data[0].fullName);
};

const createUser = async (page: Page) => {
  await page.goto('/user-manager');
  await page.waitForResponse((response) => response.url().includes('/users'));
  await page.waitForTimeout(500);

  const user = {
    name: faker.person.fullName(),
    email: faker.internet.email({ provider: 'tebprint.com' }),
    phone: '0000000000',
    address: faker.location.streetAddress(),
  };

  await page.getByText('Create User').click();
  await page.getByPlaceholder('Full Name').fill(user.name);
  await page.getByPlaceholder('Email').fill(user.email);
  await page.getByPlaceholder('Phone').fill(user.phone);
  await page.locator('button[role="combobox"]:has-text("Select a verified gender to display")').click();
  await page.locator('div[role="option"]').nth(0).click();
  await page.getByPlaceholder('Address').fill(user.address);
  await page.locator('button[role="combobox"]:has-text("Select a role")').click();
  await page.locator('div[role="option"]').nth(0).click();
  await page.locator('button[type="submit"]:has-text("Create")').click();

  const createUserResponse = await page.waitForResponse((response) => response.url().includes('/register'));
  const createUserData = await createUserResponse.json();

  expect(createUserData.success, {
    message: createUserData.message || 'create user response must return success',
  }).toBe(true);

  await page.waitForTimeout(200);
  await expect(page.locator('div[user-manager-name]').nth(0), {
    message: 'user list should contain data just add',
  }).toContainText(user.name);
};

export const userManagerTest = {
  getUserManager,
  createUser,
};
