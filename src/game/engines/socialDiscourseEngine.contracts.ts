import type {
  EntityId,
  Promotion,
  Rivalry,
  SocialNarrative,
  Wrestler
} from "../domain/index.ts";
import type { HiddenEngineState, SimulationEngineResult } from "./engineSignals.ts";
import type { FanReactionEngineResult } from "./fanReactionEngine.contracts.ts";
import type {
  FanSocialDiscourseHandoff,
  FanSocialDiscourseShowSignals,
  FanSocialDiscourseShowOutputReadiness
} from "./fanSocialDiscourseHandoff.ts";
import type { MatchEngineResult } from "./matchEngine.contracts.ts";

export interface SocialDiscourseEngineInput {
  promotion: Promotion;
  relevantWrestlers: readonly Wrestler[];
  relevantRivalries: readonly Rivalry[];
  existingNarratives: readonly SocialNarrative[];
  matchResult?: MatchEngineResult;
  fanReactionResult?: FanReactionEngineResult;
  fanReactionShowHandoff?: FanSocialDiscourseHandoff;
}

export type SocialDiscourseRead =
  | "rising"
  | "pushback"
  | "fragmented"
  | "rumor-active"
  | "praise-cycle";

export type SocialDiscourseShowSignalReadinessStatus = "present" | "missing" | "unusable";

export type SocialDiscourseShowSignalKey = keyof FanSocialDiscourseShowSignals;

export type SocialDiscourseShowSignalReadinessFields = {
  readonly [key in SocialDiscourseShowSignalKey]: SocialDiscourseShowSignalReadinessStatus;
};

export interface SocialDiscourseShowSignalReadinessSummary {
  expectedSignalCount: number;
  presentSignalCount: number;
  missingSignalCount: number;
  unusableSignalCount: number;
  fields: SocialDiscourseShowSignalReadinessFields;
}

export type SocialDiscourseReadinessBucket =
  | "unavailable"
  | "blocked"
  | "limited"
  | "pending"
  | "structurally-ready";

export interface SocialDiscourseReadinessBuckets {
  iwcPulseReadiness: SocialDiscourseReadinessBucket;
  mediaNarrativeReadiness: SocialDiscourseReadinessBucket;
  lockerRoomBuzzReadiness: SocialDiscourseReadinessBucket;
  fanDebateReadiness: SocialDiscourseReadinessBucket;
  trendVolatilityReadiness: SocialDiscourseReadinessBucket;
}

export type SocialDiscourseOutputShellSourceAvailability =
  | "none"
  | "blocked"
  | "limited"
  | "pending"
  | "available";

export interface SocialDiscourseOutputShellCategory {
  status: SocialDiscourseReadinessBucket;
  readiness: SocialDiscourseReadinessBucket;
  sourceAvailability: SocialDiscourseOutputShellSourceAvailability;
}

export interface SocialDiscourseOutputShell {
  sourceEngine: "social-discourse";
  playerFacing: false;
  iwcPulse: SocialDiscourseOutputShellCategory;
  mediaNarrative: SocialDiscourseOutputShellCategory;
  lockerRoomBuzz: SocialDiscourseOutputShellCategory;
  fanDebate: SocialDiscourseOutputShellCategory;
  trendVolatility: SocialDiscourseOutputShellCategory;
}

export interface SocialDiscourseHiddenState extends HiddenEngineState {
  discourseRoll: number;
  rumorRoll: number;
  fragmentationRoll: number;
  existingNarrativeCount: number;
  relevantWrestlerCount: number;
  relevantRivalryCount: number;
  matchHandoffPresent: boolean;
  fanReactionHandoffPresent: boolean;
  fanReactionShowOutputReadiness: FanSocialDiscourseShowOutputReadiness;
  showSignalReadiness: SocialDiscourseShowSignalReadinessSummary;
  discourseReadinessBuckets: SocialDiscourseReadinessBuckets;
  discourseOutputShell: SocialDiscourseOutputShell;
  discourseRead: SocialDiscourseRead;
  updatedNarrativeCount: number;
}

export interface SocialDiscourseEngineResult extends SimulationEngineResult {
  engineName: "social-discourse";
  hiddenState: SocialDiscourseHiddenState;
  producedNarratives: readonly SocialNarrative[];
  updatedNarrativeIds: readonly EntityId[];
}
