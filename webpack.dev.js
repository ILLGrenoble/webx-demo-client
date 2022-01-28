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
        '/ws/relay': {
          target: 'ws://localhost:8080',
          secure: false,
          pathRewrite: {
            '^/ws/relay': '/'
          },
          changeOrigin: true,
          ws: true,
        },
      },
    },
});
