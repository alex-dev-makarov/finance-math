import { describe, it, expect } from 'vitest'; // If using Jest, this import can be removed as it is available globally
import {
  calculateCategoriesTotal,
  calculateLeftoverIncome,
  calculateEmergencyCushion,
  calculateTargetCapital,
  calculatePassiveIncome,
  calculateSavingRate,
  calculateRecommendedMonthlySaving,
} from './calc';

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