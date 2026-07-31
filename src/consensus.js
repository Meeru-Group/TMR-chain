class Consensus {
  constructor() {
    this.algorithm = "Hybrid PoW + PoS";
  }

  getAlgorithm() {
    return this.algorithm;
  }

  validateBlock(block) {
    if (!block) return false;
    return true;
  }

  validateChain(chain) {
    return Array.isArray(chain);
  }
}

module.exports = Consensus;
