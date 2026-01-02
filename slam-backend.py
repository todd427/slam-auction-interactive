#!/usr/bin/env python3
"""
Simple Flask backend to proxy Claude API calls for SLAM Auction.
This avoids CORS issues when running locally.

Usage:
  python slam-backend.py

Then open slam-auction-interactive.html in your browser.
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import requests
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# You can set this as an environment variable or hardcode it (less secure)
ANTHROPIC_API_KEY = os.environ.get('ANTHROPIC_API_KEY', '')

@app.route('/')
def index():
    """Serve the main landing page with mode selection."""
    return send_file('index.html')

@app.route('/bridge-101')
def bridge_101():
    """Serve the beginner's guide to bridge."""
    return send_file('bridge-101.html')

@app.route('/conventions')
def conventions():
    """Serve the conventions guide."""
    return send_file('conventions.html')

@app.route('/single')
def single():
    """Serve the single-decision version."""
    return send_file('slam-auction-single.html')

@app.route('/full')
def full():
    """Serve the full multi-turn auction version."""
    return send_file('slam-auction-full.html')

@app.route('/api/bid', methods=['POST'])
def get_bid():
    """
    Proxy endpoint for Claude API calls.
    
    Set CLAUDE_MODEL env variable to choose:
    - 'haiku' (default): claude-3-5-haiku-20241022 - $1.50/mo for 100 req/day
    - 'sonnet': claude-sonnet-4-20250514 - $18/mo for 100 req/day
    """
    if not ANTHROPIC_API_KEY:
        return jsonify({
            'error': 'ANTHROPIC_API_KEY not set. Set it as an environment variable.'
        }), 500
    
    # Choose model based on environment variable
    model_choice = os.environ.get('CLAUDE_MODEL', 'haiku').lower()
    if model_choice == 'sonnet':
        model = 'claude-sonnet-4-20250514'
    else:
        model = 'claude-3-5-haiku-20241022'
    
    try:
        data = request.json
        prompt = data.get('prompt', '')
        
        response = requests.post(
            'https://api.anthropic.com/v1/messages',
            headers={
                'Content-Type': 'application/json',
                'x-api-key': ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            json={
                'model': model,
                'max_tokens': 300,
                'messages': [
                    {'role': 'user', 'content': prompt}
                ]
            }
        )
        
        response.raise_for_status()
        return jsonify(response.json())
        
    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({'status': 'ok', 'api_key_set': bool(ANTHROPIC_API_KEY)})

if __name__ == '__main__':
    if not ANTHROPIC_API_KEY:
        print("\n⚠️  WARNING: ANTHROPIC_API_KEY not set!")
        print("Set it with: export ANTHROPIC_API_KEY='your-key-here'\n")
    else:
        print(f"\n✓ API Key configured (length: {len(ANTHROPIC_API_KEY)})\n")
    
    port = int(os.environ.get('PORT', 5000))
    print(f"Starting SLAM Bridge backend on port {port}")
    print("Make sure to install dependencies: pip install flask flask-cors requests\n")
    app.run(debug=False, host='0.0.0.0', port=port)
