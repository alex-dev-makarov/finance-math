# Tasks

## Milestone M1 — Savings status analysis

Goal G1: add `analyzeSavingsStatus` to `src/onboarding` returning a typed
progress DTO (`targetAmount`, `savedPercentage`, `status`, `shortfall`),
implemented with native TS math.

Plan: `docs/drafts/20260908-1200-analyze-savings-status.md`

- [x] PR-01 — `src/onboarding/types.ts`: savings-status types. See completed-log.md#pr-01
- [ ] PR-02 — `src/onboarding/calc.ts`: `analyzeSavingsStatus` as an exported arrow
      const with a single object param, `targetPercentage = 10`, native math +
      local half-ceil rounding, JSDoc. dependsOn: PR-01. Success: `tsc` passes,
      no `Decimal` used in this function.
- [ ] PR-03 — `src/onboarding/calc.test.ts`: vitest coverage for three statuses,
      default percentage, exact boundary, and all degenerate inputs.
      dependsOn: PR-01, PR-02. Success: `pnpm test` green.

## Cross-cutting architectural notes

- **Two numeric strategies in one module (accepted).** All existing calculators use
  `decimal.js`; `analyzeSavingsStatus` uses native math per explicit user requirement.
  Consistency is preserved because `Math.round` is equivalent to
  `Decimal.ROUND_HALF_CEIL` (halves round toward `+Infinity`), matching the shared
  `round()` helper.
- **Float mitigation.** Multiply before divide for `targetAmount`; derive `status` and
  `shortfall` from the already-rounded integer `targetAmount`, never a raw float, so
  equality boundaries are exact.
- **Rounding contract.** `targetAmount`/`shortfall` = integer minor units (half-ceil);
  `savedPercentage` = integer percent, consistent with `calculateSavingRate`.
- **Union, not `enum`.** String-literal union + `as const` object; TS `enum` emits
  runtime code and conflicts with `isolatedModules`/`erasableSyntaxOnly` in this
  pure-ESM `tsc` library, which currently has no enums.
- **Param style.** Single `I*Params` object argument, matching all six existing
  calculators, despite the request listing positional arguments.
- **Input contract.** Non-finite → 0; `monthlyIncome <= 0` → all-zero numbers;
  negative `currentSavings` and `targetPercentage` clamped to 0; status precedence
  `NOT_STARTED` → `OVER_ACHIEVING` → `PROGRESSING` (resolves the zero-income /
  zero-savings overlap in the spec).
