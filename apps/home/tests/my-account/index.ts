import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

const getMe = async (page: Page) => {
  await page.goto('/my-account');
  await page.getByText('My Account').nth(0).waitFor();

  const myAccountResponse = await page.waitForResponse((response) => response.url().includes('/auth/me'));
  const myAccountData = await myAccountResponse.json();

  expect(myAccountData.success, {
    message: myAccountData.message || 'get my account must return success',
  }).toBe(true);

  await page.waitForTimeout(1000);
  await expect(page.getByPlaceholder('Full Name'), {
    message: 'full name not match',
  }).toHaveValue(myAccountData.data.fullName);
};

export const accountTest = {
  getMe,
};
