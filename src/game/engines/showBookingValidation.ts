import type { EntityId } from "../domain/index.ts";
import type { ShowEngineInput } from "./showEngine.contracts.ts";

export type ShowBookingValidationStatus = "empty" | "ready" | "partial" | "risky" | "invalid";

export type ShowBookingValidationSeverity = "none" | "low" | "moderate" | "high";

export type ShowReadinessBand = "unknown" | "low" | "moderate" | "strong";

export type ShowBookingValidationReason =
  | "no-booked-matches"
  | "booked-matches-present"
  | "duplicate-match-ids"
  | "duplicate-booked-match-ids"
  | "missing-match-id"
  | "missing-booked-match-id"
  | "missing-match-participants"
  | "missing-match-participant-wrestlers"
  | "match-show-mismatch";

export interface ShowBookingValidationSummary {
  status: ShowBookingValidationStatus;
  severity: ShowBookingValidationSeverity;
  readiness: ShowReadinessBand;
  reasons: readonly ShowBookingValidationReason[];
  confidenceBand: ShowReadinessBand;
}

export function validateShowBooking(input: ShowEngineInput): ShowBookingValidationSummary {
  const reasons = new Set<ShowBookingValidationReason>();
  const bookedMatches = input.bookedMatches;

  if (bookedMatches.length === 0) {
    return {
      status: "empty",
      severity: "low",
      readiness: "unknown",
      reasons: ["no-booked-matches"],
      confidenceBand: "strong"
    };
  }

  reasons.add("booked-matches-present");
  addDuplicateReasons(
    bookedMatches.map((bookedMatch) => bookedMatch.matchInput.match.id),
    "duplicate-match-ids",
    reasons
  );
  addDuplicateReasons(
    bookedMatches.map((bookedMatch) => bookedMatch.id),
    "duplicate-booked-match-ids",
    reasons
  );

  for (const bookedMatch of bookedMatches) {
    if (bookedMatch.id.length === 0) {
      reasons.add("missing-booked-match-id");
    }

    if (bookedMatch.matchInput.match.id.length === 0) {
      reasons.add("missing-match-id");
    }

    if (bookedMatch.matchInput.match.showId !== input.show.id) {
      reasons.add("match-show-mismatch");
    }

    if (bookedMatch.matchInput.match.participantIds.length < 2) {
      reasons.add("missing-match-participants");
    }

    const participantWrestlerIds = new Set(
      bookedMatch.matchInput.participants.map((wrestler) => wrestler.id)
    );
    if (
      bookedMatch.matchInput.match.participantIds.some(
        (participant) => !participantWrestlerIds.has(participant.wrestlerId)
      )
    ) {
      reasons.add("missing-match-participant-wrestlers");
    }
  }

  return summaryFor([...reasons]);
}

function addDuplicateReasons(
  ids: readonly EntityId[],
  reason: ShowBookingValidationReason,
  reasons: Set<ShowBookingValidationReason>
): void {
  if (ids.some((id, index) => ids.indexOf(id) !== index)) {
    reasons.add(reason);
  }
}

function summaryFor(reasons: readonly ShowBookingValidationReason[]): ShowBookingValidationSummary {
  if (
    reasons.includes("missing-match-id") ||
    reasons.includes("missing-booked-match-id") ||
    reasons.includes("missing-match-participants")
  ) {
    return {
      status: "invalid",
      severity: "high",
      readiness: "low",
      reasons,
      confidenceBand: "strong"
    };
  }

  if (
    reasons.includes("duplicate-match-ids") ||
    reasons.includes("duplicate-booked-match-ids") ||
    reasons.includes("missing-match-participant-wrestlers")
  ) {
    return {
      status: "risky",
      severity: "moderate",
      readiness: "low",
      reasons,
      confidenceBand: "strong"
    };
  }

  if (reasons.includes("match-show-mismatch")) {
    return {
      status: "partial",
      severity: "low",
      readiness: "moderate",
      reasons,
      confidenceBand: "moderate"
    };
  }

  return {
    status: "ready",
    severity: "none",
    readiness: "strong",
    reasons,
    confidenceBand: "strong"
  };
}
