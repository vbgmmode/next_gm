import type { EntityId } from "./common.ts";

export interface ShowSegment {
  id: EntityId;
  type: "match" | "promo" | "backstage" | "announcement";
  matchId?: EntityId;
  involvedWrestlerIds: EntityId[];
  rivalryId?: EntityId;
  plannedMinutes: number;
}

export interface Show {
  id: EntityId;
  promotionId: EntityId;
  name: string;
  week: number;
  marketId: EntityId;
  venueName?: string;
  segmentIds: EntityId[];
  segments: ShowSegment[];
  budgetAllocated: number;
}
