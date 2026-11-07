import { defineConfig } from 'astro/config';
import { remarqueTypo } from './src/lib/typo.mjs';

export default defineConfig({
  site: 'https://kernerteam.net',
  trailingSlash: 'ignore',
  markdown: {
    remarkPlugins: [remarqueTypo],
  },
});
