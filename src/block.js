class Block {
  constructor(index, timestamp, data, previousHash = "0") {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.hash = "";
  }
}

module.exports = Block;
