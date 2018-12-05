const path = require('path');
const webpack = require('webpack');
const HtmlPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: "development",
  context: __dirname,
  entry: [
    './docs/src/main.js'
  ],
  output: {
    path: path.join(__dirname, 'docs/build'),
    filename: 'bundle.[hash].js',
  },
  devServer: {
    port: 9876,
    contentBase: path.join(__dirname, "docs/build"),
  },
  devtool: 'source-map',
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new HtmlPlugin({
      // put built html file in /docs/index.html ('../' because relative to /docs/build)
      // filename: path.join(__dirname, 'docs/index.html'),
      title: "Reactochart Docs",
      template: "docs/src/index_html.ejs"
    }),
    new CopyPlugin([{from: path.join(__dirname, 'docs/assets'), to: 'assets'}])
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
      }
    ]
  }
};
