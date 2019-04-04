const {
    resolve,
} = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    context: resolve(__dirname, 'src'),
    entry: {
        app: ['./index.js']
    },
    output: {
        publicPath: '/',
        filename: '[hash].bundle.js',
        path: resolve(__dirname, 'dist')
    },
    watch: false,
    devServer: {
        watchContentBase: false,
        compress: false,
        port: 9000,
        stats: {
            colors: true
        }
    },
    module: {
        rules: [{
            test: /\.css$/,
            use: [
                {
                    loader: MiniCssExtractPlugin.loader
                }, {
                    loader: "css-loader",
                    options: {
                        sourceMap: true,
                        modules: true,
                        localIdentName: "[local]___[hash:base64:5]"
                    }
                }
            ]
        }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin(
            {
                filename: "[name].css",
                chunkFilename: "[id].css"
            }),
        new HtmlWebpackPlugin({
            inject: true,
            template: 'index.html',
            minify: false
        })
    ]
};