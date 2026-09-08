# Completed Log

## PR-01 — `src/onboarding/types.ts`: savings-status types
**Date:** 2026-09-08
**Shipped:** `SAVINGS_STATUS` as-const object plus the derived `SavingsStatus` string-literal
union (`'OVER_ACHIEVING' | 'PROGRESSING' | 'NOT_STARTED'`), and the `ISavingsStatusParams` /
`ISavingsStatusResult` DTO interfaces, all with `/** */` JSDoc. Key decisions: an as-const
object rather than a TS `enum` (enum emits runtime code and conflicts with
`isolatedModules`/`erasableSyntaxOnly`; the repo has zero enums, and the const object still
gives consumers runtime values); a single object param matching all six existing calculators;
integer minor units for money fields and integer percent for `savedPercentage`. No barrel edits
— `src/onboarding/index.ts` and `src/index.ts` already re-export with `export *`.
**Verification:** `npx tsc --noEmit` exit 0. Reviewer independently confirmed via a type-identity
test that `SavingsStatus` resolves to exactly the three literals with no widening (a deliberate
`'TYPO' as string` assignment was rejected with TS2322); emitted `.d.ts` re-checked from a clean
outDir shows the JSDoc present on `targetAmount`, `savedPercentage`, `shortfall`, and
`targetPercentage`; `git diff HEAD --stat` = 27 insertions, 0 deletions, with all pre-existing
interfaces byte-identical; no name collisions across either barrel.
**Notes:** One review round found that trailing `//` comments are discarded by TypeScript's
declaration emit — the cents-vs-dollars unit information existed in the repo but never reached
the published API surface. Worth remembering for any future DTO in this package: units must be
in `/** */` JSDoc or consumers never see them. Deliberately left alone: `SAVINGS_STATUS` is not
`Object.freeze`d (holds labels, not money, and the package declares `sideEffects: false`); the
missing trailing newline in `types.ts` is pre-existing in HEAD; the singular/plural drift against
`ISavingRateParams` violates no stated convention. Deferred to PR-02: the edge-case rules
(non-finite → 0, `monthlyIncome <= 0` → all-zero, negative inputs clamped) are documented in the
task contract but not yet in JSDoc — they belong with the implementation that enforces them.
**Metrics:** review rounds 2; defects major:0, minor:1, nit:0
**Approved:** jarvis-reviewer go-ahead (round 2)

## PR-02 — `src/onboarding/calc.ts`: `analyzeSavingsStatus`
**Date:** 2026-09-08
**Shipped:** `analyzeSavingsStatus({ monthlyIncome, currentSavings, targetPercentage = 10 })`
returning `ISavingsStatusResult`, implemented with native `Math.round` only — no `decimal.js`,
per explicit user requirement, even though all six sibling calculators in the same file use it.
Full JSDoc with `@example` and a documented edge-case contract. Ordering decisions that carry the
correctness: multiply before divide in BOTH percentage expressions, and derive `status`/`shortfall`
from the already-rounded integer `targetAmount` so the `currentSavings === targetAmount` boundary
cannot be flipped by a float artifact. Status precedence is fixed as `NOT_STARTED` →
`OVER_ACHIEVING` → `PROGRESSING`, resolving a real gap in the original spec: with income 0 and
savings 0, both `currentSavings >= targetAmount` and `currentSavings === 0` match.
**Verification:** `npx tsc --noEmit` exit 0; `npx vitest run` 26/26 pre-existing tests pass with no
regression to the six sibling calculators. Reviewer executed the emitted JS rather than reading the
source: `savedPercentage` now agrees with sibling `calculateSavingRate` across **638,591 input
pairs** (78,591-point realistic grid + 260,000 exact half-percent constructions + 300,000 random
pairs) with **zero divergences**, down from 194-in-40,020 before the fix. `targetAmount`'s rounding
verified exact against `Decimal.ROUND_HALF_CEIL` over a 20,000×201 grid plus 200k random pairs. No
`-0` and no non-integer values in any returned field across 16 edge inputs including `-0` inputs,
negative savings, and NaN/±Infinity. `@example` arithmetic confirmed by execution.
**Notes:** The major find was that `Math.round` ≡ `Decimal.ROUND_HALF_CEIL` — the entire
justification for deviating to native math — held for `targetAmount` but broke for
`savedPercentage`, because dividing first destroys the exact `.5` boundary before rounding sees it.
`{ monthlyIncome: 200000, currentSavings: 115000 }` (exactly 57.5%) returned 57 while
`calculateSavingRate` returned 58 for the same user. **Lesson for any future native-math function
here: multiply before divide, or it will silently disagree with its decimal.js siblings.** This
amended the planner's literal contract formula; accepted as a routine defect since the user's spec
only asked for "real percentage based on their income" and agreeing with the sibling is the only
sensible reading. Also documented but deliberately NOT guarded: finite inputs above ~1.79e306 minor
units overflow to `Infinity`, since only inputs are sanitized — outside any real monetary range, and
a runtime check would cost every caller. Known pre-existing, out of scope: `dist` emits
extensionless relative imports, so bare-Node-ESM consumers cannot resolve them (`dist/index.js`
already does this today) — a separate packaging concern. Deliberate asymmetry retained: siblings
return `NaN` for `NaN` input, this function returns zeros.
**Metrics:** review rounds 2; defects major:1, minor:1, nit:4
**Approved:** jarvis-reviewer go-ahead (round 2), plus two follow-up doc nits fixed before commit
