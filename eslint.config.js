import eslint from 'eslint';
import prettier from 'eslint-config-prettier';
import pluginPrettier from 'eslint-plugin-prettier';
import pluginTypeScript from '@typescript-eslint/eslint-plugin';
import parserTypeScript from '@typescript-eslint/parser';

export default [
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: parserTypeScript,
    },

    plugins: {
      '@typescript-eslint': pluginTypeScript,
      prettier: pluginPrettier,
    },

    rules: {
      ...eslint.recommended,
      ...pluginTypeScript.configs.recommended.rules,
      ...prettier.rules,

      // Custom rules
      'prettier/prettier': 'error',
      curly: ['error', 'all'], // Enforce braces around all blocks
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
      'linebreak-style': 'off',
    },
  },
];
