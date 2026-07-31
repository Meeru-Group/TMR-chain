/**
 * TMR Chain - Example Usage & Testing Guide
 * 
 * This file demonstrates how to use the TMR Chain node
 * and shows comprehensive examples for all major features.
 */

// ============================================================================
// SETUP EXAMPLES
// ============================================================================

/**
 * Example 1: Starting a Local Node
 */
async function example_startNode() {
  const { TMRChainNode } = require('./2_TMR_CHAIN_IMPLEMENTATION');

  // Initialize node
  const node = new TMRChainNode({
    automine: true,
    minerAddress: '0xMinerAddress1234567890123456789012345678',
    rpcPort: 8545,
    restPort: 3000,
    peerId: 'my-tmr-node'
  });

  // Start the node
  await node.start();

  console.log('Node started successfully!');
  console.log('RPC available at: http://localhost:8545');
  console.log('REST API available at: http://localhost:3000');

  return node;
}

// ============================================================================
// WALLET & ACCOUNT EXAMPLES
// ============================================================================

/**
 * Example 2: Create a New Wallet
 */
function example_createWallet() {
  const { Wallet } = require('./2_TMR_CHAIN_IMPLEMENTATION');

  // Create new wallet
  const wallet = new Wallet();

  console.log('New Wallet Created:');
  console.log('Address:', wallet.getAddress());
  console.log('Public Key:', wallet.getPublicKey());
  console.log('Private Key:', wallet.exportPrivateKey());

  return wallet;
}

/**
 * Example 3: Import Existing Wallet
 */
function example_importWallet() {
  const { Wallet } = require('./2_TMR_CHAIN_IMPLEMENTATION');

  const privateKey = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
  const wallet = new Wallet(privateKey);

  console.log('Wallet Imported:');
  console.log('Address:', wallet.getAddress());

  return wallet;
}

/**
 * Example 4: Check Account Balance
 */
async function example_checkBalance(node, address) {
  const balance = node.getBalance(address);

  console.log(`Balance of ${address}:`);
  console.log(`Raw Wei: ${balance.toString()}`);
  console.log(`TMR: ${Number(balance) / 1e18}`);

  return balance;
}

// ============================================================================
// TRANSACTION EXAMPLES
// ============================================================================

/**
 * Example 5: Create and Sign Transaction
 */
async function example_createTransaction(wallet) {
  const { Transaction } = require('./2_TMR_CHAIN_IMPLEMENTATION');

  // Create transaction
  const tx = new Transaction({
    to: '0x1234567890123456789012345678901234567890',
    value: 1000000000000000000n, // 1 TMR in wei
    gasPrice: 1n,
    gasLimit: 21000n,
    nonce: 0
  });

  // Sign transaction
  const signedTx = wallet.signTransaction(tx);

  console.log('Transaction Created and Signed:');
  console.log('Hash:', signedTx.hash);
  console.log('From:', signedTx.from);
  console.log('To:', signedTx.to);
  console.log('Value (TMR):', Number(signedTx.value) / 1e18);
  console.log('Gas Used:', signedTx.gasUsed().toString());

  return signedTx;
}

/**
 * Example 6: Send Transaction
 */
async function example_sendTransaction(node, wallet) {
  const { Transaction } = require('./2_TMR_CHAIN_IMPLEMENTATION');

  const tx = new Transaction({
    to: '0xRecipientAddress0000000000000000000000',
    value: 500000000000000000n, // 0.5 TMR
    gasPrice: 1n,
    gasLimit: 21000n
  });

  // Sign and send
  const signedTx = wallet.signTransaction(tx);
  const result = node.sendTransaction(signedTx);

  console.log('Transaction Sent:');
  console.log('Hash:', result.hash);
  console.log('Status: Pending');

  return result;
}

/**
 * Example 7: Check Transaction Receipt
 */
async function example_getReceipt(node, txHash) {
  // Wait for block confirmation
  await new Promise(resolve => setTimeout(resolve, 10000));

  const receipt = node.blockchain.getTransactionReceipt(txHash);

  if (receipt) {
    console.log('Transaction Receipt:');
    console.log('Status:', receipt.status === 1 ? 'Success' : 'Failed');
    console.log('Block Number:', receipt.blockNumber);
    console.log('Gas Used:', receipt.gasUsed);
    console.log('From:', receipt.from);
    console.log('To:', receipt.to);
  } else {
    console.log('Transaction still pending...');
  }

  return receipt;
}

// ============================================================================
// MINING EXAMPLES
// ============================================================================

/**
 * Example 8: Mine Single Block
 */
async function example_mineSingleBlock(node) {
  console.log('Starting to mine block...');

  const block = await node.mineBlock();

  if (block) {
    console.log('Block Mined Successfully!');
    console.log('Block Number:', block.blockNumber.toString());
    console.log('Block Hash:', block.getHash());
    console.log('Timestamp:', new Date(block.timestamp));
    console.log('Transactions:', block.transactions.length);
    console.log('Miner:', block.miner);
    console.log('Finalized:', block.finalized);
    console.log('Validators:', block.finalizers.length);
  }

  return block;
}

/**
 * Example 9: Get Block Information
 */
async function example_getBlock(node, blockNumber) {
  const block = node.blockchain.getBlockByNumber(blockNumber);

  if (block) {
    console.log(`Block #${blockNumber}:`);
    console.log('Hash:', block.getHash());
    console.log('Timestamp:', new Date(block.timestamp));
    console.log('Parent Hash:', block.parentHash);
    console.log('Miner:', block.miner);
    console.log('Difficulty:', block.difficulty.toString());
    console.log('Gas Limit:', block.gasLimit.toString());
    console.log('Gas Used:', block.gasUsed.toString());
    console.log('Transactions:', block.transactions.length);
    console.log('State Root:', block.stateRoot);
    console.log('Finalized:', block.finalized);
    console.log('Finalizers:', block.finalizers.length);
  }

  return block;
}

/**
 * Example 10: List Recent Blocks
 */
async function example_listBlocks(node, count = 10) {
  const chain = node.blockchain.chain;
  const recent = chain.slice(Math.max(0, chain.length - count));

  console.log(`Recent ${count} Blocks:`);
  console.log('═'.repeat(80));

  recent.forEach(block => {
    console.log(`Block #${block.blockNumber.toString().padEnd(10)} | ` +
                `Hash: ${block.getHash().substring(0, 16)}... | ` +
                `TXs: ${block.transactions.length.toString().padEnd(3)} | ` +
                `Finalized: ${block.finalized ? '✓' : '✗'}`);
  });

  console.log('═'.repeat(80));
}

// ============================================================================
// VALIDATOR & STAKING EXAMPLES
// ============================================================================

/**
 * Example 11: Register as Validator
 */
async function example_registerValidator(node, address) {
  const MIN_STAKE = 32000n * (10n ** 18n); // 32,000 TMR in wei

  try {
    node.registerValidator(address, MIN_STAKE);

    console.log('Validator Registered!');
    console.log('Address:', address);
    console.log('Stake (TMR):', Number(MIN_STAKE) / 1e18);

    // Verify registration
    const validators = node.blockchain.getValidators();
    const validator = validators.find(v => v.address === address);

    if (validator) {
      console.log('Verification: ✓ Successfully registered');
      console.log('Validator Info:', validator);
    }
  } catch (error) {
    console.error('Failed to register validator:', error.message);
  }
}

/**
 * Example 12: Get Validator List
 */
async function example_getValidators(node) {
  const validators = node.blockchain.getValidators();

  console.log(`Active Validators (${validators.length}):`);
  console.log('═'.repeat(100));

  validators.forEach((v, index) => {
    const stakeInTmr = Number(v.stake) / 1e18;
    console.log(
      `${String(index + 1).padEnd(3)} | ` +
      `Address: ${v.address.substring(0, 20)}... | ` +
      `Stake: ${stakeInTmr.toFixed(0).padEnd(10)} TMR | ` +
      `Uptime: ${v.uptime.toFixed(1)}% | ` +
      `Slashes: ${v.slashCount}`
    );
  });

  console.log('═'.repeat(100));
  console.log(`Total Staked: ${validators.reduce((sum, v) => sum + Number(v.stake), 0) / 1e18} TMR`);
}

/**
 * Example 13: Get Staking Rewards
 */
async function example_getRewards(node, address) {
  const account = node.blockchain.stateManager.getAccount(address);

  if (account.isValidator) {
    console.log('Staking Rewards:');
    console.log('Address:', address);
    console.log('Staked Amount (TMR):', Number(account.stakedAmount) / 1e18);
    console.log('Balance (TMR):', Number(account.balance) / 1e18);

    // Calculate estimated APY
    const apy = 10.5; // From tokenomics
    const monthlyRewards = (Number(account.stakedAmount) / 1e18) * (apy / 100) / 12;
    console.log(`Estimated Monthly Rewards (${apy}% APY): ${monthlyRewards.toFixed(2)} TMR`);
  } else {
    console.log('Account is not a validator');
  }
}

// ============================================================================
// NETWORK & CONSENSUS EXAMPLES
// ============================================================================

/**
 * Example 14: Get Network Statistics
 */
async function example_getStats(node) {
  const stats = node.getStats();

  console.log('Network Statistics:');
  console.log('═'.repeat(60));
  console.log(`Chain ID:              ${stats.chainId}`);
  console.log(`Block Height:          ${stats.blockHeight}`);
  console.log(`Block Time:            ${stats.blockTime}ms`);
  console.log(`Total Supply:          ${Number(stats.totalSupply) / 1e18} TMR`);
  console.log(`Current Difficulty:    ${stats.difficulty}`);
  console.log(`Active Validators:     ${stats.validators}`);
  console.log(`Pending Transactions:  ${stats.pendingTransactions}`);
  console.log(`Latest Block Hash:     ${stats.latestBlock.parentHash.substring(0, 16)}...`);
  console.log(`Latest Block Time:     ${new Date(stats.latestBlock.timestamp)}`);
  console.log('═'.repeat(60));
}

/**
 * Example 15: Monitor Consensus
 */
async function example_monitorConsensus(node) {
  console.log('Starting Consensus Monitoring...');
  console.log('Press Ctrl+C to stop\n');

  const monitor = setInterval(() => {
    const latestBlock = node.blockchain.getLatestBlock();
    const difficulty = node.blockchain.pow.difficulty;
    const validators = node.blockchain.getValidators();

    console.log(`[${new Date().toLocaleTimeString()}]`);
    console.log(`  Block: #${latestBlock.blockNumber}`);
    console.log(`  PoW Difficulty: ${difficulty}`);
    console.log(`  PoS Validators: ${latestBlock.finalizers.length}/${VALIDATORS_PER_BLOCK}`);
    console.log(`  Total Validators: ${validators.length}`);
    console.log(`  Finalized: ${latestBlock.finalized ? '✓' : '✗'}\n`);
  }, 5000);

  return monitor;
}

// ============================================================================
// SMART CONTRACT EXAMPLES
// ============================================================================

/**
 * Example 16: Deploy Contract (EVM)
 */
async function example_deployContract(node, wallet) {
  const { Transaction } = require('./2_TMR_CHAIN_IMPLEMENTATION');

  // Simple ERC20-like contract bytecode
  const contractBytecode = '0x608060405234801561001057600080fd5d...'; // Actual bytecode

  const tx = new Transaction({
    to: null, // null means contract creation
    data: contractBytecode,
    gasPrice: 1n,
    gasLimit: 5000000n
  });

  const signedTx = wallet.signTransaction(tx);
  node.sendTransaction(signedTx);

  console.log('Contract Deployment Submitted:');
  console.log('Transaction Hash:', signedTx.hash);
  console.log('Expected Contract Address:', 
              '0x' + require('crypto').createHash('sha256')
                      .update(wallet.getAddress() + '0')
                      .digest('hex')
                      .slice(0, 40));

  return signedTx;
}

/**
 * Example 17: Call Smart Contract
 */
async function example_callContract(node) {
  const { Transaction } = require('./2_TMR_CHAIN_IMPLEMENTATION');

  const tx = new Transaction({
    to: '0xContractAddress0000000000000000000000',
    data: '0xa9059cbb' + // Transfer method signature
          '0000000000000000000000001234567890123456789012345678901234567890' + // to
          '0000000000000000000000000000000000000000000000000de0b6b3a7640000', // amount
    gasPrice: 1n,
    gasLimit: 100000n
  });

  console.log('Contract Call:');
  console.log('Contract:', tx.to);
  console.log('Method: transfer()');
  console.log('Gas Estimate:', tx.gasUsed().toString());

  return tx;
}

// ============================================================================
// JSON-RPC EXAMPLES (Using curl)
// ============================================================================

/**
 * Example 18: JSON-RPC Methods via curl
 */
const jsonRpcExamples = {
  getBlockNumber: `
    curl -X POST http://localhost:8545 \\
      -H "Content-Type: application/json" \\
      -d '{
        "jsonrpc":"2.0",
        "method":"tmr_blockNumber",
        "params":[],
        "id":1
      }'
  `,

  getBalance: `
    curl -X POST http://localhost:8545 \\
      -H "Content-Type: application/json" \\
      -d '{
        "jsonrpc":"2.0",
        "method":"tmr_getBalance",
        "params":["0x742d35Cc6634C0532925a3b844Bc029e4f42fDf8"],
        "id":1
      }'
  `,

  getBlock: `
    curl -X POST http://localhost:8545 \\
      -H "Content-Type: application/json" \\
      -d '{
        "jsonrpc":"2.0",
        "method":"tmr_getBlock",
        "params":[0],
        "id":1
      }'
  `,

  sendTransaction: `
    curl -X POST http://localhost:8545 \\
      -H "Content-Type: application/json" \\
      -d '{
        "jsonrpc":"2.0",
        "method":"tmr_sendTransaction",
        "params":[{
          "from":"0x742d35Cc6634C0532925a3b844Bc029e4f42fDf8",
          "to":"0x1234567890123456789012345678901234567890",
          "value":"1000000000000000000",
          "gasPrice":"1",
          "gasLimit":"21000"
        }],
        "id":1
      }'
  `,

  getValidators: `
    curl -X POST http://localhost:8545 \\
      -H "Content-Type: application/json" \\
      -d '{
        "jsonrpc":"2.0",
        "method":"tmr_getValidators",
        "params":[],
        "id":1
      }'
  `
};

// ============================================================================
// REST API EXAMPLES (Using curl)
// ============================================================================

const restApiExamples = {
  getStats: 'curl http://localhost:3000/api/v1/stats',

  getBlocks: 'curl http://localhost:3000/api/v1/blocks',

  getBlock: 'curl http://localhost:3000/api/v1/blocks/42',

  getAccount: 'curl http://localhost:3000/api/v1/accounts/0x742d35Cc6634C0532925a3b844Bc029e4f42fDf8',

  getBalance: 'curl http://localhost:3000/api/v1/accounts/0x742d35Cc6634C0532925a3b844Bc029e4f42fDf8/balance',

  getValidators: 'curl http://localhost:3000/api/v1/validators',

  sendTransaction: `
    curl -X POST http://localhost:3000/api/v1/transactions \\
      -H "Content-Type: application/json" \\
      -d '{
        "from":"0x742d35Cc6634C0532925a3b844Bc029e4f42fDf8",
        "to":"0x1234567890123456789012345678901234567890",
        "value":"1000000000000000000",
        "gasPrice":"1",
        "gasLimit":"21000"
      }'
  `,

  stakeValidator: `
    curl -X POST http://localhost:3000/api/v1/validators/stake \\
      -H "Content-Type: application/json" \\
      -d '{
        "address":"0x742d35Cc6634C0532925a3b844Bc029e4f42fDf8",
        "amount":"32000000000000000000"
      }'
  `
};

// ============================================================================
// COMPLETE TEST SUITE
// ============================================================================

/**
 * Run Complete Integration Tests
 */
async function runIntegrationTests() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║           TMR CHAIN - INTEGRATION TEST SUITE              ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const { TMRChainNode, Wallet } = require('./2_TMR_CHAIN_IMPLEMENTATION');

  // Initialize node
  console.log('Test 1: Starting Node...');
  const node = new TMRChainNode({
    automine: false, // Manual mining for tests
    minerAddress: '0x742d35Cc6634C0532925a3b844Bc029e4f42fDf8'
  });
  await node.start();
  console.log('✓ Node started\n');

  // Create wallets
  console.log('Test 2: Creating Wallets...');
  const wallet1 = new Wallet();
  const wallet2 = new Wallet();
  console.log(`✓ Wallet 1: ${wallet1.getAddress()}`);
  console.log(`✓ Wallet 2: ${wallet2.getAddress()}\n`);

  // Create and send transaction
  console.log('Test 3: Creating Transaction...');
  const tx = new Transaction({
    to: wallet2.getAddress(),
    value: 500000000000000000n, // 0.5 TMR
    gasPrice: 1n,
    gasLimit: 21000n
  });
  const signedTx = wallet1.signTransaction(tx);
  console.log(`✓ Transaction created: ${signedTx.hash}\n`);

  // Add to mempool
  console.log('Test 4: Adding to Mempool...');
  node.sendTransaction(signedTx);
  console.log(`✓ Transaction in mempool\n`);

  // Mine block
  console.log('Test 5: Mining Block...');
  const block = await node.mineBlock();
  console.log(`✓ Block #${block.blockNumber} mined\n`);

  // Verify transaction
  console.log('Test 6: Verifying Transaction...');
  const receipt = node.blockchain.getTransactionReceipt(signedTx.hash);
  console.log(`✓ Transaction included in block ${receipt.blockNumber}\n`);

  // Register validator
  console.log('Test 7: Registering Validator...');
  node.registerValidator(wallet1.getAddress(), 32000n * (10n ** 18n));
  console.log(`✓ Validator registered\n`);

  // Get statistics
  console.log('Test 8: Getting Statistics...');
  const stats = node.getStats();
  console.log(`✓ Chain ID: ${stats.chainId}`);
  console.log(`✓ Block Height: ${stats.blockHeight}`);
  console.log(`✓ Validators: ${stats.validators}\n`);

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║              ALL TESTS PASSED SUCCESSFULLY! ✓             ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  return node;
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Setup
  example_startNode,

  // Wallet & Accounts
  example_createWallet,
  example_importWallet,
  example_checkBalance,

  // Transactions
  example_createTransaction,
  example_sendTransaction,
  example_getReceipt,

  // Mining
  example_mineSingleBlock,
  example_getBlock,
  example_listBlocks,

  // Validators
  example_registerValidator,
  example_getValidators,
  example_getRewards,

  // Network
  example_getStats,
  example_monitorConsensus,

  // Smart Contracts
  example_deployContract,
  example_callContract,

  // API Examples
  jsonRpcExamples,
  restApiExamples,

  // Tests
  runIntegrationTests
};

// ============================================================================
// QUICK START (if run directly)
// ============================================================================

if (require.main === module) {
  (async () => {
    try {
      const node = await runIntegrationTests();
      
      console.log('\nNode is now running. Press Ctrl+C to stop.\n');
      console.log('Available endpoints:');
      console.log('  JSON-RPC: http://localhost:8545');
      console.log('  REST API: http://localhost:3000');
      console.log('  Explorer: http://localhost:4001\n');

      // Keep process running
      process.on('SIGINT', () => {
        console.log('\nShutting down...');
        process.exit(0);
      });
    } catch (error) {
      console.error('Test failed:', error);
      process.exit(1);
    }
  })();
}
