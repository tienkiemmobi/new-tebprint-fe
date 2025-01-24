import { EyeIcon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { GoogleReCaptcha, GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { toast, ToastContainer } from 'react-toastify';
import { Button, Input } from 'ui';

import { userService } from '@/services';
import { useAuthStore } from '@/store';

const LoginPage = () => {
  const [shouldShowPassword, setShouldShowPassword] = useState<boolean>(false);
  const [verifyReCaptcha, setVerifyReCaptcha] = useState<string>('');
  const [refreshReCaptcha, setRefreshReCaptcha] = useState(false);

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleLoginBtnClick = async () => {
    try {
      const loginResponse = await userService.login(email, password, verifyReCaptcha);
      if (!loginResponse.success || !loginResponse.data) {
        toast.error(loginResponse.message);

        return;
      }
      const { accessToken, user } = loginResponse.data;

      useAuthStore.getState().login(accessToken, user);
      window.location.replace('/orders');
      // redirect();
    } catch (err) {
      toast.error('Server error');
    }
    setRefreshReCaptcha((r) => !r);
  };

  const handleReCaptchaVerify = useCallback((token: string) => {
    setVerifyReCaptcha(token);
  }, []);

  useEffect(() => {
    const authStorageItem = window.localStorage.getItem('auth-storage');
    if (authStorageItem) {
      const authData = JSON.parse(authStorageItem);

      if (authData.state.isLoggedIn) {
        window.location.replace('/orders');
      }
    }
  }, []);

  return (
    <>
      <div className="flex h-screen flex-col md:flex-row">
        <div className="flex items-baseline justify-center p-8 md:w-1/2 md:items-center lg:w-1/2 xl:basis-8/12">
          <div className="flex max-w-md flex-col items-center justify-center bg-white">
            <img src="/assets/LOGO.png" />
            <h1 className="text-center text-lg font-bold leading-6 tracking-tight text-color">TebPrint Welcome back</h1>
            <div className="mt-6 h-10 w-60 rounded-[4px] border border-[#DADCE0] bg-white"></div>
            <div className="py-4 text-lg font-normal text-color">or</div>

            <form>
              <div>
                <label className="text-sm font-bold leading-5">Email</label>
                <Input type="email" onChange={(e) => setEmail(e.target.value)} id="email" name="email" />
              </div>
              <div className="py-6">
                <label className="text-sm font-bold leading-5">Password</label>
                <div className="relative">
                  <Input
                    type={shouldShowPassword ? 'text' : 'password'}
                    onChange={(e) => setPassword(e.target.value)}
                    id="password"
                    name="password"
                  />
                  <EyeIcon
                    onClick={() => setShouldShowPassword((prev) => !prev)}
                    className="absolute right-0 top-0 h-[38px] w-[38px] px-2"
                  />
                </div>
                <div id="tebRecaptcha" className="mt-2 flex items-center justify-center md:mt-[24px] md:p-0">
                  <div>
                    <GoogleReCaptchaProvider
                      reCaptchaKey={`${import.meta.env.PUBLIC_RECAPTCHA_SITE_KEY}`}
                      container={{
                        element: '#tebRecaptcha',
                        parameters: {
                          badge: 'inline',
                          theme: 'dark',
                        },
                      }}
                    >
                      <GoogleReCaptcha onVerify={handleReCaptchaVerify} refreshReCaptcha={refreshReCaptcha} />
                    </GoogleReCaptchaProvider>
                  </div>
                </div>
              </div>
              <Button
                className="mt-6 h-10 w-80 border-primary bg-primary text-center text-white hover:bg-[#e2d0a9]"
                type="button"
                onClick={() => handleLoginBtnClick()}
              >
                Login
              </Button>
              <p className="mt-4 text-primary">
                <a href="/forgot-password">Forgot password?</a>
              </p>
              <div>
                <p className="mt-14 text-center">
                  New to TebPrint?
                  <span className="px-2 text-primary">
                    <a href="/register">Sign Up</a>
                  </span>
                </p>
              </div>
            </form>
          </div>
        </div>
        <div className="hidden h-screen w-full items-center justify-center md:flex md:w-1/2 xl:basis-4/12">
          <img src="/assets/images/loginPage.png" alt="Login Image" className="h-full w-screen" />
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export { LoginPage };
