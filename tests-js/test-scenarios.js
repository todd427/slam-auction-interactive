const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { SCENARIOS, simulateFullAuction, simulateWithUserBid } = require('./setup.js');

function getBidRank(bid) {
  if (bid === 'Pass' || bid === 'X' || bid === 'XX') return -1;
  const level = parseInt(bid.charAt(0));
  const suitOrder = { C: 0, D: 1, H: 2, S: 3, NT: 4 };
  return level * 5 + (suitOrder[bid.substring(1)] || 0);
}

function assertLegalAuction(auction) {
  let lastContractRank = -1;
  for (const entry of auction) {
    if (entry.bid === 'Pass' || entry.bid === 'X' || entry.bid === 'XX') continue;
    const rank = getBidRank(entry.bid);
    assert.ok(
      rank > lastContractRank,
      `Illegal bid: ${entry.seat} bid ${entry.bid} (rank ${rank}) after last contract rank ${lastContractRank}. Reasoning: ${entry.reasoning}`
    );
    lastContractRank = rank;
  }
}

describe('Full Auction Simulation — SAYC (all 15 scenarios)', () => {
  for (const scen of SCENARIOS) {
    it(`${scen.id}: ${scen.title} — auction terminates`, () => {
      const { auction, terminated } = simulateFullAuction(scen, 'sayc');
      assert.ok(terminated, `Auction did not terminate for ${scen.id}. Last bids: ${auction.slice(-5).map(b => `${b.seat}:${b.bid}`).join(', ')}`);
    });

    it(`${scen.id}: ${scen.title} — all bids legal`, () => {
      const { auction } = simulateFullAuction(scen, 'sayc');
      assertLegalAuction(auction);
    });

    it(`${scen.id}: ${scen.title} — no undefined bids`, () => {
      const { auction } = simulateFullAuction(scen, 'sayc');
      for (const entry of auction) {
        assert.ok(entry.bid, `Undefined bid from ${entry.seat}`);
        assert.ok(entry.reasoning, `Missing reasoning from ${entry.seat}`);
      }
    });
  }
});

describe('Full Auction Simulation — ACOL (all 15 scenarios)', () => {
  for (const scen of SCENARIOS) {
    it(`${scen.id}: ${scen.title} — auction terminates (ACOL)`, () => {
      const { auction, terminated } = simulateFullAuction(scen, 'acol');
      assert.ok(terminated, `Auction did not terminate for ${scen.id} (ACOL). Last bids: ${auction.slice(-5).map(b => `${b.seat}:${b.bid}`).join(', ')}`);
    });

    it(`${scen.id}: ${scen.title} — all bids legal (ACOL)`, () => {
      const { auction } = simulateFullAuction(scen, 'acol');
      assertLegalAuction(auction);
    });
  }
});

describe('Scenario with correct user bid — SAYC', () => {
  for (const scen of SCENARIOS) {
    it(`${scen.id}: auction terminates after user bids ${scen.correct_first_bid}`, () => {
      const { auction, terminated } = simulateWithUserBid(scen, 'sayc', scen.correct_first_bid);
      assert.ok(terminated, `Auction did not terminate for ${scen.id} with user bid ${scen.correct_first_bid}. Last bids: ${auction.slice(-5).map(b => `${b.seat}:${b.bid}`).join(', ')}`);
    });

    it(`${scen.id}: all bids legal after user bids ${scen.correct_first_bid}`, () => {
      const { auction } = simulateWithUserBid(scen, 'sayc', scen.correct_first_bid);
      assertLegalAuction(auction);
    });
  }
});

describe('Specific scenario outcomes — SAYC', () => {
  it('U01: After user bids 2C, North responds showing hearts (Stayman)', () => {
    const scen = SCENARIOS[0];
    const { auction } = simulateWithUserBid(scen, 'sayc', '2C');
    // Find North's first non-pass response after user's 2C
    const userBidIdx = auction.findIndex(b => b.seat === 'S' && b.bid === '2C');
    const northResponse = auction.find((b, i) => i > userBidIdx && b.seat === 'N' && b.bid !== 'Pass');
    assert.ok(northResponse, 'North should bid after Stayman');
    // North has KQ84 in hearts — should bid hearts (level depends on intervention)
    assert.ok(
      northResponse.bid.endsWith('H'),
      `North should bid hearts, got ${northResponse.bid}: ${northResponse.reasoning}`
    );
  });

  it('U02: After user bids 2H (transfer), North completes with 2S', () => {
    const scen = SCENARIOS[1];
    const { auction } = simulateWithUserBid(scen, 'sayc', '2H');
    const userBidIdx = auction.findIndex(b => b.seat === 'S' && b.bid === '2H');
    const northResponse = auction.find((b, i) => i > userBidIdx && b.seat === 'N' && b.bid !== 'Pass');
    assert.ok(northResponse, 'North should complete transfer');
    assert.equal(northResponse.bid, '2S', `North should bid 2S, got ${northResponse.bid}`);
  });

  it('U05: After user bids 3S, South accepts with 4S', () => {
    const scen = SCENARIOS[4];
    const { auction } = simulateWithUserBid(scen, 'sayc', '3S');
    const userBidIdx = auction.findIndex(b => b.seat === 'N' && b.bid === '3S');
    const southResponse = auction.find((b, i) => i > userBidIdx && b.seat === 'S' && b.bid !== 'Pass');
    assert.ok(southResponse, 'South should accept invitation');
    assert.equal(southResponse.bid, '4S', `South should bid 4S, got ${southResponse?.bid}`);
  });
});
