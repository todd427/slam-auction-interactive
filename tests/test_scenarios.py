"""
Tests for Bridge Scenarios
Validates that correct answers make sense
"""

import pytest
import re

# Parse scenarios from HTML (simplified - in real setup, extract to JSON)
SINGLE_SCENARIOS = [
    {
        "id": "S01",
        "correct": "2C",
        "alternatives": [],
        "teaching": "Use Stayman (2♣) to find 4-4 major fit",
        "opening": "1NT"
    },
    {
        "id": "S02",
        "correct": "2H",
        "alternatives": [],
        "teaching": "Transfer to spades with 2♥",
        "opening": "1NT"
    },
    # Add more as needed
]

def test_bid_format():
    """Test all bids follow correct format"""
    valid_bids = [
        'Pass', 'X',
        '1C', '1D', '1H', '1S', '1NT',
        '2C', '2D', '2H', '2S', '2NT',
        '3C', '3D', '3H', '3S', '3NT',
        '4C', '4D', '4H', '4S', '4NT',
        '5C', '5D', '5H', '5S', '5NT',
        '6C', '6D', '6H', '6S', '6NT',
        '7C', '7D', '7H', '7S', '7NT'
    ]
    
    for scenario in SINGLE_SCENARIOS:
        assert scenario['correct'] in valid_bids, \
            f"Scenario {scenario['id']}: Invalid bid format {scenario['correct']}"
        
        for alt in scenario['alternatives']:
            assert alt in valid_bids, \
                f"Scenario {scenario['id']}: Invalid alternative {alt}"

def test_teaching_points_present():
    """Test all scenarios have teaching points"""
    for scenario in SINGLE_SCENARIOS:
        assert len(scenario['teaching']) > 10, \
            f"Scenario {scenario['id']}: Teaching point too short"

def test_stayman_response():
    """Test Stayman scenarios have 2C as answer"""
    for scenario in SINGLE_SCENARIOS:
        if 'Stayman' in scenario['teaching']:
            assert scenario['correct'] == '2C', \
                f"Scenario {scenario['id']}: Stayman should be 2C"

def test_transfer_bids():
    """Test transfer scenarios follow convention"""
    transfers = {
        'spades': '2H',  # Transfer to spades
        'hearts': '2D'   # Transfer to hearts
    }
    
    for scenario in SINGLE_SCENARIOS:
        if 'Transfer' in scenario['teaching']:
            teaching_lower = scenario['teaching'].lower()
            if 'spades' in teaching_lower:
                assert scenario['correct'] == '2H', \
                    f"Scenario {scenario['id']}: Spade transfer should be 2H"
            elif 'hearts' in teaching_lower:
                assert scenario['correct'] == '2D', \
                    f"Scenario {scenario['id']}: Heart transfer should be 2D"

def test_no_duplicate_scenarios():
    """Test no duplicate scenario IDs"""
    ids = [s['id'] for s in SINGLE_SCENARIOS]
    assert len(ids) == len(set(ids)), "Duplicate scenario IDs found"

def test_bid_higher_than_opening():
    """Test response bids are legal after opening"""
    def bid_value(bid):
        if bid == 'Pass' or bid == 'X':
            return 0
        level = int(bid[0])
        suit_order = {'C': 0, 'D': 1, 'H': 2, 'S': 3, 'NT': 4}
        suit = bid[1:] if len(bid) > 1 else 'NT'
        return level * 5 + suit_order.get(suit, 0)
    
    for scenario in SINGLE_SCENARIOS:
        opening = scenario['opening']
        correct = scenario['correct']
        
        if correct != 'Pass' and correct != 'X':
            assert bid_value(correct) > bid_value(opening), \
                f"Scenario {scenario['id']}: Bid {correct} not higher than {opening}"
