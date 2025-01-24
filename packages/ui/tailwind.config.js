/** @type {import('tailwindcss').Config} */
/* eslint-disable import/no-extraneous-dependencies, global-require */

const plugin = require('tailwindcss/plugin');

module.exports = {
  content: ['./components/**/*.{astro,ts,tsx}', './src/**/*.{astro,ts,tsx}', './../../packages/ui/**/*.{astro,ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      screens: {
        ssm: '420px',
      },
      colors: {
        color: 'hsl(var(--color))',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Customized
        teb: {
          DEFAULT: 'hsl(var(--teb))',
          foreground: 'hsl(var(--primary-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
        'show-out': {
          '0%': { transform: 'translateX(100%)' },
          '80%': { transform: 'translateX(-20%)' },
          '100%': { transform: 'translateX(0%)' },
        },
        'order-fade-in-top': {
          '0%': {
            transform: 'translateY(-30px)',
            opacity: 0,
          },
          '10%': {
            opacity: 0,
          },
          '100%': {
            transform: 'translateY(0)',
            opacity: 1,
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'show-out': 'show-out 0.2s ease-out',
        'order-fade-in-top': 'order-fade-in-top .5s cubic-bezier(.39,.575,.565,1) both',
      },
      transitionDuration: {
        2000: '2000ms',
      },
      boxShadow: {
        'table-shadow':
          '0 0 2px rgba(104,111,113,.1), 0 2px 3px rgba(104,111,113,.15), 0 1px 3px rgba(104,111,113,.25)',
        'order-shadow':
          '0 1px 3px rgba(148,148,148,.25), 0 2px 3px rgba(148,148,148,.15), 0 0 2px rgba(148,148,148,.1)',
        'icon-hover': '0 0 0 14px rgba(0,195,96,.24)',
        slider: '0 0 200px 200px #fff',
      },
    },
  },
  daisyui: {
    themes: ['light'],
    logs: false,
    prefix: 'dsy-',
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/typography'),
    require('tailwindcss-animate'),
    require('daisyui'),
    plugin(({ addUtilities }) => {
      addUtilities({
        '.drag-none': {
          '-webkit-user-drag': 'none',
          '-khtml-user-drag': 'none',
          '-moz-user-drag': 'none',
          '-o-user-drag': 'none',
          'user-drag': 'none',
        },
      });
    }),
  ],
};
