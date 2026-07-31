# TMR Chain - Project Structure & Quick Reference

## 📁 Complete Project Directory Structure

```
tmr-chain/
├── src/
│   ├── index.js                    # Main entry point
│   ├── blockchain.js               # Blockchain class
│   ├── block.js                    # Block structure
│   ├── transaction.js              # Transaction class
│   ├── account.js                  # Account & state management
│   ├── consensus/
│   │   ├── pow.js                  # Proof of Work engine
│   │   ├── pos.js                  # Proof of Stake engine
│   │   └── hybrid.js               # Hybrid consensus coordinator
│   ├── crypto/
│   │   ├── cryptography.js         # Cryptographic utilities
│   │   ├── hash.js                 # Hashing functions
│   │   └── signatures.js           # Digital signatures
│   ├── api/
│   │   ├── rpc-server.js           # JSON-RPC 2.0 server
│   │   ├── rest-server.js          # REST API server
│   │   ├── wallet-api.js           # Wallet management API
│   │   └── explorer-api.js         # Block explorer API
│   ├── network/
│   │   ├── p2p.js                  # P2P networking
│   │   ├── peer-discovery.js       # Peer discovery protocol
│   │   └── sync.js                 # State synchronization
│   ├── storage/
│   │   ├── blockchain-db.js        # Blockchain data storage
│   │   ├── state-db.js             # Account state storage
│   │   └── cache.js                # LRU caching layer
│   ├── validators/
│   │   ├── block-validator.js      # Block validation rules
│   │   ├── tx-validator.js         # Transaction validation
│   │   └── state-validator.js      # State root validation
│   ├── wallet/
│   │   ├── wallet.js               # Wallet implementation
│   │   ├── key-manager.js          # Key management
│   │   └── mnemonic.js             # BIP39 mnemonics
│   ├── contracts/
│   │   ├── evm.js                  # EVM implementation
│   │   ├── precompiles.js          # Precompiled contracts
│   │   └── gas-calculator.js       # Gas computation
│   ├── mining/
│   │   ├── miner.js                # Mining worker
│   │   ├── difficulty.js           # Difficulty adjustment
│   │   └── hashrate.js             # Hashrate tracking
│   ├── config/
│   │   ├── constants.js            # Protocol constants
│   │   ├── chain-config.js         # Chain configuration
│   │   └── defaults.js             # Default settings
│   ├── utils/
│   │   ├── logger.js               # Logging utility
│   │   ├── time.js                 # Time utilities
│   │   ├── encoding.js             # Encoding/decoding
│   │   └── helpers.js              # Helper functions
│   └── tests/
│       ├── unit/
│       │   ├── block.test.js
│       │   ├── transaction.test.js
│       │   ├── pow.test.js
│       │   └── pos.test.js
│       ├── integration/
│       │   ├── mining.test.js
│       │   ├── consensus.test.js
│       │   └── api.test.js
│       └── fixtures/
│           ├── blocks.json
│           ├── transactions.json
│           └── accounts.json
│
├── data/                           # Blockchain data directory
│   ├── blockchain.db              # LevelDB blockchain storage
│   ├── state.db                   # State trie storage
│   ├── blocks/                    # Block files
│   │   └── block_*.json
│   └── contracts/                 # Smart contract bytecode
│       └── *.bin
│
├── logs/                          # Application logs
│   ├── node.log                   # Main log file
│   ├── mining.log                 # Mining activity log
│   └── consensus.log              # Consensus events log
│
├── configs/                       # Configuration files
│   ├── mainnet.env               # Mainnet configuration
│   ├── testnet.env               # Testnet configuration
│   ├── devnet.env                # Local development config
│   └── validator-config.json     # Validator settings
│
├── scripts/                       # Utility scripts
│   ├── generate-keypair.js       # Generate new keypair
│   ├── migrate-db.js             # Database migrations
│   ├── run-cluster.js            # Local cluster runner
│   ├── benchmark.js              # Performance benchmarking
│   ├── faucet.js                 # Testnet faucet
│   └── validators/
│       ├── register.js           # Register as validator
│       ├── stake.js              # Stake management
│       └── withdraw.js           # Withdrawal script
│
├── monitoring/                    # Monitoring configuration
│   ├── prometheus.yml            # Prometheus config
│   ├── grafana-dashboards/       # Grafana JSON dashboards
│   └── alerts.yml                # Alert rules
│
├── docker/
│   ├── Dockerfile                # Main dockerfile
│   ├── Dockerfile.dev            # Development dockerfile
│   └── .dockerignore             # Docker ignore rules
│
├── k8s/                          # Kubernetes manifests
│   ├── namespace.yaml
│   ├── deployment.yaml           # StatefulSet definition
│   ├── service.yaml              # Kubernetes service
│   ├── ingress.yaml              # Ingress rules
│   ├── pvc.yaml                  # Persistent volume claims
│   └── hpa.yaml                  # Horizontal Pod Autoscaler
│
├── docs/                         # Documentation
│   ├── README.md                 # Main documentation
│   ├── ARCHITECTURE.md           # Architecture overview
│   ├── CONSENSUS.md              # Consensus mechanism
│   ├── TOKENOMICS.md             # Token economics
│   ├── SECURITY.md               # Security considerations
│   ├── API.md                    # API documentation
│   ├── CONTRIBUTING.md           # Contribution guidelines
│   └── DEPLOYMENT.md             # Deployment guide
│
├── examples/
│   ├── basic-node.js             # Basic node setup
│   ├── create-wallet.js          # Wallet creation
│   ├── send-tx.js                # Send transaction
│   ├── deploy-contract.js        # Contract deployment
│   ├── mining-example.js         # Mining setup
│   └── web3-integration.js       # Web3.js integration
│
├── .github/
│   ├── workflows/
│   │   ├── tests.yml             # Test CI/CD
│   │   ├── deploy.yml            # Deployment pipeline
│   │   └── security.yml          # Security scanning
│   └── ISSUE_TEMPLATE/
│       └── bug_report.md
│
├── .env.example                  # Example environment file
├── .gitignore                    # Git ignore rules
├── .eslintrc.json               # ESLint configuration
├── .prettierrc.json             # Prettier configuration
├── Dockerfile                   # Production dockerfile
├── docker-compose.yml           # Docker compose config
├── jest.config.js              # Jest test configuration
├── jsdoc.json                  # JSDoc configuration
├── package.json                # npm package file
├── package-lock.json           # Dependency lock file
├── README.md                   # Project readme
├── CHANGELOG.md                # Version history
├── LICENSE                     # MIT License
└── CONTRIBUTING.md             # Contribution guide
```

---

## 🚀 Quick Start Commands

### Installation
```bash
# Clone repository
git clone https://github.com/tmr-chain/tmr-chain.git
cd tmr-chain

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### Running Node
```bash
# Development (with hot reload)
npm run dev

# Production
npm start

# Mining mode
npm run mine

# Local cluster (3 nodes)
npm run cluster
```

### Testing
```bash
# Run all tests
npm test

# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# With coverage
npm test -- --coverage
```

### Maintenance
```bash
# Lint code
npm run lint
npm run lint:fix

# Format code
npm run format

# Security audit
npm audit
npm audit fix
```

---

## 🐳 Docker Commands

### Single Node
```bash
# Build image
docker build -t tmr-chain:latest .

# Run container
docker run -d \
  -p 8545:8545 \
  -p 3000:3000 \
  -v tmr-data:/app/data \
  --name tmr-node \
  tmr-chain:latest

# View logs
docker logs -f tmr-node

# Stop container
docker stop tmr-node
```

### Multi-Node Cluster
```bash
# Start cluster (3 nodes)
docker-compose up -d

# View all containers
docker-compose ps

# View logs
docker-compose logs -f

# Stop cluster
docker-compose down

# Clean up volumes
docker-compose down -v
```

### Kubernetes Deployment
```bash
# Create namespace and deploy
kubectl apply -f k8s/

# View deployment status
kubectl get all -n tmr-chain

# View logs
kubectl logs -f deployment/tmr-node -n tmr-chain

# Scale replicas
kubectl scale statefulset/tmr-node --replicas=5 -n tmr-chain

# Delete deployment
kubectl delete namespace tmr-chain
```

---

## 📊 API Quick Reference

### JSON-RPC (Port 8545)
```bash
# Get block number
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tmr_blockNumber","params":[],"id":1}'

# Get balance
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tmr_getBalance","params":["0x..."],"id":1}'

# Send transaction
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "method":"tmr_sendTransaction",
    "params":[{
      "from":"0x...",
      "to":"0x...",
      "value":"1000000000000000000"
    }],
    "id":1
  }'
```

### REST API (Port 3000)
```bash
# Health check
curl http://localhost:3000/health

# Get stats
curl http://localhost:3000/api/v1/stats

# List blocks
curl http://localhost:3000/api/v1/blocks

# Get account info
curl http://localhost:3000/api/v1/accounts/0x...

# Get validators
curl http://localhost:3000/api/v1/validators

# Send transaction
curl -X POST http://localhost:3000/api/v1/transactions \
  -H "Content-Type: application/json" \
  -d '{...}'
```

---

## 🔧 Configuration Quick Reference

### Environment Variables
```env
# Network
CHAIN_ID=5524050
NETWORK_NAME=tmr-chain

# Ports
RPC_PORT=8545
REST_PORT=3000
EXPLORER_PORT=4001
P2P_PORT=30303

# Mining
AUTOMINE=true
MINING_DIFFICULTY=1000000
MINING_THREADS=4

# Validation
MIN_VALIDATORS=10
MAX_VALIDATORS=10000
VALIDATOR_STAKE=32000000000000000000

# Database
DB_PATH=./data/blockchain.db
STATE_PATH=./data/state.db

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/node.log
```

---

## 📈 Monitoring & Metrics

### Prometheus Metrics (Port 9090)
```bash
# Block height
tmr_block_height

# Network difficulty
tmr_pow_difficulty

# Active validators
tmr_pos_validators

# Pending transactions
tmr_mempool_size

# Transaction throughput
tmr_tps

# Block time
tmr_block_time_ms
```

### Grafana Dashboards
- Node Health (CPU, Memory, Disk)
- Blockchain Metrics (Blocks, TXs, Gas)
- Consensus Metrics (PoW/PoS participation)
- Network Metrics (Peers, Bandwidth)

---

## 🔐 Security Checklist

- [ ] Update miner address
- [ ] Enable RPC authentication
- [ ] Configure firewall rules
- [ ] Set up TLS/SSL
- [ ] Backup validator keys
- [ ] Enable monitoring
- [ ] Set up alerting
- [ ] Regular security audits
- [ ] Update dependencies
- [ ] Test disaster recovery

---

## 📚 Key Files Overview

| File | Purpose |
|------|---------|
| `2_TMR_CHAIN_IMPLEMENTATION.js` | Core blockchain implementation |
| `1_TMR_CHAIN_WHITEPAPER.md` | Technical specification |
| `3_API_DOCUMENTATION.md` | Complete API reference |
| `4_INSTALLATION_GUIDE.md` | Setup instructions |
| `5_EXAMPLES_AND_TESTING.js` | Usage examples |
| `docker-compose.yml` | Multi-node cluster config |
| `package.json` | Dependencies & scripts |

---

## 🧪 Testing Strategy

### Unit Tests
- Cryptographic functions
- Block validation
- Transaction processing
- State management

### Integration Tests
- Mining consensus
- Validator selection
- Block finalization
- P2P synchronization

### Performance Tests
- Transaction throughput
- Block time consistency
- Memory usage
- Network bandwidth

### Security Tests
- Signature verification
- Replay attack prevention
- State root consistency
- Consensus attacks

---

## 🚨 Troubleshooting Guide

### Node won't start
```bash
# Check logs
tail -f logs/node.log

# Verify ports are free
netstat -tulpn | grep 8545

# Clear corrupted data
rm -rf data/
npm start
```

### Slow mining
```bash
# Check difficulty
grep "difficulty" logs/mining.log

# Monitor CPU
top -p $(pgrep -f "node.*index.js")

# Reduce difficulty in config
```

### Memory issues
```bash
# Check memory
ps aux | grep node | grep -v grep | awk '{print $6}'

# Increase Node.js limit
NODE_OPTIONS="--max-old-space-size=8192" npm start
```

### Consensus failures
```bash
# Check validator count
curl http://localhost:3000/api/v1/validators | jq '.length'

# Monitor consensus events
grep "Consensus" logs/node.log
```

---

## 📞 Support Resources

- **Documentation:** https://docs.tmr-chain.io
- **GitHub Issues:** https://github.com/tmr-chain/tmr-chain/issues
- **Discord:** https://discord.gg/tmrchain
- **Email:** support@tmr-chain.io
- **Twitter:** @tmrchain

---

## 📄 Related Documentation

1. **Whitepaper**: Technical architecture and consensus mechanism
2. **API Docs**: Complete endpoint reference
3. **Installation Guide**: Step-by-step setup instructions
4. **Examples**: Code samples and usage patterns
5. **Docker Guide**: Containerization and orchestration

---

## 🎯 Development Roadmap

- ✅ Phase 1: Core blockchain implementation
- ✅ Phase 2: JSON-RPC & REST APIs
- 🔄 Phase 3: Smart contract support
- ⏳ Phase 4: L2 scaling solutions
- ⏳ Phase 5: Cross-chain interoperability

---

**Last Updated:** July 2026  
**Version:** 1.0.0  
**Status:** Production Ready
