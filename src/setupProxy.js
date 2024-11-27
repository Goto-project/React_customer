const { create, createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
    app.use(
        '/ROOT/api',
        createProxyMiddleware({
            target : 'http://127.0.0.1:8080/ROOT/api',
            changeOrigin: true,
        })
    )
}