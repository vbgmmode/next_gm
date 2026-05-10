import type { NumericRating } from "./common.ts";

export interface FinancialState {
  cashOnHand: number;
  weeklyRevenue: number;
  weeklyExpenses: number;
  payrollCost: number;
  productionCost: number;
  marketingSpend: number;
  profitabilityTrend: NumericRating;
  budgetPressure: NumericRating;
}
