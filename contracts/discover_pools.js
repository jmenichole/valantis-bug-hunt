#!/usr/bin/env node

/**
 * Discover deployed Sovereign Pools from factory events
 * Saves pool addresses and metadata for Pattern 2 analysis
 */

const { Web3 } = require('web3');
const fs = require('fs');
const path = require('path');

// Load config
const config = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'config.json'), 'utf8')
);

// RPC from env or config
const RPC_URL = process.env.MAINNET_RPC || config.networks.mainnet;
const web3 = new Web3(RPC_URL);

// Factory addresses
const PROTOCOL_FACTORY = '0x29939b3b2aD83882174a50DFD80a3B6329C4a603';
const POOL_FACTORY = '0xa68d6c59Cf3048292dc4EC1F76ED9DEf8b6F9617';

// Event signatures from Valantis source
// event SovereignPoolDeployed(address indexed token0, address indexed token1, address pool)
const POOL_DEPLOYED_TOPIC = web3.utils.sha3('SovereignPoolDeployed(address,address,address)');

async function discoverPools() {
  try {
    console.log('╔════════════════════════════════════════════════════╗');
    console.log('║  Sovereign Pool Discovery                          ║');
    console.log('║  Valantis STEX Bug Hunt - Pattern 2               ║');
    console.log('╚════════════════════════════════════════════════════╝\n');

    console.log(`[*] Protocol Factory: ${PROTOCOL_FACTORY}`);
    console.log(`[*] Using RPC: ${RPC_URL.substring(0, 50)}...`);

    // Get current block
    const currentBlock = await web3.eth.getBlockNumber();
    console.log(`[*] Current block: ${currentBlock}\n`);

    // Query in smaller chunks (5 block range limit on free plan)
    const CHUNK_SIZE = 4;
    const TOTAL_BLOCKS = 5000; // Scan last ~1 day
    const fromBlockStart = Number(currentBlock) > TOTAL_BLOCKS ? Number(currentBlock) - TOTAL_BLOCKS : 0;
    
    console.log(`[*] Scanning for SovereignPoolDeployed events...`);
    console.log(`    From block: ${fromBlockStart}`);
    console.log(`    To block: ${currentBlock}`);
    console.log(`    Chunk size: ${CHUNK_SIZE} blocks (free tier limit)\n`);

    const allLogs = [];
    
    for (let from = fromBlockStart; from <= Number(currentBlock); from += CHUNK_SIZE + 1) {
      const to = Math.min(from + CHUNK_SIZE, Number(currentBlock));
    
    process.stdout.write(`\r[*] Scanning blocks ${from}-${to}...`);

    try {
      const logs = await web3.eth.getPastLogs({
        fromBlock: web3.utils.toHex(from),
        toBlock: web3.utils.toHex(to),
        address: PROTOCOL_FACTORY,
        topics: [POOL_DEPLOYED_TOPIC]
      });

      if (logs.length > 0) {
        console.log(`\n    Found ${logs.length} event(s) in blocks ${from}-${to}`);
        allLogs.push(...logs);
      }

      // Rate limiting delay
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`\n    Error scanning ${from}-${to}: ${error.message}`);
    }
  }

  console.log(`\n\n[*] Found ${allLogs.length} pool deployment(s)\n`);

  const pools = [];

  for (const log of allLogs) {
      // Decode event data
      // topics[1] = token0 (indexed)
      // topics[2] = token1 (indexed)
      // data = pool address (not indexed)
      
      const token0 = '0x' + log.topics[1].slice(26);
      const token1 = '0x' + log.topics[2].slice(26);
      const poolAddress = '0x' + log.data.slice(26);
      
      console.log(`  📊 Pool ${pools.length + 1}:`);
      console.log(`     Address: ${poolAddress}`);
      console.log(`     Token0: ${token0}`);
      console.log(`     Token1: ${token1}`);
      console.log(`     Block: ${log.blockNumber}`);

      // Get pool code to verify deployment
      const code = await web3.eth.getCode(poolAddress);
      const isDeployed = code.length > 2;
      console.log(`     Deployed: ${isDeployed ? '✅' : '❌'}`);

      if (isDeployed) {
        pools.push({
          address: poolAddress,
          token0: token0,
          token1: token1,
          deploymentBlock: log.blockNumber,
          transactionHash: log.transactionHash
        });

        // Try to get token symbols
        try {
          const token0Symbol = await getTokenSymbol(token0);
          const token1Symbol = await getTokenSymbol(token1);
          console.log(`     Pair: ${token0Symbol}/${token1Symbol}`);
        } catch (e) {
          console.log(`     Pair: Unknown/Unknown`);
        }
      }
      
      console.log('');
    }

    // Save discovered pools
    const outputPath = path.join(__dirname, 'discovered_pools.json');
    fs.writeFileSync(
      outputPath,
      JSON.stringify({
        discoveredAt: new Date().toISOString(),
        scanRange: { from: fromBlockStart, to: Number(currentBlock) },
        poolCount: pools.length,
        pools: pools
      }, null, 2)
    );

    console.log(`\n✅ Saved ${pools.length} pool(s) to: discovered_pools.json`);
    
    if (pools.length > 0) {
      console.log(`\n🔍 Next steps:`);
      console.log(`   1. Review pools in discovered_pools.json`);
      console.log(`   2. Update FlashLoanReentrancy.t.sol with pool addresses`);
      console.log(`   3. Run: forge test --match-contract FlashLoanReentrancy --fork-url "$MAINNET_RPC" -vvv`);
    } else {
      console.log(`\n⚠️  No pools found in recent blocks`);
      console.log(`   Try expanding search range or checking factory address`);
    }

    return pools;

  } catch (error) {
    console.error(`\n❌ Error in discovery: ${error.message}`);
    throw error;
  }
}

async function getTokenSymbol(tokenAddress) {
  try {
    const symbolData = web3.eth.abi.encodeFunctionCall(
      { name: 'symbol', type: 'function', inputs: [] },
      []
    );
    
    const result = await web3.eth.call({
      to: tokenAddress,
      data: symbolData
    });
    
    const symbol = web3.eth.abi.decodeParameter('string', result);
    return symbol;
  } catch {
    return 'UNKNOWN';
  }
}

// Main execution
if (require.main === module) {
  discoverPools()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { discoverPools };
