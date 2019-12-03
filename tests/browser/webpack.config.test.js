const path = require('path');
const webpack = require('webpack');
const HtmlPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  mode: 'development',
  context: __dirname,
  entry: [path.join(__dirname, 'index.js')],
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'bundle.[hash].js',
  },
  devtool: 'source-map',
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new HtmlPlugin({
      title: 'Reactochart Tests',
      template: path.join(__dirname, 'index_html.ejs'),
    }),
    new CleanWebpackPlugin(),
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
    modules: ['node_modules', path.resolve(__dirname, '../..')],
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.less?$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          { loader: 'less-loader' },
        ],
      },
      {
        test: /\.json$/,
        use: [{ loader: 'json-loader' }],
      },
    ],
  },
  // https://github.com/airbnb/enzyme/issues/503
  externals: {
    jsdom: 'window',
    cheerio: 'window',
    'react/lib/ExecutionEnvironment': true,
    'react/addons': true,
    'react/lib/ReactContext': 'window',
  },
};
