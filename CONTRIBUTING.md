# Contributing to SLAM Auction Interactive

Thanks for your interest in contributing! 🎉

## Getting Started

1. Fork the repository
2. Clone your fork
3. Create a branch for your feature
4. Make your changes
5. Test thoroughly
6. Submit a pull request

## Development Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Set API key for testing
export ANTHROPIC_API_KEY='your-test-key'

# Start backend
python3 slam-backend.py

# Open slam-auction-interactive.html in browser
```

## Adding New Scenarios

Edit the `SCENARIOS` array in `slam-auction-interactive.html`:

```javascript
{
  id: "INT03",
  title: "Your Scenario Name",
  dealer: "N",
  vul: "None",
  your_seat: "S",
  hands: {
    N: { S: "...", H: "...", D: "...", C: "..." },
    E: { S: "...", H: "...", D: "...", C: "..." },
    S: { S: "...", H: "...", D: "...", C: "..." },
    W: { S: "...", H: "...", D: "...", C: "..." }
  },
  teaching_point: "What this scenario teaches",
  optimal_contract: "4H by N"
}
```

## Code Style

- Use clear variable names
- Comment complex logic
- Keep functions small and focused
- Follow existing patterns

## Testing Checklist

- [ ] Backend starts without errors
- [ ] Frontend loads in browser
- [ ] API calls work (check browser console)
- [ ] Bidding logic is correct (legal bids only)
- [ ] Auction completes properly (3 passes)
- [ ] AI bids make sense

## Feature Ideas

- More scenarios (20+ hands)
- Post-auction analysis
- Replay functionality  
- Multiple difficulty levels
- Card play after auction
- Tournament mode

## Questions?

Open an issue or start a discussion!
