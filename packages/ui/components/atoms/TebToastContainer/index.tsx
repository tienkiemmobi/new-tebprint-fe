import { ToastContainer } from 'react-toastify';

const TebToastContainer = () => {
  return (
    <ToastContainer
      // className="mt-20"
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
    />
  );
};

export { TebToastContainer };
