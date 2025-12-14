#!/usr/bin/env node

const { Web3 } = require('web3');
const axios = require('axios');
require('dotenv').config();

const MAINNET_RPC = process.env.MAINNET_RPC;
const PROTOCOL_FACTORY = '0x29939b3b2aD83882174a50DFD80a3B6329C4a603';
const POOL_FACTORY = '0xa68d6c59Cf3048292dc4EC1F76ED9DEf8b6F9617';

// Simple ABI with just poolDeployed event
const FACTORY_ABI = [
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "internalType": "address", "name": "pool", "type": "address"},
            {"indexed": true, "internalType": "address", "name": "token0", "type": "address"},
            {"indexed": true, "internalType": "address", "name": "token1", "type": "address"},
            {"indexed": false, "internalType": "uint24", "name": "fee", "type": "uint24"},
            {"indexed": false, "internalType": "int24", "name": "tickSpacing", "type": "int24"}
        ],
        "name": "PoolDeployed",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "internalType": "address", "name": "pool", "type": "address"},
            {"indexed": false, "internalType": "address", "name": "token0", "type": "address"},
            {"indexed": false, "internalType": "address", "name": "token1", "type": "address"},
            {"indexed": false, "internalType": "uint24", "name": "fee", "type": "uint24"},
            {"indexed": false, "internalType": "int24", "name": "tickSpacing", "type": "int24"}
        ],
        "name": "SovereignPoolDeployed",
        "type": "event"
    }
];

async function discoverPools() {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║  Quick Pool Discovery Tool              ║');
    console.log('║  Valantis STEX Bug Hunt - Pattern 2     ║');
    console.log('╚════════════════════════════════════════╝');
    
    if (!MAINNET_RPC) {
        console.error('[!] Error: MAINNET_RPC not configured in .env');
        process.exit(1);
    }

    const web3 = new Web3(MAINNET_RPC);

    console.log(`\n[*] Using RPC: ${MAINNET_RPC.substring(0, 50)}...`);
    console.log(`[*] Sovereign Pool Factory: ${POOL_FACTORY}`);

    try {
        // Get current block number
        const currentBlock = Number(await web3.eth.getBlockNumber());
        console.log(`[*] Current block: ${currentBlock}`);

        // Create contract instance
        const contract = new web3.eth.Contract(FACTORY_ABI, POOL_FACTORY);

        // Get events from last 1000 blocks (with safer chunking)
        const fromBlock = Math.max(0, currentBlock - 1000);
        const toBlock = currentBlock;
        const chunkSize = 100; // Conservative chunk size

        console.log(`\n[*] Scanning for SovereignPoolDeployed events...`);
        console.log(`    From block: ${fromBlock}`);
        console.log(`    To block: ${toBlock}`);
        console.log(`    Chunk size: ${chunkSize} blocks\n`);

        const pools = new Set();
        const tokens = new Map();

        // Process in chunks
        for (let start = fromBlock; start < toBlock; start += chunkSize) {
            const end = Math.min(start + chunkSize, toBlock);
            process.stdout.write(`    Blocks ${start}-${end}... `);

            try {
                const events = await contract.getPastEvents('SovereignPoolDeployed', {
                    fromBlock: start,
                    toBlock: end
                });

                if (events.length > 0) {
                    console.log(`[${events.length} events found]`);
                    events.forEach(evt => {
                        const pool = evt.returnValues.pool || evt.returnValues[0];
                        pools.add(pool);
                        console.log(`      ✓ Pool: ${pool}`);
                        if (evt.returnValues.token0) {
                            tokens.set(pool, {
                                token0: evt.returnValues.token0,
                                token1: evt.returnValues.token1,
                                fee: evt.returnValues.fee
                            });
                        }
                    });
                } else {
                    console.log('[no events]');
                }
            } catch (err) {
                console.log(`[error: ${err.message.substring(0, 50)}]`);
            }
        }

        // Also try PoolDeployed event
        console.log(`\n[*] Scanning for PoolDeployed events...`);
        for (let start = fromBlock; start < toBlock; start += chunkSize) {
            const end = Math.min(start + chunkSize, toBlock);
            process.stdout.write(`    Blocks ${start}-${end}... `);

            try {
                const events = await contract.getPastEvents('PoolDeployed', {
                    fromBlock: start,
                    toBlock: end
                });

                if (events.length > 0) {
                    console.log(`[${events.length} events found]`);
                    events.forEach(evt => {
                        const pool = evt.returnValues.pool || evt.returnValues[0];
                        pools.add(pool);
                        console.log(`      ✓ Pool: ${pool}`);
                    });
                } else {
                    console.log('[no events]');
                }
            } catch (err) {
                console.log(`[error: ${err.message.substring(0, 50)}]`);
            }
        }

        // Report results
        console.log('\n╔════════════════════════════════════════╗');
        console.log('║         Discovery Results               ║');
        console.log('╚════════════════════════════════════════╝');
        
        if (pools.size === 0) {
            console.log('\n[!] No pools found in recent blocks.');
            console.log('[*] Trying to get poolCount from factory...\n');

            // Try direct contract call
            const countFn = 'poolCount';
            try {
                const response = await web3.eth.call({
                    to: POOL_FACTORY,
                    data: web3.eth.abi.encodeFunctionSignature(countFn)
                });
                console.log(`[*] Response: ${response}`);
            } catch (err) {
                console.log(`[!] Error calling poolCount: ${err.message}`);
            }
        } else {
            console.log(`\n[+] Found ${pools.size} pool(s):\n`);
            let i = 1;
            pools.forEach(pool => {
                const tokenInfo = tokens.get(pool);
                console.log(`${i}. ${pool}`);
                if (tokenInfo) {
                    console.log(`   Token0: ${tokenInfo.token0}`);
                    console.log(`   Token1: ${tokenInfo.token1}`);
                    console.log(`   Fee: ${tokenInfo.fee}`);
                }
                i++;
            });

            // Write to file for tests
            const poolsList = Array.from(pools);
            const fs = require('fs');
            fs.writeFileSync(
                '/Users/fullsail/valantis-stex-hunt/contracts/discovered_pools.json',
                JSON.stringify({
                    timestamp: new Date().toISOString(),
                    blockNumber: currentBlock,
                    pools: poolsList,
                    count: poolsList.length
                }, null, 2)
            );
            console.log(`\n[+] Pool list saved to discovered_pools.json`);
        }

    } catch (error) {
        console.error(`\n[!] Error during discovery: ${error.message}`);
        console.error(error);
        process.exit(1);
    }
}

discoverPools().catch(console.error);
