import type {
  ICategoryInput,
  IEmergencyCushionParams,
  ILeftoverIncomeParams,
  IRecommendedSavingParams,
  IRuleOf150Params,
  ISavingRateParams,
} from './types';

export const calculateCategoriesTotal = (categories: readonly ICategoryInput[]) => {
  if (!categories?.length) return 0;
  
  return categories.reduce((sum, { currentAmount }) => {
    return sum + Math.max(0, currentAmount);
  }, 0);
};

export const calculateLeftoverIncome = ({
  monthlyIncome,
  categoriesTotal,
  savings = 0,
}: ILeftoverIncomeParams) => {
  return monthlyIncome - categoriesTotal - Math.max(0, savings);
};

export const calculateSavingRate = ({
  monthlyIncome,
  savings,
}: ISavingRateParams) => {
  if (monthlyIncome <= 0 || savings <= 0) return 0;
  return Math.round((savings / monthlyIncome) * 100);
};

export const calculateRecommendedMonthlySaving = ({
  monthlyIncome,
  savingRate,
}: IRecommendedSavingParams) => {
  if (monthlyIncome <= 0 || savingRate <= 0) return 0;
  return Math.round(monthlyIncome * (savingRate / 100));
};

export const calculateEmergencyCushion = ({
  monthlyExpenses,
  cushionMonths,
}: IEmergencyCushionParams) => {
  if (monthlyExpenses <= 0 || cushionMonths <= 0) return 0;
  return monthlyExpenses * cushionMonths;
};

export const calculateTargetCapital = ({
  monthlyExpenses,
}: IRuleOf150Params) => {
  if (monthlyExpenses <= 0) return 0;
  return monthlyExpenses * 150;
};

export const calculatePassiveIncome = (capitalAmount: number): number => {
  if (capitalAmount <= 0) return 0;
  return Math.floor(capitalAmount / 150);
};