module.exports = {
  settings: {
    react: {
      version: 'detect',
    },
  },
  parser: '@babel/eslint-parser',
  extends: [
    '@spotify/eslint-config-react',
    '@spotify/eslint-config-base',
    'prettier',
    'plugin:chai-friendly/recommended',
  ],
  env: { jest: true },
  plugins: ['jest', 'chai-friendly'],
  rules: {
    'consistent-return': 'off',
    'no-nested-ternary': 'off',
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/no-noninteractive-element-interactions': 'off',
    'no-restricted-imports': ['error', 'd3'],
  },
};
