const { Web3 } = require('web3');
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const contracts = [
  { name: 'stHYPE', address: '0xfFaa4a3D97fE9107Cef8a3F48c069F577Ff76cC1', type: 'Proxy' },
  { name: 'OverseerV1', address: '0xB96f07367e69e86d6e9C3F49215885104813eeAE', type: 'Implementation' },
  { name: 'wstHYPE', address: '0x94e8396e0869c9F2200760aF0621aFd240E1CF38', type: 'Proxy' }
];

async function fetchSourceCode(address) {
  const url = `https://api.etherscan.io/api?module=contract&action=getsourcecode&address=${address}&apikey=YourApiKeyToken`;
  try {
    const response = await axios.get(url);
    return response.data.result[0];
  } catch (error) {
    console.error(`Error fetching ${address}:`, error.message);
    return null;
  }
}

async function analyzeContracts() {
  console.log('\n╔══════════════════════════════════════════════════════════════════╗');
  console.log('║          VALANTIS STEX - CONTRACT SOURCE CODE ANALYSIS          ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');

  const results = [];

  for (const contract of contracts) {
    console.log(`\n📋 Analyzing: ${contract.name} (${contract.type})`);
    console.log(`   Address: ${contract.address}`);
    console.log('   Status: Fetching source code...');
    
    const sourceData = await fetchSourceCode(contract.address);
    
    if (sourceData && sourceData.SourceCode && sourceData.SourceCode !== '') {
      const sourceCode = sourceData.SourceCode;
      const contractName = sourceData.ContractName;
      const compilerVersion = sourceData.CompilerVersion;
      const isProxy = sourceData.Proxy !== '0';
      const implementation = sourceData.Implementation || 'N/A';
      
      console.log(`   ✅ Source Code Found!`);
      console.log(`   Contract Name: ${contractName}`);
      console.log(`   Compiler: ${compilerVersion}`);
      console.log(`   Source Length: ${sourceCode.length} characters`);
      console.log(`   Is Proxy: ${isProxy ? 'YES' : 'NO'}`);
      if (isProxy) {
        console.log(`   Implementation: ${implementation}`);
      }
      
      // Check for initialize function
      const hasInitialize = sourceCode.toLowerCase().includes('function initialize');
      const hasInitializer = sourceCode.includes('initializer');
      const hasUUPS = sourceCode.includes('UUPSUpgradeable');
      const hasTransparent = sourceCode.includes('TransparentUpgradeableProxy');
      const hasOwnableUpgradeable = sourceCode.includes('OwnableUpgradeable');
      
      console.log(`\n   🔍 Pattern 1 Quick Scan:`);
      console.log(`      - Has initialize(): ${hasInitialize ? '✅ YES' : '❌ NO'}`);
      console.log(`      - Has initializer modifier: ${hasInitializer ? '✅ YES' : '⚠️  NO'}`);
      console.log(`      - Uses UUPS: ${hasUUPS ? '✅ YES' : '❌ NO'}`);
      console.log(`      - Uses Transparent Proxy: ${hasTransparent ? '✅ YES' : '❌ NO'}`);
      console.log(`      - Uses OwnableUpgradeable: ${hasOwnableUpgradeable ? '✅ YES' : '❌ NO'}`);
      
      let vulnerabilityStatus = '✅ SAFE';
      if (hasInitialize && !hasInitializer) {
        console.log(`\n   🚨 POTENTIAL VULNERABILITY DETECTED!`);
        console.log(`      Initialize function found WITHOUT initializer modifier!`);
        vulnerabilityStatus = '🚨 VULNERABLE';
      }
      
      // Save source code to file
      const filename = `contracts/${contract.name}_${contract.address}.sol`;
      try {
        fs.writeFileSync(filename, sourceCode);
        console.log(`   💾 Saved to: ${filename}`);
      } catch (err) {
        console.log(`   ⚠️  Could not save file: ${err.message}`);
      }
      
      results.push({
        name: contract.name,
        address: contract.address,
        contractName,
        compilerVersion,
        hasInitialize,
        hasInitializer,
        isProxy,
        implementation,
        vulnerabilityStatus
      });
      
    } else {
      console.log(`   ❌ Source Code NOT verified on Etherscan`);
      console.log(`   ⚠️  This could indicate:`);
      console.log(`      - Unverified contract (suspicious)`);
      console.log(`      - Proxy pointing to unverified implementation`);
      console.log(`      - Need to check implementation contract separately`);
      
      results.push({
        name: contract.name,
        address: contract.address,
        error: 'Source code not verified'
      });
    }
    
    console.log('\n' + '─'.repeat(70));
    
    // Rate limit: wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n\n╔══════════════════════════════════════════════════════════════════╗');
  console.log('║                        ANALYSIS SUMMARY                          ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');
  
  results.forEach(result => {
    if (result.error) {
      console.log(`${result.name}: ❌ ${result.error}`);
    } else {
      console.log(`${result.name}: ${result.vulnerabilityStatus}`);
      if (result.hasInitialize && !result.hasInitializer) {
        console.log(`  ⚠️  NEEDS MANUAL REVIEW - initialize() without initializer modifier`);
      }
    }
  });
  
  console.log('\n✅ Initial scan complete.\n');
  console.log('📝 Next Steps:');
  console.log('   1. Review saved contract files in contracts/ directory');
  console.log('   2. Manually inspect initialize functions');
  console.log('   3. Check implementation contracts if proxy detected');
  console.log('   4. Run pattern1_investigation.js for detailed analysis\n');
}

analyzeContracts().catch(console.error);
