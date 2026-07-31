const Block = require("./block");

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
  }

  createGenesisBlock() {
    return new Block(
      0,
      new Date().toISOString(),
      "Genesis Block",
      "0"
    );
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(block) {
    block.previousHash = this.getLatestBlock().hash;
    this.chain.push(block);
  }
}

module.exports = Blockchain;
