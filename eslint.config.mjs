import antfu from '@antfu/eslint-config';

export default antfu(
  {
    formatters: true,
    stylistic: {
      semi: true,
      quotes: 'single',
      indent: 2,
    },
    typescript: {
      tsconfigPath: 'tsconfig.lint.json',
    },
  },
  {
    ignores: ['node_modules', 'dist', '*.cjs', '**/fixtures/**'],
  },
).overrideRules({
  'ts/strict-boolean-expressions': 'off',

  'style/arrow-parens': ['error', 'always'],

  'perfectionist/sort-imports': [
    'warn',
    {
      groups: [
        ['side-effect'],
        'type',
        ['builtin', 'external'],
        ['internal', 'internal-type'],
        ['parent-type', 'sibling-type', 'index-type'],
        ['parent', 'sibling', 'index'],
        'object',
        'unknown',
      ],
      newlinesBetween: 'always',
      order: 'asc',
      type: 'natural',
    },
  ],
});
