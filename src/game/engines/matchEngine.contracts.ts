import type {
  EntityId,
  FanSegment,
  Match,
  Promotion,
  Rivalry,
  Show,
  Wrestler
} from "../domain/index.ts";
import type { HiddenEngineState, SimulationEngineResult } from "./engineSignals.ts";
import type { MatchFinishIntent } from "./matchFinishIntent.ts";
import type { MatchFinishIntentValidationSummary } from "./matchFinishIntentValidation.ts";
import type { MatchFinishReadSummary } from "./matchFinishRead.ts";
import type { MatchReadSummary } from "./matchRead.ts";
import type { MatchResultExecutionGate } from "./matchResultExecutionGate.ts";
import type { MatchResultIntentClassificationSummary } from "./matchResultIntentClassification.ts";
import type { MatchResultShell } from "./matchResultShell.ts";
import type {
  MatchTalentReadSummary,
  ParticipantTalentProfileMap,
  TalentProfileCoverage,
  TalentProfileReadStatus
} from "./matchTalentRead.ts";

export interface MatchEngineInput {
  match: Match;
  show: Show;
  promotion: Promotion;
  participants: readonly Wrestler[];
  fanSegments: readonly FanSegment[];
  rivalry?: Rivalry;
  participantTalentProfiles?: ParticipantTalentProfileMap;
  finishIntent?: MatchFinishIntent;
}

export interface MatchHiddenState extends HiddenEngineState {
  matchRoll: number;
  injuryRiskRoll: number;
  momentumRoll: number;
  plannedMinutes: number;
  participantCount: number;
  skillBalanceGap: number;
  chemistryEstimate: number;
  crowdEngagementRead: number;
  fatiguePressure: {
    readonly [wrestlerId: EntityId]: number;
  };
  talentProfileCoverage: TalentProfileCoverage;
  matchedTalentProfileCount: number;
  missingTalentProfileWrestlerIds: readonly EntityId[];
  talentProfileReadStatus: TalentProfileReadStatus;
  talentReadSummary: MatchTalentReadSummary;
  matchReadSummary: MatchReadSummary;
  finishReadSummary: MatchFinishReadSummary;
  finishIntentValidation: MatchFinishIntentValidationSummary;
  resultShell: MatchResultShell;
  resultExecutionGate: MatchResultExecutionGate;
  resultIntentClassification: MatchResultIntentClassificationSummary;
}

export interface MatchEngineResult extends SimulationEngineResult {
  engineName: "match";
  hiddenState: MatchHiddenState;
  matchId: EntityId;
  changedWrestlerIds: readonly EntityId[];
  changedRivalryIds: readonly EntityId[];
}
