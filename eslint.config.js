// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@/src/hooks',
              message:
                'Import shared hooks from their direct file, for example "@/src/hooks/useProject".',
            },
            {
              name: '@/src/context',
              message:
                'Import context providers and hooks from their direct provider file to avoid pulling the whole context barrel.',
            },
          ],
        },
      ],
    },
  },
  {
    ignores: ['dist/*'],
  },
]);
