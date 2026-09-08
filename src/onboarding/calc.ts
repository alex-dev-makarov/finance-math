import Decimal from 'decimal.js';

import { SAVINGS_STATUS } from './types';
import type {
  ICategoryInput,
  IEmergencyCushionParams,
  ILeftoverIncomeParams,
  IRecommendedSavingParams,
  IRuleOf150Params,
  ISavingRateParams,
  ISavingsStatusParams,
  ISavingsStatusResult,
  SavingsStatus,
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

/**
 * Analyzes savings status based on monthly income and current savings.
 * @param params.monthlyIncome - Monthly gross income in integer minor units (cents).
 * @param params.currentSavings - Current accumulated savings in integer minor units (cents).
 * @param [params.targetPercentage=10] - Target savings as integer percent of monthly income.
 * @returns Object with targetAmount, savedPercentage, status, and shortfall,
 *   all in integer minor units or percent as appropriate.
 *
 */
export const analyzeSavingsStatus = ({
  monthlyIncome,
  currentSavings,
  targetPercentage = 10,
}: ISavingsStatusParams): ISavingsStatusResult => {
  const sanitizedIncome = Number.isFinite(monthlyIncome) ? monthlyIncome : 0;
  const sanitizedSavings = Decimal.max(0, Number.isFinite(currentSavings) ? currentSavings : 0).toNumber();
  const sanitizedPercentage = Decimal.max(0, Number.isFinite(targetPercentage) ? targetPercentage : 0).toNumber();

  const targetAmount = calculateRecommendedMonthlySaving({
    monthlyIncome: sanitizedIncome,
    savingRate: sanitizedPercentage,
  });
  const savedPercentage = calculateSavingRate({
    monthlyIncome: sanitizedIncome,
    savings: sanitizedSavings,
  });

  let status: SavingsStatus;
  if (sanitizedSavings === 0) {
    status = SAVINGS_STATUS.NOT_STARTED;
  } else if (sanitizedSavings >= targetAmount) {
    status = SAVINGS_STATUS.OVER_ACHIEVING;
  } else {
    status = SAVINGS_STATUS.PROGRESSING;
  }

  const shortfall = Decimal.max(0, new Decimal(targetAmount).minus(sanitizedSavings)).toNumber();

  return {
    targetAmount,
    savedPercentage,
    status,
    shortfall,
  };
};
