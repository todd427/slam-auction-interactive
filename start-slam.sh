#!/bin/bash
# SLAM Auction Interactive - Startup Script

echo "🎯 SLAM Auction Interactive Setup"
echo "=================================="
echo ""

# Check if API key is set
if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "⚠️  ANTHROPIC_API_KEY not set!"
    echo ""
    echo "Please set your API key:"
    echo "  export ANTHROPIC_API_KEY='your-api-key-here'"
    echo ""
    echo "Get your API key from: https://console.anthropic.com/"
    echo ""
    exit 1
fi

echo "✓ API Key configured"
echo ""

# Check Python dependencies
echo "Checking dependencies..."
pip install -q -r requirements.txt

echo "✓ Dependencies installed"
echo ""

echo "Using Claude: " $CLAUDE_MODEL
echo ""

# Start the backend
echo "🚀 Starting backend on http://localhost:5000"
echo ""
echo "Next steps:"
echo "  1. Backend is starting..."
echo "  2. Open slam-auction-interactive.html in your browser"
echo "  3. Start bidding!"
echo ""
echo "Press Ctrl+C to stop the backend"
echo ""

python3 main.py
