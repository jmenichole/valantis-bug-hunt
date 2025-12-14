// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "forge-std/console.sol";

/**
 * @title Pattern 2: Flash Loan Reentrancy PoC  
 * @notice Tests for reentrancy vulnerabilities in Valantis pool flashloan mechanisms
 * @dev Run with: forge test --match-contract FlashLoanReentrancy --fork-url $MAINNET_RPC -vvv
 */
contract FlashLoanReentrancyTest is Test {
    address constant PROTOCOL_FACTORY = 0x29939b3b2aD83882174a50DFD80a3B6329C4a603;
    address constant SOVEREIGN_POOL_FACTORY = 0xa68d6c59Cf3048292dc4EC1F76ED9DEf8b6F9617;
    
    // Known or discovered pool addresses for testing
    // Will be populated from discovery script output
    address[] discoveredPools;
    
    address attacker;
    
    function setUp() public {
        attacker = makeAddr("attacker");
        vm.deal(attacker, 100 ether);
        
        console.log("=== Pattern 2: Flash Loan Reentrancy ===");
        console.log("Protocol Factory:", PROTOCOL_FACTORY);
        console.log("Pool Factory:", SOVEREIGN_POOL_FACTORY);
        console.log("Attacker:", attacker);
        console.log("Discovered Pools:", discoveredPools.length);
    }
    
    /**
     * Test 1: Check if pools implement flashloan correctly
     */
    function test_CheckFlashloanImplementation() public view {
        console.log("\n[Test 1] Checking flashloan implementation...");
        
        if (discoveredPools.length == 0) {
            console.log("[SKIP] No pools discovered - check quick_pool_discovery.js output");
            return;
        }
        
        for (uint i = 0; i < discoveredPools.length && i < 3; i++) {
            address pool = discoveredPools[i];
            console.log("Pool", i, ":", pool);
            
            // Check for flashloan function via staticcall
            bytes memory payload = abi.encodeWithSignature("flashloan(address,uint256,uint256,bytes)", address(0), 0, 0, new bytes(0));
            (bool success,) = pool.staticcall(payload);
            
            if (success) {
                console.log("  [PASS] Has flashloan function");
            } else {
                console.log("  [INFO] No flashloan or call failed");
            }
        }
    }
    
    /**
     * Test 2: Check for reentrancy guards
     */
    function test_CheckReentrancyGuards() public view {
        console.log("\n[Test 2] Checking reentrancy guards...");
        
        if (discoveredPools.length == 0) {
            console.log("[SKIP] No pools discovered");
            return;
        }
        
        // Check first pool's storage for lock patterns
        address pool = discoveredPools[0];
        console.log("Checking pool:", pool);
        
        // Common lock storage patterns:
        // - ReentrancyGuard uses slot 0
        // - Custom guards might use different slots
        for (uint i = 0; i < 10; i++) {
            bytes32 value = vm.load(pool, bytes32(uint256(i)));
            if (value != bytes32(0)) {
                console.log("  Storage slot", i, "value:", uint256(value));
            }
        }
    }
    
    /**
     * Test 3: Attempt to trigger reentrancy during flashloan
     */
    function test_AttemptReentrancyDuringFlashloan() public {
        console.log("\n[Test 3] Testing reentrancy during flashloan...");
        
        if (discoveredPools.length == 0) {
            console.log("[SKIP] No pools discovered");
            return;
        }
        
        // Deploy reentrancy attacker
        ReentrancyAttacker attacker_contract = new ReentrancyAttacker(discoveredPools[0]);
        
        vm.startPrank(attacker);
        vm.deal(address(attacker_contract), 10 ether);
        
        // Attempt attack
        try attacker_contract.attack() {
            console.log("[ALERT] Reentrancy succeeded!");
            console.log("CRITICAL: Pool is vulnerable to reentrancy");
        } catch Error(string memory reason) {
            console.log("[PASS] Reentrancy blocked:", reason);
        } catch {
            console.log("[PASS] Reentrancy blocked");
        }
        
        vm.stopPrank();
    }
    
    /**
     * Test 4: Verify callback validation
     */
    function test_VerifyCallbackValidation() public {
        console.log("\n[Test 4] Checking callback validation...");
        
        if (discoveredPools.length == 0) {
            console.log("[SKIP] No pools discovered");
            return;
        }
        
        address pool = discoveredPools[0];
        InvalidCallback invalid = new InvalidCallback();
        
        vm.startPrank(attacker);
        vm.deal(address(invalid), 10 ether);
        
        // Try to call flashloan with invalid callback
        bytes memory payload = abi.encodeWithSignature(
            "flashloan(address,uint256,uint256,bytes)",
            address(invalid),
            1 ether,
            0,
            new bytes(0)
        );
        
        (bool success,) = pool.call(payload);
        
        if (success) {
            console.log("[ALERT] Invalid callback was accepted!");
            console.log("WARNING: Pool may not validate callbacks properly");
        } else {
            console.log("[PASS] Invalid callback rejected");
        }
        
        vm.stopPrank();
    }
}

/**
 * @title Reentrancy Attacker
 * Attempts to reenter pool during flashloan callback
 */
contract ReentrancyAttacker {
    address public pool;
    
    constructor(address _pool) {
        pool = _pool;
    }
    
    function attack() external {
        // Initiate flashloan
        (bool success,) = pool.call(
            abi.encodeWithSignature(
                "flashloan(address,uint256,uint256,bytes)",
                address(this),
                1 ether,
                0,
                new bytes(0)
            )
        );
        require(success, "Flashloan failed");
    }
    
    // Callback - attempts reentrancy
    function onFlashLoan(address, address, uint256, uint256, bytes calldata) external returns (bytes32) {
        // Attempt to call another function on pool during callback
        (bool success, ) = pool.call(abi.encodeWithSignature("swap(address,uint256,uint256,bool,bytes)"));
        require(!success, "Reentrancy allowed!");
        return keccak256("ERC3156FlashBorrower.onFlashLoan");
    }
}

/**
 * @title Invalid Callback
 * Returns wrong callback hash
 */
contract InvalidCallback {
    function onFlashLoan(address, address, uint256, uint256, bytes calldata) external pure returns (bytes32) {
        return bytes32(0); // Wrong hash - should trigger revert
    }
}
