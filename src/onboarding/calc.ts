import Decimal from 'decimal.js';

import type {
  ICategoryInput,
  IEmergencyCushionParams,
  ILeftoverIncomeParams,
  IRecommendedSavingParams,
  IRuleOf150Params,
  ISavingRateParams,
} from './types';

const HUNDRED = new Decimal(100);
const RULE_OF_150 = new Decimal(150);

const round = (value: Decimal) => value.toDecimalPlaces(0, Decimal.ROUND_HALF_CEIL).toNumber();

export const calculateCategoriesTotal = (categories: readonly ICategoryInput[]) => {
  if (!categories?.length) return 0;

  return categories
    .reduce((sum, { currentAmount }) => {
      return sum.plus(Decimal.max(0, currentAmount));
    }, new Decimal(0))
    .toNumber();
};

export const calculateLeftoverIncome = ({
  monthlyIncome,
  categoriesTotal,
  savings = 0,
}: ILeftoverIncomeParams) => {
  return new Decimal(monthlyIncome)
    .minus(categoriesTotal)
    .minus(Decimal.max(0, savings))
    .toNumber();
};

export const calculateSavingRate = ({
  monthlyIncome,
  savings,
}: ISavingRateParams) => {
  if (monthlyIncome <= 0 || savings <= 0) return 0;
  return round(new Decimal(savings).div(monthlyIncome).times(HUNDRED));
};

export const calculateRecommendedMonthlySaving = ({
  monthlyIncome,
  savingRate,
}: IRecommendedSavingParams) => {
  if (monthlyIncome <= 0 || savingRate <= 0) return 0;
  return round(new Decimal(monthlyIncome).times(new Decimal(savingRate).div(HUNDRED)));
};

export const calculateEmergencyCushion = ({
  monthlyExpenses,
  cushionMonths,
}: IEmergencyCushionParams) => {
  if (monthlyExpenses <= 0 || cushionMonths <= 0) return 0;
  return new Decimal(monthlyExpenses).times(cushionMonths).toNumber();
};

export const calculateTargetCapital = ({
  monthlyExpenses,
}: IRuleOf150Params) => {
  if (monthlyExpenses <= 0) return 0;
  return new Decimal(monthlyExpenses).times(RULE_OF_150).toNumber();
};

export const calculatePassiveIncome = (capitalAmount: number): number => {
  if (capitalAmount <= 0) return 0;
  return new Decimal(capitalAmount).div(RULE_OF_150).floor().toNumber();
};
