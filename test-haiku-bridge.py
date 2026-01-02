#!/usr/bin/env python3
"""
Test Claude Haiku's understanding of bridge conventions
This tests the AI model directly without game complexity
"""

import requests
import os
import json

ANTHROPIC_API_KEY = os.environ.get('ANTHROPIC_API_KEY', '')

def test_stayman_response():
    """Test if Haiku understands Stayman responses"""
    
    prompt = """You are North playing bridge.

Your hand: Spades: A105, Hearts: KQ84, Diamonds: AQ6, Clubs: K73

The auction so far:
- You (North) opened: 1NT
- East passed
- South (your partner) bid: 2♣ (Stayman - asking if you have a 4-card major)
- West passed

What should you bid next?

RULES:
After partner's Stayman (2♣), you respond:
- 2♦ = No 4-card major
- 2♥ = I have 4+ hearts
- 2♠ = I have 4 spades (no 4 hearts)

Respond with ONLY valid JSON:
{"bid": "2H", "reasoning": "Brief explanation"}"""

    print("\n" + "="*60)
    print("TEST 1: Stayman Response")
    print("="*60)
    print("Your hand has 4 hearts (KQ84)")
    print("Partner bid 2♣ (Stayman)")
    print("Correct answer: 2♥ (showing 4 hearts)")
    print("\nAsking Haiku...")
    
    response = requests.post(
        "https://api.anthropic.com/v1/messages",
        headers={
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
        json={
            "model": "claude-3-5-haiku-20241022",
            "max_tokens": 500,
            "messages": [{"role": "user", "content": prompt}]
        }
    )
    
    if response.status_code != 200:
        print(f"ERROR: API returned {response.status_code}")
        return False
    
    data = response.json()
    text = data['content'][0]['text']
    
    print(f"\nHaiku's response:\n{text}")
    
    # Try to parse JSON
    try:
        clean = text.replace('```json', '').replace('```', '').strip()
        result = json.loads(clean)
        bid = result.get('bid', '').upper()
        reasoning = result.get('reasoning', '')
        
        print(f"\nParsed bid: {bid}")
        print(f"Reasoning: {reasoning}")
        
        if bid == "2H":
            print("\n✅ CORRECT! Haiku bid 2♥ (showing 4 hearts)")
            return True
        else:
            print(f"\n❌ WRONG! Haiku bid {bid} instead of 2♥")
            if "transfer" in reasoning.lower():
                print("   ERROR: Reasoning mentions 'transfer' - confused with Jacoby!")
            return False
    except Exception as e:
        print(f"\n❌ ERROR parsing response: {e}")
        return False


def test_transfer_vs_stayman():
    """Test if Haiku can distinguish transfers from Stayman"""
    
    prompt = """You are South playing bridge.

Partner (North) opened 1NT.

Question 1: You have 6 spades and want partner to bid 2♠. What do you bid?
A) 2♠ (direct)
B) 2♥ (Jacoby transfer to spades)
C) 2♣ (Stayman)

Question 2: You have 4 spades and 4 hearts, asking if partner has a 4-card major. What do you bid?
A) 2♠ (direct)
B) 2♥ (Jacoby transfer)
C) 2♣ (Stayman)

Respond with ONLY valid JSON:
{"q1": "B", "q2": "C", "explanation": "Brief explanation"}"""

    print("\n" + "="*60)
    print("TEST 2: Transfer vs Stayman Distinction")
    print("="*60)
    print("Q1: With 6 spades, bid 2♥ (transfer)")
    print("Q2: With 4-4 majors, bid 2♣ (Stayman)")
    print("Correct answers: Q1=B, Q2=C")
    print("\nAsking Haiku...")
    
    response = requests.post(
        "https://api.anthropic.com/v1/messages",
        headers={
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
        json={
            "model": "claude-3-5-haiku-20241022",
            "max_tokens": 500,
            "messages": [{"role": "user", "content": prompt}]
        }
    )
    
    if response.status_code != 200:
        print(f"ERROR: API returned {response.status_code}")
        return False
    
    data = response.json()
    text = data['content'][0]['text']
    
    print(f"\nHaiku's response:\n{text}")
    
    try:
        clean = text.replace('```json', '').replace('```', '').strip()
        result = json.loads(clean)
        q1 = result.get('q1', '').upper()
        q2 = result.get('q2', '').upper()
        
        print(f"\nQ1 answer: {q1} (correct: B)")
        print(f"Q2 answer: {q2} (correct: C)")
        
        correct = (q1 == "B" and q2 == "C")
        
        if correct:
            print("\n✅ CORRECT! Haiku understands the difference!")
            return True
        else:
            print(f"\n❌ WRONG! Haiku confused transfers and Stayman")
            return False
    except Exception as e:
        print(f"\n❌ ERROR parsing response: {e}")
        return False


def test_partnership_understanding():
    """Test if Haiku understands partnerships"""
    
    prompt = """You are East playing bridge.

The auction so far:
- North opened: 1NT
- You (East) are next to bid

Question: Who is your partner?
A) North
B) South  
C) West

Respond with ONLY valid JSON:
{"answer": "C", "explanation": "Brief explanation"}"""

    print("\n" + "="*60)
    print("TEST 3: Partnership Understanding")
    print("="*60)
    print("East's partner is West (E-W partnership)")
    print("Correct answer: C (West)")
    print("\nAsking Haiku...")
    
    response = requests.post(
        "https://api.anthropic.com/v1/messages",
        headers={
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
        json={
            "model": "claude-3-5-haiku-20241022",
            "max_tokens": 500,
            "messages": [{"role": "user", "content": prompt}]
        }
    )
    
    if response.status_code != 200:
        print(f"ERROR: API returned {response.status_code}")
        return False
    
    data = response.json()
    text = data['content'][0]['text']
    
    print(f"\nHaiku's response:\n{text}")
    
    try:
        clean = text.replace('```json', '').replace('```', '').strip()
        result = json.loads(clean)
        answer = result.get('answer', '').upper()
        
        print(f"\nAnswer: {answer} (correct: C)")
        
        if answer == "C":
            print("\n✅ CORRECT! Haiku understands partnerships")
            return True
        else:
            print(f"\n❌ WRONG! Haiku doesn't understand partnerships")
            return False
    except Exception as e:
        print(f"\n❌ ERROR parsing response: {e}")
        return False


def main():
    if not ANTHROPIC_API_KEY:
        print("ERROR: ANTHROPIC_API_KEY not set!")
        print("Export it first: export ANTHROPIC_API_KEY=sk-ant-...")
        return
    
    print("\n" + "="*60)
    print("CLAUDE HAIKU BRIDGE CONVENTION TEST SUITE")
    print("="*60)
    print("\nTesting if Claude Haiku can reliably handle bridge conventions")
    print("without the complexity of the full game context.")
    
    results = []
    
    # Run tests
    results.append(("Stayman Response", test_stayman_response()))
    results.append(("Transfer vs Stayman", test_transfer_vs_stayman()))
    results.append(("Partnership Understanding", test_partnership_understanding()))
    
    # Summary
    print("\n" + "="*60)
    print("TEST RESULTS SUMMARY")
    print("="*60)
    
    for name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status}: {name}")
    
    passed_count = sum(1 for _, p in results if p)
    total_count = len(results)
    
    print(f"\nPassed: {passed_count}/{total_count}")
    
    if passed_count == total_count:
        print("\n✅ VERDICT: Haiku CAN handle bridge conventions!")
        print("   The problem might be in how we're prompting it in the game.")
    elif passed_count == 0:
        print("\n❌ VERDICT: Haiku CANNOT handle bridge conventions reliably.")
        print("   You may need to use Sonnet or pre-script the auctions.")
    else:
        print("\n⚠️  VERDICT: Haiku is INCONSISTENT with bridge conventions.")
        print("   It understands some concepts but not others reliably.")
    
    print("\n" + "="*60)
    print("COST COMPARISON (if we need to switch to Sonnet):")
    print("="*60)
    print("Haiku:  $0.25/1M input + $1.25/1M output")
    print("Sonnet: $3.00/1M input + $15.00/1M output")
    print("\nPer request (avg 1K input, 200 output):")
    print("  Haiku:  ~$0.00050")
    print("  Sonnet: ~$0.00600 (12x more expensive)")
    print("\nFor 100 requests/day:")
    print("  Haiku:  $1.50/month")
    print("  Sonnet: $18/month")
    print("\nFor 1000 requests/day:")
    print("  Haiku:  $15/month")
    print("  Sonnet: $180/month")


if __name__ == "__main__":
    main()
