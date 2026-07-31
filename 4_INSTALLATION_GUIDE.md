# TMR Chain - Installation & Setup Guide

## Quick Start (5 minutes)

### Prerequisites
- Node.js 16+ (https://nodejs.org)
- npm 7+
- Git
- 4GB RAM minimum
- 20GB disk space (for blockchain data)

### Installation Steps

```bash
# 1. Clone or download TMR Chain
git clone https://github.com/tmr-chain/tmr-chain.git
cd tmr-chain

# 2. Install dependencies
npm install

# 3. Start the node
npm start

# 4. Open in browser
# JSON-RPC: http://localhost:8545
# REST API: http://localhost:3000
# Explorer: http://localhost:4001
```

---

## Detailed Setup

### Step 1: Install Node.js

#### macOS (Homebrew)
```bash
brew install node
node --version  # v16.0.0 or higher
npm --version   # 7.0.0 or higher
```

#### Ubuntu/Debian
```bash
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Windows
Download from https://nodejs.org/en/download/ and run the installer.

Verify installation:
```bash
node --version
npm --version
```

---

### Step 2: Clone TMR Chain Repository

```bash
git clone https://github.com/tmr-chain/tmr-chain.git
cd tmr-chain
```

Or download as ZIP from GitHub.

---

### Step 3: Install Dependencies

```bash
npm install
```

This will install all required packages listed in `package.json`.

---

### Step 4: Configure Node

Create a `.env` file in the root directory:

```bash
cat > .env << EOF
# Network Configuration
NODE_ENV=production
CHAIN_ID=5524050
NETWORK_NAME=tmr-chain
NETWORK_VERSION=1.0.0

# Server Ports
RPC_PORT=8545
REST_PORT=3000
EXPLORER_PORT=4001
WALLET_PORT=4000
P2P_PORT=30303
WEBSOCKET_PORT=8546

# Mining Configuration
AUTOMINE=true
MINER_ADDRESS=0x742d35Cc6634C0532925a3b844Bc029e4f42fDf8
MINING_DIFFICULTY=1000000
MINING_THREADS=4

# Validator Configuration
VALIDATOR_STAKE=32000000000000000000
MIN_VALIDATORS=10
MAX_VALIDATORS=10000

# Database Configuration
DB_PATH=./data/blockchain.db
STATE_PATH=./data/state.db
BLOCKS_PATH=./data/blocks

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/node.log

# Network
BOOTSTRAP_NODES=node1.tmr.io:30303,node2.tmr.io:30303
P2P_MAX_PEERS=100
P2P_MIN_PEERS=10

# Performance
MAX_BLOCK_SIZE=1000000
MAX_GAS_LIMIT=30000000
TX_POOL_SIZE=100000
MEMORY_LIMIT=2048
EOF
```

---

### Step 5: Create Directory Structure

```bash
mkdir -p data/{blocks,contracts}
mkdir -p logs
mkdir -p configs
```

---

### Step 6: Start the Node

#### Development Mode (with auto-reload)
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

#### Mining Mode (Auto-mining enabled)
```bash
npm run mine
```

---

### Step 7: Verify Installation

#### Check JSON-RPC Endpoint
```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tmr_blockNumber","params":[],"id":1}'
```

Expected response:
```json
{"jsonrpc":"2.0","result":0,"id":1}
```

#### Check REST API
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{"status":"ok","network":"tmr-chain","chainId":5524050}
```

#### Check Block Explorer
Open browser: `http://localhost:4001`

---

## Configuration Details

### Network Configuration

**RPC Server** (`localhost:8545`)
- JSON-RPC 2.0 protocol
- Ethereum-compatible methods
- TLS/SSL support in production

**REST API** (`localhost:3000`)
- RESTful endpoints
- JSON responses
- Rate limiting enabled

**Explorer** (`localhost:4001`)
- Web interface
- Block browser
- Transaction search
- Address analytics

**Wallet** (`localhost:4000`)
- Key management
- Transaction signing
- Staking interface

**P2P Network** (`localhost:30303`)
- Peer-to-peer communication
- Block propagation
- Transaction gossip
- State synchronization

---

### Mining Configuration

#### Enable/Disable Auto-mining

**In `.env`:**
```
AUTOMINE=true   # Enable auto-mining
AUTOMINE=false  # Disable auto-mining
```

#### Adjust Difficulty

```javascript
// In config.js
const POW_DIFFICULTY = 1000000n; // Lower = easier mining
```

#### Single CPU Core Mining
```bash
MINING_THREADS=1 npm start
```

#### Multi-Core Mining (recommended)
```bash
MINING_THREADS=4 npm start
```

---

### Memory Management

Set memory limits for large datasets:

```bash
# Limit to 4GB
NODE_OPTIONS="--max-old-space-size=4096" npm start

# Limit to 8GB
NODE_OPTIONS="--max-old-space-size=8192" npm start
```

---

## Starting the Node

### Option 1: Single Command

```bash
npm start
```

### Option 2: Docker Container

```bash
# Build Docker image
docker build -t tmr-chain:latest .

# Run container
docker run -d \
  -p 8545:8545 \
  -p 3000:3000 \
  -p 4001:4001 \
  -p 30303:30303 \
  -v tmr-data:/app/data \
  --name tmr-node \
  tmr-chain:latest

# View logs
docker logs -f tmr-node
```

### Option 3: Docker Compose

```bash
docker-compose up -d
```

### Option 4: System Service (Linux)

Create systemd service:

```bash
sudo tee /etc/systemd/system/tmr-chain.service << EOF
[Unit]
Description=TMR Chain Node
After=network.target

[Service]
Type=simple
User=tmr
WorkingDirectory=/home/tmr/tmr-chain
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Enable and start
sudo systemctl enable tmr-chain
sudo systemctl start tmr-chain

# View status
sudo systemctl status tmr-chain
```

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 8545
lsof -i :8545

# Kill process
kill -9 <PID>

# Or use different port
RPC_PORT=8546 npm start
```

### Memory Issues

```bash
# Check available memory
free -h

# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=8192" npm start
```

### Slow Mining

```bash
# Check CPU usage
top

# Reduce mining difficulty
# Edit config.js, lower POW_DIFFICULTY

# Enable multi-threading
MINING_THREADS=8 npm start
```

### Database Corruption

```bash
# Reset blockchain data
rm -rf data/
npm start
```

### Connection Refused

```bash
# Check if node is running
ps aux | grep node

# Check port listening
netstat -tulpn | grep 8545

# Restart node
npm stop
npm start
```

---

## Testing the Node

### 1. Test JSON-RPC

```bash
# Get block number
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tmr_blockNumber","params":[],"id":1}' \
  | jq .result

# Get balance
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tmr_getBalance","params":["0x742d35Cc6634C0532925a3b844Bc029e4f42fDf8"],"id":1}' \
  | jq .result
```

### 2. Test REST API

```bash
# Health check
curl http://localhost:3000/health

# Get stats
curl http://localhost:3000/api/v1/stats

# List blocks
curl http://localhost:3000/api/v1/blocks

# Get account info
curl http://localhost:3000/api/v1/accounts/0x742d35Cc6634C0532925a3b844Bc029e4f42fDf8
```

### 3. Send Test Transaction

```bash
curl -X POST http://localhost:3000/api/v1/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "from": "0x742d35Cc6634C0532925a3b844Bc029e4f42fDf8",
    "to": "0x1234567890123456789012345678901234567890",
    "value": "1000000000000000000",
    "gasPrice": "1",
    "gasLimit": "21000"
  }'
```

---

## Performance Optimization

### 1. Database Optimization

```javascript
// Use LevelDB for better performance
const db = new Level('./data/blockchain.db', {
  compression: true,
  cacheSize: 100 * 1024 * 1024 // 100MB cache
});
```

### 2. Transaction Caching

```javascript
// Cache recent transactions
const txCache = new LRUCache({
  max: 10000,
  maxAge: 1000 * 60 * 5 // 5 minutes
});
```

### 3. Block Parallel Validation

```javascript
// Validate transactions in parallel
Promise.all(transactions.map(tx => validateTransaction(tx)));
```

---

## Network Configuration

### Connect to Testnet

```bash
# Update .env
CHAIN_ID=5524050
BOOTSTRAP_NODES=testnet1.tmr.io:30303,testnet2.tmr.io:30303
```

### Connect to Mainnet

```bash
# Update .env
CHAIN_ID=5524050
BOOTSTRAP_NODES=node1.tmr.io:30303,node2.tmr.io:30303
```

### Run Local Cluster

Terminal 1 (Node 1):
```bash
NODE_ID=1 RPC_PORT=8545 REST_PORT=3000 npm start
```

Terminal 2 (Node 2):
```bash
NODE_ID=2 RPC_PORT=8546 REST_PORT=3001 npm start
```

Terminal 3 (Node 3):
```bash
NODE_ID=3 RPC_PORT=8547 REST_PORT=3002 npm start
```

---

## Security Checklist

- [ ] Change default miner address
- [ ] Set strong RPC authentication (in production)
- [ ] Enable TLS/SSL for RPC endpoints
- [ ] Whitelist IPs for admin APIs
- [ ] Rotate validator keys regularly
- [ ] Enable firewall rules
- [ ] Set up monitoring and alerting
- [ ] Regular security updates
- [ ] Backup private keys securely
- [ ] Test disaster recovery

---

## Monitoring

### View Real-time Logs

```bash
tail -f logs/node.log

# With filtering
grep "ERROR" logs/node.log
grep "PoW\|PoS" logs/node.log
```

### Monitor Metrics

```bash
# CPU and Memory
watch -n 1 'ps aux | grep node'

# Network
iftop -i eth0

# Disk I/O
iostat -x 1
```

### Health Check Script

```bash
#!/bin/bash
# check_node.sh

RPC_URL="http://localhost:8545"

# Check RPC endpoint
BLOCK=$(curl -s -X POST $RPC_URL \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tmr_blockNumber","params":[],"id":1}' \
  | jq -r '.result')

if [ -z "$BLOCK" ]; then
  echo "❌ RPC endpoint down"
  exit 1
fi

echo "✅ Node healthy: Block $BLOCK"
```

---

## Upgrading

### Update to Latest Version

```bash
git pull origin main
npm install
npm audit fix

# Restart node
npm stop
npm start
```

### Database Migrations

```bash
npm run migrate:up
```

---

## Uninstall

```bash
# Stop node
npm stop

# Remove data
rm -rf data logs

# Uninstall packages
rm -rf node_modules
rm package-lock.json

# Remove system service (if installed)
sudo systemctl disable tmr-chain
sudo rm /etc/systemd/system/tmr-chain.service
```

---

## Support

- **Documentation:** https://docs.tmr-chain.io
- **GitHub:** https://github.com/tmr-chain/tmr-chain
- **Discord:** https://discord.gg/tmrchain
- **Email:** support@tmr-chain.io
- **Issues:** https://github.com/tmr-chain/tmr-chain/issues

---

**Last Updated:** July 2026  
**Version:** 1.0.0
