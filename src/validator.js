class Validator {
  validateTransaction(transaction) {
    if (!transaction) return false;

    if (!transaction.from || !transaction.to) {
      return false;
    }

    if (transaction.amount <= 0) {
      return false;
    }

    return true;
  }

  validateBlock(block) {
    return !!block;
  }
}

module.exports = Validator;
