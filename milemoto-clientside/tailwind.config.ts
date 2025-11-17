import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{ts,tsx,js,jsx,mdx,css}',
    './src/app/**/*.{ts,tsx,js,jsx,mdx,css}',
    './src/components/**/*.{ts,tsx,js,jsx,mdx,css}',
  ],
  theme: {},
  plugins: [],
};

export default config;
