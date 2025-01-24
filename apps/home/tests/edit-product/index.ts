import { faker } from '@faker-js/faker';
import { expect, type Page } from '@playwright/test';
import dotenv from 'dotenv';
import { ShareData, uploadImage } from 'tests/utils';

dotenv.config();

const createProducts = async (page: Page) => {
  const imagePath1 = `${process.env.TEST_ASSETS}/create-product1.png`;
  const imagePath2 = `${process.env.TEST_ASSETS}/create-product2.png`;

  const mockProduct = {
    title: `TEST_${faker.string.nanoid(4)}`,
    description: `TEST_${faker.string.nanoid(4)}`,
    productCode: `TEST_${faker.string.nanoid(4)}`,
    price: faker.number.int({ min: 1, max: 20 }).toString(),
    notes: `TEST_${faker.string.nanoid(4)}`,
    productionTimeStart: faker.number.int({ min: 1, max: 20 }).toString(),
    productionTimeEnd: faker.number.int({ min: 1, max: 20 }).toString(),
    shippingTimeStart: faker.number.int({ min: 1, max: 20 }).toString(),
    shippingTimeEnd: faker.number.int({ min: 1, max: 20 }).toString(),
    variants: [
      {
        name: `TEST_${faker.string.nanoid(4)}`,
        price: faker.number.int({ min: 1, max: 20 }).toString(),
        quantity: faker.number.int({ min: 1, max: 20 }).toString(),
        baseCost: faker.number.int({ min: 1, max: 20 }).toString(),
        sku: `TEST_${faker.string.nanoid(4)}`,
        color: faker.color.human(),
        size: `TEST_${faker.string.nanoid(4)}`,
        style: `TEST_${faker.string.nanoid(4)}`,
      },
    ],
  };

  await page.goto('/edit-product/new');
  await page.getByText('Mockups').nth(0).waitFor();

  await uploadImage({ page, fileSelector: 'input[type="file"]', imagePath: imagePath1 });
  await uploadImage({ page, fileSelector: 'input[type="file"]', imagePath: imagePath2 });

  await page.getByPlaceholder('Title').fill(mockProduct.title);
  await page.getByPlaceholder('Description').fill(mockProduct.description);
  await page.getByPlaceholder('Product Code').fill(mockProduct.productCode);
  await page.getByPlaceholder('Price').fill(mockProduct.price);
  await page.getByPlaceholder('Notes').fill(mockProduct.notes);
  await page.getByPlaceholder('Product Time Start').fill(mockProduct.productionTimeStart);
  await page.getByPlaceholder('Product Time End').fill(mockProduct.productionTimeEnd);
  await page.getByPlaceholder('Shipping Time Start').fill(mockProduct.shippingTimeStart);
  await page.getByPlaceholder('Shipping Time End').fill(mockProduct.shippingTimeEnd);

  await page.locator('button[role="combobox"]:has-text("Select category")').click();
  await page.locator('div[role="option"]').nth(0).click();

  await page.getByText('Add Variant').click();
  await page.getByPlaceholder('Name').fill(mockProduct.variants[0]!.name);
  await page.getByPlaceholder('Price').nth(1).fill(mockProduct.variants[0]!.price);
  await page.getByPlaceholder('Quantity').fill(mockProduct.variants[0]!.quantity);
  await page.getByPlaceholder('Base cost').fill(mockProduct.variants[0]!.baseCost);
  await page.getByPlaceholder('SKU').fill(mockProduct.variants[0]!.sku);
  await page.getByPlaceholder('Color').fill(mockProduct.variants[0]!.color);
  await page.getByPlaceholder('S, L, XL, 2XL, ...').fill(mockProduct.variants[0]!.size);
  await page.getByPlaceholder('3D').fill(mockProduct.variants[0]!.style);

  await page.locator('button[type="submit"]:has-text("Save")').click();
  await page.locator('button:has-text("Publish")').click();

  const createProductResponse = await page.waitForResponse((response) => response.url().includes('/products'));
  const createProductData = await createProductResponse.json();

  if (createProductData.success) {
    ShareData.productDetail = createProductData;
  }
  expect(createProductData.success, { message: 'create product response must return success' }).toBe(true);
};

export const editProductTest = {
  createProducts,
};
