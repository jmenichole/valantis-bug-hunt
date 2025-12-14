# Valantis Bug Hunt - PoC Testing Guide

## Quick Start

All exploit PoCs use Foundry's fork mode for **safe, local testing** against mainnet state.

### Run All Tests
```bash
cd tools
export MAINNET_RPC='https://divine-maximum-replica.quiknode.pro/9c451c095c15764e0db8c6443bafbcbd881c1fe7'
forge test --fork-url "$MAINNET_RPC" -vvv
```

### Run Specific Pattern
```bash
# Pattern 1: Proxy Init Bypass
forge test --match-contract ProxyInitBypass --fork-url "$MAINNET_RPC" -vvv

# Pattern 2: Flash Loan Reentrancy (coming soon)
# forge test --match-contract FlashLoanReentrancy --fork-url "$MAINNET_RPC" -vvv
```

## Available PoCs

### ✅ Pattern 1: Proxy Initialization Bypass
**File**: `test/ProxyInitBypass.t.sol`  
**Targets**: Protocol Factory, Sovereign Pool Factory  
**Tests**:
- Check for initialize functions
- Attempt unauthorized initialization
- Check implementation slots (EIP-1967)
- Attempt reinitialization
- Verify ownership controls

**Run**:
```bash
forge test --match-contract ProxyInitBypass --fork-url "$MAINNET_RPC" -vvv
```

### 🔜 Coming Soon
- Pattern 2: Flash Loan Reentrancy
- Pattern 3: Oracle Staleness
- Pattern 6: Access Control Bypass

## Safety Notes

- ✅ **Fork mode is 100% safe** - creates local simulation
- ✅ **No real transactions** - nothing touches mainnet
- ✅ **No gas costs** - simulation is free
- ❌ **Never remove `--fork-url`** - always test on fork
- ❌ **Never use private keys** - not needed for fork testing

## Debugging

### Verbose Output
```bash
# -vvv = very verbose (traces)
forge test --match-contract ProxyInitBypass --fork-url "$MAINNET_RPC" -vvv
```

### Gas Reports
```bash
forge test --match-contract ProxyInitBypass --fork-url "$MAINNET_RPC" --gas-report
```

### Specific Test
```bash
forge test --match-test test_CheckInitializeFunctions --fork-url "$MAINNET_RPC" -vvv
```

## Writing New PoCs

1. **Copy template** from `test/ProxyInitBypass.t.sol`
2. **Update targets** with contract addresses
3. **Write tests** following the pattern:
   - `setUp()` - initialize test environment
   - `test_*()` - individual test cases
   - Use `vm.prank()` for impersonation
   - Use `console.log()` for debugging
4. **Run** with `--fork-url` flag

## Common Foundry Cheatcodes

```solidity
// Create test account with ETH
address attacker = makeAddr("attacker");
vm.deal(attacker, 100 ether);

// Impersonate an address
vm.startPrank(attacker);
// ... your code ...
vm.stopPrank();

// Read storage slot
bytes32 value = vm.load(target, slot);

// Expect revert
vm.expectRevert();
target.vulnerableFunction();

// Console logging
console.log("Value:", value);
console.log("Address:", address(this));
```

## Next Steps After PoC

1. ✅ Confirm vulnerability is real (not false positive)
2. 📊 Calculate impact (funds at risk, affected users)
3. 📝 Document in `reports/` with:
   - Root cause analysis
   - Reproduction steps
   - Recommended fix
   - Severity justification
4. 🚀 Submit via official Valantis bug bounty program
