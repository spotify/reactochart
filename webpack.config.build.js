// This webpack file is used for the documentation build

const _ = require('lodash');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

let config = require('./webpack.config.base');

config = _.merge(config, {
  mode: 'production',
  plugins: config.plugins.concat([new CleanWebpackPlugin()]),
});

module.exports = config;
