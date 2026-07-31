const config = {
  network: {
    name: "TMR Chain",
    chainId: 5524050,
    version: "1.0.0",
    blockTime: 5
  },

  server: {
    rpcPort: 8545,
    apiPort: 3000,
    p2pPort: 30303
  },

  mining: {
    difficulty: 4,
    reward: 100
  },

  token: {
    name: "TMR",
    symbol: "TMR",
    totalSupply: 10000000000
  }
};

module.exports = config;
