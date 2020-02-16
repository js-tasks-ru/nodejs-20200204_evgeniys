const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);
    this.data = '';
  }

  _transform(chunk, encoding, callback) {
    if (this.data) {
      chunk = this.data + chunk.toString();
    }
    const chunkArr = chunk.toString().split(`${os.EOL}`);
    if (chunk.toString().lastIndexOf(`${os.EOL}`) !== chunk.toString().length - 1) {
      this.data = chunkArr.pop();
    }

    for (const row of chunkArr) {
      this.push(row);
    }
    callback();
  }

  _flush(callback) {
    callback(null, this.data);
  }
}

module.exports = LineSplitStream;
