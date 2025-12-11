# Valantis Core - Official Contract Addresses

**Network**: Ethereum Mainnet  
**Date Identified**: December 11, 2025  
**Status**: ✅ CONFIRMED TARGETS - CORRECTED  
**Source**: https://docs.valantis.xyz/ (Valantis Core Deployments)

---

## Core Protocol Contracts

### 1. Protocol Factory
- **Address**: `0x29939b3b2aD83882174a50DFD80a3B6329C4a603`
- **Type**: Factory Contract
- **Function**: Deploys Sovereign Pools
- **Priority**: 🔴 CRITICAL - Creates all pools
- **Interface**: IProtocolFactory
- **GitHub**: ValantisLabs/valantis-core

### 2. Sovereign Pool Factory
- **Address**: `0xa68d6c59Cf3048292dc4EC1F76ED9DEf8b6F9617`
- **Type**: Factory Contract
- **Function**: Creates Sovereign Pool instances
- **Priority**: 🔴 CRITICAL - Pool creation logic
- **Interface**: Custom factory pattern

---

## Investigation Priority

### Phase 1: Factory Contracts (Pattern 1 & 6 Focus)
1. 🎯 Protocol Factory - `0x29939b3b2aD83882174a50DFD80a3B6329C4a603`
2. 🎯 Sovereign Pool Factory - `0xa68d6c59Cf3048292dc4EC1F76ED9DEf8b6F9617`

**Why these first?**
- Factory contracts control pool deployment
- Pattern 1: Check if pools can be initialized by anyone
- Pattern 6: Access control on deploySovereignPool()
- High-value targets (control entire protocol)

### Phase 2: Deployed Sovereign Pools
3. 🎯 Discover existing pools via factory events
4. 🎯 Analyze pool initialization patterns
5. 🎯 Check setALM() and setPoolManager() security

**Analysis focus:**
- Pool initialization vulnerabilities (Pattern 1)
- Access control on setALM, setPoolManager (Pattern 6)
- Flash loan reentrancy in pools (Pattern 2)
- Oracle manipulation if Oracle Module used (Pattern 3)

---

## Quick Links

### Etherscan URLs
- [Protocol Factory](https://etherscan.io/address/0x29939b3b2aD83882174a50DFD80a3B6329C4a603)
- [Sovereign Pool Factory](https://etherscan.io/address/0xa68d6c59Cf3048292dc4EC1F76ED9DEf8b6F9617)

### GitHub Repository
- [Valantis Core](https://github.com/ValantisLabs/valantis-core)
- Interface: `src/protocol-factory/interfaces/IProtocolFactory.sol`
- Structs: `src/pools/structs/SovereignPoolStructs.sol`

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
