import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

const getAdminDashboard = async (page: Page) => {
  await page.goto('/admin-dashboard');
  await page.getByText('Order Statistics').nth(0).waitFor();

  const adminDashboardResponse = await page.waitForResponse((response) => response.url().includes('/orders/statistic'));
  const adminDashboardData = await adminDashboardResponse.json();

  expect(adminDashboardData.success, {
    message: adminDashboardData.message || 'get order statistic must return success',
  }).toBe(true);

  if (adminDashboardData.total === 0) return;

  await page.waitForTimeout(500);
  await expect(page.locator('label[admin-total-statistic]').nth(0), {
    message: 'total statistic not match',
  }).toHaveText(adminDashboardData.data.total.toString());
};

export const adminDashboardTest = {
  getAdminDashboard,
};
