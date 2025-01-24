import { RoleType } from './roles';

type Keys = keyof typeof RoleType;
type Values = (typeof RoleType)[Keys];

export type SidebarLink = {
  roles: Values[];
  name: string;
};

const sidebarLinks: Record<string, SidebarLink> = {
  '/my-account': {
    name: 'My Account',
    roles: [RoleType.All],
  },
  '/payments': {
    name: 'Payments',
    roles: [RoleType.ADMIN, RoleType.ACCOUNTING],
  },
  '/my-artworks': {
    name: 'My Artworks',
    roles: [RoleType.ADMIN, RoleType.SELLER, RoleType.SUPPORT, RoleType.MANAGER, RoleType.DESIGNER],
  },
  '/my-mockups': {
    name: 'My Mockups',
    roles: [RoleType.ADMIN, RoleType.SELLER, RoleType.SUPPORT, RoleType.MANAGER, RoleType.DESIGNER],
  },
  '/stores': {
    name: 'Stores',
    roles: [RoleType.ADMIN, RoleType.SELLER, RoleType.SUPPORT],
  },
  '/orders': {
    name: 'Orders',
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
  '/products': {
    name: 'Products',
    roles: [],
  },
  '/admin-dashboard': {
    name: 'Admin Dashboard',
    roles: [RoleType.ADMIN],
  },
  '/user-manager': {
    name: 'User Manager',
    roles: [RoleType.ADMIN],
  },
  '/product-manager': {
    name: 'Product Manager',
    roles: [RoleType.ADMIN, RoleType.MANAGER, RoleType.PRODUCT_MANAGER],
  },
  '/category-manager': {
    name: 'Category Manager',
    roles: [RoleType.ADMIN, RoleType.MANAGER, RoleType.PRODUCT_MANAGER],
  },
  '/store-manager': {
    name: 'Store Manager',
    roles: [RoleType.ADMIN, RoleType.MANAGER],
  },
  '/mail-manager': {
    name: 'Mail Manager',
    roles: [RoleType.ADMIN, RoleType.MANAGER],
  },
  '/blog-manager': {
    name: 'Blog Manager',
    roles: [RoleType.ADMIN, RoleType.MANAGER],
  },
  '/contact-manager': {
    name: 'Contact Manager',
    roles: [RoleType.ADMIN, RoleType.MANAGER, RoleType.ACCOUNTING],
  },
  '/role-manager': {
    name: 'Role Manager',
    roles: [RoleType.ADMIN],
  },
  '/factory-manager': {
    name: 'Factory Manager',
    roles: [RoleType.ADMIN],
  },
  '/system-logs': {
    name: 'System Logs',
    roles: [RoleType.ADMIN],
  },
};

export { sidebarLinks };
