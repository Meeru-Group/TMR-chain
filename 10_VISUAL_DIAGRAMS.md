# TMR Chain - Visual Architecture & Reference Diagrams

## 🏗️ System Architecture Layers

```
┌─────────────────────────────────────────────────────────────────────┐
│                           APPLICATION LAYER                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ DApps        │  │ Wallets      │  │ Block Explorers        │  │
│  │ Smart        │  │ Exchanges    │  │ Governance Interfaces  │  │
│  │ Contracts    │  │ Custodians   │  │ Analytics Dashboards   │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
         │                   │                        │
         └───────────────────┼────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           API LAYER (External)                      │
│                                                                      │
│  JSON-RPC 2.0 (8545) │ REST API (3000) │ WebSocket (8546)          │
│  ├─ eth_*            │ ├─ /blocks      │ ├─ newHeads              │
│  ├─ tmr_*            │ ├─ /accounts    │ ├─ newPendingTx          │
│  └─ net_*            │ ├─ /validators  │ └─ logs                  │
│                      │ ├─ /stats       │                          │
│                      │ └─ /health      │                          │
└─────────────────────────────────────────────────────────────────────┘
         │                   │                        │
         └───────────────────┼────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      CONSENSUS COORDINATION LAYER                   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Block Proposal → Validation → Finalization → Reward        │  │
│  │  (PoW Candidate) (PoS Check)  (Signatures)   (Distribution)  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  State Machine:                                                     │
│  IDLE → MINING → RECEIVED → VERIFYING → FINALIZING → CONFIRMED    │
└─────────────────────────────────────────────────────────────────────┘
         │                                          │
    ┌────┴────┐                               ┌────┴────┐
    ▼         ▼                               ▼         ▼
┌────────────────────────┐        ┌────────────────────────────────┐
│   PROOF OF WORK        │        │   PROOF OF STAKE               │
│                        │        │                                │
│ • SHA-256 Mining       │        │ • Validator Selection (VRF)    │
│ • Difficulty Adjust    │        │ • Byzantine Consensus          │
│ • Candidate Blocks     │        │ • Block Finalization           │
│ • Reward Distribution  │        │ • Slashing for Malice          │
│ • 50% of Rewards       │        │ • Staking Rewards (APY)        │
│                        │        │ • 50% of Rewards               │
└────────────────────────┘        └────────────────────────────────┘
         │                                  │
         └──────────────┬───────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    EXECUTION & STATE LAYER                          │
│                                                                      │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │ EVM Interpreter  │  │ State Trie       │  │ Storage Layout   │  │
│  │                  │  │ (Merkle Trees)   │  │                  │  │
│  │ • Opcodes        │  │ • Account State  │  │ • Key-Value DB   │  │
│  │ • Gas Metering   │  │ • Code Hash      │  │ • LRU Cache      │  │
│  │ • Precompiles    │  │ • Storage Root   │  │ • State Root     │  │
│  │ • Call Stack     │  │ • Balance Tree   │  │ • Bloom Filters  │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
         │                   │                        │
         └───────────────────┼────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    BLOCKCHAIN DATA LAYER                            │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Block Chain (Linked Blocks)                                 │  │
│  │                                                              │  │
│  │ [Genesis] → [Block 1] → [Block 2] → ... → [Latest]         │  │
│  │  Hash 0x00  Hash 0x..   Hash 0x..      Hash 0x..           │  │
│  │             ↑            ↑                     ↑             │  │
│  │             Parent Hash  Parent Hash    Parent Hash          │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ LevelDB Storage                                              │  │
│  │ • Block Index         (block number → hash)                │  │
│  │ • Transaction Index   (tx hash → receipt)                  │  │
│  │ • Account State       (address → nonce, balance, code)     │  │
│  │ • Storage Trees       (address+key → value)                │  │
│  │ • Validator Registry  (address → stake, uptime)            │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      NETWORK LAYER (P2P)                            │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Peer-to-Peer Network (libp2p Compatible)                   │  │
│  │                                                              │  │
│  │ Node 1 ←─→ Node 2                                           │  │
│  │   ↓       ↓                                                 │  │
│  │ Node 3 ←─→ Node 4                                           │  │
│  │   ↓       ↓                                                 │  │
│  │ Node 5 ←─→ Node 6 (Full mesh, up to 100 peers)             │  │
│  │                                                              │  │
│  │ Message Types:                                              │  │
│  │ • Blocks (propagation)                                      │  │
│  │ • Transactions (gossip)                                     │  │
│  │ • Validators (state sync)                                   │  │
│  │ • Peers (discovery)                                         │  │
│  │ • Ping/Pong (health check)                                  │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Consensus Mechanism Flow Diagram

```
                          CONSENSUS CYCLE (5 seconds)
                                   ↓
        ┌──────────────────────────────────────────────┐
        │         PHASE 1: BLOCK PROPOSAL (0-2s)       │
        ├──────────────────────────────────────────────┤
        │                                              │
        │  PoW Miners:                                │
        │  • Collect pending transactions             │
        │  • Build candidate block                    │
        │  • Solve SHA-256 puzzle (difficulty adjust) │
        │  • Broadcast block to network               │
        │                                              │
        │  PoS Validators (parallel):                 │
        │  • Listen for candidate blocks              │
        │  • Store in pending pool                    │
        │  • Prepare verification checks              │
        │                                              │
        └──────────────────────────────────────────────┘
                           ↓
        ┌──────────────────────────────────────────────┐
        │      PHASE 2: BLOCK VERIFICATION (2-3s)      │
        ├──────────────────────────────────────────────┤
        │                                              │
        │  Select Validators:                         │
        │  • VRF(blockNumber, networkEntropy)         │
        │  • 128 validators chosen                    │
        │  • Minimum 95% uptime required              │
        │                                              │
        │  Verify Block:                              │
        │  • Check PoW proof (hash < target)          │
        │  • Validate all transactions                │
        │  • Verify state root                        │
        │  • Check nonce sequence                     │
        │  • Confirm gas limits                       │
        │                                              │
        │  Parallel Processing: 128 validators        │
        │  Consensus: 80% agreement required          │
        │                                              │
        └──────────────────────────────────────────────┘
                           ↓
        ┌──────────────────────────────────────────────┐
        │       PHASE 3: BLOCK FINALIZATION (3-4s)     │
        ├──────────────────────────────────────────────┤
        │                                              │
        │  Validator Voting:                          │
        │  ✓ Approved (103+ votes)                    │
        │  ✗ Rejected (25+ votes)                     │
        │  ⏱ Timeout (>1 second)                      │
        │                                              │
        │  If Approved:                               │
        │  • Collect validator signatures             │
        │  • Create finalized block                   │
        │  • Broadcast to all nodes                   │
        │  • Add to canonical chain                   │
        │                                              │
        │  If Rejected:                               │
        │  • Discard candidate block                  │
        │  • Return to proposal phase                 │
        │  • Adjust miner's difficulty                │
        │                                              │
        └──────────────────────────────────────────────┘
                           ↓
        ┌──────────────────────────────────────────────┐
        │      PHASE 4: REWARD DISTRIBUTION (4-5s)     │
        ├──────────────────────────────────────────────┤
        │                                              │
        │  Block Reward Calculation:                  │
        │  • Base: 100 TMR (halves every 4 years)     │
        │  • Halving: Every 63,072,000 blocks         │
        │                                              │
        │  Fee Distribution:                          │
        │  • 40% → Miner (PoW)                        │
        │  • 40% → Validators (PoS, split 128 ways)  │
        │  • 20% → Treasury                           │
        │                                              │
        │  Total Validator Reward:                    │
        │  • Base: 50 TMR (split equally)             │
        │  • Per validator: 50/128 ≈ 0.39 TMR         │
        │  • Plus transaction fees                    │
        │                                              │
        │  Stake Rewards (Annual):                    │
        │  • APY: 10.5%                               │
        │  • Auto-compounding                         │
        │                                              │
        └──────────────────────────────────────────────┘
                           ↓
        ┌──────────────────────────────────────────────┐
        │   BLOCK FINALIZED & IRREVERSIBLE ✓           │
        │                                              │
        │   Block #N+1 ready for next cycle            │
        └──────────────────────────────────────────────┘
```

---

## 🔐 Security Model Comparison

```
ATTACK SCENARIO ANALYSIS:

┌──────────────────────────────────────────────────────────────┐
│ Attack: 51% PoW Attack (majority hash power)                │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ Traditional PoW Blockchain:                                 │
│ • Attacker needs: 51% of hash rate                         │
│ • Cost: ~$5-10 billion (Ethereum scale)                    │
│ • Risk: Fork, reorg, double spend                          │
│ • Severity: CRITICAL                                        │
│                                                              │
│ TMR Chain (Hybrid):                                         │
│ • Attacker needs: 51% hash rate + 51% staked TMR           │
│ • Hash rate attack cost: ~$100M (smaller network)          │
│ • Staking attack cost: ~$102B (5.1B TMR @ $0.02)           │
│ • Combined probability: (0.51 × 0.51)² = 6.76%            │
│ • Severity: NEGLIGIBLE                                      │
│                                                              │
│ Advantage: Dual-layer makes attack economically infeasible │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Attack: Long-Range Attack (reversing old blocks)            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ Pure PoS Risk:                                              │
│ • Attacker can create alternative chain history            │
│ • No computational cost (PoS stake = history)              │
│ • Severity: HIGH                                            │
│                                                              │
│ TMR Chain (Hybrid):                                         │
│ • PoW requires repeating all mining work                    │
│ • Exponentially expensive past recent blocks               │
│ • Checkpoint system + validator bonds                      │
│ • Severity: LOW                                             │
│                                                              │
│ Advantage: PoW provides immutability anchor                │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Attack: Validator Cartel (all validators collude)           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ Pure PoS Risk:                                              │
│ • Validators can censor or alter blocks                     │
│ • Economic incentives can align                             │
│ • Severity: MEDIUM                                          │
│                                                              │
│ TMR Chain (Hybrid):                                         │
│ • Miners can reorg consensus if needed                      │
│ • Double validation layer breaks collusion                 │
│ • Slashing mechanism (up to 100% stake loss)               │
│ • Economic incentive to remain honest                       │
│ • Severity: LOW                                             │
│                                                              │
│ Advantage: Incentive alignment through dual rewards        │
└──────────────────────────────────────────────────────────────┘
```

---

## 💰 Tokenomics Timeline

```
YEAR 0-4: Era of Abundance
┌────────────────────────────────────────────────────────────┐
│ Block Reward: 100 TMR per block                           │
│ Annual Issuance: ~525.6M TMR                              │
│ Inflation Rate: 5.26%                                     │
│                                                            │
│ Year 0: ████████████████░░░░░░░░░░ 50M TMR (50%)         │
│ Year 1: ████████████████░░░░░░░░░░ 525.6M TMR            │
│ Year 2: ████████████████░░░░░░░░░░ 525.6M TMR            │
│ Year 3: ████████████████░░░░░░░░░░ 525.6M TMR            │
│ Year 4: ████████████████░░░░░░░░░░ 525.6M TMR            │
│                                                            │
│ Cumulative: 2.2B TMR (22% of total)                       │
│ Active Validators: 128                                     │
│ Average Stake per Validator: 32,000 TMR                   │
└────────────────────────────────────────────────────────────┘
                            ↓
              HALVING #1 (Block 252,288,000)
                   (Year 4.8)
                            ↓
YEAR 4.8-8.8: Era of Prosperity
┌────────────────────────────────────────────────────────────┐
│ Block Reward: 50 TMR per block (50% reduction)            │
│ Annual Issuance: ~262.8M TMR                              │
│ Inflation Rate: 2.63%                                     │
│                                                            │
│ Year 5: ████████░░░░░░░░░░░░░░░░░░░░ 262.8M TMR         │
│ Year 6: ████████░░░░░░░░░░░░░░░░░░░░ 262.8M TMR         │
│ Year 7: ████████░░░░░░░░░░░░░░░░░░░░ 262.8M TMR         │
│ Year 8: ████████░░░░░░░░░░░░░░░░░░░░ 262.8M TMR         │
│                                                            │
│ Cumulative: 3.25B TMR (32.5% of total)                    │
│ Active Validators: 500+                                    │
└────────────────────────────────────────────────────────────┘
                            ↓
              HALVING #2 (Block 504,576,000)
                   (Year 9.6)
                            ↓
YEAR 9.6-13.6: Era of Maturity
┌────────────────────────────────────────────────────────────┐
│ Block Reward: 25 TMR per block                            │
│ Annual Issuance: ~131.4M TMR                              │
│ Inflation Rate: 1.31%                                     │
│                                                            │
│ Cumulative: 3.63B TMR (36.3% of total)                    │
│ Active Validators: 2,000+                                  │
└────────────────────────────────────────────────────────────┘
                            ↓
              HALVING #3 (Block 756,864,000)
                   (Year 14.4)
                            ↓
YEAR 14.4+: Era of Stability
┌────────────────────────────────────────────────────────────┐
│ Block Reward: 12.5 TMR per block (minimum)               │
│ Annual Issuance: ~65.7M TMR (capped)                      │
│ Inflation Rate: 0.66% (stable)                            │
│                                                            │
│ Perpetual minimum inflation to:                           │
│ • Incentivize mining (security)                           │
│ • Reward validators (finality)                            │
│ • Fund treasury (development)                             │
│                                                            │
│ Total Supply: 9.99B+ TMR (approaches 10B asymptotically) │
└────────────────────────────────────────────────────────────┘
```

---

## 🎯 Key Metrics Dashboard

```
                    TMR CHAIN NETWORK DASHBOARD

┌─────────────────────────────────────────────────────────────┐
│ BLOCKCHAIN STATUS                                           │
├─────────────────────────────────────────────────────────────┤
│ Current Block Height:           12,456,789                 │
│ Latest Block Time:              2026-07-15 14:23:45        │
│ Average Block Time:             5.02 seconds               │
│ Total Transactions:             251,234,567                │
│ Transactions per Second (TPS):  63.4 tps                   │
│ Network Difficulty (PoW):       1,234,567                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ TOKENOMICS                                                  │
├─────────────────────────────────────────────────────────────┤
│ Total Circulating Supply:       3,450,000,000 TMR          │
│ Total Max Supply:               10,000,000,000 TMR         │
│ Issuance Rate (Annual):         525,600,000 TMR            │
│ Inflation Rate:                 5.26%                       │
│ Price per TMR:                  $0.045                      │
│ Total Market Cap:               $155.25 Million             │
│ Total Value Locked (Staking):   $1.45 Billion              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ CONSENSUS METRICS                                           │
├─────────────────────────────────────────────────────────────┤
│ Active Validators:              2,145                       │
│ Total Staked TMR:               68,640,000 TMR              │
│ Average Stake per Validator:    32,000 TMR                 │
│ Validator APY:                  10.5%                       │
│ Block Finality Rate:            99.98%                      │
│ Average Finalization Time:      4.8 seconds                │
│ Network Hash Rate:              125 Exahash/sec            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ NETWORK PERFORMANCE                                         │
├─────────────────────────────────────────────────────────────┤
│ Connected Peers:                3,456                       │
│ Total Network Nodes:            8,234                       │
│ Average Network Latency:        123ms                       │
│ Bandwidth Usage (AVG):          4.5 Mbps                    │
│ Blockchain Size:                2.3 TB                      │
│ State Size (Accounts):          145 GB                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ SECURITY STATUS                                             │
├─────────────────────────────────────────────────────────────┤
│ 51% Attack Cost (PoW + PoS):    ~$102 Billion              │
│ Validator Slashing Penalties:   6 validators (0.28%)       │
│ Network Uptime (30 days):       99.99%                      │
│ Last Security Audit:            2026-06-15 (PASSED)        │
│ Bug Bounties Paid:              $2.3 Million               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧭 Block Structure Diagram

```
BLOCK HEADER (256 bytes)
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  version (4 bytes)      │ 00000001                         │
│  parentHash (32 bytes)  │ 0x7a3f9c8e2d1b4a6f9e8c7b6a5f..│
│  stateRoot (32 bytes)   │ 0xa1b2c3d4e5f6a7b8c9d0e1f2a3.│
│  txRoot (32 bytes)      │ 0x2f8e9d7c6b5a4f3e2d1c0b9a8f.│
│  rcptRoot (32 bytes)    │ 0xc3e1f2a4b6c8d0e2f4a6b8c0d2.│
│  timestamp (8 bytes)    │ 1689433425000                   │
│  blockNum (8 bytes)     │ 12456789                        │
│  difficulty (32 bytes)  │ 0x0000000000000000000012c4..│
│  nonce (8 bytes)        │ 9876543210                      │
│  miner (20 bytes)       │ 0x742d35Cc6634C0532925a3b..│
│  gasLimit (8 bytes)     │ 30000000                        │
│  gasUsed (8 bytes)      │ 15234567                        │
│                                                            │
└────────────────────────────────────────────────────────────┘

BLOCK BODY
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  transactions[]                                            │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ TX #1: Transfer 1 TMR from A to B     [21,000 gas] │ │
│  │ TX #2: Deploy Contract X              [1,234,567]  │ │
│  │ TX #3: Call Contract Y.transfer()     [156,234]    │ │
│  │ TX #4: Stake 32,000 TMR as Validator [234,567]    │ │
│  │ ... (total: 1,234 transactions)                     │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                            │
│  validatorSignatures[]                                    │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ Validator 1: 0x8f9e7d6c5b4a3f2e1d0c9b8a... ✓       │ │
│  │ Validator 2: 0xa1b2c3d4e5f6a7b8c9d0e1f2... ✓       │ │
│  │ ... (103 validators approved this block)            │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                            │
│  finalized: true                                           │
│  finalizers: [Validator1, Validator2, ...]               │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 🔀 Transaction Lifecycle

```
User initiates transaction
         │
         ▼
┌────────────────────────────────┐
│ PHASE 1: CREATION & SIGNING    │
├────────────────────────────────┤
│ • Create TX object             │
│ • Fill fields:                 │
│   - from, to, value, data      │
│   - nonce, gasPrice, gasLimit  │
│ • Sign with private key        │
│ • Generate hash                │
└────────────────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│ PHASE 2: MEMPOOL               │
├────────────────────────────────┤
│ • Broadcast to network         │
│ • Added to TX pool             │
│ • Pending for mining           │
│ • Validated by peers           │
│                                │
│ Status: PENDING (yellow)       │
└────────────────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│ PHASE 3: MINING                │
├────────────────────────────────┤
│ • Miner selects TX             │
│ • Includes in candidate block  │
│ • Mines PoW solution           │
│ • Block time: ~5 seconds       │
│                                │
│ Status: MINING (blue)          │
└────────────────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│ PHASE 4: VALIDATION            │
├────────────────────────────────┤
│ • TX replayed by validators    │
│ • State changes verified       │
│ • Gas calculation checked      │
│ • Balance sufficient?          │
│ • Nonce correct?               │
└────────────────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│ PHASE 5: CONSENSUS             │
├────────────────────────────────┤
│ • Validators vote              │
│ • 80%+ approval needed         │
│ • Signatures collected         │
│                                │
│ Status: CONFIRMING (orange)    │
└────────────────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│ PHASE 6: FINALIZATION          │
├────────────────────────────────┤
│ • Block becomes canonical      │
│ • State changes applied        │
│ • Receipt generated            │
│ • Rewards distributed          │
│                                │
│ Status: CONFIRMED (green)      │
└────────────────────────────────┘
         │
         ▼
   TX FINALIZED ✓
   Irreversible for 21 days
   (validator lock-up period)
```

---

## 📡 Network Topology Examples

### Solo Node (Development)
```
┌─────────────────────┐
│  Your Computer      │
│                     │
│  ┌───────────────┐  │
│  │  TMR Node     │  │
│  │ • Miner: Yes  │  │
│  │ • Validator:  │  │
│  │   Yes (auto)  │  │
│  │ • Peers: 0    │  │
│  └───────────────┘  │
│  Ports:             │
│  8545 (JSON-RPC)   │
│  3000 (REST)        │
│  30303 (P2P)        │
└─────────────────────┘

Perfect for: Testing, learning, development
```

### Local Cluster (3 Nodes)
```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Node 1     │  │   Node 2     │  │   Node 3     │
│              │  │              │  │              │
│ • Miner      │  │ • Validator  │  │ • Full Node  │
│ • Validator  │  │ • Validator  │  │              │
│              │  │              │  │              │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       └─────────────────┼─────────────────┘
                         │
              Shared Blockchain State
              
Perfect for: Testing consensus, local development
```

### Production Mainnet (10+ Nodes)
```
Internet
   │
   └─── Bootstrap Nodes (DNS Seeds)
         │
         ├─── Node A (Miner/Validator)
         ├─── Node B (Validator)
         ├─── Node C (Archive Node)
         ├─── Node D (Validator)
         ├─── Node E (Full Node)
         ├─── Node F (Validator)
         ├─── Node G (RPC Node)
         ├─── Node H (Validator)
         ├─── Node I (Backup Validator)
         └─── Node J (Full Node)
         
         All connected peer-to-peer
         Consensus: 128 random validators per block
         
Perfect for: Production, high availability, decentralization
```

---

## 🎓 Quick Learning Paths

### Path 1: Blockchain Basics
```
DAY 1: Read Whitepaper Sections 1-2
       └─ Understand hybrid consensus

DAY 2: Review Data Structures
       └─ Block, TX, Account

DAY 3: Study Consensus Flow
       └─ PoW + PoS coordination

DAY 4: Implementation Overview
       └─ Code walkthrough
```

### Path 2: Developer Integration
```
DAY 1: Install node & dependencies
       └─ npm install & npm start

DAY 2: Test APIs
       └─ JSON-RPC, REST, WebSocket

DAY 3: Send transactions
       └─ Signing, broadcasting

DAY 4: Deploy contracts
       └─ Bytecode, storage
```

### Path 3: Validator Operation
```
WEEK 1: Hardware setup
        └─ Server, networking

WEEK 2: Node synchronization
        └─ Blockchain sync, state

WEEK 3: Validator registration
        └─ Stake 32K TMR

WEEK 4: Monitoring & alerts
        └─ Uptime, rewards
```

---

**Document Version:** 1.0  
**Last Updated:** July 2026  
**Format:** Visual Reference Guide
