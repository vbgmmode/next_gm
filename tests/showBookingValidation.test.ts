import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  validateShowBooking,
  type ShowBookingValidationSummary,
  type ShowEngineInput
} from "../src/game/engines/index.ts";
import {
  createSampleShowEngineInput,
  createSampleShowEngineInputWithMultipleMatches,
  createSampleShowEngineInputWithoutMatches
} from "./fixtures/index.ts";

describe("Show Booking Validation", () => {
  it("imports cleanly and returns a hidden booking validation summary", () => {
    const summary: ShowBookingValidationSummary = validateShowBooking(createSampleShowEngineInput());

    assert.equal(summary.status, "ready");
    assert.equal(summary.severity, "none");
    assert.equal(summary.readiness, "strong");
    assert.ok(summary.reasons.includes("booked-matches-present"));
  });

  it("validates zero booked matches safely as empty", () => {
    const summary = validateShowBooking(createSampleShowEngineInputWithoutMatches());

    assert.equal(summary.status, "empty");
    assert.equal(summary.severity, "low");
    assert.equal(summary.readiness, "unknown");
    assert.deepEqual(summary.reasons, ["no-booked-matches"]);
  });

  it("validates multiple booked matches safely", () => {
    const summary = validateShowBooking(createSampleShowEngineInputWithMultipleMatches());

    assert.equal(summary.status, "ready");
    assert.equal(summary.severity, "none");
    assert.equal(summary.readiness, "strong");
  });

  it("detects duplicate match ids when match ids are available", () => {
    const input = createDuplicateMatchIdInput();
    const summary = validateShowBooking(input);

    assert.equal(summary.status, "risky");
    assert.equal(summary.severity, "moderate");
    assert.ok(summary.reasons.includes("duplicate-match-ids"));
  });

  it("detects missing participant structure without blocking execution", () => {
    const input = createInvalidParticipantInput();
    const summary = validateShowBooking(input);

    assert.equal(summary.status, "invalid");
    assert.equal(summary.severity, "high");
    assert.ok(summary.reasons.includes("missing-match-participants"));
  });

  it("does not expose numeric leaves in validation summary", () => {
    const summary = validateShowBooking(createSampleShowEngineInputWithMultipleMatches());

    assert.deepEqual(collectNumericLeaves(summary), []);
  });
});

function createDuplicateMatchIdInput(): ShowEngineInput {
  const input = createSampleShowEngineInputWithMultipleMatches();
  const duplicateMatchId = input.bookedMatches[0].matchInput.match.id;

  return {
    ...input,
    bookedMatches: input.bookedMatches.map((bookedMatch) => ({
      ...bookedMatch,
      matchInput: {
        ...bookedMatch.matchInput,
        match: {
          ...bookedMatch.matchInput.match,
          id: duplicateMatchId
        }
      }
    }))
  };
}

function createInvalidParticipantInput(): ShowEngineInput {
  const input = createSampleShowEngineInput();

  return {
    ...input,
    bookedMatches: [
      {
        ...input.bookedMatches[0],
        matchInput: {
          ...input.bookedMatches[0].matchInput,
          match: {
            ...input.bookedMatches[0].matchInput.match,
            participantIds: []
          },
          participants: []
        }
      }
    ]
  };
}

function collectNumericLeaves(value: unknown): number[] {
  if (typeof value === "number") {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap(collectNumericLeaves);
  }

  if (value !== null && typeof value === "object") {
    return Object.values(value).flatMap(collectNumericLeaves);
  }

  return [];
}
