import type { EntityId, NumericRating } from "./common.ts";

export interface MarketState {
  id: EntityId;
  name: string;
  totalAudience: number;
  marketShare: NumericRating;
  growth: NumericRating;
  competitionIntensity: NumericRating;
  mediaAttention: NumericRating;
  ticketDemand: NumericRating;
}
