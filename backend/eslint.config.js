const js = require('@eslint/js');
const prettier = require('eslint-plugin-prettier/recommended');

module.exports = [
  js.configs.recommended,
  prettier,
  {
    ignores: ['node_modules/', '.next/', 'dist/'],
  },
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        console: 'readonly',
        process: 'readonly',
        require: 'readonly',
        module: 'writable',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
      'prefer-const': 'error',
      eqeqeq: ['error', 'always'],
      'prettier/prettier': 'warn',
    },
  },
];
