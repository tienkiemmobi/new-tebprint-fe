import { faker } from '@faker-js/faker';
import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

const getRoleManager = async (page: Page) => {
  await page.goto('/role-manager');
  await page.getByText('Role Manager').nth(0).waitFor();

  const roleManagerResponse = await page.waitForResponse((response) => response.url().includes('/roles'));
  const roleManagerData = await roleManagerResponse.json();

  expect(roleManagerData.success, {
    message: roleManagerData.message || 'get role manager must return success',
  }).toBe(true);

  if (roleManagerData.total === 0) return;

  await page.waitForTimeout(500);
  await expect(page.locator('p[role-manager-name]').nth(0), {
    message: 'role name not match',
  }).toHaveText(roleManagerData.data[0].name);
};

const createRole = async (page: Page) => {
  await page.goto('/role-manager');
  await page.waitForResponse((response) => response.url().includes('/roles'));
  await page.waitForTimeout(500);

  const role = {
    name: 'Accounting',
    description: faker.commerce.product(),
  };
  await page.getByText('Create Role').click();
  await page.getByPlaceholder('Name').fill(role.name);
  await page.getByPlaceholder('Description').fill(role.description);
  await page.locator('button[role="switch"]').click();
  await page.locator('button[type="submit"]:has-text("Save")').click();

  const createRoleResponse = await page.waitForResponse((response) => response.url().includes('/roles'));
  const createRoleData = await createRoleResponse.json();

  expect(createRoleData.success, {
    message: createRoleData.message || 'create role response must return success',
  }).toBe(true);

  await page.waitForTimeout(200);
  await expect(page.locator('p[role-manager-name]').nth(0), {
    message: 'role list should contain data just add',
  }).toContainText(role.name);
};

export const roleManagerTest = {
  getRoleManager,
  createRole,
};
