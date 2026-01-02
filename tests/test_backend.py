"""
Tests for SLAM Bridge Backend
Run with: pytest tests/
"""

import pytest
import json
import sys
import os

# Add parent directory to path so we can import slam-backend
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Import from slam-backend.py
import importlib.util
spec = importlib.util.spec_from_file_location("slam_backend", "slam-backend.py")
slam_backend = importlib.util.module_from_spec(spec)
spec.loader.exec_module(slam_backend)
app = slam_backend.app

@pytest.fixture
def client():
    """Create test client"""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_homepage(client):
    """Test homepage loads"""
    response = client.get('/')
    assert response.status_code == 200
    assert b'SLAM' in response.data

def test_bridge_101(client):
    """Test Bridge 101 page loads"""
    response = client.get('/bridge-101')
    assert response.status_code == 200
    assert b'What is Bridge' in response.data

def test_single_mode(client):
    """Test Single Decision mode loads"""
    response = client.get('/single')
    assert response.status_code == 200

def test_full_mode(client):
    """Test Full Auction mode loads"""
    response = client.get('/full')
    assert response.status_code == 200

def test_health_endpoint(client):
    """Test health check endpoint"""
    response = client.get('/health')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['status'] == 'ok'

def test_api_bid_without_key(client):
    """Test API returns error without API key"""
    import os
    
    # Skip test if API key is set (can't test "no key" scenario when key exists)
    if os.environ.get('ANTHROPIC_API_KEY'):
        pytest.skip('Cannot test no-key scenario when ANTHROPIC_API_KEY is set')
    
    response = client.post('/api/bid',
        data=json.dumps({'prompt': 'test'}),
        content_type='application/json'
    )
    
    assert response.status_code == 500
    data = json.loads(response.data)
    assert 'error' in data

def test_api_bid_with_key(client):
    """Test API endpoint with key set"""
    import os
    
    # Skip if no API key in environment
    if not os.environ.get('ANTHROPIC_API_KEY'):
        pytest.skip('ANTHROPIC_API_KEY not set')
    
    response = client.post('/api/bid',
        data=json.dumps({'prompt': 'Say "test"'}),
        content_type='application/json'
    )
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'content' in data
