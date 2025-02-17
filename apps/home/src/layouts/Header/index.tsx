import { faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Wallet } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { type Product } from 'shared';
import type { CustomDropdownMenuProps } from 'ui';
import { Button, CustomDropdownMenu } from 'ui';

import type { SidebarLink } from '@/constants';
import { roleAuthorization, RoleType, sidebarLinks } from '@/constants';
import type { Account } from '@/interfaces';
import { useAuthStore } from '@/store';

import { Notification } from './Notification';

type HeadProps = {
  listProduct: Product[];
  isPublic?: boolean;
  currentPage: string;
};

function convertToMenuGroup(menuHeader: Record<string, SidebarLink>) {
  const copiedMenuHeader = { ...menuHeader };
  const groups: { group: { element: JSX.Element }[] }[] = [];

  const allGroup: { element: JSX.Element }[] = [];
  Object.keys(copiedMenuHeader).forEach((url) => {
    const link = copiedMenuHeader[url];
    if (link && link.roles.includes(RoleType.All)) {
      allGroup.push({
        element: (
          <a href={url} className="w-full">
            {link.name}
          </a>
        ),
      });
      delete copiedMenuHeader[url];
    }
  });
  if (allGroup.length > 0) {
    groups.push({ group: allGroup });
  }

  const otherGroup: { element: JSX.Element }[] = Object.keys(copiedMenuHeader)
    .map((url) => {
      const link = copiedMenuHeader[url];
      if (link) {
        return {
          element: (
            <a href={url} className="w-full">
              {link.name}
            </a>
          ),
        };
      }

      return null;
    })
    .filter((link) => link !== null) as { element: JSX.Element }[];

  if (otherGroup.length > 0) {
    groups.push({ group: otherGroup });
  }

  const logoutGroup: { element: JSX.Element }[] = [];
  logoutGroup.push({
    element: (
      <a
        href="#"
        onClick={() => {
          useAuthStore.getState().logout();
          window.location.replace('/login');
        }}
        className="w-full"
      >
        Logout
      </a>
    ),
  });
  groups.push({ group: logoutGroup });

  return groups;
}

function convertToSidebarGroup(menuHeader: Record<string, SidebarLink>, isPublicState: boolean) {
  const copiedMenuHeader = { ...menuHeader };
  const groups: { group: { element: JSX.Element }[] }[] = [];

  const firstGroup: { element: JSX.Element }[] = [];
  if (isPublicState) {
    firstGroup.push({
      element: (
        <a href="/login" className="w-full">
          Login
        </a>
      ),
    });
  }
  // firstGroup.push({
  //   element: (
  //     <a href="/catalog" className="w-full">
  //       Catalog
  //     </a>
  //   ),
  // });
  firstGroup.push({
    element: (
      <a href="/products" className="w-full">
        Products
      </a>
    ),
  });
  if (!isPublicState) {
    firstGroup.push({
      element: (
        <a href="/orders" className="w-full">
          Orders
        </a>
      ),
    });
  }
  groups.push({ group: firstGroup });

  const allGroup: { element: JSX.Element }[] = [];
  Object.keys(copiedMenuHeader).forEach((url) => {
    const link = copiedMenuHeader[url];
    if (link && link.roles.includes(RoleType.All)) {
      allGroup.push({
        element: (
          <a href={url} className="w-full">
            {link.name}
          </a>
        ),
      });
      delete copiedMenuHeader[url];
    }
  });
  if (allGroup.length > 0) {
    groups.push({ group: allGroup });
  }

  const otherGroup: { element: JSX.Element }[] = Object.keys(copiedMenuHeader)
    .map((url) => {
      const link = copiedMenuHeader[url];
      if (link) {
        return {
          element: (
            <a href={url} className="w-full">
              {link.name}
            </a>
          ),
        };
      }

      return null;
    })
    .filter((link) => link !== null) as { element: JSX.Element }[];

  if (otherGroup.length > 0) {
    groups.push({ group: otherGroup });
  }

  if (!isPublicState) {
    const logoutGroup: { element: JSX.Element }[] = [];
    logoutGroup.push({
      element: (
        <a
          href="#"
          onClick={() => {
            useAuthStore.getState().logout();
            window.location.replace('/login');
          }}
          className="w-full"
        >
          Logout
        </a>
      ),
    });
    groups.push({ group: logoutGroup });
  }

  return groups;
}

const Header: React.FC<HeadProps> = (props) => {
  const { isPublic = false, currentPage = '/' } = props; // listProduct
  const [isPublicState, setIsPublicState] = useState(isPublic);
  const [menuHeader, setMenuHeader] = useState<Record<string, SidebarLink>>({});

  const menuGroups = convertToMenuGroup(menuHeader);
  const sidebarGroups = convertToSidebarGroup(menuHeader, isPublicState);

  // const [categoryFilterOptions, setCategoryFilterOptions] = useState<string[]>([]);
  const [myAccount, setMyAccount] = useState<Account>();

  const [menuOpen, setMenuOpen] = React.useState<boolean>(false);
  const userMenu: CustomDropdownMenuProps = {
    menuTrigger: <img className="w-[40px]" src="/assets/LOGO.png" />,
    menuGroup: menuGroups,
  };
  const handleBars = () => {
    setMenuOpen(!menuOpen);
  };

  const fetchDataUser = async () => {
    const authStorageItem = window.localStorage.getItem('auth-storage');

    if (authStorageItem) {
      const authData = JSON.parse(authStorageItem);

      if (!authData.state.isLoggedIn) {
        window.location.replace('/login');

        return;
      }

      setMyAccount(authData.state.user);
    } else {
      window.location.replace('/login');
    }

    // const result = await getMe();

    // if (!result?.success || !result.data) {
    //   toast.error(result.message);

    //   return;
    // }

    // setMyAccount(result.data);
    // useAuthStore.getState().setUser(result.data);
  };

  useEffect(() => {
    if (!isPublicState) {
      fetchDataUser();

      // const interval = setInterval(() => {
      //   fetchDataUser();
      // }, 10000);

      // return () => {
      //   clearInterval(interval);
      // };
    }

    return () => {};
  }, [isPublicState]);

  useEffect(() => {
    const authStorageItem = window.localStorage.getItem('auth-storage');

    if (authStorageItem) {
      const authData = JSON.parse(authStorageItem);

      if (authData.state.isLoggedIn) {
        setIsPublicState(false);

        const roleAuth = roleAuthorization.find((item) => currentPage.includes(item.route));
        if (!roleAuth) {
          window.location.replace('/my-account');

          return;
        }

        if (
          !roleAuth.roles.includes(RoleType.All) &&
          !roleAuth.roles.includes(authData.state.user.role) &&
          !(roleAuth.roles.length === 0)
        ) {
          window.location.replace('/my-account');

          return;
        }

        const sidebarRoleLinks: Record<string, SidebarLink> = {};

        Object.keys(sidebarLinks).forEach((link) => {
          const sidebarLink = sidebarLinks[link];
          if (sidebarLink) {
            if (
              sidebarLink.roles.includes(authData.state.user.role) ||
              sidebarLink.roles.includes(RoleType.All) ||
              sidebarLink.roles.length === 0
            ) {
              sidebarRoleLinks[link] = sidebarLink;
            }
          }
        });

        setMenuHeader(sidebarRoleLinks);
      }
    }
  }, []);

  // useEffect(() => {
  //   const getUniqueCategories = () => {
  //     const categorySet = new Set(listProduct?.map((product) => product?.category?.name));
  //     const uniqueCategories = Array.from(categorySet);
  //     setCategoryFilterOptions(uniqueCategories);
  //   };
  //   getUniqueCategories();
  // }, [listProduct]);

  return (
    <div className="fixed inset-x-0 top-0 z-50 items-center border-b border-gray-300 bg-white shadow-[0_1px_3px_-0px_rgba(0,0,0,0.04)]">
      <div className="flex h-[78px] w-full justify-center">
        <div className="flex h-full w-[1150px] items-center justify-between px-6 md:justify-between lg:justify-between">
          <div>
            <a className="flex items-center" href="/">
              <img className="w-[70px]" src="/assets/LOGO.png" />
              <p className="hidden text-[37px] font-normal leading-[5px] text-primary md:block">
                <img src="https://i.imgur.com/OyaV00i.png" className="h-[30px] w-[137px]" />
              </p>
            </a>
          </div>
          <div className="hidden md:block">
            {/* eslint-disable-next-line prettier/prettier */}
            {/* <div className="dsy-dropdown dsy-dropdown-hover static">
              <a href="/catalog">
                <Button
                  tabIndex={0}
                  className="items-center bg-white text-color hover:bg-transparent hover:text-primary md:px-1 lg:px-4 lg:py-2"
                >
                  Catalog
                  <span
                    className="ml-2 flex w-3 items-center transition-all duration-500 hover:rotate-180"
                    tabIndex={0}
                  >
                    <FontAwesomeIcon className="h-3 w-3" icon={faCaretDown} />
                  </span>
                </Button>
              </a>

              <div
                tabIndex={0}
                className="dsy-menu dsy-dropdown-content absolute left-0 top-[calc(100%-19px)] z-[1] h-auto w-full bg-transparent px-0 py-[19px]"
              >
                <MenuCatalog dataCatalog={categoryFilterOptions} />
              </div>
            </div> */}
            <a href="/products">
              <Button className="items-center bg-transparent text-color hover:bg-transparent hover:text-primary">
                Products
              </Button>
            </a>
            {!isPublicState && (
              <>
                <Button className="bg-white text-color hover:bg-transparent hover:text-primary md:px-1 lg:px-4 lg:py-2">
                  <a href="/orders">Orders</a>
                </Button>
                <Button className="bg-white text-color hover:bg-transparent hover:text-primary md:px-1 lg:px-4 lg:py-2">
                  <a href="/stores">Stores</a>
                </Button>
                <Button className="bg-white text-color hover:bg-transparent hover:text-primary md:px-1 lg:px-4 lg:py-2">
                  <a href="http://localhost:3000/">Blog</a>
                </Button>
              </>
            )}
          </div>

          <div className="hidden w-[238px] items-center justify-end md:flex md:justify-between">
            <div className="mr-2 flex items-center justify-center">
              <Wallet />{' '}
              <span className="ml-2 font-bold text-success">
                {' '}
                {myAccount?.balance?.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
                })}
              </span>
            </div>
            <Notification />
            <CustomDropdownMenu
              menuTrigger={
                <img
                  onClick={() => {
                    if (isPublicState) {
                      window.location.href = '/login';
                    }
                  }}
                  className="w-[40px]"
                  src="/assets/LOGO.png"
                />
              }
              labelMenu={
                <div>
                  <p> {myAccount?.fullName}</p>
                  <p> {myAccount?.email}</p>
                </div>
              }
              menuGroup={isPublicState ? [] : userMenu.menuGroup}
              contentProps={{ className: 'border-none hover:bg-transition min-w-[300px] max-w-full p-3' }}
            />
          </div>

          <button onClick={handleBars} className="block cursor-pointer md:hidden">
            <CustomDropdownMenu
              menuTrigger={<FontAwesomeIcon className="h-6 w-6" icon={faBars} />}
              menuGroup={sidebarGroups}
              contentProps={{
                className: 'border-none hover:bg-transition min-w-[300px] max-w-full p-3 max-h-[400px] overflow-auto',
              }}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export { Header };
