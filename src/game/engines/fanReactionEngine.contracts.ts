import type {
  EntityId,
  FanSegment,
  Promotion,
  Rivalry,
  SocialNarrative,
  Wrestler
} from "../domain/index.ts";
import type { HiddenEngineState, SimulationEngineResult } from "./engineSignals.ts";
import type { FanAudienceReadSummary } from "./fanAudienceRead.ts";
import type { FanReactionShowOutputShell } from "./fanReactionShowOutput.ts";
import type { MatchEngineResult } from "./matchEngine.contracts.ts";
import type { ShowFanSocialHandoff } from "./showFanSocialHandoff.ts";
import type {
  ShowFanSocialHandoffValidationConfidenceBand,
  ShowFanSocialHandoffValidationStatus,
  ShowFanSocialHandoffValidationSummary
} from "./showFanSocialHandoffValidation.ts";

export type FanReactionInputMode =
  | "no-handoff"
  | "match-only"
  | "show-handoff"
  | "match-and-show-handoff";

export type FanReactionShowHandoffValidationStatus =
  | "missing"
  | "unvalidated"
  | ShowFanSocialHandoffValidationStatus;

export interface FanReactionShowHandoffInput {
  fanSocialHandoff?: ShowFanSocialHandoff;
  fanSocialHandoffValidation?: ShowFanSocialHandoffValidationSummary;
}

export interface FanReactionShowInput {
  showId?: EntityId;
  handoff?: FanReactionShowHandoffInput;
}

export interface FanReactionInputValidationSummary {
  inputMode: FanReactionInputMode;
  matchHandoffPresent: boolean;
  showHandoffPresent: boolean;
  showHandoffValidationPresent: boolean;
  showHandoffValidationStatus: FanReactionShowHandoffValidationStatus;
  showHandoffValidationConfidence: ShowFanSocialHandoffValidationConfidenceBand;
  showHandoffReadyForFanReaction: boolean;
  showHandoffReadyForSocialDiscourse: boolean;
  showHandoffMatchCount: number;
  showId: EntityId | null;
}

export interface FanReactionEngineInput {
  promotion: Promotion;
  fanSegments: readonly FanSegment[];
  relevantWrestlers: readonly Wrestler[];
  relevantRivalries: readonly Rivalry[];
  priorSocialNarratives: readonly SocialNarrative[];
  matchResult?: MatchEngineResult;
  showInput?: FanReactionShowInput;
}

export type FanReactionSegmentRead = "engaged" | "skeptical" | "interested" | "cooling";

export interface FanReactionHiddenState extends HiddenEngineState {
  reactionRoll: number;
  segmentVarianceRoll: number;
  tractionRoll: number;
  fanSegmentCount: number;
  relevantWrestlerCount: number;
  relevantRivalryCount: number;
  priorNarrativeCount: number;
  matchHandoffPresent: boolean;
  inputMode: FanReactionInputMode;
  showHandoffPresent: boolean;
  showHandoffValidationPresent: boolean;
  showHandoffValidationStatus: FanReactionShowHandoffValidationStatus;
  showHandoffValidationConfidence: ShowFanSocialHandoffValidationConfidenceBand;
  showHandoffReadyForFanReaction: boolean;
  showHandoffReadyForSocialDiscourse: boolean;
  showHandoffMatchCount: number;
  inputValidationSummary: FanReactionInputValidationSummary;
  audienceReadSummary: FanAudienceReadSummary;
  showOutputShell: FanReactionShowOutputShell;
  companyTrustRead: number;
  overexposureConcernRead: number;
  segmentReads: {
    readonly [fanSegmentId: EntityId]: FanReactionSegmentRead;
  };
}

export interface FanReactionEngineResult extends SimulationEngineResult {
  engineName: "fan-reaction";
  hiddenState: FanReactionHiddenState;
  affectedFanSegmentIds: readonly EntityId[];
  affectedWrestlerIds: readonly EntityId[];
  affectedRivalryIds: readonly EntityId[];
}
