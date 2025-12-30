# Swapping LLMs - Guide

The SLAM Auction backend is designed to be LLM-agnostic. You can easily swap Claude for Llama, GPT, or any other LLM.

## 🔄 How to Swap LLMs

### Option 1: Local Llama with Ollama

**1. Install Ollama:**
```bash
# Mac
brew install ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows
# Download from https://ollama.com/download
```

**2. Download Llama:**
```bash
ollama pull llama3.1
# or
ollama pull llama3.2
```

**3. Update `slam-backend.py`:**

Replace the `/api/bid` endpoint with:

```python
@app.route('/api/bid', methods=['POST'])
def get_bid():
    """Proxy endpoint for Ollama/Llama calls."""
    try:
        data = request.json
        prompt = data.get('prompt', '')
        
        # Call Ollama (local Llama)
        response = requests.post(
            'http://localhost:11434/api/generate',  # Ollama's endpoint
            json={
                'model': 'llama3.1',
                'prompt': prompt,
                'stream': False
            }
        )
        
        response.raise_for_status()
        result = response.json()
        
        # Ollama format: {"response": "text here"}
        text = result.get('response', '')
        
        # Convert to Anthropic format for compatibility
        return jsonify({
            'content': [
                {'type': 'text', 'text': text}
            ]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

**4. Start Ollama (if not already running):**
```bash
ollama serve
```

**5. Done!** No API key needed, runs 100% locally.

---

### Option 2: OpenAI GPT

**Update `slam-backend.py`:**

```python
import openai

OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', '')

@app.route('/api/bid', methods=['POST'])
def get_bid():
    try:
        data = request.json
        prompt = data.get('prompt', '')
        
        # Call OpenAI
        client = openai.OpenAI(api_key=OPENAI_API_KEY)
        response = client.chat.completions.create(
            model="gpt-4",  # or "gpt-3.5-turbo"
            messages=[
                {"role": "user", "content": prompt}
            ],
            max_tokens=300
        )
        
        text = response.choices[0].message.content
        
        # Convert to Anthropic format
        return jsonify({
            'content': [
                {'type': 'text', 'text': text}
            ]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

---

### Option 3: LM Studio (Any Local Model)

**1. Install LM Studio:** https://lmstudio.ai/

**2. Load a model** (Llama 3, Mistral, etc.)

**3. Start local server** (LM Studio has built-in OpenAI-compatible server)

**4. Update `slam-backend.py`:**

```python
@app.route('/api/bid', methods=['POST'])
def get_bid():
    try:
        data = request.json
        prompt = data.get('prompt', '')
        
        # Call LM Studio (OpenAI-compatible endpoint)
        response = requests.post(
            'http://localhost:1234/v1/chat/completions',
            json={
                'model': 'local-model',  # any name works
                'messages': [
                    {'role': 'user', 'content': prompt}
                ],
                'temperature': 0.7,
                'max_tokens': 300
            }
        )
        
        response.raise_for_status()
        result = response.json()
        text = result['choices'][0]['message']['content']
        
        # Convert to Anthropic format
        return jsonify({
            'content': [
                {'type': 'text', 'text': text}
            ]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

---

### Option 4: Hugging Face Models

```python
from transformers import pipeline

# Load once at startup
generator = pipeline('text-generation', model='meta-llama/Llama-2-7b-chat-hf')

@app.route('/api/bid', methods=['POST'])
def get_bid():
    try:
        data = request.json
        prompt = data.get('prompt', '')
        
        # Generate with HF model
        result = generator(
            prompt,
            max_length=500,
            num_return_sequences=1
        )
        
        text = result[0]['generated_text']
        
        # Convert to Anthropic format
        return jsonify({
            'content': [
                {'type': 'text', 'text': text}
            ]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

---

## 🎯 Key Points

1. **Frontend doesn't change** - it just calls `/api/bid`
2. **Backend is the adapter** - it translates between your LLM and the expected format
3. **Return format must match** - Always return `{'content': [{'type': 'text', 'text': '...'}]}`
4. **JSON parsing is the same** - The frontend expects JSON in the response text

## 💰 Cost Comparison

| LLM | Cost | Speed | Quality |
|-----|------|-------|---------|
| Claude Sonnet 4 | ~$3/1M tokens | Fast | Excellent |
| GPT-4 | ~$10/1M tokens | Fast | Excellent |
| GPT-3.5 | ~$0.50/1M tokens | Very Fast | Good |
| Llama 3.1 (Ollama) | **FREE** | Fast | Very Good |
| Llama 2 7B (Local) | **FREE** | Medium | Good |

## 🚀 Recommendation

For **learning/development**: Use **Ollama + Llama 3.1** (free, local, fast)
For **production/best quality**: Use **Claude Sonnet 4** (what it's designed for)

## 📝 Testing

After swapping, test with:
```bash
curl -X POST http://localhost:5000/api/bid \
  -H "Content-Type: application/json" \
  -d '{"prompt": "What should South bid after 1NT - Pass - ?"}'
```

Should return valid JSON with bridge bidding advice!
