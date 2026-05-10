import type { EntityId } from "../domain/index.ts";
import type {
  FanReactionAudienceSignalShell,
  FanReactionShowOutputConfidenceBand,
  FanReactionShowOutputIssue,
  FanReactionShowOutputShell,
  FanReactionShowOutputStatus,
  FanReactionShowSignalRead,
  FanReactionShowSignalBand
} from "./fanReactionShowOutput.ts";

export type FanSocialDiscourseHandoffInputStatus = "missing" | "usable" | "unusable";

export interface FanSocialDiscourseShowOutputReadiness {
  provided: boolean;
  structurallyUsable: boolean;
  inputStatus: FanSocialDiscourseHandoffInputStatus;
  shellStatus: FanReactionShowOutputStatus | null;
  readyForSocialDiscourseHandoff: boolean;
  issueCount: number;
  matchCount: number | null;
  showId: EntityId | null;
}

export interface FanSocialDiscourseShowSignals {
  crowdEnergyRead: FanReactionShowSignalRead;
  bookingTrustRead: FanReactionShowSignalRead;
  featuredTalentReceptionRead: FanReactionShowSignalRead;
  showMomentumRead: FanReactionShowSignalRead;
  confidenceRead: FanReactionShowSignalRead;
}

export interface FanSocialDiscourseHandoff {
  sourceEngine: "fan-reaction";
  playerFacing: false;
  showOutputReadiness: FanSocialDiscourseShowOutputReadiness;
  showSignals: FanSocialDiscourseShowSignals | null;
}

export function createFanSocialDiscourseHandoff(
  showOutputShell?: unknown
): FanSocialDiscourseHandoff {
  return {
    sourceEngine: "fan-reaction",
    playerFacing: false,
    showOutputReadiness: summarizeFanReactionShowOutputReadiness(showOutputShell),
    showSignals: structurallyUsableShowSignalsFor(showOutputShell)
  };
}

function summarizeFanReactionShowOutputReadiness(
  shell: unknown
): FanSocialDiscourseShowOutputReadiness {
  if (shell === undefined) {
    return {
      provided: false,
      structurallyUsable: false,
      inputStatus: "missing",
      shellStatus: null,
      readyForSocialDiscourseHandoff: false,
      issueCount: 0,
      matchCount: null,
      showId: null
    };
  }

  if (!isStructurallyUsableFanReactionShowOutputShell(shell)) {
    return {
      provided: true,
      structurallyUsable: false,
      inputStatus: "unusable",
      shellStatus: null,
      readyForSocialDiscourseHandoff: false,
      issueCount: 0,
      matchCount: null,
      showId: null
    };
  }

  return {
    provided: true,
    structurallyUsable: true,
    inputStatus: "usable",
    shellStatus: shell.status,
    readyForSocialDiscourseHandoff: shell.readyForSocialDiscourseHandoff,
    issueCount: shell.issues.length,
    matchCount: shell.matchCount,
    showId: shell.showId
  };
}

function isStructurallyUsableFanReactionShowOutputShell(
  value: unknown
): value is FanReactionShowOutputShell {
  if (value === null || typeof value !== "object") {
    return false;
  }

  const shell = value as Partial<FanReactionShowOutputShell>;

  return (
    isFanReactionShowOutputStatus(shell.status) &&
    isFanReactionShowOutputConfidenceBand(shell.confidence) &&
    Array.isArray(shell.issues) &&
    shell.issues.every(isFanReactionShowOutputIssue) &&
    (typeof shell.showId === "string" || shell.showId === null) &&
    typeof shell.matchCount === "number" &&
    Number.isInteger(shell.matchCount) &&
    shell.matchCount >= 0 &&
    isFanReactionShowSignalBand(shell.overallCrowdSignal) &&
    Array.isArray(shell.audienceSegmentSignals) &&
    shell.audienceSegmentSignals.every(isFanReactionAudienceSignalShell) &&
    isFanReactionShowSignalRead(shell.crowdEnergyRead) &&
    isFanReactionShowSignalRead(shell.bookingTrustRead) &&
    isFanReactionShowSignalRead(shell.featuredTalentReceptionRead) &&
    isFanReactionShowSignalRead(shell.showMomentumRead) &&
    isFanReactionShowSignalRead(shell.confidenceRead) &&
    isFanReactionShowSignalBand(shell.backlashRiskShell) &&
    isFanReactionShowSignalBand(shell.momentumSignalShell) &&
    isFanReactionShowSignalBand(shell.discourseReadinessShell) &&
    typeof shell.readyForSocialDiscourseHandoff === "boolean"
  );
}

function structurallyUsableShowSignalsFor(
  value: unknown
): FanSocialDiscourseShowSignals | null {
  if (!isStructurallyUsableFanReactionShowOutputShell(value)) {
    return null;
  }

  return {
    crowdEnergyRead: value.crowdEnergyRead,
    bookingTrustRead: value.bookingTrustRead,
    featuredTalentReceptionRead: value.featuredTalentReceptionRead,
    showMomentumRead: value.showMomentumRead,
    confidenceRead: value.confidenceRead
  };
}

function isFanReactionAudienceSignalShell(
  value: unknown
): value is FanReactionAudienceSignalShell {
  if (value === null || typeof value !== "object") {
    return false;
  }

  const signal = value as Partial<FanReactionAudienceSignalShell>;

  return (
    isFanReactionAudienceSegmentKey(signal.segmentKey) &&
    isFanReactionShowSignalBand(signal.signalBand) &&
    isFanReactionShowOutputConfidenceBand(signal.confidence) &&
    signal.source === "audience-read-placeholder"
  );
}

function isFanReactionAudienceSegmentKey(value: unknown): boolean {
  return (
    value === "live_crowd" ||
    value === "casual_fans" ||
    value === "hardcore_fans" ||
    value === "iwc" ||
    value === "tv_audience"
  );
}

function isFanReactionShowSignalRead(value: unknown): value is FanReactionShowSignalRead {
  return (
    value === "unavailable" ||
    value === "pending" ||
    value === "limited" ||
    value === "neutral" ||
    value === "needs-more-context" ||
    value === "structurally-ready"
  );
}

function isFanReactionShowOutputStatus(
  value: unknown
): value is FanReactionShowOutputStatus {
  return value === "unavailable" || value === "empty" || value === "partial" || value === "ready";
}

function isFanReactionShowOutputConfidenceBand(
  value: unknown
): value is FanReactionShowOutputConfidenceBand {
  return value === "unknown" || value === "low" || value === "moderate" || value === "strong";
}

function isFanReactionShowOutputIssue(
  value: unknown
): value is FanReactionShowOutputIssue {
  return (
    value === "audience-read-unavailable" ||
    value === "audience-read-empty" ||
    value === "audience-read-partial" ||
    value === "show-handoff-not-ready" ||
    value === "discourse-not-ready"
  );
}

function isFanReactionShowSignalBand(value: unknown): value is FanReactionShowSignalBand {
  return (
    value === "unknown" ||
    value === "quiet" ||
    value === "mixed" ||
    value === "engaged" ||
    value === "hot" ||
    value === "volatile"
  );
}
