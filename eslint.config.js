import antfu from '@antfu/eslint-config';

export default antfu(
  {
    ignores: [
      'node_modules',
      'dist',
      '**/*.md',
    ],
    typescript: {
      tsconfigPath: 'tsconfig.json',
    },
    stylistic: {
      semi: true,
      quotes: 'single',
      indent: 2,
    },
  },
)
  .override('antfu/jsdoc/rules', {
    rules: {
      'jsdoc/no-defaults': 'off',
    },
  })
  .override('antfu/stylistic/rules', {
    rules: {
      'style/arrow-parens': ['warn', 'always'],
      'style/no-trailing-spaces': 'warn',
      'style/lines-between-class-members': [
        'warn',
        {
          enforce: [
            { blankLine: 'always', prev: 'method', next: '*' },
            { blankLine: 'always', prev: '*', next: 'method' },
            { blankLine: 'never', prev: 'field', next: 'field' },
          ],
        },
      ],
      'style/indent': [
        'warn',
        2,
        {
          ArrayExpression: 1,
          CallExpression: {
            arguments: 1,
          },
          flatTernaryExpressions: true,
          FunctionDeclaration: {
            body: 1,
            parameters: 1,
            returnType: 1,
          },
          FunctionExpression: {
            body: 1,
            parameters: 1,
            returnType: 1,
          },
          ignoreComments: false,
          ignoredNodes: [
            'TSUnionType',
            'TSIntersectionType',
          ],
          ImportDeclaration: 1,
          MemberExpression: 1,
          ObjectExpression: 1,
          offsetTernaryExpressions: true,
          outerIIFEBody: 1,
          SwitchCase: 1,
          tabLength: 2,
          VariableDeclarator: 1,
        },
      ],
    },
  })
  .override('antfu/perfectionist/setup', {
    rules: {
      'perfectionist/sort-imports': [
        'warn',
        {
          groups: [
            'side-effect',
            'side-effect-style',
            'type-import',
            'type-internal',
            [
              'type-parent',
              'type-sibling',
              'type-index',
            ],
            'value-builtin',
            'value-external',
            [
              'value-subpath',
              'value-internal',
            ],
            [
              'value-parent',
              'value-sibling',
              'value-index',
            ],
            'ts-equals-import',
            'unknown',
          ],
          newlinesBetween: 1,
          newlinesInside: 'ignore',
          order: 'asc',
          type: 'natural',
        },
      ],
    },
  })
  .override('antfu/javascript/rules', {
    rules: {
      'no-restricted-syntax': [
        'error',
        'TSExportAssignment',
      ],
    },
  })
  .override('antfu/typescript/rules', {
    rules: {
      'ts/consistent-type-imports': [
        'error',
        { fixStyle: 'inline-type-imports', prefer: 'type-imports' },
      ],
      'ts/consistent-type-exports': 'error',
    },
  })
  .override('antfu/typescript/rules-type-aware', {
    rules: {
      'ts/strict-boolean-expressions': 'off',
    },
  })
  .override('antfu/test/rules', {
    rules: {
      'test/prefer-lowercase-title': ['error', {
        ignore: ['describe'],
        ignoreTopLevelDescribe: true,
      }],
    },
  })
  .override('antfu/yaml/rules', {
    rules: {
      'yaml/quotes': ['error', { prefer: 'double' }],
    },
  });
