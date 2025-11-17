import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import { defineConfig, globalIgnores } from 'eslint/config';

// Assume first object in nextVitals contains jsx-a11y plugin
const [baseNextConfig, ...restNextConfigs] = nextVitals;

export default defineConfig([
  {
    ...baseNextConfig,
    rules: {
      ...baseNextConfig.rules,
      // Your overrides: SAME plugin instance, no redefinition
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/label-has-associated-control': 'error',
      'jsx-a11y/no-static-element-interactions': 'warn',
      // etc...
    },
  },
  ...restNextConfigs,
  ...nextTs,
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
]);
