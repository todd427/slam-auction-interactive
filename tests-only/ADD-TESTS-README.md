# Add Tests to Your Project

## 🚀 Quick Setup (2 minutes):

### 1. Add test dependencies to requirements.txt:

Add these lines to your existing `requirements.txt`:

```
pytest==7.4.3
pytest-flask==1.3.0
```

### 2. Copy these files to your project:

```
Your Project Directory/
├── slam-backend.py          # ✅ Already exists
├── tests/                   # ← Copy this folder
│   ├── test_backend.py
│   ├── test_scenarios.py
│   └── test_bid_validation.py
└── pytest.ini               # ← Copy this file
```

### 3. Install and run:

```bash
pip install pytest pytest-flask
pytest
```

That's it! ✅

---

## 📋 What Gets Tested:

- ✅ Backend routes (/, /single, /full, /bridge-101)
- ✅ API endpoints work
- ✅ Health check responds
- ✅ Bid validation logic
- ✅ Scenario formats
- ✅ Teaching points present

**Total: 19 tests**

---

## 🎯 Common Commands:

```bash
# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest tests/test_backend.py

# Run with coverage
pytest --cov=. --cov-report=html
```

---

## 🔧 Troubleshooting:

**"ModuleNotFoundError: No module named 'pytest'"**
```bash
pip install pytest pytest-flask
```

**Tests can't find slam-backend.py**
- Make sure you run `pytest` from your project root (where slam-backend.py is)

**API tests fail without key**
- Tests will skip API tests if ANTHROPIC_API_KEY isn't set
- That's OK! Other tests still run

---

## ✅ Next Steps:

1. Copy `tests/` folder to your project
2. Copy `pytest.ini` to your project
3. Add pytest to requirements.txt
4. Run `pytest`
5. Push to GitHub (tests auto-run via GitHub Actions if you add .github/workflows/ci.yml)

---

**That's it! Now you have automated testing on your real code.** 🎉
