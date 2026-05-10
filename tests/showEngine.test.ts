import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createShowEngine,
  fanReactionEngine,
  MATCH_ENGINE_V0_ID,
  matchEngine,
  SHOW_ENGINE_V0_ID,
  createShowFanSocialOrchestrationSummary,
  showEngine,
  socialDiscourseEngine,
  type MatchSimulationEngine,
  type ShowEngineInput,
  type ShowEngineResult,
  type ShowSimulationEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleShowEngineInput,
  createSampleShowEngineInputWithMultipleMatches,
  createSampleShowEngineInputWithoutMatches
} from "./fixtures/index.ts";
import {
  assertDebugTraceIsNonPlayerFacing,
  assertEngineResultRespectsOutputBoundary,
  assertPlayerFacingSignalsDoNotExposeHiddenValues
} from "./helpers/engineOutputBoundaryAssertions.ts";

describe("Show Engine v0.8", () => {
  it("imports cleanly and implements ShowSimulationEngine", () => {
    const engine: ShowSimulationEngine = showEngine;

    assert.equal(engine, showEngine);
    assert.equal(typeof engine.run, "function");
  });

  it("exposes stable metadata", () => {
    assert.deepEqual(showEngine.metadata, {
      id: SHOW_ENGINE_V0_ID,
      name: "Show Engine v0",
      version: "0.8.0"
    });
    assert.deepEqual(matchEngine.metadata, {
      id: MATCH_ENGINE_V0_ID,
      name: "Match Engine v0",
      version: "0.9.0"
    });
    assert.equal(fanReactionEngine.metadata.id, "fan-reaction-engine-v0");
    assert.equal(fanReactionEngine.metadata.version, "0.6.0");
    assert.equal(socialDiscourseEngine.metadata.id, "social-discourse-engine-v0");
    assert.equal(socialDiscourseEngine.metadata.version, "0.5.0");
  });

  it("runs safely with zero booked matches", () => {
    const input = createSampleShowEngineInputWithoutMatches();
    const result = showEngine.run(input, createSampleEngineContext("show-v0-empty", 7), {
      debug: true
    });

    assert.equal(result.engineName, "show");
    assert.equal(result.showId, input.show.id);
    assert.equal(result.hiddenState.bookedMatchCount, 0);
    assert.equal(result.hiddenState.completedMatchEngineRuns, 0);
    assert.equal(result.hiddenState.failedMatchEngineRuns, 0);
    assert.equal(result.hiddenState.showReadinessStatus, "empty");
    assert.equal(result.hiddenState.bookingValidation.status, "empty");
    assert.equal(result.hiddenState.bookingValidation.severity, "low");
    assert.equal(result.hiddenState.executionOrder.status, "empty");
    assert.deepEqual(result.hiddenState.executionOrder.orderedMatchIds, []);
    assert.equal(result.hiddenState.runSummary.status, "empty");
    assert.equal(result.hiddenState.fanSocialHandoff.status, "empty");
    assert.equal(result.hiddenState.fanSocialHandoff.confidence, "unknown");
    assert.deepEqual(result.hiddenState.fanSocialHandoff.orderedMatchSummaries, []);
    assert.equal(result.hiddenState.fanSocialHandoffValidation.status, "empty");
    assert.deepEqual(
      result.hiddenState.fanSocialOrchestrationSummary,
      expectedFanSocialOrchestrationSummary("missing", "missing")
    );
    assert.equal(result.hiddenState.runSummary.totalBookedMatches, 0);
    assert.equal(result.hiddenState.runSummary.completedMatchRuns, 0);
    assert.equal(result.hiddenState.runSummary.failedMatchRuns, 0);
    assert.deepEqual(result.hiddenState.matchReadinessAggregation, {
      totalMatches: 0,
      readyMatches: 0,
      limitedMatches: 0,
      blockedMatches: 0,
      unavailableMatches: 0,
      protectedFinishReadyMatches: 0,
      overallMatchReadiness: "unavailable"
    });
    assert.deepEqual(result.hiddenState.matchRunSummaries, []);
    assert.deepEqual(result.matchResults, []);
    assertEngineResultRespectsOutputBoundary(result);
  });

  it("runs one booked match through Match Engine", () => {
    const input = createSampleShowEngineInput();
    const result = showEngine.run(input, createSampleEngineContext("show-v0-one-match", 7), {
      debug: true
    });

    assert.equal(result.hiddenState.bookedMatchCount, 1);
    assert.equal(result.hiddenState.completedMatchEngineRuns, 1);
    assert.equal(result.hiddenState.failedMatchEngineRuns, 0);
    assert.equal(result.hiddenState.showReadinessStatus, "ready");
    assert.equal(result.hiddenState.bookingValidation.status, "ready");
    assert.equal(result.hiddenState.bookingValidation.readiness, "strong");
    assert.equal(result.hiddenState.executionOrder.status, "inferred");
    assert.equal(result.hiddenState.executionOrder.openerMatchId, "match-main-event");
    assert.equal(result.hiddenState.executionOrder.mainEventMatchId, "match-main-event");
    assert.equal(result.hiddenState.executionOrder.entries[0].isOpener, true);
    assert.equal(result.hiddenState.executionOrder.entries[0].isMainEvent, true);
    assert.equal(result.hiddenState.runSummary.status, "complete");
    assert.equal(result.hiddenState.runSummary.totalBookedMatches, 1);
    assert.equal(result.hiddenState.runSummary.completedMatchRuns, 1);
    assert.equal(result.hiddenState.runSummary.failedMatchRuns, 0);
    assert.equal(result.hiddenState.runSummary.pendingResultGateCount, 1);
    assert.deepEqual(result.hiddenState.matchReadinessAggregation, {
      totalMatches: 1,
      readyMatches: 0,
      limitedMatches: 1,
      blockedMatches: 0,
      unavailableMatches: 0,
      protectedFinishReadyMatches: 0,
      overallMatchReadiness: "limited"
    });
    assert.equal(result.hiddenState.fanSocialHandoff.status, "ready");
    assert.equal(result.hiddenState.fanSocialHandoffValidation.status, "ready");
    assert.deepEqual(
      result.hiddenState.fanSocialOrchestrationSummary,
      expectedFanSocialOrchestrationSummary("structurally-ready", "available")
    );
    assert.equal(result.hiddenState.fanSocialHandoff.matchCount, 1);
    assert.equal(result.hiddenState.fanSocialHandoff.orderedMatchSummaries[0].isOpener, true);
    assert.equal(result.hiddenState.fanSocialHandoff.orderedMatchSummaries[0].isMainEvent, true);
    assert.equal(
      result.hiddenState.fanSocialHandoff.orderedMatchSummaries[0].finishIntentType,
      "unspecified"
    );
    assert.equal(
      result.hiddenState.fanSocialHandoff.orderedMatchSummaries[0].finishValidationStatus,
      "underspecified"
    );
    assert.equal(result.matchResults.length, 1);
    assert.equal(result.matchResults[0].engineName, "match");
    assert.equal(result.matchResults[0].matchId, input.bookedMatches[0].matchInput.match.id);
    assert.equal(result.hiddenState.matchRunSummaries[0].status, "completed");
    assert.equal(result.hiddenState.matchRunSummaries[0].matchEngineId, MATCH_ENGINE_V0_ID);
    assert.equal(result.hiddenState.matchRunSummaries[0].matchEngineVersion, "0.9.0");
    assert.equal(
      result.hiddenState.matchRunSummaries[0].resultIntentClassification,
      "needs-more-context"
    );
  });

  it("runs multiple booked matches in order", () => {
    const input = createSampleShowEngineInputWithMultipleMatches();
    const capturedMatchIds: string[] = [];
    const trackingMatchEngine: MatchSimulationEngine = {
      ...matchEngine,
      run(runInput, context, options) {
        capturedMatchIds.push(runInput.match.id);
        return matchEngine.run(runInput, context, options);
      }
    };
    const engine = createShowEngine(trackingMatchEngine);
    const result = engine.run(input, createSampleEngineContext("show-v0-match-order", 7), {
      debug: true
    });

    assert.deepEqual(capturedMatchIds, ["match-opener", "match-main-event"]);
    assert.equal(result.hiddenState.executionOrder.status, "inferred");
    assert.deepEqual(result.hiddenState.executionOrder.orderedMatchIds, [
      "match-opener",
      "match-main-event"
    ]);
    assert.deepEqual(
      result.hiddenState.fanSocialHandoff.orderedMatchSummaries.map((summary) => summary.matchId),
      ["match-opener", "match-main-event"]
    );
    assert.equal(result.hiddenState.fanSocialHandoff.orderedMatchSummaries[0].isOpener, true);
    assert.equal(result.hiddenState.fanSocialHandoff.orderedMatchSummaries[1].isMainEvent, true);
    assert.deepEqual(
      result.matchResults.map((matchResult) => matchResult.matchId),
      ["match-opener", "match-main-event"]
    );
    assert.deepEqual(
      result.hiddenState.matchRunSummaries.map((summary) => summary.matchId),
      ["match-opener", "match-main-event"]
    );
    assert.equal(result.hiddenState.completedMatchEngineRuns, 2);
    assert.equal(result.hiddenState.bookingValidation.status, "ready");
    assert.equal(result.hiddenState.runSummary.status, "complete");
    assert.equal(result.hiddenState.runSummary.totalBookedMatches, 2);
    assert.equal(result.hiddenState.runSummary.completedMatchRuns, 2);
  });

  it("respects explicit order index when running booked matches", () => {
    const input = createExplicitOrderInput();
    const capturedMatchIds: string[] = [];
    const trackingMatchEngine: MatchSimulationEngine = {
      ...matchEngine,
      run(runInput, context, options) {
        capturedMatchIds.push(runInput.match.id);
        return matchEngine.run(runInput, context, options);
      }
    };
    const engine = createShowEngine(trackingMatchEngine);
    const result = engine.run(input, createSampleEngineContext("show-v0-explicit-order", 7), {
      debug: true
    });

    assert.equal(result.hiddenState.executionOrder.status, "ordered");
    assert.equal(result.hiddenState.fanSocialHandoff.status, "ready");
    assert.deepEqual(result.hiddenState.executionOrder.orderedMatchIds, [
      "match-main-event",
      "match-opener"
    ]);
    assert.deepEqual(capturedMatchIds, ["match-main-event", "match-opener"]);
    assert.deepEqual(
      result.matchResults.map((matchResult) => matchResult.matchId),
      ["match-main-event", "match-opener"]
    );
  });

  it("detects duplicate order indexes without blocking show execution", () => {
    const input = createDuplicateOrderIndexInput();
    const result = showEngine.run(input, createSampleEngineContext("show-v0-duplicate-order", 7), {
      debug: true
    });

    assert.equal(result.hiddenState.executionOrder.status, "partial");
    assert.equal(result.hiddenState.executionOrder.confidence, "moderate");
    assert.ok(result.hiddenState.executionOrder.issues.includes("duplicate-order-indexes"));
    assert.equal(result.hiddenState.fanSocialHandoff.status, "ready");
    assert.equal(result.hiddenState.fanSocialHandoff.confidence, "moderate");
    assert.equal(result.hiddenState.completedMatchEngineRuns, 2);
    assert.equal(result.hiddenState.failedMatchEngineRuns, 0);
  });

  it("handles missing match ids safely without blocking show execution", () => {
    const input = createMissingMatchIdInput();
    const result = showEngine.run(input, createSampleEngineContext("show-v0-missing-match-id", 7), {
      debug: true
    });

    assert.equal(result.hiddenState.executionOrder.status, "invalid");
    assert.ok(result.hiddenState.executionOrder.issues.includes("missing-match-ids"));
    assert.equal(result.hiddenState.fanSocialHandoff.status, "partial");
    assert.ok(result.hiddenState.fanSocialHandoff.issues.includes("missing-match-ids"));
    assert.deepEqual(
      result.hiddenState.fanSocialOrchestrationSummary,
      expectedFanSocialOrchestrationSummary("partial", "limited")
    );
    assert.equal(result.hiddenState.bookedMatchCount, 1);
    assert.equal(result.hiddenState.completedMatchEngineRuns, 1);
    assert.equal(result.hiddenState.failedMatchEngineRuns, 0);
    assert.equal(result.matchResults[0].matchId, "");
  });

  it("detects duplicate match ids without blocking show execution", () => {
    const input = createDuplicateMatchIdInput();
    const result = showEngine.run(input, createSampleEngineContext("show-v0-duplicate-match", 7), {
      debug: true
    });

    assert.equal(result.hiddenState.bookingValidation.status, "risky");
    assert.equal(result.hiddenState.bookingValidation.severity, "moderate");
    assert.ok(result.hiddenState.bookingValidation.reasons.includes("duplicate-match-ids"));
    assert.equal(result.hiddenState.showReadinessStatus, "partial");
    assert.equal(result.hiddenState.bookedMatchCount, 2);
    assert.equal(result.hiddenState.completedMatchEngineRuns, 2);
    assert.equal(result.hiddenState.failedMatchEngineRuns, 0);
    assert.equal(result.hiddenState.runSummary.status, "unstable");
    assert.ok(result.hiddenState.runSummary.issues.includes("booking-validation-risk"));
  });

  it("handles invalid match structure safely without blocking the show shell", () => {
    const input = createInvalidParticipantInput();
    const result = showEngine.run(input, createSampleEngineContext("show-v0-invalid-match", 7), {
      debug: true
    });

    assert.equal(result.hiddenState.bookingValidation.status, "invalid");
    assert.equal(result.hiddenState.bookingValidation.severity, "high");
    assert.ok(result.hiddenState.bookingValidation.reasons.includes("missing-match-participants"));
    assert.equal(result.hiddenState.showReadinessStatus, "partial");
    assert.equal(result.hiddenState.bookedMatchCount, 1);
    assert.equal(result.hiddenState.completedMatchEngineRuns, 1);
    assert.equal(result.hiddenState.failedMatchEngineRuns, 0);
    assert.equal(result.hiddenState.runSummary.status, "unstable");
    assert.ok(result.hiddenState.runSummary.issues.includes("booking-validation-invalid"));
    assert.equal(result.matchResults[0].engineName, "match");
  });

  it("stays deterministic for the same seed and show input", () => {
    const input = createSampleShowEngineInputWithMultipleMatches();
    const firstResult = showEngine.run(
      input,
      createSampleEngineContext("show-v0-deterministic", 7),
      { debug: true }
    );
    const secondResult = showEngine.run(
      input,
      createSampleEngineContext("show-v0-deterministic", 7),
      { debug: true }
    );

    assert.deepEqual(firstResult, secondResult);
  });

  it("keeps match internals out of player-facing show signals", () => {
    const result = showEngine.run(
      createSampleShowEngineInput(),
      createSampleEngineContext("show-v0-output-boundary", 7)
    );
    const serializedSignals = JSON.stringify(result.signals);

    assertPlayerFacingSignalsDoNotExposeHiddenValues(result.signals);
    assert.equal(serializedSignals.includes("resultShell"), false);
    assert.equal(serializedSignals.includes("resultExecutionGate"), false);
    assert.equal(serializedSignals.includes("resultIntentClassification"), false);
    assert.equal(serializedSignals.includes("matchReadinessAggregation"), false);
    assert.equal(serializedSignals.includes("overallMatchReadiness"), false);
    assert.equal(serializedSignals.includes("bookingValidation"), false);
    assert.equal(serializedSignals.includes("executionOrder"), false);
    assert.equal(serializedSignals.includes("fanSocialHandoff"), false);
    assert.equal(serializedSignals.includes("fanSocialHandoffValidation"), false);
    assert.equal(serializedSignals.includes("fanSocialOrchestrationSummary"), false);
    assert.equal(serializedSignals.includes("readyForFanReactionOrchestration"), false);
    assert.equal(serializedSignals.includes("readyForSocialDiscourseOrchestration"), false);
    assert.equal(serializedSignals.includes("orderedMatchSummaries"), false);
    assert.equal(serializedSignals.includes("finishValidationStatus"), false);
    assert.equal(serializedSignals.includes("finishValidation"), false);
    assert.equal(serializedSignals.includes("orderedMatchIds"), false);
    assert.equal(serializedSignals.includes("openerMatchId"), false);
    assert.equal(serializedSignals.includes("mainEventMatchId"), false);
    assert.equal(serializedSignals.includes("duplicate-order-indexes"), false);
    assert.equal(serializedSignals.includes("runSummary"), false);
    assert.equal(serializedSignals.includes("totalBookedMatches"), false);
    assert.equal(serializedSignals.includes("completedMatchRuns"), false);
    assert.equal(serializedSignals.includes("failedMatchRuns"), false);
    assert.equal(serializedSignals.includes("openResultGateCount"), false);
    assert.equal(serializedSignals.includes("pendingResultGateCount"), false);
    assert.equal(serializedSignals.includes("duplicate-match-ids"), false);
    assert.equal(serializedSignals.includes("missing-match-participants"), false);
    assert.equal(serializedSignals.includes("finishIntent"), false);
    assert.equal(serializedSignals.includes("winnerId"), false);
    assert.equal(serializedSignals.includes("starRating"), false);
    assert.equal(serializedSignals.includes("attendance"), false);
    assert.equal(serializedSignals.includes("ticketRevenue"), false);
    assert.equal(serializedSignals.includes("tvRevenue"), false);
    assert.equal(serializedSignals.includes("tweet"), false);
    assert.equal(serializedSignals.includes("narrative"), false);
  });

  it("does not calculate winners, ratings, attendance, revenue, or business outputs", () => {
    const result: ShowEngineResult = showEngine.run(
      createSampleShowEngineInputWithMultipleMatches(),
      createSampleEngineContext("show-v0-no-business", 7)
    );

    assertForbiddenResultFieldsAbsent(result);
    assertForbiddenResultFieldsAbsent(result.hiddenState);
    assert.equal(Object.hasOwn(result, "fanReactionResult"), false);
    assert.equal(Object.hasOwn(result, "socialDiscourseResult"), false);
    assert.equal(Object.hasOwn(result, "producedNarratives"), false);
    assert.equal(Object.hasOwn(result.hiddenState, "fanReactionOutput"), false);
    assert.equal(Object.hasOwn(result.hiddenState, "socialDiscourseOutput"), false);
    for (const matchResult of result.matchResults) {
      assert.equal(Object.hasOwn(matchResult, "winnerId"), false);
      assert.equal(Object.hasOwn(matchResult, "starRating"), false);
      assert.equal(Object.hasOwn(matchResult, "attendance"), false);
      assert.equal(Object.hasOwn(matchResult, "ticketRevenue"), false);
      assert.equal(Object.hasOwn(matchResult, "tvRevenue"), false);
    }
  });

  it("does not block show execution when a match engine run fails", () => {
    const input = createSampleShowEngineInput();
    const failingMatchEngine: MatchSimulationEngine = {
      ...matchEngine,
      run() {
        throw new Error("match engine unavailable");
      }
    };
    const engine = createShowEngine(failingMatchEngine);
    const result = engine.run(input, createSampleEngineContext("show-v0-failure-shell", 7), {
      debug: true
    });

    assert.equal(result.hiddenState.bookedMatchCount, 1);
    assert.equal(result.hiddenState.completedMatchEngineRuns, 0);
    assert.equal(result.hiddenState.failedMatchEngineRuns, 1);
    assert.equal(result.hiddenState.showReadinessStatus, "failed");
    assert.equal(result.hiddenState.runSummary.status, "failed");
    assert.equal(result.hiddenState.fanSocialHandoff.status, "partial");
    assert.equal(result.hiddenState.fanSocialHandoffValidation.status, "partial");
    assert.deepEqual(
      result.hiddenState.fanSocialOrchestrationSummary,
      expectedFanSocialOrchestrationSummary("partial", "limited")
    );
    assert.ok(result.hiddenState.fanSocialHandoff.issues.includes("match-run-failures"));
    assert.equal(result.hiddenState.runSummary.failedMatchRuns, 1);
    assert.equal(result.hiddenState.runSummary.closedResultGateCount, 1);
    assert.equal(result.hiddenState.matchReadinessAggregation.unavailableMatches, 1);
    assert.equal(result.hiddenState.matchReadinessAggregation.overallMatchReadiness, "unavailable");
    assert.ok(result.hiddenState.runSummary.issues.includes("all-match-runs-failed"));
    assert.equal(result.hiddenState.matchRunSummaries[0].status, "failed");
    assert.equal(result.hiddenState.matchRunSummaries[0].resultExecutionGateStatus, "closed");
    assert.deepEqual(result.matchResults, []);
    assertDebugTraceIsNonPlayerFacing(result.debugTrace);
  });

  it("summarizes a missing fan/social path defensively", () => {
    assert.deepEqual(
      createShowFanSocialOrchestrationSummary({}),
      expectedFanSocialOrchestrationSummary("missing", "missing")
    );
  });
});

function expectedFanSocialOrchestrationSummary(
  readiness: "missing" | "partial" | "structurally-ready",
  sourceAvailability: "missing" | "limited" | "available"
) {
  const stage = {
    readiness,
    sourceAvailability
  };

  return {
    status: readiness,
    ownership: "show-structural-summary-only",
    showFanSocialHandoff: stage,
    fanReactionShowOutputShell: stage,
    fanSocialDiscourseHandoffDto: stage,
    socialDiscourseReadiness: stage,
    socialDiscourseOutputShell: stage
  };
}

function createExplicitOrderInput(): ShowEngineInput {
  const input = createSampleShowEngineInputWithMultipleMatches();

  return {
    ...input,
    bookedMatches: [
      {
        ...input.bookedMatches[0],
        orderIndex: 20
      },
      {
        ...input.bookedMatches[1],
        orderIndex: 10
      }
    ]
  };
}

function createDuplicateOrderIndexInput(): ShowEngineInput {
  const input = createSampleShowEngineInputWithMultipleMatches();

  return {
    ...input,
    bookedMatches: input.bookedMatches.map((bookedMatch) => ({
      ...bookedMatch,
      orderIndex: 10
    }))
  };
}

function createMissingMatchIdInput(): ShowEngineInput {
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
            id: ""
          }
        }
      }
    ]
  };
}

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

function assertForbiddenResultFieldsAbsent(value: object): void {
  assert.equal(Object.hasOwn(value, "winnerId"), false);
  assert.equal(Object.hasOwn(value, "loserId"), false);
  assert.equal(Object.hasOwn(value, "result"), false);
  assert.equal(Object.hasOwn(value, "finishResult"), false);
  assert.equal(Object.hasOwn(value, "starRating"), false);
  assert.equal(Object.hasOwn(value, "rating"), false);
  assert.equal(Object.hasOwn(value, "attendance"), false);
  assert.equal(Object.hasOwn(value, "ticketRevenue"), false);
  assert.equal(Object.hasOwn(value, "tvRevenue"), false);
  assert.equal(Object.hasOwn(value, "gateReceipts"), false);
  assert.equal(Object.hasOwn(value, "showGrade"), false);
  assert.equal(Object.hasOwn(value, "consequences"), false);
}
