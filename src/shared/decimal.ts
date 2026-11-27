import DecimalImport from 'decimal.js';
import type { Decimal as DecimalClass } from 'decimal.js';

/**
 * decimal.js ships a single `decimal.d.ts` for both its ESM and CJS builds and has no `"type": "module"`,
 * so under `moduleResolution: NodeNext` TypeScript reads the types as CJS and types the default import
 * as the module namespace instead of the class. At runtime the ESM default export (decimal.mjs) IS the class;
 * some CJS-interop environments hand back `{ default: Decimal }` instead — both cases are handled here.
 * Import Decimal only from this module.
 */
type DecimalConstructor = typeof DecimalClass;

const imported = DecimalImport as unknown as DecimalConstructor | { default: DecimalConstructor };

export const Decimal: DecimalConstructor = typeof imported === 'function' ? imported : imported.default;
export type Decimal = DecimalClass;
export type DecimalValue = DecimalClass.Value;
