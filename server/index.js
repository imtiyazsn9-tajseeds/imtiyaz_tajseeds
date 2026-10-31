'use strict';

const http = require('http');
const config = require('./config');
const { dispatch } = require('./router');
const { serveStatic } = require('./static');

require('./routes/session');
require('./routes/images');
require('./routes/content');
require('./routes/contact');
require('./routes/backups');

function createServer() {
  return http.createServer(async (req, res) => {
    try {
      if (req.url.startsWith('/api/') && await dispatch(req, res)) return;
      if (req.url.startsWith('/api/')) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Unknown API endpoint' }));
        return;
      }
      serveStatic(req, res);
    } catch (err) {
      console.error('Unhandled error:', err);
      if (!res.headersSent) res.writeHead(500);
      res.end();
    }
  });
}

module.exports = { createServer };

if (require.main === module) {
  const server = createServer();
  server.listen(config.PORT, config.HOST, () => {
    console.log('====================================================');
    console.log(' Taj Seeds Agri Sciences Website Server Running!');
    console.log(` Local URL: http://localhost:${config.PORT}/`);
    console.log(` Admin URL: http://localhost:${config.PORT}/admin.html`);
    console.log('====================================================');
    if (config.USING_DEFAULT_PASSWORD) {
      console.warn('WARNING: ADMIN_PASSWORD is not set, using the default password. Set ADMIN_PASSWORD before going live.');
    }
  });

  const shutdown = () => server.close(() => process.exit(0));
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
