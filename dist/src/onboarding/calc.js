export const calculateCategoriesTotal = (categories) => {
    if (!categories?.length)
        return 0;
    return categories.reduce((sum, { currentAmount }) => {
        return sum + Math.max(0, currentAmount);
    }, 0);
};
export const calculateLeftoverIncome = (monthlyIncome, categoriesTotal) => {
    return monthlyIncome - categoriesTotal;
};
export const calculateEmergencyCushion = ({ monthlyExpenses, cushionMonths, }) => {
    if (monthlyExpenses <= 0 || cushionMonths <= 0)
        return 0;
    return monthlyExpenses * cushionMonths;
};
export const calculateTargetCapital = ({ monthlyExpenses, }) => {
    if (monthlyExpenses <= 0)
        return 0;
    return monthlyExpenses * 150;
};
export const calculatePassiveIncome = (capitalAmount) => {
    if (capitalAmount <= 0)
        return 0;
    return Math.floor(capitalAmount / 150);
};
