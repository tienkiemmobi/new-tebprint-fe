import { chromium, type Page, test } from '@playwright/test';
import dotenv from 'dotenv';

import { RoleType } from '@/constants';

import { adminDashboardTest } from './admin-dashboard';
import { blogManagerTest } from './blog-manager';
import { categoryTest } from './category-manager';
import { contactManagerTest } from './contact-manager';
import { editProductTest } from './edit-product';
import { mailManagerTest } from './mail-manager';
import { accountTest } from './my-account';
import { myArtworkTest } from './my-artwork';
import { myMockupTest } from './my-mockup';
import { orderTest } from './order';
import { productDetailTest } from './product-detail';
import { productManagerTest } from './product-manager';
import { productsTest } from './products';
import { roleManagerTest } from './role-manager';
import { storeManagerTest } from './store-manager';
import { storeTest } from './stores';
import { systemLogTest } from './system-logs';
import { userManagerTest } from './user-manager';

dotenv.config();

let page: Page;
const baseAuth = process.env.TEST_AUTH;

test.beforeEach(async () => {
  const browser = await chromium.launch({
    devtools: true,
    executablePath: process.env.TEST_EXECUTABLE_PATH,
  });
  page = await browser.newPage();
});

test.describe('MyAccount', () => {
  test.use({ storageState: `${baseAuth}/${RoleType.ADMIN}.json` });

  test('get my account', async () => {
    await accountTest.getMe(page);
  });
});

test.describe('MyArtwork', () => {
  test.use({ storageState: `${baseAuth}/${RoleType.SELLER}.json` });

  test('get my artwork', async () => {
    await myArtworkTest.getMyArtwork(page);
  });
});

test.describe('MyMockup', () => {
  test.use({ storageState: `${baseAuth}/${RoleType.SELLER}.json` });

  test('get my mockup', async () => {
    await myMockupTest.getMyMockup(page);
  });
});

test.describe('stores', () => {
  test.use({ storageState: `${baseAuth}/${RoleType.ADMIN}.json` });

  test('get my store', async () => {
    await storeTest.getStore(page);
  });
  test('create store', async () => {
    await storeTest.createStore(page);
  });
});

test.describe('products', () => {
  test('get products', async () => {
    await productsTest.getProducts(page);
  });
});

test.describe('orders', () => {
  test.use({ storageState: `${baseAuth}/${RoleType.SELLER}.json` });

  test('get order', async () => {
    await orderTest.getOrder(page);
  });
  test('create manual order', async () => {
    await orderTest.createManualOrder(page);
  });
  test('pay order', async () => {
    await orderTest.payOrder(page);
  });
  test('import order', async () => {
    await orderTest.importOrder(page);
  });
});

test.describe('admin-dashboard', () => {
  test.use({ storageState: `${baseAuth}/${RoleType.ADMIN}.json` });

  test('admin dashboard', async () => {
    await adminDashboardTest.getAdminDashboard(page);
  });
});

test.describe('user-manager', () => {
  test.use({ storageState: `${baseAuth}/${RoleType.ADMIN}.json` });

  test('user manager', async () => {
    await userManagerTest.getUserManager(page);
  });
  test('create user', async () => {
    await userManagerTest.createUser(page);
  });
});

test.describe('product-manager', () => {
  test.use({ storageState: `${baseAuth}/${RoleType.ADMIN}.json` });

  test('product manager', async () => {
    await productManagerTest.getProductManager(page);
  });
});

test.describe('category-manager', () => {
  test.use({ storageState: `${baseAuth}/${RoleType.ADMIN}.json` });

  test('get categories', async () => {
    await categoryTest.getCategoryManager(page);
  });
  test('create category', async () => {
    await categoryTest.createCategory(page);
  });
});

test.describe('edit-product', () => {
  test.use({ storageState: `${baseAuth}/${RoleType.ADMIN}.json` });

  test('create products', async () => {
    await editProductTest.createProducts(page);
  });
});

test.describe('product-details', () => {
  test('get product detail', async () => {
    await productDetailTest.getProductDetail(page);
  });
});

test.describe('store-manager', () => {
  test.use({ storageState: `${baseAuth}/${RoleType.ADMIN}.json` });

  test('store managers', async () => {
    await storeManagerTest.getStoreManager(page);
  });
});

test.describe('mail-manager', () => {
  test.use({ storageState: `${baseAuth}/${RoleType.ADMIN}.json` });

  test('mail manager', async () => {
    await mailManagerTest.getMailManager(page);
  });
});

test.describe('blog-manager', () => {
  test.use({ storageState: `${baseAuth}/${RoleType.ADMIN}.json` });

  test('blog manager', async () => {
    await blogManagerTest.getBlogManager(page);
  });
});

test.describe('contact-manager', () => {
  test.use({ storageState: `${baseAuth}/${RoleType.ADMIN}.json` });

  test('contact manager', async () => {
    await contactManagerTest.getContactManager(page);
  });
});

test.describe('role-manager', () => {
  test.use({ storageState: `${baseAuth}/${RoleType.ADMIN}.json` });

  test('role manager', async () => {
    await roleManagerTest.getRoleManager(page);
  });
  // test('create role', async () => {
  //   await roleManagerTest.createRole(page);
  // });
});

test.describe('system-log', () => {
  test.use({ storageState: `${baseAuth}/${RoleType.ADMIN}.json` });

  test('system log', async () => {
    await systemLogTest.getSystemLog(page);
  });
});

test.afterEach(async () => {
  await page.close();
});

// test.afterAll(async () => {
//   await new Promise(() => {});
// });
