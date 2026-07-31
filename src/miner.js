const Block = require("./block");

class Miner {
  constructor(blockchain) {
    this.blockchain = blockchain;
  }

  mine(data) {
    const latestBlock = this.blockchain.getLatestBlock();

    const block = new Block(
      latestBlock.index + 1,
      new Date().toISOString(),
      data,
      latestBlock.hash
    );

    this.blockchain.addBlock(block);

    console.log("⛏️ Block mined:", block);
    return block;
  }
}

module.exports = Miner;
