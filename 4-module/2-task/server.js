const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const LimitSizeStream = require('./LimitSizeStream');

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'POST':

      if (path.basename(pathname) !== pathname) {
        res.statusCode = 400;
        res.end('Invalid path');
        return;
      }
      const writeFile = fs.createWriteStream(filepath, {flags: 'wx'});
      const limitedStream = new LimitSizeStream({limit: 1048576});
      req.pipe(limitedStream).pipe(writeFile);

      limitedStream.on('error', (err) => {
        if (err.code === 'LIMIT_EXCEEDED') {
          res.statusCode = 413;
          res.end('Max file size exceeded');
          return;
        } else {
          res.statusCode = 500;
          res.end('Internal Error');
        }
      });
      writeFile.on('error', (err) => {
        if (err.code === 'EEXIST') {
          res.statusCode = 409;
          res.end('File already exist');
        } else {
          res.statusCode = 500;
          res.end('Internal Error');
        }
      });
      writeFile.on('close', () => {
        res.statusCode = 201;
        res.end('File was written');
      });
      req.on('close', () => {
        if (req.complete) return;
        writeFile.destroy();
        fs.unlinkSync(filepath);
      });
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
