# SLAM Bridge Monetization Implementation Guide

## Phase 1: User Authentication (Week 1)

### Option A: Supabase (RECOMMENDED)
**Why:** Free tier, built-in auth, PostgreSQL, easy setup

```javascript
// 1. Install Supabase client
npm install @supabase/supabase-js

// 2. Initialize
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  'https://your-project.supabase.co',
  'your-anon-key'
)

// 3. Add Sign Up/Login UI
async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
  })
}

async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  })
}

// 4. Track usage in database
async function logPlay(userId, mode, scenarioId) {
  const { data, error } = await supabase
    .from('plays')
    .insert([
      { user_id: userId, mode: mode, scenario_id: scenarioId }
    ])
}

// 5. Check daily limit
async function canPlayFullAuction(userId) {
  const today = new Date().toISOString().split('T')[0]
  
  const { data, error } = await supabase
    .from('plays')
    .select('*')
    .eq('user_id', userId)
    .eq('mode', 'full')
    .gte('created_at', today)
  
  // Free users: 5 per day
  // Pro users: unlimited
  const user = await getUser(userId)
  if (user.is_pro) return true
  
  return data.length < 5
}
```

**Database Schema:**
```sql
-- Users table (handled by Supabase Auth)

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  status TEXT NOT NULL, -- 'active', 'canceled', 'past_due'
  stripe_subscription_id TEXT,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Plays table (track usage)
CREATE TABLE plays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  mode TEXT NOT NULL, -- 'single' or 'full'
  scenario_id TEXT NOT NULL,
  score INT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Stats table
CREATE TABLE user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users,
  total_plays INT DEFAULT 0,
  total_score INT DEFAULT 0,
  streak_days INT DEFAULT 0,
  last_play_date DATE,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Setup Steps:**
1. Sign up at supabase.com (free)
2. Create new project
3. Copy API keys
4. Set up tables (SQL editor)
5. Add auth UI to your app
6. Done!

**Cost:** $0/month (free tier covers 50,000 MAU)

---

### Option B: Firebase
Similar to Supabase, Google-backed

**Pros:**
- ✅ Easy auth
- ✅ Real-time database
- ✅ Good free tier

**Cons:**
- ❌ Vendor lock-in
- ❌ Can get expensive

---

### Option C: Roll Your Own (Not Recommended)
- Use PostgreSQL + Flask-Login
- More work, more to maintain
- Security concerns

---

## Phase 2: Payment Integration (Week 2)

### Stripe Integration (RECOMMENDED)

**Setup:**
```bash
pip install stripe
```

**Backend:**
```python
import stripe
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY')

@app.route('/api/create-checkout-session', methods=['POST'])
def create_checkout_session():
    """Create Stripe checkout for Pro subscription"""
    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price': 'price_xxxxx',  # Your Stripe price ID
                'quantity': 1,
            }],
            mode='subscription',
            success_url='https://slambridge.ie/success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url='https://slambridge.ie/pricing',
        )
        return jsonify({'url': checkout_session.url})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/webhook', methods=['POST'])
def stripe_webhook():
    """Handle Stripe webhooks (subscription updates)"""
    payload = request.data
    sig_header = request.headers.get('Stripe-Signature')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except ValueError:
        return 'Invalid payload', 400
    
    # Handle subscription events
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        # Mark user as Pro in database
        activate_pro_subscription(session['customer'])
    
    elif event['type'] == 'customer.subscription.deleted':
        subscription = event['data']['object']
        # Mark user as Free in database
        deactivate_pro_subscription(subscription['customer'])
    
    return jsonify({'status': 'success'})
```

**Frontend:**
```javascript
// Upgrade to Pro button
async function upgradeToPro() {
  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
  })
  const { url } = await response.json()
  window.location.href = url  // Redirect to Stripe checkout
}
```

**Stripe Setup:**
1. Sign up at stripe.com
2. Create product: "SLAM Bridge Pro" - $7/month
3. Copy price ID
4. Set up webhooks
5. Test with test mode cards
6. Go live!

**Cost:** 2.9% + $0.30 per transaction

---

## Phase 3: Feature Gating (Week 2)

### Add Paywall Logic

**Frontend Check:**
```javascript
// Before starting Full Auction
async function startFullAuction(scenarioId) {
  const user = await getCurrentUser()
  
  if (!user) {
    showModal('Sign up free to play Full Auctions!')
    return
  }
  
  if (!user.is_pro) {
    const canPlay = await checkDailyLimit(user.id)
    if (!canPlay) {
      showUpgradeModal('Daily limit reached! Upgrade to Pro for unlimited plays.')
      return
    }
  }
  
  // Start scenario...
}

function showUpgradeModal(message) {
  // Show modal with:
  // - Message
  // - "Upgrade to Pro" button ($7/month)
  // - "Maybe later" button
}
```

**Backend Check:**
```python
@app.route('/api/bid', methods=['POST'])
def get_bid():
    """Get AI bid - check if user can play"""
    user_id = request.headers.get('X-User-ID')
    
    # Check subscription
    user = get_user(user_id)
    if not user.is_pro:
        play_count = get_today_play_count(user_id, 'full')
        if play_count >= 5:
            return jsonify({
                'error': 'Daily limit reached',
                'upgrade_url': '/pricing'
            }), 403
    
    # Continue with AI bid...
```

---

## Phase 4: Analytics & Optimization (Week 3)

### Track Key Metrics

```javascript
// Track with Mixpanel or Plausible (privacy-friendly)

// Free user plays 5th scenario of the day
track('free_limit_reached', {
  user_id: userId,
  scenario_count: 5
})

// User clicks "Upgrade"
track('upgrade_clicked', {
  user_id: userId,
  source: 'limit_modal'
})

// User completes checkout
track('subscription_started', {
  user_id: userId,
  plan: 'pro',
  price: 7
})
```

**Metrics to Watch:**
- Daily Active Users (DAU)
- Conversion Rate (free → pro)
- Churn Rate (pro → canceled)
- Average Revenue Per User (ARPU)
- Customer Lifetime Value (LTV)

---

## Pricing Strategy Details

### Price Testing:

| Price | Conversion | Revenue (100 users) |
|-------|-----------|---------------------|
| $5/mo | 5% | $25/mo |
| $7/mo | 3% | $21/mo |
| $9/mo | 2% | $18/mo |

**Sweet spot:** $5-7/month

### Annual Option:
- Monthly: $7/month
- Annual: $60/year (save $24 = 2 months free)
- Higher LTV, less churn

---

## Marketing Free → Pro

### Conversion Triggers:

**1. Daily Limit Hit:**
```
🚫 Daily Limit Reached!

You've played 5 Full Auction scenarios today.

Want unlimited plays?

[Upgrade to Pro - $7/month] [Maybe Tomorrow]

✅ Unlimited Full Auctions
✅ Advanced scenarios
✅ Progress tracking
✅ Priority AI responses
```

**2. After Good Session:**
```
🎉 Great session! You scored 42/45!

Loving SLAM Bridge? Unlock everything:

[Go Pro - $7/month] [Stay Free]
```

**3. Feature Teaser:**
```
🔒 Advanced Slam Bidding scenarios available in Pro

[Upgrade to Unlock] [Not Now]
```

---

## Revenue Projections

### Conservative:
- 1,000 free users
- 2% conversion = 20 pro users
- 20 × $7 = **$140/month**

### Moderate:
- 5,000 free users
- 3% conversion = 150 pro users
- 150 × $7 = **$1,050/month**

### Optimistic:
- 10,000 free users
- 5% conversion = 500 pro users
- 500 × $7 = **$3,500/month**

---

## Costs:

| Item | Monthly Cost |
|------|-------------|
| Domain (.ie) | $2 |
| Hosting (VPS) | $20 |
| HuggingFace Pro | $9 |
| Supabase | $0 (free tier) |
| Stripe fees | 3% of revenue |
| **Total Fixed:** | **$31/month** |

**Break-even:** 5 pro users × $7 = $35/month

---

## Timeline:

**Week 1:** Add auth (Supabase)
**Week 2:** Add payments (Stripe) + feature gates
**Week 3:** Analytics + optimization
**Week 4:** Marketing + launch

**Total: 1 month to monetization** 🚀

---

## Quick Wins:

1. **Soft Launch:** Start free, add paid later
2. **Grandfather:** Early adopters get lifetime free Pro
3. **Beta Pricing:** $5/month for first 100 users
4. **Referrals:** Give 1 month free Pro for referrals

---

## Legal Requirements:

- ✅ Terms of Service
- ✅ Privacy Policy
- ✅ Cookie notice (if EU users)
- ✅ Stripe handles PCI compliance

Use termsfeed.com to generate (free)

---

## Next Steps:

1. Set up Supabase (30 min)
2. Add simple auth UI (2 hours)
3. Set up Stripe (1 hour)
4. Add payment button (1 hour)
5. Add feature gates (2 hours)
6. Test end-to-end (1 hour)
7. Launch! 🚀

**Total: ~1 day of work to add monetization**
