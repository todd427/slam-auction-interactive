"""
HuggingFace Inference API Backend for SLAM Bridge
Replace the /api/bid endpoint in slam-backend.py with this
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import requests
import json
import os

app = Flask(__name__)
CORS(app)

# HuggingFace Setup
HF_API_KEY = os.environ.get('HUGGINGFACE_API_KEY', 'your-hf-api-key-here')

# MODEL SELECTION - Choose based on your needs:
# 
# RECOMMENDED FOR SLAM BRIDGE:
# Qwen 2.5 3B - Best quality/speed balance for 3B ⭐
HF_API_URL = "https://api-inference.huggingface.co/models/Qwen/Qwen2.5-3B-Instruct"
#
# OTHER 3B OPTIONS:
# HF_API_URL = "https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-3B-Instruct"
# HF_API_URL = "https://api-inference.huggingface.co/models/microsoft/Phi-3-mini-4k-instruct"
#
# ULTRA TINY (may struggle):
# HF_API_URL = "https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-1B-Instruct"
#
# LARGER (better quality, slower):
# HF_API_URL = "https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3.1-8B-Instruct"
# HF_API_URL = "https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3.1-70B-Instruct"
# HF_API_URL = "https://api-inference.huggingface.co/models/Qwen/Qwen2.5-72B-Instruct"

@app.route('/api/bid', methods=['POST'])
def get_bid():
    """
    Get AI bid decision using HuggingFace Inference API
    """
    try:
        data = request.json
        prompt = data.get('prompt', '')
        
        # Call HuggingFace API
        headers = {
            "Authorization": f"Bearer {HF_API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": 500,
                "temperature": 0.7,
                "top_p": 0.9,
                "return_full_text": False
            }
        }
        
        response = requests.post(
            HF_API_URL,
            headers=headers,
            json=payload,
            timeout=30
        )
        
        if response.status_code == 503:
            # Model is loading (cold start)
            return jsonify({
                "error": "Model loading, please try again in 20 seconds",
                "retry": True
            }), 503
        
        response.raise_for_status()
        result = response.json()
        
        # Extract generated text
        if isinstance(result, list) and len(result) > 0:
            generated_text = result[0].get('generated_text', '')
        else:
            generated_text = result.get('generated_text', '')
        
        # Try to parse JSON from response
        try:
            # Look for JSON in the response
            json_start = generated_text.find('{')
            json_end = generated_text.rfind('}') + 1
            if json_start >= 0 and json_end > json_start:
                json_str = generated_text[json_start:json_end]
                bid_data = json.loads(json_str)
                return jsonify(bid_data)
            else:
                # Fallback: extract bid and reasoning
                return jsonify({
                    "bid": "Pass",
                    "reasoning": "Unable to parse AI response"
                })
        except json.JSONDecodeError:
            # Fallback to Pass
            return jsonify({
                "bid": "Pass",
                "reasoning": "AI response parsing failed"
            })
            
    except requests.exceptions.Timeout:
        return jsonify({
            "error": "Request timeout - model may be loading",
            "bid": "Pass",
            "reasoning": "Timeout"
        }), 408
        
    except Exception as e:
        print(f"Error getting bid: {str(e)}")
        return jsonify({
            "error": str(e),
            "bid": "Pass",
            "reasoning": "Error occurred"
        }), 500

# Keep your existing routes
@app.route('/')
def index():
    return send_file('index.html')

@app.route('/bridge-101')
def bridge_101():
    return send_file('bridge-101.html')

@app.route('/single')
def single():
    return send_file('slam-auction-single.html')

@app.route('/full')
def full():
    return send_file('slam-auction-full.html')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
