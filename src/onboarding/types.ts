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