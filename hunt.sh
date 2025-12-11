#!/bin/bash
# VALANTIS STEX DAILY HUNTING ROUTINE
# Run this every morning to scan for vulnerabilities

cd ~/valantis-stex-hunt

echo "╔════════════════════════════════════════════════════╗"
echo "║     VALANTIS STEX DAILY VULNERABILITY HUNT        ║"
echo "║     $(date '+%Y-%m-%d %H:%M:%S')                    ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

# Morning Routine - 30 minutes
echo "🔍 [1/3] Running Daily Scan (Pattern Detection)..."
node analysis/daily_scan.js > logs/scan_$(date +%Y%m%d_%H%M%S).log 2>&1
echo "✅ Daily scan complete - check logs/"
echo ""

echo "🔎 [2/3] Discovering Target Contracts..."
node contracts/discovery.js > logs/discovery_$(date +%Y%m%d_%H%M%S).log 2>&1
echo "✅ Contract discovery complete - check logs/"
echo ""

echo "📊 [3/3] Running Python Analysis..."
python3 analysis/stex_analyzer.py > logs/analysis_$(date +%Y%m%d_%H%M%S).log 2>&1
echo "✅ Python analysis complete - check logs/"
echo ""

echo "════════════════════════════════════════════════════"
echo "📋 Review these logs for promising leads:"
echo "   - logs/scan_*.log"
echo "   - logs/discovery_*.log"
echo "   - logs/analysis_*.log"
echo ""
echo "⏳ Now spend 4-6 hours on deep analysis..."
echo "════════════════════════════════════════════════════"
