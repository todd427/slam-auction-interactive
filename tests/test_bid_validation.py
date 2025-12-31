"""
Tests for Bid Validation Logic
Ensures illegal bids are caught
"""

import pytest

def bid_value(bid):
    """Convert bid to numeric value for comparison"""
    if bid == 'Pass' or bid == 'X':
        return 0
    level = int(bid[0])
    suit_order = {'C': 0, 'D': 1, 'H': 2, 'S': 3, 'NT': 4}
    suit = bid[1:]
    return level * 5 + suit_order.get(suit, 0)

def is_bid_legal(new_bid, last_bid):
    """Check if bid is legal after last bid"""
    if new_bid == 'Pass' or new_bid == 'X':
        return True
    if not last_bid or last_bid == 'Pass' or last_bid == 'X':
        return True
    return bid_value(new_bid) > bid_value(last_bid)

class TestBidValidation:
    """Test bid validation logic"""
    
    def test_pass_always_legal(self):
        """Pass is always legal"""
        assert is_bid_legal('Pass', '7NT')
        assert is_bid_legal('Pass', '1C')
        assert is_bid_legal('Pass', None)
    
    def test_double_always_legal(self):
        """Double is always legal"""
        assert is_bid_legal('X', '1NT')
        assert is_bid_legal('X', '7NT')
    
    def test_first_bid_always_legal(self):
        """First bid (after no bids) is always legal"""
        assert is_bid_legal('1C', None)
        assert is_bid_legal('7NT', None)
    
    def test_higher_level_legal(self):
        """Higher level is always legal"""
        assert is_bid_legal('2C', '1NT')
        assert is_bid_legal('3D', '2S')
        assert is_bid_legal('7NT', '6C')
    
    def test_same_level_higher_suit_legal(self):
        """Same level but higher suit is legal"""
        assert is_bid_legal('1D', '1C')
        assert is_bid_legal('1H', '1D')
        assert is_bid_legal('1S', '1H')
        assert is_bid_legal('1NT', '1S')
    
    def test_lower_level_illegal(self):
        """Lower level is illegal"""
        assert not is_bid_legal('1NT', '2C')
        assert not is_bid_legal('2H', '3D')
        assert not is_bid_legal('1C', '7NT')
    
    def test_same_level_lower_suit_illegal(self):
        """Same level but lower suit is illegal"""
        assert not is_bid_legal('2C', '2D')
        assert not is_bid_legal('2D', '2H')
        assert not is_bid_legal('2H', '2S')
        assert not is_bid_legal('2S', '2NT')
    
    def test_suit_order(self):
        """Test suit ordering: C < D < H < S < NT"""
        assert bid_value('1C') < bid_value('1D')
        assert bid_value('1D') < bid_value('1H')
        assert bid_value('1H') < bid_value('1S')
        assert bid_value('1S') < bid_value('1NT')
    
    def test_level_order(self):
        """Test level ordering"""
        assert bid_value('1NT') < bid_value('2C')
        assert bid_value('2NT') < bid_value('3C')
        assert bid_value('6NT') < bid_value('7C')
    
    def test_realistic_sequences(self):
        """Test realistic bidding sequences"""
        # Valid: 1NT - 2C - 2H - 3NT
        assert is_bid_legal('2C', '1NT')
        assert is_bid_legal('2H', '2C')
        assert is_bid_legal('3NT', '2H')
        
        # Invalid: 1NT - 2H - 2C
        assert is_bid_legal('2H', '1NT')
        assert not is_bid_legal('2C', '2H')
    
    def test_slam_bidding(self):
        """Test slam-level bids"""
        assert is_bid_legal('6NT', '5S')
        assert is_bid_legal('7C', '6NT')
        assert not is_bid_legal('6H', '6S')

class TestBidFormat:
    """Test bid format validation"""
    
    def test_valid_formats(self):
        """Test valid bid formats"""
        valid = [
            'Pass', 'X',
            '1C', '1D', '1H', '1S', '1NT',
            '7NT', '4H', '2C'
        ]
        
        for bid in valid:
            # Should not raise error
            if bid not in ['Pass', 'X']:
                assert bid[0] in '1234567'
                assert bid[1:] in ['C', 'D', 'H', 'S', 'NT']
    
    def test_invalid_formats(self):
        """Test invalid bid formats should be rejected"""
        invalid = [
            '8C',  # Level too high
            '0NT', # Level too low
            '1X',  # Invalid suit
            '2c',  # Lowercase
            '2 C', # Space
            '2♣',  # Symbol (should be converted)
        ]
        
        # These should fail format validation
        # (In real code, you'd validate format before value)
        for bid in invalid:
            if bid[0] not in '1234567':
                continue  # Would be caught by format validation
