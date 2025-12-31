"""
Test Small Models for Bridge Bidding
Quick script to test different model sizes
"""

import requests
import json
import time

# Your HuggingFace API key
HF_API_KEY = "hf_your_key_here"

# Models to test
MODELS = {
    "Qwen 2.5 3B": "Qwen/Qwen2.5-3B-Instruct",
    "Llama 3.2 3B": "meta-llama/Llama-3.2-3B-Instruct",
    "Phi-3 Mini (3.8B)": "microsoft/Phi-3-mini-4k-instruct",
    "Llama 3.2 1B": "meta-llama/Llama-3.2-1B-Instruct",
    "Llama 3.1 8B": "meta-llama/Meta-Llama-3.1-8B-Instruct"
}

# Test scenario
TEST_PROMPT = """You are playing bridge in the South seat.

All hands:
North: ♠ A105 ♥ KQ84 ♦ AQ6 ♣ K73
East: ♠ 9632 ♥ J105 ♦ 10984 ♣ Q4
South (YOU): ♠ KJ84 ♥ A963 ♦ K72 ♣ 85
West: ♠ Q7 ♥ 72 ♦ J53 ♣ AJ10962

Auction so far:
N: 1NT (15-17 HCP, balanced)
E: Pass
S: ? (Your turn)

Teaching: Use Stayman (2♣) to find 4-4 major fit
Optimal: 4♥ by N

What should South bid? Respond ONLY with valid JSON:
{"bid": "2C", "reasoning": "With 10 HCP and both 4-card majors, use Stayman to find our 4-4 heart fit"}

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
            print(f"❌ Model loading (cold start) - try again in 20 seconds")
            return None
        
        response.raise_for_status()
        result = response.json()
        
        # Extract text
        if isinstance(result, list) and len(result) > 0:
            text = result[0].get('generated_text', '')
        else:
            text = result.get('generated_text', '')
        
        print(f"⏱️  Response time: {elapsed:.2f}s")
        print(f"📝 Raw output:\n{text}\n")
        
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
                is_correct = bid in ['2C', '2♣']
                
                print(f"✅ Bid: {bid}")
                print(f"💭 Reasoning: {reasoning}")
                print(f"🎯 Correct: {'YES ✓' if is_correct else 'NO ✗'}")
                
                return {
                    'model': model_name,
                    'bid': bid,
                    'correct': is_correct,
                    'time': elapsed,
                    'reasoning': reasoning
                }
            else:
                print(f"❌ Could not find JSON in response")
                return None
        except json.JSONDecodeError as e:
            print(f"❌ JSON parse error: {e}")
            return None
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return None

def main():
    print("🃏 SLAM Bridge - Small Model Test")
    print("Testing bridge bidding quality across model sizes\n")
    
    if HF_API_KEY == "hf_your_key_here":
        print("⚠️  Please set your HuggingFace API key in the script!")
        return
    
    results = []
    
    for model_name, model_id in MODELS.items():
        result = test_model(model_name, model_id)
        if result:
            results.append(result)
        time.sleep(2)  # Rate limiting
    
    # Summary
    print(f"\n{'='*60}")
    print("📊 RESULTS SUMMARY")
    print(f"{'='*60}")
    print(f"{'Model':<25} {'Bid':<8} {'Correct':<10} {'Time':<10}")
    print(f"{'-'*60}")
    
    for r in results:
        correct_mark = '✓' if r['correct'] else '✗'
        print(f"{r['model']:<25} {r['bid']:<8} {correct_mark:<10} {r['time']:.2f}s")
    
    print(f"\n🎯 Success rate: {sum(1 for r in results if r['correct'])}/{len(results)}")
    print(f"⚡ Avg response time: {sum(r['time'] for r in results)/len(results):.2f}s")
    
    # Recommendation
    correct_models = [r for r in results if r['correct']]
    if correct_models:
        fastest = min(correct_models, key=lambda x: x['time'])
        print(f"\n⭐ Recommendation: {fastest['model']} ({fastest['time']:.2f}s)")

if __name__ == "__main__":
    main()
