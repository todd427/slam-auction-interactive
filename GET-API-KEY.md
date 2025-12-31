# HuggingFace API Key - Visual Guide

## Step 1: Sign Up
Go to: https://huggingface.co/
Click "Sign Up" in top right corner

## Step 2: Choose Sign Up Method
Options:
- Email & Password
- Continue with Google
- Continue with GitHub (recommended)

## Step 3: Verify Email
Check your email for verification link
Click the link to verify your account

## Step 4: Go to Settings
Once logged in, click your profile picture (top right)
Select "Settings" from dropdown

Direct link: https://huggingface.co/settings/profile

## Step 5: Access Tokens
In left sidebar, click "Access Tokens"
Direct link: https://huggingface.co/settings/tokens

## Step 6: Create New Token
Click "New token" button
You'll see a form with:
- Name: (give it a name like "slambridge-api")
- Role: Select "Read"
- Optional: Set expiration (or leave as "No expiration")

## Step 7: Copy Your Token
After clicking "Create", you'll see your token:
hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

IMPORTANT: 
- Copy it immediately! You won't see it again
- Store it somewhere safe (password manager)
- Never commit it to GitHub
- Don't share it publicly

## Step 8: Use Your Token

### In Code:
```python
HF_API_KEY = "hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

### As Environment Variable:
```bash
# Linux/Mac:
export HUGGINGFACE_API_KEY="hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Windows Command Prompt:
set HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Windows PowerShell:
$env:HUGGINGFACE_API_KEY="hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

### In .env File (for production):
```
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Troubleshooting

### Token Not Working?
- Check you copied the entire token (starts with "hf_")
- Verify token has "Read" permission
- Make sure token hasn't expired
- Try regenerating the token

### Rate Limits on Free Tier?
- Free tier: ~1,000 requests/day
- Upgrade to Pro: $9/month for 10,000 requests/day
- Or self-host with Ollama (unlimited, free)

### Security Best Practices:
✅ Use environment variables (not hardcoded)
✅ Add .env to .gitignore
✅ Rotate tokens periodically
✅ Use separate tokens for dev/prod
❌ Never commit tokens to GitHub
❌ Never share tokens publicly
❌ Don't hardcode in frontend JavaScript

## Quick Test

Test your token works:
```bash
curl https://api-inference.huggingface.co/models/Qwen/Qwen2.5-3B-Instruct \
  -H "Authorization: Bearer hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{"inputs": "What is 2+2?"}'
```

Should return JSON response with generated text.

## Summary

1. Sign up at huggingface.co
2. Go to Settings → Access Tokens
3. Create new token (Read permission)
4. Copy token (starts with "hf_")
5. Store securely
6. Use as environment variable
7. Test it works!

Total time: ~5 minutes
Cost: $0 (free!)

Now you're ready to use HuggingFace AI in your app! 🚀
