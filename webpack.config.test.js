var path = require('path');
var webpack = require('webpack');
var _ = require('lodash');
var config = require('./webpack.config.base');
var HtmlPlugin = require('html-webpack-plugin');
var CleanPlugin = require('clean-webpack-plugin');

module.exports = {
  context: __dirname,
  entry: [
    './tests/index.js'
  ],
  output: {
    path: path.join(__dirname, 'tests/build'),
    filename: 'bundle.[hash].js',
  },
  devtool: 'source-map',
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new HtmlPlugin({
      title: "Reactochart Tests",
      template: "tests/index_html.ejs",
    }),
    new CleanPlugin([path.join(__dirname, 'tests/build')])
  ],
  resolve: {
    extensions: ['.js', '.jsx']
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [{loader: 'babel-loader'}]
      },
      {
        test: /\.less?$/,
        use: [
          {loader: 'style-loader'},
          {loader: 'css-loader'},
          {loader: 'less-loader'}
        ]
      },
      {
        test: /\.json$/,
        use: [{loader: 'json-loader'}]
      }
    ]
  },
  // https://github.com/airbnb/enzyme/issues/503
  externals: {
    'jsdom': 'window',
    'cheerio': 'window',
    'react/lib/ExecutionEnvironment': true,
    'react/addons': true,
    'react/lib/ReactContext': 'window'
  },
};



// config = _.merge(config, {
//     entry: [
//         './tests/index.js'
//     ],
//     output: {
//         path: path.join(__dirname, 'tests/build'),
//         filename: 'bundle.js',
//         publicPath: '/build/'
//     }
// });
//
// //delete config.devtool;
//
// module.exports = config;
