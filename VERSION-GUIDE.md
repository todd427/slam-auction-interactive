# Two Versions - Which Should You Use?

SLAM Auction comes in **two flavors**, each designed for different learning styles.

## 🎯 Single Decision Mode
**URL:** `http://localhost:5000`  
**File:** `slam-auction-single.html`

### How It Works:
1. See a bridge scenario at a critical decision point
2. Make ONE bid
3. Get immediate feedback (correct/alternative/wrong)
4. See explanation and scoring
5. Move to next scenario

### Best For:
- **Quick practice** - 30 seconds per scenario
- **Focused learning** - practice specific conventions
- **Beginners** - learn one concept at a time
- **Rapid review** - 15 scenarios in 10 minutes

### Example Flow:
```
Auction:  N: 1NT, E: Pass, S: ?
Your hand: ♠KJ84 ♥A963 ♦K72 ♣85
You bid: 2♣
✓ Excellent! (3 points) - Use Stayman to find fit
→ Next Scenario
```

---

## 🎲 Full Auction Mode
**URL:** `http://localhost:5000/full`  
**File:** `slam-auction-full.html`

### How It Works:
1. Auction starts (dealer opens)
2. Claude bids for N, E, W automatically
3. **You bid every time it's your turn** (could be 2-3+ times)
4. Auction continues until 3 consecutive passes
5. Score based on your FIRST bid
6. See final contract vs optimal

### Best For:
- **Realistic practice** - how real bridge works
- **Advanced learning** - see how auctions develop
- **Competition prep** - practice full bidding sequences
- **Understanding flow** - learn follow-up bids

### Example Flow:
```
N: 1NT (Claude)
E: Pass (Claude)
S: 2♣ (YOU bid)
W: Pass (Claude)
N: 2♥ (Claude shows 4 hearts)
E: Pass (Claude)
S: 4♥ (YOU bid game)
W: Pass (Claude)
N: Pass (Claude)
E: Pass (Claude)
→ Auction Complete: 4♥ by S
```

---

## 📊 Comparison

| Feature | Single Decision | Full Auction |
|---------|----------------|--------------|
| **Time per scenario** | 30 seconds | 2-3 minutes |
| **Bids you make** | 1 | 2-4+ |
| **AI involvement** | None | High (3 seats) |
| **Realism** | Focused moment | Complete auction |
| **Feedback** | Immediate | After completion |
| **Best for** | Learning conventions | Understanding flow |
| **Difficulty** | Easier | Harder |
| **Scenario count** | 15 | 3 (currently) |

---

## 💡 Our Recommendation

### If you're **new to bridge**:
Start with **Single Decision Mode**
- Learn the conventions first
- Build confidence
- Quick wins

### If you're **intermediate+**:
Use **Full Auction Mode**
- More realistic
- Better preparation
- Deeper learning

### If you're **preparing for competition**:
Alternate between both:
1. Single Decision for quick convention review
2. Full Auction for realistic practice

---

## 🔧 Technical Differences

### Single Decision:
- Static scenario data
- Pre-scripted auctions
- No API calls during bidding
- Instant feedback

### Full Auction:
- Dynamic auction generation
- Real-time Claude API calls
- Live bid-by-bid responses
- Complete auction tracking
- All 4 hands visible to Claude

---

## 🚀 Future Plans

**Single Decision:**
- ✅ 15 scenarios (done)
- ⏳ 50+ scenarios (planned)
- ⏳ Advanced modules

**Full Auction:**
- ✅ 3 scenarios (done)
- ⏳ 15 scenarios (in progress)
- ⏳ Hidden hands mode (competitive)
- ⏳ Explanation after each bid
- ⏳ Alternative auction paths

Both modes will continue to evolve! 🎯
