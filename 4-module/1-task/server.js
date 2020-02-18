const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);
  const rs = fs.createReadStream(filepath);

  rs.on('error', (err)=>{
    if (err = 'ENOENT') {
      res.statusCode = 404;
      res.end('file not found');
    }
  });

  switch (req.method) {
    case 'GET':
      if (pathname.includes('/')) {
        res.statusCode = 400;
        res.end('invalid path');
      }
      rs.pipe(res)
          .on('close', ()=>{
            res.end();
          });
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
