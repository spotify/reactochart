const path = require("path");
const webpack = require("webpack");
const _ = require("lodash");
const baseConfig = require("./webpack.config.base");
const CleanPlugin = require("clean-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

config = _.merge(baseConfig, {
  entry: {
    js: "./src/index.js",
    css: "./styles/charts.less"
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [{ loader: "babel-loader" }]
      },
      {
        test: /\.(css|less)$/,
        use: ExtractTextPlugin.extract(["css-loader", "less-loader"])
      },
      {
        test: /\.json$/,
        use: [{ loader: "json-loader" }]
      }
    ]
  },
  output: {
    path: path.join(__dirname, "dist/"),
    filename: "bundle.js",
    library: "reactochart",
    libraryTarget: "umd"
  },
  plugins: baseConfig.plugins.concat([
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production")
      }
    }),
    new CleanPlugin([path.join(__dirname, "dist")]),
    new ExtractTextPlugin("styles.css")
  ])
});

module.exports = config;
