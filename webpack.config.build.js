var webpack = require('webpack');
// var CleanPlugin = require('clean-webpack-plugin');
var _ = require('lodash');
var config = require('./webpack.config.base');

config = _.merge(config, {
  plugins: config.plugins.concat([
    // new CleanPlugin(['build']),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new webpack.optimize.DedupePlugin(),
    // new webpack.optimize.UglifyJsPlugin()
  ])
});

module.exports = config;
