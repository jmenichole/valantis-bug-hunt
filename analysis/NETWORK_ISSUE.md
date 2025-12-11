# Investigation Update - Network Detection

**Date**: December 11, 2025  
**Status**: 🔴 NETWORK MISMATCH DETECTED

---

## Critical Finding

The provided contract addresses **DO NOT EXIST on Ethereum Mainnet**.

### Tested Addresses
- `0xfFaa4a3D97fE9107Cef8a3F48c069F577Ff76cC1` (stHYPE) - ❌ No code
- `0xB96f07367e69e86d6e9C3F49215885104813eeAE` (OverseerV1) - ❌ Invalid
- `0x94e8396e0869c9F2200760aF0621aFd240E1CF38` (wstHYPE) - ❌ No code

---

## Evidence from Documentation

From Valantis docs (https://docs.valantis.xyz/):

> "stHYPE was the first-ever LST on **Hyperliquid**"

### Key Insight: Valantis STEX is likely deployed on **HYPERLIQUID**, not Ethereum!

---

## About Hyperliquid

**Hyperliquid** is:
- A new Layer 1 blockchain (NOT Ethereum)
- Focused on DeFi and derivatives
- Has its own native token (HYPE)
- Launched in 2024

**This means:**
1. ❌ Our Ethereum Mainnet RPC won't work
2. ❌ Etherscan won't have the contracts
3. ✅ Need Hyperliquid-specific tools
4. ✅ Need Hyperliquid RPC endpoint

---

## Action Required

### Option 1: Switch to Hyperliquid Network

**Requirements:**
1. Hyperliquid RPC endpoint
2. Hyperliquid explorer (not Etherscan)
3. Update all tools to use Hyperliquid

**Challenges:**
- Less tooling available
- Different API structure
- May not have same bug bounty program

### Option 2: Find Ethereum Valantis Contracts

Valantis may have contracts on BOTH networks:
- Hyperliquid (for stHYPE)
- Ethereum (for other components)

Check docs for Ethereum-specific deployments.

### Option 3: Verify Bug Bounty Scope

**CRITICAL QUESTION:**
- Is the $200K bug bounty for Hyperliquid contracts?
- Or Ethereum contracts?
- Or both?

---

## Next Steps

**You need to clarify:**

1. **Which network** is the bug bounty targeting?
   - Hyperliquid?
   - Ethereum Mainnet?
   - Other L2 (Arbitrum, Base, etc.)?

2. **Where** did you find:
   - The $200K bounty amount?
   - The contract addresses?
   - The bug bounty program details?

3. **Official sources** to verify:
   - Bug bounty program page
   - Official Valantis announcement
   - Immunefi/HackerOne listing?

---

## Current Framework Status

Our framework is configured for **Ethereum Mainnet**:
- ✅ RPC: QuickNode Ethereum
- ✅ Tools: web3.js (Ethereum)
- ✅ Foundry: Ethereum-compatible
- ❌ **NOT configured for Hyperliquid**

**To hunt on Hyperliquid, we need:**
- Hyperliquid RPC endpoint
- Hyperliquid explorer
- Different Web3 setup
- Network-specific tools

---

## Recommendation

**STOP** and verify the correct network before continuing.

Hunting on the wrong network wastes time and won't yield valid bounty submissions.

---

**STATUS**: Waiting for network clarification from user.

**BLOCKED**: Cannot proceed without knowing correct blockchain network.
