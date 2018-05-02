var path = require("path");
var webpack = require("webpack");
var _ = require("lodash");
var config = require("./webpack.config.base");
var CleanPlugin = require("clean-webpack-plugin");

config = _.merge(config, {
  plugins: config.plugins.concat([
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production")
      }
    }),
    new CleanPlugin([path.join(__dirname, "docs/build")])
  ])
});

module.exports = config;
