import type { FanReactionShowHandoffInput } from "./fanReactionEngine.contracts.ts";
import type { ShowMatchHandoffSummary } from "./showFanSocialHandoff.ts";

export type FanAudienceReadStatus = "unavailable" | "empty" | "partial" | "ready";

export type FanAudienceReadConfidenceBand = "unknown" | "low" | "moderate" | "strong";

export type FanAudienceReadSignalBand = "unknown" | "quiet" | "mixed" | "engaged" | "hot";

export type FanAudienceReadIssue =
  | "missing-show-handoff"
  | "missing-handoff-validation"
  | "handoff-unavailable"
  | "handoff-partial"
  | "handoff-invalid"
  | "missing-opener"
  | "missing-main-event"
  | "match-run-failures"
  | "blocked-result-gates"
  | "blocked-result-shells";

export interface FanAudienceReadSummary {
  status: FanAudienceReadStatus;
  confidence: FanAudienceReadConfidenceBand;
  signalBand: FanAudienceReadSignalBand;
  issues: readonly FanAudienceReadIssue[];
  showId: string | null;
  matchCount: number;
  orderedMatchSummaryCount: number;
  openerPresent: boolean;
  mainEventPresent: boolean;
  failedMatchCount: number;
  blockedResultGateCount: number;
  blockedResultShellCount: number;
}

export function createFanAudienceRead(
  handoffInput: FanReactionShowHandoffInput | undefined
): FanAudienceReadSummary {
  const handoff = handoffInput?.fanSocialHandoff;
  const validation = handoffInput?.fanSocialHandoffValidation;

  if (handoff === undefined) {
    return createSummary({
      status: "unavailable",
      confidence: "unknown",
      signalBand: "unknown",
      issues: ["missing-show-handoff"],
      showId: validation?.showId ?? validation?.expectedShowId ?? null,
      matchCount: validation?.expectedMatchCount ?? 0,
      orderedMatchSummaryCount: validation?.orderedMatchSummaryCount ?? 0,
      openerPresent: false,
      mainEventPresent: false,
      failedMatchCount: 0,
      blockedResultGateCount: 0,
      blockedResultShellCount: 0
    });
  }

  const orderedMatchSummaries = handoff.orderedMatchSummaries;
  const issueSet = new Set<FanAudienceReadIssue>();

  if (validation === undefined) {
    issueSet.add("missing-handoff-validation");
  } else {
    addValidationIssue(validation.status, issueSet);
  }

  if (handoff.matchCount > 0 && !hasOpener(orderedMatchSummaries)) {
    issueSet.add("missing-opener");
  }

  if (handoff.matchCount > 0 && !hasMainEvent(orderedMatchSummaries)) {
    issueSet.add("missing-main-event");
  }

  if (orderedMatchSummaries.some((summary) => summary.matchEngineStatus === "failed")) {
    issueSet.add("match-run-failures");
  }

  if (orderedMatchSummaries.some((summary) => isBlockedResultGate(summary.resultGateStatus))) {
    issueSet.add("blocked-result-gates");
  }

  if (orderedMatchSummaries.some((summary) => isBlockedResultShell(summary.resultShellStatus))) {
    issueSet.add("blocked-result-shells");
  }

  const issues = [...issueSet];
  const status = statusFor(handoff.matchCount, validation?.status, issues);
  const confidence = confidenceFor(status, handoff.matchCount, orderedMatchSummaries, issues);
  const signalBand = signalBandFor(status, confidence, handoff.matchCount, orderedMatchSummaries);

  return createSummary({
    status,
    confidence,
    signalBand,
    issues,
    showId: handoff.showId,
    matchCount: handoff.matchCount,
    orderedMatchSummaryCount: orderedMatchSummaries.length,
    openerPresent: hasOpener(orderedMatchSummaries),
    mainEventPresent: hasMainEvent(orderedMatchSummaries),
    failedMatchCount: countWhere(
      orderedMatchSummaries,
      (summary) => summary.matchEngineStatus === "failed"
    ),
    blockedResultGateCount: countWhere(orderedMatchSummaries, (summary) =>
      isBlockedResultGate(summary.resultGateStatus)
    ),
    blockedResultShellCount: countWhere(orderedMatchSummaries, (summary) =>
      isBlockedResultShell(summary.resultShellStatus)
    )
  });
}

function addValidationIssue(
  status: NonNullable<FanReactionShowHandoffInput["fanSocialHandoffValidation"]>["status"],
  issues: Set<FanAudienceReadIssue>
): void {
  switch (status) {
    case "unavailable":
      issues.add("handoff-unavailable");
      return;
    case "partial":
      issues.add("handoff-partial");
      return;
    case "invalid":
      issues.add("handoff-invalid");
      return;
    case "empty":
    case "ready":
      return;
  }
}

function statusFor(
  matchCount: number,
  validationStatus: NonNullable<FanReactionShowHandoffInput["fanSocialHandoffValidation"]>["status"] | undefined,
  issues: readonly FanAudienceReadIssue[]
): FanAudienceReadStatus {
  if (validationStatus === "unavailable" || issues.includes("missing-handoff-validation")) {
    return "unavailable";
  }

  if (matchCount === 0 || validationStatus === "empty") {
    return "empty";
  }

  if (validationStatus === "partial" || validationStatus === "invalid" || issues.length > 0) {
    return "partial";
  }

  return "ready";
}

function confidenceFor(
  status: FanAudienceReadStatus,
  matchCount: number,
  orderedMatchSummaries: readonly ShowMatchHandoffSummary[],
  issues: readonly FanAudienceReadIssue[]
): FanAudienceReadConfidenceBand {
  if (status === "unavailable" || status === "empty") {
    return "unknown";
  }

  if (
    issues.includes("match-run-failures") ||
    issues.includes("blocked-result-gates") ||
    issues.includes("blocked-result-shells")
  ) {
    return "low";
  }

  if (
    status === "partial" ||
    !hasOpener(orderedMatchSummaries) ||
    !hasMainEvent(orderedMatchSummaries)
  ) {
    return "moderate";
  }

  return matchCount > 1 ? "strong" : "moderate";
}

function signalBandFor(
  status: FanAudienceReadStatus,
  confidence: FanAudienceReadConfidenceBand,
  matchCount: number,
  orderedMatchSummaries: readonly ShowMatchHandoffSummary[]
): FanAudienceReadSignalBand {
  if (status === "unavailable") {
    return "unknown";
  }

  if (status === "empty") {
    return "quiet";
  }

  if (status === "partial" || confidence === "low") {
    return "mixed";
  }

  if (matchCount > 1 && hasOpener(orderedMatchSummaries) && hasMainEvent(orderedMatchSummaries)) {
    return "hot";
  }

  return "engaged";
}

function createSummary(summary: FanAudienceReadSummary): FanAudienceReadSummary {
  return summary;
}

function hasOpener(orderedMatchSummaries: readonly ShowMatchHandoffSummary[]): boolean {
  return orderedMatchSummaries.some((summary) => summary.isOpener === true);
}

function hasMainEvent(orderedMatchSummaries: readonly ShowMatchHandoffSummary[]): boolean {
  return orderedMatchSummaries.some((summary) => summary.isMainEvent === true);
}

function isBlockedResultGate(status: string | undefined): boolean {
  return status === "blocked" || status === "closed";
}

function isBlockedResultShell(status: string | undefined): boolean {
  return status === "blocked" || status === "unavailable";
}

function countWhere<T>(items: readonly T[], predicate: (item: T) => boolean): number {
  return items.filter(predicate).length;
}
