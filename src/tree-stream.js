var Readable = require('readable-stream').Readable;
var inherits = require('inherits');

var TreeStream = module.exports = function() {
  if (!(this instanceof TreeStream)) {
    return new TreeStream();
  }

  Readable.call(this, {
    objectMode: true
  });

  this._holding = [];
  this._waiting = false;
};

inherits(TreeStream, Readable);

TreeStream.prototype.writeTree = function(tree) {
  this._holding.push(tree);
  this._read(this._readableState.highWaterMark, true);
};

TreeStream.prototype._read = function(size, tryit) {
  if (!this._holding.length) {
    this._waiting = true;
    return;
  }

  if ((this._holding.length > this._readableState.highWaterMark) && tryit) {
    return;
  }

  this._waiting = false;

  if (!this.push(this._holding.shift())) {
    this._read();
  }
};