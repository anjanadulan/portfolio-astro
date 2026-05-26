import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // 🔁 Update this to your Vercel URL once deployed (e.g. https://anjanadulan.vercel.app)
  site: 'https://anjanadulan.vercel.app',
  output: 'static',
  devToolbar: {
    enabled: false,
  },

  vite: {
    plugins: [tailwindcss()],
  },
});