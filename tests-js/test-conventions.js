const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { SCENARIOS } = require('./setup.js');

describe('Stayman Response', () => {
  it('U01: North responds 2H to Stayman (has KQ84 in hearts)', () => {
    const scen = SCENARIOS[0]; // U01
    // Auction: N opens 1NT, E passes, S bids 2C (Stayman)
    const auction = [
      { seat: 'N', bid: '1NT', reasoning: 'Opening' },
      { seat: 'E', bid: 'Pass', reasoning: 'Pass' },
      { seat: 'S', bid: '2C', reasoning: 'Stayman' },
      { seat: 'W', bid: 'Pass', reasoning: 'Pass' },
    ];
    const result = getRuleBid('N', scen.hands, auction, 'sayc', scen.conventions);
    assert.equal(result.bid, '2H', `Expected 2H but got ${result.bid}: ${result.reasoning}`);
  });

  it('responds 2D when opener has no 4-card major', () => {
    const hands = {
      N: { S: "AK5", H: "Q73", D: "KQ6", C: "K852" },
      E: { S: "963", H: "J105", D: "10984", C: "Q4" },
      S: { S: "QJ84", H: "A963", D: "72", C: "A73" },
      W: { S: "1072", H: "K842", D: "AJ53", C: "J10" }
    };
    const auction = [
      { seat: 'N', bid: '1NT', reasoning: 'Opening' },
      { seat: 'E', bid: 'Pass', reasoning: 'Pass' },
      { seat: 'S', bid: '2C', reasoning: 'Stayman' },
      { seat: 'W', bid: 'Pass', reasoning: 'Pass' },
    ];
    const result = getRuleBid('N', hands, auction, 'sayc', ['stayman']);
    assert.equal(result.bid, '2D', `Expected 2D but got ${result.bid}: ${result.reasoning}`);
  });

  it('responds 2S when opener has 4 spades but not 4 hearts', () => {
    const hands = {
      N: { S: "AK54", H: "Q73", D: "KQ6", C: "K85" },
      E: { S: "963", H: "J105", D: "10984", C: "Q42" },
      S: { S: "QJ8", H: "A963", D: "72", C: "A73" },  // not used
      W: { S: "1072", H: "K842", D: "AJ53", C: "J106" }
    };
    const auction = [
      { seat: 'N', bid: '1NT', reasoning: 'Opening' },
      { seat: 'E', bid: 'Pass', reasoning: 'Pass' },
      { seat: 'S', bid: '2C', reasoning: 'Stayman' },
      { seat: 'W', bid: 'Pass', reasoning: 'Pass' },
    ];
    const result = getRuleBid('N', hands, auction, 'sayc', ['stayman']);
    assert.equal(result.bid, '2S', `Expected 2S but got ${result.bid}: ${result.reasoning}`);
  });
});

describe('Transfer Completion', () => {
  it('U02: North completes transfer to spades (2H → 2S)', () => {
    const scen = SCENARIOS[1]; // U02
    const auction = [
      { seat: 'N', bid: '1NT', reasoning: 'Opening' },
      { seat: 'E', bid: 'Pass', reasoning: 'Pass' },
      { seat: 'S', bid: '2H', reasoning: 'Transfer to spades' },
      { seat: 'W', bid: 'Pass', reasoning: 'Pass' },
    ];
    const result = getRuleBid('N', scen.hands, auction, 'sayc', scen.conventions);
    assert.equal(result.bid, '2S', `Expected 2S but got ${result.bid}: ${result.reasoning}`);
  });

  it('completes transfer to hearts (2D → 2H)', () => {
    const scen = SCENARIOS[1];
    const auction = [
      { seat: 'N', bid: '1NT', reasoning: 'Opening' },
      { seat: 'E', bid: 'Pass', reasoning: 'Pass' },
      { seat: 'S', bid: '2D', reasoning: 'Transfer to hearts' },
      { seat: 'W', bid: 'Pass', reasoning: 'Pass' },
    ];
    const result = getRuleBid('N', scen.hands, auction, 'sayc', scen.conventions);
    assert.equal(result.bid, '2H', `Expected 2H but got ${result.bid}: ${result.reasoning}`);
  });
});

describe('Responding to Takeout Double', () => {
  it('D01: North responds to partner\'s takeout double', () => {
    const scen = SCENARIOS[10]; // D01
    // E opens 1D, S doubles, W passes, N must respond
    const auction = [
      { seat: 'E', bid: '1D', reasoning: 'Opening' },
      { seat: 'S', bid: 'X', reasoning: 'Takeout double' },
      { seat: 'W', bid: 'Pass', reasoning: 'Pass' },
    ];
    const result = getRuleBid('N', scen.hands, auction, 'sayc', []);
    // N has K1093/Q73/Q852/K4 — should bid spades (best unbid major)
    assert.ok(result.bid !== 'Pass', `North should bid, not pass: ${result.reasoning}`);
    assert.ok(
      result.bid.endsWith('S') || result.bid.endsWith('H'),
      `Expected a major suit bid but got ${result.bid}: ${result.reasoning}`
    );
  });
});

describe('Opener Rebid', () => {
  it('U05: South accepts 3S invitation with 15 HCP', () => {
    const scen = SCENARIOS[4]; // U05: dealer S, user N
    // S opens 1S, W passes, N (user) bids 3S, E passes
    const auction = [
      { seat: 'S', bid: '1S', reasoning: 'Opening' },
      { seat: 'W', bid: 'Pass', reasoning: 'Pass' },
      { seat: 'N', bid: '3S', reasoning: 'Invitational' },
      { seat: 'E', bid: 'Pass', reasoning: 'Pass' },
    ];
    const result = getRuleBid('S', scen.hands, auction, 'sayc', []);
    // S has AQ732/K4/AK5/J64 = 16 HCP — should accept and bid 4S
    assert.equal(result.bid, '4S', `Expected 4S but got ${result.bid}: ${result.reasoning}`);
  });
});
