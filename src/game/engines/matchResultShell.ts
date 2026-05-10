import type { MatchFinishIntentValidationSummary } from "./matchFinishIntentValidation.ts";
import type { MatchFinishReadSummary } from "./matchFinishRead.ts";
import type { MatchReadSummary } from "./matchRead.ts";
import type { MatchTalentReadSummary } from "./matchTalentRead.ts";

export type MatchResultShellStatus =
  | "unavailable"
  | "pending"
  | "blocked"
  | "ready_for_execution";

export type MatchResultReadinessBand = "unknown" | "low" | "moderate" | "high";

export type MatchResultShellConfidence = "unknown" | "low" | "moderate" | "high";

export type MatchResultShellReason =
  | "finish-intent-underspecified"
  | "finish-intent-valid"
  | "finish-intent-questionable"
  | "finish-intent-risky"
  | "finish-intent-unsupported"
  | "finish-read-volatile"
  | "finish-read-stable"
  | "missing-talent-coverage"
  | "partial-talent-coverage"
  | "match-read-risk-pressure";

export interface MatchResultShell {
  status: MatchResultShellStatus;
  readiness: MatchResultReadinessBand;
  confidence: MatchResultShellConfidence;
  reasons: readonly MatchResultShellReason[];
  hasWinner: false;
  hasFinish: false;
  hasRating: false;
  hasConsequences: false;
}

export interface MatchResultShellInput {
  matchReadSummary: MatchReadSummary;
  finishReadSummary: MatchFinishReadSummary;
  finishIntentValidation: MatchFinishIntentValidationSummary;
  talentReadSummary: MatchTalentReadSummary;
}

export function createMatchResultShell(input: MatchResultShellInput): MatchResultShell {
  const reasons = new Set<MatchResultShellReason>();

  addValidationReason(input.finishIntentValidation.status, reasons);
  addCoverageReason(input.talentReadSummary.participantCoverage, reasons);

  if (input.finishReadSummary.finishRiskRead === "volatile") {
    reasons.add("finish-read-volatile");
  } else if (input.finishReadSummary.finishRiskRead === "stable") {
    reasons.add("finish-read-stable");
  }

  if (
    input.matchReadSummary.riskPressureRead === "elevated" ||
    input.matchReadSummary.readinessRead === "poor"
  ) {
    reasons.add("match-read-risk-pressure");
  }

  return {
    status: statusFor(input.finishIntentValidation, input.finishReadSummary),
    readiness: readinessFor(input.finishIntentValidation, input.talentReadSummary),
    confidence: confidenceFor(input.finishIntentValidation, input.talentReadSummary),
    reasons: [...reasons],
    hasWinner: false,
    hasFinish: false,
    hasRating: false,
    hasConsequences: false
  };
}

function addValidationReason(
  status: MatchFinishIntentValidationSummary["status"],
  reasons: Set<MatchResultShellReason>
): void {
  switch (status) {
    case "valid":
      reasons.add("finish-intent-valid");
      return;
    case "underspecified":
      reasons.add("finish-intent-underspecified");
      return;
    case "questionable":
      reasons.add("finish-intent-questionable");
      return;
    case "risky":
      reasons.add("finish-intent-risky");
      return;
    case "unsupported":
      reasons.add("finish-intent-unsupported");
      return;
  }
}

function addCoverageReason(
  coverage: MatchTalentReadSummary["participantCoverage"],
  reasons: Set<MatchResultShellReason>
): void {
  switch (coverage) {
    case "none":
      reasons.add("missing-talent-coverage");
      return;
    case "partial":
      reasons.add("partial-talent-coverage");
      return;
    case "full":
      return;
  }
}

function statusFor(
  validation: MatchFinishIntentValidationSummary,
  finishRead: MatchFinishReadSummary
): MatchResultShellStatus {
  if (validation.status === "unsupported") {
    return "unavailable";
  }

  if (validation.status === "risky" || finishRead.finishRiskRead === "volatile") {
    return "blocked";
  }

  if (validation.status === "underspecified" || validation.status === "questionable") {
    return "pending";
  }

  return "ready_for_execution";
}

function readinessFor(
  validation: MatchFinishIntentValidationSummary,
  talentReadSummary: MatchTalentReadSummary
): MatchResultReadinessBand {
  if (validation.status === "unsupported") {
    return "unknown";
  }

  if (validation.status === "risky") {
    return "low";
  }

  if (validation.status === "underspecified" || validation.status === "questionable") {
    return "moderate";
  }

  return talentReadSummary.participantCoverage === "full" ? "high" : "moderate";
}

function confidenceFor(
  validation: MatchFinishIntentValidationSummary,
  talentReadSummary: MatchTalentReadSummary
): MatchResultShellConfidence {
  if (validation.status === "unsupported") {
    return "unknown";
  }

  if (talentReadSummary.participantCoverage === "none") {
    return "unknown";
  }

  if (validation.status === "risky") {
    return "low";
  }

  if (validation.status === "underspecified" || validation.status === "questionable") {
    return "moderate";
  }

  return "high";
}
