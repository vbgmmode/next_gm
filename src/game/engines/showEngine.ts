import type { TrendDirection } from "../domain/index.ts";
import { SHOW_ENGINE_V0_ID } from "./engineIds.ts";
import type { EngineSignal, EngineSignalCategory, PlayerFacingSignal } from "./engineSignals.ts";
import { matchEngine } from "./matchEngine.ts";
import { validateShowBooking } from "./showBookingValidation.ts";
import type { ShowBookingValidationSummary } from "./showBookingValidation.ts";
import {
  createShowExecutionOrder,
  getBookedMatchesInExecutionOrder
} from "./showExecutionOrder.ts";
import { createShowFanSocialHandoff } from "./showFanSocialHandoff.ts";
import { validateShowFanSocialHandoff } from "./showFanSocialHandoffValidation.ts";
import { createShowFanSocialOrchestrationSummary } from "./showFanSocialOrchestrationSummary.ts";
import { createShowMatchReadinessAggregation } from "./showMatchReadinessAggregation.ts";
import { createShowRunSummary } from "./showRunSummary.ts";
import type {
  BookedShowMatch,
  ShowEngineInput,
  ShowEngineResult,
  ShowHiddenState,
  ShowMatchRunSummary,
  ShowReadinessStatus
} from "./showEngine.contracts.ts";
import type {
  MatchSimulationEngine,
  ShowSimulationEngine,
  SimulationEngineRunOptions
} from "./simulationEngine.ts";
import type { SimulationEngineContext } from "./engineContext.ts";

export function createShowEngine(
  matchSimulationEngine: MatchSimulationEngine = matchEngine
): ShowSimulationEngine {
  return {
    metadata: {
      id: SHOW_ENGINE_V0_ID,
      name: "Show Engine v0",
      version: "0.8.0"
    },
    run(input, context, options) {
      return runShowEngineV0(input, context, options, matchSimulationEngine);
    }
  };
}

export const showEngine: ShowSimulationEngine = createShowEngine();

function runShowEngineV0(
  input: ShowEngineInput,
  context: SimulationEngineContext,
  options: SimulationEngineRunOptions | undefined,
  matchSimulationEngine: MatchSimulationEngine
): ShowEngineResult {
  const bookingValidation = validateShowBooking(input);
  const executionOrder = createShowExecutionOrder(input);
  const orderedBookedMatches = getBookedMatchesInExecutionOrder(input, executionOrder);
  const matchResults: ReturnType<MatchSimulationEngine["run"]>[] = [];
  const matchRunSummaries: ShowMatchRunSummary[] = [];

  for (const bookedMatch of orderedBookedMatches) {
    try {
      const matchResult = matchSimulationEngine.run(bookedMatch.matchInput, context, options);
      matchResults.push(matchResult);
      matchRunSummaries.push(
        createCompletedMatchRunSummary(bookedMatch, matchSimulationEngine, matchResult)
      );
    } catch (error) {
      matchRunSummaries.push(createFailedMatchRunSummary(bookedMatch, matchSimulationEngine, error));
    }
  }

  const completedMatchEngineRuns = matchResults.length;
  const failedMatchEngineRuns = matchRunSummaries.length - completedMatchEngineRuns;
  const matchReadinessAggregation = createShowMatchReadinessAggregation({
    matchRunSummaries
  });
  const runSummary = createShowRunSummary({
    bookingValidation,
    bookedMatchCount: input.bookedMatches.length,
    completedMatchEngineRuns,
    failedMatchEngineRuns,
    matchRunSummaries
  });
  const fanSocialHandoff = createShowFanSocialHandoff({
    showInput: input,
    bookingValidation,
    executionOrder,
    runSummary,
    matchRunSummaries
  });
  const fanSocialHandoffValidation = validateShowFanSocialHandoff({
    showInput: input,
    fanSocialHandoff
  });
  const fanSocialOrchestrationSummary = createShowFanSocialOrchestrationSummary({
    fanSocialHandoff,
    fanSocialHandoffValidation
  });
  const hiddenState: ShowHiddenState = {
    bookedMatchCount: input.bookedMatches.length,
    completedMatchEngineRuns,
    failedMatchEngineRuns,
    showReadinessStatus: showReadinessStatusFor(
      bookingValidation,
      completedMatchEngineRuns,
      failedMatchEngineRuns
    ),
    bookingValidation,
    executionOrder,
    runSummary,
    fanSocialHandoff,
    fanSocialHandoffValidation,
    fanSocialOrchestrationSummary,
    matchReadinessAggregation,
    matchRunSummaries
  };
  const debugEnabled = options?.debug === true || context.debug === true;

  return {
    engineName: "show",
    showId: input.show.id,
    hiddenState,
    matchResults,
    signals: buildPlayerFacingSignals(input, hiddenState),
    debugTrace: debugEnabled
      ? {
          playerFacing: false,
          engineName: "show",
          steps: [
            "Accepted show input",
            "Validated booked show structure without blocking execution",
            "Prepared hidden show execution order without evaluating card quality",
            "Ran booked matches through Match Engine v0",
            "Collected match engine run summaries",
            "Aggregated hidden match readiness classifications without creating outcomes",
            "Prepared hidden show run summary from match shell statuses",
            "Prepared hidden fan/social handoff shell without calling audience engines",
            "Validated hidden fan/social handoff shell for future orchestration readiness",
            "Prepared hidden fan/social orchestration summary without calling audience or social engines",
            "Returned hidden show shell state and player-facing signals"
          ],
          notes: [
            `Show readiness status: ${hiddenState.showReadinessStatus}.`,
            `Show booking validation: ${bookingValidation.status}, ${bookingValidation.severity}.`,
            `Show execution order: ${executionOrder.status}, ${executionOrder.confidence}.`,
            `Show run summary: ${runSummary.status}, ${runSummary.readiness}, ${runSummary.confidence}.`,
            `Show match readiness aggregation: ${matchReadinessAggregation.overallMatchReadiness}.`,
            `Show fan/social handoff: ${fanSocialHandoff.status}, ${fanSocialHandoff.confidence}.`,
            `Show fan/social handoff validation: ${fanSocialHandoffValidation.status}, ${fanSocialHandoffValidation.confidence}.`,
            `Show fan/social orchestration summary: ${fanSocialOrchestrationSummary.status}.`,
            `Booked match count: ${hiddenState.bookedMatchCount}.`,
            `Completed match engine runs: ${hiddenState.completedMatchEngineRuns}.`,
            `Failed match engine runs: ${hiddenState.failedMatchEngineRuns}.`
          ]
        }
      : undefined
  };
}

function createCompletedMatchRunSummary(
  bookedMatch: BookedShowMatch,
  matchSimulationEngine: MatchSimulationEngine,
  matchResult: ReturnType<MatchSimulationEngine["run"]>
): ShowMatchRunSummary {
  return {
    bookedMatchId: bookedMatch.id,
    matchId: matchResult.matchId,
    status: "completed",
    matchEngineId: matchSimulationEngine.metadata.id,
    matchEngineVersion: matchSimulationEngine.metadata.version ?? "unknown",
    resultShellStatus: matchResult.hiddenState.resultShell.status,
    resultExecutionGateStatus: matchResult.hiddenState.resultExecutionGate.status,
    finishIntentType: matchResult.hiddenState.finishReadSummary.finishIntentTypeRead,
    finishValidationStatus: matchResult.hiddenState.finishIntentValidation.status,
    resultIntentClassification:
      matchResult.hiddenState.resultIntentClassification?.classification ?? "unavailable",
    canExecuteResult: matchResult.hiddenState.resultExecutionGate.canExecuteResult,
    signalGroupCount: matchResult.signals.length,
    debugTracePresent: matchResult.debugTrace !== undefined
  };
}

function createFailedMatchRunSummary(
  bookedMatch: BookedShowMatch,
  matchSimulationEngine: MatchSimulationEngine,
  error: unknown
): ShowMatchRunSummary {
  return {
    bookedMatchId: bookedMatch.id,
    matchId: bookedMatch.matchInput.match.id,
    status: "failed",
    matchEngineId: matchSimulationEngine.metadata.id,
    matchEngineVersion: matchSimulationEngine.metadata.version ?? "unknown",
    resultShellStatus: "unavailable",
    resultExecutionGateStatus: "closed",
    resultIntentClassification: "unavailable",
    canExecuteResult: false,
    signalGroupCount: 0,
    debugTracePresent: false,
    failureReason: error instanceof Error ? error.message : "unknown match engine failure"
  };
}

function showReadinessStatusFor(
  bookingValidation: ShowBookingValidationSummary,
  completedMatchEngineRuns: number,
  failedMatchEngineRuns: number
): ShowReadinessStatus {
  if (bookingValidation.status === "empty") {
    return "empty";
  }

  if (completedMatchEngineRuns > 0) {
    return bookingValidation.status === "ready" && failedMatchEngineRuns === 0 ? "ready" : "partial";
  }

  if (failedMatchEngineRuns > 0) {
    return "failed";
  }

  return bookingValidation.status === "ready" ? "ready" : "partial";
}

function buildPlayerFacingSignals(
  input: ShowEngineInput,
  hiddenState: ShowHiddenState
): readonly EngineSignal[] {
  return [
    {
      subject: "show",
      subjectId: input.show.id,
      signals: [
        createSignal(
          input.show.id,
          hiddenState.showReadinessStatus === "failed" ? "risk" : "momentum",
          labelFor(hiddenState.showReadinessStatus),
          trendFor(hiddenState.showReadinessStatus)
        )
      ]
    }
  ];
}

function createSignal(
  showId: string,
  category: EngineSignalCategory,
  label: string,
  trend: TrendDirection
): PlayerFacingSignal {
  return {
    id: `${showId}-${label.replaceAll(" ", "-")}`,
    subject: "show",
    subjectId: showId,
    category,
    label,
    confidence: "medium",
    trend,
    sourceEngine: "show"
  };
}

function labelFor(status: ShowReadinessStatus): string {
  switch (status) {
    case "empty":
      return "card needs matches";
    case "ready":
      return "card processed";
    case "partial":
      return "card needs attention";
    case "failed":
      return "show shell needs attention";
  }
}

function trendFor(status: ShowReadinessStatus): TrendDirection {
  switch (status) {
    case "ready":
      return "stable";
    case "empty":
    case "partial":
    case "failed":
      return "volatile";
  }
}
