"""
Test HuggingFace Models - Updated for 2025
Quick script to find which models work on Inference API
"""

import requests
import json
import time

# Your HuggingFace API key
HF_API_KEY = "hf_your_key_here"

# Models to test - UPDATED FOR 2025
# These should be available on Inference API
MODELS = {
    "Mistral 7B v0.3": "mistralai/Mistral-7B-Instruct-v0.3",
    "Mixtral 8x7B": "mistralai/Mixtral-8x7B-Instruct-v0.1",
    "Zephyr 7B": "HuggingFaceH4/zephyr-7b-beta",
    "OpenChat 3.5": "openchat/openchat-3.5-0106",
    "Llama 2 7B": "meta-llama/Llama-2-7b-chat-hf",
    "Llama 2 13B": "meta-llama/Llama-2-13b-chat-hf",
}

# Test scenario
TEST_PROMPT = """You are playing bridge in the South seat.

North opened 1NT (15-17 HCP, balanced)
East passed
South (YOU) has: ♠ KJ84 ♥ A963 ♦ K72 ♣ 85

What should South bid? You have 10 HCP and both 4-card majors.
The correct bid is 2♣ (Stayman) to find a 4-4 major fit.

Respond ONLY with valid JSON:
{"bid": "2C", "reasoning": "Brief explanation"}

Your response:"""

def test_model(model_name, model_id):
    """Test a single model"""
    print(f"\n{'='*60}")
    print(f"Testing: {model_name}")
    print(f"{'='*60}")
    
    url = f"https://api-inference.huggingface.co/models/{model_id}"
    headers = {
        "Authorization": f"Bearer {HF_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "inputs": TEST_PROMPT,
        "parameters": {
            "max_new_tokens": 200,
            "temperature": 0.3,
            "top_p": 0.9,
            "return_full_text": False
        }
    }
    
    try:
        start = time.time()
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        elapsed = time.time() - start
        
        if response.status_code == 503:
            print(f"⏳ Model loading (try again in 20 seconds)")
            return {'status': 'loading'}
        
        if response.status_code == 410:
            print(f"❌ Model no longer available (410 Gone)")
            return {'status': 'gone'}
        
        if response.status_code == 404:
            print(f"❌ Model not found (404)")
            return {'status': 'not_found'}
            
        if response.status_code == 401:
            print(f"❌ Authentication failed - check your API key")
            return {'status': 'auth_error'}
        
        response.raise_for_status()
        result = response.json()
        
        # Extract text
        if isinstance(result, list) and len(result) > 0:
            text = result[0].get('generated_text', '')
        else:
            text = result.get('generated_text', '') or result.get('text', '')
        
        print(f"⏱️  Response time: {elapsed:.2f}s")
        print(f"📝 Raw output:\n{text[:200]}...\n")
        
        # Try to parse JSON
        try:
            json_start = text.find('{')
            json_end = text.rfind('}') + 1
            if json_start >= 0 and json_end > json_start:
                json_str = text[json_start:json_end]
                bid_data = json.loads(json_str)
                
                bid = bid_data.get('bid', 'UNKNOWN')
                reasoning = bid_data.get('reasoning', 'NONE')
                
                # Check if correct
                is_correct = bid in ['2C', '2♣', '2c']
                
                print(f"✅ Bid: {bid}")
                print(f"💭 Reasoning: {reasoning[:100]}")
                print(f"🎯 Correct: {'YES ✓' if is_correct else 'NO ✗'}")
                
                return {
                    'status': 'success',
                    'model': model_name,
                    'bid': bid,
                    'correct': is_correct,
                    'time': elapsed,
                    'reasoning': reasoning
                }
            else:
                print(f"⚠️  No JSON found in response")
                return {'status': 'no_json', 'model': model_name, 'time': elapsed}
        except json.JSONDecodeError as e:
            print(f"❌ JSON parse error: {e}")
            return {'status': 'parse_error', 'model': model_name, 'time': elapsed}
            
    except requests.exceptions.Timeout:
        print(f"⏳ Request timeout")
        return {'status': 'timeout'}
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return {'status': 'error', 'error': str(e)}

def main():
    print("🃏 SLAM Bridge - Model Availability Test (2025)")
    print("Testing which models work on HuggingFace Inference API\n")
    
    if HF_API_KEY == "hf_your_key_here":
        print("⚠️  Please set your HuggingFace API key!")
        print("Get one at: https://huggingface.co/settings/tokens")
        return
    
    results = []
    available_models = []
    unavailable_models = []
    
    for model_name, model_id in MODELS.items():
        result = test_model(model_name, model_id)
        
        if result.get('status') == 'success':
            results.append(result)
            available_models.append(model_name)
        elif result.get('status') in ['gone', 'not_found']:
            unavailable_models.append(model_name)
        elif result.get('status') == 'loading':
            print(f"⏳ {model_name} is loading, try again later")
        
        time.sleep(2)  # Rate limiting
    
    # Summary
    print(f"\n{'='*60}")
    print("📊 RESULTS SUMMARY")
    print(f"{'='*60}\n")
    
    if results:
        print(f"{'Model':<25} {'Bid':<8} {'Correct':<10} {'Time':<10}")
        print(f"{'-'*60}")
        
        for r in results:
            correct_mark = '✓' if r.get('correct') else '✗'
            print(f"{r['model']:<25} {r.get('bid', 'N/A'):<8} {correct_mark:<10} {r.get('time', 0):.2f}s")
        
        print(f"\n🎯 Success rate: {sum(1 for r in results if r.get('correct'))}/{len(results)}")
        print(f"⚡ Avg response time: {sum(r['time'] for r in results)/len(results):.2f}s")
        
        # Recommendation
        correct_models = [r for r in results if r.get('correct')]
        if correct_models:
            fastest = min(correct_models, key=lambda x: x['time'])
            print(f"\n⭐ RECOMMENDED: {fastest['model']} ({fastest['time']:.2f}s)")
            model_id = [mid for name, mid in MODELS.items() if name == fastest['model']][0]
            print(f"   Model ID: {model_id}")
    else:
        print("❌ No models successfully responded")
    
    if available_models:
        print(f"\n✅ Available models:")
        for m in available_models:
            print(f"   - {m}")
    
    if unavailable_models:
        print(f"\n❌ Unavailable models:")
        for m in unavailable_models:
            print(f"   - {m}")
    
    print(f"\n💡 TIP: If all models are unavailable, consider:")
    print(f"   1. Using Groq (free, fast): groq.com")
    print(f"   2. Self-hosting Ollama (free, unlimited): ollama.ai")
    print(f"   3. Using OpenAI API (paid but reliable)")

if __name__ == "__main__":
    main()
