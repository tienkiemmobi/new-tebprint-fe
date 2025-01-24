import { Check } from 'lucide-react';
import type { FC } from 'react';
import { Button, HelpCenterChatIcon, HelpCenterEmailIcon, HelpCenterHelpIcon } from 'ui';

const HelpCenter: FC = () => {
  return (
    <div className="w-full p-4">
      <div className="mx-auto w-full max-w-[1150px] bg-transparent px-3 pb-[64px] pt-10">
        <h1 className="text-[32px] font-bold leading-10 tracking-[-1px] md:text-[36px] md:leading-[46px]">Help</h1>
        <h2 className="pb-6 pt-10 text-2xl font-bold">Customer support</h2>

        <div className="flex flex-col items-center justify-between gap-8 pb-10 md:flex-row md:items-stretch">
          <div className="w-full bg-background px-4 py-6 text-center">
            <HelpCenterHelpIcon className="mx-auto" />
            <h3 className="my-6 text-lg font-bold">Help Center</h3>
            <div className="mt-2 pb-8 text-base font-normal text-[#555]">
              <span>You'll find answers to many questions in our FAQ section and video tutorials.</span>
            </div>
            <Button variant="secondary">
              <a href="#" className="my-2 inline-block">
                Open Help Center
              </a>
            </Button>
          </div>
          <div className="w-full bg-background px-4 py-6 text-center">
            <HelpCenterChatIcon className="mx-auto" />
            <h3 className="my-6 text-lg font-bold">Chat</h3>
            <div className="mt-2 pb-8 text-base font-normal text-[#555]">
              <span>You can chat with us from the bottom-right corner of any Tebprint page.</span>
            </div>
            <Button variant="secondary" disabled>
              <a href="#" className="my-2 inline-block">
                Chat with us
              </a>
            </Button>
            <div className="mb-1 mt-2 text-[15px]">(Currently unavailable)</div>
          </div>
          <div className="w-full bg-background px-4 py-6 text-center">
            <HelpCenterEmailIcon className="mx-auto" />
            <h3 className="my-6 text-lg font-bold">Email</h3>
            <div className="mt-2 pb-8 text-base font-normal text-[#555]">
              <span>No matter how big or small your question is, we'll make sure to get back to you.</span>
            </div>
            <Button variant="link">
              <a href="mailto:support@tebprint.com" className="my-2 inline-block">
                support@tebprint.com
              </a>
            </Button>
          </div>
        </div>

        <h4 className="text-2xl font-bold">Join our social media community!</h4>
        <p className="mb-8 mt-2 text-lg font-normal">
          Follow us for product updates, marketing tips, tutorials, and other cool ideas
        </p>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <a href="#" className="overflow-hidden rounded-[10px] border bg-background hover:shadow-lg">
            <picture>
              <source
                media="(min-width: 768px)"
                srcSet="https://static.cdn.printful.com/static/v863/images/social/ig-background-large.png"
              />
              <img
                className="w-full align-middle"
                src="https://static.cdn.printful.com/static/v863/images/social/ig-background.png?v=3"
                data-src="https://static.cdn.printful.com/static/v863/images/social/ig-background.png?v=3"
                alt=""
                data-src-processed="1"
              />
            </picture>
            <div className="mx-4 mb-1 mt-6">
              <h5 className="mb-4 text-lg font-bold">Follow us on Instagram</h5>
              <div className="mb-4 flex items-center">
                <Check className="mr-2 h-6 w-6 text-[#f2c994]" />
                <p>Stay on top of industry news and fashion trends</p>
              </div>
              <div className="mb-4 flex items-center">
                <Check className="mr-2 h-6 w-6 text-[#f2c994]" />
                <p>See exclusive behind-the-scenes content from Tebprint</p>
              </div>
              <div className="mb-4 flex items-center">
                <Check className="mr-2 h-6 w-6 text-[#f2c994]" />
                <p>Be the first to know about the newest product drops</p>
              </div>
            </div>
          </a>
          <a href="#" className="overflow-hidden rounded-[10px] border bg-background hover:shadow-lg">
            <picture>
              <source
                media="(min-width: 768px)"
                srcSet="https://static.cdn.printful.com/static/v863/images/social/fb-background-large.png"
              />
              <img
                className="w-full align-middle"
                src="https://static.cdn.printful.com/static/v863/images/social/fb-background.png?v=3"
                data-src="https://static.cdn.printful.com/static/v863/images/social/fb-background.png?v=3"
                alt=""
                data-src-processed="1"
              />
            </picture>
            <div className="mx-4 mb-1 mt-6">
              <h5 className="mb-4 text-lg font-bold">Join our Facebook group</h5>
              <div className="mb-4 flex items-center">
                <Check className="mr-2 h-6 w-6 text-[#f2c994]" />
                <p>Connect with other Tebprint users on all things ecommerce</p>
              </div>
              <div className="mb-4 flex items-center">
                <Check className="mr-2 h-6 w-6 text-[#f2c994]" />
                <p>Share your experience of running a business and learn from others</p>
              </div>
              <div className="mb-4 flex items-center">
                <Check className="mr-2 h-6 w-6 text-[#f2c994]" />
                <p>Take part in exclusive contests, surveys, and activities</p>
              </div>
            </div>
          </a>
          <a href="#" className="overflow-hidden rounded-[10px] border bg-background hover:shadow-lg">
            <picture>
              <source
                media="(min-width: 768px)"
                srcSet="https://static.cdn.printful.com/static/v863/images/social/yt-background-large.png"
              />
              <img
                className="w-full align-middle"
                src="https://static.cdn.printful.com/static/v863/images/social/yt-background.png?v=3"
                data-src="https://static.cdn.printful.com/static/v863/images/social/yt-background.png?v=3"
                alt=""
                data-src-processed="1"
              />
            </picture>
            <div className="mx-4 mb-1 mt-6">
              <h5 className="mb-4 text-lg font-bold">Subscribe to our YouTube channel</h5>
              <div className="mb-4 flex items-center">
                <Check className="mr-2 h-6 w-6 text-[#f2c994]" />
                <p>Learn the latest ecommerce and print-on-demand tips and tricks</p>
              </div>
              <div className="mb-4 flex items-center">
                <Check className="mr-2 h-6 w-6 text-[#f2c994]" />
                <p>Get inspired by other ecommerce business owners and their success stories</p>
              </div>
              <div className="mb-4 flex items-center">
                <Check className="mr-2 h-6 w-6 text-[#f2c994]" />
                <p>Watch our showcase videos to see our products in motion</p>
              </div>
            </div>
          </a>
          <a href="#" className="overflow-hidden rounded-[10px] border bg-background hover:shadow-lg">
            <picture>
              <source
                media="(min-width: 768px)"
                srcSet="https://static.cdn.printful.com/static/v863/images/social/tt-background-large.png"
              />
              <img
                className="w-full align-middle"
                src="https://static.cdn.printful.com/static/v863/images/social/tt-background.png?v=3"
                data-src="https://static.cdn.printful.com/static/v863/images/social/tt-background.png?v=3"
                alt=""
                data-src-processed="1"
              />
            </picture>
            <div className="mx-4 mb-1 mt-6">
              <h5 className="mb-4 text-lg font-bold">Follow us on TikTok</h5>
              <div className="mb-4 flex items-center">
                <Check className="mr-2 h-6 w-6 text-[#f2c994]" />
                <p>Get an exclusive look into the daily lives at Tebprint</p>
              </div>
              <div className="mb-4 flex items-center">
                <Check className="mr-2 h-6 w-6 text-[#f2c994]" />
                <p>Find actionable tips and tricks for your small biz</p>
              </div>
              <div className="mb-4 flex items-center">
                <Check className="mr-2 h-6 w-6 text-[#f2c994]" />
                <p>See the latest product launches and access special deals</p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export { HelpCenter };
