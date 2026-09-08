import { describe, it, expect } from 'vitest'; // If using Jest, this import can be removed as it is available globally
import {
  calculateCategoriesTotal,
  calculateLeftoverIncome,
  calculateEmergencyCushion,
  calculateTargetCapital,
  calculatePassiveIncome,
  calculateSavingRate,
  calculateRecommendedMonthlySaving,
  analyzeSavingsStatus,
} from './calc';
import { SAVINGS_STATUS } from './types';

describe('calculateCategoriesTotal', () => {
  it('should correctly sum all positive expenses', () => {
    const categories = [
      { name: 'rent', currentAmount: 1500000 },
      { name: 'groceries', currentAmount: 800000 },
    ];
    expect(calculateCategoriesTotal(categories)).toBe(2300000);
  });

  it('should ignore negative values in categories', () => {
    const categories = [
      { name: 'rent', currentAmount: 1500000 },
      { name: 'debt', currentAmount: -500000 }, 
    ];
    expect(calculateCategoriesTotal(categories)).toBe(1500000);
  });

  it('should return 0 for an empty array', () => {
    expect(calculateCategoriesTotal([])).toBe(0);
  });
});

describe('calculateLeftoverIncome', () => {
  it('should return the correct leftover if income is greater than expenses', () => {
    expect(calculateLeftoverIncome({ monthlyIncome: 3000000, categoriesTotal: 2300000 })).toBe(700000);
  });

  it('should subtract savings from the leftover', () => {
    expect(
      calculateLeftoverIncome({ monthlyIncome: 3000000, categoriesTotal: 2300000, savings: 200000 }),
    ).toBe(500000);
  });

  it('should treat savings as 0 when omitted or negative', () => {
    expect(calculateLeftoverIncome({ monthlyIncome: 3000000, categoriesTotal: 2300000 })).toBe(700000);
    expect(
      calculateLeftoverIncome({ monthlyIncome: 3000000, categoriesTotal: 2300000, savings: -200000 }),
    ).toBe(700000);
  });

  it('should return a negative value if expenses and savings exceed income (user is in the red)', () => {
    expect(calculateLeftoverIncome({ monthlyIncome: 2000000, categoriesTotal: 2500000 })).toBe(-500000);
    expect(
      calculateLeftoverIncome({ monthlyIncome: 2000000, categoriesTotal: 1900000, savings: 300000 }),
    ).toBe(-200000);
  });

  it('should handle zero income', () => {
    expect(calculateLeftoverIncome({ monthlyIncome: 0, categoriesTotal: 1000000 })).toBe(-1000000);
  });
});

describe('decimal precision', () => {
  it('should sum fractional amounts without floating point drift', () => {
    expect(
      calculateCategoriesTotal([
        { name: 'a', currentAmount: 0.1 },
        { name: 'b', currentAmount: 0.2 },
      ]),
    ).toBe(0.3);
  });

  it('should subtract fractional amounts without floating point drift', () => {
    expect(calculateLeftoverIncome({ monthlyIncome: 0.3, categoriesTotal: 0.1 })).toBe(0.2);
  });

  it('should multiply fractional amounts without floating point drift', () => {
    expect(calculateEmergencyCushion({ monthlyExpenses: 1.1, cushionMonths: 3 })).toBe(3.3);
  });

  it('should apply a fractional saving rate exactly', () => {
    expect(calculateRecommendedMonthlySaving({ monthlyIncome: 1000, savingRate: 1.15 })).toBe(12);
    expect(calculateRecommendedMonthlySaving({ monthlyIncome: 3333.33, savingRate: 12.5 })).toBe(417);
  });
});

describe('calculateSavingRate', () => {
  it('should return the savings share of income as a rounded percentage', () => {
    expect(calculateSavingRate({ monthlyIncome: 3000000, savings: 600000 })).toBe(20);
  });

  it('should round the percentage to the nearest integer', () => {
    expect(calculateSavingRate({ monthlyIncome: 3000000, savings: 500000 })).toBe(17);
  });

  it('should return 0 for zero or negative income or savings', () => {
    expect(calculateSavingRate({ monthlyIncome: 0, savings: 500000 })).toBe(0);
    expect(calculateSavingRate({ monthlyIncome: 3000000, savings: 0 })).toBe(0);
    expect(calculateSavingRate({ monthlyIncome: 3000000, savings: -500000 })).toBe(0);
  });
});

describe('calculateRecommendedMonthlySaving', () => {
  it('should calculate the recommended amount for a custom rate', () => {
    expect(calculateRecommendedMonthlySaving({ monthlyIncome: 3000000, savingRate: 10 })).toBe(300000);
    expect(calculateRecommendedMonthlySaving({ monthlyIncome: 3000000, savingRate: 25 })).toBe(750000);
  });

  it('should round the result to the nearest integer', () => {
    expect(calculateRecommendedMonthlySaving({ monthlyIncome: 3333, savingRate: 15 })).toBe(500);
  });

  it('should return 0 for zero or negative income or rate', () => {
    expect(calculateRecommendedMonthlySaving({ monthlyIncome: 0, savingRate: 10 })).toBe(0);
    expect(calculateRecommendedMonthlySaving({ monthlyIncome: 3000000, savingRate: 0 })).toBe(0);
    expect(calculateRecommendedMonthlySaving({ monthlyIncome: 3000000, savingRate: -10 })).toBe(0);
  });
});

describe('calculateEmergencyCushion', () => {
  it('should correctly calculate the cushion for a given number of months', () => {
    expect(calculateEmergencyCushion({ monthlyExpenses: 2300000, cushionMonths: 6 })).toBe(13800000);
  });

  it('should return 0 if expenses are zero or negative', () => {
    expect(calculateEmergencyCushion({ monthlyExpenses: 0, cushionMonths: 6 })).toBe(0);
    expect(calculateEmergencyCushion({ monthlyExpenses: -100, cushionMonths: 6 })).toBe(0);
  });

  it('should return 0 if the number of months is zero', () => {
    expect(calculateEmergencyCushion({ monthlyExpenses: 2300000, cushionMonths: 0 })).toBe(0);
  });
});

describe('calculateTargetCapital', () => {
  it('should multiply expenses by 150 to calculate target capital', () => {
    expect(calculateTargetCapital({ monthlyExpenses: 20000 })).toBe(3000000);
  });

  it('should return 0 for negative or zero expenses', () => {
    expect(calculateTargetCapital({ monthlyExpenses: 0 })).toBe(0);
    expect(calculateTargetCapital({ monthlyExpenses: -500 })).toBe(0);
  });
});

describe('calculatePassiveIncome', () => {
  it('should correctly calculate monthly passive income from existing capital', () => {
    expect(calculatePassiveIncome(3000000)).toBe(20000);
  });

  it('should round the value down to the nearest integer', () => {
    expect(calculatePassiveIncome(3000100)).toBe(20000);
  });

  it('should return 0 if capital is negative or zero', () => {
    expect(calculatePassiveIncome(0)).toBe(0);
    expect(calculatePassiveIncome(-10000)).toBe(0);
  });
});

describe('analyzeSavingsStatus', () => {
  it('should round 57.5% to 58 for both test cases and match calculateSavingRate', () => {
    const result1 = analyzeSavingsStatus({ monthlyIncome: 200000, currentSavings: 115000 });
    expect(result1.savedPercentage).toBe(58);
    expect(result1.savedPercentage).toBe(
      calculateSavingRate({ monthlyIncome: 200000, savings: 115000 })
    );

    const result2 = analyzeSavingsStatus({ monthlyIncome: 100000, currentSavings: 57500 });
    expect(result2.savedPercentage).toBe(58);
    expect(result2.savedPercentage).toBe(
      calculateSavingRate({ monthlyIncome: 100000, savings: 57500 })
    );
  });

  it('should return correct values for the happy path', () => {
    const result = analyzeSavingsStatus({
      monthlyIncome: 3000000,
      currentSavings: 500000,
      targetPercentage: 10,
    });
    expect(result).toEqual({
      targetAmount: 300000,
      savedPercentage: 17,
      status: SAVINGS_STATUS.OVER_ACHIEVING,
      shortfall: 0,
    });
  });

  it('should return PROGRESSING status when savings are between zero and target', () => {
    const result = analyzeSavingsStatus({
      monthlyIncome: 3000000,
      currentSavings: 100000,
    });
    expect(result.targetAmount).toBe(300000);
    expect(result.shortfall).toBe(200000);
    expect(result.status).toBe(SAVINGS_STATUS.PROGRESSING);
  });

  it('should return NOT_STARTED with non-zero shortfall when savings are zero', () => {
    const result = analyzeSavingsStatus({
      monthlyIncome: 3000000,
      currentSavings: 0,
    });
    expect(result.shortfall).toBe(300000);
    expect(result.status).toBe(SAVINGS_STATUS.NOT_STARTED);
  });

  it('should return OVER_ACHIEVING when savings exactly equal target amount', () => {
    const result = analyzeSavingsStatus({
      monthlyIncome: 1000,
      currentSavings: 100,
    });
    expect(result.status).toBe(SAVINGS_STATUS.OVER_ACHIEVING);
    expect(result.shortfall).toBe(0);
  });

  it('should apply status precedence correctly when savings and target are both zero', () => {
    const result1 = analyzeSavingsStatus({
      monthlyIncome: 1000,
      currentSavings: 0,
      targetPercentage: 0,
    });
    expect(result1.status).toBe(SAVINGS_STATUS.NOT_STARTED);

    const result2 = analyzeSavingsStatus({
      monthlyIncome: 1000,
      currentSavings: 50,
      targetPercentage: 0,
    });
    expect(result2.status).toBe(SAVINGS_STATUS.OVER_ACHIEVING);
    expect(result2.targetAmount).toBe(0);
  });

  it('should handle non-positive income correctly', () => {
    const resultZeroIncome = analyzeSavingsStatus({
      monthlyIncome: 0,
      currentSavings: 0,
    });
    expect(resultZeroIncome.status).toBe(SAVINGS_STATUS.NOT_STARTED);
    expect(resultZeroIncome.targetAmount).toBe(0);
    expect(resultZeroIncome.savedPercentage).toBe(0);
    expect(resultZeroIncome.shortfall).toBe(0);

    const resultZeroIncomeWithSavings = analyzeSavingsStatus({
      monthlyIncome: 0,
      currentSavings: 100,
    });
    expect(resultZeroIncomeWithSavings.status).toBe(SAVINGS_STATUS.OVER_ACHIEVING);
    expect(resultZeroIncomeWithSavings.targetAmount).toBe(0);
    expect(resultZeroIncomeWithSavings.savedPercentage).toBe(0);
    expect(resultZeroIncomeWithSavings.shortfall).toBe(0);

    const resultNegativeIncome = analyzeSavingsStatus({
      monthlyIncome: -5000,
      currentSavings: 100,
    });
    expect(resultNegativeIncome.status).toBe(SAVINGS_STATUS.OVER_ACHIEVING);
    expect(resultNegativeIncome.targetAmount).toBe(0);
    expect(resultNegativeIncome.savedPercentage).toBe(0);
    expect(resultNegativeIncome.shortfall).toBe(0);
  });

  it('should handle non-finite inputs by treating them as 0', () => {
    const resultIncomeNaN = analyzeSavingsStatus({
      monthlyIncome: NaN,
      currentSavings: 0,
    });
    expect(resultIncomeNaN.targetAmount).toBe(0);
    expect(resultIncomeNaN.savedPercentage).toBe(0);

    const resultIncomeInfinity = analyzeSavingsStatus({
      monthlyIncome: Infinity,
      currentSavings: 0,
    });
    expect(resultIncomeInfinity.targetAmount).toBe(0);
    expect(resultIncomeInfinity.savedPercentage).toBe(0);

    const resultIncomeNegInfinity = analyzeSavingsStatus({
      monthlyIncome: -Infinity,
      currentSavings: 0,
    });
    expect(resultIncomeNegInfinity.targetAmount).toBe(0);
    expect(resultIncomeNegInfinity.savedPercentage).toBe(0);

    const resultSavingsNaN = analyzeSavingsStatus({
      monthlyIncome: 1000,
      currentSavings: NaN,
    });
    expect(resultSavingsNaN.targetAmount).toBe(100);
    expect(resultSavingsNaN.status).toBe(SAVINGS_STATUS.NOT_STARTED);

    const resultPercentageNaN = analyzeSavingsStatus({
      monthlyIncome: 1000,
      currentSavings: 0,
      targetPercentage: NaN,
    });
    expect(resultPercentageNaN.targetAmount).toBe(0);
  });

  it('should clamp negative savings to 0 and negative percentage to 0', () => {
    const resultNegativeSavings = analyzeSavingsStatus({
      monthlyIncome: 1000,
      currentSavings: -500,
    });
    expect(resultNegativeSavings.savedPercentage).toBe(0);
    expect(resultNegativeSavings.status).toBe(SAVINGS_STATUS.NOT_STARTED);
    expect(resultNegativeSavings.shortfall).toBe(100);

    const resultNegativePercentage = analyzeSavingsStatus({
      monthlyIncome: 1000,
      currentSavings: 0,
      targetPercentage: -50,
    });
    expect(resultNegativePercentage.targetAmount).toBe(0);
  });

  it('should allow targetPercentage greater than 100 without capping', () => {
    const result = analyzeSavingsStatus({
      monthlyIncome: 1000,
      currentSavings: 2000,
      targetPercentage: 500,
    });
    expect(result.targetAmount).toBe(5000);
    expect(result.status).toBe(SAVINGS_STATUS.PROGRESSING);
    expect(result.shortfall).toBe(3000);
    expect(result.savedPercentage).toBe(200);
  });

  it('should apply the default targetPercentage of 10 when omitted', () => {
    const resultWithDefault = analyzeSavingsStatus({
      monthlyIncome: 1000,
      currentSavings: 500,
    });
    const resultExplicit = analyzeSavingsStatus({
      monthlyIncome: 1000,
      currentSavings: 500,
      targetPercentage: 10,
    });
    expect(resultWithDefault).toEqual(resultExplicit);
  });

  it('should not produce negative zero in shortfall or savedPercentage', () => {
    const result1 = analyzeSavingsStatus({
      monthlyIncome: -0,
      currentSavings: 0,
    });
    expect(Object.is(result1.shortfall, -0)).toBe(false);
    expect(Object.is(result1.savedPercentage, -0)).toBe(false);

    const result2 = analyzeSavingsStatus({
      monthlyIncome: 1000,
      currentSavings: 100,
      targetPercentage: 0,
    });
    expect(Object.is(result2.shortfall, -0)).toBe(false);
    expect(Object.is(result2.savedPercentage, -0)).toBe(false);

    const result3 = analyzeSavingsStatus({
      monthlyIncome: 1000,
      currentSavings: -0,
    });
    expect(Object.is(result3.shortfall, -0)).toBe(false);
    expect(Object.is(result3.savedPercentage, -0)).toBe(false);
  });

  it('should return integer values for all numeric fields', () => {
    const result = analyzeSavingsStatus({
      monthlyIncome: 1001,
      currentSavings: 333,
      targetPercentage: 33,
    });
    expect(Number.isInteger(result.targetAmount)).toBe(true);
    expect(Number.isInteger(result.savedPercentage)).toBe(true);
    expect(Number.isInteger(result.shortfall)).toBe(true);
    expect(result).toEqual({
      targetAmount: 330,
      savedPercentage: 33,
      status: SAVINGS_STATUS.OVER_ACHIEVING,
      shortfall: 0,
    });
  });

  it('should round targetAmount half-up on an exact .5 tie', () => {
    // 50 * 29 / 100 = 14.5 exactly; half-ceil gives 15.
    // Divide-first (50 * (29/100)) drifts to 14.499..., and Math.floor gives 14 —
    // this literal is what pins both.
    expect(
      analyzeSavingsStatus({ monthlyIncome: 50, currentSavings: 0, targetPercentage: 29 })
        .targetAmount
    ).toBe(15);
  });
});