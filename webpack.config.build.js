var webpack = require('webpack');
var _ = require('lodash');
var config = require('./webpack.config.base');

config = _.merge(config, {
  plugins: config.plugins.concat([
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    // new webpack.optimize.UglifyJsPlugin()
  ])
});

module.exports = config;
