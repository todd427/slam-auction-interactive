# Model Switching Guide

## Testing Haiku vs Sonnet

You can now easily switch between models to test which works better!

### **Default: Haiku** ($1.50/month for 100 req/day)
```bash
# No environment variable needed - Haiku is default
python main.py
```

### **Switch to Sonnet** ($18/month for 100 req/day)
```bash
export CLAUDE_MODEL=sonnet
python main.py
```

### **Switch Back to Haiku**
```bash
export CLAUDE_MODEL=haiku
python main.py
# Or just unset it:
unset CLAUDE_MODEL
python main.py
```

---

## Testing Procedure

### **1. Test with Haiku (Current - With All Bug Fixes)**
```bash
# Make sure CLAUDE_MODEL is NOT set (or set to 'haiku')
unset CLAUDE_MODEL
python main.py
```

Play scenario 1 "Responding to 1NT" and check:
- Does North bid 2♥ correctly (showing 4 hearts)?
- Does West make legal bids?
- Does anyone hallucinate cards?
- Does the auction complete successfully?

### **2. Test with Sonnet**
```bash
export CLAUDE_MODEL=sonnet
python main.py
```

Play the SAME scenario and compare results.

---

## What We Fixed

All these fixes apply to BOTH models:

1. ✅ **"10" → "T" conversion** (stops card counting confusion)
2. ✅ **Clear hand format** (Spades: AKQ vs JSON)
3. ✅ **Partnership labels** (★ PARTNER, ✗ OPPONENT)
4. ✅ **HCP calculation** (shows total points)
5. ✅ **Card counts** (shows "3 cards" per suit)
6. ✅ **Simplified prompt** (removed confusing elements)
7. ✅ **MANDATORY Stayman** (must respond even if doubled)
8. ✅ **"Double" → "X"** (format compatibility)
9. ✅ **Better JSON parsing** (handles malformed responses)

---

## Expected Results

### **If Haiku Works Now:**
- ✅ You can keep the cheap option ($1.50/mo)
- ✅ All bug fixes solved the problems
- ✅ No need to upgrade

### **If Only Sonnet Works:**
- The fixes helped but Haiku still has context tracking issues
- Need to decide: Pay 12x more for reliability
- OR: Accept occasional AI errors with safety net

---

## Cost Comparison

**For 100 requests/day (3,000/month):**

| Model | Input | Output | Per Request | Monthly |
|-------|-------|--------|-------------|---------|
| Haiku | $0.25/1M | $1.25/1M | ~$0.0005 | **$1.50** |
| Sonnet | $3.00/1M | $15.00/1M | ~$0.0060 | **$18.00** |

**Difference:** $16.50/month = $198/year

---

## Railway Deployment

### **Deploy with Haiku (default):**
```bash
# No environment variable needed in Railway dashboard
git push
```

### **Deploy with Sonnet:**
In Railway dashboard:
1. Go to your project
2. Click on "Variables"
3. Add: `CLAUDE_MODEL` = `sonnet`
4. Redeploy

---

## Recommendation

**Test both locally first!** If Haiku works with all the bug fixes, there's no reason to pay 12x more!

Only upgrade to Sonnet if:
- Haiku still hallucinates cards
- Haiku still makes illegal bids frequently
- Haiku still confuses partnerships

Otherwise, stick with Haiku and save $198/year! 💰
