import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  FAN_REACTION_ENGINE_V0_ID,
  fanReactionEngine,
  showEngine,
  type FanReactionEngineResult,
  type FanReactionSimulationEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleFanReactionEngineInput,
  createSampleShowEngineInput,
  createSampleShowEngineInputWithoutMatches,
  samplePipelineHandoff
} from "./fixtures/index.ts";
import {
  assertDebugTraceIsNonPlayerFacing,
  assertEngineResultRespectsOutputBoundary
} from "./helpers/engineOutputBoundaryAssertions.ts";

describe("Fan Reaction Engine v0", () => {
  it("imports cleanly and implements FanReactionSimulationEngine", () => {
    const engine: FanReactionSimulationEngine = fanReactionEngine;

    assert.equal(engine, fanReactionEngine);
    assert.equal(typeof engine.run, "function");
  });

  it("exposes stable metadata", () => {
    assert.deepEqual(fanReactionEngine.metadata, {
      id: FAN_REACTION_ENGINE_V0_ID,
      name: "Fan Reaction Engine v0",
      version: "0.6.0"
    });
  });

  it("returns a FanReactionEngineResult through run(input, context, options)", () => {
    const input = createSampleFanReactionEngineInput();
    const context = createSampleEngineContext("fan-v0-result", 7);
    const result: FanReactionEngineResult = fanReactionEngine.run(input, context, {
      debug: true
    });

    assert.equal(result.engineName, "fan-reaction");
    assert.deepEqual(
      result.affectedFanSegmentIds,
      input.fanSegments.map((segment) => segment.id)
    );
    assert.deepEqual(result.affectedWrestlerIds, input.matchResult?.changedWrestlerIds);
    assert.deepEqual(result.affectedRivalryIds, input.matchResult?.changedRivalryIds);
    assert.equal(typeof result.hiddenState.reactionRoll, "number");
    assert.equal(result.hiddenState.matchHandoffPresent, true);
    assert.equal(result.hiddenState.inputMode, "match-only");
    assert.equal(result.hiddenState.showHandoffPresent, false);
    assert.equal(result.hiddenState.showHandoffValidationStatus, "missing");
    assert.equal(result.hiddenState.audienceReadSummary.status, "unavailable");
    assert.equal(result.hiddenState.showOutputShell.status, "unavailable");
    assert.equal(result.hiddenState.showOutputShell.crowdEnergyRead, "unavailable");
    assert.equal(result.hiddenState.showOutputShell.bookingTrustRead, "unavailable");
    assert.equal(result.hiddenState.showOutputShell.featuredTalentReceptionRead, "unavailable");
    assert.equal(result.hiddenState.showOutputShell.showMomentumRead, "unavailable");
    assert.equal(result.hiddenState.showOutputShell.confidenceRead, "unavailable");
    assert.ok(result.signals.length > 0);
  });

  it("defaults safely when show handoff is missing", () => {
    const input = {
      ...createSampleFanReactionEngineInput(),
      matchResult: undefined
    };
    const result = fanReactionEngine.run(
      input,
      createSampleEngineContext("fan-v0-show-handoff-missing", 7),
      { debug: true }
    );

    assert.equal(result.hiddenState.matchHandoffPresent, false);
    assert.equal(result.hiddenState.inputMode, "no-handoff");
    assert.equal(result.hiddenState.showHandoffPresent, false);
    assert.equal(result.hiddenState.showHandoffValidationPresent, false);
    assert.equal(result.hiddenState.showHandoffValidationStatus, "missing");
    assert.equal(result.hiddenState.showHandoffValidationConfidence, "unknown");
    assert.equal(result.hiddenState.showHandoffReadyForFanReaction, false);
    assert.equal(result.hiddenState.showHandoffReadyForSocialDiscourse, false);
    assert.equal(result.hiddenState.showHandoffMatchCount, 0);
    assert.equal(result.hiddenState.audienceReadSummary.status, "unavailable");
    assert.equal(result.hiddenState.audienceReadSummary.signalBand, "unknown");
    assert.ok(result.hiddenState.audienceReadSummary.issues.includes("missing-show-handoff"));
    assert.equal(result.hiddenState.showOutputShell.status, "unavailable");
    assert.equal(result.hiddenState.showOutputShell.overallCrowdSignal, "unknown");
    assert.equal(result.hiddenState.showOutputShell.crowdEnergyRead, "unavailable");
    assert.equal(result.hiddenState.showOutputShell.bookingTrustRead, "unavailable");
    assert.equal(result.hiddenState.showOutputShell.featuredTalentReceptionRead, "unavailable");
    assert.equal(result.hiddenState.showOutputShell.showMomentumRead, "unavailable");
    assert.equal(result.hiddenState.showOutputShell.confidenceRead, "unavailable");
    assert.equal(result.hiddenState.showOutputShell.readyForSocialDiscourseHandoff, false);
    assert.ok(result.signals.length > 0);
  });

  it("creates an empty hidden audience read for an empty show handoff", () => {
    const showInput = createSampleShowEngineInputWithoutMatches();
    const showResult = showEngine.run(
      showInput,
      createSampleEngineContext("fan-v0-empty-audience-read-source", 7)
    );
    const result = fanReactionEngine.run(
      {
        ...createSampleFanReactionEngineInput(),
        matchResult: undefined,
        showInput: {
          showId: showInput.show.id,
          handoff: {
            fanSocialHandoff: showResult.hiddenState.fanSocialHandoff,
            fanSocialHandoffValidation: showResult.hiddenState.fanSocialHandoffValidation
          }
        }
      },
      createSampleEngineContext("fan-v0-empty-audience-read", 7),
      { debug: true }
    );

    assert.equal(result.hiddenState.audienceReadSummary.status, "empty");
    assert.equal(result.hiddenState.audienceReadSummary.confidence, "unknown");
    assert.equal(result.hiddenState.audienceReadSummary.signalBand, "quiet");
    assert.equal(result.hiddenState.audienceReadSummary.matchCount, 0);
    assert.equal(result.hiddenState.showOutputShell.status, "empty");
    assert.equal(result.hiddenState.showOutputShell.overallCrowdSignal, "quiet");
    assert.equal(result.hiddenState.showOutputShell.crowdEnergyRead, "pending");
    assert.equal(result.hiddenState.showOutputShell.bookingTrustRead, "needs-more-context");
    assert.equal(
      result.hiddenState.showOutputShell.featuredTalentReceptionRead,
      "needs-more-context"
    );
    assert.equal(result.hiddenState.showOutputShell.showMomentumRead, "pending");
    assert.equal(result.hiddenState.showOutputShell.confidenceRead, "needs-more-context");
    assert.equal(result.hiddenState.showOutputShell.readyForSocialDiscourseHandoff, false);
  });

  it("creates structurally-ready hidden show signals for a validated show handoff", () => {
    const showInput = createSampleShowEngineInput();
    const showResult = showEngine.run(
      showInput,
      createSampleEngineContext("fan-v0-validated-show-source", 7)
    );
    const input = {
      ...createSampleFanReactionEngineInput(),
      showInput: {
        showId: showInput.show.id,
        handoff: {
          fanSocialHandoff: showResult.hiddenState.fanSocialHandoff,
          fanSocialHandoffValidation: showResult.hiddenState.fanSocialHandoffValidation
        }
      }
    };
    const result = fanReactionEngine.run(
      input,
      createSampleEngineContext("fan-v0-validated-show-input", 7),
      { debug: true }
    );

    assert.equal(result.hiddenState.inputMode, "match-and-show-handoff");
    assert.equal(result.hiddenState.showHandoffPresent, true);
    assert.equal(result.hiddenState.showHandoffValidationPresent, true);
    assert.equal(result.hiddenState.showHandoffValidationStatus, "ready");
    assert.equal(result.hiddenState.showHandoffValidationConfidence, "strong");
    assert.equal(result.hiddenState.showHandoffReadyForFanReaction, true);
    assert.equal(result.hiddenState.showHandoffReadyForSocialDiscourse, true);
    assert.equal(result.hiddenState.showHandoffMatchCount, 1);
    assert.equal(result.hiddenState.inputValidationSummary.showId, showInput.show.id);
    assert.equal(result.hiddenState.audienceReadSummary.status, "ready");
    assert.equal(result.hiddenState.audienceReadSummary.confidence, "moderate");
    assert.equal(result.hiddenState.audienceReadSummary.signalBand, "engaged");
    assert.equal(result.hiddenState.audienceReadSummary.openerPresent, true);
    assert.equal(result.hiddenState.audienceReadSummary.mainEventPresent, true);
    assert.equal(result.hiddenState.showOutputShell.status, "ready");
    assert.equal(result.hiddenState.showOutputShell.confidence, "moderate");
    assert.equal(result.hiddenState.showOutputShell.overallCrowdSignal, "engaged");
    assert.equal(result.hiddenState.showOutputShell.crowdEnergyRead, "structurally-ready");
    assert.equal(result.hiddenState.showOutputShell.bookingTrustRead, "structurally-ready");
    assert.equal(
      result.hiddenState.showOutputShell.featuredTalentReceptionRead,
      "structurally-ready"
    );
    assert.equal(result.hiddenState.showOutputShell.showMomentumRead, "structurally-ready");
    assert.equal(result.hiddenState.showOutputShell.confidenceRead, "structurally-ready");
    assert.equal(result.hiddenState.showOutputShell.discourseReadinessShell, "engaged");
    assert.equal(result.hiddenState.showOutputShell.readyForSocialDiscourseHandoff, true);
    assert.deepEqual(result.affectedWrestlerIds, input.matchResult?.changedWrestlerIds);
  });

  it("creates structural audience segment shells for show output handoff", () => {
    const showInput = createSampleShowEngineInput();
    const showResult = showEngine.run(
      showInput,
      createSampleEngineContext("fan-v0-segment-shell-source", 7)
    );
    const result = fanReactionEngine.run(
      {
        ...createSampleFanReactionEngineInput(),
        showInput: {
          showId: showInput.show.id,
          handoff: {
            fanSocialHandoff: showResult.hiddenState.fanSocialHandoff,
            fanSocialHandoffValidation: showResult.hiddenState.fanSocialHandoffValidation
          }
        }
      },
      createSampleEngineContext("fan-v0-segment-shell", 7)
    );

    assert.deepEqual(
      result.hiddenState.showOutputShell.audienceSegmentSignals.map((signal) => signal.segmentKey),
      ["live_crowd", "casual_fans", "hardcore_fans", "iwc", "tv_audience"]
    );
    assert.ok(
      result.hiddenState.showOutputShell.audienceSegmentSignals.every(
        (signal) => signal.source === "audience-read-placeholder"
      )
    );
  });

  it("lowers hidden audience read readiness and confidence for partial or invalid handoffs", () => {
    const showInput = createSampleShowEngineInput();
    const showResult = showEngine.run(
      showInput,
      createSampleEngineContext("fan-v0-partial-audience-read-source", 7)
    );
    const partialResult = fanReactionEngine.run(
      {
        ...createSampleFanReactionEngineInput(),
        showInput: {
          showId: showInput.show.id,
          handoff: {
            fanSocialHandoff: {
              ...showResult.hiddenState.fanSocialHandoff,
              orderedMatchSummaries: [
                {
                  ...showResult.hiddenState.fanSocialHandoff.orderedMatchSummaries[0],
                  resultGateStatus: "blocked",
                  resultShellStatus: "blocked"
                }
              ]
            },
            fanSocialHandoffValidation: {
              ...showResult.hiddenState.fanSocialHandoffValidation,
              status: "partial",
              confidence: "moderate",
              readyForFanReactionOrchestration: false,
              readyForSocialDiscourseOrchestration: false
            }
          }
        }
      },
      createSampleEngineContext("fan-v0-partial-audience-read", 7)
    );
    const invalidResult = fanReactionEngine.run(
      {
        ...createSampleFanReactionEngineInput(),
        showInput: {
          showId: showInput.show.id,
          handoff: {
            fanSocialHandoff: showResult.hiddenState.fanSocialHandoff,
            fanSocialHandoffValidation: {
              ...showResult.hiddenState.fanSocialHandoffValidation,
              status: "invalid",
              confidence: "low",
              readyForFanReactionOrchestration: false,
              readyForSocialDiscourseOrchestration: false
            }
          }
        }
      },
      createSampleEngineContext("fan-v0-invalid-audience-read", 7)
    );

    assert.equal(partialResult.hiddenState.audienceReadSummary.status, "partial");
    assert.equal(partialResult.hiddenState.audienceReadSummary.confidence, "low");
    assert.equal(partialResult.hiddenState.audienceReadSummary.signalBand, "mixed");
    assert.ok(partialResult.hiddenState.audienceReadSummary.issues.includes("handoff-partial"));
    assert.ok(partialResult.hiddenState.audienceReadSummary.issues.includes("blocked-result-gates"));
    assert.equal(partialResult.hiddenState.showOutputShell.status, "partial");
    assert.equal(partialResult.hiddenState.showOutputShell.overallCrowdSignal, "mixed");
    assert.equal(partialResult.hiddenState.showOutputShell.crowdEnergyRead, "limited");
    assert.equal(partialResult.hiddenState.showOutputShell.bookingTrustRead, "limited");
    assert.equal(
      partialResult.hiddenState.showOutputShell.featuredTalentReceptionRead,
      "limited"
    );
    assert.equal(partialResult.hiddenState.showOutputShell.showMomentumRead, "limited");
    assert.equal(partialResult.hiddenState.showOutputShell.confidenceRead, "limited");
    assert.equal(partialResult.hiddenState.showOutputShell.backlashRiskShell, "mixed");
    assert.equal(partialResult.hiddenState.showOutputShell.readyForSocialDiscourseHandoff, false);
    assert.equal(invalidResult.hiddenState.audienceReadSummary.status, "partial");
    assert.ok(invalidResult.hiddenState.audienceReadSummary.issues.includes("handoff-invalid"));
    assert.equal(invalidResult.hiddenState.showOutputShell.status, "partial");
  });

  it("uses context.random deterministically for the same seed and input", () => {
    const input = createSampleFanReactionEngineInput();
    const firstResult = fanReactionEngine.run(
      input,
      createSampleEngineContext("fan-v0-same-seed", 7),
      { debug: true }
    );
    const secondResult = fanReactionEngine.run(
      input,
      createSampleEngineContext("fan-v0-same-seed", 7),
      { debug: true }
    );

    assert.deepEqual(firstResult, secondResult);
  });

  it("allows different seeds to produce different hidden and debug outcomes", () => {
    const input = createSampleFanReactionEngineInput();
    const firstResult = fanReactionEngine.run(
      input,
      createSampleEngineContext("fan-v0-seed-a", 7),
      { debug: true }
    );
    const secondResult = fanReactionEngine.run(
      input,
      createSampleEngineContext("fan-v0-seed-b", 7),
      { debug: true }
    );

    assert.notDeepEqual(firstResult.hiddenState, secondResult.hiddenState);
    assert.notDeepEqual(firstResult.debugTrace?.hiddenRolls, secondResult.debugTrace?.hiddenRolls);
  });

  it("does not expose hidden numeric state through player-facing signals", () => {
    const result = fanReactionEngine.run(
      createSampleFanReactionEngineInput(),
      createSampleEngineContext("fan-v0-hidden-boundary", 7)
    );

    assert.ok(Object.values(result.hiddenState).some((value) => typeof value === "number"));
    assertEngineResultRespectsOutputBoundary(result);
  });

  it("keeps show handoff readiness internal only", () => {
    const showInput = createSampleShowEngineInput();
    const showResult = showEngine.run(
      showInput,
      createSampleEngineContext("fan-v0-internal-show-source", 7)
    );
    const result = fanReactionEngine.run(
      {
        ...createSampleFanReactionEngineInput(),
        showInput: {
          showId: showInput.show.id,
          handoff: {
            fanSocialHandoff: showResult.hiddenState.fanSocialHandoff,
            fanSocialHandoffValidation: showResult.hiddenState.fanSocialHandoffValidation
          }
        }
      },
      createSampleEngineContext("fan-v0-internal-show-readiness", 7)
    );
    const serializedSignals = JSON.stringify(result.signals);

    assert.equal(serializedSignals.includes("showHandoff"), false);
    assert.equal(serializedSignals.includes("fanSocialHandoff"), false);
    assert.equal(serializedSignals.includes("readyForFanReaction"), false);
    assert.equal(serializedSignals.includes("readyForSocialDiscourse"), false);
    assert.equal(serializedSignals.includes("inputValidationSummary"), false);
    assert.equal(serializedSignals.includes("audienceReadSummary"), false);
    assert.equal(serializedSignals.includes("FanAudienceRead"), false);
    assert.equal(serializedSignals.includes("showOutputShell"), false);
    assert.equal(serializedSignals.includes("audienceSegmentSignals"), false);
    assert.equal(serializedSignals.includes("discourseReadinessShell"), false);
    assert.equal(serializedSignals.includes("crowdEnergyRead"), false);
    assert.equal(serializedSignals.includes("bookingTrustRead"), false);
    assert.equal(serializedSignals.includes("featuredTalentReceptionRead"), false);
    assert.equal(serializedSignals.includes("showMomentumRead"), false);
    assert.equal(serializedSignals.includes("confidenceRead"), false);
  });

  it("keeps debug traces optional and non-player-facing", () => {
    const input = createSampleFanReactionEngineInput();
    const withoutDebug = fanReactionEngine.run(input, {
      ...createSampleEngineContext("fan-v0-debug", 7),
      debug: false
    });
    const withDebug = fanReactionEngine.run(input, createSampleEngineContext("fan-v0-debug", 7), {
      debug: true
    });

    assert.equal(withoutDebug.debugTrace, undefined);
    assertDebugTraceIsNonPlayerFacing(withDebug.debugTrace);
    assert.equal(withDebug.debugTrace?.engineName, "fan-reaction");
  });

  it("can consume the existing match-to-fan fixture handoff", () => {
    const input = samplePipelineHandoff.fanReactionInput;
    const result = fanReactionEngine.run(
      input,
      createSampleEngineContext("fan-v0-fixture-handoff", 7),
      { debug: true }
    );

    assert.equal(input.matchResult, samplePipelineHandoff.matchResult);
    assert.equal(result.hiddenState.matchHandoffPresent, true);
    assert.deepEqual(result.affectedWrestlerIds, samplePipelineHandoff.matchResult.changedWrestlerIds);
    assert.deepEqual(result.affectedRivalryIds, samplePipelineHandoff.matchResult.changedRivalryIds);
  });

  it("does not add real fan formulas, social discourse output, or business/result fields", () => {
    const result: FanReactionEngineResult = fanReactionEngine.run(
      createSampleFanReactionEngineInput(),
      createSampleEngineContext("fan-v0-no-forbidden-systems", 7)
    );

    assertForbiddenResultFieldsAbsent(result);
    assertForbiddenResultFieldsAbsent(result.hiddenState);
    assert.equal(Object.hasOwn(result, "fanScore"), false);
    assert.equal(Object.hasOwn(result, "sentimentShift"), false);
    assert.equal(Object.hasOwn(result, "socialDiscourseResult"), false);
    assert.equal(Object.hasOwn(result, "producedNarratives"), false);
    assert.equal(Object.hasOwn(result, "updatedNarrativeIds"), false);
    assert.equal(Object.hasOwn(result, "fanScore"), false);
    assert.equal(Object.hasOwn(result.hiddenState, "fanScore"), false);
    assert.equal(Object.hasOwn(result.hiddenState, "sentimentShift"), false);
    assert.equal(Object.hasOwn(result.hiddenState, "backlash"), false);
    assert.equal(Object.hasOwn(result.hiddenState, "popularityChange"), false);
    assert.equal(Object.hasOwn(result.hiddenState, "momentumChange"), false);
    assert.equal(Object.hasOwn(result, "popularityChanges"), false);
    assert.equal(Object.hasOwn(result, "momentumConsequences"), false);
  });

  it("does not use the global random API directly in source or tests", () => {
    const forbidden = "Math" + "." + "random";
    const matches = findTypeScriptFiles(["src", "tests"]).filter((filePath) =>
      readFileSync(filePath, "utf8").includes(forbidden)
    );

    assert.deepEqual(matches, []);
  });
});

function findTypeScriptFiles(relativeDirectories: readonly string[]): string[] {
  return relativeDirectories.flatMap((directory) => walk(directory));
}

function assertForbiddenResultFieldsAbsent(value: object): void {
  assert.equal(Object.hasOwn(value, "winnerId"), false);
  assert.equal(Object.hasOwn(value, "loserId"), false);
  assert.equal(Object.hasOwn(value, "starRating"), false);
  assert.equal(Object.hasOwn(value, "rating"), false);
  assert.equal(Object.hasOwn(value, "attendance"), false);
  assert.equal(Object.hasOwn(value, "ticketRevenue"), false);
  assert.equal(Object.hasOwn(value, "tvRevenue"), false);
  assert.equal(Object.hasOwn(value, "gateReceipts"), false);
  assert.equal(Object.hasOwn(value, "showGrade"), false);
  assert.equal(Object.hasOwn(value, "backlashScore"), false);
  assert.equal(Object.hasOwn(value, "sentimentScore"), false);
  assert.equal(Object.hasOwn(value, "popularityChange"), false);
  assert.equal(Object.hasOwn(value, "momentumChange"), false);
  assert.equal(Object.hasOwn(value, "consequences"), false);
}

function walk(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      return walk(entryPath);
    }

    return entry.isFile() && entry.name.endsWith(".ts") ? [entryPath] : [];
  });
}
