class Database {
  constructor() {
    this.blocks = [];
    this.transactions = [];
    this.accounts = [];
  }

  saveBlock(block) {
    this.blocks.push(block);
  }

  saveTransaction(tx) {
    this.transactions.push(tx);
  }

  getBlocks() {
    return this.blocks;
  }

  getTransactions() {
    return this.transactions;
  }
}

module.exports = Database;
