"""
SLAM Bridge Backend - Groq Integration
FREE, FAST AI inference using Groq
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from groq import Groq
import json
import os

app = Flask(__name__)
CORS(app)

# Groq Setup - FREE and FAST!
GROQ_API_KEY = os.environ.get('GROQ_API_KEY', 'your-groq-key-here')
client = Groq(api_key=GROQ_API_KEY)

# Choose your model:
# "llama-3.1-8b-instant" - Fast, good quality (RECOMMENDED) ⭐
# "llama-3.1-70b-versatile" - Best quality, slower
# "mixtral-8x7b-32768" - Good for long context
# "gemma-7b-it" - Lightweight and fast
MODEL = "llama-3.1-8b-instant"

@app.route('/api/bid', methods=['POST'])
def get_bid():
    """
    Get AI bid decision using Groq
    FREE tier: 14,400 requests per day!
    """
    try:
        data = request.json
        prompt = data.get('prompt', '')
        
        # Call Groq API
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model=MODEL,
            temperature=0.3,
            max_tokens=500,
        )
        
        response_text = chat_completion.choices[0].message.content
        
        # Try to parse JSON from response
        try:
            # Look for JSON in the response
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            if json_start >= 0 and json_end > json_start:
                json_str = response_text[json_start:json_end]
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
                "reasoning": "JSON parsing failed"
            })
            
    except Exception as e:
        print(f"Error getting bid: {str(e)}")
        return jsonify({
            "error": str(e),
            "bid": "Pass",
            "reasoning": "Error occurred"
        }), 500

# Frontend routes
@app.route('/')
def index():
    """Serve the main landing page with mode selection."""
    return send_file('index.html')

@app.route('/bridge-101')
def bridge_101():
    """Serve the beginner's guide to bridge."""
    return send_file('bridge-101.html')

@app.route('/single')
def single():
    """Serve the single-decision version."""
    return send_file('slam-auction-single.html')

@app.route('/full')
def full():
    """Serve the full multi-turn auction version."""
    return send_file('slam-auction-full.html')

if __name__ == '__main__':
    print("🃏 SLAM Bridge Backend")
    print("=" * 50)
    print(f"AI Provider: Groq (FREE)")
    print(f"Model: {MODEL}")
    print(f"Starting server on http://localhost:5000")
    print("=" * 50)
    app.run(debug=True, host='0.0.0.0', port=5000)
