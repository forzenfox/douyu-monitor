import eslint from '@eslint/js';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  {
    files: ['**/*.js'],
    ignores: ['node_modules/', 'dist/', 'public/', '*.md', '*.json'],
    languageOptions: {
      ecmaVersion: 12,
      sourceType: 'module',
      globals: {
        browser: true,
        node: true,
        es2021: true,
        window: true,
        document: true,
        localStorage: true,
        WebSocket: true,
        FileReader: true,
        Blob: true,
        setInterval: true,
        clearInterval: true,
        setTimeout: true,
        clearTimeout: true,
        SpeechSynthesisUtterance: true,
        location: true,
        fetch: true,
        console: true,
        isNaN: true,
      }
    },
    plugins: {
      prettier
    },
    rules: {
      ...eslint.configs.recommended.rules,
      ...prettierConfig.rules,
      'prettier/prettier': 'error',
      'no-console': 'off',
      'no-debugger': 'warn',
      'no-unused-vars': 'warn',
      'no-case-declarations': 'off'
    }
  }
];
