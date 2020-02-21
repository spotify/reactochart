module.exports = {
  settings: {
    react: {
      version: 'detect',
    },
  },
  parser: 'babel-eslint',
  extends: [
    '@spotify/eslint-config-react',
    '@spotify/eslint-config-base',
    'prettier',
    'plugin:chai-friendly/recommended',
  ],
  rules: {
    'consistent-return': 'off',
    'no-nested-ternary': 'off',
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/no-noninteractive-element-interactions': 'off',
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      extends: ['@spotify/eslint-config-typescript'],
    },
    {
      files: ['tests/**'],
      env: { jest: true },
      plugins: ['jest', 'chai-friendly'],
      globals: {
        chai: true,
        mocha: true,
      },
      rules: {
        'no-console': 'off',
        'react/prop-types': 'off',
        'react/no-multi-comp': 'off',
      },
    },
    {
      files: ['scripts/**'],
      rules: {
        'no-console': 'off',
      },
    },
  ],
};
