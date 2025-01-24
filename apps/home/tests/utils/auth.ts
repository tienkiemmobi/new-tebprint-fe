import { RoleType } from '@/constants';

export type Auth = {
  role: RoleType;
  username: string;
  password: string;
};

export const auths: Auth[] = [
  { role: RoleType.ADMIN, username: 'admin@tebprint.com', password: 'Rd1^b3S&8Y%XsGj1' },
  { role: RoleType.SELLER, username: 'seller@tebprint.com', password: 'Rd1^b3S&8Y%XsGj1' },
];
