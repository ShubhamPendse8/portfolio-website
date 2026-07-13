// @ts-check
import { defineConfig } from 'astro/config';

// Change these two when moving to a custom domain / root deployment:
//   site: 'https://your-custom-domain.com'
//   base: '/'
// For GitHub Pages project site (default) keep as below.
const SITE = 'https://shubhampendse8.github.io';
const BASE = '/portfolio-website';

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'ignore',
  output: 'static',
  build: {
    format: 'directory',
    assets: '_astro',
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  vite: {
    server: {
      allowedHosts: true,
      hmr: {
        clientPort: 443,
        protocol: 'wss',
      },
    },
  },
  integrations: [],
});
