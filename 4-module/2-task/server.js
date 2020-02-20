const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const LimitSizeStream = require('./LimitSizeStream');

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  const ws = fs.createWriteStream(filepath, {flags: 'wx'});
  const limitStream = new LimitSizeStream({limit: 1000000});

  if (pathname.includes('/') || pathname.includes('..')) {
    res.statusCode = 400;
    res.end('included directory is not supported');
  }

  req
      .on('error', (err) => {
        res.statusCode = 500;
        res.end('Internal server error occured');
      })
      .on('close', () => {
        if (req.complete) return;
        ws.destroy();
        fs.unlinkSync(filepath);
      });

  switch (req.method) {
    case 'POST':
      req
          .pipe(limitStream)
          .on('error', (err) => {
            if (err.code === 'LIMIT_EXCEEDED') {
              res.statusCode = 413;
              res.end('File size limit exceeded');
            }
          })
          .pipe(ws)
          .on('error', (err) => {
            if (err.code === 'EEXIST') {
              res.statusCode = 409;
              res.end('File already exist!');
            }
          })
          .on('close', () => {
            res.statusCode = 201;
            res.end('File has been uploaded');
          });
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
