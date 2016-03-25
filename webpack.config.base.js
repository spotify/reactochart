var path = require('path');
var webpack = require('webpack');

module.exports = {
    context: __dirname,
    entry: [
        './examples/src/main.js'
    ],
    output: {
        path: path.join(__dirname, 'examples/build'),
        filename: 'bundle.js',
        publicPath: '/build/'
    },
    devtool: 'source-map',
    plugins: [
        new webpack.NoErrorsPlugin()
    ],
    resolve: {
        extensions: ['', '.js', '.jsx']
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                loaders: ['babel-loader'],
                exclude: /node_modules/
            },
            {
                test: /\.less?$/,
                loader: "style!css!less"
            },
            {
                test: /\.json$/,
                loader: "json"
            }
        ]
    }
};
