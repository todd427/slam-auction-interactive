/**
 * Test harness — loads bidding engine and provides scenarios + helpers.
 * Source of truth for scenarios: slam-auction-full.html SCENARIOS array.
 */

// Load the engine (IIFE attaches getRuleBid, evaluateHand to global)
require('../bidding-engine.js');

// Define BIDDING_SYSTEMS on global (engine checks this for length points)
global.BIDDING_SYSTEMS = {
  acol: {
    id: 'acol', name: 'ACOL', label: 'ACOL (UK/Ireland)',
    nt1Range: [12, 14], majorCardMin: 4, nt2Range: [20, 22],
    lengthPoints: false,
  },
  sayc: {
    id: 'sayc', name: 'SAYC', label: 'Standard American (SAYC)',
    nt1Range: [15, 17], majorCardMin: 5, nt2Range: [20, 21],
    lengthPoints: true,
  }
};

// All 15 scenarios (extracted from slam-auction-full.html)
const SCENARIOS = [
  {
    id: "U01", module: "BASIC", title: "Responding to 1NT",
    dealer: "N", vul: "None", your_seat: "S",
    hands: {
      N: { S: "A105", H: "KQ84", D: "AQ6", C: "K73" },
      E: { S: "9632", H: "J105", D: "10984", C: "Q4" },
      S: { S: "KJ84", H: "A963", D: "K72", C: "85" },
      W: { S: "Q7", H: "72", D: "J53", C: "AJ10962" }
    },
    opening_bid: "1NT", correct_first_bid: "2C",
    alternatives: [], conventions: ["stayman"],
    teaching_point: "Use Stayman (2♣) to find 4-4 major fit",
    optimal_contract: "4H by N"
  },
  {
    id: "U02", module: "BASIC", title: "Partner Opens 1NT",
    dealer: "N", vul: "None", your_seat: "S",
    hands: {
      N: { S: "A105", H: "KQ84", D: "AQ6", C: "K73" },
      E: { S: "632", H: "J1052", D: "J984", C: "Q4" },
      S: { S: "Q109764", H: "K5", D: "Q83", C: "72" },
      W: { S: "KJ8", H: "A73", D: "K1075", C: "AJ10" }
    },
    opening_bid: "1NT", correct_first_bid: "2H",
    alternatives: [], conventions: ["transfers"],
    teaching_point: "Transfer to spades with 2♥",
    optimal_contract: "2S by N"
  },
  {
    id: "U03", module: "BASIC", title: "Partner Opens 1♠",
    dealer: "N", vul: "None", your_seat: "S",
    hands: {
      N: { S: "AKJ84", H: "K6", D: "A84", C: "Q73" },
      E: { S: "632", H: "J1052", D: "J109", C: "854" },
      S: { S: "Q5", H: "A983", D: "KQ62", C: "AK2" },
      W: { S: "1097", H: "Q74", D: "753", C: "J1096" }
    },
    opening_bid: "1S", correct_first_bid: "2D",
    alternatives: [], conventions: [],
    teaching_point: "Bid 2♦ to establish game force",
    optimal_contract: "6S by N"
  },
  {
    id: "U04", module: "BASIC", title: "Partner Preempts 2♠",
    dealer: "N", vul: "None", your_seat: "S",
    hands: {
      N: { S: "KQ10865", H: "74", D: "J82", C: "93" },
      E: { S: "J9", H: "J1052", D: "Q1094", C: "Q85" },
      S: { S: "A874", H: "A96", D: "AK62", C: "AK" },
      W: { S: "32", H: "KQ83", D: "753", C: "J10764" }
    },
    opening_bid: "2S", correct_first_bid: "4S",
    alternatives: ["6S"], conventions: [],
    teaching_point: "Jump to game with 20+ HCP after weak 2",
    optimal_contract: "4S by N"
  },
  {
    id: "U05", module: "BASIC", title: "Invitational Hand With Support",
    dealer: "S", vul: "None", your_seat: "N",
    hands: {
      N: { S: "K84", H: "AJ63", D: "Q72", C: "K85" },
      E: { S: "J1096", H: "Q75", D: "J104", C: "Q32" },
      S: { S: "AQ732", H: "K4", D: "AK5", C: "J64" },
      W: { S: "5", H: "10982", D: "9863", C: "A1097" }
    },
    opening_bid: "1S", correct_first_bid: "3S",
    alternatives: [], conventions: [],
    teaching_point: "Invite game with 10-12 HCP and 4-card support",
    optimal_contract: "4S by S"
  },
  {
    id: "C01", module: "COMPETE", title: "Partner Opens, RHO Overcalls",
    dealer: "W", vul: "None", your_seat: "S",
    hands: {
      N: { S: "AQ1084", H: "K6", D: "A73", C: "K52" },
      E: { S: "73", H: "QJ10984", D: "95", C: "J64" },
      S: { S: "J65", H: "A832", D: "KQ62", C: "A2" },
      W: { S: "K92", H: "75", D: "J1084", C: "Q10987" }
    },
    opening_bid: "1S", correct_first_bid: "X",
    alternatives: [], conventions: [],
    teaching_point: "Negative double shows 4+ in unbid major",
    optimal_contract: "4S by N"
  },
  {
    id: "C02", module: "COMPETE", title: "RHO Opens 1♥",
    dealer: "E", vul: "E/W", your_seat: "S",
    hands: {
      N: { S: "A2", H: "K64", D: "A10832", C: "Q73" },
      E: { S: "K93", H: "KQJ95", D: "K4", C: "A84" },
      S: { S: "Q10765", H: "A10832", D: "6", C: "K2" },
      W: { S: "J84", H: "7", D: "QJ975", C: "J10965" }
    },
    opening_bid: "1H", correct_first_bid: "2H",
    alternatives: [], conventions: [],
    teaching_point: "Michaels cue bid shows 5-5 in majors",
    optimal_contract: "4S by S"
  },
  {
    id: "C03", module: "COMPETE", title: "After They Open 1♥",
    dealer: "S", vul: "None", your_seat: "W",
    hands: {
      N: { S: "AQ64", H: "AK83", D: "A6", C: "K83" },
      E: { S: "KJ1083", H: "QJ104", D: "84", C: "A5" },
      S: { S: "952", H: "965", D: "QJ2", C: "Q742" },
      W: { S: "7", H: "72", D: "KQ10953", C: "J10964" }
    },
    opening_bid: "1H", correct_first_bid: "2NT",
    alternatives: [], conventions: [],
    teaching_point: "Unusual 2NT shows both minors",
    optimal_contract: "5D by W"
  },
  {
    id: "C04", module: "COMPETE", title: "Supporting Partner's Overcall",
    dealer: "W", vul: "None", your_seat: "S",
    hands: {
      N: { S: "AK985", H: "64", D: "K73", C: "J52" },
      E: { S: "432", H: "J1085", D: "Q652", C: "93" },
      S: { S: "Q1096", H: "K3", D: "AJ84", C: "A72" },
      W: { S: "J7", H: "AQ972", D: "109", C: "KQ1084" }
    },
    opening_bid: "1H", correct_first_bid: "2H",
    alternatives: [], conventions: [],
    teaching_point: "Cue opponent's suit for game-forcing raise",
    optimal_contract: "4S by N"
  },
  {
    id: "C05", module: "COMPETE", title: "Raising After Overcall",
    dealer: "N", vul: "N/S", your_seat: "S",
    hands: {
      N: { S: "AKJ84", H: "K6", D: "Q73", C: "A52" },
      E: { S: "32", H: "QJ10984", D: "95", C: "J64" },
      S: { S: "Q1065", H: "983", D: "AK62", C: "K2" },
      W: { S: "97", H: "A752", D: "J1084", C: "Q10987" }
    },
    opening_bid: "1S", correct_first_bid: "3S",
    alternatives: [], conventions: [],
    teaching_point: "Jump raise shows invitational values in competition",
    optimal_contract: "4S by N"
  },
  {
    id: "D01", module: "DEFENSE", title: "RHO Opens 1♦",
    dealer: "E", vul: "None", your_seat: "S",
    hands: {
      N: { S: "K1093", H: "Q73", D: "Q852", C: "K4" },
      E: { S: "82", H: "A65", D: "AKJ1094", C: "Q5" },
      S: { S: "AQ65", H: "KJ84", D: "6", C: "A732" },
      W: { S: "J74", H: "1092", D: "73", C: "J10986" }
    },
    opening_bid: "1D", correct_first_bid: "X",
    alternatives: [], conventions: [],
    teaching_point: "Takeout double shows support for unbid suits",
    optimal_contract: "2S by S"
  },
  {
    id: "D02", module: "DEFENSE", title: "After RHO Opens 1♦",
    dealer: "W", vul: "None", your_seat: "S",
    hands: {
      N: { S: "1084", H: "Q73", D: "9852", C: "K64" },
      E: { S: "J9752", H: "1052", D: "J3", C: "Q85" },
      S: { S: "AQ6", H: "KJ8", D: "AK64", C: "A73" },
      W: { S: "K3", H: "A964", D: "Q107", C: "J1092" }
    },
    opening_bid: "1D", correct_first_bid: "1NT",
    alternatives: [], conventions: [],
    teaching_point: "1NT overcall shows 15-18 with stopper",
    optimal_contract: "3NT by S"
  },
  {
    id: "D03", module: "DEFENSE", title: "After RHO Opens 1♣",
    dealer: "N", vul: "E/W", your_seat: "E",
    hands: {
      N: { S: "AQ64", H: "A6", D: "AK1094", C: "K3" },
      E: { S: "32", H: "KQJ10985", D: "J8", C: "94" },
      S: { S: "K1095", H: "32", D: "Q65", C: "AQ76" },
      W: { S: "J87", H: "74", D: "732", C: "J10852" }
    },
    opening_bid: "1C", correct_first_bid: "3H",
    alternatives: ["2H"], conventions: [],
    teaching_point: "Weak jump overcall shows long suit, preemptive",
    optimal_contract: "5D by N"
  },
  {
    id: "D04", module: "DEFENSE", title: "After Partner Doubles",
    dealer: "W", vul: "None", your_seat: "S",
    hands: {
      N: { S: "K1093", H: "A73", D: "KQ52", C: "K4" },
      E: { S: "82", H: "65", D: "AJ1094", C: "Q1085" },
      S: { S: "AQ65", H: "QJ84", D: "6", C: "A732" },
      W: { S: "J74", H: "K1092", D: "873", C: "J96" }
    },
    opening_bid: "1D", correct_first_bid: "X",
    alternatives: [], conventions: [],
    teaching_point: "Responsive double shows cards without clear major",
    optimal_contract: "4S by S"
  },
  {
    id: "D05", module: "DEFENSE", title: "In Passout Seat",
    dealer: "E", vul: "None", your_seat: "S",
    hands: {
      N: { S: "K1093", H: "KJ74", D: "Q52", C: "K4" },
      E: { S: "82", H: "65", D: "AKJ94", C: "Q1085" },
      S: { S: "AQ65", H: "QJ8", D: "A64", C: "732" },
      W: { S: "J74", H: "A10932", D: "1083", C: "AJ96" }
    },
    opening_bid: "Pass", correct_first_bid: "X",
    alternatives: ["1NT"], conventions: [],
    teaching_point: "Reopen in passout seat to protect partner",
    optimal_contract: "2S by S"
  }
];

// Helper: get next seat in rotation
function getNextSeat(seat) {
  const seats = ['N', 'E', 'S', 'W'];
  return seats[(seats.indexOf(seat) + 1) % 4];
}

/**
 * Simulate a full auction where the engine bids for ALL seats.
 * Returns { auction, finalContract, terminated }
 */
function simulateFullAuction(scenario, system) {
  const auction = [];
  const MAX_BIDS = 40;

  // Place opening bid
  auction.push({ seat: scenario.dealer, bid: scenario.opening_bid, reasoning: 'Opening' });
  let currentSeat = getNextSeat(scenario.dealer);

  for (let i = 0; i < MAX_BIDS; i++) {
    const result = getRuleBid(currentSeat, scenario.hands, auction, system, scenario.conventions || []);
    auction.push({ seat: currentSeat, bid: result.bid, reasoning: result.reasoning });

    // Check for 3 consecutive passes (auction complete)
    if (auction.length >= 4 && auction.slice(-3).every(b => b.bid === 'Pass')) {
      return { auction, terminated: true };
    }

    currentSeat = getNextSeat(currentSeat);
  }

  return { auction, terminated: false };
}

/**
 * Simulate auction with a specific user first bid, then engine for rest.
 */
function simulateWithUserBid(scenario, system, userFirstBid) {
  const auction = [];
  const MAX_BIDS = 40;
  let userHasBid = false;

  auction.push({ seat: scenario.dealer, bid: scenario.opening_bid, reasoning: 'Opening' });
  let currentSeat = getNextSeat(scenario.dealer);

  for (let i = 0; i < MAX_BIDS; i++) {
    let result;
    if (currentSeat === scenario.your_seat && !userHasBid) {
      result = { bid: userFirstBid, reasoning: 'User bid' };
      userHasBid = true;
    } else {
      result = getRuleBid(currentSeat, scenario.hands, auction, system, scenario.conventions || []);
    }
    auction.push({ seat: currentSeat, bid: result.bid, reasoning: result.reasoning });

    if (auction.length >= 4 && auction.slice(-3).every(b => b.bid === 'Pass')) {
      return { auction, terminated: true };
    }

    currentSeat = getNextSeat(currentSeat);
  }

  return { auction, terminated: false };
}

module.exports = {
  SCENARIOS,
  BIDDING_SYSTEMS: global.BIDDING_SYSTEMS,
  getNextSeat,
  simulateFullAuction,
  simulateWithUserBid,
};
