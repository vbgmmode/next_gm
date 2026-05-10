import type { ShowFanSocialHandoff } from "./showFanSocialHandoff.ts";
import type { ShowFanSocialHandoffValidationSummary } from "./showFanSocialHandoffValidation.ts";

export type ShowFanSocialOrchestrationReadiness =
  | "missing"
  | "partial"
  | "structurally-ready";

export type ShowFanSocialOrchestrationSourceAvailability =
  | "missing"
  | "limited"
  | "available";

export interface ShowFanSocialOrchestrationStageSummary {
  readiness: ShowFanSocialOrchestrationReadiness;
  sourceAvailability: ShowFanSocialOrchestrationSourceAvailability;
}

export interface ShowFanSocialOrchestrationSummary {
  status: ShowFanSocialOrchestrationReadiness;
  ownership: "show-structural-summary-only";
  showFanSocialHandoff: ShowFanSocialOrchestrationStageSummary;
  fanReactionShowOutputShell: ShowFanSocialOrchestrationStageSummary;
  fanSocialDiscourseHandoffDto: ShowFanSocialOrchestrationStageSummary;
  socialDiscourseReadiness: ShowFanSocialOrchestrationStageSummary;
  socialDiscourseOutputShell: ShowFanSocialOrchestrationStageSummary;
}

export interface ShowFanSocialOrchestrationSummaryInput {
  fanSocialHandoff?: ShowFanSocialHandoff;
  fanSocialHandoffValidation?: ShowFanSocialHandoffValidationSummary;
}

export function createShowFanSocialOrchestrationSummary(
  input: ShowFanSocialOrchestrationSummaryInput
): ShowFanSocialOrchestrationSummary {
  const readiness = readinessFor(input);
  const stageSummary = stageSummaryFor(readiness);

  return {
    status: readiness,
    ownership: "show-structural-summary-only",
    showFanSocialHandoff: stageSummary,
    fanReactionShowOutputShell: stageSummary,
    fanSocialDiscourseHandoffDto: stageSummary,
    socialDiscourseReadiness: stageSummary,
    socialDiscourseOutputShell: stageSummary
  };
}

function readinessFor(
  input: ShowFanSocialOrchestrationSummaryInput
): ShowFanSocialOrchestrationReadiness {
  const handoff = input.fanSocialHandoff;
  const validation = input.fanSocialHandoffValidation;

  if (handoff === undefined || validation === undefined) {
    return "missing";
  }

  if (handoff.status === "ready" && validation.status === "ready") {
    return "structurally-ready";
  }

  if (handoff.status === "empty" || validation.status === "empty") {
    return "missing";
  }

  return "partial";
}

function stageSummaryFor(
  readiness: ShowFanSocialOrchestrationReadiness
): ShowFanSocialOrchestrationStageSummary {
  return {
    readiness,
    sourceAvailability: sourceAvailabilityFor(readiness)
  };
}

function sourceAvailabilityFor(
  readiness: ShowFanSocialOrchestrationReadiness
): ShowFanSocialOrchestrationSourceAvailability {
  switch (readiness) {
    case "missing":
      return "missing";
    case "partial":
      return "limited";
    case "structurally-ready":
      return "available";
  }
}
