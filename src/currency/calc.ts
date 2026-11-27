import { Decimal, type DecimalValue } from '../shared/decimal.js';

import { CURRENCY_MINOR_DIGITS, DECIMAL_PATTERN, DEFAULT_MINOR_DIGITS, RATE_DIGITS, RATE_SCALE } from './constants.js';
import type {
  CurrencyCode,
  IConvertToDefaultArgs,
  IDeriveRateArgs,
  IFromMinorArgs,
  IToMinorArgs,
} from './types.js';

// Isolated instance: enough precision for safe-integer products, rounding half away from zero.
const D = Decimal.clone({ precision: 40, rounding: Decimal.ROUND_HALF_UP });

const toSafeInteger = (value: Decimal) => {
  const result = value.toDecimalPlaces(0).toNumber();
  return Number.isSafeInteger(result) ? result : null;
};

const pow10 = (digits: number) => new D(10).pow(digits);

const shiftDecimal = (value: DecimalValue, digits: number) => toSafeInteger(new D(value).times(pow10(digits)));

const parseDecimalText = (text: string) => {
  const normalized = text.trim().replace(',', '.');
  return DECIMAL_PATTERN.test(normalized) ? normalized : null;
};

/** 10^(digits(to) − digits(from)) — aligns minor units between currencies. */
const minorFactor = (from: CurrencyCode, to: CurrencyCode) => pow10(getMinorDigits(to) - getMinorDigits(from));

export const getMinorDigits = (currency: CurrencyCode) =>
  CURRENCY_MINOR_DIGITS[currency.trim().toUpperCase()] ?? DEFAULT_MINOR_DIGITS;

export const toMinor = ({ major, currency }: IToMinorArgs) => {
  if (!Number.isFinite(major)) return null;
  return shiftDecimal(major, getMinorDigits(currency));
};

export const fromMinor = ({ minor, currency }: IFromMinorArgs) =>
  new D(minor).div(pow10(getMinorDigits(currency))).toNumber();

export const parseRate = (value: string | number) => {
  const numeric = typeof value === 'number' ? value : parseDecimalText(value);
  if (numeric === null || (typeof numeric === 'number' && !Number.isFinite(numeric))) return null;

  const rateScaled = shiftDecimal(numeric, RATE_DIGITS);
  if (rateScaled === null || rateScaled <= 0) return null;

  return rateScaled;
};

export const rateToNumber = (rateScaled: number) => new D(rateScaled).div(RATE_SCALE).toNumber();

/** convertedMinor = amountMinor × rateScaled × 10^(digits(to) − digits(from)) / RATE_SCALE */
export const convertToDefault = ({ amountMinor, rateScaled, from, to }: IConvertToDefaultArgs) => {
  if (!Number.isSafeInteger(amountMinor) || !Number.isSafeInteger(rateScaled)) return null;
  return toSafeInteger(new D(amountMinor).times(rateScaled).times(minorFactor(from, to)).div(RATE_SCALE));
};

/** rateScaled = convertedMinor × RATE_SCALE / (amountMinor × 10^(digits(to) − digits(from))) */
export const deriveRate = ({ amountMinor, convertedMinor, from, to }: IDeriveRateArgs) => {
  if (!Number.isSafeInteger(amountMinor) || !Number.isSafeInteger(convertedMinor) || amountMinor <= 0) {
    return null;
  }

  const rateScaled = toSafeInteger(
    new D(convertedMinor).times(RATE_SCALE).div(new D(amountMinor).times(minorFactor(from, to))),
  );
  return rateScaled !== null && rateScaled > 0 ? rateScaled : null;
};
