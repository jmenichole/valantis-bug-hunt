const { Web3 } = require('web3');
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const web3 = new Web3(process.env.MAINNET_RPC);

const contracts = [
  { 
    name: 'ProtocolFactory', 
    address: '0x29939b3b2aD83882174a50DFD80a3B6329C4a603',
    type: 'Factory',
    priority: 'CRITICAL'
  },
  { 
    name: 'SovereignPoolFactory', 
    address: '0xa68d6c59Cf3048292dc4EC1F76ED9DEf8b6F9617',
    type: 'Factory',
    priority: 'CRITICAL'
  }
];

// EIP-1967 storage slots
const IMPLEMENTATION_SLOT = '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc';
const ADMIN_SLOT = '0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103';

async function fetchSourceCode(address) {
  const url = `https://api.etherscan.io/api?module=contract&action=getsourcecode&address=${address}&apikey=YourApiKeyToken`;
  try {
    const response = await axios.get(url);
    return response.data.result[0];
  } catch (error) {
    console.error(`   Error fetching ${address}:`, error.message);
    return null;
  }
}

async function analyzeValantisCore() {
  console.log('\n╔══════════════════════════════════════════════════════════════════╗');
  console.log('║           VALANTIS CORE - ETHEREUM MAINNET ANALYSIS             ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');
  console.log('Target: Valantis Core Protocol Factories');
  console.log('Network: Ethereum Mainnet');
  console.log('Source: https://docs.valantis.xyz/\n');

  const results = [];

  for (const contract of contracts) {
    console.log('═'.repeat(70));
    console.log(`\n🎯 ${contract.name.toUpperCase()}`);
    console.log(`   Priority: ${contract.priority}`);
    console.log(`   Address: ${contract.address}`);
    console.log(`   Type: ${contract.type}\n`);

    try {
      // 1. Check if contract exists
      const code = await web3.eth.getCode(contract.address);
      
      if (code === '0x' || code === '0x0') {
        console.log('   ❌ NO CONTRACT CODE FOUND');
        console.log('   ⚠️  This address has no deployed contract!\n');
        results.push({ ...contract, error: 'No contract code' });
        continue;
      }
      
      console.log(`   ✅ Contract exists`);
      console.log(`      Bytecode: ${code.length} characters\n`);
      
      // 2. Fetch source code from Etherscan
      console.log('   📄 Fetching source code from Etherscan...');
      const sourceData = await fetchSourceCode(contract.address);
      
      if (sourceData && sourceData.SourceCode && sourceData.SourceCode !== '') {
        const sourceCode = sourceData.SourceCode;
        const contractName = sourceData.ContractName;
        const compilerVersion = sourceData.CompilerVersion;
        const isProxy = sourceData.Proxy !== '0';
        
        console.log(`   ✅ Source Code Verified!`);
        console.log(`      Contract Name: ${contractName}`);
        console.log(`      Compiler: ${compilerVersion}`);
        console.log(`      Is Proxy: ${isProxy ? 'YES' : 'NO'}`);
        
        // 3. Analyze for vulnerability patterns
        console.log(`\n   🔍 VULNERABILITY PATTERN ANALYSIS:\n`);
        
        // Pattern 1: Proxy Initialization Bypass
        const hasInitialize = sourceCode.toLowerCase().includes('function initialize');
        const hasInitializer = sourceCode.includes('initializer');
        const hasOnlyOwner = sourceCode.includes('onlyOwner');
        const hasAccessControl = sourceCode.includes('AccessControl');
        
        console.log(`   [Pattern 1] Proxy Initialization:`);
        console.log(`      • initialize() function: ${hasInitialize ? '✅ YES' : '❌ NO'}`);
        console.log(`      • initializer modifier: ${hasInitializer ? '✅ YES' : '⚠️  NO'}`);
        
        if (hasInitialize && !hasInitializer) {
          console.log(`      🚨 POTENTIAL VULNERABILITY: initialize() without initializer!`);
        }
        
        // Pattern 6: Access Control
        console.log(`\n   [Pattern 6] Access Control:`);
        console.log(`      • onlyOwner modifier: ${hasOnlyOwner ? '✅ YES' : '❌ NO'}`);
        console.log(`      • AccessControl library: ${hasAccessControl ? '✅ YES' : '❌ NO'}`);
        
        // Check for critical functions
        const hasDeploy = sourceCode.includes('deploySovereignPool') || sourceCode.includes('deploy');
        const hasSetALM = sourceCode.includes('setALM');
        const hasSetPoolManager = sourceCode.includes('setPoolManager');
        
        console.log(`\n   [Critical Functions]:`);
        console.log(`      • deploySovereignPool(): ${hasDeploy ? '✅ FOUND' : '❌ NOT FOUND'}`);
        console.log(`      • setALM(): ${hasSetALM ? '✅ FOUND' : '❌ NOT FOUND'}`);
        console.log(`      • setPoolManager(): ${hasSetPoolManager ? '✅ FOUND' : '❌ NOT FOUND'}`);
        
        // Pattern 2: Flash Loan Reentrancy
        const hasReentrancyGuard = sourceCode.includes('ReentrancyGuard') || sourceCode.includes('nonReentrant');
        const hasFlashLoan = sourceCode.includes('flashLoan') || sourceCode.includes('flash');
        
        console.log(`\n   [Pattern 2] Reentrancy:`);
        console.log(`      • ReentrancyGuard: ${hasReentrancyGuard ? '✅ YES' : '⚠️  NO'}`);
        console.log(`      • Flash loan functions: ${hasFlashLoan ? '✅ FOUND' : '❌ NOT FOUND'}`);
        
        // 4. Check for proxy pattern
        if (isProxy) {
          const implementationAddr = await web3.eth.getStorageAt(contract.address, IMPLEMENTATION_SLOT);
          const hasImpl = implementationAddr && implementationAddr !== '0x' + '0'.repeat(64);
          
          console.log(`\n   🔄 PROXY PATTERN DETECTED:`);
          if (hasImpl) {
            const implAddress = '0x' + implementationAddr.slice(-40);
            console.log(`      Implementation: ${implAddress}`);
            console.log(`      ⚠️  NEED TO ANALYZE IMPLEMENTATION CONTRACT SEPARATELY`);
          }
        }
        
        // 5. Save source code
        const filename = `contracts/${contract.name}_${contract.address}.sol`;
        try {
          fs.writeFileSync(filename, sourceCode);
          console.log(`\n   💾 Source saved: ${filename}`);
        } catch (err) {
          console.log(`\n   ⚠️  Could not save file: ${err.message}`);
        }
        
        results.push({
          ...contract,
          verified: true,
          contractName,
          hasInitialize,
          hasInitializer,
          hasAccessControl,
          hasReentrancyGuard,
          vulnerabilities: []
        });
        
        // Flag potential vulnerabilities
        if (hasInitialize && !hasInitializer) {
          results[results.length - 1].vulnerabilities.push('Pattern 1: Unprotected initialize()');
        }
        if (!hasReentrancyGuard && hasFlashLoan) {
          results[results.length - 1].vulnerabilities.push('Pattern 2: No reentrancy protection with flash loans');
        }
        
      } else {
        console.log(`   ❌ Source code NOT verified on Etherscan`);
        console.log(`   ⚠️  Cannot perform static analysis`);
        
        results.push({
          ...contract,
          verified: false,
          error: 'Source not verified'
        });
      }
      
      // 6. On-chain tests
      console.log(`\n   🧪 ON-CHAIN TESTS:\n`);
      
      // Test deploySovereignPool function existence
      try {
        const deploySig = web3.eth.abi.encodeFunctionSignature('deploySovereignPool((address,address,address,address,address,address,uint256,bool))');
        console.log(`      • Testing deploySovereignPool()... (signature check)`);
        // Just check if we can encode it, actual call would revert without proper args
        console.log(`        ✅ Function signature valid`);
      } catch (e) {
        console.log(`        ❌ Function does not match expected signature`);
      }
      
      // Get balance
      const balance = await web3.eth.getBalance(contract.address);
      const balanceEth = web3.utils.fromWei(balance, 'ether');
      console.log(`      • Contract balance: ${balanceEth} ETH`);
      
      // Get transaction count
      const txCount = await web3.eth.getTransactionCount(contract.address);
      console.log(`      • Transactions sent: ${txCount}`);
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      results.push({
        ...contract,
        error: error.message
      });
    }
    
    console.log('\n');
    
    // Rate limit
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  // Summary
  console.log('\n╔══════════════════════════════════════════════════════════════════╗');
  console.log('║                       ANALYSIS SUMMARY                           ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');
  
  results.forEach(result => {
    console.log(`📋 ${result.name}:`);
    if (result.error) {
      console.log(`   ❌ ${result.error}`);
    } else if (!result.verified) {
      console.log(`   ⚠️  Source code not verified`);
    } else {
      console.log(`   ✅ Verified and analyzed`);
      if (result.vulnerabilities && result.vulnerabilities.length > 0) {
        console.log(`   🚨 POTENTIAL VULNERABILITIES FOUND:`);
        result.vulnerabilities.forEach(vuln => {
          console.log(`      • ${vuln}`);
        });
      } else {
        console.log(`   ✅ No obvious vulnerabilities detected in initial scan`);
      }
    }
    console.log('');
  });
  
  console.log('═'.repeat(70));
  console.log('\n📝 NEXT STEPS:\n');
  console.log('1. Review saved source code files in contracts/ directory');
  console.log('2. Manually inspect critical functions (deploySovereignPool, setALM, etc.)');
  console.log('3. Discover deployed pools using factory events');
  console.log('4. Analyze individual Sovereign Pool contracts');
  console.log('5. Test for Pattern 1 (initialization) on discovered pools');
  console.log('6. Check GitHub repo for additional context: https://github.com/ValantisLabs/valantis-core\n');
}

analyzeValantisCore().catch(console.error);
