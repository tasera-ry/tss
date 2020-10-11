const { createProxyMiddleware } = require('http-proxy-middleware');
module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8000'
    })
  );
  app.use(
    '/socket.io',
    createProxyMiddleware({
      target: 'http://localhost:8000',
      ws: true
    })
  );
}