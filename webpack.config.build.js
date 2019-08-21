// This webpack file is used for the documentation build

const path = require('path');
const _ = require('lodash');
const CleanPlugin = require('clean-webpack-plugin');

let config = require('./webpack.config.base');

config = _.merge(config, {
  mode: 'production',
  plugins: config.plugins.concat([
    new CleanPlugin([path.join(__dirname, 'docs/build')]),
  ]),
});

module.exports = config;
