const {
    resolve,
} = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    context: resolve(__dirname, 'src'),
    entry: {
        app: ['./index.ts']
    },
    devtool: 'inline-source-map',
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
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }, {
                test: /\.css$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader
                    }, {
                        loader: "css-loader",
                        options: {
                            sourceMap: true,
                            modules: true,
                            localIdentName: "[local]"
                        }
                    }
                ]
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    plugins: [
        new MiniCssExtractPlugin(
            {
                filename: "[hash].css",
                chunkFilename: "[id].css"
            }),
        new HtmlWebpackPlugin({
            inject: true,
            template: 'index.html',
            minify: false
        })
    ]
};