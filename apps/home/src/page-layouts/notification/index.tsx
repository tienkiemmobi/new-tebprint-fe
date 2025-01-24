import { ChevronLeft, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { TebToastContainer } from 'ui';

import { NotificationDropdown } from '@/components';
import type { AllNotificationsDto, Notification, NotificationTabType } from '@/interfaces';
import { notificationService } from '@/services';

const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  };

  const date = new Date(dateString);
  const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);

  return formattedDate;
};

type NotificationState = {
  activeTab: NotificationTabType;
  notifications: AllNotificationsDto[];
  notificationDetail?: Notification;
};

const MyNotification = () => {
  const [notificationState, setNotificationState] = useState<NotificationState>({
    activeTab: 'all',
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
      notifications: myNotificationResponse.data,
    }));
  };

  const handleFetchNotificationDetail = async (notificationId: string) => {
    setNotificationState((pre) => ({
      ...pre,
      notificationDetail: undefined,
    }));
    const myNotificationDetailResponse = await notificationService.getNotificationDetail(notificationId);
    if (!myNotificationDetailResponse.success || !myNotificationDetailResponse.data) {
      toast.error(myNotificationDetailResponse.message);

      return;
    }
    setNotificationState((pre) => ({
      ...pre,
      notificationDetail: myNotificationDetailResponse.data,
    }));
  };

  const handleFetchFromLocalStorage = async () => {
    try {
      const notificationId = window.localStorage.getItem('teb-notification') as string;

      if (notificationId) {
        await handleFetchNotificationDetail(notificationId);
        window.localStorage.removeItem('teb-notification');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
      toast.error('something went wrong');
    }
  };

  const handleFilterNotification = (_type: NotificationTabType) => {
    // fetch by type
  };

  const handleRemoveNotificationDetail = () => {
    setNotificationState((pre) => ({
      ...pre,
      notificationDetail: undefined,
    }));
  };

  useEffect(() => {
    fetchAllNotifications();
    handleFetchFromLocalStorage();
  }, []);

  return (
    <div className="w-full p-4">
      <div className="mx-auto w-full">
        <h2 className="text-[1.75rem] font-bold leading-10 md:text-[2rem]">Notifications</h2>

        <div className="mt-6 flex w-full">
          <div className="hidden flex-1 lg:block">
            <NotificationDropdown
              notifications={notificationState.notifications}
              handleClickNotification={handleFetchNotificationDetail}
              handleFilterNotification={handleFilterNotification}
              isPopup={false}
            />
          </div>
          <div className="h-[670px] flex-1 overflow-y-auto border-l border-[#ccc] bg-[#f7f7f7] px-6">
            {notificationState.notificationDetail ? (
              <>
                <div
                  className="flex cursor-pointer items-center gap-1 pb-4 text-[#23527c] lg:hidden"
                  onClick={handleRemoveNotificationDetail}
                >
                  <ChevronLeft />
                  Back to Notifications
                </div>
                <div className="flex justify-between text-sm text-[#555]">
                  <span>{formatDate(notificationState.notificationDetail.updatedAt)}</span>
                  <Mail />
                </div>
                <hr className="mb-2 mt-1 border-t border-[#eee]" />
                <div>{notificationState.notificationDetail.content}</div>
              </>
            ) : (
              <>
                <div className="hidden h-full flex-col justify-center text-center lg:flex">
                  <img
                    src="https://static.cdn.printful.com/static/v864/images/dashboard/notifications/envelope.svg"
                    alt=""
                    className="mx-auto pb-8 align-middle"
                    width={102}
                  />
                  <h5 className="font-bold">Select a notification to open it</h5>
                </div>
                <div className="flex-1 lg:hidden">
                  <NotificationDropdown
                    notifications={notificationState.notifications}
                    handleClickNotification={handleFetchNotificationDetail}
                    handleFilterNotification={handleFilterNotification}
                    isPopup={false}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <TebToastContainer />
    </div>
  );
};

export { MyNotification };
