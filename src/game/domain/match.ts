import type { EntityId } from "./common.ts";

export type MatchFinishType =
  | "clean"
  | "dirty"
  | "draw"
  | "disqualification"
  | "countout"
  | "no-contest";

export interface MatchParticipant {
  wrestlerId: EntityId;
  sideId: EntityId;
}

export interface Match {
  id: EntityId;
  showId: EntityId;
  participantIds: MatchParticipant[];
  rivalryId?: EntityId;
  stipulation?: string;
  plannedWinnerId?: EntityId;
  actualWinnerId?: EntityId;
  finishType?: MatchFinishType;
  plannedMinutes: number;
  stakes: "low" | "medium" | "high" | "major";
}
