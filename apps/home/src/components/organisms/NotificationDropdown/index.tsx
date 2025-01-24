import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from 'ui';

import type { AllNotificationsDto, NotificationTab, NotificationTabType } from '@/interfaces';
import { notificationService } from '@/services';

type NotificationDropdownState = {
  activeTab: NotificationTabType;
};

const notificationTabs: NotificationTab[] = [
  { value: 'all', label: 'All' },
  { value: 'order', label: 'Order' },
  { value: 'system', label: 'System' },
  { value: 'account', label: 'Account' },
];

type NotificationDropdownProps = {
  notifications: AllNotificationsDto[];
  isPopup?: boolean;
  handleClickNotification?: (notificationId: string) => void | Promise<void>;
  handleFilterNotification?: (type: NotificationTabType) => void;
};

const NotificationDropdown = ({
  notifications,
  handleClickNotification,
  isPopup = true,
}: NotificationDropdownProps) => {
  const [notificationDropdownState, setNotificationDropdownState] = useState<NotificationDropdownState>({
    activeTab: 'all',
  });

  const handleMarkReadAll = async () => {
    await notificationService.readAllNotification();
  };

  return (
    <>
      <Tabs
        value={notificationDropdownState.activeTab}
        onValueChange={(value) => {
          setNotificationDropdownState((pre) => ({ ...pre, activeTab: value as NotificationTabType }));
        }}
        className="relative mt-2 overflow-x-auto bg-transparent px-4"
      >
        <TabsList className="no-scrollbar mb-0 w-full overflow-y-hidden bg-transparent pb-3">
          {notificationTabs.map((tabs) => (
            <TabsTrigger className="w-fit bg-transparent" value={tabs.value} key={tabs.value}>
              {tabs.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className={`${isPopup ? 'max-h-56' : ''} overflow-y-auto p-4`}>
        {notifications.length === 0 ? (
          <div className="text-center text-base font-normal leading-6">
            <img
              src="https://static.cdn.printful.com/static/v864/images/dashboard/notifications/bell.svg"
              alt="Inbox"
              width="102"
              className="mx-auto pb-4 align-middle"
            />
            <p className="pb-1 font-bold">No notifications to view</p>
            <p>We’ll let you know when you get one</p>
          </div>
        ) : (
          <>
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className="cursor-pointer px-1 py-2 text-[#333] hover:bg-[#f3f3f3]"
                onClick={() => {
                  if (handleClickNotification) handleClickNotification(notification._id);
                }}
              >
                {notification.title}
              </div>
            ))}
          </>
        )}
      </div>
      {isPopup && (
        <div className="flex justify-between rounded-b-[10px] border-t border-[#ccc] p-4 text-[14px] text-[#1164a9] lg:py-3">
          <a href="/notification" className="hover:underline">
            See all notifications
          </a>
          <a href="#" className="hover:underline" onClick={handleMarkReadAll}>
            Mark all as read
          </a>
        </div>
      )}
    </>
  );
};

export { NotificationDropdown };
