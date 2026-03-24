# CLAUDE.md — SlamBridge Convention System

## What this task is

Add support for two bridge bidding systems — **ACOL** (used in UK/Ireland/NZ) and **SAYC** (Standard American, used everywhere else) — to the SlamBridge bidding trainer. The app currently assumes SAYC implicitly. This change makes the system explicit, auto-detects the user's region, and allows manual switching.

---

## Codebase overview

This is a single-page app with no build step. All logic lives in plain HTML files served by a thin Flask proxy.

```
index.html                  Landing page (mode selection)
slam-auction-full.html      Full multi-turn auction mode  ← PRIMARY FILE
slam-auction-single.html    Single-decision mode          ← SECONDARY FILE
main.py                     Flask backend — pure API proxy, no bidding logic
```

**The backend (`main.py`) does not contain any bidding logic.** It only proxies calls to the Anthropic API and selects the model via the `CLAUDE_MODEL` env variable. All prompts, scenarios, and validation are in the HTML files.

---

## Key functions and data structures

### In `slam-auction-full.html`

**`getClaudeBid(seat)`** — the core function. Builds the prompt for the AI and calls `/api/bid`. This is where convention system support must be injected. The prompt is a multi-line template string constructed inside this async function. Look for the `const prompt = \`...\`` line.

**`SCENARIOS` array** — hardcoded at the top of the `<script>` block. Each scenario object contains:
```js
{
  id: "U01",
  module: "BASIC",          // BASIC | COMPETE | DEFENSE
  title: "...",
  dealer: "N",
  vul: "None",
  your_seat: "S",
  hands: {                  // All 4 hands — used by AI for all seats
    N: { S: "A105", H: "KQ84", D: "AQ6", C: "K73" },
    E: { ... }, S: { ... }, W: { ... }
  },
  opening_bid: "1NT",
  correct_first_bid: "2C",  // Used for scoring the user's first bid
  alternatives: [],          // Acceptable but not optimal bids
  conventions: ["stayman"],  // Drives convention-specific prompt injection
  teaching_point: "...",
  optimal_contract: "4H by N"
}
```

**Convention injection** already exists in the prompt for Stayman and Transfers, keyed off `scen.conventions`. This pattern is the hook for system-level rules — extend it.

**`scen.your_seat`** — which seat the user plays. AI bids all other seats.

### In `slam-auction-single.html`

Same `SCENARIOS` array (duplicated — keep in sync). The `PlaySession` component handles single-decision flow with no AI calls. Still needs system-aware `correct_first_bid` and `teaching_point`.

---

## What ACOL vs SAYC actually means for this code

The two systems differ in these bidding rules that the AI must know:

| Rule | ACOL | SAYC |
|---|---|---|
| 1NT opening HCP | 12–14 (weak) | 15–17 (strong) |
| Major suit openings | 4+ cards | 5+ cards |
| Major suit raise | Need 4-card support | Can raise on 3 |
| 2NT opening HCP | 20–22 | 20–21 |
| Length points | Not used | Commonly added |
| 1NT overcall | 15–18 HCP | 15–18 HCP (same) |

For ACOL, the authoritative reference is **Standard English ACOL (Bridge for All)** — the English Bridge Union's teaching standard. Do not use informal or club-variant ACOL. This is the system taught at most Irish and UK bridge clubs.

---

## Implementation plan

### Step 1 — Add a `BIDDING_SYSTEMS` config object

Add this near the top of the `<script>` block in both HTML files, before `SCENARIOS`:

```js
const BIDDING_SYSTEMS = {
  acol: {
    id: 'acol',
    name: 'ACOL',
    label: 'ACOL (UK/Ireland)',
    nt1Range: [12, 14],
    majorCardMin: 4,
    nt2Range: [20, 22],
    lengthPoints: false,
    preamble: `BIDDING SYSTEM: Standard English ACOL (UK/Ireland/NZ)
KEY RULES:
- 1NT opening = 12-14 HCP balanced (WEAK no trump)
- Opening 1 of a major suit promises only 4+ cards (NOT 5)
- Raising partner's major requires 4-card support (NOT 3)
- 2NT opening = 20-22 HCP balanced
- Do NOT add length points when valuing your hand`,
  },
  sayc: {
    id: 'sayc',
    name: 'SAYC',
    label: 'Standard American (SAYC)',
    nt1Range: [15, 17],
    majorCardMin: 5,
    nt2Range: [20, 21],
    lengthPoints: true,
    preamble: `BIDDING SYSTEM: Standard American Yellow Card (SAYC)
KEY RULES:
- 1NT opening = 15-17 HCP balanced (STRONG no trump)
- Opening 1 of a major suit promises 5+ cards
- Raising partner's major is acceptable with 3-card support
- 2NT opening = 20-21 HCP balanced
- Add 1 length point for each card above 4 in a suit`,
  }
};
```

### Step 2 — Add system state to the `App` component

In `slam-auction-full.html`, add `system` to `App`'s state. Default it from geo-detection (see Step 5), falling back to `'acol'` for IE/UK and `'sayc'` elsewhere:

```js
const [system, setSystem] = useState(detectSystem());
```

Pass `system` and `setSystem` down to `HomeScreen` and `FullAuction` as props.

### Step 3 — Inject the system preamble into `getClaudeBid`

At the very top of the `prompt` template string in `getClaudeBid(seat)`, inject the system preamble **before** the hand description:

```js
const prompt = `${BIDDING_SYSTEMS[system].preamble}

You are ${seat} playing bridge.
...
```

The preamble must come first so the AI internalises it before reading the hand. This single change makes the AI bid correctly for the selected system across all scenarios.

### Step 4 — Add per-scenario ACOL overrides

Most scenarios have the same correct answer in both systems. A few do not. Add optional fields to the scenarios that differ:

```js
{
  id: "U01",
  ...
  correct_first_bid: "2C",          // SAYC answer (existing field)
  acol_correct_first_bid: "2C",     // ACOL answer if different (omit if same)
  teaching_point: "Use Stayman (2♣) to find 4-4 major fit",
  acol_teaching_point: "Use Stayman (2♣) to find 4-4 major fit — opener may have exactly 4 hearts (ACOL allows 4-card major openings)",
}
```

In the scoring logic and single-decision feedback, resolve the correct bid as:
```js
const correctBid = (system === 'acol' && scen.acol_correct_first_bid)
  ? scen.acol_correct_first_bid
  : scen.correct_first_bid;
```

Do the same for `teaching_point`.

**Scenarios that need ACOL variants:**

- **U01, U02** — North's 1NT opener has 18 HCP (too strong for ACOL 12-14 and even borderline for SAYC 15-17). For ACOL, add `acol_teaching_point` noting that a 12-14 1NT opener is weaker, so Stayman/Transfer responses carry different expectations.
- **D02** — `teaching_point` explicitly says "1NT overcall shows 15-18" — correct for both systems, no change needed.
- **U03, U05, C01–C05, D01, D03–D05** — No changes needed; correct answers are system-independent.

### Step 5 — Geo-detection with manual override

Add this function before the `App` component:

```js
const detectSystem = () => {
  // Check localStorage for manual override first
  const saved = localStorage.getItem('slam-bidding-system');
  if (saved === 'acol' || saved === 'sayc') return saved;
  
  // Geo-detect via browser locale as a lightweight proxy
  // More accurate: fetch from ipapi.co (optional, see below)
  const locale = navigator.language || '';
  const acolLocales = ['en-GB', 'en-IE', 'en-NZ'];
  return acolLocales.some(l => locale.startsWith(l)) ? 'acol' : 'sayc';
};
```

**Optional stronger detection:** fetch `https://ipapi.co/json/` on first load and check the `country_code` field. Cache in `localStorage`. Countries `['GB', 'IE', 'NZ']` → ACOL, all others → SAYC. This is more reliable than `navigator.language` but adds an async call.

When the user manually switches system, persist it:
```js
const handleSystemChange = (newSystem) => {
  setSystem(newSystem);
  localStorage.setItem('slam-bidding-system', newSystem);
};
```

### Step 6 — System badge UI in `HomeScreen`

Add a system selector to the `HomeScreen` component. Place it between the title and the scenario/module selectors:

```jsx
<div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
  <span style={{ color: '#94a3b8', fontSize: '14px' }}>Bidding system:</span>
  {['acol', 'sayc'].map(s => (
    <button
      key={s}
      onClick={() => onSystemChange(s)}
      style={{
        padding: '8px 16px',
        borderRadius: '8px',
        border: `1px solid ${system === s ? '#4ade80' : 'rgba(255,255,255,0.15)'}`,
        background: system === s ? 'rgba(74, 222, 128, 0.15)' : 'rgba(255,255,255,0.03)',
        color: system === s ? '#4ade80' : '#94a3b8',
        fontSize: '14px',
        fontWeight: system === s ? '600' : '400',
        cursor: 'pointer',
      }}
    >
      {BIDDING_SYSTEMS[s].label}
    </button>
  ))}
</div>
```

Also show the active system as a small badge in the in-game header (next to the score) so the user always knows which system is active:

```jsx
<span style={{ 
  fontSize: '12px', 
  color: '#4ade80', 
  border: '1px solid rgba(74,222,128,0.3)', 
  borderRadius: '4px', 
  padding: '2px 8px' 
}}>
  {BIDDING_SYSTEMS[system].name}
</span>
```

### Step 7 — Propagate `system` through components

`system` and `onSystemChange` need to flow:
- `App` → `HomeScreen` (for the selector)
- `App` → `FullAuction` (for `getClaudeBid` and scoring)
- `App` → `PlaySession` in `slam-auction-single.html` (for scoring and teaching points)

Do not store `system` inside `FullAuction` or `PlaySession` — keep it at `App` level so switching persists across scenario navigation.

---

## What NOT to change

- Do not modify `main.py`. It is system-agnostic.
- Do not change the scenario `hands` data. The hands work for both systems — only the interpretation differs.
- Do not add a system selection to the in-game UI (only at the home screen). Changing system mid-session would invalidate scoring.
- Do not change the bid button set (`BID_OPTIONS`). The legal bid set is the same in both systems.
- The `conventions` array per scenario (`["stayman"]`, `["transfers"]`) should stay as-is. It drives convention-specific prompt injections that are correct for both systems.

---

## Testing checklist

After implementation, verify:

1. Visitor with `en-IE` locale defaults to ACOL; `en-US` defaults to SAYC.
2. Manual switch persists across page refresh (localStorage).
3. In Full Auction mode with ACOL active: AI treats North's 1NT opener in U01/U02 as showing 12-14 HCP, not 15-17.
4. In Full Auction mode with SAYC active: AI bids exactly as before (no regression).
5. System badge visible in both home screen and in-game header.
6. Scoring uses the correct `correct_first_bid` / `acol_correct_first_bid` for the active system.
7. Teaching points show the ACOL variant when ACOL is active.

---

## Files to modify

| File | Changes |
|---|---|
| `slam-auction-full.html` | Add `BIDDING_SYSTEMS`, `detectSystem()`, system state in `App`, preamble injection in `getClaudeBid`, system badge UI, ACOL overrides on affected scenarios |
| `slam-auction-single.html` | Add `BIDDING_SYSTEMS`, `detectSystem()`, system state in `App`, ACOL overrides on scoring/teaching points, system badge UI |
| `index.html` | No changes required |
| `main.py` | No changes required |

---

## Deployment

Deployed on Railway at `slambridge.ie`. Auto-deploys from `master` branch on push. No build step — just push and Railway serves the updated HTML directly.

```bash
git add slam-auction-full.html slam-auction-single.html
git commit -m "Add ACOL/SAYC bidding system support with geo-detection"
git push origin master
```
