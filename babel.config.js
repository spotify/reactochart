module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          browsers: '> 3%',
        },
      },
    ],
    '@babel/preset-react',
    '@babel/preset-flow',
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-object-rest-spread',
  ],
  env: {
    production: {
      plugins: ['lodash'],
    },
    test: {
      plugins: ['babel-plugin-rewire'],
    },
  },
};
