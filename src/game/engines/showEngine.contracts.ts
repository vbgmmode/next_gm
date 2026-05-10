import type {
  BackstageState,
  EntityId,
  MarketState,
  Promotion,
  Show
} from "../domain/index.ts";
import type { EngineSignal, HiddenEngineState, SimulationEngineResult } from "./engineSignals.ts";
import type { MatchEngineInput, MatchEngineResult } from "./matchEngine.contracts.ts";
import type { ShowBookingValidationSummary } from "./showBookingValidation.ts";
import type { ShowExecutionOrderPlan } from "./showExecutionOrder.ts";
import type { ShowFanSocialHandoff } from "./showFanSocialHandoff.ts";
import type { ShowFanSocialHandoffValidationSummary } from "./showFanSocialHandoffValidation.ts";
import type { ShowMatchReadinessAggregation } from "./showMatchReadinessAggregation.ts";
import type { ShowFanSocialOrchestrationSummary } from "./showFanSocialOrchestrationSummary.ts";
import type { ShowRunSummary } from "./showRunSummary.ts";

export type ShowReadinessStatus = "empty" | "ready" | "partial" | "failed";

export type ShowMatchRunStatus = "completed" | "failed";

export interface BookedShowMatch {
  id: EntityId;
  orderIndex?: number;
  matchInput: MatchEngineInput;
}

export interface ShowMatchRunSummary {
  bookedMatchId: EntityId;
  matchId: EntityId;
  status: ShowMatchRunStatus;
  matchEngineId: string;
  matchEngineVersion: string;
  resultShellStatus: string;
  resultExecutionGateStatus: string;
  finishIntentType?: string;
  finishValidationStatus?: string;
  resultIntentClassification?: string;
  canExecuteResult: boolean;
  signalGroupCount: number;
  debugTracePresent: boolean;
  failureReason?: string;
}

export interface ShowEngineInput {
  show: Show;
  bookedMatches: readonly BookedShowMatch[];
  promotion?: Promotion;
  marketState?: MarketState;
  backstageState?: BackstageState;
}

export interface ShowHiddenState extends HiddenEngineState {
  bookedMatchCount: number;
  completedMatchEngineRuns: number;
  failedMatchEngineRuns: number;
  showReadinessStatus: ShowReadinessStatus;
  bookingValidation: ShowBookingValidationSummary;
  executionOrder: ShowExecutionOrderPlan;
  runSummary: ShowRunSummary;
  fanSocialHandoff: ShowFanSocialHandoff;
  fanSocialHandoffValidation: ShowFanSocialHandoffValidationSummary;
  fanSocialOrchestrationSummary: ShowFanSocialOrchestrationSummary;
  matchReadinessAggregation: ShowMatchReadinessAggregation;
  matchRunSummaries: readonly ShowMatchRunSummary[];
}

export type ShowPlayerFacingSignal = EngineSignal;

export interface ShowEngineResult extends SimulationEngineResult {
  engineName: "show";
  showId: EntityId;
  hiddenState: ShowHiddenState;
  matchResults: readonly MatchEngineResult[];
}

export type ShowEngineOutput = ShowEngineResult;
