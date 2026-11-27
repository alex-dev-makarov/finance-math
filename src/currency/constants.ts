export const DEFAULT_MINOR_DIGITS = 2;

export const RATE_DIGITS = 2;
export const RATE_SCALE = 10 ** RATE_DIGITS;

export const DECIMAL_PATTERN = /^\d+(\.\d+)?$/;

/**
 * Static ISO 4217 minor-unit table — single source of truth across runtimes
 * (deliberately not using Intl, which differs between iOS WebView / Node / browsers).
 * Codes not listed fall back to DEFAULT_MINOR_DIGITS.
 */
export const CURRENCY_MINOR_DIGITS: Readonly<Record<string, number>> = Object.freeze({
  UAH: 2, USD: 2, EUR: 2, GBP: 2, PLN: 2, CHF: 2, CZK: 2, CAD: 2, AUD: 2, NZD: 2,
  CNY: 2, HKD: 2, SGD: 2, SEK: 2, NOK: 2, DKK: 2, HUF: 2, RON: 2, BGN: 2, MDL: 2,
  GEL: 2, TRY: 2, ILS: 2, AED: 2, SAR: 2, INR: 2, THB: 2, MXN: 2, BRL: 2, ZAR: 2,
  KZT: 2, AZN: 2, AMD: 2, EGP: 2,

  BIF: 0, CLP: 0, DJF: 0, GNF: 0, ISK: 0, JPY: 0, KMF: 0, KRW: 0, PYG: 0, RWF: 0,
  UGX: 0, UYI: 0, VND: 0, VUV: 0, XAF: 0, XOF: 0, XPF: 0,

  BHD: 3, IQD: 3, JOD: 3, KWD: 3, LYD: 3, OMR: 3, TND: 3,

  CLF: 4, UYW: 4,
});
