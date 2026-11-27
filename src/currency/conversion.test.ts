import { describe, it, expect } from 'vitest';
import { parseNbuRateScaled, resolveConversion } from './conversion';

const base = {
  amount: 100,
  currencyCode: 'USD',
  defaultCode: 'UAH',
  nbuRate: '41.25',
  manualRateScaled: null,
};

describe('resolveConversion', () => {
  it('returns null for same currency', () => {
    expect(resolveConversion({ ...base, currencyCode: 'UAH' })).toBeNull();
  });

  it('uses NBU rate when no manual rate', () => {
    expect(resolveConversion(base)).toEqual({ rateScaled: 4125, convertedMinor: 412500, isManual: false });
  });

  it('manual rate takes priority over NBU', () => {
    expect(resolveConversion({ ...base, manualRateScaled: 4000 })).toEqual({
      rateScaled: 4000,
      convertedMinor: 400000,
      isManual: true,
    });
  });

  it('respects minor digits of source currency (JPY, KWD)', () => {
    expect(resolveConversion({ ...base, amount: 100, currencyCode: 'JPY', nbuRate: '0.30' })?.convertedMinor).toBe(3000);
    expect(resolveConversion({ ...base, amount: 1.234, currencyCode: 'KWD', nbuRate: '135.50' })?.convertedMinor).toBe(
      16721,
    );
  });

  it('returns null when no rate is available or amount is invalid', () => {
    expect(resolveConversion({ ...base, nbuRate: undefined })).toBeNull();
    expect(resolveConversion({ ...base, nbuRate: 'bad' })).toBeNull();
    expect(resolveConversion({ ...base, amount: Number.NaN })).toBeNull();
  });
});

describe('parseNbuRateScaled', () => {
  it('returns null for undefined', () => {
    expect(parseNbuRateScaled(undefined)).toBeNull();
  });
});
