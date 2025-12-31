# HuggingFace Setup Guide for SLAM Bridge

## 🤗 Why HuggingFace?

- **Free Tier:** Rate-limited but good for MVP
- **Pro Tier:** $9/month for better limits
- **Cost-Effective:** Much cheaper than Claude API
- **Many Models:** Choose from dozens of open-source LLMs

---

## 🚀 Quick Setup (5 minutes)

### 1. Get Your API Key

1. Go to https://huggingface.co/
2. Sign up for free account
3. Go to Settings → Access Tokens
4. Create a new token (read access is enough)
5. Copy your token: `hf_xxxxxxxxxxxxx`

### 2. Choose Your Model

**Recommended Models:**

| Model | Size | Quality | Speed | Free Tier |
|-------|------|---------|-------|-----------|
| **Llama 3.1 8B** | Small | Good | Fast | ✅ Yes |
| **Llama 3.1 70B** | Large | Excellent | Slower | ✅ Yes |
| **Mistral 7B** | Small | Good | Fast | ✅ Yes |
| **Qwen 2.5 72B** | Large | Excellent | Slower | ✅ Yes |

**For SLAM Bridge, we recommend: Llama 3.1 70B**
- Best quality for bridge reasoning
- Available on free tier
- Good response times

### 3. Update Backend

Replace `slam-backend.py` with `slam-backend-huggingface.py`:

```bash
cd slam-auction-interactive
cp slam-backend-huggingface.py slam-backend.py
```

### 4. Set Environment Variable

**Linux/Mac:**
```bash
export HUGGINGFACE_API_KEY="hf_your_key_here"
python3 slam-backend.py
```

**Windows:**
```cmd
set HUGGINGFACE_API_KEY=hf_your_key_here
python slam-backend.py
```

**Or edit the file directly:**
```python
HF_API_KEY = "hf_your_key_here"  # Line 13 in slam-backend.py
```

### 5. Test It!

```bash
python3 slam-backend.py
# Open http://localhost:5000/full
# Try a full auction scenario
```

---

## 💰 Cost Comparison

### Free Tier:
- **Rate Limit:** ~1,000 requests/day
- **Cost:** $0/month
- **Good for:** Testing, small user base

### Pro Tier ($9/month):
- **Rate Limit:** ~10,000 requests/day
- **Cost:** $9/month
- **Good for:** Growing app, hundreds of users

### Pay-As-You-Go:
- **Llama 3.1 70B:** ~$0.65 per million tokens
- **Average hand:** ~2,000 tokens = $0.0013 per hand
- **1000 users, 10 hands/day:** ~$13/day = $390/month
- **Good for:** High-traffic production

**Comparison to Claude:**
- Claude Sonnet 4: $3 per million = **4.6x more expensive**
- HuggingFace is much cheaper! 💰

---

## ⚙️ Model Configuration

### Change Model:

Edit line 12 in `slam-backend.py`:

```python
# Llama 3.1 8B (faster, cheaper)
HF_API_URL = "https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3.1-8B-Instruct"

# Llama 3.1 70B (better quality) ⭐ RECOMMENDED
HF_API_URL = "https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3.1-70B-Instruct"

# Mistral 7B (alternative)
HF_API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3"

# Qwen 2.5 72B (alternative, excellent)
HF_API_URL = "https://api-inference.huggingface.co/models/Qwen/Qwen2.5-72B-Instruct"
```

### Adjust Parameters:

```python
payload = {
    "inputs": prompt,
    "parameters": {
        "max_new_tokens": 500,      # Longer responses
        "temperature": 0.7,          # 0.1-1.0 (lower = more deterministic)
        "top_p": 0.9,                # Nucleus sampling
        "return_full_text": False    # Only return generated text
    }
}
```

---

## 🐛 Common Issues

### 1. "Model is loading" (503 error)

**Problem:** First request has cold start (~20 seconds)

**Solution:** Frontend already handles this with retry logic

**User sees:** "AI thinking..." then auto-retries

### 2. Rate Limit Hit

**Problem:** Free tier limits exceeded

**Solutions:**
- Upgrade to Pro ($9/month)
- Switch to dedicated endpoint
- Add caching for repeated scenarios
- Self-host with Ollama

### 3. Slow Responses

**Problem:** Large model (70B) takes 5-10 seconds

**Solutions:**
- Use smaller model (8B is faster)
- Add loading spinner (already implemented)
- Dedicated endpoint (always warm)

### 4. API Key Not Working

**Problem:** Invalid or expired token

**Solution:**
- Regenerate token at huggingface.co/settings/tokens
- Check token has "read" permission
- Verify token copied correctly (no spaces)

---

## 📊 Performance Comparison

| Provider | Cost/Month | Speed | Quality | Setup |
|----------|-----------|-------|---------|-------|
| **Claude API** | $1800+ 😱 | Fast | Excellent | Easy |
| **HuggingFace Free** | $0 ✅ | Medium | Good | Easy |
| **HuggingFace Pro** | $9 ✅ | Medium | Good | Easy |
| **HuggingFace Endpoint** | $43-432 | Fast | Excellent | Medium |
| **Ollama (Self-host)** | $20-40 | Medium | Good | Hard |
| **Groq (Free)** | $0 ✅ | Very Fast | Good | Easy |

---

## 🎯 Recommendations by Stage

### **MVP/Testing:**
- Use HuggingFace Free Tier
- Llama 3.1 8B for speed
- Cost: $0

### **Early Production (100-1000 users):**
- HuggingFace Pro: $9/month
- Llama 3.1 70B for quality
- Cost: $9/month

### **Growth (1000+ users):**
- Dedicated Endpoint (CPU): $43/month
- Or switch to Groq free tier
- Or self-host Ollama: $20-40/month

### **High Traffic:**
- Dedicated Endpoint (GPU): $432/month
- Or scale with Ollama: $100-200/month
- Or monetize and use pay-as-you-go

---

## 🔄 Migration Path

```
Start: Claude API ($1800/mo) 😱
  ↓
Step 1: HuggingFace Free ($0/mo) ✅
  ↓
Step 2: HuggingFace Pro ($9/mo) ✅
  ↓
Step 3: Choose based on traffic:
  → Dedicated Endpoint ($43-432/mo)
  → Groq Free (if within limits)
  → Self-host Ollama ($20-40/mo)
  → Monetize + stay on HF
```

---

## 📝 Next Steps

1. ✅ Get HuggingFace API key
2. ✅ Update backend file
3. ✅ Test locally
4. ✅ Deploy to production
5. ✅ Monitor usage
6. ⏳ Scale when needed

**Need help?** Check the HuggingFace docs: https://huggingface.co/docs/api-inference
