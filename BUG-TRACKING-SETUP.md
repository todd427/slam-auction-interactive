# Bug Tracking & Feedback System Setup

## 🐛 Bug Tracking with Linear (RECOMMENDED)

### Setup (5 minutes):

1. **Create Linear Account**
   - Go to: https://linear.app/
   - Sign up free with GitHub
   - Create workspace: "SLAM Bridge"

2. **Configure Intake**
   - Settings → Integrations → Email
   - Enable: bugs@slambridge.ie
   - Auto-creates issues from emails

3. **Set Up Labels**
   ```
   Type:
   - Bug 🐛
   - Feature ✨
   - Question ❓
   
   Priority:
   - Critical 🔥
   - High 🔴
   - Medium 🟡
   - Low 🟢
   
   Status:
   - Backlog
   - Todo
   - In Progress
   - Done
   ```

4. **Enable AI Features**
   - Settings → AI
   - Enable auto-labeling
   - Enable duplicate detection
   - Enable priority suggestions

5. **Create Public Roadmap**
   - Settings → Public
   - Enable roadmap
   - Share URL: roadmap.slambridge.ie

### Email Forwarding:

In your domain registrar (Blacknight):
```
bugs@slambridge.ie → intake@linear.app (they give you this)
```

---

## 📝 Feedback Forms with Tally

### Setup (3 minutes):

1. **Create Account**
   - Go to: https://tally.so/
   - Sign up free

2. **Create Bug Report Form**
   ```
   Fields:
   - Email (required)
   - Bug Description (required)
   - Steps to Reproduce (optional)
   - Expected vs Actual (optional)
   - Screenshot (file upload)
   ```

3. **Create Feature Request Form**
   ```
   Fields:
   - Email (required)
   - Feature Title (required)
   - Description (required)
   - Use Case (optional)
   - Priority (dropdown: Critical/High/Medium/Low)
   ```

4. **Create General Feedback Form**
   ```
   Fields:
   - Email (required)
   - Type (dropdown: Praise/Suggestion/Question/Other)
   - Message (required)
   ```

5. **Integrate with Linear**
   - Tally Settings → Integrations
   - Connect Linear
   - Auto-create issues from forms

### Add to Your Site:

```html
<!-- Footer of index.html -->
<div class="footer">
    <div class="footer-links">
        <a href="/bridge-101">New to Bridge?</a>
        <a href="#" id="replay-tutorial">Tutorial</a>
        <a href="https://tally.so/r/your-form-id" target="_blank">Report Bug</a>
        <a href="https://tally.so/r/your-form-id-2" target="_blank">Feedback</a>
        <a href="https://slambridge.ie">slambridge.ie</a>
    </div>
</div>
```

---

## 🗳️ Feature Voting with Canny (Optional)

### Setup (5 minutes):

1. **Create Account**
   - Go to: https://canny.io/
   - Sign up free

2. **Create Board**
   - Name: "SLAM Bridge Features"
   - Public URL: feedback.slambridge.ie

3. **Embed Widget**
   ```html
   <script>!function(w,d,i,s){function l(){if(!d.getElementById(i)){var f=d.getElementsByTagName(s)[0],e=d.createElement(s);e.type="text/javascript",e.async=!0,e.src="https://canny.io/sdk.js",f.parentNode.insertBefore(e,f)}}if("function"!=typeof w.Canny){var c=function(){c.q.push(arguments)};c.q=[],w.Canny=c,"complete"===d.readyState?l():w.attachEvent?w.attachEvent("onload",l):w.addEventListener("load",l,!1)}}(window,document,"canny-jssdk","script");</script>
   ```

4. **Add Button**
   ```html
   <button onclick="Canny('open')">Suggest Feature</button>
   ```

---

## 📧 Email Setup

### Domain Email Forwarding:

In Blacknight (or your registrar):

**Create these forwards:**
```
bugs@slambridge.ie → intake@linear.app
feedback@slambridge.ie → your-email@gmail.com
hello@slambridge.ie → your-email@gmail.com
support@slambridge.ie → your-email@gmail.com
```

### Professional Email (Optional):

Use Google Workspace or ProtonMail:
- Google Workspace: $6/month/user
- ProtonMail: Free tier available

---

## 🔔 Notification Setup

### Slack Integration:

1. Create #slam-bugs channel
2. Linear → Settings → Integrations → Slack
3. Connect to #slam-bugs
4. Get real-time bug notifications

### Discord Integration:

1. Create Discord server
2. Linear → Settings → Integrations → Discord
3. Connect to #bugs channel

---

## 📊 Analytics Integration

### Track Bug Sources:

Add to bug report form:
```javascript
// Capture page where bug occurred
const bugSource = window.location.href;

// Capture browser info
const browser = navigator.userAgent;

// Send with form
```

### Plausible Events:

```javascript
// Track when users report bugs
plausible('Bug Report Submitted', {
  props: {
    source: window.location.pathname,
    type: bugType
  }
});
```

---

## 🎯 Workflow

### User Reports Bug:

1. User clicks "Report Bug" link
2. Fills Tally form
3. Tally sends to Linear
4. Linear AI:
   - Auto-labels as "Bug"
   - Detects duplicates
   - Suggests priority
   - Notifies Slack
5. You review and triage
6. Fix and deploy
7. Auto-close in Linear
8. User gets email: "Bug fixed!"

### User Requests Feature:

1. User goes to Canny board
2. Searches existing requests
3. Votes if exists, or creates new
4. You see most-wanted features
5. Build high-priority items
6. Mark as "Shipped" in Canny
7. Users get notified

---

## 💰 Costs

| Tool | Free Tier | Paid (if needed) |
|------|-----------|------------------|
| **Linear** | 250 issues | $8/user/mo |
| **Tally** | Unlimited | $0 |
| **Canny** | 100 users | $50/mo |
| **Email forwards** | Free | $0 |
| **Total** | **$0/month** | - |

---

## 🚀 Quick Start (10 minutes total):

**Minimum Viable Setup:**

1. **Linear** (5 min)
   - Sign up
   - Create workspace
   - Enable email intake

2. **Tally** (3 min)
   - Create bug report form
   - Connect to Linear

3. **Email** (2 min)
   - Forward bugs@slambridge.ie to Linear
   - Forward feedback@slambridge.ie to your email

**Done! You have:**
- ✅ Bug tracking with AI
- ✅ Email intake
- ✅ Beautiful forms
- ✅ Auto-prioritization
- ✅ Duplicate detection

---

## 📝 Adding to Your Site

Update footer with feedback links:

```html
<div class="footer">
    <div class="footer-links">
        <a href="/bridge-101">New to Bridge?</a>
        <a href="#" id="replay-tutorial">Tutorial</a>
        <a href="https://tally.so/r/XXXXX" target="_blank">Report Bug 🐛</a>
        <a href="mailto:feedback@slambridge.ie">Feedback ✉️</a>
    </div>
</div>
```

Create /feedback page:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Feedback - SLAM Bridge</title>
</head>
<body>
    <h1>We'd Love Your Feedback!</h1>
    
    <div class="feedback-options">
        <a href="https://tally.so/r/bug-form">
            🐛 Report a Bug
        </a>
        
        <a href="https://tally.so/r/feature-form">
            ✨ Request a Feature
        </a>
        
        <a href="mailto:hello@slambridge.ie">
            💬 General Feedback
        </a>
    </div>
</body>
</html>
```

---

## 🎉 You're Set!

Users can now:
- Report bugs via form or email
- Request features
- Send general feedback

You get:
- AI-powered bug management
- Auto-prioritization
- Duplicate detection
- Real-time notifications
- Public roadmap

**All for $0/month!** 🚀
