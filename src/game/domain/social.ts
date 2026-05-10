import type { EntityId, NumericRating, TrendDirection } from "./common.ts";

export interface SocialNarrative {
  id: EntityId;
  topic: string;
  relatedPromotionId?: EntityId;
  relatedWrestlerIds: EntityId[];
  relatedRivalryId?: EntityId;
  sentiment: NumericRating;
  volatility: NumericRating;
  spread: NumericRating;
  credibility: NumericRating;
  trend: TrendDirection;
}
