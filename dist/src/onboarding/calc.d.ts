import type { ICategoryInput, IEmergencyCushionParams, IRuleOf150Params } from './types';
export declare const calculateCategoriesTotal: (categories: readonly ICategoryInput[]) => number;
export declare const calculateLeftoverIncome: (monthlyIncome: number, categoriesTotal: number) => number;
export declare const calculateEmergencyCushion: ({ monthlyExpenses, cushionMonths, }: IEmergencyCushionParams) => number;
export declare const calculateTargetCapital: ({ monthlyExpenses, }: IRuleOf150Params) => number;
export declare const calculatePassiveIncome: (capitalAmount: number) => number;
