const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
        watchContentBase: false,
        compress: false,
        port: 9000,
        stats: {
            colors: true
        }
    }
});