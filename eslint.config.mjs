import eslint from '@eslint/js';
import tseslintParser from '@typescript-eslint/parser';
import tseslintPlugin from '@typescript-eslint/eslint-plugin';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

export default [
    eslint.configs.recommended,
    {
        files: ['**/*.ts'],
        languageOptions: {
            parser: tseslintParser,
            globals: {
                ...globals.node,
                ...globals.jest,
                ...globals.browser,
            },
        },
        plugins: {
            '@typescript-eslint': tseslintPlugin,
            prettier: prettierPlugin,
        },
        rules: {
            ...tseslintPlugin.configs.recommended.rules,
            'prettier/prettier': 'error',
            'no-undef': 'off', // TypeScript handles this better
            'no-redeclare': 'off',
            '@typescript-eslint/no-redeclare': 'off',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/ban-ts-comment': 'off',
        },
    },
    {
        ignores: ['docs/**', 'lib/**', 'node_modules/**', 'samples/**'],
    },
    prettierConfig,
];
