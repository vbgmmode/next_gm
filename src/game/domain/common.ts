export type EntityId = string;

export type NumericRating = number;

export type TrendDirection = "falling" | "stable" | "rising" | "volatile";

export interface SignalSummary {
  label: string;
  trend?: TrendDirection;
  confidence: "low" | "medium" | "high";
}
