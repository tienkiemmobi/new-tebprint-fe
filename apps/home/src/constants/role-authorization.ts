import { RoleType } from './roles';

export type RoleAuthorization = {
  route: string;
  roles: RoleType[];
};

export const roleAuthorization: RoleAuthorization[] = [
  { route: '/admin-dashboard', roles: [RoleType.ADMIN] },

  { route: '/blog-manager', roles: [RoleType.ADMIN] },
  { route: '/blogs', roles: [] },

  { route: '/catalog', roles: [] },

  { route: '/category-manager', roles: [RoleType.ADMIN, RoleType.MANAGER, RoleType.PRODUCT_MANAGER] },

  { route: '/contact-manager', roles: [RoleType.ADMIN, RoleType.MANAGER, RoleType.ACCOUNTING] },

  { route: '/create-order', roles: [RoleType.SELLER] },
  { route: '/orders/import', roles: [RoleType.SELLER] },
  {
    route: '/orders',
    roles: [
      RoleType.ADMIN,
      RoleType.WAREHOUSE,
      RoleType.SELLER,
      RoleType.SUPPORT,
      RoleType.REFERER,
      RoleType.MANAGER,
      RoleType.DESIGNER,
    ],
  },

  { route: '/edit-product', roles: [RoleType.ADMIN, RoleType.MANAGER, RoleType.PRODUCT_MANAGER] },
  { route: '/product', roles: [] },
  { route: '/products', roles: [] },
  { route: '/product-manager', roles: [RoleType.ADMIN, RoleType.MANAGER, RoleType.PRODUCT_MANAGER] },

  { route: '/help-center', roles: [] },

  { route: '/login', roles: [] },

  { route: '/mail-manager', roles: [RoleType.ADMIN] },

  {
    route: '/my-artworks',
    roles: [RoleType.ADMIN, RoleType.SELLER, RoleType.SUPPORT, RoleType.MANAGER, RoleType.DESIGNER],
  },
  {
    route: '/my-mockups',
    roles: [RoleType.ADMIN, RoleType.SELLER, RoleType.SUPPORT, RoleType.MANAGER, RoleType.DESIGNER],
  },

  { route: '/payments', roles: [RoleType.ADMIN, RoleType.ACCOUNTING] },

  { route: '/roles-manager', roles: [RoleType.ADMIN] },
  {
    route: '/settings',
    roles: [RoleType.All],
  },
  { route: '/store-manager', roles: [RoleType.ADMIN] },
  { route: '/stores', roles: [RoleType.ADMIN, RoleType.SELLER, RoleType.SUPPORT] },

  {
    route: '/my-account',
    roles: [RoleType.All],
  },
  { route: '/user-manager', roles: [RoleType.ADMIN] },

  { route: '/404', roles: [] },

  { route: '/', roles: [] },
];
