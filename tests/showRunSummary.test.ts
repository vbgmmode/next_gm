import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createShowRunSummary,
  validateShowBooking,
  type ShowRunSummary
} from "../src/game/engines/index.ts";
import {
  createSampleShowEngineInput,
  createSampleShowEngineInputWithoutMatches
} from "./fixtures/index.ts";

describe("Show Run Summary", () => {
  it("imports cleanly and returns a hidden show run summary", () => {
    const summary: ShowRunSummary = createShowRunSummary({
      bookingValidation: validateShowBooking(createSampleShowEngineInput()),
      bookedMatchCount: 1,
      completedMatchEngineRuns: 1,
      failedMatchEngineRuns: 0,
      matchRunSummaries: [{ resultExecutionGateStatus: "open" }]
    });

    assert.equal(summary.status, "complete");
    assert.equal(summary.readiness, "strong");
    assert.equal(summary.confidence, "strong");
    assert.equal(summary.openResultGateCount, 1);
  });

  it("summarizes zero booked matches as empty", () => {
    const summary = createShowRunSummary({
      bookingValidation: validateShowBooking(createSampleShowEngineInputWithoutMatches()),
      bookedMatchCount: 0,
      completedMatchEngineRuns: 0,
      failedMatchEngineRuns: 0,
      matchRunSummaries: []
    });

    assert.equal(summary.status, "empty");
    assert.equal(summary.readiness, "unknown");
    assert.equal(summary.confidence, "unknown");
    assert.deepEqual(summary.issues, ["no-booked-matches"]);
  });

  it("summarizes partial match run failures without blocking execution", () => {
    const summary = createShowRunSummary({
      bookingValidation: validateShowBooking(createSampleShowEngineInput()),
      bookedMatchCount: 2,
      completedMatchEngineRuns: 1,
      failedMatchEngineRuns: 1,
      matchRunSummaries: [
        { resultExecutionGateStatus: "pending" },
        { resultExecutionGateStatus: "closed" }
      ]
    });

    assert.equal(summary.status, "partial");
    assert.equal(summary.readiness, "low");
    assert.equal(summary.confidence, "moderate");
    assert.equal(summary.pendingResultGateCount, 1);
    assert.equal(summary.closedResultGateCount, 1);
    assert.ok(summary.issues.includes("match-run-failures"));
  });

  it("summarizes all failed match runs as failed", () => {
    const summary = createShowRunSummary({
      bookingValidation: validateShowBooking(createSampleShowEngineInput()),
      bookedMatchCount: 1,
      completedMatchEngineRuns: 0,
      failedMatchEngineRuns: 1,
      matchRunSummaries: [{ resultExecutionGateStatus: "closed" }]
    });

    assert.equal(summary.status, "failed");
    assert.equal(summary.readiness, "low");
    assert.equal(summary.confidence, "low");
    assert.ok(summary.issues.includes("all-match-runs-failed"));
  });

  it("lowers readiness when result gates are blocked or pending", () => {
    const summary = createShowRunSummary({
      bookingValidation: validateShowBooking(createSampleShowEngineInput()),
      bookedMatchCount: 2,
      completedMatchEngineRuns: 2,
      failedMatchEngineRuns: 0,
      matchRunSummaries: [
        { resultExecutionGateStatus: "blocked" },
        { resultExecutionGateStatus: "pending" }
      ]
    });

    assert.equal(summary.status, "unstable");
    assert.equal(summary.readiness, "low");
    assert.equal(summary.confidence, "moderate");
    assert.equal(summary.blockedResultGateCount, 1);
    assert.equal(summary.pendingResultGateCount, 1);
    assert.ok(summary.issues.includes("blocked-result-gates"));
    assert.ok(summary.issues.includes("pending-result-gates"));
  });
});
