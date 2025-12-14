#!/usr/bin/env node

/**
 * Fetch verified source code from Etherscan for Valantis contracts
 * Saves to contracts/ directory for detailed analysis
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Etherscan API V2
const ETHERSCAN_API = 'https://api.etherscan.io/v2/api';
// Get free API key at: https://etherscan.io/myapikey
const API_KEY = process.env.ETHERSCAN_API_KEY || '';

// Target contracts
const CONTRACTS = [
  {
    name: 'ProtocolFactory',
    address: '0x29939b3b2aD83882174a50DFD80a3B6329C4a603',
    priority: 'CRITICAL'
  },
  {
    name: 'SovereignPoolFactory',
    address: '0xa68d6c59Cf3048292dc4EC1F76ED9DEf8b6F9617',
    priority: 'CRITICAL'
  }
];

async function fetchSourceCode(address, name) {
  console.log(`\n[*] Fetching ${name} (${address})...`);
  
  try {
    const response = await axios.get(ETHERSCAN_API, {
      params: {
        chainid: 1,
        module: 'contract',
        action: 'getsourcecode',
        address: address,
        apikey: API_KEY
      }
    });

    if (response.data.status !== '1') {
      console.log(`  ❌ Failed: ${response.data.message}`);
      return false;
    }

    const result = response.data.result[0];
    
    if (!result.SourceCode) {
      console.log(`  ⚠️  Not verified on Etherscan`);
      return false;
    }

    // Save contract details
    const contractDir = path.join(__dirname, '..', 'contracts', name);
    if (!fs.existsSync(contractDir)) {
      fs.mkdirSync(contractDir, { recursive: true });
    }

    // Handle multi-file format (JSON or single file)
    let sourceCode = result.SourceCode;
    if (sourceCode.startsWith('{{')) {
      // Multi-file JSON format
      sourceCode = sourceCode.slice(1, -1); // Remove outer braces
      const sources = JSON.parse(sourceCode);
      
      // Save each file
      for (const [filepath, content] of Object.entries(sources.sources || sources)) {
        const filename = filepath.replace(/^contracts\//, '').replace(/\//g, '_');
        const filePath = path.join(contractDir, filename);
        fs.writeFileSync(filePath, content.content || content);
        console.log(`  ✅ Saved: ${filename}`);
      }
    } else {
      // Single file
      const filePath = path.join(contractDir, `${name}.sol`);
      fs.writeFileSync(filePath, sourceCode);
      console.log(`  ✅ Saved: ${name}.sol`);
    }

    // Save metadata
    const metadata = {
      name: result.ContractName,
      compiler: result.CompilerVersion,
      optimization: result.OptimizationUsed === '1',
      runs: result.Runs,
      constructorArguments: result.ConstructorArguments,
      abi: JSON.parse(result.ABI),
      fetchedAt: new Date().toISOString()
    };
    
    fs.writeFileSync(
      path.join(contractDir, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );
    console.log(`  ✅ Saved: metadata.json`);
    console.log(`  📊 Compiler: ${metadata.compiler}`);
    console.log(`  📊 Optimization: ${metadata.optimization} (${metadata.runs} runs)`);

    return true;
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║  Etherscan Source Code Fetcher (API V2)           ║');
  console.log('║  Valantis STEX Bug Hunt                            ║');
  console.log('╚════════════════════════════════════════════════════╝');
  
  if (!API_KEY) {
    console.log('\n⚠️  No ETHERSCAN_API_KEY found in environment');
    console.log('   Get a free key at: https://etherscan.io/myapikey');
    console.log('   Then add to .env: ETHERSCAN_API_KEY=your_key_here\n');
    process.exit(1);
  }

  let successCount = 0;
  
  for (const contract of CONTRACTS) {
    const success = await fetchSourceCode(contract.address, contract.name);
    if (success) successCount++;
    
    // Rate limit: 5 requests per second (Etherscan limit)
    await new Promise(resolve => setTimeout(resolve, 250));
  }

  console.log(`\n✅ Fetched ${successCount}/${CONTRACTS.length} contracts`);
  console.log(`📁 Source code saved to: contracts/`);
  console.log(`\n🔍 Next steps:`);
  console.log(`   1. Review source in contracts/<ContractName>/`);
  console.log(`   2. Search for patterns: grep -r "initialize" contracts/`);
  console.log(`   3. Analyze ABIs in metadata.json files`);
  console.log(`   4. Update PoCs with actual function signatures`);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { fetchSourceCode };
