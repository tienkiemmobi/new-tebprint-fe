import { Bell, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { NotificationDropdown } from '@/components';
import type { AllNotificationsDto } from '@/interfaces';
import { notificationService } from '@/services';

type NotificationState = {
  count?: number;
  isOpen: boolean;
  notifications: AllNotificationsDto[];
};

const Notification = () => {
  const [notificationState, setNotificationState] = useState<NotificationState>({
    isOpen: false,
    notifications: [],
  });

  const fetchAllNotifications = async () => {
    const myNotificationResponse = await notificationService.getNotifications();
    if (!myNotificationResponse.success || !myNotificationResponse.data) {
      toast.error(myNotificationResponse.message);

      return;
    }
    setNotificationState((pre) => ({
      ...pre,
      count: myNotificationResponse.total,
      notifications: myNotificationResponse.data,
    }));
  };

  const handleClickNotification = async (notificationId: string) => {
    window.localStorage.setItem('teb-notification', notificationId);
    window.location.replace('/notification');
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setNotificationState((pre) => ({ ...pre, isOpen: false }));
    };

    fetchAllNotifications();
    window.addEventListener('click', handleClickOutside);

    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative mr-2 cursor-pointer" onClick={(e) => e.stopPropagation()}>
      <div onClick={() => setNotificationState((pre) => ({ ...pre, isOpen: !pre.isOpen }))}>
        <Bell />
        <div className="absolute right-[-14px] top-[-10px] flex min-h-[24px] min-w-[24px] items-center justify-center rounded bg-primary font-medium text-white">
          {notificationState.count || notificationState.count === 0 ? (
            <>{notificationState.count}</>
          ) : (
            <div className="flex justify-center">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          )}
        </div>
      </div>
      <div
        className={`absolute right-[-19px] top-[52px] z-10 max-h-[80vh] w-[420px] cursor-default rounded-b-[10px] border border-[#ccc] bg-white shadow-lg ${
          !notificationState.isOpen && 'hidden'
        }`}
      >
        <div className="flex justify-between p-4 pb-2 text-left">
          <strong className="inline-block">Notifications</strong>
          <div className="flex items-center"></div>
        </div>
        <NotificationDropdown
          notifications={notificationState.notifications}
          handleClickNotification={handleClickNotification}
        />
      </div>
    </div>
  );
};

export { Notification };
