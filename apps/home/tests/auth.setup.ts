/* eslint-disable no-console */
import { chromium, test as setup } from '@playwright/test';
import dotenv from 'dotenv';
import fs from 'fs';

import type { Auth } from './utils';
import { auths } from './utils';

dotenv.config();
const baseAuth = process.env.TEST_AUTH;

const authBrowser = async (auth: Auth) => {
  const authPath = `${baseAuth}/${auth.role}.json`;

  try {
    await fs.promises.writeFile(authPath, '');
  } catch {
    /* empty */
  }

  const browser = await chromium.launch({
    devtools: true,
    executablePath: process.env.TEST_EXECUTABLE_PATH,
  });
  const page = await browser.newPage();

  await page.goto('/login');
  await page.getByText('Email').nth(0).waitFor();
  await page.waitForResponse((response) => response.url().includes('https://www.google.com/recaptcha/api2/reload'));

  await page.locator('#email').fill(auth.username);
  await page.locator('#password').fill(auth.password);
  await page.getByText('Login').click();

  await page.waitForResponse((response) => response.url().includes('auth/login'));
  await page.waitForResponse((response) => response.url().includes('me'));
  await page.waitForTimeout(400);

  // End of authentication steps.

  await page.context().storageState({ path: authPath });
};

setup('authenticate', async () => {
  const promiseAuths = auths.map((auth) => authBrowser(auth));

  await Promise.allSettled(promiseAuths);
});
