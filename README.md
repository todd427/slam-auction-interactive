# 🃏 SLAM Auction Interactive

> Full multi-turn bridge bidding trainer with AI-powered partners

[![Python](https://img.shields.io/badge/Python-3.7+-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0-green.svg)](https://flask.palletsprojects.com/)
[![Claude](https://img.shields.io/badge/Claude-Sonnet%204-orange.svg)](https://www.anthropic.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🎯 Features

- **🔄 Interactive Multi-Turn Bidding**: Bid multiple times throughout the auction
- **🤖 AI Partners**: Claude plays the other 3 seats intelligently  
- **📚 Educational**: See reasoning for each bid
- **🎓 Adaptive**: Claude responds to your actual bids in real-time
- **✅ Legal Bidding Only**: Impossible bids are automatically disabled

## 📸 Screenshots

*Coming soon - add screenshots of the app in action!*

## 🏗️ Architecture

```
slam-auction-interactive.html  ← Frontend (React in browser)
         ↓ HTTP
slam-backend.py  ← Python Flask server  
         ↓ HTTPS
Anthropic API  ← Claude Sonnet 4
```

The backend proxies API calls to avoid CORS issues and keep your API key secure.

## 🚀 Quick Start

### Prerequisites

- Python 3.7+
- Anthropic API key ([Get one here](https://console.anthropic.com/))

### Installation

```bash
# 1. Clone or download this directory
cd slam-auction-interactive

# 2. Install dependencies
pip install -r requirements.txt

# 3. Set your API key
export ANTHROPIC_API_KEY='your-api-key-here'

# 4. Start the backend
python3 slam-backend.py
```

Or use the startup script:
```bash
chmod +x start-slam.sh
./start-slam.sh
```

### Running the App

1. Start the backend (keep it running):
   ```bash
   python3 slam-backend.py
   ```

2. **Open your browser:**
   ```
   http://localhost:5000
   ```

3. **Choose your mode:**
   - 🎯 **Single Decision** - Quick, focused practice (30s per scenario)
   - 🎲 **Full Auction** - Complete realistic auctions (2-3min per scenario)

The main page explains both modes and lets you choose! 🎯

## 📁 Project Structure

```
slam-auction-interactive/
├── slam-auction-interactive.html  # Main frontend app
├── slam-backend.py                # Backend API proxy
├── requirements.txt               # Python dependencies
├── start-slam.sh                  # Startup script
├── README.md                      # This file
├── LICENSE                        # MIT license
├── CONTRIBUTING.md                # Contribution guidelines
└── .gitignore                     # Git ignore file
```

## 🎮 How to Play

1. **See your hand** - You're always South (displayed in green)
2. **Wait for your turn** - Watch as North, East, and West bid
3. **When it's your turn** - Legal bids light up in green
4. **Make your bid** - Click any legal bid
5. **Continue the auction** - Bid multiple times until 3 consecutive passes
6. **See the result** - Compare with the optimal contract

### Example Auction

```
N: 1NT     (Partner opens 15-17 HCP)
E: Pass    (Opponent passes)
S: 2♣      (YOU bid Stayman)
W: Pass    (Opponent passes)  
N: 2♥      (Partner shows 4 hearts)
E: Pass
S: 4♥      (YOU bid game)
W: Pass
N: Pass  
E: Pass
→ Final Contract: 4♥ by S
```

## 🎓 Learning Bridge

This app teaches Standard American conventions:
- **Stayman**: Finding 4-4 major fits after 1NT
- **Jacoby Transfers**: Getting the strong hand as declarer
- **2/1 Game Forcing**: Building to game
- **Responsive Bidding**: How auctions develop

## 🐛 Troubleshooting

### "NetworkError when attempting to fetch"
**Problem**: Backend isn't running  
**Solution**: Start with `python3 slam-backend.py`

### "ANTHROPIC_API_KEY not set"
**Problem**: API key not configured  
**Solution**: `export ANTHROPIC_API_KEY='your-key'`

### "Connection refused to localhost:5000"
**Problem**: Port 5000 is in use  
**Solution**: Change port in both `slam-backend.py` and HTML file

### "API error: 401"
**Problem**: Invalid API key  
**Solution**: Verify your key at https://console.anthropic.com/

## 🔮 Roadmap

- [ ] 20+ training scenarios
- [ ] Multiple difficulty levels  
- [ ] Post-auction analysis
- [ ] Save/replay auctions
- [ ] Score tracking
- [ ] Multiplayer mode
- [ ] Full 4-player game with hidden hands
- [ ] Card play after auction

## 🤝 Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- Built with [React](https://react.dev/) and [Flask](https://flask.palletsprojects.com/)
- Powered by [Claude](https://www.anthropic.com/) from Anthropic
- Bridge is fun! 🎯

---

**Happy Bidding!** 🃏
