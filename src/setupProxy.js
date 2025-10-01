// Development proxy to bypass CORS for API requests
// Docs: https://create-react-app.dev/docs/proxying-api-requests-in-development/
const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://lay6ofk.com',
      changeOrigin: true,
      // Optionally log proxy for debugging
      // logLevel: 'debug',
    })
  )
}


