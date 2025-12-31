# Simple Bug Tracking & Feedback Setup

**Total time: 3 minutes**
**Cost: $0**
**Complexity: None**

---

## ✅ Step 1: GitHub Issues (30 seconds)

### Enable Issues:

1. Go to your GitHub repo: `https://github.com/YOUR_USERNAME/slambridge`
2. Click **Settings** tab
3. Scroll to **Features** section
4. Check ✅ **Issues**
5. Done!

### Your Bug Tracker URLs:

```
Report bug: https://github.com/YOUR_USERNAME/slambridge/issues/new
View all bugs: https://github.com/YOUR_USERNAME/slambridge/issues
```

### Optional: Add Issue Template

Create `.github/ISSUE_TEMPLATE/bug_report.md`:

```markdown
---
name: Bug Report
about: Report a bug in SLAM Bridge
title: '[BUG] '
labels: bug
---

**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen.

**Screenshots**
If applicable, add screenshots.

**Device (please complete):**
 - Device: [e.g. iPhone 12, Desktop]
 - Browser: [e.g. Chrome, Safari]
 - OS: [e.g. iOS 15, Windows 11]
```

---

## ✅ Step 2: Cloudflare Email (2 minutes)

### Setup Email Forwarding:

1. **Cloudflare Dashboard** → Your domain
2. **Email** → **Email Routing**
3. **Routing rules** → **Create address**

### Create This Rule:

```
Custom address: feedback
Action: Send to an email
Destination: your-personal-email@gmail.com
```

Click **Save**

### Test It:

Send email to: `feedback@slambridge.ie`

Should arrive in your Gmail inbox! ✅

---

## ✅ Step 3: Update Your Site (1 minute)

### Replace YOUR_USERNAME in index.html:

Find this line in the footer:
```html
<a href="https://github.com/YOUR_USERNAME/slambridge/issues/new"
```

Replace `YOUR_USERNAME` with your actual GitHub username.

Example:
```html
<a href="https://github.com/todd427/slambridge/issues/new"
```

### Push to GitHub:

```bash
git add index.html
git commit -m "Add bug report and feedback links"
git push
```

Railway will auto-deploy! ✅

---

## 📧 Email Addresses You Now Have:

| Email | Purpose | Goes To |
|-------|---------|---------|
| feedback@slambridge.ie | User feedback | Your Gmail |

### Want More?

Add more in Cloudflare:
```
support@slambridge.ie → your-email@gmail.com
hello@slambridge.ie → your-email@gmail.com
bugs@slambridge.ie → your-email@gmail.com
```

---

## 🐛 How Bug Reports Work:

### User Flow:

1. User clicks "Report Bug 🐛" in footer
2. Opens GitHub Issues page
3. Fills out bug report
4. Submits
5. You get GitHub notification email
6. You fix bug
7. Close issue
8. Done!

### You Get Notified Via:

- Email (GitHub sends you notifications)
- GitHub notifications tab
- GitHub mobile app

---

## 💬 How Feedback Works:

### User Flow:

1. User clicks "Feedback ✉️" in footer
2. Opens their email client
3. Sends email to feedback@slambridge.ie
4. Cloudflare forwards to your Gmail
5. You receive and respond
6. Done!

---

## 📊 Managing Bugs in GitHub:

### Add Labels:

In your repo:
1. Go to **Issues** tab
2. Click **Labels**
3. Create these:

```
🐛 bug (red)
✨ feature (green)
❓ question (blue)
🔥 critical (dark red)
💡 enhancement (yellow)
```

### Assign Priority:

Just add labels like:
- `priority: high`
- `priority: medium`
- `priority: low`

### Close Fixed Bugs:

When you fix a bug:
```bash
git commit -m "Fix login bug (closes #42)"
git push
```

GitHub auto-closes issue #42! ✅

---

## 🎯 Pro Tips:

### 1. Use Projects (Kanban Board)

In your GitHub repo:
1. Go to **Projects** tab
2. Click **New project**
3. Choose **Board** template
4. Add columns: Todo, In Progress, Done
5. Drag issues between columns

### 2. GitHub Mobile App

Download GitHub app to get notifications on your phone!

### 3. Auto-Labels with Actions

Create `.github/workflows/label.yml`:

```yaml
name: Auto Label
on:
  issues:
    types: [opened]

jobs:
  label:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/labeler@v4
```

### 4. Email Filters in Gmail

Create filter:
```
From: notifications@github.com
Subject: [slambridge]
Label: SLAM Bridge Bugs
```

---

## 🎉 You're Done!

**What you have:**
- ✅ Bug tracking (GitHub Issues)
- ✅ Feedback email (feedback@slambridge.ie)
- ✅ Zero cost ($0/month)
- ✅ Zero complexity
- ✅ Works perfectly for MVP

**What you DON'T have:**
- ❌ Overcomplicated Linear setup
- ❌ Confusing UI
- ❌ Time wasted

**Simple wins.** 🚀

---

## 📝 Footer Links Reference:

Your footer now has:
1. **New to Bridge?** → Bridge 101 guide
2. **Tutorial** → Interactive tutorial
3. **Report Bug 🐛** → GitHub Issues
4. **Feedback ✉️** → Email you directly
5. **slambridge.ie** → Home

Perfect! ✅

---

## 🔄 When to Upgrade:

Consider fancier tools (Linear, Jira, etc.) when you have:
- 100+ bugs to manage
- Multiple team members
- Need for AI auto-prioritization
- Dedicated support team

**For now? GitHub Issues is perfect.** 👍
