/**
 * Rule-based Bridge Bidding Engine
 * Supports ACOL and SAYC bidding systems.
 * Used by slam-auction-full.html for AI player bids.
 */

(function(global) {
  'use strict';

  // ── Hand Evaluation ──────────────────────────────────────────────

  function evaluateHand(hand, system) {
    const hcpValues = { A: 4, K: 3, Q: 2, J: 1 };
    const suits = { S: hand.S, H: hand.H, D: hand.D, C: hand.C };
    let hcp = 0;
    const lengths = {};
    const honors = {};

    for (const [suit, holding] of Object.entries(suits)) {
      lengths[suit] = countCards(holding);
      honors[suit] = [];
      for (let i = 0; i < holding.length; i++) {
        const ch = holding[i];
        if (hcpValues[ch]) {
          hcp += hcpValues[ch];
          honors[suit].push(ch);
        }
      }
    }

    const shapeSorted = [lengths.S, lengths.H, lengths.D, lengths.C].sort((a, b) => b - a);
    const isBalanced = (
      (shapeSorted[3] >= 2) &&
      (shapeSorted[0] <= 5) &&
      // no more than one doubleton
      (shapeSorted.filter(l => l === 2).length <= 1)
    );

    let lengthPoints = 0;
    if (system && global.BIDDING_SYSTEMS && global.BIDDING_SYSTEMS[system]?.lengthPoints) {
      for (const len of Object.values(lengths)) {
        if (len > 4) lengthPoints += (len - 4);
      }
    }

    const longestSuit = Object.entries(lengths).sort((a, b) => b[1] - a[1])[0];

    return {
      hcp,
      totalPoints: hcp + lengthPoints,
      lengths,
      shape: shapeSorted,
      isBalanced,
      longestSuit: longestSuit[0],
      longestLen: longestSuit[1],
      honors,
      hasStopper: function(suit) {
        return honors[suit].includes('A') ||
               (honors[suit].includes('K') && lengths[suit] >= 2) ||
               (honors[suit].includes('Q') && lengths[suit] >= 3);
      }
    };
  }

  function countCards(holding) {
    let count = 0;
    for (let i = 0; i < holding.length; i++) {
      if (holding[i] === '1' && holding[i + 1] === '0') {
        count++;
        i++; // skip the '0'
      } else {
        count++;
      }
    }
    return count;
  }

  // ── Auction Analysis ─────────────────────────────────────────────

  function analyzeAuction(auction, seat) {
    const partnerships = {
      N: { partner: 'S', opps: ['E', 'W'] },
      E: { partner: 'W', opps: ['N', 'S'] },
      S: { partner: 'N', opps: ['E', 'W'] },
      W: { partner: 'E', opps: ['N', 'S'] }
    };
    const p = partnerships[seat];

    const partnerBids = auction.filter(b => b.seat === p.partner && b.bid !== 'Pass');
    const myBids = auction.filter(b => b.seat === seat && b.bid !== 'Pass');
    const oppBids = auction.filter(b => p.opps.includes(b.seat) && b.bid !== 'Pass');

    // Contract bids only (no Pass/X/XX)
    const contractBids = auction.filter(b => b.bid !== 'Pass' && b.bid !== 'X' && b.bid !== 'XX');
    const lastContractBid = contractBids.length > 0 ? contractBids[contractBids.length - 1] : null;

    // Last non-pass bid from partner
    const lastPartnerBid = partnerBids.length > 0 ? partnerBids[partnerBids.length - 1] : null;

    // Did partner open (first non-pass contract bid)?
    const firstContractBid = contractBids.length > 0 ? contractBids[0] : null;
    const partnerOpened = firstContractBid && firstContractBid.seat === p.partner;
    const iOpened = firstContractBid && firstContractBid.seat === seat;
    const oppOpened = firstContractBid && p.opps.includes(firstContractBid.seat);

    // What did partner open?
    const partnerOpeningBid = partnerOpened ? firstContractBid.bid : null;

    // Count consecutive passes at end
    let passCount = 0;
    for (let i = auction.length - 1; i >= 0; i--) {
      if (auction[i].bid === 'Pass') passCount++;
      else break;
    }

    return {
      partner: p.partner,
      opps: p.opps,
      partnerBids,
      myBids,
      oppBids,
      contractBids,
      lastContractBid,
      lastPartnerBid,
      partnerOpened,
      iOpened,
      oppOpened,
      partnerOpeningBid,
      firstContractBid,
      passCount,
      auctionLength: auction.length
    };
  }

  // ── Bid Legality ─────────────────────────────────────────────────

  function getBidRank(bid) {
    if (bid === 'Pass' || bid === 'X' || bid === 'XX') return -1;
    const level = parseInt(bid.charAt(0));
    const suitOrder = { C: 0, D: 1, H: 2, S: 3, NT: 4 };
    return level * 5 + (suitOrder[bid.substring(1)] || 0);
  }

  function isLegalBid(bid, auction) {
    if (bid === 'Pass') return true;
    if (bid === 'X' || bid === 'XX') return true; // simplified
    const lastContract = [...auction].reverse().find(b => b.bid !== 'Pass' && b.bid !== 'X' && b.bid !== 'XX');
    if (!lastContract) return true;
    return getBidRank(bid) > getBidRank(lastContract.bid);
  }

  function lowestLegalBid(suit, auction) {
    for (let level = 1; level <= 7; level++) {
      const bid = level + suit;
      if (isLegalBid(bid, auction)) return bid;
    }
    return null;
  }

  // ── Convention Handlers ──────────────────────────────────────────

  function handleStaymanResponse(hand, eval_, auction, ctx) {
    // I opened 1NT and partner bid 2C (Stayman) — show my major
    if (!ctx.iOpened) return null;
    if (!ctx.lastPartnerBid || ctx.lastPartnerBid.bid !== '2C') return null;

    // Check if I opened 1NT
    const myOpening = ctx.myBids.length > 0 ? ctx.myBids[0] : null;
    if (!myOpening || myOpening.bid !== '1NT') return null;

    // Respond at cheapest legal level
    if (eval_.lengths.H >= 4) {
      const bid = lowestLegalBid('H', auction);
      if (bid) return { bid, reasoning: 'Showing 4+ hearts in response to Stayman' };
    }
    if (eval_.lengths.S >= 4) {
      const bid = lowestLegalBid('S', auction);
      if (bid) return { bid, reasoning: 'Showing 4+ spades in response to Stayman' };
    }
    const bid = lowestLegalBid('D', auction);
    if (bid) return { bid, reasoning: 'Denying a 4-card major (Stayman response)' };
    return { bid: 'Pass', reasoning: 'Cannot respond to Stayman at legal level' };
  }

  function handleTransferCompletion(hand, eval_, auction, ctx) {
    // I opened 1NT and partner bid 2D (transfer to H) or 2H (transfer to S)
    if (!ctx.iOpened) return null;
    const myOpening = ctx.myBids.length > 0 ? ctx.myBids[0] : null;
    if (!myOpening || myOpening.bid !== '1NT') return null;
    if (!ctx.lastPartnerBid) return null;

    if (ctx.lastPartnerBid.bid === '2D') {
      return { bid: '2H', reasoning: 'Completing Jacoby transfer to hearts' };
    }
    if (ctx.lastPartnerBid.bid === '2H') {
      return { bid: '2S', reasoning: 'Completing Jacoby transfer to spades' };
    }
    return null;
  }

  // ── Responding to Partner's Opening ──────────────────────────────

  function respondToPartnerOpening(hand, eval_, auction, ctx, system) {
    if (!ctx.partnerOpened) return null;
    const opening = ctx.partnerOpeningBid;
    if (!opening) return null;

    const openingSuit = opening.substring(1); // C, D, H, S, NT
    const openingLevel = parseInt(opening.charAt(0));

    // Responding to 1NT — should be handled by user (they pick Stayman/transfer)
    // But if AI is responder to 1NT, bid naturally
    if (opening === '1NT') {
      return respondTo1NT(hand, eval_, auction, ctx, system);
    }

    // Responding to a preemptive 2-level opening (2H, 2S)
    if (openingLevel === 2 && (openingSuit === 'H' || openingSuit === 'S')) {
      return respondToWeakTwo(hand, eval_, openingSuit, auction);
    }

    // Responding to 1-of-a-suit
    if (openingLevel === 1 && openingSuit !== 'NT') {
      return respondTo1Suit(hand, eval_, openingSuit, auction, ctx, system);
    }

    return null;
  }

  function respondTo1NT(hand, eval_, auction, ctx, system) {
    // AI responding to partner's 1NT
    if (eval_.hcp < 6) {
      return { bid: 'Pass', reasoning: 'Too weak to respond to 1NT' };
    }
    // With 4-4 majors and enough points, bid Stayman
    if (eval_.lengths.H >= 4 && eval_.lengths.S >= 4 && eval_.hcp >= 8) {
      if (isLegalBid('2C', auction)) return { bid: '2C', reasoning: 'Stayman — looking for 4-4 major fit' };
    }
    // With 5+ major, transfer
    if (eval_.lengths.H >= 5 && isLegalBid('2D', auction)) {
      return { bid: '2D', reasoning: 'Transfer to hearts (5+ hearts)' };
    }
    if (eval_.lengths.S >= 5 && isLegalBid('2H', auction)) {
      return { bid: '2H', reasoning: 'Transfer to spades (5+ spades)' };
    }
    // Balanced with game values — bid NT at lowest legal level
    if (eval_.hcp >= 10) {
      const bid = lowestLegalBid('NT', auction);
      if (bid) return { bid, reasoning: 'Balanced hand with game values' };
    }
    return { bid: 'Pass', reasoning: 'No fit found, not enough for game' };
  }

  function respondToWeakTwo(hand, eval_, openingSuit, auction) {
    const support = eval_.lengths[openingSuit === 'H' ? 'H' : 'S'];
    // With 3+ support and 14+ HCP, raise to game
    if (support >= 3 && eval_.hcp >= 14) {
      const gameBid = '4' + openingSuit;
      if (isLegalBid(gameBid, auction)) {
        return { bid: gameBid, reasoning: `Raising partner's weak two to game with ${eval_.hcp} HCP and support` };
      }
    }
    // With 3+ support and 10-13, raise to 3
    if (support >= 3 && eval_.hcp >= 10) {
      const bid = '3' + openingSuit;
      if (isLegalBid(bid, auction)) {
        return { bid: bid, reasoning: 'Invitational raise of partner\'s weak two' };
      }
    }
    return { bid: 'Pass', reasoning: 'Not enough to act over partner\'s weak two' };
  }

  function respondTo1Suit(hand, eval_, openingSuit, auction, ctx, system) {
    const suitKey = openingSuit === 'H' ? 'H' : openingSuit === 'S' ? 'S' : openingSuit === 'D' ? 'D' : 'C';
    const support = eval_.lengths[suitKey];
    const isMajor = (suitKey === 'H' || suitKey === 'S');

    if (eval_.hcp < 6) {
      return { bid: 'Pass', reasoning: 'Too weak to respond' };
    }

    // Support for partner's major
    if (isMajor && support >= 4) {
      if (eval_.hcp >= 13) {
        // Game force — bid new suit or jump
        const gameBid = '4' + suitKey;
        if (isLegalBid(gameBid, auction)) {
          return { bid: gameBid, reasoning: `Game-forcing raise with ${support}-card support and ${eval_.hcp} HCP` };
        }
      }
      if (eval_.hcp >= 10) {
        const bid = '3' + suitKey;
        if (isLegalBid(bid, auction)) {
          return { bid: bid, reasoning: `Invitational raise with ${support}-card support and ${eval_.hcp} HCP` };
        }
      }
      if (eval_.hcp >= 6) {
        const bid = lowestLegalBid(suitKey, auction);
        if (bid) {
          return { bid: bid, reasoning: `Simple raise with ${support}-card support` };
        }
      }
    }

    // SAYC: can raise major with 3-card support
    if (system === 'sayc' && isMajor && support >= 3 && eval_.hcp >= 6) {
      const bid = lowestLegalBid(suitKey, auction);
      if (bid) {
        return { bid: bid, reasoning: 'Simple raise with 3-card support (SAYC)' };
      }
    }

    // Bid a new suit (longest first, prefer majors)
    const candidates = ['H', 'S', 'D', 'C'].filter(s => s !== suitKey && eval_.lengths[s] >= 4);
    candidates.sort((a, b) => eval_.lengths[b] - eval_.lengths[a]);
    for (const s of candidates) {
      const bid = lowestLegalBid(s, auction);
      if (bid && eval_.hcp >= (parseInt(bid.charAt(0)) >= 2 ? 10 : 6)) {
        return { bid: bid, reasoning: `Bidding ${eval_.lengths[s]}-card ${s} suit` };
      }
    }

    // 1NT response with balanced hand
    if (eval_.hcp >= 6 && eval_.hcp <= 10 && isLegalBid('1NT', auction)) {
      return { bid: '1NT', reasoning: 'Balanced minimum response' };
    }

    return { bid: 'Pass', reasoning: 'No suitable response' };
  }

  // ── Rebids (opener rebids after partner responds) ────────────────

  function handleOpenerRebid(hand, eval_, auction, ctx, system) {
    if (!ctx.iOpened) return null;
    if (ctx.myBids.length < 1) return null;

    const myOpening = ctx.myBids[0].bid;
    const partnerResponse = ctx.lastPartnerBid?.bid;
    if (!partnerResponse) return null;

    const openingSuit = myOpening.substring(1);

    // Partner raised my suit — decide whether to go to game
    if (partnerResponse.endsWith(openingSuit)) {
      const responseLevel = parseInt(partnerResponse.charAt(0));
      // Partner invited (bid 3 of my suit)
      if (responseLevel === 3) {
        if (eval_.hcp >= 14) {
          const gameBid = '4' + openingSuit;
          if (isLegalBid(gameBid, auction)) {
            return { bid: gameBid, reasoning: `Accepting invitation with ${eval_.hcp} HCP` };
          }
        }
        return { bid: 'Pass', reasoning: 'Declining invitation — minimum opener' };
      }
      // Partner bid game — pass
      if (responseLevel >= 4) {
        return { bid: 'Pass', reasoning: 'Partner bid game, nothing more to say' };
      }
    }

    // Partner bid a new suit (forcing) — rebid naturally
    if (partnerResponse !== 'Pass' && partnerResponse !== 'X') {
      const partnerSuit = partnerResponse.substring(1);

      // Support partner's major with 4+ cards
      if ((partnerSuit === 'H' || partnerSuit === 'S') && eval_.lengths[partnerSuit] >= 4) {
        const bid = lowestLegalBid(partnerSuit, auction);
        if (bid) {
          return { bid: bid, reasoning: `Supporting partner's ${partnerSuit} with ${eval_.lengths[partnerSuit]} cards` };
        }
      }

      // Rebid own 6+ card suit
      if (eval_.lengths[openingSuit] >= 6) {
        const bid = lowestLegalBid(openingSuit, auction);
        if (bid) {
          return { bid: bid, reasoning: `Rebidding 6-card ${openingSuit} suit` };
        }
      }

      // NT rebid with balanced hand
      if (eval_.isBalanced) {
        if (eval_.hcp >= 18 && isLegalBid('2NT', auction)) {
          return { bid: '2NT', reasoning: 'Balanced 18-19 HCP, rebid 2NT' };
        }
        if (eval_.hcp >= 12 && isLegalBid('1NT', auction)) {
          return { bid: '1NT', reasoning: 'Balanced minimum, rebid 1NT' };
        }
      }

      // Bid a new suit
      const newSuits = ['S', 'H', 'D', 'C'].filter(s => s !== openingSuit && s !== partnerSuit && eval_.lengths[s] >= 4);
      for (const s of newSuits) {
        const bid = lowestLegalBid(s, auction);
        if (bid) {
          return { bid: bid, reasoning: `Showing second suit: ${eval_.lengths[s]}-card ${s}` };
        }
      }
    }

    return { bid: 'Pass', reasoning: 'Nothing further to add' };
  }

  // ── Overcalling / Defense ────────────────────────────────────────

  function handleOvercall(hand, eval_, auction, ctx, system) {
    if (!ctx.oppOpened) return null;
    // Only on first opportunity to act
    if (ctx.myBids.length > 0) return null;

    const openingBid = ctx.firstContractBid.bid;
    const openingSuit = openingBid.substring(1);

    // 1NT overcall: 15-18 HCP balanced with stopper
    if (eval_.isBalanced && eval_.hcp >= 15 && eval_.hcp <= 18) {
      if (eval_.hasStopper(openingSuit !== 'NT' ? openingSuit : 'S')) {
        if (isLegalBid('1NT', auction)) {
          return { bid: '1NT', reasoning: `1NT overcall: ${eval_.hcp} HCP balanced with stopper` };
        }
      }
    }

    // Takeout double: opening strength, short in their suit, support for unbid suits
    if (eval_.hcp >= 12 && openingSuit !== 'NT') {
      const theirSuitLen = eval_.lengths[openingSuit] || 0;
      if (theirSuitLen <= 2) {
        // Check we have support for unbid majors
        const unbidMajors = ['H', 'S'].filter(s => s !== openingSuit);
        const hasMajorSupport = unbidMajors.every(s => eval_.lengths[s] >= 3);
        if (hasMajorSupport) {
          return { bid: 'X', reasoning: `Takeout double: ${eval_.hcp} HCP, short in ${openingSuit}, support for unbid suits` };
        }
      }
    }

    // Weak jump overcall: 6+ card suit, 6-10 HCP
    if (eval_.hcp >= 6 && eval_.hcp <= 10 && eval_.longestLen >= 6) {
      const suit = eval_.longestSuit;
      if (eval_.honors[suit].length >= 2) {
        // Jump one level above minimum
        const minBid = lowestLegalBid(suit, auction);
        if (minBid) {
          const minLevel = parseInt(minBid.charAt(0));
          const jumpBid = (minLevel + 1) + suit;
          if (isLegalBid(jumpBid, auction) && parseInt(jumpBid.charAt(0)) <= 4) {
            return { bid: jumpBid, reasoning: `Weak jump overcall with ${eval_.longestLen}-card ${suit}` };
          }
          // If jump too high, try minimum
          return { bid: minBid, reasoning: `Overcall with ${eval_.longestLen}-card ${suit}` };
        }
      }
    }

    // Simple overcall: 8-16 HCP, good 5+ card suit
    if (eval_.hcp >= 8 && eval_.longestLen >= 5) {
      const suit = eval_.longestSuit;
      if (eval_.honors[suit].length >= 2) {
        const bid = lowestLegalBid(suit, auction);
        if (bid && parseInt(bid.charAt(0)) <= 2) {
          return { bid: bid, reasoning: `Overcall with ${eval_.longestLen}-card ${suit} and ${eval_.hcp} HCP` };
        }
      }
    }

    return { bid: 'Pass', reasoning: `Not enough to enter the auction (${eval_.hcp} HCP)` };
  }

  // ── Responding to Partner's Actions (doubles, overcalls, etc.) ───

  function respondToPartnerDouble(hand, eval_, auction, ctx) {
    // Partner made a takeout double — bid my best suit
    if (!ctx.lastPartnerBid || ctx.lastPartnerBid.bid !== 'X') return null;

    // Find the best unbid major, then longest suit
    const theirSuit = ctx.firstContractBid?.bid.substring(1);
    const candidates = ['H', 'S', 'D', 'C'].filter(s => s !== theirSuit);
    candidates.sort((a, b) => {
      // Prefer majors
      const majorA = (a === 'H' || a === 'S') ? 1 : 0;
      const majorB = (b === 'H' || b === 'S') ? 1 : 0;
      if (majorA !== majorB) return majorB - majorA;
      return eval_.lengths[b] - eval_.lengths[a];
    });

    const bestSuit = candidates[0];
    const bid = lowestLegalBid(bestSuit, auction);

    if (eval_.hcp >= 10 && bid) {
      // Jump response with good hand
      const jumpLevel = parseInt(bid.charAt(0)) + 1;
      const jumpBid = jumpLevel + bestSuit;
      if (isLegalBid(jumpBid, auction) && jumpLevel <= 4) {
        return { bid: jumpBid, reasoning: `Jump response to partner's double with ${eval_.hcp} HCP and ${eval_.lengths[bestSuit]}-card ${bestSuit}` };
      }
    }

    if (bid) {
      return { bid: bid, reasoning: `Responding to partner's takeout double: ${eval_.lengths[bestSuit]}-card ${bestSuit}` };
    }

    return { bid: 'Pass', reasoning: 'No suitable response to partner\'s double' };
  }

  function respondToPartnerOvercall(hand, eval_, auction, ctx) {
    if (!ctx.partnerBids.length) return null;
    const partnerBid = ctx.partnerBids[ctx.partnerBids.length - 1].bid;
    if (partnerBid === 'X' || partnerBid === 'XX' || partnerBid === 'Pass') return null;

    const partnerSuit = partnerBid.substring(1);
    const support = eval_.lengths[partnerSuit] || 0;

    // Raise partner's overcall with support
    if (support >= 3 && eval_.hcp >= 6) {
      if (support >= 4 && eval_.hcp >= 10) {
        // Strong raise
        const bid = lowestLegalBid(partnerSuit, auction);
        if (bid) {
          const raiseLevel = parseInt(bid.charAt(0)) + 1;
          const raiseBid = raiseLevel + partnerSuit;
          if (isLegalBid(raiseBid, auction) && raiseLevel <= 4) {
            return { bid: raiseBid, reasoning: `Jump raise of partner's overcall with ${support}-card support and ${eval_.hcp} HCP` };
          }
        }
      }
      const bid = lowestLegalBid(partnerSuit, auction);
      if (bid) {
        return { bid: bid, reasoning: `Raising partner's overcall with ${support}-card support` };
      }
    }

    return { bid: 'Pass', reasoning: 'Not enough to support partner\'s overcall' };
  }

  // ── Responding to Michaels / Unusual 2NT ─────────────────────────

  function respondToMichaels(hand, eval_, auction, ctx) {
    if (!ctx.lastPartnerBid) return null;
    const pBid = ctx.lastPartnerBid.bid;

    // Partner bid Michaels (cue of opponent's suit) — showing two-suited
    // Over minor: both majors. Over major: other major + minor.
    const oppOpening = ctx.firstContractBid?.bid;
    if (!oppOpening) return null;
    const oppSuit = oppOpening.substring(1);

    // Check if partner's bid is a cue bid of opponent's suit at 2-level
    if (pBid === '2' + oppSuit) {
      // Michaels! Pick the best major
      if (oppSuit === 'C' || oppSuit === 'D') {
        // Both majors — pick the longer/stronger
        const bestMajor = eval_.lengths.S >= eval_.lengths.H ? 'S' : 'H';
        const level = eval_.hcp >= 10 ? 4 : eval_.hcp >= 7 ? 3 : 2;
        const bid = level + bestMajor;
        if (isLegalBid(bid, auction)) {
          return { bid: bid, reasoning: `Choosing ${bestMajor} from partner's Michaels (both majors)` };
        }
      }
      // Over major: other major + unspecified minor
      const otherMajor = oppSuit === 'H' ? 'S' : 'H';
      if (eval_.lengths[otherMajor] >= 3) {
        const bid = lowestLegalBid(otherMajor, auction);
        if (bid) return { bid: bid, reasoning: `Supporting partner's known major from Michaels` };
      }
    }

    // Partner bid Unusual 2NT — both minors
    if (pBid === '2NT' && ctx.oppOpened) {
      const bestMinor = eval_.lengths.D >= eval_.lengths.C ? 'D' : 'C';
      const bid = lowestLegalBid(bestMinor, auction);
      if (bid) {
        return { bid: bid, reasoning: `Choosing ${bestMinor} from partner's Unusual 2NT` };
      }
    }

    return null;
  }

  // ── Competitive Bidding ──────────────────────────────────────────

  function handleCompetitive(hand, eval_, auction, ctx, system) {
    // User made a negative double — I (opener) should rebid
    if (ctx.iOpened && ctx.lastPartnerBid?.bid === 'X') {
      const myOpening = ctx.myBids[0].bid;
      const openingSuit = myOpening.substring(1);

      // Rebid 6+ card suit
      if (eval_.lengths[openingSuit] >= 6) {
        const bid = lowestLegalBid(openingSuit, auction);
        if (bid) return { bid: bid, reasoning: `Rebidding 6-card ${openingSuit} after partner's negative double` };
      }

      // Bid NT with stoppers
      if (eval_.isBalanced && eval_.hcp >= 15) {
        if (isLegalBid('1NT', auction)) return { bid: '1NT', reasoning: 'Rebid NT after partner\'s negative double' };
        if (isLegalBid('2NT', auction)) return { bid: '2NT', reasoning: 'Rebid 2NT showing extra values' };
      }

      // Support partner's implied major
      const unbidMajors = ['H', 'S'].filter(s => s !== openingSuit);
      for (const m of unbidMajors) {
        if (eval_.lengths[m] >= 4) {
          const bid = lowestLegalBid(m, auction);
          if (bid) return { bid: bid, reasoning: `Supporting partner's ${m} (shown by negative double)` };
        }
      }

      // Raise own suit at minimum
      const bid = lowestLegalBid(openingSuit, auction);
      if (bid) return { bid: bid, reasoning: 'Minimum rebid of opening suit' };
    }

    return null;
  }

  // ── Main Entry Point ─────────────────────────────────────────────

  function getRuleBid(seat, hands, auction, system, conventions) {
    const hand = hands[seat];
    const eval_ = evaluateHand(hand, system);
    const ctx = analyzeAuction(auction, seat);

    // Weak hand shortcut — if < 6 HCP and not forced to bid, pass
    if (eval_.hcp < 6 && !isForced(ctx)) {
      return { bid: 'Pass', reasoning: `Only ${eval_.hcp} HCP — too weak to act` };
    }

    // 1. Convention responses (highest priority — always fire)
    let result;

    result = handleStaymanResponse(hand, eval_, auction, ctx);
    if (result) return result;

    result = handleTransferCompletion(hand, eval_, auction, ctx);
    if (result) return result;

    // 2. Responding to partner's Michaels or Unusual 2NT
    result = respondToMichaels(hand, eval_, auction, ctx);
    if (result) return result;

    // 3. Responding to partner's takeout double
    result = respondToPartnerDouble(hand, eval_, auction, ctx);
    if (result) return result;

    // If I've already bid 2+ times, pass (avoid infinite bidding loops)
    if (ctx.myBids.length >= 2) {
      return { bid: 'Pass', reasoning: 'Already bid twice — nothing more to add' };
    }

    // 4. Competitive situations
    result = handleCompetitive(hand, eval_, auction, ctx, system);
    if (result) return result;

    // 5. Opener's rebid
    result = handleOpenerRebid(hand, eval_, auction, ctx, system);
    if (result) return result;

    // 6. Responding to partner's opening
    result = respondToPartnerOpening(hand, eval_, auction, ctx, system);
    if (result) return result;

    // 7. Responding to partner's overcall
    result = respondToPartnerOvercall(hand, eval_, auction, ctx);
    if (result) return result;

    // 8. Overcalling opponents' opening
    result = handleOvercall(hand, eval_, auction, ctx, system);
    if (result) return result;

    // 9. Default: pass
    return { bid: 'Pass', reasoning: `Nothing to bid (${eval_.hcp} HCP)` };
  }

  function isForced(ctx) {
    // Currently no forcing situations require the engine to bid
    // (user handles their own forced bids)
    return false;
  }

  // ── Export ────────────────────────────────────────────────────────

  global.getRuleBid = getRuleBid;
  global.evaluateHand = evaluateHand;

})(typeof window !== 'undefined' ? window : global);
