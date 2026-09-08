export interface ICategoryInput {
  name: string;
  currentAmount: number;
}

export interface ILeftoverIncomeParams {
  monthlyIncome: number;
  categoriesTotal: number;
  savings?: number;
}

export interface ISavingRateParams {
  monthlyIncome: number;
  savings: number;
}

export interface IRecommendedSavingParams {
  monthlyIncome: number;
  savingRate: number;
}

export interface IEmergencyCushionParams {
  monthlyExpenses: number;
  cushionMonths: number;
}

export interface IRuleOf150Params {
  monthlyExpenses: number;
}

export const SAVINGS_STATUS = {
  OVER_ACHIEVING: 'OVER_ACHIEVING',
  PROGRESSING: 'PROGRESSING',
  NOT_STARTED: 'NOT_STARTED',
} as const;

export type SavingsStatus = (typeof SAVINGS_STATUS)[keyof typeof SAVINGS_STATUS];

export interface ISavingsStatusParams {
  /** Integer minor units (cents). */
  monthlyIncome: number;
  /** Integer minor units (cents). */
  currentSavings: number;
  /** Share of monthlyIncome to target, integer percent. Defaults to 10. */
  targetPercentage?: number;
}

export interface ISavingsStatusResult {
  /** Target savings for the period, integer minor units (cents). */
  targetAmount: number;
  /** Percent of monthlyIncome currently saved, integer 0-100+. */
  savedPercentage: number;
  status: SavingsStatus;
  /** max(0, targetAmount - currentSavings), integer minor units (cents). */
  shortfall: number;
}