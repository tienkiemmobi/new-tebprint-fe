import { zodResolver } from '@hookform/resolvers/zod';
import { EyeIcon } from 'lucide-react';
import QRCode from 'qrcode.react';
import { useCallback, useEffect, useState } from 'react';
import { GoogleReCaptcha, GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import type { ChangePasswordDto } from 'shared';
import { ChangePasswordSchema } from 'shared';
import {
  AccountDetailIcon,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from 'ui';
import { z } from 'zod';

import type { MeDto } from '@/interfaces';
import { myAccountService } from '@/services';
import { useAuthStore } from '@/store';

const twoFactorAuthSchema = z.object({
  otp: z.string().trim().min(1, { message: 'Authentication code is required' }),
  password: z.string().trim().min(6, { message: 'Password code is required' }),
});

export type TwoFactorAuthDto = z.infer<typeof twoFactorAuthSchema>;

const UpdateUserSchema = z.object({
  fullName: z.string().trim().min(1, { message: 'Full name is required' }).max(40),
  email: z.string().email().min(1, { message: 'Email is required' }).max(30),
  // .refine((value) => value.endsWith('@tebprint.com'), {
  //   message: 'Email must have the domain @tebprint.com',
  // }),
  phone: z
    .string()
    .regex(/^\d+$/, { message: 'Invalid phone number' })
    .min(1, { message: 'Phone is required' })
    .max(15, { message: 'Invalid phone number' })
    .optional(),
  address: z.string().trim().optional(),
  gender: z.string().trim().min(1, { message: 'Gender is required, Please select an gender to display' }).optional(),
});

export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;

const NotificationSettingsSchema = z.object({
  isEnabled: z.boolean(),
  channelId: z.string().optional(),
  botToken: z.string().optional(),
});

export type NotificationSettingUserDto = z.infer<typeof NotificationSettingsSchema>;

const defaultValues = {
  otp: '',
  password: '',
};

const defaultPasswordValues = {
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: '',
};

const MyAccount = () => {
  const [user] = useState<MeDto | null>(useAuthStore.getState().user);
  const [isShowChangePassword, setIsShowChangePassword] = useState<boolean>(false);
  const [secret, setSecret] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isPasswordChangeDialogOpen, setIsPasswordChangeDialogOpen] = useState(false);
  const [refreshReCaptcha, setRefreshReCaptcha] = useState(false);
  const [verifyReCaptcha, setVerifyReCaptcha] = useState<string>('');
  const [passwordsVisibility, setPasswordsVisibility] = useState<Record<string, boolean>>({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  useEffect(() => {
    if (!user) {
      window.location.replace('/login');
    }
  }, []);

  let formUpdate = useForm<UpdateUserDto>({
    resolver: zodResolver(UpdateUserSchema),
    mode: 'all',
  });

  if (user) {
    formUpdate = useForm<UpdateUserDto>({
      resolver: zodResolver(UpdateUserSchema),
      defaultValues: {
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
      },
      mode: 'all',
    });
  }

  const formNotificationSettings = useForm<NotificationSettingUserDto>({
    resolver: zodResolver(NotificationSettingsSchema),
    defaultValues: {
      isEnabled: false,
      channelId: '',
      botToken: '',
    },
    mode: 'all',
  });

  const form = useForm<ChangePasswordDto>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: defaultPasswordValues,
    mode: 'all',
  });

  const handleUpdateAccount = async (data: UpdateUserDto) => {
    const updateMyAccountResponse = await myAccountService.UpdateUserInfo(data);
    if (!updateMyAccountResponse.success || !updateMyAccountResponse.data) {
      toast.error(updateMyAccountResponse.message);

      return;
    }

    form.reset();
    setIsPasswordChangeDialogOpen(false);
    toast.success('Update account successfully');
  };

  const handleChangePassword = async (data: ChangePasswordDto) => {
    const changePasswordResponse = await myAccountService.requestPasswordChange(data);
    if (!changePasswordResponse.success || !changePasswordResponse.data) {
      toast.error(changePasswordResponse.message);

      return;
    }

    form.reset();
    setIsPasswordChangeDialogOpen(false);
    toast.success('Update password successfully');
  };

  const formTwoFactorAuth = useForm<TwoFactorAuthDto>({
    resolver: zodResolver(twoFactorAuthSchema),
    defaultValues,
    mode: 'all',
  });

  const handleOpenDialog2faSecret = async () => {
    setIsDialogOpen(true);

    const get2faSecretResponse = await myAccountService.get2faSecret();
    if (!get2faSecretResponse.success || !get2faSecretResponse.data) {
      toast.error(get2faSecretResponse.message);

      return;
    }
    setSecret(get2faSecretResponse.data);
  };

  const handleReCaptchaVerify = useCallback(
    (token: string) => {
      setVerifyReCaptcha(token);
    },
    [refreshReCaptcha],
  );

  const onSubmitTwoFactorAuth = async (data: TwoFactorAuthDto) => {
    setRefreshReCaptcha((r) => !r);
    const newTwoFactorAuthPayload = { ...data, recaptchaToken: verifyReCaptcha };
    const verify2FaOtpResponse = await myAccountService.verify2FaOtp(newTwoFactorAuthPayload);
    if (!verify2FaOtpResponse.success || !verify2FaOtpResponse.data) {
      toast.error(verify2FaOtpResponse.message);

      return;
    }

    setIsDialogOpen(false);
    toast.success('Verify 2FA OTP successfully');
  };

  const handleUpdateNotificationSettings = async (data: NotificationSettingUserDto) => {
    const updateNotificationSettingsResponse = await myAccountService.notificationSettings(data);
    if (!updateNotificationSettingsResponse.success || !updateNotificationSettingsResponse.data) {
      toast.error(updateNotificationSettingsResponse.message);

      return;
    }
    toast.success('Update notification settings successfully');
  };

  const handleGetNotification = async () => {
    const notificationSettingsResponse = await myAccountService.getNotificationSetting();
    if (!notificationSettingsResponse.success || !notificationSettingsResponse.data) {
      toast.error(notificationSettingsResponse.message);

      return;
    }
    formNotificationSettings.reset({
      isEnabled: notificationSettingsResponse.data.isEnabled,
      channelId: notificationSettingsResponse.data.channelId,
      botToken: notificationSettingsResponse.data.botToken,
    });
  };

  const togglePasswordVisibility = (field: string) => {
    setPasswordsVisibility((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  useEffect(() => {
    if (isShowChangePassword) {
      setIsPasswordChangeDialogOpen(true);
    }
  }, [isShowChangePassword]);

  useEffect(() => {
    const currentURL = window.location.href;
    const url = new URL(currentURL);

    const action = url.searchParams.get('action');
    if (action === 'change-password') {
      setIsShowChangePassword(true);
    }
    const userGender = useAuthStore.getState().user?.gender;
    formUpdate.setValue('gender', userGender);
  }, []);

  return (
    <div className="w-full p-4">
      <div className="flex rounded-[5px] border bg-white px-6 py-4 shadow-md">
        <h2 className="mr-8 flex-1 text-3xl font-bold leading-10 tracking-tighter">My Account</h2>
      </div>
      <div className="mt-6 rounded-sm border bg-white shadow-md">
        <div className="pt-6">
          <div className="flex p-2 pr-6">
            <div className="col-span-1 hidden p-4 md:block">
              <AccountDetailIcon />
            </div>

            <div className="w-full">
              <h6 className="mt-2 text-xl font-bold">Contact details</h6>
              <Form {...formUpdate}>
                <div className="mt-4 grid grid-cols-1">
                  <FormField
                    control={formUpdate.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem className="mt-2">
                        <FormLabel>
                          Full Name
                          {!UpdateUserSchema.shape[field.name].isOptional() && (
                            <span className="text-destructive"> *</span>
                          )}
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Full Name" className="w-full" {...field} />
                        </FormControl>
                        <div>
                          <FormLabel className="text-right"></FormLabel>
                          <FormMessage className="col-span-3" />
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={formUpdate.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="mt-2">
                        <FormLabel>
                          Email
                          {!UpdateUserSchema.shape[field.name].isOptional() && (
                            <span className="text-destructive"> *</span>
                          )}
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Email" className="mt-2 w-full" {...field} />
                        </FormControl>
                        <div>
                          <FormLabel className="text-right"></FormLabel>
                          <FormMessage className="col-span-3" />
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={formUpdate.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem className="mt-2">
                        <FormLabel className="mb-1 line-clamp-1 text-sm font-normal leading-5 text-[#485256]">
                          Gender
                          {!UpdateUserSchema.shape[field.name].isOptional() && (
                            <span className="text-destructive"> *</span>
                          )}
                        </FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue defaultValue={field.value} placeholder="Gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                        <div>
                          <FormLabel className="text-right"></FormLabel>
                          <FormMessage className="col-span-3" />
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={formUpdate.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="mt-2">
                        <FormLabel>
                          Phone
                          {!UpdateUserSchema.shape[field.name].isOptional() && (
                            <span className="text-destructive"> *</span>
                          )}
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Phone" className="w-full" {...field} />
                        </FormControl>
                        <div>
                          <FormLabel className="text-right"></FormLabel>
                          <FormMessage className="col-span-3" />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                <h6 className="mt-8 text-xl font-bold">Address</h6>
                <p className="mt-2 text-base text-[#686F71]">This information will appear on your invoices</p>
                <div className="mt-4 grid grid-cols-1">
                  <FormField
                    control={formUpdate.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Address
                          {!UpdateUserSchema.shape[field.name].isOptional() && (
                            <span className="text-destructive"> *</span>
                          )}
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Address" className="w-full" {...field} />
                        </FormControl>
                        <div>
                          <FormLabel className="text-right"></FormLabel>
                          <FormMessage className="col-span-3" />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid justify-end">
                  <Button
                    type="submit"
                    className="w-[127px] rounded-[5px] border bg-primary p-2 text-white hover:bg-primary hover:text-white disabled:opacity-60"
                    onClick={formUpdate.handleSubmit(handleUpdateAccount)}
                  >
                    <span className="text-base text-white">Submit</span>
                  </Button>
                </div>
              </Form>
              <div className="my-6 grid grid-cols-1">
                <h2 className="mt-2 text-xl font-bold">Security Settings</h2>
              </div>
              <div className="block w-full justify-end py-6 md:flex">
                <div className="flex w-full items-center justify-end gap-3 md:w-full">
                  <div className="w-full">
                    <Dialog
                      open={isDialogOpen}
                      onOpenChange={(value: boolean) => {
                        if (!value) {
                          formTwoFactorAuth.reset();
                          setSecret('');
                        }
                        setIsDialogOpen(value);
                      }}
                    >
                      <DialogTrigger
                        disabled={user?.twoFactorEnabled}
                        onClick={handleOpenDialog2faSecret}
                        className="w-full rounded-[5px] border bg-primary p-2 text-base text-white hover:bg-primary hover:text-white disabled:opacity-60"
                      >
                        Set Up App
                      </DialogTrigger>
                      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
                        <DialogHeader className="hidden md:block">
                          <DialogTitle>Settings: Security</DialogTitle>
                          <DialogDescription>
                            After you've enabled two-factor authentication with an app, you'll be asked to provide a
                            security code from the app every time you sign into TebPrint.
                          </DialogDescription>
                        </DialogHeader>
                        <Form {...formTwoFactorAuth}>
                          <div>
                            <div className="mt-2 flex items-center md:mt-[24px]">
                              <div className="hidden w-1/4 px-4 md:block">
                                <div className="relative h-9 w-9 rounded-full border-[3px] border-solid bg-white text-[15px] font-bold text-color before:absolute before:right-[11px] before:top-[4px] before:content-['1']"></div>
                              </div>
                              <div className="w-full px-4 md:w-3/4">
                                <p>
                                  Install an authenticator app (e.g. Google Authenticator) on your mobile device if you
                                  don't already have one
                                </p>
                              </div>
                            </div>
                            <div className="mt-2 flex items-center md:mt-[24px]">
                              <div className="hidden w-1/4 px-4 md:block">
                                <div className="relative h-9 w-9 rounded-full border-[3px] border-solid bg-white text-[15px] font-bold text-color before:absolute before:right-[11px] before:top-[4px] before:content-['2']"></div>
                              </div>
                              <div className="w-full px-4 md:w-3/4">
                                <p>
                                  Open the app on your device, scan the QR code below, and enter the code generated by
                                  the app.
                                </p>
                                <div className="flex justify-center md:block">
                                  {secret && <QRCode style={{ height: 168, width: 168 }} value={secret} />}
                                </div>
                                <p className="mt-1">
                                  <small>
                                    {' '}
                                    Secret code: <code className="text-[#e02b28]">{secret}</code>
                                  </small>
                                </p>

                                <FormField
                                  control={formTwoFactorAuth.control}
                                  name="otp"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input
                                          className="mt-3"
                                          type="text"
                                          {...field}
                                          placeholder="Enter code from 2FA app"
                                        ></Input>
                                      </FormControl>
                                      <div>
                                        <FormLabel className="text-right"></FormLabel>
                                        <FormMessage className="col-span-3" />
                                      </div>
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                            <div className="mt-2 flex items-center md:mt-[24px]">
                              <div className="hidden w-1/4 px-4 md:block">
                                <div className="relative h-9 w-9 rounded-full border-[3px] border-solid bg-white text-[15px] font-bold text-color before:absolute before:right-[11px] before:top-[4px] before:content-['3']"></div>
                              </div>

                              <div className="w-full px-4 md:w-3/4">
                                <FormField
                                  control={formTwoFactorAuth.control}
                                  name="password"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <div>
                                          <label>Your password:</label>
                                          <Input className="mt-3" type="password" {...field}></Input>
                                        </div>
                                      </FormControl>
                                      <div>
                                        <FormLabel className="text-right"></FormLabel>
                                        <FormMessage className="col-span-3" />
                                      </div>
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                            <div
                              id="tebRecaptcha"
                              className="mt-2 flex items-center justify-center md:mt-[24px] md:p-0 md:pl-16"
                            >
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
                                  <GoogleReCaptcha
                                    onVerify={handleReCaptchaVerify}
                                    refreshReCaptcha={refreshReCaptcha}
                                  />
                                </GoogleReCaptchaProvider>
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button type="submit" onClick={formTwoFactorAuth.handleSubmit(onSubmitTwoFactorAuth)}>
                              Save changes
                            </Button>
                          </DialogFooter>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <div className="w-full">
                    <Dialog
                      open={isPasswordChangeDialogOpen}
                      onOpenChange={(value: boolean) => {
                        if (!value) {
                          form.reset();
                        }
                        setIsPasswordChangeDialogOpen(value);
                      }}
                    >
                      <DialogTrigger
                        onClick={() => setIsPasswordChangeDialogOpen(true)}
                        className="w-full rounded-[5px] border bg-primary p-2 text-base text-white hover:bg-primary hover:text-white disabled:opacity-60"
                      >
                        Change Password
                      </DialogTrigger>
                      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
                        <DialogHeader>
                          <DialogTitle>Change Password</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                          <div className="grid gap-4 py-4">
                            <FormField
                              control={form.control}
                              name="currentPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <FormLabel className="text-right">Current Password</FormLabel>
                                    <FormControl>
                                      <div className="relative col-span-3">
                                        <Input
                                          placeholder="Current Password"
                                          {...field}
                                          className="w-full pr-10"
                                          type={passwordsVisibility.currentPassword ? 'text' : 'password'}
                                        />
                                        <EyeIcon
                                          onClick={() => togglePasswordVisibility('currentPassword')}
                                          className="absolute right-0 top-0 h-[38px] w-[38px] px-2"
                                        />
                                      </div>
                                    </FormControl>
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <FormLabel className="text-right"></FormLabel>
                                    <FormMessage className="col-span-3" />
                                  </div>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="newPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <FormLabel className="text-right">New Password</FormLabel>
                                    <FormControl>
                                      <div className="relative col-span-3">
                                        <Input
                                          placeholder="New Password"
                                          {...field}
                                          type={passwordsVisibility.newPassword ? 'text' : 'password'}
                                          className="w-full pr-10"
                                        />
                                        <EyeIcon
                                          onClick={() => togglePasswordVisibility('newPassword')}
                                          className="absolute right-0 top-0 h-[38px] w-[38px] px-2"
                                        />
                                      </div>
                                    </FormControl>
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <FormLabel className="text-right"></FormLabel>
                                    <FormMessage className="col-span-3" />
                                  </div>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="confirmPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <FormLabel className="text-right">Confirm New password</FormLabel>
                                    <FormControl>
                                      <div className="relative col-span-3">
                                        <Input
                                          placeholder="Confirm New password"
                                          {...field}
                                          type={passwordsVisibility.confirmPassword ? 'text' : 'password'}
                                          className="w-full pr-10"
                                        />
                                        <EyeIcon
                                          onClick={() => togglePasswordVisibility('confirmPassword')}
                                          className="absolute right-0 top-0 h-[38px] w-[38px] px-2"
                                        />
                                      </div>
                                    </FormControl>
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <FormLabel className="text-right"></FormLabel>
                                    <FormMessage className="col-span-3" />
                                  </div>
                                </FormItem>
                              )}
                            />
                          </div>
                          <DialogFooter>
                            <Button
                              type="submit"
                              className="rounded-[3px] bg-green-500 px-3 py-2 text-white hover:bg-green-600"
                              onClick={form.handleSubmit(handleChangePassword)}
                            >
                              Save
                            </Button>
                          </DialogFooter>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <div className="w-full">
                    <Dialog
                      onOpenChange={(value: boolean) => {
                        if (!value) {
                          formNotificationSettings.reset();
                        }
                      }}
                    >
                      {/* <DialogTrigger
                        onClick={() => {
                          handleGetNotification();
                        }}
                        className="w-full rounded-[5px] border bg-primary p-2 text-base text-white hover:bg-primary hover:text-white disabled:opacity-60"
                      >
                        Notification Settings
                      </DialogTrigger> */}
                      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
                        <DialogHeader>
                          <DialogTitle>Notification Settings</DialogTitle>
                        </DialogHeader>
                        ``
                        <Form {...formNotificationSettings}>
                          <form
                            onSubmit={formNotificationSettings.handleSubmit(handleUpdateNotificationSettings)}
                            className="space-y-8"
                          >
                            <div className="grid gap-4 py-4">
                              <FormField
                                control={formNotificationSettings.control}
                                name="isEnabled"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                      <FormLabel className="text-base">Notifications Enabled</FormLabel>
                                    </div>
                                    <FormControl>
                                      <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={formNotificationSettings.control}
                                name="channelId"
                                render={({ field }) => (
                                  <FormItem>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <FormLabel className="text-right">Channel ID</FormLabel>
                                      <FormControl>
                                        <div className="relative col-span-3">
                                          <Input {...field} className="w-full pr-10" />
                                        </div>
                                      </FormControl>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <FormLabel className="text-right"></FormLabel>
                                      <FormMessage className="col-span-3" />
                                    </div>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={formNotificationSettings.control}
                                name="botToken"
                                render={({ field }) => (
                                  <FormItem>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <FormLabel className="text-right">Bot Token</FormLabel>
                                      <FormControl>
                                        <div className="relative col-span-3">
                                          <Input {...field} className="w-full pr-10" />
                                        </div>
                                      </FormControl>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <FormLabel className="text-right"></FormLabel>
                                      <FormMessage className="col-span-3" />
                                    </div>
                                  </FormItem>
                                )}
                              />
                            </div>
                            <DialogFooter>
                              <Button
                                type="submit"
                                className="rounded-[3px] bg-green-500 px-3 py-2 text-white hover:bg-green-600"
                              >
                                Save
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { MyAccount };
