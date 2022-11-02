const { resolve } = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    context: resolve(__dirname, 'src'),
    devtool: false,
    mode: 'production',
    entry: './index.ts',
    output: {
        filename: 'index.js',
        path: resolve(__dirname, 'dist'),
        library: {
          name: 'webx-web',
          type: 'umd',
        },
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/
        }
      ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          minify: TerserPlugin.uglifyJsMinify,
          terserOptions: {},
        })
      ],
    },
};
