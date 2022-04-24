const { createProxyMiddleware } = require('http-proxy-middleware');

const proxyHost = process.env.PROXY_HOSTNAME || "localhost"
const proxyPort = process.env.PROXY_PORT || "7000"

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: `http://${proxyHost}:${proxyPort}`,
      changeOrigin: true,
    }),
  );
  app.use(
    '/socket.io',
    createProxyMiddleware({
      target: `http://${proxyHost}:${proxyPort}`,
      changeOrigin: true,
      ws: true,
    }),
  );
};
