import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

const getSystemLog = async (page: Page) => {
  await page.goto('/system-logs');
  await page.getByText('System Log').nth(0).waitFor();

  const systemLogResponse = await page.waitForResponse((response) => response.url().includes('/system-logs?page'));
  const systemLogData = await systemLogResponse.json();

  expect(systemLogData.success, {
    message: systemLogData.message || 'get system log must return success',
  }).toBe(true);

  if (systemLogData.total === 0) return;

  await page.waitForTimeout(500);
  await expect(page.locator('p[system-log-action]').nth(0), {
    message: 'system full name not match',
  }).toHaveText(systemLogData.data[0].action);
};

export const systemLogTest = {
  getSystemLog,
};
