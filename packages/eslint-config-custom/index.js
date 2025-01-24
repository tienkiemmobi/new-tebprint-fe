module.exports = {
  env: {
    node: true,
  },
  // Configuration for JavaScript files
  extends: ['airbnb-base', 'plugin:prettier/recommended'],
  rules: {
    'newline-before-return': 'error',
    'no-underscore-dangle': ['error', { allow: ['_id'] }],
    'no-param-reassign': ['error', { props: false }],
  },
  overrides: [
    // Configuration for mjs files
    {
      files: ['**/*.mjs'],
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 2018,
      },
      extends: ['plugin:prettier/recommended'],
      rules: {
        'import/no-extraneous-dependencies': 'off', // mjs is only used by Astro for configuration, false positive
        'import/no-unresolved': 'off', // Also false positive with mjs file
      },
    },
    // Configuration for TypeScript files
    {
      files: ['**/*.ts', '**/*.tsx'],
      plugins: ['@typescript-eslint', 'react', 'unused-imports', 'tailwindcss', 'simple-import-sort'],
      extends: ['plugin:tailwindcss/recommended', 'airbnb-typescript', 'plugin:prettier/recommended'],
      parserOptions: {
        // project: './tsconfig.json',
      },
      rules: {
        'import/extensions': [
          'error',
          'ignorePackages',
          {
            js: 'never',
            jsx: 'never',
            ts: 'never',
            tsx: 'never',
            '': 'never',
          },
        ], // Avoid missing file extension errors when using '@/' alias
        'react/destructuring-assignment': 'off', // Vscode doesn't support automatically destructuring, it's a pain to add a new variable
        'react/require-default-props': 'off', // Allow non-defined react props as undefined
        'react/jsx-props-no-spreading': 'off', // _app.tsx uses spread operator and also, react-hook-form
        '@typescript-eslint/comma-dangle': 'off', // Avoid conflict rule between Eslint and Prettier
        '@typescript-eslint/consistent-type-imports': 'error', // Ensure `import type` is used when it's necessary
        'import/prefer-default-export': 'off', // Named export is easier to refactor automatically
        'tailwindcss/classnames-order': [
          'off',
          {
            officialSorting: true,
          },
        ], // Follow the same ordering as the official plugin `prettier-plugin-tailwindcss`
        'simple-import-sort/imports': 'error', // Import configuration for `eslint-plugin-simple-import-sort`
        'simple-import-sort/exports': 'error', // Export configuration for `eslint-plugin-simple-import-sort`
        '@typescript-eslint/no-unused-vars': 'off',
        'unused-imports/no-unused-imports': 'error',
        'unused-imports/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

        // Teb
        'import/no-extraneous-dependencies': 'off',
        'tailwindcss/no-custom-classname': 'off',
        '@typescript-eslint/naming-convention': [
          'error',
          {
            selector: 'default',
            format: ['camelCase', 'PascalCase', 'snake_case', 'UPPER_CASE'],
            filter: {
              regex: '^_.*$',
              match: false,
            },
          },
          {
            selector: 'variable',
            format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
            filter: {
              regex: '^_id$',
              match: false,
            },
          },
          {
            selector: 'interface',
            format: ['PascalCase'],
            // prefix: ['I'],
          },
          {
            selector: 'typeLike',
            format: ['PascalCase'],
          },
          {
            selector: 'memberLike',
            modifiers: ['private'],
            format: ['camelCase'],
            leadingUnderscore: 'forbid',
          },
          {
            selector: 'variable',
            types: ['boolean'],
            format: ['PascalCase'],
            prefix: ['is', 'should', 'has', 'can', 'did', 'will'],
          },
          {
            selector: 'property',
            format: null,
          },
        ],
      },
    },
    // Configuration for Astro
    {
      files: ['**/*.astro'],
      plugins: ['@typescript-eslint', 'react', 'unused-imports', 'tailwindcss', 'simple-import-sort'],
      extends: ['plugin:tailwindcss/recommended', 'airbnb-typescript', 'plugin:prettier/recommended'],
      parser: 'astro-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
        // project: './tsconfig.json',
        extraFileExtensions: ['.astro'],
      },
      rules: {
        'import/extensions': [
          'error',
          'ignorePackages',
          {
            js: 'never',
            jsx: 'never',
            ts: 'never',
            tsx: 'never',
            '': 'never',
          },
        ], // Avoid missing file extension errors in .astro files
        'import/no-unresolved': [
          'error',
          {
            ignore: ['@/*'],
          },
        ], // Disable no-unresolved rule for .astro files
        'react/jsx-filename-extension': [1, { extensions: ['.astro'] }], // Accept jsx in astro files
        'react/destructuring-assignment': 'off', // Vscode doesn't support automatically destructuring, it's a pain to add a new variable
        'react/require-default-props': 'off', // Allow non-defined react props as undefined
        'react/jsx-props-no-spreading': 'off', // _app.tsx uses spread operator and also, react-hook-form
        '@typescript-eslint/comma-dangle': 'off', // Avoid conflict rule between Eslint and Prettier
        '@typescript-eslint/consistent-type-imports': 'error', // Ensure `import type` is used when it's necessary
        'import/prefer-default-export': 'off', // Named export is easier to refactor automatically
        'tailwindcss/classnames-order': [
          'off',
          {
            officialSorting: true,
          },
        ], // Follow the same ordering as the official plugin `prettier-plugin-tailwindcss`
        'simple-import-sort/imports': 'error', // Import configuration for `eslint-plugin-simple-import-sort`
        'simple-import-sort/exports': 'error', // Export configuration for `eslint-plugin-simple-import-sort`
        '@typescript-eslint/no-unused-vars': 'off',
        'unused-imports/no-unused-imports': 'error',
        'unused-imports/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

        // Teb
        'consistent-return': 'off',
        'tailwindcss/no-custom-classname': ['off', { argsIgnorePattern: '^splide' }],
        '@typescript-eslint/naming-convention': [
          'error',
          {
            selector: 'default',
            format: ['camelCase', 'PascalCase', 'snake_case', 'UPPER_CASE'],
            filter: {
              regex: '^_.*$',
              match: false,
            },
          },
          {
            selector: 'variable',
            format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
            filter: {
              regex: '^_id$',
              match: false,
            },
          },
          {
            selector: 'interface',
            format: ['PascalCase'],
            // prefix: ['I'],
          },
          {
            selector: 'typeLike',
            format: ['PascalCase'],
          },
          {
            selector: 'memberLike',
            modifiers: ['private'],
            format: ['camelCase'],
            leadingUnderscore: 'forbid',
          },
          {
            selector: 'variable',
            types: ['boolean'],
            format: ['PascalCase'],
            prefix: ['is', 'should', 'has', 'can', 'did', 'will'],
          },
          {
            selector: 'property',
            format: null,
          },
        ],
      },
      globals: {
        Astro: 'readonly',
      },
    },
  ],
};
