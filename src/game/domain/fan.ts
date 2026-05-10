import type { EntityId, NumericRating } from "./common.ts";

export type FanSegmentKind =
  | "casual"
  | "hardcore"
  | "iwc"
  | "local"
  | "lapsed"
  | "family"
  | "workrate"
  | "story";

export interface FanSegment {
  id: EntityId;
  kind: FanSegmentKind;
  name: string;
  marketShare: NumericRating;
  companyTrust: NumericRating;
  noveltyPreference: NumericRating;
  workratePreference: NumericRating;
  storyPreference: NumericRating;
  metaAwareness: NumericRating;
  toleranceForForcedPushes: NumericRating;
  fatigueSensitivity: NumericRating;
}
