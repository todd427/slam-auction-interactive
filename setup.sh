#!/bin/bash
# Quick Setup Script for SLAM Bridge
# Run this after getting your HuggingFace API key

echo "🤗 SLAM Bridge - Quick Setup"
echo "=============================="
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.8+"
    exit 1
fi

echo "✅ Python 3 found: $(python3 --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
pip3 install -r requirements.txt --break-system-packages
echo ""

# Get API key
echo "🔑 HuggingFace API Key Setup"
echo "----------------------------"
echo ""
echo "Do you have a HuggingFace API key? (y/n)"
read -r has_key

if [ "$has_key" != "y" ]; then
    echo ""
    echo "📝 Get your free API key:"
    echo "1. Go to: https://huggingface.co/join"
    echo "2. Sign up (free)"
    echo "3. Go to: https://huggingface.co/settings/tokens"
    echo "4. Click 'New token'"
    echo "5. Name it 'slambridge-api'"
    echo "6. Select 'Read' permission"
    echo "7. Click 'Generate token'"
    echo "8. Copy the token (starts with hf_)"
    echo ""
    echo "📖 Detailed guide: GET-API-KEY.md"
    echo ""
    exit 0
fi

echo ""
echo "Please paste your HuggingFace API key:"
echo "(It starts with 'hf_' and is about 40 characters)"
read -r api_key

# Validate API key format
if [[ ! $api_key =~ ^hf_ ]]; then
    echo "❌ Invalid API key format. Should start with 'hf_'"
    exit 1
fi

# Create .env file
echo "HUGGINGFACE_API_KEY=$api_key" > .env
echo "✅ API key saved to .env file"
echo ""

# Set up backend
echo "🔧 Configuring backend..."
if [ ! -f "slam-backend.py" ] || [ "slam-backend-huggingface.py" -nt "slam-backend.py" ]; then
    cp slam-backend-huggingface.py slam-backend.py
    echo "✅ Backend configured for HuggingFace"
fi
echo ""

# Test API key
echo "🧪 Testing API connection..."
export HUGGINGFACE_API_KEY=$api_key

python3 << EOF
import requests
import sys

try:
    response = requests.get(
        "https://api-inference.huggingface.co/models/Qwen/Qwen2.5-3B-Instruct",
        headers={"Authorization": f"Bearer $api_key"},
        timeout=5
    )
    if response.status_code == 200:
        print("✅ API key works!")
        sys.exit(0)
    elif response.status_code == 401:
        print("❌ API key invalid")
        sys.exit(1)
    elif response.status_code == 503:
        print("✅ API key valid (model loading)")
        sys.exit(0)
    else:
        print(f"⚠️  Unexpected status: {response.status_code}")
        sys.exit(0)
except Exception as e:
    print(f"⚠️  Could not test: {e}")
    sys.exit(0)
EOF

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "🚀 To start the server:"
echo "   python3 slam-backend.py"
echo ""
echo "🌐 Then open in browser:"
echo "   http://localhost:5000"
echo ""
echo "📊 To test different models:"
echo "   python3 test-small-models.py"
echo ""
echo "📖 Documentation:"
echo "   - HUGGINGFACE-SETUP.md (detailed guide)"
echo "   - GET-API-KEY.md (key setup)"
echo "   - QUICKSTART.md (quick reference)"
echo ""
