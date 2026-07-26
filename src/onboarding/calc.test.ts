import { describe, it, expect } from 'vitest'; // If using Jest, this import can be removed as it is available globally
import {
  calculateCategoriesTotal,
  calculateLeftoverIncome,
  calculateEmergencyCushion,
  calculateTargetCapital,
  calculatePassiveIncome,
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
    expect(calculateLeftoverIncome(3000000, 2300000)).toBe(700000);
  });

  it('should return a negative value if expenses exceed income (user is in the red)', () => {
    expect(calculateLeftoverIncome(2000000, 2500000)).toBe(-500000);
  });

  it('should handle zero income', () => {
    expect(calculateLeftoverIncome(0, 1000000)).toBe(-1000000);
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