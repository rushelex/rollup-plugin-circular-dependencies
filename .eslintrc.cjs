const { configure, presets } = require('eslint-kit');

module.exports = configure({
  presets: [
    presets.imports({
      sort: {
        newline: true,
        groups: [
          // side effects
          ['^\\u0000'],

          // node.js libraries, react libraries, scoped libraries
          ['^(node:)?(child_process|crypto|events|fs|http|https|os|path)(/.*)?$', '^@?\\w'],

          // parent imports
          ['^\\.\\.'],

          // sibling imports
          ['^\\.'],
        ],
      },
    }),
    presets.node(),
    presets.typescript({
      root: '.',
      tsconfig: 'tsconfig.lint.json',
    }),
  ],
  extend: {
    root: true,
    env: { es2020: true },
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/eslint-recommended'],
    ignorePatterns: ['dist', '.eslintrc.cjs'],
    overrides: [
      {
        files: ['*.ts', '*.tsx'],
        parser: '@typescript-eslint/parser',
        rules: {
          '@typescript-eslint/consistent-type-imports': ['warn', { fixStyle: 'inline-type-imports' }],
          '@typescript-eslint/no-unused-vars': [
            'warn',
            {
              ignoreRestSiblings: true,
              varsIgnorePattern: '^_',
              argsIgnorePattern: '^_',
            },
          ],

          //#region @eslint-typescript/stylistic
          '@typescript-eslint/adjacent-overload-signatures': 'error',
          '@typescript-eslint/array-type': ['error', { default: 'array-simple', readonly: 'array-simple' }],
          '@typescript-eslint/class-literal-property-style': 'error',
          '@typescript-eslint/consistent-generic-constructors': 'error',
          '@typescript-eslint/consistent-indexed-object-style': 'error',
          '@typescript-eslint/consistent-type-assertions': 'error',
          '@typescript-eslint/consistent-type-definitions': 'error',
          '@typescript-eslint/no-confusing-non-null-assertion': 'error',
          'no-empty-function': 'off',
          '@typescript-eslint/no-empty-function': 'error',
          '@typescript-eslint/no-empty-interface': 'error',
          '@typescript-eslint/no-inferrable-types': 'error',
          '@typescript-eslint/prefer-for-of': 'error',
          '@typescript-eslint/prefer-function-type': 'error',
          '@typescript-eslint/prefer-namespace-keyword': 'error',
          //#endregion @eslint-typescript/stylistic
          '@typescript-eslint/switch-exhaustiveness-check': 'error',
        },
      },
      {
        files: ['*.d.ts'],
        rules: {
          'no-inner-declarations': 'off',
          '@typescript-eslint/no-empty-interface': 'off',
        },
      },
    ],
  },
});
