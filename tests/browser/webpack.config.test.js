var path = require("path");
var webpack = require("webpack");
var _ = require("lodash");
var HtmlPlugin = require("html-webpack-plugin");
var CleanPlugin = require("clean-webpack-plugin");

console.log("dirname", __dirname);
module.exports = {
  context: __dirname,
  entry: [path.join(__dirname, "index.js")],
  output: {
    path: path.join(__dirname, "build"),
    filename: "bundle.[hash].js"
  },
  devtool: "source-map",
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new HtmlPlugin({
      title: "Reactochart Tests",
      template: path.join(__dirname, "index_html.ejs")
    }),
    new CleanPlugin([path.join(__dirname, "build")])
  ],
  resolve: {
    extensions: [".js", ".jsx"],
    modules: ["node_modules", path.resolve(__dirname, "../..")]
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [{ loader: "babel-loader" }]
      },
      {
        test: /\.less?$/,
        use: [
          { loader: "style-loader" },
          { loader: "css-loader" },
          { loader: "less-loader" }
        ]
      },
      {
        test: /\.json$/,
        use: [{ loader: "json-loader" }]
      }
    ]
  },
  // https://github.com/airbnb/enzyme/issues/503
  externals: {
    jsdom: "window",
    cheerio: "window",
    "react/lib/ExecutionEnvironment": true,
    "react/addons": true,
    "react/lib/ReactContext": "window"
  }
};
