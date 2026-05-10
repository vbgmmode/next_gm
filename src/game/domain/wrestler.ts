import type { EntityId, NumericRating } from "./common.ts";

export type WrestlerAlignment = "face" | "heel" | "tweener";

export interface Wrestler {
  id: EntityId;
  name: string;
  age: number;
  alignment: WrestlerAlignment;
  promotionId: EntityId;
  popularity: NumericRating;
  credibility: NumericRating;
  inRingSkill: NumericRating;
  promoSkill: NumericRating;
  stamina: NumericRating;
  health: NumericRating;
  morale: NumericRating;
  momentum: NumericRating;
  contractCostPerWeek: number;
  traits: string[];
}
