const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { SCENARIOS, BIDDING_SYSTEMS } = require('./setup.js');

describe('Hand Evaluation — HCP', () => {
  it('counts HCP for U01 North (should be 18)', () => {
    const hand = SCENARIOS[0].hands.N; // A105, KQ84, AQ6, K73
    const eval_ = evaluateHand(hand, 'sayc');
    // A=4, K=3, Q=2, K=3, A=4, Q=2 = 18? Let's count:
    // S: A=4 -> 4, H: K=3,Q=2 -> 5, D: A=4,Q=2 -> 6, C: K=3 -> 3 = 18
    assert.equal(eval_.hcp, 18);
  });

  it('counts HCP for U01 East (should be 3)', () => {
    const hand = SCENARIOS[0].hands.E; // 9632, J105, 10984, Q4
    const eval_ = evaluateHand(hand, 'sayc');
    // J=1, Q=2 = 3
    assert.equal(eval_.hcp, 3);
  });

  it('counts HCP for U04 South (should be 22)', () => {
    const hand = SCENARIOS[3].hands.S; // A874, A96, AK62, AK
    const eval_ = evaluateHand(hand, 'sayc');
    // S: A=4, H: A=4, D: A=4,K=3, C: A=4,K=3 = 22
    assert.equal(eval_.hcp, 22);
  });

  it('handles hand with zeros (10 cards) correctly', () => {
    const hand = { S: "AKJ1094", H: "K5", D: "Q83", C: "72" };
    const eval_ = evaluateHand(hand, 'sayc');
    assert.equal(eval_.lengths.S, 6); // A K J 10 9 4 = 6 cards
    assert.equal(eval_.lengths.H, 2);
    assert.equal(eval_.lengths.D, 3);
    assert.equal(eval_.lengths.C, 2);
  });
});

describe('Hand Evaluation — Shape', () => {
  it('detects balanced hand (4-3-3-3)', () => {
    const hand = { S: "AK84", H: "Q73", D: "K62", C: "J85" };
    const eval_ = evaluateHand(hand, 'sayc');
    assert.equal(eval_.isBalanced, true);
  });

  it('detects balanced hand (5-3-3-2)', () => {
    const hand = { S: "AK843", H: "Q73", D: "K6", C: "J85" };
    const eval_ = evaluateHand(hand, 'sayc');
    assert.equal(eval_.isBalanced, true);
  });

  it('detects unbalanced hand (6-4-2-1)', () => {
    const hand = { S: "AKJ1094", H: "K532", D: "Q8", C: "7" };
    const eval_ = evaluateHand(hand, 'sayc');
    assert.equal(eval_.isBalanced, false);
  });

  it('identifies longest suit', () => {
    const hand = SCENARIOS[1].hands.S; // Q109764, K5, Q83, 72
    const eval_ = evaluateHand(hand, 'sayc');
    assert.equal(eval_.longestSuit, 'S');
    assert.equal(eval_.longestLen, 6);
  });
});

describe('Hand Evaluation — Length Points', () => {
  it('adds length points in SAYC for 6-card suit', () => {
    const hand = { S: "AKJ1094", H: "K5", D: "Q83", C: "72" };
    const eval_ = evaluateHand(hand, 'sayc');
    assert.equal(eval_.totalPoints, eval_.hcp + 2); // 6-card suit = +2
  });

  it('does NOT add length points in ACOL', () => {
    const hand = { S: "AKJ1094", H: "K5", D: "Q83", C: "72" };
    const eval_ = evaluateHand(hand, 'acol');
    assert.equal(eval_.totalPoints, eval_.hcp);
  });
});

describe('Hand Evaluation — Stoppers', () => {
  it('Ace is always a stopper', () => {
    const hand = { S: "A", H: "KQ84", D: "AQ6", C: "K73852" };
    const eval_ = evaluateHand(hand, 'sayc');
    assert.equal(eval_.hasStopper('S'), true);
  });

  it('Kx is a stopper', () => {
    const hand = { S: "K5", H: "AQ84", D: "AQ6", C: "K7385" };
    const eval_ = evaluateHand(hand, 'sayc');
    assert.equal(eval_.hasStopper('S'), true);
  });

  it('singleton K is NOT a stopper', () => {
    const hand = { S: "K", H: "AQ843", D: "AQ62", C: "K738" };
    const eval_ = evaluateHand(hand, 'sayc');
    assert.equal(eval_.hasStopper('S'), false);
  });

  it('Qxx is a stopper', () => {
    const hand = { S: "Q73", H: "AK84", D: "AQ6", C: "K85" };
    const eval_ = evaluateHand(hand, 'sayc');
    assert.equal(eval_.hasStopper('S'), true);
  });
});
