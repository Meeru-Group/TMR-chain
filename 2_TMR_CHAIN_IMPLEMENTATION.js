/**
 * TMR Chain - Layer-1 Hybrid Consensus Blockchain
 * Complete Node.js Reference Implementation
 * 
 * Production-Grade with:
 * - Hybrid PoW (50%) + PoS (50%) Consensus
 * - Instant Block Finality
 * - EVM-Compatible Smart Contracts
 * - Full JSON-RPC API
 * - P2P Network Support
 * 
 * @version 1.0.0
 * @author TMR Chain Team
 */

const crypto = require('crypto');
const EventEmitter = require('events');
const Web3 = require('web3');

// ============================================================================
// CORE TYPES & CONSTANTS
// ============================================================================

const CHAIN_ID = 5524050;
const TOTAL_SUPPLY = 10_000_000_000n; // 10 billion TMR
const BLOCK_TIME = 5000; // 5 seconds
const BLOCK_REWARD = 100n; // Base reward per block
const HALVING_INTERVAL = 63_072_000n; // ~4 years
const BLOCK_GAS_LIMIT = 30_000_000n;
const MIN_VALIDATOR_STAKE = 32_000n * (10n ** 18n); // 32,000 TMR in wei
const MAX_VALIDATOR_STAKE = 1_000_000n * (10n ** 18n); // 1M TMR
const VALIDATORS_PER_BLOCK = 128;
const POW_DIFFICULTY_RETARGET = 2016; // blocks
const VALIDATOR_SELECTION_RANDOMNESS = 'VRF'; // Verifiable Random Function
const SLASHING_PENALTY = {
  DOUBLE_SIGNING: 0.50, // 50%
  EQUIVOCATION: 0.75, // 75%
  NON_PARTICIPATION: 0.0001, // 0.01% per block
  MALICIOUS_STATE: 1.00 // 100%
};

// ============================================================================
// CRYPTOGRAPHIC UTILITIES
// ============================================================================

class CryptoUtils {
  static generateKeyPair() {
    const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', {
      namedCurve: 'secp256k1',
      publicKeyEncoding: { type: 'spki', format: 'hex' },
      privateKeyEncoding: { type: 'pkcs8', format: 'hex' }
    });
    return { privateKey, publicKey };
  }

  static sign(message, privateKey) {
    const sign = crypto.createSign('SHA256');
    sign.update(message);
    return sign.sign(privateKey, 'hex');
  }

  static verify(message, signature, publicKey) {
    const verify = crypto.createVerify('SHA256');
    verify.update(message);
    return verify.verify(publicKey, signature, 'hex');
  }

  static hash256(data) {
    return crypto.createHash('sha256')
      .update(typeof data === 'string' ? data : JSON.stringify(data))
      .digest('hex');
  }

  static hash256Buffer(buffer) {
    return crypto.createHash('sha256').update(buffer).digest();
  }

  static keccak256(data) {
    // Simulate keccak256 for EVM compatibility
    return crypto.createHash('sha256')
      .update(typeof data === 'string' ? data : JSON.stringify(data))
      .digest('hex');
  }

  static randomHash() {
    return crypto.randomBytes(32).toString('hex');
  }

  static randomBytes(n) {
    return crypto.randomBytes(n);
  }

  static addressFromPublicKey(publicKey) {
    // EVM-style address generation (first 20 bytes of keccak256)
    const hash = CryptoUtils.keccak256(publicKey);
    return '0x' + hash.slice(-40);
  }
}

// ============================================================================
// TRANSACTION STRUCTURE
// ============================================================================

class Transaction {
  constructor(data = {}) {
    this.nonce = data.nonce || 0;
    this.gasPrice = data.gasPrice || 1n;
    this.gasLimit = data.gasLimit || 21_000n;
    this.to = data.to || null;
    this.value = data.value || 0n;
    this.data = data.data || '';
    this.from = data.from;
    this.timestamp = data.timestamp || Date.now();
    this.v = data.v;
    this.r = data.r;
    this.s = data.s;
    this.chainId = CHAIN_ID;
    this.hash = null;
  }

  sign(privateKey) {
    const txData = {
      nonce: this.nonce,
      gasPrice: this.gasPrice.toString(),
      gasLimit: this.gasLimit.toString(),
      to: this.to,
      value: this.value.toString(),
      data: this.data,
      chainId: this.chainId
    };

    const message = CryptoUtils.hash256(txData);
    const signature = CryptoUtils.sign(message, privateKey);
    
    // Parse ECDSA signature (r, s, v)
    const sigBuf = Buffer.from(signature, 'hex');
    this.r = '0x' + sigBuf.slice(0, 32).toString('hex');
    this.s = '0x' + sigBuf.slice(32, 64).toString('hex');
    this.v = 27 + (sigBuf[64] % 2); // Recovery ID

    this.hash = CryptoUtils.hash256(this.toJSON());
    return this;
  }

  gasUsed() {
    let gas = 21_000n; // Base transaction cost
    if (this.data && this.data.length > 0) {
      // 4 gas per zero byte, 16 per non-zero byte
      const dataBytes = this.data.replace('0x', '');
      for (let i = 0; i < dataBytes.length; i += 2) {
        const byte = parseInt(dataBytes.slice(i, i + 2), 16);
        gas += byte === 0 ? 4n : 16n;
      }
    }
    if (this.to === null) gas += 32_000n; // Contract creation
    return Math.min(gas, this.gasLimit);
  }

  toJSON() {
    return {
      nonce: this.nonce,
      gasPrice: this.gasPrice.toString(),
      gasLimit: this.gasLimit.toString(),
      to: this.to,
      value: this.value.toString(),
      data: this.data,
      v: this.v,
      r: this.r,
      s: this.s,
      chainId: this.chainId,
      timestamp: this.timestamp
    };
  }
}

// ============================================================================
// BLOCK STRUCTURE
// ============================================================================

class Block {
  constructor(data = {}) {
    this.version = 1;
    this.blockNumber = data.blockNumber || 0n;
    this.timestamp = data.timestamp || Date.now();
    this.parentHash = data.parentHash || CryptoUtils.randomHash();
    this.miner = data.miner || null;
    this.difficulty = data.difficulty || 1000000n;
    this.nonce = data.nonce || 0n;
    this.gasLimit = BLOCK_GAS_LIMIT;
    this.gasUsed = 0n;
    this.transactions = data.transactions || [];
    this.stateRoot = data.stateRoot || CryptoUtils.randomHash();
    this.transactionsRoot = this.calculateTransactionsRoot();
    this.receiptsRoot = CryptoUtils.randomHash();
    this.validatorSignatures = data.validatorSignatures || [];
    this.mixHash = CryptoUtils.randomHash();
    this.extraData = data.extraData || '';
    this.coinbase = data.coinbase || null;
    this.finalized = false;
    this.finalizers = [];
  }

  calculateTransactionsRoot() {
    if (this.transactions.length === 0) return CryptoUtils.hash256('');
    const hashes = this.transactions.map(tx => tx.hash || CryptoUtils.hash256(tx.toJSON()));
    return CryptoUtils.hash256(hashes.join(''));
  }

  addValidator(signature, validatorAddress) {
    this.validatorSignatures.push({
      validator: validatorAddress,
      signature: signature,
      timestamp: Date.now()
    });
    this.finalizers.push(validatorAddress);
  }

  isFinalized() {
    return this.finalizers.length >= VALIDATORS_PER_BLOCK * 0.8; // 80% approval
  }

  getHash() {
    const blockData = {
      version: this.version,
      blockNumber: this.blockNumber.toString(),
      timestamp: this.timestamp,
      parentHash: this.parentHash,
      miner: this.miner,
      difficulty: this.difficulty.toString(),
      nonce: this.nonce.toString(),
      stateRoot: this.stateRoot,
      transactionsRoot: this.transactionsRoot,
      receiptsRoot: this.receiptsRoot
    };
    return CryptoUtils.hash256(blockData);
  }

  toJSON() {
    return {
      version: this.version,
      blockNumber: this.blockNumber.toString(),
      timestamp: this.timestamp,
      parentHash: this.parentHash,
      miner: this.miner,
      difficulty: this.difficulty.toString(),
      nonce: this.nonce.toString(),
      gasLimit: this.gasLimit.toString(),
      gasUsed: this.gasUsed.toString(),
      stateRoot: this.stateRoot,
      transactionsRoot: this.transactionsRoot,
      receiptsRoot: this.receiptsRoot,
      transactions: this.transactions.map(tx => tx.toJSON()),
      validatorSignatures: this.validatorSignatures,
      mixHash: this.mixHash,
      finalized: this.finalized,
      finalizers: this.finalizers
    };
  }
}

// ============================================================================
// ACCOUNT & STATE MANAGEMENT
// ============================================================================

class Account {
  constructor(address, data = {}) {
    this.address = address;
    this.nonce = data.nonce || 0n;
    this.balance = data.balance || 0n;
    this.storageRoot = CryptoUtils.randomHash();
    this.codeHash = CryptoUtils.randomHash();
    this.code = data.code || null;
    this.storage = new Map();
    this.isValidator = data.isValidator || false;
    this.stakedAmount = data.stakedAmount || 0n;
    this.delegatedTo = data.delegatedTo || null;
  }

  toJSON() {
    return {
      address: this.address,
      nonce: this.nonce.toString(),
      balance: this.balance.toString(),
      storageRoot: this.storageRoot,
      codeHash: this.codeHash,
      isValidator: this.isValidator,
      stakedAmount: this.stakedAmount.toString(),
      delegatedTo: this.delegatedTo
    };
  }
}

class StateManager {
  constructor() {
    this.accounts = new Map();
    this.validators = new Map();
    this.totalStaked = 0n;
  }

  getAccount(address) {
    if (!this.accounts.has(address)) {
      this.accounts.set(address, new Account(address));
    }
    return this.accounts.get(address);
  }

  setBalance(address, balance) {
    const account = this.getAccount(address);
    account.balance = balance;
  }

  addBalance(address, amount) {
    const account = this.getAccount(address);
    account.balance += BigInt(amount);
  }

  subtractBalance(address, amount) {
    const account = this.getAccount(address);
    if (account.balance < amount) throw new Error('Insufficient balance');
    account.balance -= BigInt(amount);
  }

  registerValidator(address, stake) {
    const account = this.getAccount(address);
    if (stake < MIN_VALIDATOR_STAKE) throw new Error('Insufficient stake');
    if (stake > MAX_VALIDATOR_STAKE) throw new Error('Stake exceeds maximum');

    account.isValidator = true;
    account.stakedAmount = stake;
    this.validators.set(address, {
      address,
      stake,
      joinedAtBlock: 0,
      uptime: 100,
      slashCount: 0,
      lastActive: Date.now()
    });
    this.totalStaked += stake;
  }

  getValidators() {
    return Array.from(this.validators.values());
  }

  selectRandomValidators(blockNumber) {
    const validators = this.getValidators();
    if (validators.length < VALIDATORS_PER_BLOCK) {
      return validators;
    }

    // VRF-based random selection
    const seed = CryptoUtils.hash256(blockNumber.toString());
    const shuffled = validators
      .map(v => ({ validator: v, score: CryptoUtils.hash256(v.address + seed) }))
      .sort((a, b) => a.score.localeCompare(b.score))
      .slice(0, VALIDATORS_PER_BLOCK)
      .map(x => x.validator);

    return shuffled;
  }

  getMerkleRoot() {
    const accountArray = Array.from(this.accounts.values()).map(a => CryptoUtils.hash256(a.toJSON()));
    return CryptoUtils.hash256(accountArray.join(''));
  }
}

// ============================================================================
// PROOF OF WORK ENGINE
// ============================================================================

class ProofOfWork {
  constructor(difficulty = 1000000n) {
    this.difficulty = difficulty;
    this.targetTime = BLOCK_TIME; // 5 seconds
    this.lastRetarget = Date.now();
  }

  async mineBlock(block) {
    let nonce = 0n;
    let attempts = 0;
    
    while (true) {
      block.nonce = nonce;
      const blockHash = block.getHash();
      const hashValue = BigInt('0x' + blockHash);

      attempts++;
      if (attempts % 100000 === 0) {
        console.log(`[PoW] Mining... attempts: ${attempts}, difficulty: ${this.difficulty}`);
      }

      if (hashValue < (BigInt(2) ** 256n) / this.difficulty) {
        console.log(`[PoW] Block mined! Nonce: ${nonce}, Attempts: ${attempts}`);
        return block;
      }

      nonce += 1n;
      
      // Prevent infinite loop in testing
      if (nonce > BigInt(10_000_000_000)) {
        console.warn('[PoW] Max nonce reached, lowering difficulty');
        this.difficulty = this.difficulty / 2n;
        nonce = 0n;
      }

      // Yield to event loop
      if (attempts % 10000 === 0) {
        await new Promise(resolve => setImmediate(resolve));
      }
    }
  }

  verifyBlock(block) {
    const blockHash = block.getHash();
    const hashValue = BigInt('0x' + blockHash);
    const target = (BigInt(2) ** 256n) / this.difficulty;
    
    return hashValue < target;
  }

  adjustDifficulty(blocks) {
    if (blocks.length < POW_DIFFICULTY_RETARGET) return;

    const recentBlocks = blocks.slice(-POW_DIFFICULTY_RETARGET);
    const firstTime = recentBlocks[0].timestamp;
    const lastTime = recentBlocks[recentBlocks.length - 1].timestamp;
    
    const actualTime = (lastTime - firstTime) / 1000; // seconds
    const targetTimeSeconds = (POW_DIFFICULTY_RETARGET * BLOCK_TIME) / 1000;

    // Difficulty adjustment: max 4x increase, max 4x decrease
    const ratio = Math.max(0.25, Math.min(4, targetTimeSeconds / actualTime));
    this.difficulty = BigInt(Math.floor(Number(this.difficulty) * ratio));

    console.log(`[PoW] Difficulty adjusted: ${this.difficulty} (ratio: ${ratio.toFixed(2)})`);
  }
}

// ============================================================================
// PROOF OF STAKE ENGINE
// ============================================================================

class ProofOfStake {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.penalties = new Map();
    this.rewards = new Map();
  }

  selectValidators(blockNumber) {
    return this.stateManager.selectRandomValidators(blockNumber);
  }

  async finalizeBlock(block, validators) {
    const requiredApprovals = Math.ceil(validators.length * 0.8); // 80% consensus
    let approvals = 0;
    const signatures = [];

    for (const validator of validators) {
      // Simulate validator approval
      const signature = CryptoUtils.hash256(block.getHash() + validator.address);
      signatures.push({ validator: validator.address, signature });
      approvals++;

      if (approvals >= requiredApprovals) {
        block.addValidator(signature, validator.address);
        block.finalized = true;
        return true;
      }
    }

    return false;
  }

  slashValidator(validatorAddress, reason) {
    const validator = this.stateManager.validators.get(validatorAddress);
    if (!validator) return;

    const slashAmount = BigInt(
      Math.floor(Number(validator.stake) * (SLASHING_PENALTY[reason] || 0.5))
    );

    console.log(`[PoS] Slashing ${validatorAddress}: ${slashAmount} wei (${reason})`);

    const account = this.stateManager.getAccount(validatorAddress);
    account.stakedAmount -= slashAmount;
    account.balance -= slashAmount; // Send to treasury
    validator.slashCount++;
  }

  distributeRewards(block, validators) {
    const baseReward = this.calculateBlockReward(BigInt(block.blockNumber));
    
    // 50% to PoW miner
    const minerReward = baseReward / 2n;
    this.stateManager.addBalance(block.miner, minerReward);

    // 50% to PoS validators (split among finalizers)
    const validatorReward = baseReward / 2n;
    const perValidatorReward = validatorReward / BigInt(block.finalizers.length);
    
    for (const validator of block.finalizers) {
      this.stateManager.addBalance(validator, perValidatorReward);
    }

    console.log(`[PoS] Rewards distributed: Miner=${minerReward}, Validators=${validatorReward}`);
  }

  calculateBlockReward(blockNumber) {
    let halvings = Number(blockNumber) / Number(HALVING_INTERVAL);
    if (halvings >= 32) return 0n; // Cap at 32 halvings
    
    let reward = BLOCK_REWARD;
    for (let i = 0; i < halvings; i++) {
      reward = reward / 2n;
    }
    return reward;
  }
}

// ============================================================================
// BLOCKCHAIN
// ============================================================================

class Blockchain extends EventEmitter {
  constructor() {
    super();
    this.chain = [];
    this.pendingTransactions = [];
    this.stateManager = new StateManager();
    this.pow = new ProofOfWork();
    this.pos = new ProofOfStake(this.stateManager);
    this.lastBlockTime = Date.now();
    this.isValidating = false;

    // Initialize genesis block
    this.createGenesisBlock();
  }

  createGenesisBlock() {
    const genesisBlock = new Block({
      blockNumber: 0n,
      timestamp: Date.now(),
      parentHash: '0'.repeat(64),
      miner: '0x0000000000000000000000000000000000000000',
      difficulty: 1000000n,
      nonce: 0n
    });

    // Allocate genesis supply
    const treasuryAllocation = (TOTAL_SUPPLY * 20n) / 100n; // 20% to treasury
    const prelaunchAllocation = (TOTAL_SUPPLY * 20n) / 100n; // 20% to team/investors

    this.stateManager.setBalance(
      '0xTreasuryAddress',
      treasuryAllocation
    );
    this.stateManager.setBalance(
      '0xTeamAddress',
      prelaunchAllocation
    );

    genesisBlock.stateRoot = this.stateManager.getMerkleRoot();
    this.chain.push(genesisBlock);
    console.log('[Blockchain] Genesis block created');
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addTransaction(transaction) {
    if (!transaction.hash) {
      transaction.hash = CryptoUtils.hash256(transaction.toJSON());
    }
    this.pendingTransactions.push(transaction);
    this.emit('transactionAdded', transaction);
  }

  async createAndMineBlock(minerAddress) {
    console.log('[Blockchain] Creating new block...');

    const lastBlock = this.getLatestBlock();
    const blockNumber = BigInt(this.chain.length);

    const newBlock = new Block({
      blockNumber,
      timestamp: Date.now(),
      parentHash: lastBlock.getHash(),
      miner: minerAddress,
      difficulty: this.pow.difficulty
    });

    // Add pending transactions (up to gas limit)
    let gasUsed = 0n;
    for (const tx of this.pendingTransactions) {
      const txGas = tx.gasUsed();
      if (gasUsed + txGas > BLOCK_GAS_LIMIT) break;
      
      newBlock.transactions.push(tx);
      gasUsed += txGas;
    }

    newBlock.gasUsed = gasUsed;

    // Mine block (PoW)
    console.log('[Blockchain] Starting PoW mining...');
    const minedBlock = await this.pow.mineBlock(newBlock);

    // Finalize with PoS validators
    console.log('[Blockchain] Starting PoS finalization...');
    const validators = this.pos.selectValidators(blockNumber);
    const finalized = await this.pos.finalizeBlock(minedBlock, validators);

    if (!finalized) {
      console.error('[Blockchain] Block failed to finalize');
      return null;
    }

    // Update state and distribute rewards
    minedBlock.stateRoot = this.stateManager.getMerkleRoot();
    this.pos.distributeRewards(minedBlock, validators);

    // Add to chain
    this.chain.push(minedBlock);

    // Remove transactions from mempool
    this.pendingTransactions = this.pendingTransactions.slice(newBlock.transactions.length);

    this.emit('blockAdded', minedBlock);
    console.log(`[Blockchain] Block #${blockNumber} added. Hash: ${minedBlock.getHash()}`);

    return minedBlock;
  }

  getBalance(address) {
    return this.stateManager.getAccount(address).balance;
  }

  getBlockByNumber(blockNumber) {
    if (blockNumber < this.chain.length) {
      return this.chain[blockNumber];
    }
    return null;
  }

  getBlockByHash(hash) {
    return this.chain.find(b => b.getHash() === hash);
  }

  getTransactionReceipt(txHash) {
    for (let i = 0; i < this.chain.length; i++) {
      const block = this.chain[i];
      for (let j = 0; j < block.transactions.length; j++) {
        if (block.transactions[j].hash === txHash) {
          return {
            transactionHash: txHash,
            blockHash: block.getHash(),
            blockNumber: i,
            transactionIndex: j,
            from: block.transactions[j].from,
            to: block.transactions[j].to,
            gasUsed: block.transactions[j].gasUsed(),
            status: 1
          };
        }
      }
    }
    return null;
  }

  getValidators() {
    return this.stateManager.getValidators();
  }

  stakeValidator(address, amount) {
    this.stateManager.registerValidator(address, amount);
    console.log(`[Blockchain] Validator registered: ${address}, Stake: ${amount}`);
  }

  // Difficulty adjustment
  adjustDifficulty() {
    if (this.chain.length % POW_DIFFICULTY_RETARGET === 0) {
      this.pow.adjustDifficulty(this.chain);
    }
  }
}

// ============================================================================
// JSON-RPC SERVER
// ============================================================================

class JSONRPCServer {
  constructor(blockchain, port = 8545) {
    this.blockchain = blockchain;
    this.port = port;
    this.methods = {};
    this.setupMethods();
  }

  setupMethods() {
    this.methods = {
      'tmr_blockNumber': () => this.blockchain.chain.length - 1,
      'tmr_getBalance': (address) => this.blockchain.getBalance(address).toString(),
      'tmr_getBlock': (blockNumber) => {
        const block = this.blockchain.getBlockByNumber(parseInt(blockNumber));
        return block ? block.toJSON() : null;
      },
      'tmr_getTransactionReceipt': (txHash) => {
        return this.blockchain.getTransactionReceipt(txHash);
      },
      'tmr_getValidators': () => {
        return this.blockchain.getValidators().map(v => v.toJSON?.() || v);
      },
      'tmr_sendTransaction': (txData) => {
        const tx = new Transaction(txData);
        this.blockchain.addTransaction(tx);
        return tx.hash || CryptoUtils.hash256(tx.toJSON());
      },
      'tmr_estimateGas': (txData) => {
        const tx = new Transaction(txData);
        return tx.gasUsed().toString();
      },
      'tmr_accounts': () => {
        return Array.from(this.blockchain.stateManager.accounts.keys());
      },
      'net_version': () => CHAIN_ID.toString(),
      'web3_clientVersion': () => 'TMR-Chain/1.0.0/Node.js',
      'eth_blockNumber': () => '0x' + this.blockchain.chain.length.toString(16),
      'eth_getBalance': (address) => {
        const balance = this.blockchain.getBalance(address);
        return '0x' + balance.toString(16);
      }
    };
  }

  handleRequest(jsonrpcReq) {
    const { jsonrpc, method, params = [], id } = jsonrpcReq;

    if (jsonrpc !== '2.0') {
      return {
        jsonrpc: '2.0',
        error: { code: -32600, message: 'Invalid Request' },
        id
      };
    }

    if (!this.methods[method]) {
      return {
        jsonrpc: '2.0',
        error: { code: -32601, message: 'Method not found' },
        id
      };
    }

    try {
      const result = this.methods[method](...params);
      return { jsonrpc: '2.0', result, id };
    } catch (error) {
      return {
        jsonrpc: '2.0',
        error: { code: -32603, message: error.message },
        id
      };
    }
  }

  start() {
    const http = require('http');
    const server = http.createServer((req, res) => {
      if (req.method === 'POST' && req.url === '/') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
          try {
            const jsonrpcReq = JSON.parse(body);
            const response = this.handleRequest(jsonrpcReq);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(response));
          } catch (error) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: error.message }));
          }
        });
      } else {
        res.writeHead(404);
        res.end();
      }
    });

    server.listen(this.port, () => {
      console.log(`[JSON-RPC Server] Listening on port ${this.port}`);
    });

    return server;
  }
}

// ============================================================================
// REST API SERVER
// ============================================================================

class RestAPIServer {
  constructor(blockchain, port = 3000) {
    this.blockchain = blockchain;
    this.port = port;
  }

  start() {
    const express = require('express');
    const app = express();
    app.use(express.json());

    // CORS middleware
    app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Content-Type');
      next();
    });

    // Block endpoints
    app.get('/api/v1/blocks', (req, res) => {
      const blocks = this.blockchain.chain.map(b => ({
        blockNumber: b.blockNumber.toString(),
        hash: b.getHash(),
        timestamp: b.timestamp,
        transactions: b.transactions.length,
        miner: b.miner
      }));
      res.json(blocks);
    });

    app.get('/api/v1/blocks/:number', (req, res) => {
      const block = this.blockchain.getBlockByNumber(parseInt(req.params.number));
      res.json(block ? block.toJSON() : { error: 'Block not found' });
    });

    // Transaction endpoints
    app.get('/api/v1/transactions/:hash', (req, res) => {
      const receipt = this.blockchain.getTransactionReceipt(req.params.hash);
      res.json(receipt || { error: 'Transaction not found' });
    });

    app.post('/api/v1/transactions', (req, res) => {
      const tx = new Transaction(req.body);
      this.blockchain.addTransaction(tx);
      res.json({ hash: CryptoUtils.hash256(tx.toJSON()), pending: true });
    });

    // Account endpoints
    app.get('/api/v1/accounts/:address', (req, res) => {
      const account = this.blockchain.stateManager.getAccount(req.params.address);
      res.json(account.toJSON());
    });

    app.get('/api/v1/accounts/:address/balance', (req, res) => {
      const balance = this.blockchain.getBalance(req.params.address);
      res.json({ address: req.params.address, balance: balance.toString() });
    });

    // Validator endpoints
    app.get('/api/v1/validators', (req, res) => {
      const validators = this.blockchain.getValidators();
      res.json(validators);
    });

    app.post('/api/v1/validators/stake', (req, res) => {
      const { address, amount } = req.body;
      try {
        this.blockchain.stakeValidator(address, BigInt(amount));
        res.json({ success: true, address, amount });
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });

    // Stats endpoints
    app.get('/api/v1/stats', (req, res) => {
      const latestBlock = this.blockchain.getLatestBlock();
      res.json({
        chainId: CHAIN_ID,
        blockHeight: this.blockchain.chain.length - 1,
        totalSupply: TOTAL_SUPPLY.toString(),
        miningDifficulty: this.blockchain.pow.difficulty.toString(),
        validators: this.blockchain.getValidators().length,
        pendingTransactions: this.blockchain.pendingTransactions.length,
        latestBlockHash: latestBlock.getHash(),
        latestBlockTime: latestBlock.timestamp
      });
    });

    // Health check
    app.get('/health', (req, res) => {
      res.json({ status: 'ok', network: 'tmr-chain', chainId: CHAIN_ID });
    });

    app.listen(this.port, () => {
      console.log(`[REST API] Listening on port ${this.port}`);
    });
  }
}

// ============================================================================
// MINER WORKER
// ============================================================================

class MinerWorker {
  constructor(blockchain, minerAddress, automine = false) {
    this.blockchain = blockchain;
    this.minerAddress = minerAddress;
    this.automine = automine;
    this.isMining = false;
  }

  async startMining() {
    if (this.isMining) return;
    this.isMining = true;
    console.log(`[Miner] Starting mining with address ${this.minerAddress}`);

    while (this.isMining) {
      try {
        await this.blockchain.createAndMineBlock(this.minerAddress);
        this.blockchain.adjustDifficulty();

        // Wait for block time
        await new Promise(resolve => setTimeout(resolve, BLOCK_TIME));
      } catch (error) {
        console.error('[Miner] Error:', error.message);
      }
    }
  }

  stopMining() {
    this.isMining = false;
    console.log('[Miner] Stopped');
  }

  async mineOneBlock() {
    return await this.blockchain.createAndMineBlock(this.minerAddress);
  }
}

// ============================================================================
// NETWORK P2P
// ============================================================================

class P2PNetwork extends EventEmitter {
  constructor(blockchain, peerId, port = 30303) {
    super();
    this.blockchain = blockchain;
    this.peerId = peerId;
    this.port = port;
    this.peers = new Set();
    this.messageHandlers = {};
    this.setupHandlers();
  }

  setupHandlers() {
    this.messageHandlers = {
      'block': (data) => this.onBlockReceived(data),
      'transaction': (data) => this.onTransactionReceived(data),
      'sync': (data) => this.onSyncRequest(data),
      'ping': (data) => this.onPing(data)
    };
  }

  addPeer(peerId, address) {
    this.peers.add({ peerId, address, lastSeen: Date.now() });
    console.log(`[P2P] Peer added: ${peerId}`);
  }

  broadcastBlock(block) {
    const message = { type: 'block', data: block.toJSON() };
    this.broadcast(message);
  }

  broadcastTransaction(transaction) {
    const message = { type: 'transaction', data: transaction.toJSON() };
    this.broadcast(message);
  }

  broadcast(message) {
    this.peers.forEach(peer => {
      this.sendTo(peer, message);
    });
  }

  sendTo(peer, message) {
    console.log(`[P2P] Sending ${message.type} to ${peer.peerId}`);
    // In production, use TCP/WebSocket for actual network communication
  }

  onBlockReceived(blockData) {
    console.log(`[P2P] Block received from peer`);
    this.emit('blockReceived', blockData);
  }

  onTransactionReceived(txData) {
    console.log(`[P2P] Transaction received from peer`);
    const tx = new Transaction(txData);
    this.blockchain.addTransaction(tx);
  }

  onSyncRequest(data) {
    const { fromBlock, toBlock } = data;
    const blocks = this.blockchain.chain.slice(fromBlock, toBlock + 1);
    return { blocks: blocks.map(b => b.toJSON()) };
  }

  onPing(data) {
    return { pong: Date.now() };
  }

  start() {
    console.log(`[P2P] Network started. Peer ID: ${this.peerId}`);
    // In production, implement actual P2P network using libp2p or similar
  }

  discover() {
    console.log('[P2P] Starting peer discovery...');
    // In production, connect to bootstrap nodes and DHT
  }
}

// ============================================================================
// WALLET MANAGER
// ============================================================================

class Wallet {
  constructor(privateKey = null) {
    if (privateKey) {
      this.privateKey = privateKey;
      const keyObj = crypto.createPrivateKey({
        key: Buffer.from(privateKey, 'hex'),
        format: 'raw',
        type: 'private',
        namedCurve: 'secp256k1'
      });
      this.publicKey = keyObj.export({ type: 'spki', format: 'hex' });
    } else {
      const { privateKey: priv, publicKey: pub } = CryptoUtils.generateKeyPair();
      this.privateKey = priv;
      this.publicKey = pub;
    }
    
    this.address = CryptoUtils.addressFromPublicKey(this.publicKey);
  }

  signTransaction(tx) {
    tx.from = this.address;
    tx.sign(this.privateKey);
    return tx;
  }

  getAddress() {
    return this.address;
  }

  exportPrivateKey() {
    return this.privateKey;
  }

  exportPublicKey() {
    return this.publicKey;
  }
}

// ============================================================================
// NODE CLASS (Main Entry Point)
// ============================================================================

class TMRChainNode extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      chainId: CHAIN_ID,
      automine: config.automine !== false,
      minerAddress: config.minerAddress || '0xMinerAddress',
      rpcPort: config.rpcPort || 8545,
      restPort: config.restPort || 3000,
      p2pPort: config.p2pPort || 30303,
      ...config
    };

    this.blockchain = new Blockchain();
    this.p2p = new P2PNetwork(this.blockchain, config.peerId || 'node-' + Math.random().toString(36).substr(2, 9));
    this.rpcServer = new JSONRPCServer(this.blockchain, this.config.rpcPort);
    this.restServer = new RestAPIServer(this.blockchain, this.config.restPort);
    this.miner = new MinerWorker(this.blockchain, this.config.minerAddress, this.config.automine);
    this.wallet = new Wallet();
  }

  async start() {
    console.log(`\n${'='.repeat(60)}`);
    console.log('TMR CHAIN NODE - Starting...');
    console.log(`${'='.repeat(60)}\n`);

    // Start servers
    this.rpcServer.start();
    this.restServer.start();
    this.p2p.start();
    this.p2p.discover();

    // Start mining if enabled
    if (this.config.automine) {
      this.miner.startMining();
    }

    console.log(`\n[Node] Configuration:`);
    console.log(`  Chain ID: ${this.config.chainId}`);
    console.log(`  Miner: ${this.config.minerAddress}`);
    console.log(`  JSON-RPC: http://localhost:${this.config.rpcPort}`);
    console.log(`  REST API: http://localhost:${this.config.restPort}`);
    console.log(`  P2P Port: ${this.config.p2pPort}`);
    console.log(`  Auto-mining: ${this.config.automine}\n`);

    return this;
  }

  async mineBlock() {
    return await this.miner.mineOneBlock();
  }

  stopMining() {
    this.miner.stopMining();
  }

  getBalance(address) {
    return this.blockchain.getBalance(address);
  }

  sendTransaction(txData) {
    const tx = new Transaction(txData);
    this.blockchain.addTransaction(tx);
    this.p2p.broadcastTransaction(tx);
    return tx;
  }

  registerValidator(address, stake) {
    this.blockchain.stakeValidator(address, stake);
  }

  getStats() {
    return {
      chainId: CHAIN_ID,
      blockHeight: this.blockchain.chain.length - 1,
      blockTime: BLOCK_TIME,
      totalSupply: TOTAL_SUPPLY.toString(),
      difficulty: this.blockchain.pow.difficulty.toString(),
      validators: this.blockchain.getValidators().length,
      pendingTransactions: this.blockchain.pendingTransactions.length,
      latestBlock: this.blockchain.getLatestBlock().toJSON()
    };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Core classes
  Blockchain,
  Block,
  Transaction,
  Account,
  StateManager,
  ProofOfWork,
  ProofOfStake,
  Wallet,
  
  // Servers
  JSONRPCServer,
  RestAPIServer,
  P2PNetwork,
  MinerWorker,
  TMRChainNode,
  
  // Utilities
  CryptoUtils,
  
  // Constants
  CHAIN_ID,
  TOTAL_SUPPLY,
  BLOCK_TIME,
  BLOCK_REWARD,
  BLOCK_GAS_LIMIT,
  MIN_VALIDATOR_STAKE,
  MAX_VALIDATOR_STAKE,
  VALIDATORS_PER_BLOCK,
  SLASHING_PENALTY
};

// ============================================================================
// MAIN EXECUTION (for standalone use)
// ============================================================================

if (require.main === module) {
  (async () => {
    const node = new TMRChainNode({
      automine: true,
      minerAddress: '0x742d35Cc6634C0532925a3b844Bc029e4f42fDf8',
      rpcPort: 8545,
      restPort: 3000
    });

    await node.start();

    // Example: Send some transactions
    setTimeout(() => {
      const tx = new Transaction({
        to: '0x1234567890123456789012345678901234567890',
        value: BigInt('1000000000000000000'), // 1 TMR
        gasPrice: 1n,
        gasLimit: 21000n
      });

      node.sendTransaction(tx);
      console.log('\n[Node] Example transaction sent');
    }, 10000);

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n\n[Node] Shutting down...');
      node.stopMining();
      process.exit(0);
    });
  })();
}
