# TMR Chain - Complete API Documentation

## Table of Contents
1. [JSON-RPC API](#json-rpc-api)
2. [REST API](#rest-api)
3. [Wallet API](#wallet-api)
4. [Explorer API](#explorer-api)
5. [WebSocket API](#websocket-api)
6. [Error Codes](#error-codes)

---

## JSON-RPC API

**Base URL:** `http://localhost:8545`  
**Protocol:** JSON-RPC 2.0  
**Content-Type:** `application/json`

### Connection Methods

#### Using curl
```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tmr_blockNumber","params":[],"id":1}'
```

#### Using Web3.js
```javascript
const web3 = new Web3('http://localhost:8545');
const blockNumber = await web3.eth.getBlockNumber();
```

#### Using Ethers.js
```javascript
const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
const blockNumber = await provider.getBlockNumber();
```

---

### Core Methods

#### `tmr_blockNumber`

Returns the latest block number on the TMR Chain.

**Parameters:** None

**Returns:** `QUANTITY` - integer of the current block number

**Example Request:**
```json
{
  "jsonrpc": "2.0",
  "method": "tmr_blockNumber",
  "params": [],
  "id": 1
}
```

**Example Response:**
```json
{
  "jsonrpc": "2.0",
  "result": 42,
  "id": 1
}
```

---

#### `tmr_getBalance`

Returns the balance of an account.

**Parameters:**
- `ADDRESS` (string) - Account address (0x prefix required)

**Returns:** `QUANTITY` - integer balance in wei

**Example Request:**
```json
{
  "jsonrpc": "2.0",
  "method": "tmr_getBalance",
  "params": ["0x742d35Cc6634C0532925a3b844Bc029e4f42fDf8"],
  "id": 1
}
```

**Example Response:**
```json
{
  "jsonrpc": "2.0",
  "result": "1000000000000000000",
  "id": 1
}
```

---

#### `tmr_sendTransaction`

Submits a transaction to the network.

**Parameters:**
```
{
  "from": DATA,           // Sender address
  "to": DATA,             // Recipient address (null for contract creation)
  "value": QUANTITY,      // Amount in wei
  "data": DATA,           // Contract bytecode or method signature
  "gasPrice": QUANTITY,   // Gas price in wei
  "gasLimit": QUANTITY,   // Maximum gas allowed
  "nonce": QUANTITY       // Transaction count from sender
}
```

**Returns:** `DATA` - 32-byte transaction hash

**Example Request:**
```json
{
  "jsonrpc": "2.0",
  "method": "tmr_sendTransaction",
  "params": [{
    "from": "0x742d35Cc6634C0532925a3b844Bc029e4f42fDf8",
    "to": "0x1234567890123456789012345678901234567890",
    "value": "1000000000000000000",
    "gasPrice": "1",
    "gasLimit": "21000"
  }],
  "id": 1
}
```

**Example Response:**
```json
{
  "jsonrpc": "2.0",
  "result": "0x88df016429689c079f3b2f6ad23537385e4e08ef56125bb6a7e8a8e21cc9f9c5",
  "id": 1
}
```

---

#### `tmr_getBlock`

Returns information about a specific block.

**Parameters:**
- `QUANTITY` - Block number

**Returns:** `OBJECT` - Block object

```
{
  "version": QUANTITY,
  "blockNumber": QUANTITY,
  "timestamp": QUANTITY,        // Unix timestamp in milliseconds
  "parentHash": DATA,
  "miner": DATA,               // Address of block producer (PoW)
  "difficulty": QUANTITY,
  "nonce": QUANTITY,
  "gasLimit": QUANTITY,
  "gasUsed": QUANTITY,
  "stateRoot": DATA,           // Merkle root of state tree
  "transactionsRoot": DATA,    // Merkle root of transactions
  "receiptsRoot": DATA,
  "transactions": ARRAY,       // Transaction objects
  "validatorSignatures": ARRAY, // PoS validator signatures
  "mixHash": DATA,
  "finalized": BOOLEAN,        // Block finality status
  "finalizers": ARRAY          // Addresses of finalizing validators
}
```

**Example Request:**
```json
{
  "jsonrpc": "2.0",
  "method": "tmr_getBlock",
  "params": [42],
  "id": 1
}
```

---

#### `tmr_getTransactionReceipt`

Returns the receipt of a transaction.

**Parameters:**
- `DATA` - Transaction hash

**Returns:** `OBJECT` - Transaction receipt or null if pending

```
{
  "transactionHash": DATA,
  "blockHash": DATA,
  "blockNumber": QUANTITY,
  "transactionIndex": QUANTITY,
  "from": DATA,
  "to": DATA,
  "gasUsed": QUANTITY,
  "cumulativeGasUsed": QUANTITY,
  "contractAddress": DATA,    // null unless contract creation
  "logs": ARRAY,              // Log objects
  "logsBloom": DATA,
  "status": QUANTITY          // 1 = success, 0 = failure
}
```

---

#### `tmr_estimateGas`

Estimates the gas required for a transaction.

**Parameters:** Transaction object (same as tmr_sendTransaction)

**Returns:** `QUANTITY` - Estimated gas in wei

**Example Request:**
```json
{
  "jsonrpc": "2.0",
  "method": "tmr_estimateGas",
  "params": [{
    "from": "0x742d35Cc6634C0532925a3b844Bc029e4f42fDf8",
    "to": "0x1234567890123456789012345678901234567890",
    "value": "1000000000000000000"
  }],
  "id": 1
}
```

**Example Response:**
```json
{
  "jsonrpc": "2.0",
  "result": "21000",
  "id": 1
}
```

---

#### `tmr_call`

Executes a smart contract method locally (read-only, no state changes).

**Parameters:** Transaction object

**Returns:** `DATA` - Return value of the contract method

---

#### `tmr_getValidators`

Returns list of active validators.

**Parameters:** None

**Returns:** `ARRAY` - Validator objects

```
{
  "address": DATA,
  "stake": QUANTITY,           // Staked amount in wei
  "joinedAtBlock": QUANTITY,
  "uptime": QUANTITY,          // Percentage 0-100
  "slashCount": QUANTITY,      // Number of times slashed
  "lastActive": QUANTITY       // Unix timestamp
}
```

---

#### `tmr_accounts`

Returns all accounts in the blockchain.

**Parameters:** None

**Returns:** `ARRAY` - Array of account addresses

---

#### Ethereum Compatibility Methods

TMR Chain supports the following Ethereum methods for compatibility:

```
eth_blockNumber        → Latest block number
eth_getBalance         → Account balance
eth_getCode            → Contract bytecode
eth_getStorageAt       → Contract storage value
eth_getTransactionCount → Account nonce
eth_gasPrice           → Current gas price
net_version            → Network ID
web3_clientVersion     → Client version
```

---

## REST API

**Base URL:** `http://localhost:3000/api/v1`

### Block Endpoints

#### `GET /blocks`

Lists all blocks.

**Query Parameters:**
- `limit` (optional, default: 100) - Maximum results
- `offset` (optional, default: 0) - Pagination offset

**Response:**
```json
[
  {
    "blockNumber": "42",
    "hash": "0x...",
    "timestamp": 1694000000000,
    "transactions": 15,
    "miner": "0x742d35Cc6634C0532925a3b844Bc029e4f42fDf8"
  }
]
```

---

#### `GET /blocks/:number`

Gets detailed information about a specific block.

**Parameters:**
- `number` - Block number

**Response:**
```json
{
  "version": 1,
  "blockNumber": "42",
  "timestamp": 1694000000000,
  "parentHash": "0x...",
  "miner": "0x742d35Cc6634C0532925a3b844Bc029e4f42fDf8",
  "difficulty": "1000000",
  "nonce": "12345",
  "gasLimit": "30000000",
  "gasUsed": "15000000",
  "stateRoot": "0x...",
  "transactionsRoot": "0x...",
  "transactions": [...],
  "finalized": true,
  "finalizers": ["0x...", "0x..."]
}
```

---

### Transaction Endpoints

#### `GET /transactions/:hash`

Gets transaction receipt.

**Parameters:**
- `hash` - Transaction hash

**Response:**
```json
{
  "transactionHash": "0x88df016429689c079f3b2f6ad23537385e4e08ef56125bb6a7e8a8e21cc9f9c5",
  "blockHash": "0x...",
  "blockNumber": 42,
  "transactionIndex": 5,
  "from": "0x742d35Cc6634C0532925a3b844Bc029e4f42fDf8",
  "to": "0x1234567890123456789012345678901234567890",
  "gasUsed": "21000",
  "status": 1
}
```

---

#### `POST /transactions`

Submits a new transaction.

**Request Body:**
```json
{
  "from": "0x742d35Cc6634C0532925a3b844Bc029e4f42fDf8",
  "to": "0x1234567890123456789012345678901234567890",
  "value": "1000000000000000000",
  "gasPrice": "1",
  "gasLimit": "21000",
  "data": ""
}
```

**Response:**
```json
{
  "hash": "0x88df016429689c079f3b2f6ad23537385e4e08ef56125bb6a7e8a8e21cc9f9c5",
  "pending": true
}
```

---

### Account Endpoints

#### `GET /accounts/:address`

Gets account information.

**Parameters:**
- `address` - Account address

**Response:**
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc029e4f42fDf8",
  "nonce": "42",
  "balance": "1000000000000000000",
  "storageRoot": "0x...",
  "codeHash": "0x...",
  "isValidator": true,
  "stakedAmount": "32000000000000000000",
  "delegatedTo": null
}
```

---

#### `GET /accounts/:address/balance`

Gets account balance.

**Parameters:**
- `address` - Account address

**Response:**
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc029e4f42fDf8",
  "balance": "1000000000000000000"
}
```

---

### Validator Endpoints

#### `GET /validators`

Lists all active validators.

**Response:**
```json
[
  {
    "address": "0x742d35Cc6634C0532925a3b844Bc029e4f42fDf8",
    "stake": "32000000000000000000",
    "joinedAtBlock": 0,
    "uptime": 99.5,
    "slashCount": 0,
    "lastActive": 1694000000000
  }
]
```

---

#### `POST /validators/stake`

Registers as a validator or increases stake.

**Request Body:**
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc029e4f42fDf8",
  "amount": "32000000000000000000"
}
```

**Response:**
```json
{
  "success": true,
  "address": "0x742d35Cc6634C0532925a3b844Bc029e4f42fDf8",
  "amount": "32000000000000000000"
}
```

---

### Statistics Endpoints

#### `GET /stats`

Gets network statistics.

**Response:**
```json
{
  "chainId": 5524050,
  "blockHeight": 42,
  "totalSupply": "10000000000000000000000000000",
  "miningDifficulty": "1000000",
  "validators": 128,
  "pendingTransactions": 15,
  "latestBlockHash": "0x...",
  "latestBlockTime": 1694000005000
}
```

---

#### `GET /health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "network": "tmr-chain",
  "chainId": 5524050
}
```

---

## Wallet API

**Base URL:** `http://localhost:4000/api`

### Account Management

#### `POST /accounts/create`

Creates a new wallet.

**Request Body:**
```json
{
  "password": "secure_password"
}
```

**Response:**
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc029e4f42fDf8",
  "publicKey": "0x...",
  "mnemonic": "word1 word2 ... word12"
}
```

---

#### `POST /accounts/import`

Imports an existing wallet.

**Request Body:**
```json
{
  "privateKey": "0x...",
  "password": "secure_password"
}
```

**Response:**
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc029e4f42fDf8",
  "imported": true
}
```

---

#### `GET /accounts/:address`

Gets wallet details.

**Response:**
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc029e4f42fDf8",
  "balance": "1000000000000000000",
  "nonce": 42,
  "isValidator": true
}
```

---

### Transaction Operations

#### `POST /transactions/sign`

Signs a transaction.

**Request Body:**
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc029e4f42fDf8",
  "password": "secure_password",
  "transaction": {
    "to": "0x...",
    "value": "1000000000000000000",
    "gasPrice": "1",
    "gasLimit": "21000"
  }
}
```

**Response:**
```json
{
  "signedTransaction": "0x...",
  "hash": "0x88df016429689c079f3b2f6ad23537385e4e08ef56125bb6a7e8a8e21cc9f9c5"
}
```

---

#### `POST /transactions/send`

Sends a signed transaction.

**Request Body:**
```json
{
  "signedTransaction": "0x..."
}
```

**Response:**
```json
{
  "hash": "0x88df016429689c079f3b2f6ad23537385e4e08ef56125bb6a7e8a8e21cc9f9c5",
  "pending": true
}
```

---

### Staking Operations

#### `POST /staking/stake`

Stakes TMR to become a validator.

**Request Body:**
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc029e4f42fDf8",
  "amount": "32000000000000000000",
  "password": "secure_password"
}
```

**Response:**
```json
{
  "success": true,
  "stakedAmount": "32000000000000000000",
  "activationBlock": 100
}
```

---

#### `POST /staking/unstake`

Unstakes TMR (with 21-day lock period).

**Request Body:**
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc029e4f42fDf8",
  "amount": "32000000000000000000",
  "password": "secure_password"
}
```

---

#### `GET /staking/rewards/:address`

Gets staking rewards for an address.

**Response:**
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc029e4f42fDf8",
  "stakedAmount": "32000000000000000000",
  "rewards": "500000000000000000",
  "apy": "10.5"
}
```

---

## Explorer API

**Base URL:** `http://localhost:4001/api`

### Block Explorer

#### `GET /blocks/search`

Searches for blocks.

**Query Parameters:**
- `q` - Block number or hash
- `limit` - Results limit

**Response:**
```json
[
  {
    "blockNumber": "42",
    "hash": "0x...",
    "timestamp": 1694000000000,
    "transactions": 15,
    "miner": "0x..."
  }
]
```

---

#### `GET /blocks/:number/transactions`

Gets all transactions in a block.

**Response:**
```json
[
  {
    "hash": "0x...",
    "from": "0x...",
    "to": "0x...",
    "value": "1000000000000000000",
    "gas": "21000",
    "gasPrice": "1",
    "status": 1
  }
]
```

---

### Address Explorer

#### `GET /addresses/:address`

Gets detailed address information.

**Response:**
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc029e4f42fDf8",
  "balance": "1000000000000000000",
  "transactionCount": 42,
  "isContract": false,
  "isValidator": true,
  "stakedAmount": "32000000000000000000",
  "firstSeen": 1694000000000,
  "lastSeen": 1694000100000
}
```

---

#### `GET /addresses/:address/transactions`

Gets transactions for an address.

**Query Parameters:**
- `limit` - Results limit
- `offset` - Pagination offset

---

### Contract Verification

#### `POST /contracts/verify`

Verifies contract source code.

**Request Body:**
```json
{
  "address": "0x...",
  "sourceCode": "contract MyToken {...}",
  "compilerVersion": "0.8.0",
  "optimizationUsed": true
}
```

---

### Statistics

#### `GET /stats/network`

Network-wide statistics.

**Response:**
```json
{
  "totalBlocks": 100000,
  "totalTransactions": 5000000,
  "totalAccounts": 250000,
  "totalValidators": 128,
  "circulatingSupply": "2000000000",
  "averageBlockTime": 5.1,
  "averageGasPrice": "1"
}
```

---

## WebSocket API

**Endpoint:** `ws://localhost:8546`

### Real-time Event Subscriptions

#### Subscribe to New Blocks

```javascript
const ws = new WebSocket('ws://localhost:8546');

ws.send(JSON.stringify({
  jsonrpc: '2.0',
  method: 'eth_subscribe',
  params: ['newHeads'],
  id: 1
}));

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('New block:', data.params.result);
};
```

#### Subscribe to Transactions

```javascript
ws.send(JSON.stringify({
  jsonrpc: '2.0',
  method: 'eth_subscribe',
  params: ['pendingTransactions'],
  id: 2
}));
```

---

## Error Codes

| Code | Message | Meaning |
|------|---------|---------|
| -32600 | Invalid Request | Malformed JSON-RPC request |
| -32601 | Method not found | Method doesn't exist |
| -32602 | Invalid params | Invalid parameters |
| -32603 | Internal error | Server error |
| -32700 | Parse error | Invalid JSON |
| 1 | Insufficient balance | Account has insufficient funds |
| 2 | Invalid nonce | Transaction nonce incorrect |
| 3 | Gas limit exceeded | Gas exceeds block limit |
| 4 | Invalid signature | Transaction signature verification failed |
| 5 | Unknown block | Block not found |
| 6 | Unknown account | Account not found |

---

## Rate Limiting

- **Default:** 100 requests per minute per IP
- **Burst:** 10 requests per second
- **Custom:** Contact support for higher limits

---

## Examples

### JavaScript/Web3.js

```javascript
const Web3 = require('web3');
const web3 = new Web3('http://localhost:8545');

// Get block number
const blockNumber = await web3.eth.getBlockNumber();
console.log('Latest block:', blockNumber);

// Get balance
const balance = await web3.eth.getBalance('0x742d35Cc6634C0532925a3b844Bc029e4f42fDf8');
console.log('Balance:', web3.utils.fromWei(balance, 'ether'));

// Send transaction
const tx = {
  from: '0x742d35Cc6634C0532925a3b844Bc029e4f42fDf8',
  to: '0x1234567890123456789012345678901234567890',
  value: web3.utils.toWei('1', 'ether'),
  gas: 21000
};

const receipt = await web3.eth.sendTransaction(tx);
console.log('Transaction hash:', receipt.transactionHash);
```

### Python/Web3.py

```python
from web3 import Web3

w3 = Web3(Web3.HTTPProvider('http://localhost:8545'))

# Get block number
block_number = w3.eth.block_number
print(f'Latest block: {block_number}')

# Get balance
balance = w3.eth.get_balance('0x742d35Cc6634C0532925a3b844Bc029e4f42fDf8')
print(f'Balance: {Web3.from_wei(balance, "ether")} TMR')
```

### cURL

```bash
# Get block number
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "method":"tmr_blockNumber",
    "params":[],
    "id":1
  }'

# Send transaction
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
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
```

---

**Document Version:** 1.0  
**Last Updated:** July 2026
