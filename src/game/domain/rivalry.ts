import type { EntityId, NumericRating } from "./common.ts";

export type RivalryBeatType =
  | "match"
  | "promo"
  | "backstage"
  | "social"
  | "press"
  | "turn"
  | "injury";

export interface RivalryBeat {
  id: EntityId;
  week: number;
  type: RivalryBeatType;
  participantIds: EntityId[];
  summarySignal: string;
}

export interface Rivalry {
  id: EntityId;
  promotionId: EntityId;
  participantIds: EntityId[];
  title: string;
  heat: NumericRating;
  clarity: NumericRating;
  freshness: NumericRating;
  polarization: NumericRating;
  beats: RivalryBeat[];
}
