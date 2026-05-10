import type { MatchResultIntentClassification } from "./matchResultIntentClassification.ts";

export type ShowOverallMatchReadiness =
  | "unavailable"
  | "blocked"
  | "limited"
  | "partial"
  | "structurally-ready";

export interface ShowMatchReadinessAggregation {
  totalMatches: number;
  readyMatches: number;
  limitedMatches: number;
  blockedMatches: number;
  unavailableMatches: number;
  protectedFinishReadyMatches: number;
  overallMatchReadiness: ShowOverallMatchReadiness;
}

export interface ShowMatchReadinessAggregationInput {
  matchRunSummaries: readonly {
    resultIntentClassification?: string;
  }[];
}

export function createShowMatchReadinessAggregation(
  input: ShowMatchReadinessAggregationInput
): ShowMatchReadinessAggregation {
  const classifications = input.matchRunSummaries.map((summary) =>
    normalizeResultIntentClassification(summary.resultIntentClassification)
  );
  const protectedFinishReadyMatches = countClassifications(
    classifications,
    "protected-finish-ready"
  );
  const standardMatchReadyMatches = countClassifications(
    classifications,
    "standard-match-ready"
  );
  const readyMatches = protectedFinishReadyMatches + standardMatchReadyMatches;
  const limitedMatches =
    countClassifications(classifications, "limited") +
    countClassifications(classifications, "needs-more-context");
  const blockedMatches = countClassifications(classifications, "blocked");
  const unavailableMatches = countClassifications(classifications, "unavailable");

  return {
    totalMatches: classifications.length,
    readyMatches,
    limitedMatches,
    blockedMatches,
    unavailableMatches,
    protectedFinishReadyMatches,
    overallMatchReadiness: overallMatchReadinessFor({
      totalMatches: classifications.length,
      readyMatches,
      limitedMatches,
      blockedMatches,
      unavailableMatches
    })
  };
}

function normalizeResultIntentClassification(
  classification: string | undefined
): MatchResultIntentClassification {
  switch (classification) {
    case "blocked":
    case "limited":
    case "needs-more-context":
    case "standard-match-ready":
    case "protected-finish-ready":
    case "unavailable":
      return classification;
    default:
      return "unavailable";
  }
}

function countClassifications(
  classifications: readonly MatchResultIntentClassification[],
  target: MatchResultIntentClassification
): number {
  return classifications.filter((classification) => classification === target).length;
}

function overallMatchReadinessFor(counts: {
  totalMatches: number;
  readyMatches: number;
  limitedMatches: number;
  blockedMatches: number;
  unavailableMatches: number;
}): ShowOverallMatchReadiness {
  if (counts.totalMatches === 0) {
    return "unavailable";
  }

  if (counts.blockedMatches > 0) {
    return "blocked";
  }

  if (counts.unavailableMatches === counts.totalMatches) {
    return "unavailable";
  }

  if (counts.unavailableMatches > 0) {
    return "partial";
  }

  if (counts.limitedMatches === counts.totalMatches) {
    return "limited";
  }

  if (counts.limitedMatches > 0) {
    return "partial";
  }

  return counts.readyMatches === counts.totalMatches ? "structurally-ready" : "partial";
}
