import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  createEngineRegistry,
  createEnginePipelineStructuralSummary,
  createFanSocialDiscourseHandoff,
  createProductionEngineRegistry,
  DEFAULT_FAN_REACTION_ENGINE_ID,
  DEFAULT_MATCH_ENGINE_ID,
  DEFAULT_SHOW_ENGINE_ID,
  DEFAULT_SOCIAL_DISCOURSE_ENGINE_ID,
  fanReactionEngine,
  matchEngine,
  runMatchFanSocialSmokePipeline,
  runShowFanReactionSmokePipeline,
  showEngine,
  socialDiscourseEngine,
  type FanReactionSimulationEngine,
  type MatchFanSocialSmokeResult,
  type MatchSimulationEngine,
  type ShowEngineResult,
  type SimulationEngineContext,
  type ShowOverallMatchReadiness,
  type ShowSimulationEngine,
  type SocialDiscourseSimulationEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInputWithFinishIntent,
  createSampleMatchEngineInput,
  createSampleMatchEngineInputWithTalentProfiles,
  createSampleShowEngineInput,
  createSampleShowEngineInputWithoutMatches
} from "./fixtures/index.ts";
import {
  assertDebugTraceIsNonPlayerFacing,
  assertEngineResultRespectsOutputBoundary
} from "./helpers/engineOutputBoundaryAssertions.ts";

describe("Match -> Fan Reaction -> Social Discourse smoke pipeline", () => {
  it("runs the full production engine shell sequence", () => {
    const input = createSampleMatchEngineInput();
    const context = createSampleEngineContext("smoke-sequence", 7);
    const result = runMatchFanSocialSmokePipeline(
      createProductionEngineRegistry(),
      input,
      context,
      { debug: true }
    );

    assert.equal(result.matchResult.engineName, "match");
    assert.equal(result.fanReactionResult.engineName, "fan-reaction");
    assert.equal(result.socialDiscourseResult.engineName, "social-discourse");
    assert.equal(result.fanReactionResult.hiddenState.matchHandoffPresent, true);
    assert.equal(result.socialDiscourseResult.hiddenState.matchHandoffPresent, true);
    assert.equal(result.socialDiscourseResult.hiddenState.fanReactionHandoffPresent, true);
    assert.deepEqual(result.pipelineStructuralSummary, {
      status: "partial",
      summaryVersion: "0.2.0",
      ownership: "pipeline-structural-summary-only",
      showStage: expectedPipelineStage("missing", "missing"),
      matchStage: expectedPipelineStage("structurally-ready", "available"),
      showMatchReadinessStage: expectedPipelineStage("missing", "missing"),
      fanReactionStage: expectedPipelineStage("structurally-ready", "available"),
      fanSocialHandoffStage: expectedPipelineStage("partial", "limited"),
      socialDiscourseStage: expectedPipelineStage("partial", "limited")
    });
    assert.deepEqual(result.socialDiscourseResult.hiddenState.fanReactionShowOutputReadiness, {
      provided: true,
      structurallyUsable: true,
      inputStatus: "usable",
      shellStatus: "unavailable",
      readyForSocialDiscourseHandoff: false,
      issueCount: 3,
      matchCount: 0,
      showId: null
    });
  });

  it("runs the smoke sequence when match input includes optional talent profiles", () => {
    const input = createSampleMatchEngineInputWithTalentProfiles();
    const context = createSampleEngineContext("smoke-sequence-with-talent", 7);
    const result = runMatchFanSocialSmokePipeline(
      createProductionEngineRegistry(),
      input,
      context,
      { debug: true }
    );

    assert.equal(result.matchResult.hiddenState.talentProfileCoverage, "full");
    assert.equal(result.matchResult.hiddenState.talentProfileReadStatus, "full-coverage");
    assert.equal(result.fanReactionResult.hiddenState.matchHandoffPresent, true);
    assert.equal(result.socialDiscourseResult.hiddenState.matchHandoffPresent, true);
    assert.deepEqual(result.socialDiscourseResult.producedNarratives, []);
  });

  it("keeps the aggregate result deterministic for the same seed and input", () => {
    const input = createSampleMatchEngineInput();
    const firstResult = runMatchFanSocialSmokePipeline(
      createProductionEngineRegistry(),
      input,
      createSampleEngineContext("smoke-same-seed", 7),
      { debug: true }
    );
    const secondResult = runMatchFanSocialSmokePipeline(
      createProductionEngineRegistry(),
      input,
      createSampleEngineContext("smoke-same-seed", 7),
      { debug: true }
    );

    assert.deepEqual(firstResult, secondResult);
  });

  it("keeps fan reaction and social discourse behavior unchanged when talent profiles are present", () => {
    const withoutTalentResult = runMatchFanSocialSmokePipeline(
      createProductionEngineRegistry(),
      createSampleMatchEngineInput(),
      createSampleEngineContext("smoke-talent-no-downstream-change", 7),
      { debug: true }
    );
    const withTalentResult = runMatchFanSocialSmokePipeline(
      createProductionEngineRegistry(),
      createSampleMatchEngineInputWithTalentProfiles(),
      createSampleEngineContext("smoke-talent-no-downstream-change", 7),
      { debug: true }
    );

    assert.notDeepEqual(withTalentResult.matchResult.hiddenState, withoutTalentResult.matchResult.hiddenState);
    assert.deepEqual(withTalentResult.matchResult.signals, withoutTalentResult.matchResult.signals);
    assert.deepEqual(withTalentResult.fanReactionResult, withoutTalentResult.fanReactionResult);
    assert.deepEqual(withTalentResult.socialDiscourseResult, withoutTalentResult.socialDiscourseResult);
  });

  it("keeps fan reaction and social discourse behavior unchanged when finish intent is present", () => {
    const withoutIntentResult = runMatchFanSocialSmokePipeline(
      createProductionEngineRegistry(),
      createSampleMatchEngineInputWithTalentProfiles(),
      createSampleEngineContext("smoke-finish-intent-no-downstream-change", 7),
      { debug: true }
    );
    const withIntentResult = runMatchFanSocialSmokePipeline(
      createProductionEngineRegistry(),
      createSampleMatchEngineInputWithFinishIntent({
        type: "interference",
        protection: "disputed",
        controversy: "high"
      }),
      createSampleEngineContext("smoke-finish-intent-no-downstream-change", 7),
      { debug: true }
    );

    assert.notDeepEqual(
      withIntentResult.matchResult.hiddenState.finishReadSummary,
      withoutIntentResult.matchResult.hiddenState.finishReadSummary
    );
    assert.deepEqual(withIntentResult.matchResult.signals, withoutIntentResult.matchResult.signals);
    assert.deepEqual(withIntentResult.fanReactionResult, withoutIntentResult.fanReactionResult);
    assert.deepEqual(withIntentResult.socialDiscourseResult, withoutIntentResult.socialDiscourseResult);
  });

  it("allows a different seed to produce different hidden and debug outcomes", () => {
    const input = createSampleMatchEngineInput();
    const firstResult = runMatchFanSocialSmokePipeline(
      createProductionEngineRegistry(),
      input,
      createSampleEngineContext("smoke-seed-a", 7),
      { debug: true }
    );
    const secondResult = runMatchFanSocialSmokePipeline(
      createProductionEngineRegistry(),
      input,
      createSampleEngineContext("smoke-seed-b", 7),
      { debug: true }
    );

    assert.notDeepEqual(hiddenAggregate(firstResult), hiddenAggregate(secondResult));
    assert.notDeepEqual(debugRollAggregate(firstResult), debugRollAggregate(secondResult));
  });

  it("passes the same SimulationEngineContext object to all three engine calls", () => {
    const registry = createEngineRegistry();
    const context = createSampleEngineContext("smoke-shared-context", 7);
    const capturedContexts: SimulationEngineContext[] = [];
    const trackingMatchEngine: MatchSimulationEngine = {
      metadata: {
        ...matchEngine.metadata,
        id: DEFAULT_MATCH_ENGINE_ID
      },
      run(input, runContext, options) {
        capturedContexts.push(runContext);
        return matchEngine.run(input, runContext, options);
      }
    };
    const trackingFanReactionEngine: FanReactionSimulationEngine = {
      metadata: {
        ...fanReactionEngine.metadata,
        id: DEFAULT_FAN_REACTION_ENGINE_ID
      },
      run(input, runContext, options) {
        capturedContexts.push(runContext);
        return fanReactionEngine.run(input, runContext, options);
      }
    };
    const trackingSocialDiscourseEngine: SocialDiscourseSimulationEngine = {
      metadata: {
        ...socialDiscourseEngine.metadata,
        id: DEFAULT_SOCIAL_DISCOURSE_ENGINE_ID
      },
      run(input, runContext, options) {
        capturedContexts.push(runContext);
        return socialDiscourseEngine.run(input, runContext, options);
      }
    };

    registry.register(trackingMatchEngine);
    registry.register(trackingFanReactionEngine);
    registry.register(trackingSocialDiscourseEngine);

    runMatchFanSocialSmokePipeline(registry, createSampleMatchEngineInput(), context, {
      debug: true
    });

    assert.deepEqual(capturedContexts, [context, context, context]);
  });

  it("returns expected stage result shapes", () => {
    const input = createSampleMatchEngineInput();
    const result = runMatchFanSocialSmokePipeline(
      createProductionEngineRegistry(),
      input,
      createSampleEngineContext("smoke-result-shapes", 7),
      { debug: true }
    );

    assert.equal(result.matchResult.matchId, input.match.id);
    assert.deepEqual(
      result.fanReactionResult.affectedFanSegmentIds,
      input.fanSegments.map((segment) => segment.id)
    );
    assert.deepEqual(result.socialDiscourseResult.producedNarratives, []);
    assert.deepEqual(result.socialDiscourseResult.updatedNarrativeIds, []);
  });

  it("keeps hidden numeric state out of player-facing signals at every stage", () => {
    const result = runMatchFanSocialSmokePipeline(
      createProductionEngineRegistry(),
      createSampleMatchEngineInput(),
      createSampleEngineContext("smoke-hidden-boundary", 7)
    );

    for (const stage of stages(result)) {
      assert.ok(Object.values(stage.hiddenState).some((value) => typeof value === "number"));
      assertEngineResultRespectsOutputBoundary(stage);
    }
  });

  it("keeps debug traces optional and non-player-facing at every stage", () => {
    const input = createSampleMatchEngineInput();
    const withoutDebug = runMatchFanSocialSmokePipeline(
      createProductionEngineRegistry(),
      input,
      { ...createSampleEngineContext("smoke-debug", 7), debug: false }
    );
    const withDebug = runMatchFanSocialSmokePipeline(
      createProductionEngineRegistry(),
      input,
      createSampleEngineContext("smoke-debug", 7),
      { debug: true }
    );

    for (const stage of stages(withoutDebug)) {
      assert.equal(stage.debugTrace, undefined);
    }

    for (const stage of stages(withDebug)) {
      assertDebugTraceIsNonPlayerFacing(stage.debugTrace);
    }
  });

  it("keeps producedNarratives empty until a future narrative layer exists", () => {
    const result = runMatchFanSocialSmokePipeline(
      createProductionEngineRegistry(),
      createSampleMatchEngineInput(),
      createSampleEngineContext("smoke-no-generated-narratives", 7)
    );

    assert.deepEqual(result.socialDiscourseResult.producedNarratives, []);
  });

  it("does not use the global random API directly in source or tests", () => {
    const forbidden = "Math" + "." + "random";
    const matches = findTypeScriptFiles(["src", "tests"]).filter((filePath) =>
      readFileSync(filePath, "utf8").includes(forbidden)
    );

    assert.deepEqual(matches, []);
  });
});

describe("Show -> Fan Reaction smoke pipeline", () => {
  it("runs Show Engine then Fan Reaction Engine", () => {
    const registry = createEngineRegistry();
    const input = createSampleShowEngineInput();
    const context = createSampleEngineContext("show-fan-smoke-order", 7);
    const calls: string[] = [];
    const trackingShowEngine: ShowSimulationEngine = {
      metadata: {
        ...showEngine.metadata,
        id: DEFAULT_SHOW_ENGINE_ID
      },
      run(runInput, runContext, options) {
        calls.push("show");
        return showEngine.run(runInput, runContext, options);
      }
    };
    const trackingFanReactionEngine: FanReactionSimulationEngine = {
      metadata: {
        ...fanReactionEngine.metadata,
        id: DEFAULT_FAN_REACTION_ENGINE_ID
      },
      run(runInput, runContext, options) {
        calls.push("fan-reaction");
        return fanReactionEngine.run(runInput, runContext, options);
      }
    };

    registry.register(trackingShowEngine);
    registry.register(trackingFanReactionEngine);

    const result = runShowFanReactionSmokePipeline(registry, input, context, { debug: true });

    assert.deepEqual(calls, ["show", "fan-reaction"]);
    assert.equal(result.showResult.engineName, "show");
    assert.equal(result.fanReactionResult.engineName, "fan-reaction");
    assert.deepEqual(result.pipelineStructuralSummary, {
      status: "partial",
      summaryVersion: "0.2.0",
      ownership: "pipeline-structural-summary-only",
      showStage: expectedPipelineStage("structurally-ready", "available"),
      matchStage: expectedPipelineStage("structurally-ready", "available"),
      showMatchReadinessStage: expectedPipelineStage("limited", "limited"),
      fanReactionStage: expectedPipelineStage("structurally-ready", "available"),
      fanSocialHandoffStage: expectedPipelineStage("structurally-ready", "available"),
      socialDiscourseStage: expectedPipelineStage("missing", "missing")
    });
  });

  it("passes validated Show Engine fan/social handoff into Fan Reaction Engine", () => {
    const registry = createEngineRegistry();
    const input = createSampleShowEngineInput();
    let capturedFanInput: Parameters<FanReactionSimulationEngine["run"]>[0] | undefined;
    const trackingFanReactionEngine: FanReactionSimulationEngine = {
      metadata: {
        ...fanReactionEngine.metadata,
        id: DEFAULT_FAN_REACTION_ENGINE_ID
      },
      run(runInput, runContext, options) {
        capturedFanInput = runInput;
        return fanReactionEngine.run(runInput, runContext, options);
      }
    };

    registry.register(showEngine);
    registry.register(trackingFanReactionEngine);

    const result = runShowFanReactionSmokePipeline(
      registry,
      input,
      createSampleEngineContext("show-fan-smoke-validated-handoff", 7),
      { debug: true }
    );

    assert.equal(
      capturedFanInput?.showInput?.handoff?.fanSocialHandoff,
      result.showResult.hiddenState.fanSocialHandoff
    );
    assert.equal(
      capturedFanInput?.showInput?.handoff?.fanSocialHandoffValidation,
      result.showResult.hiddenState.fanSocialHandoffValidation
    );
    assert.equal(result.showResult.hiddenState.fanSocialHandoff.status, "ready");
    assert.equal(result.showResult.hiddenState.fanSocialHandoffValidation.status, "ready");
    assert.equal(result.fanReactionResult.hiddenState.inputMode, "show-handoff");
    assert.equal(result.fanReactionResult.hiddenState.matchHandoffPresent, false);
    assert.equal(result.fanReactionResult.hiddenState.showHandoffPresent, true);
    assert.equal(result.fanReactionResult.hiddenState.showHandoffValidationPresent, true);
    assert.equal(result.fanReactionResult.hiddenState.showHandoffValidationStatus, "ready");
    assert.equal(result.fanReactionResult.hiddenState.showHandoffReadyForFanReaction, true);
    assert.equal(result.fanReactionResult.hiddenState.showHandoffMatchCount, 1);
    assert.equal(result.fanReactionResult.hiddenState.audienceReadSummary.status, "ready");
    assert.equal(result.fanReactionResult.hiddenState.audienceReadSummary.signalBand, "engaged");
    assert.equal(result.fanReactionResult.hiddenState.showOutputShell.status, "ready");
    assert.equal(result.fanReactionResult.hiddenState.showOutputShell.overallCrowdSignal, "engaged");
    assert.equal(
      result.fanReactionResult.hiddenState.showOutputShell.crowdEnergyRead,
      "structurally-ready"
    );
    assert.equal(
      result.fanReactionResult.hiddenState.showOutputShell.bookingTrustRead,
      "structurally-ready"
    );
    assert.equal(
      result.fanReactionResult.hiddenState.showOutputShell.featuredTalentReceptionRead,
      "structurally-ready"
    );
    assert.equal(
      result.fanReactionResult.hiddenState.showOutputShell.showMomentumRead,
      "structurally-ready"
    );
    assert.equal(
      result.fanReactionResult.hiddenState.showOutputShell.confidenceRead,
      "structurally-ready"
    );
    assert.equal(
      result.fanReactionResult.hiddenState.inputValidationSummary.showId,
      input.show.id
    );
  });

  it("handles empty show handoffs safely", () => {
    const input = createSampleShowEngineInputWithoutMatches();
    const result = runShowFanReactionSmokePipeline(
      createProductionEngineRegistry(),
      input,
      createSampleEngineContext("show-fan-smoke-empty-handoff", 7),
      { debug: true }
    );

    assert.equal(result.showResult.hiddenState.fanSocialHandoff.status, "empty");
    assert.equal(result.showResult.hiddenState.fanSocialHandoffValidation.status, "empty");
    assert.equal(result.fanReactionResult.hiddenState.inputMode, "show-handoff");
    assert.equal(result.fanReactionResult.hiddenState.showHandoffPresent, true);
    assert.equal(result.fanReactionResult.hiddenState.showHandoffValidationStatus, "empty");
    assert.equal(result.fanReactionResult.hiddenState.showHandoffReadyForFanReaction, false);
    assert.equal(result.fanReactionResult.hiddenState.showHandoffMatchCount, 0);
    assert.deepEqual(result.pipelineStructuralSummary, {
      status: "partial",
      summaryVersion: "0.2.0",
      ownership: "pipeline-structural-summary-only",
      showStage: expectedPipelineStage("partial", "limited"),
      matchStage: expectedPipelineStage("missing", "missing"),
      showMatchReadinessStage: expectedPipelineStage("missing", "missing"),
      fanReactionStage: expectedPipelineStage("structurally-ready", "available"),
      fanSocialHandoffStage: expectedPipelineStage("partial", "limited"),
      socialDiscourseStage: expectedPipelineStage("missing", "missing")
    });
  });

  it("handles a missing show handoff defensively", () => {
    const registry = createEngineRegistry();
    const missingHandoffShowEngine: ShowSimulationEngine = {
      metadata: {
        ...showEngine.metadata,
        id: DEFAULT_SHOW_ENGINE_ID
      },
      run(runInput, runContext, options) {
        const result = showEngine.run(runInput, runContext, options);

        return {
          ...result,
          hiddenState: {
            ...result.hiddenState,
            fanSocialHandoff: undefined,
            fanSocialHandoffValidation: undefined
          }
        } as unknown as ReturnType<ShowSimulationEngine["run"]>;
      }
    };

    registry.register(missingHandoffShowEngine);
    registry.register({
      ...fanReactionEngine,
      metadata: {
        ...fanReactionEngine.metadata,
        id: DEFAULT_FAN_REACTION_ENGINE_ID
      }
    });

    const result = runShowFanReactionSmokePipeline(
      registry,
      createSampleShowEngineInput(),
      createSampleEngineContext("show-fan-smoke-missing-handoff", 7)
    );

    assert.equal(result.fanReactionResult.hiddenState.inputMode, "no-handoff");
    assert.equal(result.fanReactionResult.hiddenState.showHandoffPresent, false);
    assert.equal(result.fanReactionResult.hiddenState.showHandoffValidationStatus, "missing");
    assert.deepEqual(result.pipelineStructuralSummary.fanSocialHandoffStage, expectedPipelineStage("missing", "missing"));
  });

  it("keeps player-facing outputs non-numeric and signal-based", () => {
    const result = runShowFanReactionSmokePipeline(
      createProductionEngineRegistry(),
      createSampleShowEngineInput(),
      createSampleEngineContext("show-fan-smoke-output-boundary", 7)
    );

    assertEngineResultRespectsOutputBoundary(result.showResult);
    assertEngineResultRespectsOutputBoundary(result.fanReactionResult);
  });

  it("does not add real fan formulas or business/result fields", () => {
    const result = runShowFanReactionSmokePipeline(
      createProductionEngineRegistry(),
      createSampleShowEngineInput(),
      createSampleEngineContext("show-fan-smoke-no-real-formula", 7)
    );

    assertForbiddenResultFieldsAbsent(result.showResult);
    assertForbiddenResultFieldsAbsent(result.showResult.hiddenState);
    assertForbiddenResultFieldsAbsent(result.fanReactionResult);
    assertForbiddenResultFieldsAbsent(result.fanReactionResult.hiddenState);
    assert.equal(Object.hasOwn(result.fanReactionResult, "fanScore"), false);
    assert.equal(Object.hasOwn(result.fanReactionResult, "sentimentShift"), false);
    assert.equal(Object.hasOwn(result.fanReactionResult, "backlash"), false);
    assert.equal(Object.hasOwn(result.fanReactionResult, "popularityChanges"), false);
    assert.equal(Object.hasOwn(result.fanReactionResult, "momentumConsequences"), false);
  });

  it("does not call Social Discourse Engine or return social output", () => {
    const registry = createEngineRegistry();
    const throwingSocialDiscourseEngine: SocialDiscourseSimulationEngine = {
      metadata: {
        ...socialDiscourseEngine.metadata,
        id: DEFAULT_SOCIAL_DISCOURSE_ENGINE_ID
      },
      run() {
        throw new Error("Social Discourse Engine should not run in Show -> Fan Reaction smoke.");
      }
    };

    registry.register(showEngine);
    registry.register(fanReactionEngine);
    registry.register(throwingSocialDiscourseEngine);

    const result = runShowFanReactionSmokePipeline(
      registry,
      createSampleShowEngineInput(),
      createSampleEngineContext("show-fan-smoke-no-social", 7),
      { debug: true }
    );

    assert.equal(Object.hasOwn(result, "socialDiscourseResult"), false);
    assert.equal(Object.hasOwn(result.fanReactionResult, "producedNarratives"), false);
    assert.equal(Object.hasOwn(result.fanReactionResult, "updatedNarrativeIds"), false);
  });

  it("keeps the show fan reaction smoke result deterministic for the same seed and input", () => {
    const input = createSampleShowEngineInput();
    const firstResult = runShowFanReactionSmokePipeline(
      createProductionEngineRegistry(),
      input,
      createSampleEngineContext("show-fan-smoke-deterministic", 7),
      { debug: true }
    );
    const secondResult = runShowFanReactionSmokePipeline(
      createProductionEngineRegistry(),
      input,
      createSampleEngineContext("show-fan-smoke-deterministic", 7),
      { debug: true }
    );

    assert.deepEqual(firstResult, secondResult);
  });

  it("creates structurally-ready and missing structural pipeline summaries directly", () => {
    const showResult = showEngine.run(
      createSampleShowEngineInput(),
      createSampleEngineContext("pipeline-summary-ready-show", 7)
    );
    const fanReactionResult = fanReactionEngine.run(
      {
        promotion: createSampleShowEngineInput().promotion!,
        fanSegments: createSampleShowEngineInput().bookedMatches[0].matchInput.fanSegments,
        relevantWrestlers: createSampleShowEngineInput().bookedMatches[0].matchInput.participants,
        relevantRivalries: [createSampleShowEngineInput().bookedMatches[0].matchInput.rivalry!],
        priorSocialNarratives: [],
        showInput: {
          showId: showResult.showId,
          handoff: {
            fanSocialHandoff: showResult.hiddenState.fanSocialHandoff,
            fanSocialHandoffValidation: showResult.hiddenState.fanSocialHandoffValidation
          }
        }
      },
      createSampleEngineContext("pipeline-summary-ready-fan", 7)
    );
    const fanSocialDiscourseHandoff = createFanSocialDiscourseHandoff(
      fanReactionResult.hiddenState.showOutputShell
    );
    const socialDiscourseResult = socialDiscourseEngine.run(
      {
        promotion: createSampleShowEngineInput().promotion!,
        relevantWrestlers: createSampleShowEngineInput().bookedMatches[0].matchInput.participants,
        relevantRivalries: [createSampleShowEngineInput().bookedMatches[0].matchInput.rivalry!],
        existingNarratives: [],
        matchResult: showResult.matchResults[0],
        fanReactionResult,
        fanReactionShowHandoff: fanSocialDiscourseHandoff
      },
      createSampleEngineContext("pipeline-summary-ready-social", 7)
    );

    assert.deepEqual(
      createEnginePipelineStructuralSummary({
        showResult,
        matchResult: showResult.matchResults[0],
        fanReactionResult,
        fanSocialDiscourseHandoff,
        socialDiscourseResult
      }),
      {
        status: "partial",
        summaryVersion: "0.2.0",
        ownership: "pipeline-structural-summary-only",
        showStage: expectedPipelineStage("structurally-ready", "available"),
        matchStage: expectedPipelineStage("structurally-ready", "available"),
        showMatchReadinessStage: expectedPipelineStage("limited", "limited"),
        fanReactionStage: expectedPipelineStage("structurally-ready", "available"),
        fanSocialHandoffStage: expectedPipelineStage("structurally-ready", "available"),
        socialDiscourseStage: expectedPipelineStage("structurally-ready", "available")
      }
    );
    assert.deepEqual(createEnginePipelineStructuralSummary({}), {
      status: "missing",
      summaryVersion: "0.2.0",
      ownership: "pipeline-structural-summary-only",
      showStage: expectedPipelineStage("missing", "missing"),
      matchStage: expectedPipelineStage("missing", "missing"),
      showMatchReadinessStage: expectedPipelineStage("missing", "missing"),
      fanReactionStage: expectedPipelineStage("missing", "missing"),
      fanSocialHandoffStage: expectedPipelineStage("missing", "missing"),
      socialDiscourseStage: expectedPipelineStage("missing", "missing")
    });
  });

  it("marks missing Show match readiness aggregation as missing in pipeline v0.2", () => {
    assert.deepEqual(
      createEnginePipelineStructuralSummary({}).showMatchReadinessStage,
      expectedPipelineStage("missing", "missing")
    );
  });

  it("reflects limited Show match readiness aggregation in pipeline v0.2", () => {
    const summary = createEnginePipelineStructuralSummary({
      showResult: createShowResultWithMatchReadiness("limited")
    });

    assert.equal(summary.summaryVersion, "0.2.0");
    assert.deepEqual(summary.showMatchReadinessStage, expectedPipelineStage("limited", "limited"));
  });

  it("reflects blocked Show match readiness aggregation in pipeline v0.2", () => {
    const summary = createEnginePipelineStructuralSummary({
      showResult: createShowResultWithMatchReadiness("blocked")
    });

    assert.equal(summary.status, "blocked");
    assert.deepEqual(summary.showMatchReadinessStage, expectedPipelineStage("blocked", "blocked"));
  });

  it("reflects partial Show match readiness aggregation in pipeline v0.2", () => {
    const summary = createEnginePipelineStructuralSummary({
      showResult: createShowResultWithMatchReadiness("partial")
    });

    assert.deepEqual(summary.showMatchReadinessStage, expectedPipelineStage("partial", "limited"));
  });

  it("reflects structurally-ready Show match readiness aggregation in pipeline v0.2", () => {
    const summary = createEnginePipelineStructuralSummary({
      showResult: createShowResultWithMatchReadiness("structurally-ready")
    });

    assert.deepEqual(
      summary.showMatchReadinessStage,
      expectedPipelineStage("structurally-ready", "available")
    );
  });
});

function expectedPipelineStage(
  readiness: "missing" | "limited" | "blocked" | "partial" | "structurally-ready",
  sourceAvailability: "missing" | "limited" | "blocked" | "available"
) {
  return {
    readiness,
    sourceAvailability
  };
}

function createShowResultWithMatchReadiness(
  overallMatchReadiness: ShowOverallMatchReadiness
): ShowEngineResult {
  const isReady = overallMatchReadiness === "structurally-ready";

  return {
    engineName: "show",
    showId: "show-pipeline-readiness-fixture",
    hiddenState: {
      showReadinessStatus: "ready",
      completedMatchEngineRuns: 1,
      failedMatchEngineRuns: 0,
      fanSocialOrchestrationSummary: {
        showFanSocialHandoff: {
          readiness: "structurally-ready",
          sourceAvailability: "available"
        }
      },
      matchReadinessAggregation: {
        totalMatches: 1,
        readyMatches: isReady ? 1 : 0,
        limitedMatches: overallMatchReadiness === "limited" ? 1 : 0,
        blockedMatches: overallMatchReadiness === "blocked" ? 1 : 0,
        unavailableMatches: overallMatchReadiness === "unavailable" ? 1 : 0,
        protectedFinishReadyMatches: isReady ? 1 : 0,
        overallMatchReadiness
      }
    },
    matchResults: [],
    signals: []
  } as unknown as ShowEngineResult;
}

function stages(result: MatchFanSocialSmokeResult) {
  return [result.matchResult, result.fanReactionResult, result.socialDiscourseResult] as const;
}

function hiddenAggregate(result: MatchFanSocialSmokeResult): unknown {
  return stages(result).map((stage) => stage.hiddenState);
}

function debugRollAggregate(result: MatchFanSocialSmokeResult): unknown {
  return stages(result).map((stage) => stage.debugTrace?.hiddenRolls);
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
}

function findTypeScriptFiles(relativeDirectories: readonly string[]): string[] {
  return relativeDirectories.flatMap((directory) => walk(directory));
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
