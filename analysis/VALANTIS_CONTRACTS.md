# Valantis STEX - Official Contract Addresses

**Network**: Ethereum Mainnet  
**Date Identified**: December 11, 2025  
**Status**: ✅ CONFIRMED TARGETS

---

## Core Contracts

### 1. stHYPE (Staked HYPE Token)
- **Address**: `0xfFaa4a3D97fE9107Cef8a3F48c069F577Ff76cC1`
- **Type**: Proxy Contract
- **Function**: Liquid Staking Token for HYPE
- **Priority**: 🔴 CRITICAL - Core asset

### 2. OverseerV1
- **Address**: `0xB96f07367e69e86d6e9C3F49215885104813eeAE`
- **Type**: Implementation Contract
- **Function**: Protocol oversight and management
- **Priority**: 🔴 CRITICAL - Access control

### 3. wstHYPE Proxy
- **Address**: `0x94e8396e0869c9F2200760aF0621aFd240E1CF38`
- **Type**: Proxy Contract
- **Function**: Wrapped stHYPE (similar to wstETH pattern)
- **Priority**: 🟠 HIGH - Derivative asset

---

## Investigation Priority

### Phase 1: Proxy Contracts (Pattern 1 Focus)
1. ✅ stHYPE Proxy - `0xfFaa4a3D97fE9107Cef8a3F48c069F577Ff76cC1`
2. ✅ wstHYPE Proxy - `0x94e8396e0869c9F2200760aF0621aFd240E1CF38`

**Why these first?**
- Proxy contracts are prime candidates for Pattern 1 (Proxy Initialization Bypass)
- Both are asset-holding contracts (high value target)
- Recent deployments may have vulnerabilities

### Phase 2: Overseer Contract
3. ✅ OverseerV1 - `0xB96f07367e69e86d6e9C3F49215885104813eeAE`

**Analysis focus:**
- Access control mechanisms (Pattern 6)
- Governance functions (Pattern 5)
- Admin privileges

---

## Quick Links

### Etherscan URLs
- [stHYPE](https://etherscan.io/address/0xfFaa4a3D97fE9107Cef8a3F48c069F577Ff76cC1)
- [OverseerV1](https://etherscan.io/address/0xB96f07367e69e86d6e9C3F49215885104813eeAE)
- [wstHYPE](https://etherscan.io/address/0x94e8396e0869c9F2200760aF0621aFd240E1CF38)

---

## Pattern 1: Investigation Checklist

For each proxy contract, verify:

- [ ] Has `initialize()` function?
- [ ] Has `initializer` modifier or equivalent protection?
- [ ] Who can call initialization?
- [ ] Can it be re-initialized?
- [ ] What critical state does it set?
- [ ] Implementation contract address
- [ ] Upgrade mechanism security

---

## Next Actions

1. **Fetch source code** for all three contracts
2. **Analyze stHYPE proxy** first (highest priority)
3. **Check initialization functions** for Pattern 1 vulnerability
4. **Document findings** in detail
5. **Create POC** if vulnerability found

---

**STATUS**: Ready to begin real vulnerability analysis on confirmed Valantis STEX contracts.
