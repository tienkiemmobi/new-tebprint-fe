import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

const getContactManager = async (page: Page) => {
  await page.goto('/contact-manager');
  await page.getByText('Contact Manager').nth(0).waitFor();

  const contactManagerResponse = await page.waitForResponse((response) => response.url().includes('/contacts'));
  const contactManagerData = await contactManagerResponse.json();

  expect(contactManagerData.success, {
    message: contactManagerData.message || 'get contact manager must return success',
  }).toBe(true);

  if (contactManagerData.total === 0) return;

  await page.waitForTimeout(500);
  await expect(page.locator('div[contact-manager-name]').nth(0), {
    message: 'contact full name not match',
  }).toHaveText(contactManagerData.data[0].fullName);
};

export const contactManagerTest = {
  getContactManager,
};
