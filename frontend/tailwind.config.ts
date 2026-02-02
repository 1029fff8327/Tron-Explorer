import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}', // ✅ включает app + entities + features + shared + widgets
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
