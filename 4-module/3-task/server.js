const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  if (pathname.includes('/') || pathname.includes('..')) {
    res.statusCode = 400;
    res.end('included directory is not supported');
  }
  try {
    fs.accessSync(filepath, fs.constants.F_OK);
  } catch (err) {
    if (err.code === 'ENOENT'){
      res.statusCode = 404;
      res.end('File does not exist');
    }
  }

  switch (req.method) {
    case 'DELETE':
      fs.unlink(filepath, (err) => {
        if (err) {
          res.statusCode = 500;
          res.end('An error occured during delete');
        }
        res.statusCode = 200;
        res.end('File successfully deleted');
      });
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
