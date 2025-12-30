# SLAM Auction Interactive - Quick Reference

## 🚀 First Time Setup

```bash
pip install -r requirements.txt
export ANTHROPIC_API_KEY='your-key-here'
```

## ▶️ Start Playing

```bash
python3 slam-backend.py
# Then open slam-auction-interactive.html
```

Or:
```bash
./start-slam.sh
```

## 🎮 Controls

- **Green buttons** = Legal bids (click to bid)
- **Gray buttons** = Illegal bids (disabled)
- **Pass** = Always legal
- **Wait** = Claude is thinking when it's not your turn

## 📝 Bidding Rules

- Bids must be higher than the previous bid
- Pass is always legal
- Auction ends after 3 consecutive passes
- You can bid multiple times in one auction

## 🎯 Goal

Reach the optimal contract shown at the top!

## 🐛 Quick Fixes

| Problem | Solution |
|---------|----------|
| "NetworkError" | Start backend: `python3 slam-backend.py` |
| "API Key not set" | `export ANTHROPIC_API_KEY='your-key'` |
| "Connection refused" | Backend not running on port 5000 |
| "401 error" | Invalid API key, check console.anthropic.com |

## 📚 Learn More

- Full docs: README.md
- Contributing: CONTRIBUTING.md  
- License: LICENSE

---
**Happy Bidding!** 🃏
