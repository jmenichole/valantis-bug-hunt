# Valantis STEX Vulnerability Disclosure Timeline

**Vulnerability ID**: VALANTIS-2025-ACCESS-001  
**Severity**: HIGH (CVSS 7.5)  
**Category**: Access Control Bypass (CWE-284)  
**Researcher**: Jamie (jmenichole)  
**Portfolio**: https://jmenichole.github.io/Portfolio/

---

## DISCOVERY PHASE

### December 10, 2025
**18:00 UTC** - Project Initiation
- Initialized Valantis STEX bug bounty investigation
- Set up analysis framework and tooling
- Configured 8 legendary vulnerability patterns

**20:30 UTC** - Initial Reconnaissance
- Deployed contract discovery system
- Identified Protocol Factory: `0x29939b3b2aD83882174a50DFD80a3B6329C4a603`
- Identified Sovereign Pool Factory: `0xa68d6c59Cf3048292dc4EC1F76ED9DEf8b6F9617`

### December 11, 2025
**09:00 UTC** - Automated Scanning
- Executed daily vulnerability scan across all 8 patterns
- Pattern 1 (Proxy Initialization): Flagged as potential issue
- Pattern 6 (Access Control): Flagged as HIGH priority

**12:30 UTC** - Deep Dive Analysis
- Reviewed `ProtocolFactory.sol` source code
- Identified missing access control on `deploySovereignPool()`
- Confirmed function is external and unrestricted

**14:00 UTC** - Proof of Concept Development
- Created `PermissionlessPoolDeploymentPOC.sol` test suite
- Developed 5 comprehensive test cases
- Set up Foundry fork testing environment

**15:30 UTC** - POC Execution
- ✅ Test 1: Verified anyone can deploy pools
- ✅ Test 2: Confirmed attacker controls pool manager
- ✅ Test 3: Validated multiple fake pool deployment
- ✅ Test 4: Confirmed no whitelist system exists
- ✅ Test 5: Quantified economic impact

**16:00 UTC** - Vulnerability Confirmation
- All 5 tests PASSED (vulnerability confirmed)
- Documented exploit path and attack scenario
- Calculated financial impact: $100K - $10M per attack

**18:00 UTC** - Report Preparation
- Drafted comprehensive vulnerability report
- Prepared CVSS scoring and justification
- Documented remediation recommendations

**21:00 UTC** - Final Validation
- Re-ran all tests on mainnet fork
- Verified bytecode matches GitHub source
- Confirmed vulnerability is in-scope per program rules

### December 12, 2025
**10:00 UTC** - Documentation Finalization
- Completed final vulnerability report
- Generated financial impact analysis
- Prepared bug bounty submission materials

**14:00 UTC** - Submission Package Assembly
- Organized all POC code and test outputs
- Created submission checklist
- Prepared supporting documentation

### December 13, 2025
**12:00 UTC** - Timeline Documentation
- Finalized disclosure timeline
- Completed all pre-submission requirements
- Ready for bug bounty submission

---

## SUBMISSION PHASE

### December 13, 2025
**Status**: ⏳ PENDING SUBMISSION

**Planned Actions**:
1. Submit via Remedy platform: https://hunt.r.xyz/programs/valantis-stex
2. Include all POC code and test results
3. Attach comprehensive vulnerability report
4. Provide financial impact analysis

---

## KEY MILESTONES

| Date | Event | Status |
|------|-------|--------|
| Dec 10, 2025 | Project initiated | ✅ Complete |
| Dec 11, 2025 | Vulnerability discovered | ✅ Complete |
| Dec 11, 2025 | POC developed and validated | ✅ Complete |
| Dec 11, 2025 | Report drafted | ✅ Complete |
| Dec 12, 2025 | Documentation finalized | ✅ Complete |
| Dec 13, 2025 | Submission prepared | ✅ Complete |
| Dec 13, 2025 | Submit to Valantis team | ⏳ Pending |

---

## RESPONSIBLE DISCLOSURE

✅ **Private Disclosure**: No public announcement made  
✅ **No Exploitation**: Zero mainnet transactions executed  
✅ **Fork Testing Only**: All tests on local Foundry fork  
✅ **Constructive Approach**: Detailed remediation provided  
✅ **Timely Reporting**: 3-day discovery-to-submission timeline  

---

## METHODOLOGY COMPLIANCE

### Program Rules Adherence
- ✅ Vulnerability is in-scope (access control issue)
- ✅ No privileged access required
- ✅ No exploitation on mainnet
- ✅ Clear protocol-level impact demonstrated
- ✅ Professional documentation provided

### Testing Standards
- ✅ Foundry fork testing (no mainnet interaction)
- ✅ Reproducible POC with clear instructions
- ✅ Multiple test cases covering attack vectors
- ✅ Gas estimation and cost analysis included

---

## ESTIMATED TIMELINE FOR RESPONSE

Based on typical bug bounty programs:

- **Acknowledgment**: 1-3 business days
- **Initial Triage**: 3-7 business days  
- **Technical Review**: 7-14 business days
- **Bounty Decision**: 14-30 business days
- **Payout**: 30-60 business days

---

## SUPPORTING MATERIALS

All analysis materials available at:
`~/valantis-stex-hunt/`

### Documentation
- ✅ FINAL_VULNERABILITY_REPORT.md
- ✅ BUG_BOUNTY_SUBMISSION.md
- ✅ DISCLOSURE_TIMELINE.md (this file)
- ✅ Financial impact analysis (JSON)

### Code & Tests
- ✅ POC: `tools/test/PermissionlessPoolDeploymentPOC.sol`
- ✅ Test Suite: All 8 vulnerability pattern tests
- ✅ Analysis Scripts: Daily scan and investigation tools

### Test Results
- ✅ Forge test output logs
- ✅ Mainnet fork validation
- ✅ Gas cost analysis

---

**Contact**: jmenichole (Discord)  
**Report Date**: December 13, 2025  
**Report Status**: Ready for Submission  
**Expected Bounty**: $20,000 - $100,000

---

*End of Timeline*
