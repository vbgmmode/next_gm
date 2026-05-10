import type { EntityId, SignalSummary } from "./common.ts";
import type { SocialNarrative } from "./social.ts";

export interface SimulationWeekResult {
  week: number;
  promotionIds: EntityId[];
  showIds: EntityId[];
  changedWrestlerIds: EntityId[];
  changedRivalryIds: EntityId[];
  socialNarratives: SocialNarrative[];
  marketSignals: SignalSummary[];
  financialSignals: SignalSummary[];
  backstageSignals: SignalSummary[];
  summarySignals: SignalSummary[];
}
