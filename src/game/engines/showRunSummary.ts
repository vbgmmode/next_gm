import type { ShowBookingValidationSummary } from "./showBookingValidation.ts";

export type ShowRunStatus = "empty" | "complete" | "partial" | "failed" | "unstable";

export type ShowRunReadinessBand = "unknown" | "low" | "moderate" | "strong";

export type ShowRunConfidenceBand = "unknown" | "low" | "moderate" | "strong";

export type ShowRunIssue =
  | "no-booked-matches"
  | "match-run-failures"
  | "all-match-runs-failed"
  | "booking-validation-risk"
  | "booking-validation-invalid"
  | "blocked-result-gates"
  | "pending-result-gates"
  | "closed-result-gates";

export interface ShowRunSummary {
  status: ShowRunStatus;
  readiness: ShowRunReadinessBand;
  confidence: ShowRunConfidenceBand;
  issues: readonly ShowRunIssue[];
  totalBookedMatches: number;
  completedMatchRuns: number;
  failedMatchRuns: number;
  openResultGateCount: number;
  blockedResultGateCount: number;
  pendingResultGateCount: number;
  closedResultGateCount: number;
}

export interface ShowRunSummaryInput {
  bookingValidation: ShowBookingValidationSummary;
  bookedMatchCount: number;
  completedMatchEngineRuns: number;
  failedMatchEngineRuns: number;
  matchRunSummaries: readonly {
    resultExecutionGateStatus: string;
  }[];
}

export function createShowRunSummary(input: ShowRunSummaryInput): ShowRunSummary {
  const openResultGateCount = countGateStatus(input.matchRunSummaries, "open");
  const blockedResultGateCount = countGateStatus(input.matchRunSummaries, "blocked");
  const pendingResultGateCount = countGateStatus(input.matchRunSummaries, "pending");
  const closedResultGateCount = countGateStatus(input.matchRunSummaries, "closed");
  const issues = collectIssues(input, {
    blockedResultGateCount,
    pendingResultGateCount,
    closedResultGateCount
  });

  return {
    status: statusFor(input, issues),
    readiness: readinessFor(input, issues),
    confidence: confidenceFor(input, issues),
    issues,
    totalBookedMatches: input.bookedMatchCount,
    completedMatchRuns: input.completedMatchEngineRuns,
    failedMatchRuns: input.failedMatchEngineRuns,
    openResultGateCount,
    blockedResultGateCount,
    pendingResultGateCount,
    closedResultGateCount
  };
}

function countGateStatus(
  matchRunSummaries: ShowRunSummaryInput["matchRunSummaries"],
  status: string
): number {
  return matchRunSummaries.filter((summary) => summary.resultExecutionGateStatus === status).length;
}

function collectIssues(
  input: ShowRunSummaryInput,
  gateCounts: {
    blockedResultGateCount: number;
    pendingResultGateCount: number;
    closedResultGateCount: number;
  }
): ShowRunIssue[] {
  const issues = new Set<ShowRunIssue>();

  if (input.bookedMatchCount === 0) {
    issues.add("no-booked-matches");
  }

  if (input.failedMatchEngineRuns > 0) {
    issues.add("match-run-failures");
  }

  if (input.bookedMatchCount > 0 && input.failedMatchEngineRuns === input.bookedMatchCount) {
    issues.add("all-match-runs-failed");
  }

  if (input.bookingValidation.status === "risky") {
    issues.add("booking-validation-risk");
  }

  if (input.bookingValidation.status === "invalid") {
    issues.add("booking-validation-invalid");
  }

  if (gateCounts.blockedResultGateCount > 0) {
    issues.add("blocked-result-gates");
  }

  if (gateCounts.pendingResultGateCount > 0) {
    issues.add("pending-result-gates");
  }

  if (gateCounts.closedResultGateCount > 0) {
    issues.add("closed-result-gates");
  }

  return [...issues];
}

function statusFor(input: ShowRunSummaryInput, issues: readonly ShowRunIssue[]): ShowRunStatus {
  if (input.bookedMatchCount === 0) {
    return "empty";
  }

  if (issues.includes("all-match-runs-failed")) {
    return "failed";
  }

  if (issues.includes("match-run-failures")) {
    return "partial";
  }

  if (
    issues.includes("booking-validation-risk") ||
    issues.includes("booking-validation-invalid") ||
    issues.includes("blocked-result-gates") ||
    issues.includes("closed-result-gates")
  ) {
    return "unstable";
  }

  return "complete";
}

function readinessFor(
  input: ShowRunSummaryInput,
  issues: readonly ShowRunIssue[]
): ShowRunReadinessBand {
  if (input.bookedMatchCount === 0) {
    return "unknown";
  }

  if (
    issues.includes("all-match-runs-failed") ||
    issues.includes("booking-validation-invalid") ||
    issues.includes("blocked-result-gates") ||
    issues.includes("closed-result-gates")
  ) {
    return "low";
  }

  if (
    issues.includes("match-run-failures") ||
    issues.includes("booking-validation-risk") ||
    issues.includes("pending-result-gates")
  ) {
    return "moderate";
  }

  return "strong";
}

function confidenceFor(
  input: ShowRunSummaryInput,
  issues: readonly ShowRunIssue[]
): ShowRunConfidenceBand {
  if (input.bookedMatchCount === 0) {
    return "unknown";
  }

  if (
    issues.includes("all-match-runs-failed") ||
    issues.includes("booking-validation-invalid")
  ) {
    return "low";
  }

  if (
    issues.includes("match-run-failures") ||
    issues.includes("booking-validation-risk") ||
    issues.includes("blocked-result-gates") ||
    issues.includes("closed-result-gates") ||
    issues.includes("pending-result-gates")
  ) {
    return "moderate";
  }

  return "strong";
}
