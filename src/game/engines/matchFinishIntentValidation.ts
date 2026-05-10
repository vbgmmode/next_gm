import type { MatchFinishIntent } from "./matchFinishIntent.ts";
import { normalizeMatchFinishIntent } from "./matchFinishIntent.ts";
import type { MatchReadSummary } from "./matchRead.ts";
import type { MatchTalentReadSummary } from "./matchTalentRead.ts";

export type MatchFinishIntentValidationStatus =
  | "valid"
  | "underspecified"
  | "questionable"
  | "risky"
  | "unsupported";

export type MatchFinishIntentValidationSeverity =
  | "none"
  | "low"
  | "moderate"
  | "high";

export type MatchFinishIntentValidationConfidenceBand =
  | "unknown"
  | "low"
  | "moderate"
  | "high";

export type MatchFinishIntentValidationReason =
  | "finish-intent-unspecified"
  | "finish-intent-supported"
  | "finish-intent-unsupported"
  | "missing-talent-coverage"
  | "partial-talent-coverage"
  | "multi-participant-clean-finish"
  | "short-planned-draw"
  | "draw-without-time-limit-context"
  | "stoppage-without-risk-pressure"
  | "high-controversy-intent"
  | "disputed-protection-intent"
  | "exposed-protection-intent"
  | "risky-finish-shape"
  | "hidden-match-risk-pressure";

export interface MatchFinishIntentValidationSummary {
  status: MatchFinishIntentValidationStatus;
  severity: MatchFinishIntentValidationSeverity;
  reasons: readonly MatchFinishIntentValidationReason[];
  confidenceBand: MatchFinishIntentValidationConfidenceBand;
}

export interface MatchFinishIntentValidationInput {
  finishIntent?: MatchFinishIntent;
  matchReadSummary: MatchReadSummary;
  talentReadSummary: MatchTalentReadSummary;
  participantCount: number;
  plannedMinutes: number;
  stipulation?: string;
}

export function validateMatchFinishIntent(
  input: MatchFinishIntentValidationInput
): MatchFinishIntentValidationSummary {
  const finishIntent = normalizeMatchFinishIntent(input.finishIntent);
  const reasons = new Set<MatchFinishIntentValidationReason>();
  const hasTimeLimitContext = input.stipulation?.toLowerCase().includes("time") === true;
  const supportedTypes = new Set([
    "unspecified",
    "clean",
    "dirty",
    "interference",
    "non_finish",
    "draw",
    "stoppage"
  ]);

  if (!supportedTypes.has(finishIntent.type)) {
    reasons.add("finish-intent-unsupported");
  }

  if (finishIntent.type === "unspecified") {
    reasons.add("finish-intent-unspecified");
  } else {
    reasons.add("finish-intent-supported");
  }

  if (input.talentReadSummary.participantCoverage === "none") {
    reasons.add("missing-talent-coverage");
  } else if (input.talentReadSummary.participantCoverage === "partial") {
    reasons.add("partial-talent-coverage");
  }

  if (finishIntent.type === "clean" && input.participantCount >= 3) {
    reasons.add("multi-participant-clean-finish");
  }

  if (finishIntent.type === "draw") {
    if (input.plannedMinutes < 15) {
      reasons.add("short-planned-draw");
    }

    if (!hasTimeLimitContext) {
      reasons.add("draw-without-time-limit-context");
    }
  }

  if (
    finishIntent.type === "stoppage" &&
    input.matchReadSummary.riskPressureRead !== "elevated"
  ) {
    reasons.add("stoppage-without-risk-pressure");
  }

  if (finishIntent.controversy === "high") {
    reasons.add("high-controversy-intent");
  }

  if (finishIntent.protection === "disputed") {
    reasons.add("disputed-protection-intent");
  }

  if (finishIntent.protection === "exposed") {
    reasons.add("exposed-protection-intent");
  }

  if (
    finishIntent.type === "dirty" ||
    finishIntent.type === "interference" ||
    finishIntent.type === "non_finish"
  ) {
    reasons.add("risky-finish-shape");
  }

  if (
    input.matchReadSummary.riskPressureRead === "elevated" ||
    input.matchReadSummary.readinessRead === "poor"
  ) {
    reasons.add("hidden-match-risk-pressure");
  }

  return summarizeValidation([...reasons]);
}

function summarizeValidation(
  reasons: readonly MatchFinishIntentValidationReason[]
): MatchFinishIntentValidationSummary {
  if (reasons.includes("finish-intent-unsupported")) {
    return {
      status: "unsupported",
      severity: "high",
      reasons,
      confidenceBand: "low"
    };
  }

  if (reasons.includes("finish-intent-unspecified")) {
    return {
      status: "underspecified",
      severity: reasons.includes("missing-talent-coverage") ? "moderate" : "low",
      reasons,
      confidenceBand: reasons.includes("missing-talent-coverage") ? "unknown" : "low"
    };
  }

  if (
    reasons.includes("high-controversy-intent") ||
    reasons.includes("hidden-match-risk-pressure") ||
    reasons.includes("short-planned-draw") ||
    reasons.includes("stoppage-without-risk-pressure") ||
    reasons.includes("exposed-protection-intent")
  ) {
    return {
      status: "risky",
      severity: "high",
      reasons,
      confidenceBand: "low"
    };
  }

  if (
    reasons.includes("risky-finish-shape") ||
    reasons.includes("multi-participant-clean-finish") ||
    reasons.includes("draw-without-time-limit-context") ||
    reasons.includes("disputed-protection-intent") ||
    reasons.includes("partial-talent-coverage")
  ) {
    return {
      status: "questionable",
      severity: "moderate",
      reasons,
      confidenceBand: "moderate"
    };
  }

  return {
    status: "valid",
    severity: "none",
    reasons,
    confidenceBand: "high"
  };
}
