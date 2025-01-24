import React from 'react';
import { toast } from 'react-toastify';
import { AutoForm, Button, Tabs, TabsContent, TabsList, TabsTrigger, TebToastContainer } from 'ui';
import { z } from 'zod';

import type { CreateContactDto } from '@/interfaces';
import { contactService } from '@/services';

export const ContactInfoZod = z.object({
  fullName: z
    .string({ required_error: 'First name is required' })
    .describe('Full name')
    .trim()
    .min(3, { message: 'At least 3 characters' })
    .max(40),
  email: z.string({ required_error: 'Email is required' }).email(),
  phone: z
    .string()
    .describe('Phone number')
    .regex(/^\d+$/, { message: 'Invalid phone number' })
    .min(8, { message: 'At least 8 characters' })
    .max(12, { message: 'Invalid phone number' })
    .optional(),
  webUrl: z.string().describe('Website URL').trim().url({ message: 'Invalid URL' }).optional(),
});

type HomeFormState = {
  status: 'INIT' | 'PENDING' | 'SUCCESS' | 'REJECT';
};

const leftStyle = 'min-h-[80px] inline-flex w-full lg:w-[49%] !mt-[6px]';
const rightStyle = 'ml-0 min-h-[80px] inline-flex w-full lg:ml-[2%] lg:w-[48%] !mt-[6px]';
const childStyle = 'w-full';

const HomeForm = () => {
  const [homeFormState, setHomeFormState] = React.useState<HomeFormState>({ status: 'INIT' });

  const handleSubmitForm = async (data: CreateContactDto) => {
    setHomeFormState((pre) => ({ ...pre, status: 'PENDING' }));
    const createContactResponse = await contactService.createNewContact(data);

    if (!createContactResponse.success || !createContactResponse?.data) {
      setHomeFormState((pre) => ({ ...pre, status: 'REJECT' }));
      toast.error(createContactResponse?.message);

      return;
    }

    setHomeFormState((pre) => ({ ...pre, status: 'SUCCESS' }));
    toast.success('Create contact successfully');
  };

  return (
    <>
      <Tabs defaultValue="contact-info" className="w-full">
        <TabsList className="mb-10">
          {homeFormState.status !== 'SUCCESS' && <TabsTrigger value="contact-info">Contact info</TabsTrigger>}
          {/* <TabsTrigger value="business-details">Business details</TabsTrigger> */}
        </TabsList>
        <TabsContent value="contact-info">
          {homeFormState.status === 'SUCCESS' ? (
            <div tabIndex={1} className="text-center">
              <img
                src="https://static.cdn.printful.com/dist-pf/image-assets/form-success-illustration.7f9703c4318d4a2c5ed29aa013d1138d.svg"
                loading="lazy"
                className="mx-auto"
              />{' '}
              <h3 className="mb-2 mt-4 text-[24px] font-bold leading-[34px]">We’re hyped you want to work with us!</h3>{' '}
              <p className="my-0 text-base">
                <span>
                  You'll hear from us soon. Meanwhile, <a href="/auth/register">sign up</a> and explore Tebprint.
                </span>
              </p>
            </div>
          ) : (
            <AutoForm
              formSchema={ContactInfoZod}
              // eslint-disable-next-line no-console
              onSubmit={handleSubmitForm}
              className=""
              valueCombox={[]}
              fieldConfig={{
                fullName: {
                  inputProps: {
                    placeholder: 'Peter Nguyen',
                  },
                  renderParent: ({ children }) => (
                    <div className={leftStyle}>
                      <div className={childStyle}>{children}</div>
                    </div>
                  ),
                },

                email: {
                  inputProps: {
                    placeholder: 'abc@company.com',
                  },
                  renderParent: ({ children }) => (
                    <div className={rightStyle}>
                      <div className={childStyle}>{children}</div>
                    </div>
                  ),
                },
                phone: {
                  inputProps: {
                    placeholder: '+1234 567 8901',
                  },
                  description: (
                    <p className="mt-2 text-[12px] leading-[18px] text-[#555]">
                      By adding your number, you agree to Tebprint calling you for partnership purposes
                    </p>
                  ),
                  renderParent: ({ children }) => (
                    <div className={leftStyle}>
                      <div className={childStyle}>{children}</div>
                    </div>
                  ),
                },
                webUrl: {
                  inputProps: {
                    placeholder: 'www.company.com',
                  },
                  renderParent: ({ children }) => (
                    <div className={rightStyle}>
                      <div className={childStyle}>{children}</div>
                    </div>
                  ),
                },
              }}
            >
              <Button disabled={homeFormState.status === 'PENDING'}>
                Submit{' '}
                {homeFormState.status === 'PENDING' && (
                  <div className="ml-2 flex w-full items-center justify-center">
                    <span className="dsy-loading dsy-loading-spinner dsy-loading-lg max-w-[1.5rem]"></span>
                  </div>
                )}
              </Button>
            </AutoForm>
          )}
        </TabsContent>
      </Tabs>
      <div tabIndex={-1} className="hidden text-center">
        <img
          src="https://static.cdn.printful.com/dist-pf/image-assets/form-success-illustration.7f9703c4318d4a2c5ed29aa013d1138d.svg"
          loading="lazy"
          alt=""
        />{' '}
        <h3 className="mb-2 mt-4 text-[24px] font-bold leading-[34px]">We’re hyped you want to work with us!</h3>{' '}
        <p className="text-base">You'll hear from us soon.</p>
      </div>

      <TebToastContainer />
    </>
  );
};

export { HomeForm };
