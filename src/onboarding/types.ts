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
  monthlyIncome: number;
  currentSavings: number;
  targetPercentage?: number;
}

export interface ISavingsStatusResult {
  targetAmount: number;
  savedPercentage: number;
  status: SavingsStatus;
  shortfall: number;
}