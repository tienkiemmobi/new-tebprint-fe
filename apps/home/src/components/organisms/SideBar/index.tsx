import { useEffect, useState } from 'react';
import { Skeleton } from 'ui';

import type { SidebarLink } from '@/constants';
import { RoleType, sidebarLinks } from '@/constants';

type SidebarSettingProps = {
  currentPage?: string;
};

const convertToSideBars = (sideBars: Record<string, SidebarLink>) => {
  const sideBarsArray = Object.keys(sideBars).map((href) => ({
    href,
    label: sideBars && sideBars[href]?.name.trim(),
  }));

  return sideBarsArray;
};
const SidebarSetting = (props: SidebarSettingProps) => {
  const { currentPage = '' } = props;
  const [sideBars, setSideBars] = useState<Record<string, SidebarLink>>({});

  useEffect(() => {
    const authStorageItem = window.localStorage.getItem('auth-storage');

    if (authStorageItem) {
      const authData = JSON.parse(authStorageItem);

      if (authData.state.isLoggedIn) {
        const links = Object.keys(sidebarLinks)
          .filter(
            (link: string) =>
              sidebarLinks[link]?.roles?.includes(authData.state.user.role) ||
              sidebarLinks[link]?.roles?.includes(RoleType.All) ||
              sidebarLinks[link]?.roles?.length === 0,
          )
          .reduce(
            (filteredLinks, link) => {
              const sidebarLink = sidebarLinks[link];
              if (sidebarLink) {
                filteredLinks[link] = sidebarLink;
              }

              return filteredLinks;
            },
            {} as Record<string, SidebarLink>,
          );
        setSideBars(links);
      }
    }
  }, []);

  const sidebarContent = convertToSideBars(sideBars);

  return (
    // <div className="h-screen w-screen bg-white dark:bg-slate-900">
    <aside
      id="sidebar"
      className="fixed bottom-0 left-0 top-[78px] hidden w-64 overflow-y-auto transition-transform lg:block"
      aria-label="Sidebar"
    >
      <div className="flex h-full flex-col overflow-y-auto border-r border-slate-200 bg-white px-3 py-4 dark:border-slate-700 dark:bg-slate-900">
        {/* <div className="mb-10 flex items-center rounded-lg px-3 py-2 text-slate-900 dark:text-white">
          <Settings className="h-5 w-5" />
          <span className="ml-3 text-base font-semibold">Taxonomy</span>
        </div> */}
        <ul className="space-y-2 text-sm font-medium">
          {sidebarContent.length === 0 ? (
            <>
              {Object.keys(sidebarLinks).map((key) => (
                <Skeleton key={key} className="h-[36px] w-[231px] rounded-[8px]" />
              ))}
            </>
          ) : (
            <>
              {sidebarContent.map((item) => {
                return (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className={`flex items-center rounded-lg px-3 py-2 text-slate-900 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-700 ${
                        currentPage.includes(item.href) ? '!bg-primary !text-white' : ''
                      }`}
                    >
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </>
          )}
        </ul>
        {/* <div className="mt-auto flex">
          <div className="flex w-full justify-between">
            <span className="text-sm font-medium text-black dark:text-white">email@example.com</span>
            <Settings className="h-5 w-5" />
          </div>
        </div> */}
      </div>
    </aside>
    // </div>
  );
};

export { SidebarSetting };
