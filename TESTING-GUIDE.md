# Automated Testing Guide

## 🧪 **Running Tests**

### **Local Testing:**

```bash
# Install test dependencies
pip install -r requirements.txt

# Run all tests
pytest

# Run specific test file
pytest tests/test_backend.py

# Run with verbose output
pytest -v

# Run only fast tests (skip slow integration tests)
pytest -m "not slow"
```

---

## **Test Structure:**

```
tests/
├── test_backend.py          # Backend API tests
├── test_scenarios.py        # Scenario validation
└── test_bid_validation.py   # Bid logic tests
```

---

## **What's Tested:**

### **1. Backend Tests (`test_backend.py`)**
- ✅ Homepage loads
- ✅ All routes work (/, /single, /full, /bridge-101)
- ✅ Health endpoint responds
- ✅ API endpoint handles errors correctly
- ✅ API works with valid key

### **2. Scenario Tests (`test_scenarios.py`)**
- ✅ All bids follow correct format
- ✅ Teaching points are present
- ✅ Stayman scenarios use 2♣
- ✅ Transfer bids follow convention
- ✅ No duplicate scenario IDs
- ✅ Responses are legal bids

### **3. Bid Validation Tests (`test_bid_validation.py`)**
- ✅ Pass is always legal
- ✅ Higher bids are legal
- ✅ Lower bids are illegal
- ✅ Suit order correct (C < D < H < S < NT)
- ✅ Level order correct
- ✅ Realistic sequences work

---

## **GitHub Actions (CI)**

Tests run automatically on every push!

### **What Happens:**

1. **On push to main or PR:**
   - GitHub Actions runs
   - Installs dependencies
   - Runs all tests
   - Reports pass/fail

2. **See results:**
   - Go to GitHub repo → Actions tab
   - See green ✅ or red ❌

3. **Badges:**
   Add to README.md:
   ```markdown
   ![Tests](https://github.com/YOUR_USERNAME/slambridge/actions/workflows/ci.yml/badge.svg)
   ```

---

## **Adding New Tests:**

### **1. Create new test file:**

```python
# tests/test_my_feature.py

def test_something():
    """Test description"""
    assert 1 + 1 == 2
```

### **2. Run it:**

```bash
pytest tests/test_my_feature.py
```

### **3. It auto-runs on GitHub!**

---

## **Test Coverage:**

### **Install coverage:**

```bash
pip install pytest-cov
```

### **Run with coverage:**

```bash
pytest --cov=. --cov-report=html
```

### **View report:**

```bash
open htmlcov/index.html
```

Shows which lines are tested/untested!

---

## **Testing Best Practices:**

### **1. Test Naming:**
- ✅ `test_homepage_loads()`
- ✅ `test_bid_validation_rejects_illegal_bids()`
- ❌ `test1()`, `check_stuff()`

### **2. One Assert Per Test:**
```python
# Good
def test_homepage_loads():
    response = client.get('/')
    assert response.status_code == 200

def test_homepage_has_title():
    response = client.get('/')
    assert b'SLAM' in response.data

# Bad
def test_homepage():
    response = client.get('/')
    assert response.status_code == 200
    assert b'SLAM' in response.data
    assert b'Bridge' in response.data
```

### **3. Use Fixtures:**
```python
@pytest.fixture
def sample_hand():
    return {
        'S': 'AKQ',
        'H': 'J1098',
        'D': 'KQ2',
        'C': '543'
    }

def test_hand_has_spades(sample_hand):
    assert 'S' in sample_hand
```

---

## **Integration Tests (Optional):**

Test end-to-end with real AI:

```python
@pytest.mark.slow
@pytest.mark.integration
def test_full_auction_completes():
    """Test complete auction with AI"""
    # This test is slow, marked as integration
    # Run with: pytest -m integration
    pass
```

Run integration tests separately:
```bash
pytest -m integration
```

---

## **Pre-commit Hooks (Optional):**

Run tests before every commit:

```bash
# Install pre-commit
pip install pre-commit

# Create .pre-commit-config.yaml
# (config provided below)

# Install hooks
pre-commit install

# Now tests run automatically on git commit!
```

---

## **Continuous Deployment:**

Add to `.github/workflows/ci.yml`:

```yaml
deploy:
  needs: test  # Only deploy if tests pass
  runs-on: ubuntu-latest
  if: github.ref == 'refs/heads/main'
  
  steps:
  - name: Deploy to Railway
    run: |
      # Railway CLI deployment
      railway up
```

---

## **Common Issues:**

### **Tests fail locally but pass on CI:**
- Different Python versions
- Missing environment variables
- File path issues (use `os.path.join`)

### **Tests pass locally but fail on CI:**
- API key not set in GitHub Secrets
- Network requests blocked
- Timing issues (add `time.sleep()`)

### **Flaky tests:**
- Tests that sometimes pass, sometimes fail
- Usually timing issues
- Fix with proper waits/mocks

---

## **Next Steps:**

1. ✅ Run tests locally: `pytest`
2. ✅ Push to GitHub
3. ✅ Check Actions tab - tests run automatically!
4. ✅ Add test badge to README
5. ✅ Write more tests as you add features

---

## **Test Coverage Goals:**

| Component | Current | Target |
|-----------|---------|--------|
| Backend API | 80% | 90% |
| Bid Validation | 100% | 100% |
| Scenarios | 60% | 80% |
| Frontend | 0% | 50% |

---

**Testing = Confidence to deploy!** 🚀

Every commit is tested automatically. No more "hope it works" deploys!
