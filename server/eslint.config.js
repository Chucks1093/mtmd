module.exports = {
   parser: '@typescript-eslint/parser',
   plugins: ['@typescript-eslint'],
   extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
   env: {
      node: true,
      es6: true,
   },
   rules: {
      // Disable base rule and use TypeScript version
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
         'warn', // 'warn' gives yellow lines, 'error' gives red lines
         {
            vars: 'all',
            varsIgnorePattern: '^_', // Ignore variables starting with _
            args: 'after-used',
            argsIgnorePattern: '^_', // Ignore parameters starting with _
            ignoreRestSiblings: true,
         },
      ],
      // For unused imports specifically
      '@typescript-eslint/no-unused-imports': 'warn', // If you install this plugin
   },
};
