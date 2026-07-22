import eslint from '@eslint/js';
import tseslintParser from '@typescript-eslint/parser';
import tseslintPlugin from '@typescript-eslint/eslint-plugin';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

export default [
  eslint.configs.recommended,
  {
    files: ['**/*.{js,mjs,ts}'],
    languageOptions: {
      parser: tseslintParser,
      globals: {
        ...globals.node,
        ...globals.jest,
        ...globals.browser
      }
    },
    plugins: {
      '@typescript-eslint': tseslintPlugin,
      prettier: prettierPlugin
    },
    rules: {
      ...eslint.configs.recommended.rules,
      ...tseslintPlugin.configs.recommended.rules,
      'prettier/prettier': 'error',
      'no-undef': 'off', // TypeScript/Node handles this, and many scripts use globals
      'no-redeclare': 'off',
      '@typescript-eslint/no-redeclare': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          varsIgnorePattern: '^_'
        }
      ],
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'no-empty': 'off'
    }
  },
  {
    ignores: ['docs/**/*.md', 'site/**', 'lib/**', 'node_modules/**', 'samples/**']
  },
  prettierConfig
];
