const express = require("express");

class RPCServer {
  constructor(blockchain) {
    this.blockchain = blockchain;
    this.app = express();

    this.app.use(express.json());

    this.app.get("/status", (req, res) => {
      res.json({
        network: "TMR Chain",
        status: "running",
        blocks: this.blockchain.chain.length
      });
    });

    this.app.get("/blocks", (req, res) => {
      res.json(this.blockchain.chain);
    });

    this.app.post("/transaction", (req, res) => {
      res.json({
        success: true,
        message: "Transaction received",
        data: req.body
      });
    });
  }

  start(port = 3000) {
    this.app.listen(port, () => {
      console.log(`🚀 TMR RPC Server running on port ${port}`);
    });
  }
}

module.exports = RPCServer;
