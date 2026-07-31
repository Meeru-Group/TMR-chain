const crypto = require("crypto");

class Wallet {
  constructor() {
    this.privateKey = crypto.randomBytes(32).toString("hex");
    this.publicKey = crypto.createHash("sha256")
      .update(this.privateKey)
      .digest("hex");
  }

  getAddress() {
    return this.publicKey;
  }
}

module.exports = Wallet;
