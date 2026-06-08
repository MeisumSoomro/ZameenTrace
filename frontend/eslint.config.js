const js = require('@eslint/js');
const prettier = require('eslint-plugin-prettier/recommended');

module.exports = [
  js.configs.recommended,
  prettier,
  {
    ignores: ['node_modules/', '.next/', 'dist/', 'coverage/', '.git/'],
  },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        process: 'readonly',
        React: 'readonly',
      },
    },
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'prefer-const': 'error',
      eqeqeq: ['error', 'always'],
      'prettier/prettier': 'warn',
    },
  },
];
