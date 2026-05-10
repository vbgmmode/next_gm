import type { EntityId } from "../domain/index.ts";
import type { ShowBookingValidationSummary } from "./showBookingValidation.ts";
import type { ShowExecutionOrderPlan } from "./showExecutionOrder.ts";
import type { ShowEngineInput, ShowMatchRunSummary } from "./showEngine.contracts.ts";
import type { ShowRunSummary } from "./showRunSummary.ts";

export type ShowFanSocialHandoffStatus = "unavailable" | "empty" | "partial" | "ready";

export type ShowFanSocialHandoffConfidenceBand = "unknown" | "low" | "moderate" | "strong";

export type ShowFanSocialHandoffIssue =
  | "no-booked-matches"
  | "missing-execution-order"
  | "missing-run-summary"
  | "missing-booking-validation"
  | "match-run-failures"
  | "missing-match-summaries"
  | "missing-match-ids";

export interface ShowMatchHandoffSummary {
  bookedMatchId: EntityId;
  matchId: EntityId;
  position: number;
  isOpener: boolean;
  isMainEvent: boolean;
  matchEngineStatus: "completed" | "failed" | "missing";
  resultGateStatus?: string;
  resultShellStatus?: string;
  finishIntentType?: string;
  finishValidationStatus?: string;
}

export interface ShowFanSocialHandoff {
  status: ShowFanSocialHandoffStatus;
  confidence: ShowFanSocialHandoffConfidenceBand;
  issues: readonly ShowFanSocialHandoffIssue[];
  showId: EntityId;
  promotionId?: EntityId;
  matchCount: number;
  orderedMatchSummaries: readonly ShowMatchHandoffSummary[];
  hasExecutionOrder: boolean;
  hasRunSummary: boolean;
  hasBookingValidation: boolean;
}

export interface ShowFanSocialHandoffInput {
  showInput: ShowEngineInput;
  bookingValidation: ShowBookingValidationSummary;
  executionOrder: ShowExecutionOrderPlan;
  runSummary: ShowRunSummary;
  matchRunSummaries: readonly ShowMatchRunSummary[];
}

export function createShowFanSocialHandoff(
  input: ShowFanSocialHandoffInput
): ShowFanSocialHandoff {
  const orderedMatchSummaries = createOrderedMatchSummaries(
    input.executionOrder,
    input.matchRunSummaries
  );
  const issues = collectIssues(input, orderedMatchSummaries);

  return {
    status: statusFor(input, issues),
    confidence: confidenceFor(input, issues),
    issues,
    showId: input.showInput.show.id,
    promotionId: input.showInput.promotion?.id ?? input.showInput.show.promotionId,
    matchCount: input.showInput.bookedMatches.length,
    orderedMatchSummaries,
    hasExecutionOrder: input.executionOrder.entries.length > 0,
    hasRunSummary: true,
    hasBookingValidation: true
  };
}

function createOrderedMatchSummaries(
  executionOrder: ShowExecutionOrderPlan,
  matchRunSummaries: readonly ShowMatchRunSummary[]
): ShowMatchHandoffSummary[] {
  const remainingSummaries = [...matchRunSummaries];

  return executionOrder.entries.map((entry) => {
    const summaryIndex = remainingSummaries.findIndex(
      (summary) => summary.bookedMatchId === entry.bookedMatchId && summary.matchId === entry.matchId
    );
    const summary =
      summaryIndex >= 0 ? remainingSummaries.splice(summaryIndex, 1)[0] : undefined;

    return {
      bookedMatchId: entry.bookedMatchId,
      matchId: entry.matchId,
      position: entry.position,
      isOpener: entry.isOpener,
      isMainEvent: entry.isMainEvent,
      matchEngineStatus: summary?.status ?? "missing",
      resultGateStatus: summary?.resultExecutionGateStatus,
      resultShellStatus: summary?.resultShellStatus,
      finishIntentType: summary?.finishIntentType,
      finishValidationStatus: summary?.finishValidationStatus
    };
  });
}

function collectIssues(
  input: ShowFanSocialHandoffInput,
  orderedMatchSummaries: readonly ShowMatchHandoffSummary[]
): ShowFanSocialHandoffIssue[] {
  const issues = new Set<ShowFanSocialHandoffIssue>();

  if (input.showInput.bookedMatches.length === 0) {
    issues.add("no-booked-matches");
  }

  if (input.executionOrder.entries.length === 0 && input.showInput.bookedMatches.length > 0) {
    issues.add("missing-execution-order");
  }

  if (input.runSummary.status === "failed" || input.runSummary.status === "partial") {
    issues.add("match-run-failures");
  }

  if (orderedMatchSummaries.some((summary) => summary.matchEngineStatus === "missing")) {
    issues.add("missing-match-summaries");
  }

  if (orderedMatchSummaries.some((summary) => summary.matchId.length === 0)) {
    issues.add("missing-match-ids");
  }

  return [...issues];
}

function statusFor(
  input: ShowFanSocialHandoffInput,
  issues: readonly ShowFanSocialHandoffIssue[]
): ShowFanSocialHandoffStatus {
  if (input.showInput.bookedMatches.length === 0) {
    return "empty";
  }

  if (
    issues.includes("missing-execution-order") ||
    issues.includes("missing-run-summary") ||
    issues.includes("missing-booking-validation")
  ) {
    return "unavailable";
  }

  if (
    issues.includes("match-run-failures") ||
    issues.includes("missing-match-summaries") ||
    issues.includes("missing-match-ids")
  ) {
    return "partial";
  }

  return "ready";
}

function confidenceFor(
  input: ShowFanSocialHandoffInput,
  issues: readonly ShowFanSocialHandoffIssue[]
): ShowFanSocialHandoffConfidenceBand {
  if (input.showInput.bookedMatches.length === 0) {
    return "unknown";
  }

  if (
    issues.includes("missing-execution-order") ||
    issues.includes("missing-run-summary") ||
    issues.includes("missing-booking-validation")
  ) {
    return "low";
  }

  if (
    issues.includes("match-run-failures") ||
    issues.includes("missing-match-summaries") ||
    issues.includes("missing-match-ids") ||
    input.bookingValidation.status === "risky" ||
    input.bookingValidation.status === "invalid" ||
    input.executionOrder.status === "partial" ||
    input.executionOrder.status === "invalid"
  ) {
    return "moderate";
  }

  return "strong";
}
