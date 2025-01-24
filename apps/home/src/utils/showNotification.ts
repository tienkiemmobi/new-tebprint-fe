import type { ToastOptions } from 'react-toastify';
import { toast } from 'react-toastify';
import type { Response } from 'shared';

const showNotification = <T extends Response | null>(result: T, messageErr?: string, messageSuccess?: string) => {
  const options: ToastOptions = {
    position: 'top-right',
  };

  if (!result) {
    return toast.error(`${messageErr}. Try again!`, options);
  }

  return toast.success(`${messageSuccess}!`, options);
};

export default showNotification;
