# Troubleshooting Guide

## Conventions Page Shows "Not Found"

**Problem:** Clicking "📖 Conventions" link shows URL not found or 404 error.

**Cause:** The Flask server needs to be restarted after adding new routes.

**Solution:**

### Local Development:
1. Stop the Flask server (Ctrl+C in terminal)
2. Restart it: `python main.py`
3. Visit http://127.0.0.1:5000/conventions

### Railway Deployment:
1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Add conventions page"
   git push
   ```
2. Railway will auto-deploy in ~30 seconds
3. Visit https://slambridge.ie/conventions

---

## AI Still Making Wrong Bids

**Problem:** AI bids incorrectly (e.g., 2♦ instead of 2♥ after Stayman)

**Latest Fix Applied:**
- Added explicit Stayman response rules to AI prompt
- Added distinction between Stayman responses and Jacoby transfers
- Emphasized looking at OWN hand only

**If still broken:**
The AI model (Claude Haiku) may need more explicit examples. Consider:
1. Adding example auctions to the prompt
2. Using a more powerful model (Sonnet) for better understanding
3. Simplifying scenarios to avoid complex conventions

---

## "Forced pass (illegal bid)" Appearing

**What it means:**
- The AI tried to make an illegal bid (e.g., 2♣ after 2♠)
- The safety net caught it and forced Pass instead
- This is WORKING AS INTENDED to prevent crashes

**How to reduce:**
- AI prompt improvements (already applied)
- Better bid validation (already in place)
- May need to accept some AI errors and rely on safety net

---

## Declarer Showing Wrong Person

**Problem:** Final contract shows "4♥ by S" when it should be "4♥ by N"

**Status:** ✅ FIXED
- Declarer logic now finds FIRST person in partnership to bid the strain
- Should correctly identify declarer in all cases

---

## Restart Checklist

After making code changes, restart:

**Local:**
```bash
# Stop server (Ctrl+C)
python main.py
```

**Railway:**
```bash
git add .
git commit -m "Your changes"
git push
# Wait 30 seconds for deploy
```

---

## Quick Deployment Commands

```bash
# Full deployment cycle
cd slam-auction-interactive
git add .
git commit -m "Bug fixes and improvements"
git push

# Check deployment status
# Visit: https://railway.app/project/[your-project]
```

---

## Common Issues

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
# Or use a different port
export PORT=5001
python main.py
```

### API Key Not Found
```bash
# Set environment variable
export ANTHROPIC_API_KEY=sk-ant-...
# Or create slam_key file
echo "sk-ant-..." > slam_key
```

### Module Not Found
```bash
# Reinstall dependencies
pip install -r requirements.txt --break-system-packages
```

---

## Testing Checklist

After deployment:

- [ ] Homepage loads (/)
- [ ] Bridge 101 loads (/bridge-101)
- [ ] **Conventions page loads (/conventions)** ← NEW!
- [ ] Single mode loads (/single)
- [ ] Full mode loads (/full)
- [ ] AI makes legal bids
- [ ] Declarer shown correctly
- [ ] Footer links work
- [ ] No console errors

---

## Need Help?

1. Check browser console (F12) for JavaScript errors
2. Check Flask terminal for Python errors  
3. Check Railway logs for deployment errors
4. Submit bug report: https://github.com/todd427/slam-auction-interactive/issues/new
5. Email: feedback@slambridge.ie
