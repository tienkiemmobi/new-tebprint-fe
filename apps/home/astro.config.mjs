import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import robotsTxt from 'astro-robots-txt';
import vercel from '@astrojs/vercel/serverless';
import node from '@astrojs/node';
import dotenv from 'dotenv';
import prefetch from '@astrojs/prefetch';
import path from 'path';

dotenv.config();

const IS_DEV = process.env.ENV !== 'production';
const PORT = Number(process.env.PORT) || 4321;
const HOST = process.env.HOST || false;

// https://astro.build/config
export default defineConfig({
  // base: '.', // Set a path prefix.
  // output: 'server',
  site: 'https://tebprint.com/',
  server: {
    port: PORT,
    host: HOST,
  },
  // Use to always append '/' at end of url
  trailingSlash: 'ignore',
  markdown: {
    shikiConfig: {
      // Choose from Shiki's built-in themes (or add your own)
      // https://github.com/shikijs/shiki/blob/main/docs/themes.md
      theme: 'monokai',
    },
  },
  assets: true,
  viewTransitions: true,
  integrations: [
    react(),
    tailwind({ applyBaseStyles: false }),
    sitemap(),
    robotsTxt(),
    ...(process.env.PREFETCH ? [prefetch()] : []),
  ],
  output: 'server',
  adapter: process.env.VERCEL
    ? vercel()
    : node({
        mode: 'standalone',
      }),
  build: {
    assets: '_acustom',
  },
  vite: {
    esbuild: {
      ...(!IS_DEV && { drop: ['console', 'debugger'] }),
    },
    resolve: {
      alias: {
        '@ui': `${path.resolve('../../packages/ui')}`,
      },
    },
  },
  experimental: {
    optimizeHoistedScript: true,
  },
});
