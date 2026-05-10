import type { EntityId, NumericRating, TrendDirection } from "./common.ts";

export interface TalentAttributes {
  inRingSkill: NumericRating;
  promoSkill: NumericRating;
  charisma: NumericRating;
  starPower: NumericRating;
  athleticism: NumericRating;
  psychology: NumericRating;
  selling: NumericRating;
  toughness: NumericRating;
  consistency: NumericRating;
  safety: NumericRating;
  creativity: NumericRating;
  marketability: NumericRating;
}

export interface TalentConditionState {
  stamina: NumericRating;
  fatigue: NumericRating;
  injuryRisk: NumericRating;
  wearAndTear: NumericRating;
  freshness: NumericRating;
  overexposure: NumericRating;
}

export interface TalentMomentumState {
  momentum: NumericRating;
  confidence: NumericRating;
  recentProtection: NumericRating;
  recentLossPressure: NumericRating;
  pushMomentum: NumericRating;
  coolingRisk: NumericRating;
}

export interface TalentPerceptionState {
  casualAppeal: NumericRating;
  hardcoreAppeal: NumericRating;
  promoConnection: NumericRating;
  crowdConnection: NumericRating;
  credibility: NumericRating;
  polarizingEffect: NumericRating;
  forcedPushRisk: NumericRating;
}

export interface TalentBackstageProfile {
  morale: NumericRating;
  ego: NumericRating;
  professionalism: NumericRating;
  creativeFrustration: NumericRating;
  backstageInfluence: NumericRating;
  lockerRoomReputation: NumericRating;
}

export type TalentScoutingSignalCategory =
  | "ability"
  | "condition"
  | "momentum"
  | "perception"
  | "backstage"
  | "risk";

export interface TalentScoutingSignal {
  id: EntityId;
  wrestlerId: EntityId;
  category: TalentScoutingSignalCategory;
  label: string;
  confidence: "low" | "medium" | "high";
  trend?: TrendDirection;
}

export interface TalentScoutingReport {
  wrestlerId: EntityId;
  signals: readonly TalentScoutingSignal[];
}

export interface TalentProfile {
  id: EntityId;
  wrestlerId: EntityId;
  attributes: TalentAttributes;
  condition: TalentConditionState;
  momentum: TalentMomentumState;
  perception: TalentPerceptionState;
  backstage: TalentBackstageProfile;
  scoutingReport: TalentScoutingReport;
}
