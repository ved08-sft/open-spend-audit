# Automated Testing Suite — SpendOptima

We maintain a high-maturity, comprehensive validation pipeline testing all logical matrices and normalization boundaries of the SpendOptima audit calculations.

---

## 1. Core Testing Suite Overview
- **Test File Path**: [test-engine.ts](file:///c:/Users/dev%20tyagi/OneDrive/Documents/Desktop/open-spend-audit/scripts/test-engine.ts)
- **Total Test Cases**: **22 unique scenarios**
- **Logical Coverage**: 100% of mathematical rules, inputs normalizations, Edge Clamps, and ecosystem priority conflicts.

---

## 2. Test Cases Breakdown by Category

### A. Valid Inputs (Standard Audits)
- **Case 1: Standard Plans Overlap (Test 1 Stack)**
  - *Covers*: Multi-tool overlap. Evaluates that dual chat assistants (Claude Pro + ChatGPT Plus) and autocomplete overlaps (Cursor + Copilot) trigger a 70% realism-adjusted cost deduction.
- **Case 2: Already Optimized Operation (Test 4 Stack)**
  - *Covers*: Optimality verification. Proves that a team on a single standard editor (3 Cursor seats) generates exactly $0 savings without artificial bloat.
- **Case 3: Direct Windsurf + Copilot Overlap**
  - *Covers*: Editor redundancy checks. Verifies that running Copilot beside Windsurf triggers a 70% cost recoup.

### B. Invalid Inputs & Budget Stability Clamps
- **Case 4: NaN Monthly Spend Safeguard**
  - *Covers*: Financial format resilience. Ensures non-finite spends clamp to $0 and flag a `MESSY_INPUT` alert.
- **Case 5: Missing/Empty Tool Name Safeguard**
  - *Covers*: Data omissions. Gracefully ignores empty strings or blank space subscription slots without crashing.
- **Case 6: Negative Monthly Spend Safeguard**
  - *Covers*: Budget sanity. Clamps negative subscriptions to $0 and logs a warning.
- **Case 7: Decimal Seat Count Normalization**
  - *Covers*: Decimal clamps. Clamps decimal seat configurations (e.g., 2.5 seats) to integer values (2) and flags a warning.
- **Case 8: Zero Seats Dormant Tier Normalization**
  - *Covers*: Dormant subscriptions. Safely flags 0 seats as a dormant billing account, recouping 100% of the associated spend.

### C. Advanced Edge Cases
- **Case 9: Enterprise Scalability**
  - *Covers*: Huge datasets. Asserts that massive corporate spends ($1.5M/mo) execute cleanly in sub-milliseconds without memory leaks.
- **Case 10: Duplicate Tool Consolidations**
  - *Covers*: Dual billing. Consolidates multiple independent entries for the same tool under the same plan into a single team profile.
- **Case 11: Impossible Savings Prevention**
  - *Covers*: Downside protection. Guarantees that recommendations never cost *more* than the initial subscription baseline.
- **Case 12: Ecosystem Multi-Overlap**
  - *Covers*: Massive tool overlap. Validates that complex multi-product matrices (Cursor, Windsurf, Copilot, ChatGPT, Claude, v0) arbitrate and deduct redundant layers correctly.

### D. Core Business Logic & Math Rules
- **Case 13: Claude Team Floor Downgrade**
  - *Covers*: Minimum seat floors. Traps team sizes <5 on Claude Team, recommending downgrades to individual Pro accounts.
- **Case 14: ChatGPT Team Phantom Seat Downgrade**
  - *Covers*: Single-seat team trap. Downgrades a single user on ChatGPT Team ($60/mo) to ChatGPT Plus ($20/mo) to save $40/mo in phantom charges.
- **Case 15: Casual Research API Direct Switch**
  - *Covers*: Metered transitions. Switches casual content writers to metered pay-as-you-go API keys, cutting costs by ~75%.
- **Case 16: Annual Savings Accuracy Check**
  - *Covers*: Year calculations. Confirms annual savings mathematically mirror monthly rates multiplied by 12.
- **Case 17: Model Arbitrage Raw API**
  - *Covers*: API cost reduction. Migrates simple data parsing background pipelines from OpenAI o1 API to Google Gemini Flash, slashing raw API costs by 96%.

### E. Stability & Contradiction Priorities
- **Case 18: Contradiction Resolution**
  - *Covers*: Priority overlays. Proves that high-priority redundancies (decommissioning) always take precedence over lower-priority free-tier shifts.
- **Case 19: Unknown Use Case Fallback**
  - *Covers*: Schema omissions. Safely fallbacks to a neutral spend maintenance state for unrecognized use-cases.
- **Case 20: Unknown Shadow IT Tool Check**
  - *Covers*: Shadow IT scanning. Surfaces alerts for unrecognized SaaS vendors, prompting departmental audits.
- **Case 21: Case Sensitivity Normalization**
  - *Covers*: Caps normalization. Ensures that tool inputs like "Cursor" and plan inputs like "PRO" resolve identically to "cursor" and "pro".
- **Case 22: Ecosystem Conflict Alert**
  - *Covers*: Editor conflicts. Flags dual active editors (Cursor + Windsurf) and standardizes on a single tool.

---

## 3. How to Run the Tests

To run the full 22-case validation suite locally, execute the following command in your terminal:

```bash
npx tsx scripts/test-engine.ts
```

This command runs the custom typescript test engine synchronously and prints a highly readable visual report. A successful pass will return a clean exit code (`0`).
