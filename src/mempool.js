class Mempool {
  constructor() {
    this.transactions = [];
  }

  addTransaction(transaction) {
    this.transactions.push(transaction);
  }

  getTransactions() {
    return this.transactions;
  }

  clear() {
    this.transactions = [];
  }

  getSize() {
    return this.transactions.length;
  }
}

module.exports = Mempool;
