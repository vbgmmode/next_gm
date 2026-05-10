import type { MatchFinishIntentValidationSummary } from "./matchFinishIntentValidation.ts";
import type { MatchFinishReadSummary } from "./matchFinishRead.ts";
import type {
  MatchResultExecutionGate,
  MatchResultExecutionGateStatus
} from "./matchResultExecutionGate.ts";
import type { MatchResultShell, MatchResultShellStatus } from "./matchResultShell.ts";

export type MatchResultIntentClassification =
  | "unavailable"
  | "blocked"
  | "limited"
  | "needs-more-context"
  | "standard-match-ready"
  | "protected-finish-ready";

export type MatchResultIntentClassificationSourceAvailability =
  | "unavailable"
  | "blocked"
  | "limited"
  | "pending"
  | "available";

export interface MatchResultIntentClassificationSummary {
  classification: MatchResultIntentClassification;
  sourceAvailability: MatchResultIntentClassificationSourceAvailability;
  resultShellStatus: MatchResultShellStatus;
  resultExecutionGateStatus: MatchResultExecutionGateStatus;
  finishIntentValidationStatus: MatchFinishIntentValidationSummary["status"];
  finishIntentTypeRead: MatchFinishReadSummary["finishIntentTypeRead"];
}

export interface MatchResultIntentClassificationInput {
  finishReadSummary: MatchFinishReadSummary;
  finishIntentValidation: MatchFinishIntentValidationSummary;
  resultShell: MatchResultShell;
  resultExecutionGate: MatchResultExecutionGate;
}

export function classifyMatchResultIntent(
  input: MatchResultIntentClassificationInput
): MatchResultIntentClassificationSummary {
  const classification = classificationFor(input);

  return {
    classification,
    sourceAvailability: sourceAvailabilityFor(classification),
    resultShellStatus: input.resultShell.status,
    resultExecutionGateStatus: input.resultExecutionGate.status,
    finishIntentValidationStatus: input.finishIntentValidation.status,
    finishIntentTypeRead: input.finishReadSummary.finishIntentTypeRead
  };
}

function classificationFor(
  input: MatchResultIntentClassificationInput
): MatchResultIntentClassification {
  if (
    input.finishIntentValidation.status === "unsupported" ||
    input.resultShell.status === "unavailable" ||
    input.resultExecutionGate.status === "closed"
  ) {
    return "unavailable";
  }

  if (
    input.finishIntentValidation.status === "risky" ||
    input.finishReadSummary.finishRiskRead === "volatile" ||
    input.resultShell.status === "blocked" ||
    input.resultExecutionGate.status === "blocked"
  ) {
    return "blocked";
  }

  if (
    input.finishIntentValidation.status === "underspecified" ||
    input.finishReadSummary.finishIntentTypeRead === "unspecified"
  ) {
    return "needs-more-context";
  }

  if (
    input.finishIntentValidation.status === "questionable" ||
    input.resultShell.status === "pending" ||
    input.resultExecutionGate.status === "pending"
  ) {
    return "limited";
  }

  if (
    input.resultShell.status === "ready_for_execution" &&
    input.resultExecutionGate.status === "open" &&
    input.finishIntentValidation.status === "valid" &&
    input.finishReadSummary.finishProtectionRead === "protected"
  ) {
    return "protected-finish-ready";
  }

  if (
    input.resultShell.status === "ready_for_execution" &&
    input.resultExecutionGate.status === "open" &&
    input.finishIntentValidation.status === "valid"
  ) {
    return "standard-match-ready";
  }

  return "limited";
}

function sourceAvailabilityFor(
  classification: MatchResultIntentClassification
): MatchResultIntentClassificationSourceAvailability {
  switch (classification) {
    case "unavailable":
      return "unavailable";
    case "blocked":
      return "blocked";
    case "limited":
      return "limited";
    case "needs-more-context":
      return "pending";
    case "standard-match-ready":
    case "protected-finish-ready":
      return "available";
  }
}
