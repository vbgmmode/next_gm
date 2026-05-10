import type { EntityId } from "../domain/index.ts";
import type { ShowFanSocialHandoff } from "./showFanSocialHandoff.ts";
import type { ShowEngineInput } from "./showEngine.contracts.ts";

export type ShowFanSocialHandoffValidationStatus =
  | "unavailable"
  | "empty"
  | "partial"
  | "ready"
  | "invalid";

export type ShowFanSocialHandoffValidationSeverity = "low" | "moderate" | "high";

export type ShowFanSocialHandoffValidationConfidenceBand =
  | "unknown"
  | "low"
  | "moderate"
  | "strong";

export type ShowFanSocialHandoffValidationIssueCode =
  | "missing-handoff"
  | "missing-show-id"
  | "show-id-mismatch"
  | "match-count-mismatch"
  | "ordered-summary-count-mismatch"
  | "missing-opener-flag"
  | "missing-main-event-flag"
  | "missing-match-ids"
  | "missing-result-shell-status"
  | "missing-result-gate-status"
  | "match-run-failures";

export interface ShowFanSocialHandoffValidationIssue {
  code: ShowFanSocialHandoffValidationIssueCode;
  severity: ShowFanSocialHandoffValidationSeverity;
  message: string;
  matchId?: EntityId;
  bookedMatchId?: EntityId;
  position?: number;
}

export interface ShowFanSocialHandoffValidationSummary {
  status: ShowFanSocialHandoffValidationStatus;
  severity: ShowFanSocialHandoffValidationSeverity;
  confidence: ShowFanSocialHandoffValidationConfidenceBand;
  issues: readonly ShowFanSocialHandoffValidationIssue[];
  showId?: EntityId;
  expectedShowId: EntityId;
  expectedMatchCount: number;
  handoffMatchCount: number;
  orderedMatchSummaryCount: number;
  readyForFanReactionOrchestration: boolean;
  readyForSocialDiscourseOrchestration: boolean;
}

export interface ShowFanSocialHandoffValidationInput {
  showInput: ShowEngineInput;
  fanSocialHandoff?: ShowFanSocialHandoff;
}

export function validateShowFanSocialHandoff(
  input: ShowFanSocialHandoffValidationInput
): ShowFanSocialHandoffValidationSummary {
  const handoff = input.fanSocialHandoff;
  const expectedMatchCount = input.showInput.bookedMatches.length;

  if (handoff === undefined) {
    return createSummary({
      status: "unavailable",
      confidence: "unknown",
      issues: [
        createIssue(
          "missing-handoff",
          "high",
          "Fan/social handoff was not available for validation."
        )
      ],
      expectedShowId: input.showInput.show.id,
      expectedMatchCount,
      handoffMatchCount: 0,
      orderedMatchSummaryCount: 0
    });
  }

  const issues = collectValidationIssues(input.showInput, handoff);
  const status = statusFor(expectedMatchCount, issues);

  return createSummary({
    status,
    confidence: confidenceFor(status),
    issues,
    showId: handoff.showId,
    expectedShowId: input.showInput.show.id,
    expectedMatchCount,
    handoffMatchCount: handoff.matchCount,
    orderedMatchSummaryCount: handoff.orderedMatchSummaries.length
  });
}

function collectValidationIssues(
  showInput: ShowEngineInput,
  handoff: ShowFanSocialHandoff
): ShowFanSocialHandoffValidationIssue[] {
  const issues: ShowFanSocialHandoffValidationIssue[] = [];
  const expectedMatchCount = showInput.bookedMatches.length;
  const orderedMatchSummaries = handoff.orderedMatchSummaries;

  if (handoff.showId.length === 0) {
    issues.push(createIssue("missing-show-id", "high", "Handoff show id was missing."));
  } else if (handoff.showId !== showInput.show.id) {
    issues.push(
      createIssue("show-id-mismatch", "high", "Handoff show id did not match the show input.")
    );
  }

  if (handoff.matchCount !== expectedMatchCount) {
    issues.push(
      createIssue(
        "match-count-mismatch",
        "high",
        "Handoff match count did not match booked matches."
      )
    );
  }

  if (orderedMatchSummaries.length !== handoff.matchCount) {
    issues.push(
      createIssue(
        "ordered-summary-count-mismatch",
        "high",
        "Ordered match summary count did not match handoff match count."
      )
    );
  }

  if (expectedMatchCount > 0) {
    if (!orderedMatchSummaries.some((summary) => summary.isOpener === true)) {
      issues.push(
        createIssue("missing-opener-flag", "high", "No ordered match summary was marked as opener.")
      );
    }

    if (!orderedMatchSummaries.some((summary) => summary.isMainEvent === true)) {
      issues.push(
        createIssue(
          "missing-main-event-flag",
          "high",
          "No ordered match summary was marked as main event."
        )
      );
    }
  }

  for (const summary of orderedMatchSummaries) {
    if (summary.matchId.length === 0) {
      issues.push(
        createIssue(
          "missing-match-ids",
          "moderate",
          "Ordered match summary was missing a match id.",
          summary
        )
      );
    }

    if (summary.matchEngineStatus === "failed") {
      issues.push(
        createIssue(
          "match-run-failures",
          "moderate",
          "Match engine failure was captured in the handoff.",
          summary
        )
      );
    }

    if (summary.matchEngineStatus !== "missing" && !hasText(summary.resultShellStatus)) {
      issues.push(
        createIssue(
          "missing-result-shell-status",
          "moderate",
          "Ordered match summary was missing result shell status.",
          summary
        )
      );
    }

    if (summary.matchEngineStatus !== "missing" && !hasText(summary.resultGateStatus)) {
      issues.push(
        createIssue(
          "missing-result-gate-status",
          "moderate",
          "Ordered match summary was missing result gate status.",
          summary
        )
      );
    }
  }

  return issues;
}

function statusFor(
  expectedMatchCount: number,
  issues: readonly ShowFanSocialHandoffValidationIssue[]
): ShowFanSocialHandoffValidationStatus {
  if (issues.some((issue) => issue.severity === "high")) {
    return "invalid";
  }

  if (expectedMatchCount === 0) {
    return "empty";
  }

  if (issues.length > 0) {
    return "partial";
  }

  return "ready";
}

function confidenceFor(
  status: ShowFanSocialHandoffValidationStatus
): ShowFanSocialHandoffValidationConfidenceBand {
  switch (status) {
    case "ready":
      return "strong";
    case "partial":
      return "moderate";
    case "invalid":
      return "low";
    case "empty":
    case "unavailable":
      return "unknown";
  }
}

function createSummary(
  input: Omit<
    ShowFanSocialHandoffValidationSummary,
    "severity" | "readyForFanReactionOrchestration" | "readyForSocialDiscourseOrchestration"
  >
): ShowFanSocialHandoffValidationSummary {
  const readyForOrchestration = input.status === "ready";

  return {
    ...input,
    severity: severityFor(input.issues),
    readyForFanReactionOrchestration: readyForOrchestration,
    readyForSocialDiscourseOrchestration: readyForOrchestration
  };
}

function severityFor(
  issues: readonly ShowFanSocialHandoffValidationIssue[]
): ShowFanSocialHandoffValidationSeverity {
  if (issues.some((issue) => issue.severity === "high")) {
    return "high";
  }

  if (issues.some((issue) => issue.severity === "moderate")) {
    return "moderate";
  }

  return "low";
}

function createIssue(
  code: ShowFanSocialHandoffValidationIssueCode,
  severity: ShowFanSocialHandoffValidationSeverity,
  message: string,
  summary?: { matchId: EntityId; bookedMatchId: EntityId; position: number }
): ShowFanSocialHandoffValidationIssue {
  return summary === undefined
    ? {
        code,
        severity,
        message
      }
    : {
        code,
        severity,
        message,
        matchId: summary.matchId,
        bookedMatchId: summary.bookedMatchId,
        position: summary.position
      };
}

function hasText(value: string | undefined): boolean {
  return value !== undefined && value.length > 0;
}
