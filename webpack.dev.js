const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'eval-cheap-module-source-map',
    devServer: {
      allowedHosts: 'all',
      client: {
        logging: 'info',
      },
      compress: true,
      port: 9000,
      proxy: {
        '/relay/ws': {
          target: 'ws://localhost:8080',
          secure: false,
          pathRewrite: {
            '^/relay/ws': '/ws'
          },
          changeOrigin: true,
          ws: true,
        },
        '/relay/api': {
          target: 'http://localhost:8080',
          secure: false,
          pathRewrite: {
            '^/relay/api': '/api'
          },
        }
      },
    },
});
