import { ChevronDown, ChevronUp } from 'lucide-react';
import React from 'react';
import { CustomDropdown, Section } from 'ui';

type FooterItem = {
  represent: string;
  link: string;
};
type FooterProps = {
  classes?: string;
};

type FooterList = {
  name: string;
  footers: FooterItem[];
};
type FooterState = {
  isAllDropdownOpen: boolean;
  isPreventToggle: boolean;
};

const footerList: FooterList[] = [
  {
    name: 'Sell with Tebprint',
    footers: [
      { represent: 'Print on demand', link: '#' },
      { represent: 'Connect your store', link: '#' },
      { represent: 'Sell online without inventory', link: '#' },
      { represent: 'Grow your enterprise', link: '#' },
    ],
  },
  {
    name: 'Create custom products',
    footers: [
      { represent: 'Product catalog', link: '#' },
      { represent: 'Design your own', link: '#' },
      { represent: 'Quality', link: '#' },
      { represent: 'Design Maker', link: '#' },
      { represent: 'Hire an expert', link: '#' },
    ],
  },
  {
    name: 'Explore',
    footers: [
      { represent: 'Blog', link: '#' },
      { represent: 'Tebprint Academy', link: '#' },
      { represent: 'Newsroom', link: '#' },
    ],
  },
  {
    name: 'Resources',
    footers: [
      { represent: 'Help Center', link: '#' },
      { represent: 'Shipping', link: '#' },
      { represent: 'Returns', link: '#' },
      { represent: 'Policies', link: '#' },
      { represent: 'Accessibility Statement', link: '#' },
      { represent: 'Gift Cards', link: '#' },
      { represent: 'Sitemap', link: '#' },
    ],
  },
  {
    name: 'About Tebprint',
    footers: [
      { represent: 'Our story', link: '#' },
      { represent: 'Contacts', link: '#' },
      { represent: 'Sustainability & Responsibility', link: '#' },
      { represent: 'Affiliate Program', link: '#' },
      { represent: 'Referral Program', link: '#' },
      { represent: 'Careers', link: '#' },
    ],
  },
  {
    name: 'Latest updates',
    footers: [
      { represent: 'Our story', link: '#' },
      { represent: 'Top 7 Quality T-Shirts for Printing', link: '#' },
    ],
  },
];

const MD_SCREEN = 1024;

const Footer = (props: FooterProps) => {
  const [footerState, setFooterState] = React.useState<FooterState>({
    isAllDropdownOpen: false,
    isPreventToggle: false,
  });

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < MD_SCREEN) {
        setFooterState((pre) => ({ ...pre, isPreventToggle: false }));
      } else {
        setFooterState((pre) => ({ ...pre, isPreventToggle: true }));
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <Section className={props.classes}>
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-3 xl:grid-cols-6">
        {footerList.map((footer) => (
          <div key={footer.name}>
            <CustomDropdown
              title={footer.name}
              labelStyle="border-none w-full mb-3"
              textStyle="text-[18px] leading-[26px] font-bold text-left"
              rightIcon={<ChevronDown />}
              rightToggleIcon={<ChevronUp />}
              isDropDownOpen={footerState.isAllDropdownOpen}
              dropDownContent={footer.footers.map((item) => (
                <a key={item.represent} href={item.link} className="mb-2 block text-[#555]">
                  {item.represent}
                </a>
              ))}
              isPreventToggle={footerState.isPreventToggle}
            />
          </div>
        ))}
      </div>

      <div className="border-t border-gray-600 pt-5">
        <div className="text-sm text-gray-200">© Copyright 2023 by TebPrint.</div>
      </div>
    </Section>
  );
};

export { Footer };
