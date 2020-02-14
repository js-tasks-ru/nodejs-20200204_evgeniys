const stream = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {
  constructor(options) {
    super(options);
    this.limit = options.limit;
  }

  _transform(chunk, encoding, callback) {
    if (!this.chunk) {
      this.chunk = chunk;
    } else {
      this.chunk += chunk;
    }
    if (this.chunk.length > this.limit) {
      callback(new LimitExceededError('error limit exceeded'));
    } else {
      callback(null, chunk);
    }
  }
}

module.exports = LimitSizeStream;
