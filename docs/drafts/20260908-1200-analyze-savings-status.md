# Plan — `analyzeSavingsStatus`

Date: 2026-09-08
Package: `@alex-dev-makarov/finance-math` v1.3.0
Area: `src/onboarding`

## Goal

Add a pure utility `analyzeSavingsStatus` that reports onboarding savings progress
as a strongly typed flat DTO: `targetAmount`, `savedPercentage`, `status`, `shortfall`.
Implemented with **native TS math only** (explicit user instruction), no `decimal.js`.

## Milestone

**M1 — Savings status analysis** (single milestone, 3 PRs, no releases/version bump in scope).

## PR breakdown

### PR-01 — Types & status contract
- File: `src/onboarding/types.ts`
- Add `SAVINGS_STATUS` as-const object + derived union type `SavingsStatus`
  (`'OVER_ACHIEVING' | 'PROGRESSING' | 'NOT_STARTED'`), `ISavingsStatusParams`
  (`monthlyIncome`, `currentSavings`, `targetPercentage?`), `ISavingsStatusResult`
  (four `number`/`SavingsStatus` fields, all required, `readonly` not needed).
- Success: `pnpm build` (tsc) passes; symbols reachable from `src/index.ts` via existing `export *` barrels (no barrel edit required).

### PR-02 — Implement `analyzeSavingsStatus`
- File: `src/onboarding/calc.ts`
- Exported arrow-function const taking a single object param (repo convention),
  `targetPercentage = 10` default. Native math + a local `roundHalfCeil` helper
  (`Math.round`) — no `Decimal` import in this function.
- Order: sanitize inputs → `targetAmount` → `savedPercentage` → `status` → `shortfall`,
  with status derived from the **already-rounded** `targetAmount` (see notes).
- Success: `pnpm build` passes; JSDoc on the function and on each DTO field intent.

### PR-03 — Tests
- File: `src/onboarding/calc.test.ts` (co-located, vitest, minor-unit amounts)
- New `describe('analyzeSavingsStatus')`: the three happy-path statuses, default
  `targetPercentage`, exact-boundary `currentSavings === targetAmount`,
  `shortfall === 0` when over-achieving, and the degenerate inputs listed below.
- Success: `pnpm test` green, all existing tests unaffected.
- dependsOn: PR-01, PR-02

## Architectural notes / decisions

1. **Native math vs `decimal.js` (recorded inconsistency).** Every sibling in
   `calc.ts` uses `Decimal`; this function will not, per explicit user instruction.
   The module therefore has two numeric strategies. Mitigations so results stay
   consistent with Decimal-based siblings:
   - `Math.round` is bit-for-bit equivalent to `Decimal.ROUND_HALF_CEIL` (both round
     halves toward `+Infinity`), so the existing `round()` policy is preserved exactly.
   - Multiply before dividing (`monthlyIncome * targetPercentage / 100`) to limit
     float drift; percentage as `currentSavings / monthlyIncome * 100`.
   - Status comparisons use the **rounded integer** `targetAmount`, never a raw float,
     so `currentSavings === targetAmount` boundaries can't be flipped by 1e-13 artifacts.
2. **Rounding/precision contract.** `targetAmount` and `shortfall` → integers
   (minor units, half-ceil). `savedPercentage` → integer percent, matching
   `calculateSavingRate`. Documented in JSDoc.
3. **Union over `enum`.** Ship a string-literal union + `as const` object rather than a
   TS `enum`: enums emit runtime code, are hostile to `isolatedModules`/`erasableSyntaxOnly`,
   and the package is a pure-ESM `tsc` library with zero enums today. The `as const`
   object gives consumers runtime values without the enum baggage.
4. **Object param.** User listed positional inputs, but all six existing calculators take a
   single `I*Params` object; consistency wins. `targetPercentage` stays optional with default 10.
5. **Edge cases (explicit contract).**
   - Non-finite (`NaN`/`Infinity`) inputs → treated as `0`.
   - `monthlyIncome <= 0` → `targetAmount: 0`, `savedPercentage: 0`, `shortfall: 0`;
     status from the clamped savings (`0` → `NOT_STARTED`, `>0` → `OVER_ACHIEVING`).
   - Negative `currentSavings` clamped to `0` (mirrors `Decimal.max(0, savings)` pattern) → `NOT_STARTED`.
   - Negative/non-finite `targetPercentage` clamped to `0`; values `>100` allowed as-is.
   - **Status precedence** (resolves the `currentSavings === 0 && targetAmount === 0`
     overlap in the spec): `NOT_STARTED` checked first, then `OVER_ACHIEVING`, then `PROGRESSING`.
   - `shortfall = Math.max(0, targetAmount - currentSavings)`.

## Risks & assumptions

- Assumption: no version bump / changelog / README update requested — out of scope.
- Risk (low): a future refactor may want this on `decimal.js` for uniformity; note 1
  documents the deviation so it is a conscious choice, not drift.
