import type { Page } from '@playwright/test';

export const isSelectorExist = async (page: Page, selector: string, timeout?: number) => {
  try {
    await page
      .locator(selector)
      .nth(0)
      .waitFor({ timeout: timeout || 5000 });

    return true;
  } catch (error) {
    // console.log(error);
  }

  return false;
};

export const isContentExist = async (page: Page, content: string) => {
  try {
    await page.getByText(content).nth(0).waitFor();

    return true;
  } catch (error) {
    // console.log(error);
  }

  return false;
};

export const clickUntilSelectorNotExist = async (page: Page, selector: string) => {
  const clickAndWait = async () => {
    const isExist = await isSelectorExist(page, selector, 5000);
    if (isExist) {
      await page.locator(selector).nth(0).click();
      await page.waitForTimeout(1000);
      await clickAndWait();
    }
  };

  await clickAndWait();
};
