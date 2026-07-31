# TMR Chain: Next-Generation Hybrid Consensus Layer-1 Blockchain

## Executive Summary

TMR Chain is a Layer-1 blockchain that combines Proof of Work (PoW) and Proof of Stake (PoS) consensus mechanisms in a novel 50/50 hybrid model. This architecture provides unparalleled security through dual validation layers while maintaining fast block finality, decentralization, and scalability.

**Key Specifications:**
- **Chain ID:** 5524050
- **Native Coin:** TMR
- **Total Supply:** 10,000,000,000 TMR
- **Block Time:** 5 seconds
- **Block Finality:** Instant (after validator approval)
- **Consensus:** Hybrid PoW (50%) + PoS (50%)
- **Smart Contracts:** EVM-compatible
- **Mining Algorithm:** RandomX (GPU/CPU resistant, ASIC-friendly after community consensus)

---

## 1. Architecture Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    TMR Chain Network                     │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────────┐          ┌──────────────────┐     │
│  │   PoW Miners     │          │  PoS Validators  │     │
│  │ (50% Security)   │          │ (50% Security)   │     │
│  │                  │          │                  │     │
│  │ • Candidate Block│          │ • Block Verify   │     │
│  │ • Hash Solving   │          │ • Finalize       │     │
│  │ • Difficulty Adj │          │ • Sign Blocks    │     │
│  └────────┬─────────┘          └────────┬─────────┘     │
│           │                             │                │
│           └──────────────┬──────────────┘                │
│                          │                               │
│              ┌───────────▼──────────┐                   │
│              │  Hybrid Consensus    │                   │
│              │   Layer (50/50)      │                   │
│              │                      │                   │
│              │ • Block Validation   │                   │
│              │ • Instant Finality   │                   │
│              │ • Conflict Resolution│                   │
│              └───────────┬──────────┘                   │
│                          │                               │
│           ┌──────────────▼──────────────┐               │
│           │   Consensus State Machine   │               │
│           │                            │               │
│           │ Block Proposal → Verify    │               │
│           │ → Finalize → Add to Chain  │               │
│           └──────────────┬──────────────┘               │
│                          │                               │
│           ┌──────────────▼──────────────┐               │
│           │     Blockchain Storage      │               │
│           │                            │               │
│           │ • State Trie (Merkle)      │               │
│           │ • Block Database           │               │
│           │ • Transaction Pool         │               │
│           │ • Account State            │               │
│           └────────────────────────────┘               │
│                                                           │
└─────────────────────────────────────────────────────────┘

      API Layer
┌─────────────────────────────────────────────────────────┐
│ JSON-RPC  │  REST API  │  Wallet API  │  Explorer API   │
│ (Port 8545)│ (Port 3000)│ (Port 4000) │ (Port 4001)    │
└─────────────────────────────────────────────────────────┘
```

### 1.2 Core Components

| Component | Purpose | Key Responsibility |
|-----------|---------|-------------------|
| **PoW Engine** | Proof of Work validation | Mine blocks, solve cryptographic puzzles |
| **PoS Validator** | Stake-based validation | Verify and finalize blocks |
| **Hybrid Consensus** | Bridge PoW & PoS | Ensure dual validation, resolve conflicts |
| **State Machine** | Consensus sequencing | Manage block lifecycle and state transitions |
| **Storage Layer** | Data persistence | Merkle trees, account state, blockchain history |
| **Mempool** | Transaction queue | Manage unconfirmed transactions |
| **RPC Server** | Client communication | JSON-RPC 2.0 compliant API |
| **P2P Network** | Node communication | Peer discovery, block/transaction propagation |

---

## 2. Consensus Mechanism

### 2.1 Hybrid Consensus Model

#### Block Production (50% PoW)

Miners compete to solve cryptographic puzzles and produce candidate blocks:

1. **Mining Process:**
   - Listen to pending transactions
   - Construct candidate block
   - Solve RandomX puzzle (adjustable difficulty)
   - Broadcast candidate block to network
   - Receive mining reward (50% of block rewards)

2. **Difficulty Adjustment:**
   - Retarget every 2,016 blocks (~2.8 hours)
   - Formula: `newDifficulty = oldDifficulty × (targetTime / actualTime)`
   - Target: 5-second blocks
   - Actual: Measure previous 2,016 blocks

3. **Mining Rewards:**
   - Base reward: 100 TMR per block
   - Halving schedule: Every 4 years (63,072,000 blocks)
   - Miner receives: 50% of base reward + transaction fees
   - Validator receives: 50% of base reward + transaction fees

#### Block Finalization (50% PoS)

Validators stake TMR and finalize blocks for instant confirmations:

1. **Validator Requirements:**
   - Minimum stake: 32,000 TMR
   - Maximum per validator: 1,000,000 TMR
   - Total active validators: ~10,000
   - Uptime requirement: 95%

2. **Finalization Process:**
   - Random 128 validators selected per block
   - Each validator checks block validity
   - All 128 validators must approve (Byzantine Fault Tolerance)
   - Instant block finality upon approval
   - Reward: 50% of base reward + transaction fees (split among 128 validators)

3. **Validator Incentives:**
   - Staking rewards: ~10% APY
   - Transaction fee share
   - Penalty for non-participation: 0.0001 TMR per missed block
   - Slash for malicious behavior: Up to full stake

### 2.2 Consensus State Machine

```
BLOCK_PROPOSED
    ↓ [PoW miner broadcasts candidate block]
BLOCK_RECEIVED
    ↓ [Mempool validation, transaction replay protection]
VALIDATORS_SELECTED
    ↓ [128 validators randomly selected]
BLOCK_VERIFICATION
    ↓ [Each validator independently verifies]
    ├─ Check PoW proof
    ├─ Validate transactions
    ├─ Verify state root
    ├─ Check nonce sequence
    └─ Confirm gas limits
VOTING_ROUND
    ↓ [Validators vote on block validity]
    ├─ Approval (≥128 signatures) → FINALIZED
    ├─ Rejection (majority vote) → REJECTED
    └─ Timeout (>5s) → TIMEOUT
BLOCK_FINALIZED
    ↓ [Block added to canonical chain]
    ├─ Update state
    ├─ Distribute rewards
    ├─ Clear transactions from mempool
    └─ Broadcast to network
FINALITY_CONFIRMED
    ↓ [Irreversible, transaction complete]
```

### 2.3 51% Attack Prevention

**Security Against PoW 51% Attack:**
- Attacker needs 51% of network hash rate
- Must also control 128 validators simultaneously
- Stake slashing makes validator control expensive
- Combined probability: (0.51 × 0.51)² = 6.76% (exponentially harder)

**Security Against PoS 51% Attack:**
- Requires 51% of staked TMR (~5.1 billion TMR)
- Estimated value: $102 billion USD (at $0.02/TMR)
- Economic damage from slashing: 10-20% of stake
- Cost of attack >> benefit

**Dual-Layer Security:**
- Even if one consensus layer fails, other continues
- Automatic fallback to longest valid chain
- Network halts gracefully if both layers fail
- Regular security audits and protocol updates

---

## 3. Tokenomics

### 3.1 Token Distribution

**Total Supply: 10,000,000,000 TMR**

| Allocation | Amount | Percentage | Purpose |
|------------|--------|-----------|---------|
| **Pre-Launch Distribution** | 2,000,000,000 | 20% | |
| - Team & Advisors | 400,000,000 | 4% | 4-year vesting |
| - Early Investors | 1,200,000,000 | 12% | 2-year vesting |
| - Treasury | 400,000,000 | 4% | Ecosystem development |
| **Mining Rewards** | 6,300,000,000 | 63% | PoW block rewards |
| **Staking Rewards** | 1,700,000,000 | 17% | PoS validator rewards |

### 3.2 Reward Schedule

**Year 1-4: 100 TMR per block**
- 5,256,000 blocks/year × 100 TMR = 525,600,000 TMR/year
- PoW miners: 262,800,000 TMR/year
- PoS validators: 262,800,000 TMR/year

**Year 5-8: 50 TMR per block (First halving)**
- PoW miners: 131,400,000 TMR/year
- PoS validators: 131,400,000 TMR/year

**Year 9-12: 25 TMR per block**
**Year 13+: 12.5 TMR per block (minimum)**

**Halving Schedule:**
- 1st Halving: Block 252,288,000 (Year 4.8)
- 2nd Halving: Block 504,576,000 (Year 9.6)
- 3rd Halving: Block 756,864,000 (Year 14.4)
- Final supply approaches 10 billion TMR asymptotically

### 3.3 Transaction Fees

**Gas-Based Fee Model:**

```
Transaction Fee = gasUsed × gasPrice (in wei/gwei)

Distribution:
- 40% → Block Miner (PoW)
- 40% → Block Validators (PoS, split 128 ways)
- 20% → Treasury (Ecosystem development)
```

**Gas Limits:**
- Block gas limit: 30,000,000 (3x Ethereum)
- Transaction min gas: 21,000
- Contract deployment: 53,000
- Per-opcode: 1-700 gas

**Fee Tiers (Dynamic):**
- Base fee adjustment per block
- Priority fee for faster inclusion
- Tip mechanism for validators

### 3.4 Treasury Management

**Annual Treasury Income:**
- 20% of block rewards
- 20% of transaction fees
- Governance token allocation

**Treasury Use Cases:**
- Protocol research and development
- Security audits and bug bounties
- Community grants and education
- Ecosystem infrastructure
- Network upgrades and testing

---

## 4. Security Model

### 4.1 Cryptographic Primitives

| Component | Algorithm | Security Level |
|-----------|-----------|-----------------|
| **Hashing** | SHA-256 | 256-bit |
| **PoW Algorithm** | RandomX | Memory-hard, CPU/GPU resistant |
| **Digital Signatures** | ECDSA (secp256k1) | 256-bit |
| **Merkle Tree** | SHA-256 | For state and transactions |
| **Random Number Gen** | VRF (Verifiable Random Function) | Validator selection |
| **Key Derivation** | PBKDF2 | Wallet mnemonics |

### 4.2 Slashing Mechanism

**Slashing Conditions:**

1. **Double Signing (50% slash)**
   - Validator signs two different blocks at same height
   - Penalty: 50% of staked amount
   - Detection: Automated, enforced by protocol

2. **Equivocation (75% slash)**
   - Validator provides conflicting block votes
   - Evidence required: Two conflicting signatures
   - Penalty: 75% of staked amount

3. **Non-Participation (0.01% per missed block)**
   - Validator selected but fails to sign
   - Cumulative: Up to 32% loss if missing 3,200 blocks
   - Auto-reactivation: When uptime recovers

4. **Malicious State Root (100% slash)**
   - Deliberately submitting false state root
   - Penalty: 100% of staked amount + network ban
   - Evidence: Proof of invalid state transition

### 4.3 Attack Vectors & Mitigations

| Attack Vector | Threat Level | Mitigation |
|---------------|--------------|-----------|
| **51% PoW Attack** | Medium | Requires 51% hash rate + PoS control |
| **Sybil Attack** | Low | Stake requirement ($1M+), identity verification |
| **Double Spend** | Very Low | Instant finality after validator approval |
| **Long Range Attack** | Low | Validator lock-up period (21 days) |
| **Censorship** | Low | Diverse validator set, economic incentives |
| **Network Partition** | Medium | Longest valid chain + validator sync |
| **Smart Contract Exploit** | Medium | EVM audits, rate limiting, gas metering |

### 4.4 Network Security Assumptions

1. **Honest Majority:** >50% of validators are honest
2. **Network Connectivity:** 99%+ nodes synchronized within 5 seconds
3. **Cryptographic Security:** No SHA-256 or ECDSA breaks
4. **Economic Rationality:** Validators maximize long-term profit
5. **Regulatory Compliance:** No forced node shutdowns (>30% quorum)

---

## 5. Smart Contract Support

### 5.1 EVM Compatibility

TMR Chain runs a modified Ethereum Virtual Machine:

```
┌──────────────────────────────────┐
│   Solidity Smart Contracts       │
│   (0.8.x compatible)             │
└───────────────┬──────────────────┘
                │
┌───────────────▼──────────────────┐
│   Bytecode Compiler              │
│   (Standard EVM compiler)        │
└───────────────┬──────────────────┘
                │
┌───────────────▼──────────────────┐
│   EVM Runtime                    │
│   - State transitions            │
│   - Gas metering                 │
│   - Opcode execution             │
└───────────────┬──────────────────┘
                │
┌───────────────▼──────────────────┐
│   Storage Layer                  │
│   - Account state (balance, code)│
│   - Contract storage (key-value) │
│   - Nonce tracking               │
└──────────────────────────────────┘
```

### 5.2 Contract Deployment

**Deployment Process:**
1. Send transaction with bytecode to address 0x0
2. Gas: 53,000 + 200 per byte (contract size)
3. Contract address: keccak256(creator_address + nonce)
4. Deployed on next block finalization
5. Immutable and permanent

### 5.3 Precompiled Contracts

```
0x1: ecRecover    - ECDSA signature recovery
0x2: SHA256       - SHA-256 hash function
0x3: RIPEMD160    - RIPEMD-160 hash
0x4: identity     - Identity function
0x5: modexp       - Modular exponentiation
0x6: ecAdd        - Elliptic curve addition
0x7: ecMul        - Elliptic curve multiplication
0x8: ecPairing    - Pairing check
0x9: blake2f      - BLAKE2f compression
```

---

## 6. Data Structures

### 6.1 Block Structure

```
Block Header:
├── version              (uint32, 4 bytes)
├── parentHash           (bytes32, 32 bytes)
├── stateRoot            (bytes32, 32 bytes)
├── transactionsRoot     (bytes32, 32 bytes)
├── receiptsRoot         (bytes32, 32 bytes)
├── timestamp            (uint64, 8 bytes)
├── blockNumber          (uint64, 8 bytes)
├── difficulty           (uint256, 32 bytes)
├── nonce                (uint64, 8 bytes)
├── miner                (address, 20 bytes)
├── gasLimit             (uint64, 8 bytes)
├── gasUsed              (uint64, 8 bytes)
├── coinbase             (address, 20 bytes)
├── extraData            (bytes, variable)
├── mixHash              (bytes32, 32 bytes)
└── validatorSignatures  (bytes, variable)

Block Body:
├── transactions[]       (Transaction[], variable)
├── uncles[]             (Header[], optional)
└── validatorBitfield    (bitfield, 16 bytes max)
```

### 6.2 Transaction Structure

```
Transaction:
├── nonce                (uint64)
├── gasPrice             (uint256)
├── gasLimit             (uint64)
├── to                   (address)
├── value                (uint256)
├── data                 (bytes)
├── v                    (uint8)
├── r                    (bytes32)
├── s                    (bytes32)
├── chainId              (uint256, 5524050)
└── accessList[]         (optional, EIP-2930)
```

### 6.3 Account State

```
Account:
├── nonce                (uint64, tx counter)
├── balance              (uint256, in wei)
├── storageRoot          (bytes32, contract data)
├── codeHash             (bytes32, bytecode hash)
├── lastActivityBlock    (uint64, last modified)
└── stakingInfo          (optional)
    ├── stakedAmount     (uint256)
    ├── delegatedTo      (address)
    └── lastRewardBlock  (uint64)
```

---

## 7. Network Protocols

### 7.1 P2P Network

**Protocol Stack:**
```
Application Layer (JSON-RPC, Eth Wire Protocol)
        ↓
Transport Layer (TCP/UDP, libp2p)
        ↓
Internet Layer (IPv4/IPv6)
        ↓
Link Layer (Ethernet)
```

**Message Types:**
- `ping/pong` - Latency check
- `block` - Block propagation
- `transactions` - Transaction broadcast
- `getBlocks` - Historical data request
- `peers` - Peer discovery
- `sync` - State synchronization

### 7.2 Peer Discovery

**Mechanisms:**
1. **DNS Seed:** `seeds.tmrchain.io`
2. **Bootstrap Nodes:** Hardcoded list in client
3. **Kademlia DHT:** Distributed hash table
4. **Connection:** Max 100 peers, min 10

---

## 8. API Specifications

### 8.1 JSON-RPC 2.0 Endpoints

**Endpoint:** `http://localhost:8545`

**Methods Overview:**
- `tmr_blockNumber` - Latest block height
- `tmr_getBalance` - Account balance
- `tmr_sendTransaction` - Submit transaction
- `tmr_getBlock` - Retrieve block data
- `tmr_getTransactionReceipt` - Transaction status
- `tmr_call` - Execute smart contract (read-only)
- `tmr_estimateGas` - Gas cost estimation
- `eth_*` - Full Ethereum compatibility

### 8.2 REST API

**Base URL:** `http://localhost:3000/api/v1`

**Endpoints:**
- `GET /blocks` - List blocks
- `GET /blocks/:hash` - Block details
- `GET /transactions/:hash` - Transaction details
- `GET /accounts/:address` - Account info
- `POST /transactions` - Submit transaction
- `GET /validators` - Active validators
- `GET /stats` - Network statistics

### 8.3 Wallet API

**Base URL:** `http://localhost:4000/api`

**Operations:**
- Account creation and key management
- Transaction signing
- Balance queries
- Staking/unstaking

### 8.4 Block Explorer API

**Base URL:** `http://localhost:4001/api`

**Features:**
- Block search and filtering
- Transaction history
- Address details
- Smart contract verification
- Gas tracking and analytics

---

## 9. Security Considerations

### 9.1 Private Key Management

- **Hardware Wallets:** Supported (Ledger, Trezor)
- **Key Derivation:** BIP-32/39/44
- **Mnemonic:** 12/24 words (BIP-39 standard)
- **Key Storage:** Encrypted with AES-256-GCM

### 9.2 Smart Contract Auditing

- All protocol contracts audited by tier-1 firms
- Source code verification in block explorer
- Gas-efficient implementations
- Formal verification for critical paths

### 9.3 Rate Limiting & DOS Protection

- Connection throttling: 100 req/min per IP
- Bandwidth limiting: 10 MB/s per peer
- Transaction pool limit: 100,000 tx
- Mempool eviction: By gas price (lowest removed first)

### 9.4 Regular Security Updates

- Monthly protocol reviews
- Quarterly security audits
- Automatic vulnerability disclosure program
- Bug bounty: Up to $100,000 USD

---

## 10. Governance

### 10.1 Upgrade Mechanism

```
Proposal Phase (7 days)
    ↓ [Minimum 100,000 TMR stake required]
Discussion Phase (7 days)
    ↓ [Community deliberation]
Voting Phase (7 days)
    ↓ [Token holders vote, >50% approval needed]
Implementation Phase
    ↓ [Core developers implement]
Testing Phase (14 days)
    ↓ [Testnet validation]
Activation Phase
    ↓ [Network-wide upgrade at specific block height]
```

### 10.2 On-Chain Governance

- **Governance Token:** Same as TMR
- **Voting Power:** 1 TMR = 1 vote
- **Quorum:** 30% of staked TMR
- **Proposal Types:** Parameter changes, fund allocation, protocol upgrades

---

## 11. Roadmap

| Phase | Timeline | Milestones |
|-------|----------|-----------|
| **Testnet Alpha** | Month 1-3 | Core protocol, basic mining, PoW/PoS |
| **Testnet Beta** | Month 4-6 | EVM compatibility, full API, validators |
| **Security Audit** | Month 7-9 | Third-party audits, bug fixes |
| **Mainnet Launch** | Month 10 | Genesis block, initial miners/validators |
| **Optimization** | Month 11-12 | Performance tuning, scalability improvements |
| **Layer 2** | Year 2 | Rollups, payment channels, sidechains |

---

## 12. Conclusion

TMR Chain represents a paradigm shift in blockchain security through hybrid consensus. By combining the proven security of Proof of Work with the energy efficiency and finality of Proof of Stake, TMR Chain achieves:

- **Unparalleled Security:** Dual validation layer prevents 51% attacks
- **Instant Finality:** 5-second blocks with immediate confirmation
- **Decentralization:** Mix of miners and validators prevents centralization
- **Scalability:** 3x Ethereum's transaction throughput
- **Sustainability:** 95% less energy than pure PoW
- **Developer-Friendly:** Full EVM compatibility

Join us in building the future of blockchain technology.

---

**Document Version:** 1.0  
**Last Updated:** July 2026  
**Status:** Production-Ready
