import { convertToDefault, parseRate, toMinor } from './calc';
import type { CurrencyCode, IConversionResult, IResolveConversionArgs } from './types';

export const parseNbuRateScaled = (nbuRate: string | undefined) =>
  nbuRate === undefined ? null : parseRate(nbuRate);

export const resolveConversion = <TCode extends CurrencyCode>({
  amount,
  currencyCode,
  defaultCode,
  nbuRate,
  manualRateScaled,
}: IResolveConversionArgs<TCode>): IConversionResult | null => {
  if (currencyCode === defaultCode) return null;

  const rateScaled = manualRateScaled ?? parseNbuRateScaled(nbuRate);
  if (rateScaled === null) return null;

  const amountMinor = toMinor({ major: amount, currency: currencyCode });
  if (amountMinor === null) return null;

  const convertedMinor = convertToDefault({ amountMinor, rateScaled, from: currencyCode, to: defaultCode });
  if (convertedMinor === null) return null;

  return {
    rateScaled,
    convertedMinor,
    isManual: manualRateScaled !== null,
  };
};
