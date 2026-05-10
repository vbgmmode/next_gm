import type { NumericRating } from "./common.ts";

export interface BackstageState {
  morale: NumericRating;
  cohesion: NumericRating;
  politics: NumericRating;
  leakRisk: NumericRating;
  injuryConcern: NumericRating;
  creativeConfidence: NumericRating;
}
