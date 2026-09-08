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
 *
 * Determines whether savings goals are being met by comparing actual savings
 * to a target amount (calculated as a percentage of monthly income). Returns
 * the target amount, current savings percentage, status, and shortfall.
 *
 * Edge cases:
 * - Non-finite input values (NaN, Infinity, -Infinity) are treated as 0.
 * - Negative currentSavings is clamped to 0.
 * - Negative targetPercentage is clamped to 0 (values >100 are allowed).
 * - If monthlyIncome <= 0, returns all-zero numbers with status derived from
 *   clamped savings (savings 0 → NOT_STARTED, savings >0 → OVER_ACHIEVING).
 * - Status precedence, in order: currentSavings === 0 → NOT_STARTED (wins even
 *   when targetAmount is also 0); currentSavings >= targetAmount → OVER_ACHIEVING
 *   (includes exact equality); otherwise PROGRESSING.
 * - shortfall is the full targetAmount for NOT_STARTED (itself 0 when
 *   targetPercentage is 0 or monthlyIncome is non-positive).
 * - Inputs beyond roughly 1.79e306 minor units can overflow to Infinity in
 *   the returned fields, since only inputs (not intermediate results) are
 *   sanitized — far outside any real monetary range.
 *
 * @param params
 * @param params.monthlyIncome - Monthly gross income in integer minor units (cents).
 * @param params.currentSavings - Current accumulated savings in integer minor units (cents).
 * @param [params.targetPercentage=10] - Target savings as integer percent of monthly income.
 * @returns Object with targetAmount, savedPercentage, status, and shortfall,
 *   all in integer minor units or percent as appropriate.
 *
 * @example
 * // User earning $30,000/month (3000000 cents) with $5,000 saved (500000 cents)
 * analyzeSavingsStatus({
 *   monthlyIncome: 3000000,
 *   currentSavings: 500000,
 *   targetPercentage: 10
 * });
 * // Returns:
 * // {
 * //   targetAmount: 300000,        // 10% of 3000000
 * //   savedPercentage: 17,         // Math.round(500000 * 100 / 3000000)
 * //   status: 'OVER_ACHIEVING',    // 500000 >= 300000
 * //   shortfall: 0                 // max(0, 300000 - 500000)
 * // }
 */
export const analyzeSavingsStatus = ({
  monthlyIncome,
  currentSavings,
  targetPercentage = 10,
}: ISavingsStatusParams): ISavingsStatusResult => {
  // Sanitize inputs
  const sanitizedIncome = Number.isFinite(monthlyIncome) ? monthlyIncome : 0;
  const sanitizedSavings = Math.max(0, Number.isFinite(currentSavings) ? currentSavings : 0);
  const sanitizedPercentage = Math.max(0, Number.isFinite(targetPercentage) ? targetPercentage : 0);

  // Handle non-positive income
  if (sanitizedIncome <= 0) {
    // Derive status from clamped savings
    const status: SavingsStatus = sanitizedSavings === 0
      ? SAVINGS_STATUS.NOT_STARTED
      : SAVINGS_STATUS.OVER_ACHIEVING;
    return {
      targetAmount: 0,
      savedPercentage: 0,
      status,
      shortfall: 0,
    };
  }

  // Multiply before divide to avoid float drift
  const targetAmount = Math.round(sanitizedIncome * sanitizedPercentage / 100);

  // Multiply before divide to avoid float drift
  const savedPercentage = Math.round((sanitizedSavings * 100) / sanitizedIncome);

  // Derive status and shortfall from the rounded integer target, never a raw float
  let status: SavingsStatus;
  if (sanitizedSavings === 0) {
    status = SAVINGS_STATUS.NOT_STARTED;
  } else if (sanitizedSavings >= targetAmount) {
    status = SAVINGS_STATUS.OVER_ACHIEVING;
  } else {
    status = SAVINGS_STATUS.PROGRESSING;
  }

  const shortfall = Math.max(0, targetAmount - sanitizedSavings);

  return {
    targetAmount,
    savedPercentage,
    status,
    shortfall,
  };
};
