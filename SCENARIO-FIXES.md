# SCENARIO FIXES - Titles and AI Bidding Logic

## Problem Summary
1. **Spoiler Titles**: Many titles give away the answer (e.g., "Six-Card Major After 1NT")
2. **Confused AI Bidding**: AI doesn't understand partnerships, bids as if all players are on same team

---

## Title Fixes (Remove Spoilers)

### Current Titles → New Titles

**BASIC Module:**
1. ~~"Responding to 1NT"~~ → "Responding to 1NT" ✅ (Already good)
2. ~~"Six-Card Major After 1NT"~~ → **"Partner Opens 1NT"** 
3. ~~"Strong Hand After Major Opening"~~ → **"Partner Opens 1♠"**
4. ~~"Strong Hand After Preempt"~~ → **"Partner Preempts 2♠"**
5. ~~"Invitational Hand With Support"~~ → "Invitational Hand With Support" ✅ (Acceptable)

**COMPETE Module:**
6. ~~"Partner Opens, RHO Overcalls"~~ → "Partner Opens, RHO Overcalls" ✅ (Good - describes situation)
7. ~~"5-5 in Two Suits"~~ → **"RHO Opens 1♥"** (hides that you have 5-5)
8. ~~"Two-Suited Over Major"~~ → **"After They Open 1♥"**
9. ~~"Supporting Partner's Overcall"~~ → "Supporting Partner's Overcall" ✅ (Acceptable)
10. ~~"Raising After Overcall"~~ → "Raising After Overcall" ✅ (Acceptable)

**DEFENSE Module:**
11. ~~"Opening Strength After RHO Opens"~~ → **"RHO Opens 1♣"**
12. ~~"Strong Balanced Over Opening"~~ → **"After RHO Opens 1♦"**
13. ~~"Long Suit After RHO Opens"~~ → **"After RHO Opens 1♣"**
14. ~~"After Partner Doubles"~~ → "After Partner Doubles" ✅ (Good)
15. ~~"In Passout Seat"~~ → "In Passout Seat" ✅ (Good)

---

## AI Bidding Logic Fix

### Current Problem
The AI prompt says:
```
"You are ${seat} playing bridge. You can see all hands (training mode)."
```

This causes AI to be confused about partnerships. The AI needs to know:
- **Who is partner**
- **Who are opponents**
- **Which seat you're in relative to dealer**

### Solution: Add Partnership Context to Prompt

**Add this to the prompt (line ~480):**

```javascript
const partnerships = {
  'N': { partner: 'S', opponents: ['E', 'W'] },
  'E': { partner: 'W', opponents: ['N', 'S'] },
  'S': { partner: 'N', opponents: ['E', 'W'] },
  'W': { partner: 'E', opponents: ['N', 'S'] }
};

const partnership = partnerships[seat];

const prompt = `You are ${seat} playing bridge in seat ${seat}.
Your partner is ${partnership.partner}.
Your opponents are ${partnership.opponents[0]} and ${partnership.opponents[1]}.

Hands (all visible for training):
North (N): ${JSON.stringify(scen.hands.N)}
East  (E): ${JSON.stringify(scen.hands.E)}
South (S): ${JSON.stringify(scen.hands.S)}
West  (W): ${JSON.stringify(scen.hands.W)}

Auction so far: ${auctionStr || 'None yet'}
Dealer: ${scen.dealer}
Your seat: ${seat}
Your partner: ${partnership.partner}

What should ${seat} bid next?

PARTNERSHIP RULES:
- You and ${partnership.partner} are PARTNERS (N/S or E/W pair)
- ${partnership.opponents[0]} and ${partnership.opponents[1]} are your OPPONENTS
- Respond to PARTNER's bids, compete against OPPONENTS' bids
- Don't bid as if you're responding to opponents!

CRITICAL BIDDING RULES:
[... rest of rules ...]
`;
```

This makes it crystal clear:
- Who you are
- Who your partner is
- Who the opponents are
- Whether a bid is from partner or opponent

---

## Example: U02 Scenario

**Before (Confused):**
```
N: 1NT (opening)
E: 2♥ (AI thinks it's responding to N's 1NT - WRONG!)
```

**After (Correct):**
```
N: 1NT (opening)
E: Pass (opponent passes - CORRECT!)
S: 2♥ (transfer - your bid)
W: Pass (opponent passes)
N: 2♠ (accepts transfer)
```

---

## Implementation Steps

1. **Update Titles** (Simple str_replace operations)
   - Lines 54, 69, 84, 99, 129, 144, etc.
   
2. **Update AI Prompt** (Add partnership context)
   - Around line 480 in `getClaudeBid` function
   
3. **Test Each Scenario**
   - Verify titles don't spoil answer
   - Verify AI bids sensibly for its partnership
   - Verify no illegal bids

---

## Risk Assessment

**Title Changes:**
- Risk: **LOW** - Just text changes
- Impact: Immediate improvement in learning experience
- No code changes needed

**AI Prompt Changes:**
- Risk: **MEDIUM** - Changes AI behavior
- Impact: Should fix confused bidding
- Needs testing to ensure AI understands partnerships

**Recommendation:** Do title fixes first (safe), then AI prompt fix (needs testing).

---

## Files to Modify

- `slam-auction-full.html` - All changes in this one file
  - Lines 54, 69, 84, etc. - Title changes
  - Line ~480 - AI prompt changes

---

## Testing Checklist

After applying fixes:
- [ ] U02: AI should Pass or overcall sensibly, not respond to opponent's 1NT
- [ ] C01: AI should understand it's competing after opponent overcalls
- [ ] All scenarios: Titles don't give away the answer
- [ ] All scenarios: AI makes legal bids
- [ ] All scenarios: AI bids appropriately for its partnership

---

**Priority:** Do title fixes immediately (safe). Test AI fix in development before deploying.
