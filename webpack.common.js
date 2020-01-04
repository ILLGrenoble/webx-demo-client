const { resolve } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

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
            },
            {
              test: /\.s[ac]ss$/i,
              use: [
                // Creates `style` nodes from JS strings
                'style-loader',
                // Translates CSS into CommonJS
                'css-loader',
                // Compiles Sass to CSS
                'sass-loader',
              ],
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    plugins: [
        new HtmlWebpackPlugin({
            inject: true,
            template: 'index.html',
            minify: false
        })
    ]
};
