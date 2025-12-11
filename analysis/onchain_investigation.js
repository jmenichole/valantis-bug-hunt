const { Web3 } = require('web3');
require('dotenv').config();

const web3 = new Web3(process.env.MAINNET_RPC);

const contracts = [
  { name: 'stHYPE', address: '0xfFaa4a3D97fE9107Cef8a3F48c069F577Ff76cC1' },
  { name: 'OverseerV1', address: '0xB96f07367e69e86d6e9C3F49215885104813eeAE' },
  { name: 'wstHYPE', address: '0x94e8396e0869c9F2200760aF0621aFd240E1CF38' }
];

// EIP-1967 storage slots
const IMPLEMENTATION_SLOT = '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc';
const ADMIN_SLOT = '0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103';
const BEACON_SLOT = '0xa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50';

async function investigateContracts() {
  console.log('\n╔══════════════════════════════════════════════════════════════════╗');
  console.log('║            VALANTIS STEX - ON-CHAIN INVESTIGATION               ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');

  for (const contract of contracts) {
    console.log(`\n🔍 Investigating: ${contract.name}`);
    console.log(`   Address: ${contract.address}\n`);

    try {
      // Check if contract exists
      const code = await web3.eth.getCode(contract.address);
      
      if (code === '0x' || code === '0x0') {
        console.log('   ❌ NO CONTRACT CODE FOUND');
        console.log('   ⚠️  This address has no deployed contract!\n');
        continue;
      }
      
      console.log(`   ✅ Contract exists (bytecode: ${code.length} characters)`);
      
      // Check for proxy patterns by reading EIP-1967 storage slots
      const implementationAddr = await web3.eth.getStorageAt(contract.address, IMPLEMENTATION_SLOT);
      const adminAddr = await web3.eth.getStorageAt(contract.address, ADMIN_SLOT);
      const beaconAddr = await web3.eth.getStorageAt(contract.address, BEACON_SLOT);
      
      console.log('\n   📦 EIP-1967 Proxy Detection:');
      
      const hasImplementation = implementationAddr && implementationAddr !== '0x' + '0'.repeat(64);
      const hasAdmin = adminAddr && adminAddr !== '0x' + '0'.repeat(64);
      const hasBeacon = beaconAddr && beaconAddr !== '0x' + '0'.repeat(64);
      
      if (hasImplementation) {
        const implAddress = '0x' + implementationAddr.slice(-40);
        console.log(`   ✅ Implementation: ${implAddress}`);
        
        // Check if implementation is verified
        const implCode = await web3.eth.getCode(implAddress);
        console.log(`      Implementation exists: ${implCode !== '0x' && implCode !== '0x0' ? 'YES' : 'NO'}`);
      } else {
        console.log('   ❌ No implementation slot found');
      }
      
      if (hasAdmin) {
        const adminAddress = '0x' + adminAddr.slice(-40);
        console.log(`   ✅ Admin: ${adminAddress}`);
      } else {
        console.log('   ❌ No admin slot found');
      }
      
      if (hasBeacon) {
        const beaconAddress = '0x' + beaconAddr.slice(-40);
        console.log(`   ✅ Beacon: ${beaconAddress}`);
      } else {
        console.log('   ❌ No beacon slot found');
      }
      
      // Try to detect proxy by checking for delegatecall patterns in bytecode
      const hasDelegatecall = code.includes('f4'); // DELEGATECALL opcode
      console.log(`\n   🔧 Bytecode Analysis:`);
      console.log(`      Contains DELEGATECALL: ${hasDelegatecall ? 'YES' : 'NO'}`);
      
      // Get current balance
      const balance = await web3.eth.getBalance(contract.address);
      const balanceEth = web3.utils.fromWei(balance, 'ether');
      console.log(`      Balance: ${balanceEth} ETH`);
      
      // Get transaction count
      const txCount = await web3.eth.getTransactionCount(contract.address);
      console.log(`      Transactions sent: ${txCount}`);
      
      // Try to call some common functions
      console.log('\n   🎯 Function Testing:');
      
      // Try to call name() - common ERC20 function
      try {
        const nameData = web3.eth.abi.encodeFunctionSignature('name()');
        const nameResult = await web3.eth.call({
          to: contract.address,
          data: nameData
        });
        if (nameResult && nameResult !== '0x') {
          console.log(`      ✅ name() callable - likely an ERC20 token`);
        }
      } catch (e) {
        console.log(`      ❌ name() failed`);
      }
      
      // Try to call owner() - common Ownable function
      try {
        const ownerData = web3.eth.abi.encodeFunctionSignature('owner()');
        const ownerResult = await web3.eth.call({
          to: contract.address,
          data: ownerData
        });
        if (ownerResult && ownerResult !== '0x') {
          const ownerAddr = '0x' + ownerResult.slice(-40);
          console.log(`      ✅ owner() = ${ownerAddr}`);
        }
      } catch (e) {
        console.log(`      ❌ owner() failed`);
      }
      
      // Try to call initialize() - CRITICAL for Pattern 1
      try {
        const initData = web3.eth.abi.encodeFunctionSignature('initialize()');
        const initResult = await web3.eth.call({
          to: contract.address,
          data: initData
        });
        console.log(`      🚨 initialize() callable: YES - NEEDS INVESTIGATION!`);
      } catch (e) {
        if (e.message.includes('revert')) {
          console.log(`      ✅ initialize() reverts (likely already initialized)`);
        } else {
          console.log(`      ❌ initialize() does not exist`);
        }
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    console.log('\n' + '─'.repeat(70));
  }
  
  console.log('\n✅ On-chain investigation complete.\n');
}

investigateContracts().catch(console.error);
