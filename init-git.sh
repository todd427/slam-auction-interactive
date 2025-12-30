#!/bin/bash
# Initialize Git repository for SLAM Auction Interactive

echo "🎯 Initializing SLAM Auction Interactive Git Repository"
echo "========================================================"
echo ""

# Check if already a git repo
if [ -d ".git" ]; then
    echo "⚠️  Already a Git repository!"
    echo "Run 'git remote add origin <url>' to link to GitHub"
    exit 0
fi

# Initialize Git
git init
echo "✓ Git repository initialized"

# Add all files
git add .
echo "✓ Files staged"

# Initial commit
git commit -m "Initial commit: SLAM Auction Interactive

- Multi-turn bridge bidding trainer
- AI-powered partners using Claude
- Python Flask backend
- React frontend
- Educational bridge training tool"
echo "✓ Initial commit created"

echo ""
echo "🎉 Repository initialized!"
echo ""
echo "Next steps:"
echo "  1. Create a repo on GitHub: https://github.com/new"
echo "  2. Link it: git remote add origin https://github.com/YOUR_USERNAME/slam-auction.git"
echo "  3. Push: git push -u origin main"
echo ""
echo "Or push to a different branch:"
echo "  git branch -M main"
echo "  git push -u origin main"
echo ""
