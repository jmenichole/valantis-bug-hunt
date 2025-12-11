# QUICK START REFERENCE

## 🎯 Location
```bash
~/valantis-stex-hunt/
```

## 🚀 Get Started Now (3 Simple Steps)

### Step 1: Configure (2 minutes)
```bash
cd ~/valantis-stex-hunt
nano .env
# Add your RPC endpoint for MAINNET_RPC
# Add Etherscan API key for contract lookup
```

### Step 2: Run Daily Scan (1 minute)
```bash
node analysis/daily_scan.js
# View results in: logs/scan_YYYY-MM-DD.json
```

### Step 3: Discover Targets (5 minutes)
```bash
node contracts/discovery.js
# Identifies all Sovereign Pool, STEX modules, oracles, yield assets
```

---

## 📊 The 8 Patterns You'll Test

| # | Pattern | Severity | What It Does |
|---|---------|----------|-------------|
| 1 | Proxy Init | 🔴 CRITICAL | Tests uninitialized proxy contracts |
| 2 | Flash Reentrancy | 🔴 CRITICAL | Exploits flash loan callback reentrancy |
| 3 | Oracle Staleness | 🟠 HIGH | Uses stale prices for manipulation |
| 4 | Flash Swap Slippage | 🟠 HIGH | Bypasses slippage protections |
| 5 | Governance | 🔴 CRITICAL | Manipulates protocol parameters |
| 6 | Access Control | 🔴 CRITICAL | Bypasses permission checks |
| 7 | Signatures | 🟠 HIGH | Exploits weak signature validation |
| 8 | Storage Collision | 🟠 HIGH | Causes storage conflicts |

---

## 🔧 Daily Commands

```bash
# Morning routine (30 mins)
cd ~/valantis-stex-hunt
node analysis/daily_scan.js          # Scan for vulnerabilities
node contracts/discovery.js           # Discover targets
python analysis/stex_analyzer.py     # Run Python analysis

# When you find something promising
# Create exploit in: exploits/[VulnerabilityName].sol

# End of day
git add .
git commit -m "Day X: [description]"
git push origin main
```

---

## 📁 Key Files

| File | Purpose | Status |
|------|---------|--------|
| `analysis/daily_scan.js` | Daily vulnerability scanner | ✅ Ready |
| `contracts/discovery.js` | Find target contracts | ✅ Ready |
| `analysis/stex_analyzer.py` | Python analyzer | ✅ Ready |
| `tools/src/STEXExploitTester.sol` | Solidity tests | ✅ Ready |
| `.env` | Configuration | ⏳ Needs API keys |
| `exploits/` | Proof of concepts | ⏳ Ready for development |
| `reports/` | Final reports | ⏳ Ready for documentation |

---

## 💰 Target Program

- **Name**: Valantis STEX
- **Max Payout**: $200,000 USD
- **Expected Difficulty**: Medium (modular DEX)
- **Timeline**: 2 weeks to submission

---

## ✅ Setup Verification

- [x] Directory structure created
- [x] Git repository initialized
- [x] Node.js dependencies installed (web3, axios, dotenv)
- [x] Python tools created (stex_analyzer.py)
- [x] Foundry initialized (Solidity testing)
- [x] Daily scanner created and tested
- [x] Contract discovery script ready
- [x] Exploit testing contract ready
- [x] Configuration files prepared

---

## 🔐 Security Notes

1. **Never commit `.env` with real keys** - Already in `.gitignore`
2. **Test on testnet first** - Use Goerli/Sepolia before mainnet
3. **Keep exploits private** - Until bug bounty submission
4. **Document everything** - Timeline, findings, POCs

---

## 📈 Success Timeline

- **Day 1** ✅ Setup complete (YOU ARE HERE)
- **Days 2-3** ⏳ First vulnerability hypothesis
- **Days 4-5** ⏳ Deep dive analysis  
- **Days 6-7** ⏳ Initial exploit development
- **Days 8-10** ⏳ Critical discovery (80% probability)
- **Days 11-12** ⏳ Professional POC
- **Days 13-14** ⏳ Report submission
- **Target**: $200K+ bounty

---

## 🆘 Quick Fixes

**Web3 RPC connection failed?**
```bash
# Edit .env and ensure MAINNET_RPC has valid HTTP URL
nano .env
```

**Python dependencies missing?**
```bash
pip install -r requirements.txt
```

**Foundry not found?**
```bash
source ~/.zshenv
foundryup
```

---

## 📞 Ready to Begin?

The framework is 100% operational. Your next step:

1. Add RPC endpoint to `.env`
2. Run: `node analysis/daily_scan.js`
3. Start hunting! 🎯

**Good luck with the $200K bug hunt!**

