# VULNERABILITY HYPOTHESIS TRACKER

## Day 1 - December 11, 2025

### Investigation Status
- [ ] Pattern 1: Proxy Initialization Bypass
- [ ] Pattern 2: Flash Loan Reentrancy  
- [ ] Pattern 3: Oracle Staleness
- [ ] Pattern 4: Flash Swap Slippage
- [ ] Pattern 5: Governance Manipulation
- [ ] Pattern 6: Access Control Bypass
- [ ] Pattern 7: Signature Validation
- [ ] Pattern 8: Storage Collision

---

## Your First Investigation

**Choose one pattern above and fill this out:**

### Pattern: [PATTERN NAME]
**Start Time**: [TIME]  
**Severity**: [CRITICAL/HIGH/MEDIUM/LOW]  
**Potential Payout**: $[ESTIMATE]

#### Hypothesis
[What do you think is vulnerable? 2-3 sentences]

#### Why It Matters
[Why would this be exploitable? What's the impact?]

#### Investigation Steps
- [ ] Step 1: [describe]
- [ ] Step 2: [describe]
- [ ] Step 3: [describe]
- [ ] Step 4: [describe]

#### Key Findings
[What have you discovered so far?]

#### Next Steps
[What to investigate next?]

---

## Quick Reference: Contract Addresses to Test

These will be populated by `node contracts/discovery.js`:

**Sovereign Pool Contracts**:
- [ ] [Address 1]
- [ ] [Address 2]

**STEX Module Contracts**:
- [ ] [Address 1]
- [ ] [Address 2]

**Yield Assets**:
- [ ] [Address 1]
- [ ] [Address 2]

**Oracle Contracts**:
- [ ] [Address 1]
- [ ] [Address 2]

---

## Investigation Log

```
[TIME] Started investigation on [PATTERN]
[TIME] Found: [FINDING]
[TIME] Tested: [TEST]
[TIME] Result: [RESULT]
```

---

## Ready to Start?

Run your daily hunt:
```bash
cd ~/valantis-stex-hunt
./hunt.sh
```

Then pick your first pattern and dig in! 🔍
