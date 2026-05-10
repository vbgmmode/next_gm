import type { FanReactionEngineResult } from "./fanReactionEngine.contracts.ts";
import type { FanSocialDiscourseHandoff } from "./fanSocialDiscourseHandoff.ts";
import type { MatchEngineResult } from "./matchEngine.contracts.ts";
import type { ShowEngineResult } from "./showEngine.contracts.ts";
import type { SocialDiscourseEngineResult } from "./socialDiscourseEngine.contracts.ts";

export type EnginePipelineStructuralReadiness =
  | "missing"
  | "limited"
  | "blocked"
  | "partial"
  | "structurally-ready";

export type EnginePipelineStructuralSourceAvailability =
  | "missing"
  | "limited"
  | "blocked"
  | "available";

export interface EnginePipelineStructuralStageSummary {
  readiness: EnginePipelineStructuralReadiness;
  sourceAvailability: EnginePipelineStructuralSourceAvailability;
}

export interface EnginePipelineStructuralSummary {
  summaryVersion: "0.2.0";
  status: EnginePipelineStructuralReadiness;
  ownership: "pipeline-structural-summary-only";
  showStage: EnginePipelineStructuralStageSummary;
  matchStage: EnginePipelineStructuralStageSummary;
  showMatchReadinessStage: EnginePipelineStructuralStageSummary;
  fanReactionStage: EnginePipelineStructuralStageSummary;
  fanSocialHandoffStage: EnginePipelineStructuralStageSummary;
  socialDiscourseStage: EnginePipelineStructuralStageSummary;
}

export interface EnginePipelineStructuralSummaryInput {
  showResult?: ShowEngineResult;
  matchResult?: MatchEngineResult;
  fanReactionResult?: FanReactionEngineResult;
  fanSocialDiscourseHandoff?: FanSocialDiscourseHandoff;
  socialDiscourseResult?: SocialDiscourseEngineResult;
}

export function createEnginePipelineStructuralSummary(
  input: EnginePipelineStructuralSummaryInput
): EnginePipelineStructuralSummary {
  const showStage = stageSummaryFor(showStageReadiness(input.showResult));
  const matchStage = stageSummaryFor(matchStageReadiness(input.matchResult, input.showResult));
  const showMatchReadinessStage = stageSummaryFor(
    showMatchReadinessStageReadiness(input.showResult)
  );
  const fanReactionStage = stageSummaryFor(fanReactionStageReadiness(input.fanReactionResult));
  const fanSocialHandoffStage = stageSummaryFor(
    fanSocialHandoffStageReadiness(
      input.fanSocialDiscourseHandoff,
      input.socialDiscourseResult,
      input.showResult,
      input.fanReactionResult
    )
  );
  const socialDiscourseStage = stageSummaryFor(
    socialDiscourseStageReadiness(input.socialDiscourseResult)
  );

  return {
    summaryVersion: "0.2.0",
    status: overallStatus([
      showStage,
      matchStage,
      showMatchReadinessStage,
      fanReactionStage,
      fanSocialHandoffStage,
      socialDiscourseStage
    ]),
    ownership: "pipeline-structural-summary-only",
    showStage,
    matchStage,
    showMatchReadinessStage,
    fanReactionStage,
    fanSocialHandoffStage,
    socialDiscourseStage
  };
}

function showStageReadiness(
  showResult: ShowEngineResult | undefined
): EnginePipelineStructuralReadiness {
  if (showResult === undefined) {
    return "missing";
  }

  return showResult.hiddenState.showReadinessStatus === "ready"
    ? "structurally-ready"
    : "partial";
}

function showMatchReadinessStageReadiness(
  showResult: ShowEngineResult | undefined
): EnginePipelineStructuralReadiness {
  if (showResult === undefined) {
    return "missing";
  }

  const aggregation = showResult.hiddenState.matchReadinessAggregation;

  if (aggregation === undefined || aggregation.totalMatches === 0) {
    return "missing";
  }

  switch (aggregation.overallMatchReadiness) {
    case "structurally-ready":
      return "structurally-ready";
    case "blocked":
      return "blocked";
    case "limited":
      return "limited";
    case "partial":
      return "partial";
    case "unavailable":
      return "partial";
  }
}

function matchStageReadiness(
  matchResult: MatchEngineResult | undefined,
  showResult: ShowEngineResult | undefined
): EnginePipelineStructuralReadiness {
  if (matchResult !== undefined) {
    return "structurally-ready";
  }

  if (showResult === undefined) {
    return "missing";
  }

  if (showResult.hiddenState.completedMatchEngineRuns > 0 && showResult.hiddenState.failedMatchEngineRuns === 0) {
    return "structurally-ready";
  }

  if (showResult.hiddenState.completedMatchEngineRuns > 0 || showResult.hiddenState.failedMatchEngineRuns > 0) {
    return "partial";
  }

  return "missing";
}

function fanReactionStageReadiness(
  fanReactionResult: FanReactionEngineResult | undefined
): EnginePipelineStructuralReadiness {
  return fanReactionResult === undefined ? "missing" : "structurally-ready";
}

function fanSocialHandoffStageReadiness(
  fanSocialDiscourseHandoff: FanSocialDiscourseHandoff | undefined,
  socialDiscourseResult: SocialDiscourseEngineResult | undefined,
  showResult: ShowEngineResult | undefined,
  fanReactionResult: FanReactionEngineResult | undefined
): EnginePipelineStructuralReadiness {
  if (fanSocialDiscourseHandoff !== undefined) {
    return fanSocialDiscourseHandoff.showOutputReadiness.readyForSocialDiscourseHandoff &&
      fanSocialDiscourseHandoff.showSignals !== null
      ? "structurally-ready"
      : "partial";
  }

  if (socialDiscourseResult !== undefined) {
    const readiness = socialDiscourseResult.hiddenState.fanReactionShowOutputReadiness;

    if (!readiness.provided) {
      return "missing";
    }

    return readiness.readyForSocialDiscourseHandoff ? "structurally-ready" : "partial";
  }

  if (fanReactionResult !== undefined) {
    if (
      fanReactionResult.hiddenState.showHandoffPresent === false &&
      fanReactionResult.hiddenState.matchHandoffPresent === false
    ) {
      return "missing";
    }

    return fanReactionResult.hiddenState.showOutputShell.readyForSocialDiscourseHandoff
      ? "structurally-ready"
      : "partial";
  }

  if (showResult !== undefined) {
    return showResult.hiddenState.fanSocialOrchestrationSummary.showFanSocialHandoff.readiness;
  }

  return "missing";
}

function socialDiscourseStageReadiness(
  socialDiscourseResult: SocialDiscourseEngineResult | undefined
): EnginePipelineStructuralReadiness {
  if (socialDiscourseResult === undefined) {
    return "missing";
  }

  const outputShell = socialDiscourseResult.hiddenState.discourseOutputShell;
  const categoryReadiness = [
    outputShell.iwcPulse.readiness,
    outputShell.mediaNarrative.readiness,
    outputShell.lockerRoomBuzz.readiness,
    outputShell.fanDebate.readiness,
    outputShell.trendVolatility.readiness
  ];

  return categoryReadiness.every((readiness) => readiness === "structurally-ready")
    ? "structurally-ready"
    : "partial";
}

function stageSummaryFor(
  readiness: EnginePipelineStructuralReadiness
): EnginePipelineStructuralStageSummary {
  return {
    readiness,
    sourceAvailability: sourceAvailabilityFor(readiness)
  };
}

function sourceAvailabilityFor(
  readiness: EnginePipelineStructuralReadiness
): EnginePipelineStructuralSourceAvailability {
  switch (readiness) {
    case "missing":
      return "missing";
    case "blocked":
      return "blocked";
    case "limited":
    case "partial":
      return "limited";
    case "structurally-ready":
      return "available";
  }
}

function overallStatus(
  stages: readonly EnginePipelineStructuralStageSummary[]
): EnginePipelineStructuralReadiness {
  if (stages.some((stage) => stage.readiness === "blocked")) {
    return "blocked";
  }

  if (stages.every((stage) => stage.readiness === "structurally-ready")) {
    return "structurally-ready";
  }

  if (stages.every((stage) => stage.readiness === "missing")) {
    return "missing";
  }

  return "partial";
}
