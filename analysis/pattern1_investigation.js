#!/usr/bin/env node

/**
 * PATTERN 1: PROXY INITIALIZATION BYPASS - PRACTICAL INVESTIGATION
 * 
 * This script helps you investigate proxy initialization vulnerabilities
 * Run: node analysis/pattern1_investigation.js
 */

const { Web3 } = require('web3');
const fs = require('fs');
require('dotenv').config();

class ProxyInitializationInvestigator {
  constructor() {
    this.web3 = new Web3(process.env.MAINNET_RPC || 'http://localhost:8545');
    this.findings = [];
    this.log = [];
  }

  log_message(msg) {
    console.log(msg);
    this.log.push(`${new Date().toISOString()} - ${msg}`);
  }

  /**
   * Check if a contract is likely a proxy
   */
  async isProxy(address) {
    try {
      // Check if address has code
      const code = await this.web3.eth.getCode(address);
      if (code === '0x') {
        return false;
      }

      // Look for common proxy patterns
      const codeString = code.toLowerCase();
      
      const proxyPatterns = [
        'delegatecall', // Used in proxies
        'fallback',      // Proxies use fallback
        'proxy',         // Named in code
      ];

      let matchCount = 0;
      for (const pattern of proxyPatterns) {
        if (codeString.includes(pattern)) {
          matchCount++;
        }
      }

      return matchCount > 0;
    } catch (error) {
      this.log_message(`Error checking address ${address}: ${error.message}`);
      return false;
    }
  }

  /**
   * Check if contract has initialize function
   */
  async hasInitialize(address) {
    try {
      const code = await this.web3.eth.getCode(address);
      
      // Check for common initialize patterns
      const initPatterns = [
        '0x' + Buffer.from('initialize').toString('hex'),
        'initialize',
        '__init__',
        '_init',
      ];

      for (const pattern of initPatterns) {
        if (code.includes(pattern)) {
          return true;
        }
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Analyze initialization security
   */
  async analyzeInitSecurity(contractName, contractAddress) {
    this.log_message(`\n[*] Analyzing ${contractName} at ${contractAddress}`);

    const finding = {
      contract: contractName,
      address: contractAddress,
      isProxy: false,
      hasInitialize: false,
      risks: [],
      severity: 'NONE',
    };

    // Check if it's a proxy
    finding.isProxy = await this.isProxy(contractAddress);
    this.log_message(`    Is Proxy: ${finding.isProxy}`);

    if (!finding.isProxy) {
      this.log_message(`    Skipping - not a proxy pattern`);
      return null;
    }

    // Check for initialize function
    finding.hasInitialize = await this.hasInitialize(contractAddress);
    this.log_message(`    Has Initialize: ${finding.hasInitialize}`);

    if (!finding.hasInitialize) {
      this.log_message(`    No initialize function found`);
      return null;
    }

    // This is a proxy with initialize - potential vulnerability!
    this.log_message(`    ⚠️  POTENTIAL VULNERABILITY FOUND!`);

    finding.risks.push('Proxy contract with initialize function');
    finding.risks.push('Needs detailed security analysis');
    finding.severity = 'HIGH';

    this.findings.push(finding);
    return finding;
  }

  /**
   * Run investigation on known STEX contracts
   */
  async runInvestigation() {
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║  PATTERN 1: PROXY INITIALIZATION BYPASS INVESTIGATION  ║');
    console.log('║  Investigation Mode: Proxy Detection & Analysis        ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    // Common contract addresses to test (these are examples)
    const testContracts = [
      {
        name: 'Sovereign Pool Module',
        address: '0x0000000000000000000000000000000000000001', // Placeholder
      },
      {
        name: 'STEX Module',
        address: '0x0000000000000000000000000000000000000002', // Placeholder
      },
      {
        name: 'Yield Asset Adapter',
        address: '0x0000000000000000000000000000000000000003', // Placeholder
      },
    ];

    console.log('[*] Starting proxy initialization analysis...\n');

    for (const contract of testContracts) {
      await this.analyzeInitSecurity(contract.name, contract.address);
    }

    // Print summary
    this.printSummary();
  }

  /**
   * Print investigation summary
   */
  printSummary() {
    console.log('\n════════════════════════════════════════════════════════');
    console.log('📊 INVESTIGATION SUMMARY\n');

    if (this.findings.length === 0) {
      console.log('[*] No proxy initialization vulnerabilities detected');
      console.log('[*] Next steps:');
      console.log('    1. Run with actual Valantis STEX contract addresses');
      console.log('    2. Check Etherscan for STEX contract addresses');
      console.log('    3. Analyze each contract\'s initialize function');
    } else {
      console.log(`[+] Found ${this.findings.length} potential vulnerabilities\n`);
      
      for (const finding of this.findings) {
        console.log(`Contract: ${finding.contract}`);
        console.log(`Address: ${finding.address}`);
        console.log(`Severity: ${finding.severity}`);
        console.log(`Risks:`);
        for (const risk of finding.risks) {
          console.log(`  - ${risk}`);
        }
        console.log('');
      }
    }

    console.log('════════════════════════════════════════════════════════\n');

    // Save log
    const logFile = `logs/pattern1_investigation_${Date.now()}.json`;
    fs.writeFileSync(logFile, JSON.stringify({
      timestamp: new Date().toISOString(),
      findings: this.findings,
      log: this.log,
    }, null, 2));

    console.log(`[*] Investigation log saved to: ${logFile}`);
  }

  /**
   * Generate investigation report
   */
  generateReport() {
    return `
# PATTERN 1: Proxy Initialization Bypass Investigation Report

**Date**: ${new Date().toISOString()}
**Status**: In Progress
**Findings**: ${this.findings.length}

## Investigation Steps Completed

1. [x] Set up investigation environment
2. [x] Created proxy detection logic
3. [x] Analyzed contracts for initialize patterns
4. [ ] Detailed security analysis of initialize functions
5. [ ] POC development
6. [ ] Impact calculation

## Next Steps

1. **Get actual STEX contract addresses** from Etherscan:
   - Search for "Valantis STEX"
   - Get Sovereign Pool contract addresses
   - Get module contract addresses

2. **Deep dive analysis**:
   - Read actual contract code
   - Check initialize function implementation
   - Verify access control (initializer modifier)
   - Test for re-initialization

3. **Create POC**:
   - Write Solidity test
   - Try to call initialize multiple times
   - Try to initialize with malicious parameters

## Findings

${this.findings.length === 0 ? 'No vulnerabilities found yet' : JSON.stringify(this.findings, null, 2)}

## Resources

- Etherscan: https://etherscan.io
- Valantis STEX: https://valantis.xyz
- OpenZeppelin Proxy Documentation: https://docs.openzeppelin.com/contracts/4.x/api/proxy
    `;
  }
}

// Main execution
async function main() {
  const investigator = new ProxyInitializationInvestigator();
  await investigator.runInvestigation();

  // Generate report
  const report = investigator.generateReport();
  const reportFile = `analysis/pattern1_report_${Date.now()}.md`;
  fs.writeFileSync(reportFile, report);
  console.log(`[*] Report generated: ${reportFile}`);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = ProxyInitializationInvestigator;
