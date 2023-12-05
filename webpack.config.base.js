const path = require('path');
const HtmlPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  context: __dirname,
  entry: ['./docs/src/main.js'],
  output: {
    path: path.join(__dirname, 'docs/build'),
    filename: 'bundle.[fullhash].js',
  },
  devServer: {
    port: 9876,
    static: {
      directory: path.join(__dirname, 'docs/build'),
    },
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        use: 'babel-loader',
        test: /\.jsx?$/,
        exclude: /node_modules/,
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
        test: /\.js.example/,
        use: 'raw-loader',
      },
    ],
  },
  optimization: {
    emitOnErrors: false,
  },
  plugins: [
    new HtmlPlugin({
      // put built html file in /docs/index.html ('../' because relative to /docs/build)
      // filename: path.join(__dirname, 'docs/index.html'),
      title: 'Reactochart Docs',
      template: 'docs/src/index_html.ejs',
    }),
    new CopyPlugin({
      patterns: [{ from: path.join(__dirname, 'docs/assets'), to: 'assets' }],
    }),
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
  },
};
