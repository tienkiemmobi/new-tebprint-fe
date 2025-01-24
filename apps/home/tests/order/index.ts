/* eslint-disable no-await-in-loop */
import { faker } from '@faker-js/faker';
import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import dotenv from 'dotenv';
import fs from 'fs';
import { clickUntilSelectorNotExist } from 'tests/utils';
import * as XLSX from 'xlsx';

dotenv.config();

const getOrder = async (page: Page) => {
  await page.goto('/orders');
  await page.getByText('My orders').nth(0).waitFor();

  const orderResponse = await page.waitForResponse((response) => response.url().includes('/orders?page'));
  const orderData = await orderResponse.json();

  expect(orderData.success, {
    message: orderData.message || 'get order must return success',
  }).toBe(true);

  if (orderData.total === 0) return;

  await page.waitForTimeout(1000);
  await expect(page.locator('p[order-external-id]').nth(0), {
    message: 'externalId not match',
  }).toHaveText(orderData.data[0].externalId);
};

const createManualOrder = async (page: Page) => {
  await page.goto('/create-order');
  await page.getByText('Create order').waitFor();
  const fakeData = `TEST ${faker.string.nanoid(4)}`;
  const imagePath = `${process.env.TEST_ASSETS}/artwork.png`;

  await page.getByPlaceholder('External Id').fill(fakeData);
  await page.getByPlaceholder('First name').fill(faker.person.firstName());
  await page.getByPlaceholder('Last name').fill(faker.person.lastName());
  await page.getByPlaceholder('Email').fill(faker.internet.email());

  // country
  await page.locator('button[role="combobox"]').nth(0).click();
  await page.locator('div[role="option"]:has-text("VN")').click();

  await page.getByPlaceholder('Phone').fill(faker.string.numeric(10));
  await page.getByPlaceholder('State').fill(faker.location.state());
  await page.getByPlaceholder('Address line 1').fill(faker.location.streetAddress());
  await page.getByPlaceholder('City').fill(faker.location.city());
  await page.getByPlaceholder('ZIP Code').fill(faker.location.zipCode());

  // add order
  await page.getByText('Add new order item').click();
  await clickUntilSelectorNotExist(page, 'div[data-select-product]');

  // upload image
  await page.setInputFiles('input[type="file"][data-upload-front]', imagePath);
  const uploadImageResponse = await page.waitForResponse((response) => response.url().includes('/upload'));
  const uploadImageData = await uploadImageResponse.json();

  expect(uploadImageData.success, { message: 'upload image response must return success' }).toBe(true);

  await page.locator('button:has-text("Submit")').click();
  const createManualOrderResponse = await page.waitForResponse((response) => response.url().includes('/orders'));
  const createManualOrderData = await createManualOrderResponse.json();

  expect(createManualOrderData.success, {
    message: createManualOrderData.message || 'create order response must return success',
  }).toBe(true);
};

const payOrder = async (page: Page) => {
  await page.goto('/orders');
  await page.getByText('My orders').nth(0).waitFor();

  await page.locator('button[aria-label="Select row"]').nth(0).click();
  await page.getByText('Pay').nth(0).click();

  const calculateOrderPayResponse = await page.waitForResponse((response) =>
    response.url().includes('/orders/calc-pay-orders'),
  );
  const calculateOrderPayData = await calculateOrderPayResponse.json();
  expect(calculateOrderPayData.success, {
    message: calculateOrderPayData.message || 'calculate order pay response must return success',
  }).toBe(true);

  const isPaid = calculateOrderPayData.data.orders.some((item: any) => item.isPaid);

  if (isPaid) return;

  await page.locator('button[submit-pay]').click();
  const payOrderResponse = await page.waitForResponse((response) => response.url().includes('/orders/pay-orders'));
  const payOrderData = await payOrderResponse.json();
  expect(payOrderData.success, {
    message: payOrderData.message || 'pay order response must return success',
  }).toBe(true);
};

const importOrder = async (page: Page) => {
  await page.goto('/orders/import');
  await page.getByText('CSV Orders Import').nth(0).waitFor();

  const data = [
    {
      'External ID': faker.string.numeric(10),
      'Store Code': faker.string.alphanumeric(6),
      'Shipping method': 'Standard',
      'First name': faker.person.firstName(),
      'Last name': faker.person.lastName(),
      Country: faker.location.country(),
      Region: faker.location.state(),
      'Address line 1': faker.location.streetAddress(),
      City: faker.location.city(),
      Zip: faker.location.zipCode(),
      Quantity: 1,
      'Variant ID': 'OHL9QD88',
    },
  ];

  const csvFilePath = `order-import-template.csv`;
  const filePath = `${process.env.TEST_ASSETS}/${csvFilePath}`;
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'csv' });
  await fs.promises.writeFile(filePath, buffer);

  await page.setInputFiles('input[type="file"]', filePath);
  await fs.promises.unlink(filePath);

  const importOrderResponse = await page.waitForResponse((response) =>
    response.url().includes('/product-variants/bulk'),
  );
  const importOrderData = await importOrderResponse.json();
  expect(importOrderData.success, {
    message: importOrderData.message || 'import order response must return success',
  }).toBe(true);

  await expect(page.locator('div[order-external-id]').nth(0), {
    message: 'external id not match',
  }).toHaveText(data[0]?.['External ID'] || '');

  await page.locator('button:has-text("Submit")').click();

  const submitOrderResponse = await page.waitForResponse((response) => response.url().includes('/orders/import'));
  const submitOrderData = await submitOrderResponse.json();
  expect(submitOrderData.success, {
    message: submitOrderData.message || 'submit order response must return success',
  }).toBe(true);
};

export const orderTest = {
  payOrder,
  createManualOrder,
  getOrder,
  importOrder,
};
