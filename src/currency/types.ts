export type CurrencyCode = string;

export interface IToMinorArgs {
  major: number;
  currency: CurrencyCode;
}

export interface IFromMinorArgs {
  minor: number;
  currency: CurrencyCode;
}

export interface IConvertToDefaultArgs {
  amountMinor: number;
  rateScaled: number;
  from: CurrencyCode;
  to: CurrencyCode;
}

export interface IDeriveRateArgs {
  amountMinor: number;
  convertedMinor: number;
  from: CurrencyCode;
  to: CurrencyCode;
}

export interface IResolveConversionArgs<TCode extends CurrencyCode = CurrencyCode> {
  amount: number;
  currencyCode: TCode;
  defaultCode: TCode;
  nbuRate: string | undefined;
  manualRateScaled: number | null;
}

export interface IConversionResult {
  rateScaled: number;
  convertedMinor: number;
  isManual: boolean;
}
