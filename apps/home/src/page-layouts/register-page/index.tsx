import { EyeIcon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { GoogleReCaptcha, GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { toast, ToastContainer } from 'react-toastify';
import { Button, Input } from 'ui';

import { addUser } from '@/services';

const RegisterPage = () => {
  // Extract the ref code from the URL

  const [shouldShowPassword, setShouldShowPassword] = useState<boolean>(false);
  const [verifyReCaptcha, setVerifyReCaptcha] = useState('');
  const [refreshReCaptcha, setRefreshReCaptcha] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [refCode, setRefCode] = useState('');

  const handleLoginBtnClick = async () => {
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');

      return;
    }

    try {
      const loginResponse = await addUser({
        email,
        fullName,
        password,
        refCode,
        phone,
        // recaptchaToken: verifyReCaptcha,
      });
      if (!loginResponse.success || !loginResponse.data) {
        toast.error(loginResponse.message);

        return;
      }

      toast.success('Register success. Please login');

      window.location.replace('/login');
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

    const urlParams = new URLSearchParams(window.location.search);
    const refCodeFromUrl = urlParams.get('ref') || '';
    setRefCode(refCodeFromUrl);
  }, []);

  return (
    <>
      <div className="flex h-screen flex-col md:flex-row">
        <div className="flex items-baseline justify-center p-8 md:w-1/2 md:items-center lg:w-1/2 xl:basis-8/12">
          <div className="flex max-w-md flex-col items-center justify-center bg-white">
            <img src="/assets/LOGO.png" alt="TebPrint Logo" />
            <h1 className="text-center text-lg font-bold leading-6 tracking-tight text-color">TebPrint New Account</h1>
            <div className="mt-6 h-10 w-60 rounded-[4px] border border-[#DADCE0] bg-white"></div>
            <div className="py-4 text-lg font-normal text-color">or</div>

            <form>
              <div>
                <label className="text-sm font-bold leading-5">Full Name</label>
                <Input
                  type="text"
                  onChange={(e) => setFullName(e.target.value)}
                  id="fullName"
                  name="fullName"
                  placeholder="Enter your full name"
                />
              </div>
              <div className="mt-4">
                <label className="text-sm font-bold leading-5">Email</label>
                <Input
                  type="email"
                  onChange={(e) => setEmail(e.target.value)}
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                />
              </div>
              <div className="mt-4">
                <label className="text-sm font-bold leading-5">Phone</label>
                <Input
                  type="phone"
                  onChange={(e) => setPhone(e.target.value)}
                  id="phone"
                  name="phone"
                  placeholder="Enter your phone"
                />
              </div>
              <div className="mt-4">
                <label className="text-sm font-bold leading-5">Password</label>
                <div className="relative">
                  <Input
                    type={shouldShowPassword ? 'text' : 'password'}
                    onChange={(e) => setPassword(e.target.value)}
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                  />
                  <EyeIcon
                    onClick={() => setShouldShowPassword((prev) => !prev)}
                    className="absolute right-0 top-0 h-[38px] w-[38px] cursor-pointer px-2"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="text-sm font-bold leading-5">Confirm Password</label>
                <div className="relative">
                  <Input
                    type={shouldShowPassword ? 'text' : 'password'}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="text-sm font-bold leading-5">Referral Code (Optional)</label>
                <Input
                  type="text"
                  value={refCode}
                  onChange={(e) => setRefCode(e.target.value)}
                  id="refCode"
                  name="refCode"
                  placeholder="Enter referral code"
                  disabled={!!refCode}
                />
              </div>
              <div id="tebRecaptcha" className="mt-6 flex items-center justify-center md:mt-[24px] md:p-0">
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
              <Button
                className="mt-6 h-10 w-80 border-primary bg-primary text-center text-white hover:bg-[#e2d0a9]"
                type="button"
                onClick={() => handleLoginBtnClick()}
              >
                Sign Up
              </Button>
              <div>
                <p className="mt-14 text-center">
                  Already have an account?
                  <span className="px-2 text-primary">
                    <a href="/login">Login</a>
                  </span>
                </p>
              </div>
            </form>
          </div>
        </div>
        <div className="hidden h-screen w-full items-center justify-center md:flex md:w-1/2 xl:basis-4/12">
          <img src="/assets/images/loginPage.png" alt="Register Image" className="h-full w-screen" />
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export { RegisterPage };
