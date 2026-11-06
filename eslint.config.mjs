import 'eslint-plugin-only-warn';

import { fixupPluginRules } from '@eslint/compat';
import pluginJs from '@eslint/js';
import { globalIgnores, defineConfig } from 'eslint/config';
import { plugin as ex } from 'eslint-plugin-exception-handling';
import * as importx from 'eslint-plugin-import-x';
import perfectionist from 'eslint-plugin-perfectionist';
import prettier from 'eslint-plugin-prettier/recommended';
import typescriptPaths from 'eslint-plugin-typescript-paths';
import unicorn from 'eslint-plugin-unicorn';
import wixEditor from 'eslint-plugin-wix-editor';
import globals from 'globals';
import * as tseslint from 'typescript-eslint';

export default defineConfig(
  pluginJs.configs.recommended,
  tseslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  unicorn.configs.recommended,
  prettier,
  globalIgnores(['dist/**', 'coverage/**', '@generated/**']),
  {
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.node,
      parserOptions: {
        projectService: true,
      },
      sourceType: 'module',
    },
    rules: {
      'max-lines': [1, { max: 300 }],
      'max-params': [1, { max: 3 }],
      'no-unneeded-ternary': [1],
    },
    settings: {
      node: {
        version: '>=24',
      },
    },
  },
  // {
  //   plugins: { 'typescript-paths': typescriptPaths },
  //   rules: typescriptPaths.configs.recommended.rules,
  // },
  {
    plugins: {
      'wix-editor': fixupPluginRules(wixEditor),
    },
    rules: {
      'wix-editor/no-instanceof-array': 1,
      'wix-editor/no-not-not': 1,
      'wix-editor/no-unneeded-match': 1,
      'wix-editor/prefer-filter': 1,
      'wix-editor/prefer-ternary': 1,
      'wix-editor/return-boolean': 1,
      'wix-editor/simplify-boolean-expression': 1,
    },
  },
  {
    rules: {
      // The project writes JSDoc with leading asterisks.
      'unicorn/no-asterisk-prefix-in-documentation-comments': 0,
      'unicorn/single-line-block-comment-style': 0,
      'unicorn/name-replacements': [
        'warn',
        {
          replacements: {
            args: false,
          },
        },
      ],
    },
  },
  {
    extends: [importx.flatConfigs.recommended, importx.flatConfigs.typescript],
    rules: {
      'import-x/order': [
        'warn',
        {
          alphabetize: {
            caseInsensitive: false,
            order: 'asc',
            orderImportKind: 'asc',
          },
          groups: [
            'builtin', // Node.js built-in modules (e.g., `fs`)
            'external', // Packages from `node_modules`
            'internal', // Absolute imports (via path aliases)
            ['parent', 'sibling', 'index'], // Relative imports
            'object', // Type imports (if using TypeScript)
            'type', // Side-effect imports
          ],
          'newlines-between': 'always', // Add newlines between groups
          pathGroups: [
            {
              // The predefined group this PathGroup is defined in relation to
              group: 'external',
              // Minimatch pattern used to match against specifiers
              pattern: '@/**',
              // How matching imports will be positioned relative to "group"
              position: 'after',
            },
          ],
        },
      ],
    },
  },
  {
    plugins: {
      perfectionist,
    },
    rules: {
      'perfectionist/sort-objects': [
        'warn',
        {
          order: 'asc',
          type: 'natural',
        },
      ],
    },
  },
  {
    plugins: { ex },
    rules: {
      'ex/might-throw': 1,
      'ex/no-unhandled': 1,
      'ex/use-error-cause': 1,
    },
  },
  {
    extends: [tseslint.configs.disableTypeChecked],
    files: ['*.config.mjs', '*.config.mts'],
  },
  {
    files: ['**/*.spec.ts', '**/*.e2e-spec.ts'],
    rules: {
      '@typescript-eslint/camelcase': 0,
      '@typescript-eslint/no-explicit-any': 0,
      '@typescript-eslint/no-floating-promises': 0,
      '@typescript-eslint/no-non-null-assertion': 0,
      'consistent-return': 0,
      'import/max-dependencies': 0,
      'max-lines': 0,
    },
  },
);
