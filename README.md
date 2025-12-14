# Valantis STEX Bug Bounty Analysis

**Researcher**: jmenichole  
**Portfolio**: https://jmenichole.github.io/Portfolio/  
**Program**: Valantis STEX ($200K Max Payout)  
**Status**: Active Investigation

## Overview

This repository contains a comprehensive security analysis framework for the Valantis STEX (Stake Exchange) protocol - a modular DEX designed for yield-bearing assets. The analysis applies 8 legendary vulnerability patterns to systematically discover and evaluate security issues.

## General Information

Valantis Stake Exchange (STEX) is a modular DEX purpose‑built for trading yield‑bearing assets (e.g., LSTs and yield‑bearing stablecoins) against their underlying tokens.

- Reference Exchange Rate: STEX uses a reference exchange rate contract as the ask price of the yield‑bearing asset, ensuring sales do not occur below fair value.
- Native Integrations: STEX integrates with the asset’s withdrawal queue/rebalancing mechanism and third‑party lending protocols to maintain liquidity and alignment with underlying yields.
- Architecture: STEX is built on the Valantis Sovereign Pool contract, a modular framework for constructing DEXes.
	- See `analysis/VALANTIS_CONTRACTS.md` for Sovereign Pool links (docs, source paths, and key entry points).

Attributes
- Assets type: Smart Contracts
- Chains: Other
- Programming language: Solidity
- Product types: DeFi
- Project categories: DEX

## Methodology

### Legendary Vulnerability Patterns

1. **Proxy Initialization Bypass** - Exploitation of uninitialized proxy contracts
2. **Flash Loan Reentrancy** - Reentrancy attacks via flash loan mechanisms
3. **Oracle Staleness Exploitation** - Price manipulation through stale oracle data
4. **Flash Swap Slippage Bypass** - Circumventing slippage protections in swaps
5. **Governance Manipulation** - Protocol parameter manipulation via governance attacks
6. **Access Control Bypass** - Unauthorized access through permission vulnerabilities
7. **Signature Validation Flaws** - Exploitation of weak signature schemes
8. **Storage Collision Vulnerabilities** - Layout conflicts in modular framework storage

### Analysis Framework

- **Automated Scanning**: Daily vulnerability pattern detection
- **Deep Dive Analysis**: Manual investigation of promising leads
- **Proof of Concept Development**: Production-ready exploit code
- **Impact Quantification**: Financial and operational impact analysis
- **Professional Reporting**: Bug bounty submission documentation

## Project Structure

```
valantis-stex-hunt/
├── contracts/          # Target contract analysis and interfaces
├── analysis/           # Python and JavaScript analysis tools
├── exploits/           # Proof of concept exploit contracts
├── reports/            # Final bug bounty reports
├── tools/              # Custom testing utilities
├── README.md           # This file
├── .env                # Configuration and RPC endpoints
└── config.json         # Analysis settings
```

## Tools Used

### JavaScript/Node.js
- **web3.js** - Smart contract interaction (read-only)
- **axios** - HTTP requests for data gathering
- **dotenv** - Environment configuration

### Python
- **web3.py** - Web3 integration (read-only)
- **pandas** - Data analysis
- **matplotlib** - Impact visualization

### Solidity/Foundry
- **Foundry** - Smart contract testing framework
- **Fork Mode** - Safe local mainnet simulation
- **Solidity** - Exploit contract development

## Safety & Testing Philosophy

- **Analysis Phase**: Read-only queries to mainnet (bytecode, events, state)
- **Testing Phase**: Foundry fork mode creates isolated local copy
- **Never**: Send transactions to live mainnet
- **Always**: Use `--fork-url` for exploit testing

## Getting Started

### Prerequisites
- Node.js v18+
- Python 3.9+
- Foundry (for contract testing)
- RPC endpoint access (Ethereum mainnet)

### Installation

```bash
# Clone or setup repository
cd ~/valantis-stex-hunt

# Install dependencies
npm install
pip install -r requirements.txt

# Setup Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup
forge init

# Configure environment
cp .env.example .env
# Edit .env with your RPC endpoints
```

### Daily Execution

```bash
# Analysis (read-only, safe)
node analysis/daily_scan.js
python3 analysis/stex_analyzer.py

# Review results and investigate promising leads
```

### Testing & PoC Development

**⚠️ SAFETY: Never send transactions to live mainnet**

```bash
# Use Foundry fork mode for safe testing
export MAINNET_RPC='<your-mainnet-rpc>'
forge test --fork-url "$MAINNET_RPC" -vvv

# Fork creates local simulation - no real transactions
# All exploits run in isolated environment
```

## Key Findings

### Phase 1: Setup & Reconnaissance (Day 1)
- ✅ Workspace initialization
- ✅ Contract discovery framework setup
- ✅ STEX analyzer development
- ✅ Custom tooling creation

### Phase 2: Vulnerability Discovery (Days 2-7)
- Automated daily scanning
- Manual deep dive analysis
- Pattern-based vulnerability testing

### Phase 3: Exploitation & Reporting (Days 8-14)
- Proof of concept development
- Impact analysis and quantification
- Professional report generation

## Timeline

- **Day 1**: Setup & reconnaissance (✅ Complete)
- **Days 2-7**: Vulnerability discovery (In Progress)
- **Days 8-14**: Exploitation & reporting (Scheduled)

## Impact Assessment

All vulnerabilities will be analyzed for:
- Financial impact in USD
- Affected user count estimation
- Protocol disruption severity
- Risk scoring (Critical/High/Medium/Low)

## Bug Bounty Submission

This framework is designed for professional bug bounty submission with:
- Detailed proof of concept code
- Step-by-step exploitation guides
- Financial impact calculations
- Professional remediation recommendations
- Full timeline documentation

## Scope

Please review program scope before investing effort. The following categories are explicitly out of scope for rewards:
- Price manipulation that does not increase swap output beyond quotes from `convertToToken0`/`convertToToken1` in `stHYPEWithdrawalModule` and `kHYPEWithdrawalModule`.
- Exploits already performed by the reporter causing damage.
- Findings requiring leaked keys/credentials or privileged roles (multi‑sig, governance, strategist, keeper).
- Incorrect third‑party oracle data.
- Basic economic governance attacks (e.g., 51% attacks).
- Insolvency due to external lending integrations.
- Lack of liquidity, best‑practice critiques, Sybil attacks.
- L1 gas pricing problems.
- Freezing of own funds due to user error.
- Impacts from malicious upgrades to third‑party contracts.
- Temporary impacts from configuration adjustment race conditions.

See `reports/BUG_BOUNTY_SUBMISSION.md` for details.

## Contact & Disclosure

Security findings are handled through responsible disclosure. Reports will be submitted through the official Valantis bug bounty program.

---

**Last Updated**: December 11, 2025  
**Framework Version**: 1.0.0
