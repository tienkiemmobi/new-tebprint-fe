import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

const getMyArtwork = async (page: Page) => {
  await page.goto('/my-artworks');
  await page.getByText('My Artworks').nth(0).waitFor();

  const myArtworkResponse = await page.waitForResponse((response) => response.url().includes('/artworks?page'));
  const myArtworkData = await myArtworkResponse.json();

  expect(myArtworkData.success, {
    message: myArtworkData.message || 'get my artwork must return success',
  }).toBe(true);

  if (myArtworkData.total === 0) return;

  await page.waitForTimeout(1000);
  await expect(page.locator('span[data-tooltip-id]').nth(0), {
    message: 'Filename not match',
  }).toHaveText(myArtworkData.data[0].fileName);
};

export const myArtworkTest = {
  getMyArtwork,
};
