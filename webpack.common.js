const { resolve } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    context: resolve(__dirname, 'src'),
    devtool: 'eval-cheap-module-source-map',
    entry: {
        app: ['./index.ts']
    },
    output: {
        publicPath: '/',
        filename: '[contenthash].bundle.js',
        path: resolve(__dirname, 'dist')
    },
    watch: false,
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
          title: 'WebX',
          inject: true,
            template: 'index.html',
            minify: false
        })
    ]
};
