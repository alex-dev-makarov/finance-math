# Defects

Status: `open` → `wip` → `root-caused` → `resolved` · also `inconclusive`, `wontfix`, `declined`

## PR-01

### [PR-01-D01] Unit documentation on money-bearing result fields is stripped from the published `.d.ts`
**Status:** resolved
**Severity:** minor
**Location:** src/onboarding/types.ts:50-53
**Description:** Verified empirically by the reviewer via `npx tsc --emitDeclarationOnly`.
TypeScript carries only `/** */` JSDoc into declaration output and consumer IntelliSense;
trailing `//` line comments are discarded. The new `ISavingsStatusResult` documents its units
with trailing `//` comments, so the shipped `dist/onboarding/types.d.ts` shows bare
`targetAmount: number` — the cents-vs-dollars distinction, the canonical 100x error in a
financial package, is absent from the published API surface. Two related gaps in the same
block: `savedPercentage` does not state its denominator (percent of `monthlyIncome`, not
percent of target — the name reads equally well as progress-toward-target), and
`ISavingsStatusParams.targetPercentage?` does not document its default of `10`.
**Root cause:** Unit notes written as trailing `//` comments rather than `/** */` JSDoc; TS
declaration emit discards the former.
**Suggested fix:** In `ISavingsStatusResult`, convert the three trailing `//` comments to
`/** */` JSDoc blocks above each field (`targetAmount`: target savings, integer minor units
(cents); `savedPercentage`: percent of `monthlyIncome` currently saved, integer 0-100+;
`shortfall`: `max(0, targetAmount - currentSavings)`, integer minor units (cents)). Add
`/** Share of monthlyIncome to target, integer percent. Defaults to 10. */` above
`ISavingsStatusParams.targetPercentage`.
**Fix:** src/onboarding/types.ts — the three `ISavingsStatusResult` unit comments converted to
`/** */` JSDoc blocks above `targetAmount`, `savedPercentage`, `shortfall`; `targetPercentage`
default of 10 documented; brief unit JSDoc also added to `monthlyIncome`/`currentSavings`.
Verified: JSDoc now present in the emitted `.d.ts`; `tsc --noEmit` and
`tsc --emitDeclarationOnly` both exit 0. Pending round-2 reviewer confirmation.
**Reproduce first:** `npx tsc --emitDeclarationOnly --outDir /tmp/fm-dist && grep -A6 'interface ISavingsStatusResult' /tmp/fm-dist/onboarding/types.d.ts` — shows bare `number` members with no unit docs before the fix.

**Not flagged by reviewer (recorded so it is not re-raised):** `SAVINGS_STATUS` is not
`Object.freeze`d (holds labels, not money; `sideEffects: false` package); singular/plural
drift vs existing `ISavingRateParams`.

## PR-02

### [PR-02-D01] `savedPercentage` divides before multiplying, disagreeing with `ROUND_HALF_CEIL` and with sibling `calculateSavingRate`
**Status:** resolved
**Severity:** major
**Location:** src/onboarding/calc.ts:142
**Description:** The `Math.round` ≡ `Decimal.ROUND_HALF_CEIL` equivalence that justifies the
native-math deviation holds for `targetAmount` but BREAKS for `savedPercentage`.
`sanitizedSavings / sanitizedIncome * 100` divides first, so an exact half-percent quotient
becomes a double slightly below `x.5` and `Math.round` rounds DOWN where `ROUND_HALF_CEIL`
rounds UP. `{ monthlyIncome: 200000, currentSavings: 115000 }` → `savedPercentage: 57`, while
`calculateSavingRate({ monthlyIncome: 200000, savings: 115000 })` in the same file returns 58
(exact value 57.5). Also diverges at `(200000, 29000)`, `(200000, 57000)`, `(200000, 251000)`,
`(1000, 575)`, `(100000, 57500)`, `(478760, 9587169)`. Measured 194 divergences in 40,020
realistic cases, always low by one. A consumer rendering both numbers for the same user sees
two different percentages. Note the PR's own success criterion says "local half-ceil rounding",
which bare `Math.round` on a divide-first expression is not.
**Root cause:** Division performed before multiplication, losing the exact `.5` boundary to
float representation before rounding sees it.
**Suggested fix:** `const savedPercentage = Math.round((sanitizedSavings * 100) / sanitizedIncome);`
Reviewer verified this form has ZERO divergences from the Decimal equivalent across the full
1500×1500 grid (331 divergences for the current form), all half-percent cases, 400k random
pairs to 1e9 and 200k to 1e13. Exact while `savings * 100 <= 2^53` (~$900B in cents).
**Fix:** src/onboarding/calc.ts — `savedPercentage` changed to `Math.round((sanitizedSavings * 100) / sanitizedIncome)`.
Reproduce script went from DIVERGE on all four rows to MATCH on all four (58 vs 58 at `{200000, 115000}`).
`targetAmount`'s line left byte-for-byte unchanged.
**Reproduce first:** `expect(analyzeSavingsStatus({ monthlyIncome: 200000, currentSavings: 115000 }).savedPercentage).toBe(calculateSavingRate({ monthlyIncome: 200000, savings: 115000 }))` — fails 57 vs 58 before the fix.
**Note:** amends the planner's literal contract formula. Accepted by the orchestrator as a
routine defect: the user's spec only asked for "real percentage based on their income", and
agreeing with the sibling calculator is unambiguously the correct reading.

### [PR-02-D02] JSDoc omits the status precedence rule, making the `targetPercentage: 0` result look like a bug
**Status:** resolved
**Severity:** minor
**Location:** src/onboarding/calc.ts:85-97
**Description:** The "Edge cases" block documents input sanitization but never states that
`currentSavings === 0` is checked BEFORE `currentSavings >= targetAmount`. Verified:
`{ monthlyIncome: 1000, currentSavings: 0, targetPercentage: 0 }` returns `NOT_STARTED` even
though `0 >= 0` holds. Also undocumented: `shortfall` is non-zero for `NOT_STARTED` (e.g.
`{3000000, 0}` → 300000, correct per spec but the JSDoc only shows shortfall in the
OVER_ACHIEVING example), and exact equality `savings === targetAmount` reports OVER_ACHIEVING.
**Suggested fix:** Add to the JSDoc: status precedence in order — `currentSavings === 0` →
NOT_STARTED (wins even when `targetAmount` is also 0); `currentSavings >= targetAmount` →
OVER_ACHIEVING (includes exact equality); otherwise PROGRESSING. State that `shortfall` is
non-zero for NOT_STARTED.
**Fix:** src/onboarding/calc.ts — JSDoc "Edge cases" block now states the precedence order and that
`shortfall` is non-zero for NOT_STARTED. Documentation only, no behaviour change.

### [PR-02-D03] `// Step N:` comments reference the implementation brief's numbering, not the code
**Status:** resolved
**Severity:** nit
**Location:** src/onboarding/calc.ts:119,124,138,141,144
**Description:** `// Step 5-6:` names steps that exist only in a plan document a reader of the
published package cannot see; they rot into noise once the brief is archived. The substantive
halves (`(multiply before divide)`, `using integer targetAmount`) are worth keeping.
**Suggested fix:** Drop the `Step N:` prefixes, keep the rationale.
**Fix:** src/onboarding/calc.ts — `Step N:` prefixes removed, rationale retained
(`// Multiply before divide to avoid float drift`, etc.). 0 grep hits for `Step ` in the function.

### [PR-02-D04] `@param {number}` type tags duplicate the TS signature and diverge from `types.ts` doc style
**Status:** resolved
**Severity:** nit
**Location:** src/onboarding/calc.ts:92-97
**Description:** `ISavingsStatusParams`/`ISavingsStatusResult` carry per-field JSDoc without type
tags (types.ts:39-56); the braces restate what `tsc` already checks and go stale silently.
**Suggested fix:** Drop the `{...}` from `@param`/`@returns`, keep the prose.
**Fix:** src/onboarding/calc.ts — `{...}` type braces stripped from `@param`/`@returns`; prose and
`[params.targetPercentage=10]` default notation kept.

**Verified clean by reviewer (do not re-raise):** `targetAmount` rounding matches ROUND_HALF_CEIL
exactly (0 divergences, 20,000×201 grid + 200k random); no `-0` leakage in any field under any
edge input (`sanitizedIncome <= 0` short-circuits before rounding, so both `Math.round` args are
provably non-negative, and `Math.max(0, -0)` → `+0`); `@example` arithmetic correct as executed;
`tsc --noEmit` clean and 26/26 existing tests pass. Extensionless relative import in `dist` is
pre-existing breakage for bare-Node-ESM consumers (`dist/index.js` already does it) — separate
packaging concern, not this PR. Deliberate asymmetry: siblings return `NaN` for `NaN` input,
this one returns zeros, per the locked contract.

### [PR-02-D05] JSDoc falsely claims `shortfall` is non-zero for `NOT_STARTED`
**Status:** resolved
**Severity:** nit
**Location:** src/onboarding/calc.ts:92
**Description:** Introduced by the PR-02-D02 fix. Falsified by
`{ monthlyIncome: 100000, currentSavings: 0, targetPercentage: 0 }` → `NOT_STARTED` with
`shortfall: 0`, and by every `monthlyIncome <= 0` case. The same bullet's "it is the full
`targetAmount`" claim is universally true.
**Root cause:** Over-generalised from the common case (`targetAmount > 0`) when documenting.
**Suggested fix:** Drop the "non-zero" assertion, keep the `targetAmount` phrasing.
**Fix:** src/onboarding/calc.ts — bullet replaced with "shortfall is the full targetAmount for
NOT_STARTED (itself 0 when targetPercentage is 0 or monthlyIncome is non-positive)".
**Reproduce first:** `analyzeSavingsStatus({ monthlyIncome: 100000, currentSavings: 0, targetPercentage: 0 })` → `{ status: 'NOT_STARTED', shortfall: 0 }`, contradicting the JSDoc.

### [PR-02-D06] Finite inputs can produce non-finite outputs; contract documents input sanitization only
**Status:** resolved
**Severity:** nit
**Location:** src/onboarding/calc.ts (JSDoc edge-cases block)
**Description:** The "non-finite inputs treated as 0" line guards inputs only. Intermediate
multiplication can overflow past `Number.MAX_VALUE`: `{ monthlyIncome: 1, currentSavings: 1e308 }`
→ `savedPercentage: Infinity`; `{ monthlyIncome: 1e300, targetPercentage: 1e300 }` →
`targetAmount: Infinity, shortfall: Infinity`. Threshold ~1.79e306 minor units — unreachable for
real money. Note that past 2^53 the arithmetic merely loses exactness while staying correct after
rounding (`{1e6, 9007199254740991}` → `900719925474`, the true value); only genuine float
overflow yields `Infinity`.
**Suggested fix:** One JSDoc line. Deliberately NOT a runtime guard — the threshold is outside any
real monetary range and a check would cost every caller.
**Fix:** src/onboarding/calc.ts — added a JSDoc line noting inputs beyond ~1.79e306 minor units can
overflow to Infinity since only inputs, not intermediate results, are sanitized. No runtime guard.
