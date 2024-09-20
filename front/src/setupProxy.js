const { createProxyMiddleware } = require('http-proxy-middleware');

const proxyHost = process.env.PROXY_HOSTNAME || 'localhost';
const proxyPort = process.env.PROXY_PORT || '8000';

module.exports = function (app) {
  app.use(
    createProxyMiddleware('/api', {
      target: `http://${proxyHost}:${proxyPort}`,
      changeOrigin: true,
    }),
  );
  app.use(
    createProxyMiddleware('/socket.io', {
      target: `http://${proxyHost}:${proxyPort}`,
      changeOrigin: true,
      ws: true,
    }),
  );
};
