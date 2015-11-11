var path = require('path');
var webpack = require('webpack');
var _ = require('lodash');
var config = require('./webpack.config.base');

config = _.merge(config, {
    entry: [
        './tests/index.js'
    ],
    output: {
        path: path.join(__dirname, 'tests/build'),
        filename: 'bundle.js',
        publicPath: '/build/'
    }
});

//delete config.devtool;

module.exports = config;
