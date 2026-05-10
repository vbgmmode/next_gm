import type {
  FanAudienceReadConfidenceBand,
  FanAudienceReadSignalBand,
  FanAudienceReadStatus,
  FanAudienceReadSummary
} from "./fanAudienceRead.ts";

export type FanReactionShowOutputStatus = "unavailable" | "empty" | "partial" | "ready";

export type FanReactionShowOutputConfidenceBand = "unknown" | "low" | "moderate" | "strong";

export type FanReactionShowOutputIssue =
  | "audience-read-unavailable"
  | "audience-read-empty"
  | "audience-read-partial"
  | "show-handoff-not-ready"
  | "discourse-not-ready";

export type FanReactionAudienceSegmentKey =
  | "live_crowd"
  | "casual_fans"
  | "hardcore_fans"
  | "iwc"
  | "tv_audience";

export type FanReactionShowSignalBand =
  | "unknown"
  | "quiet"
  | "mixed"
  | "engaged"
  | "hot"
  | "volatile";

export type FanReactionShowSignalRead =
  | "unavailable"
  | "pending"
  | "limited"
  | "neutral"
  | "needs-more-context"
  | "structurally-ready";

export interface FanReactionAudienceSignalShell {
  segmentKey: FanReactionAudienceSegmentKey;
  signalBand: FanReactionShowSignalBand;
  confidence: FanReactionShowOutputConfidenceBand;
  source: "audience-read-placeholder";
}

export interface FanReactionShowOutputShell {
  status: FanReactionShowOutputStatus;
  confidence: FanReactionShowOutputConfidenceBand;
  issues: readonly FanReactionShowOutputIssue[];
  showId: string | null;
  matchCount: number;
  overallCrowdSignal: FanReactionShowSignalBand;
  audienceSegmentSignals: readonly FanReactionAudienceSignalShell[];
  crowdEnergyRead: FanReactionShowSignalRead;
  bookingTrustRead: FanReactionShowSignalRead;
  featuredTalentReceptionRead: FanReactionShowSignalRead;
  showMomentumRead: FanReactionShowSignalRead;
  confidenceRead: FanReactionShowSignalRead;
  backlashRiskShell: FanReactionShowSignalBand;
  momentumSignalShell: FanReactionShowSignalBand;
  discourseReadinessShell: FanReactionShowSignalBand;
  readyForSocialDiscourseHandoff: boolean;
}

const audienceSegmentKeys: readonly FanReactionAudienceSegmentKey[] = [
  "live_crowd",
  "casual_fans",
  "hardcore_fans",
  "iwc",
  "tv_audience"
];

export function createFanReactionShowOutputShell(
  audienceReadSummary: FanAudienceReadSummary
): FanReactionShowOutputShell {
  const status = statusFor(audienceReadSummary.status);
  const confidence = confidenceFor(status, audienceReadSummary.confidence);
  const issues = issuesFor(audienceReadSummary);
  const overallCrowdSignal = signalBandFor(audienceReadSummary.signalBand, status);
  const audienceSegmentSignals = audienceSegmentKeys.map((segmentKey) => ({
    segmentKey,
    signalBand: segmentSignalBandFor(segmentKey, overallCrowdSignal, status),
    confidence,
    source: "audience-read-placeholder" as const
  }));

  return {
    status,
    confidence,
    issues,
    showId: audienceReadSummary.showId,
    matchCount: audienceReadSummary.matchCount,
    overallCrowdSignal,
    audienceSegmentSignals,
    crowdEnergyRead: crowdEnergyReadFor(status, audienceReadSummary),
    bookingTrustRead: bookingTrustReadFor(status, audienceReadSummary),
    featuredTalentReceptionRead: featuredTalentReceptionReadFor(status, audienceReadSummary),
    showMomentumRead: showMomentumReadFor(status, audienceReadSummary),
    confidenceRead: confidenceReadFor(status, confidence),
    backlashRiskShell: backlashRiskShellFor(status, overallCrowdSignal),
    momentumSignalShell: momentumSignalShellFor(status, overallCrowdSignal),
    discourseReadinessShell: discourseReadinessShellFor(status, audienceReadSummary),
    readyForSocialDiscourseHandoff: status === "ready"
  };
}

function statusFor(status: FanAudienceReadStatus): FanReactionShowOutputStatus {
  switch (status) {
    case "ready":
      return "ready";
    case "partial":
      return "partial";
    case "empty":
      return "empty";
    case "unavailable":
      return "unavailable";
  }
}

function confidenceFor(
  status: FanReactionShowOutputStatus,
  confidence: FanAudienceReadConfidenceBand
): FanReactionShowOutputConfidenceBand {
  if (status === "unavailable" || status === "empty") {
    return "unknown";
  }

  return confidence;
}

function issuesFor(
  audienceReadSummary: FanAudienceReadSummary
): readonly FanReactionShowOutputIssue[] {
  const issues = new Set<FanReactionShowOutputIssue>();

  switch (audienceReadSummary.status) {
    case "unavailable":
      issues.add("audience-read-unavailable");
      break;
    case "empty":
      issues.add("audience-read-empty");
      break;
    case "partial":
      issues.add("audience-read-partial");
      break;
    case "ready":
      break;
  }

  if (audienceReadSummary.status !== "ready") {
    issues.add("show-handoff-not-ready");
    issues.add("discourse-not-ready");
  }

  return [...issues];
}

function signalBandFor(
  signalBand: FanAudienceReadSignalBand,
  status: FanReactionShowOutputStatus
): FanReactionShowSignalBand {
  if (status === "partial") {
    return signalBand === "unknown" || signalBand === "quiet" ? "mixed" : signalBand;
  }

  return signalBand;
}

function segmentSignalBandFor(
  segmentKey: FanReactionAudienceSegmentKey,
  overallSignal: FanReactionShowSignalBand,
  status: FanReactionShowOutputStatus
): FanReactionShowSignalBand {
  if (status === "unavailable") {
    return "unknown";
  }

  if (status === "empty") {
    return "quiet";
  }

  if ((segmentKey === "hardcore_fans" || segmentKey === "iwc") && overallSignal === "mixed") {
    return "volatile";
  }

  return overallSignal;
}

function crowdEnergyReadFor(
  status: FanReactionShowOutputStatus,
  audienceReadSummary: FanAudienceReadSummary
): FanReactionShowSignalRead {
  switch (status) {
    case "ready":
      return audienceReadSummary.signalBand === "engaged" || audienceReadSummary.signalBand === "hot"
        ? "structurally-ready"
        : "neutral";
    case "partial":
      return "limited";
    case "empty":
      return "pending";
    case "unavailable":
      return "unavailable";
  }
}

function bookingTrustReadFor(
  status: FanReactionShowOutputStatus,
  audienceReadSummary: FanAudienceReadSummary
): FanReactionShowSignalRead {
  switch (status) {
    case "ready":
      return audienceReadSummary.issues.length === 0 ? "structurally-ready" : "neutral";
    case "partial":
      return audienceReadSummary.issues.includes("missing-opener") ||
        audienceReadSummary.issues.includes("missing-main-event")
        ? "needs-more-context"
        : "limited";
    case "empty":
      return "needs-more-context";
    case "unavailable":
      return "unavailable";
  }
}

function featuredTalentReceptionReadFor(
  status: FanReactionShowOutputStatus,
  audienceReadSummary: FanAudienceReadSummary
): FanReactionShowSignalRead {
  switch (status) {
    case "ready":
      return audienceReadSummary.openerPresent && audienceReadSummary.mainEventPresent
        ? "structurally-ready"
        : "neutral";
    case "partial":
      return audienceReadSummary.matchCount > 0 ? "limited" : "needs-more-context";
    case "empty":
      return "needs-more-context";
    case "unavailable":
      return "unavailable";
  }
}

function showMomentumReadFor(
  status: FanReactionShowOutputStatus,
  audienceReadSummary: FanAudienceReadSummary
): FanReactionShowSignalRead {
  switch (status) {
    case "ready":
      return audienceReadSummary.orderedMatchSummaryCount > 0 ? "structurally-ready" : "neutral";
    case "partial":
      return hasBlockedOrFailedRead(audienceReadSummary) ? "limited" : "pending";
    case "empty":
      return "pending";
    case "unavailable":
      return "unavailable";
  }
}

function confidenceReadFor(
  status: FanReactionShowOutputStatus,
  confidence: FanReactionShowOutputConfidenceBand
): FanReactionShowSignalRead {
  if (status === "unavailable") {
    return "unavailable";
  }

  if (status === "empty") {
    return "needs-more-context";
  }

  if (confidence === "unknown" || confidence === "low") {
    return "limited";
  }

  return status === "ready" ? "structurally-ready" : "neutral";
}

function hasBlockedOrFailedRead(audienceReadSummary: FanAudienceReadSummary): boolean {
  return (
    audienceReadSummary.failedMatchCount > 0 ||
    audienceReadSummary.blockedResultGateCount > 0 ||
    audienceReadSummary.blockedResultShellCount > 0
  );
}

function backlashRiskShellFor(
  status: FanReactionShowOutputStatus,
  overallSignal: FanReactionShowSignalBand
): FanReactionShowSignalBand {
  if (status === "unavailable" || status === "empty") {
    return "unknown";
  }

  return overallSignal === "mixed" || overallSignal === "volatile" ? "mixed" : "quiet";
}

function momentumSignalShellFor(
  status: FanReactionShowOutputStatus,
  overallSignal: FanReactionShowSignalBand
): FanReactionShowSignalBand {
  if (status === "unavailable") {
    return "unknown";
  }

  if (status === "empty") {
    return "quiet";
  }

  return overallSignal;
}

function discourseReadinessShellFor(
  status: FanReactionShowOutputStatus,
  audienceReadSummary: FanAudienceReadSummary
): FanReactionShowSignalBand {
  if (status === "ready") {
    return audienceReadSummary.signalBand;
  }

  if (status === "partial") {
    return "mixed";
  }

  return "unknown";
}
