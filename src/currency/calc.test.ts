import { describe, it, expect } from 'vitest';
import {
  convertToDefault,
  deriveRate,
  fromMinor,
  getMinorDigits,
  parseRate,
  rateToNumber,
  toMinor,
} from './calc';

describe('getMinorDigits', () => {
  it('returns ISO 4217 digits', () => {
    expect(getMinorDigits('UAH')).toBe(2);
    expect(getMinorDigits('JPY')).toBe(0);
    expect(getMinorDigits('KWD')).toBe(3);
  });

  it('is case-insensitive and falls back to 2 for unknown codes', () => {
    expect(getMinorDigits('jpy')).toBe(0);
    expect(getMinorDigits('XXX_UNKNOWN')).toBe(2);
  });
});

describe('toMinor / fromMinor', () => {
  it('avoids float errors (2 digits)', () => {
    expect(toMinor({ major: 1.005, currency: 'UAH' })).toBe(101);
    expect(toMinor({ major: 0.1 + 0.2, currency: 'USD' })).toBe(30);
  });

  it('JPY has no minor units', () => {
    expect(toMinor({ major: 100, currency: 'JPY' })).toBe(100);
    expect(toMinor({ major: 100.5, currency: 'JPY' })).toBe(101);
    expect(fromMinor({ minor: 100, currency: 'JPY' })).toBe(100);
  });

  it('KWD has 3 minor digits', () => {
    expect(toMinor({ major: 1.234, currency: 'KWD' })).toBe(1234);
    expect(toMinor({ major: 1.2345, currency: 'KWD' })).toBe(1235);
    expect(fromMinor({ minor: 1234, currency: 'KWD' })).toBe(1.234);
  });

  it('rounds half away from zero for negatives', () => {
    expect(toMinor({ major: -1.005, currency: 'UAH' })).toBe(-101);
  });

  it('returns null for non-finite and unsafe values', () => {
    expect(toMinor({ major: Number.NaN, currency: 'UAH' })).toBeNull();
    expect(toMinor({ major: Number.MAX_SAFE_INTEGER, currency: 'UAH' })).toBeNull();
  });
});

describe('parseRate', () => {
  it('parses strings with dot or comma, and numbers', () => {
    expect(parseRate('41.2567')).toBe(4126);
    expect(parseRate(' 41,25 ')).toBe(4125);
    expect(parseRate(41.25)).toBe(4125);
  });

  it('rejects invalid, zero and negative rates', () => {
    expect(parseRate('abc')).toBeNull();
    expect(parseRate('0')).toBeNull();
    expect(parseRate('0.001')).toBeNull();
    expect(parseRate(-5)).toBeNull();
  });

  it('rateToNumber reverses scaling', () => {
    expect(rateToNumber(4125)).toBe(41.25);
  });
});

describe('convertToDefault', () => {
  it('2 → 2 digits (USD → UAH)', () => {
    expect(convertToDefault({ amountMinor: 10000, rateScaled: 4125, from: 'USD', to: 'UAH' })).toBe(412500);
  });

  it('0 → 2 digits (JPY → UAH): 100 ¥ × 0.30 = 30.00 грн', () => {
    expect(convertToDefault({ amountMinor: 100, rateScaled: 30, from: 'JPY', to: 'UAH' })).toBe(3000);
  });

  it('2 → 0 digits (UAH → JPY): 100 грн × 3.35 = 335 ¥', () => {
    expect(convertToDefault({ amountMinor: 10000, rateScaled: 335, from: 'UAH', to: 'JPY' })).toBe(335);
  });

  it('3 → 2 digits (KWD → UAH): 1.234 KWD × 135.50 = 167.207 → 167.21 грн', () => {
    expect(convertToDefault({ amountMinor: 1234, rateScaled: 13550, from: 'KWD', to: 'UAH' })).toBe(16721);
  });

  it('rounds half away from zero', () => {
    expect(convertToDefault({ amountMinor: 1, rateScaled: 150, from: 'USD', to: 'UAH' })).toBe(2);
    expect(convertToDefault({ amountMinor: -1, rateScaled: 150, from: 'USD', to: 'UAH' })).toBe(-2);
  });

  it('returns null for unsafe input or overflow', () => {
    expect(convertToDefault({ amountMinor: 1.5, rateScaled: 4125, from: 'USD', to: 'UAH' })).toBeNull();
    expect(
      convertToDefault({ amountMinor: Number.MAX_SAFE_INTEGER, rateScaled: 4125, from: 'USD', to: 'UAH' }),
    ).toBeNull();
  });
});

describe('deriveRate', () => {
  it('2 → 2 digits', () => {
    expect(deriveRate({ amountMinor: 10000, convertedMinor: 412500, from: 'USD', to: 'UAH' })).toBe(4125);
  });

  it('JPY → UAH and KWD → UAH round-trip with convertToDefault', () => {
    expect(deriveRate({ amountMinor: 100, convertedMinor: 3000, from: 'JPY', to: 'UAH' })).toBe(30);
    expect(deriveRate({ amountMinor: 1000, convertedMinor: 13550, from: 'KWD', to: 'UAH' })).toBe(13550);
  });

  it('returns null for non-positive amount or rate', () => {
    expect(deriveRate({ amountMinor: 0, convertedMinor: 100, from: 'USD', to: 'UAH' })).toBeNull();
    expect(deriveRate({ amountMinor: 100, convertedMinor: 0, from: 'USD', to: 'UAH' })).toBeNull();
  });
});
