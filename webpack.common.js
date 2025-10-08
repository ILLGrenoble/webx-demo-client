const { resolve } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    context: resolve(__dirname, 'src'),
    devtool: 'source-map',
    entry: {
        app: ['./index.ts']
    },
    output: {
        publicPath: '/',
        filename: '[contenthash].bundle.js',
        path: resolve(__dirname, 'dist')
    },
    watch: false,
    performance: {
      hints: false
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
              test: /\.js$/,
              enforce: "pre",
              use: ["source-map-loader"],
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
    ignoreWarnings: [/Failed to parse source map/],
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        fallback: {
          "buffer": require.resolve("buffer")
        }
    },
    plugins: [
        new HtmlWebpackPlugin({
          title: 'WebX',
          inject: true,
            template: 'index.html',
            minify: false
        }),
        // Work around for Buffer is undefined:
        // https://github.com/webpack/changelog-v5/issues/10
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
        }),
    ]
};
