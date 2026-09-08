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
