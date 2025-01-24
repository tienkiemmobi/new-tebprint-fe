import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export const uploadImage = async ({
  page,
  fileSelector,
  imagePath,
}: {
  page: Page;
  imagePath: string;
  fileSelector: string;
}) => {
  await page.setInputFiles(fileSelector, imagePath);

  const uploadImageResponse = await page.waitForResponse((response) => response.url().includes('/upload'));
  const uploadImageData = await uploadImageResponse.json();

  expect(uploadImageData.success, { message: 'upload image response must return success' }).toBe(true);
};
