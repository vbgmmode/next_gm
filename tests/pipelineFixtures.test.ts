import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type {
  HiddenEngineState,
  SimulationEngineResult
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInputWithFinishIntent,
  createSampleMatchEngineInputWithLowTalentProfiles,
  createSampleMatchEngineInputWithPartialTalentProfiles,
  createSampleMatchEngineInputWithTalentProfiles,
  sampleBackstageState,
  sampleFanReactionEngineResult,
  sampleFinancialState,
  sampleMarketState,
  sampleMatchEngineResult,
  samplePipelineHandoff,
  samplePromotion,
  sampleRivalry,
  sampleShow,
  sampleSocialDiscourseEngineResult,
  sampleTalentProfiles,
  sampleWrestlers
} from "./fixtures/index.ts";
import {
  assertDebugTraceIsNonPlayerFacing,
  assertEngineResultRespectsOutputBoundary
} from "./helpers/engineOutputBoundaryAssertions.ts";

describe("pipeline fixtures", () => {
  it("imports realistic domain fixtures cleanly", () => {
    assert.equal(samplePromotion.marketState, sampleMarketState);
    assert.equal(samplePromotion.backstageState, sampleBackstageState);
    assert.equal(samplePromotion.financialState, sampleFinancialState);
    assert.equal(sampleShow.promotionId, samplePromotion.id);
    assert.equal(sampleRivalry.participantIds.length, 2);
    assert.equal(sampleWrestlers.length, 3);
  });

  it("creates deterministic seeded engine contexts", () => {
    const first = createSampleEngineContext("fixture-seed", 7);
    const second = createSampleEngineContext("fixture-seed", 7);

    assert.equal(first.week, second.week);
    assert.deepEqual(
      [first.random.next(), first.random.next(), first.random.integer(1, 10)],
      [second.random.next(), second.random.next(), second.random.integer(1, 10)]
    );
  });

  it("creates a sample match input with test-only talent profiles", () => {
    const input = createSampleMatchEngineInputWithTalentProfiles();
    const partialInput = createSampleMatchEngineInputWithPartialTalentProfiles();
    const lowInput = createSampleMatchEngineInputWithLowTalentProfiles();
    const finishIntentInput = createSampleMatchEngineInputWithFinishIntent({
      type: "dirty",
      protection: "disputed",
      controversy: "moderate"
    });

    assert.equal(sampleTalentProfiles.length, 3);
    assert.equal(input.participantTalentProfiles?.["wrestler-jade-valor"]?.wrestlerId, "wrestler-jade-valor");
    assert.equal(
      input.participantTalentProfiles?.["wrestler-marcus-crowe"]?.wrestlerId,
      "wrestler-marcus-crowe"
    );
    assert.equal(partialInput.participantTalentProfiles?.["wrestler-jade-valor"]?.wrestlerId, "wrestler-jade-valor");
    assert.equal(partialInput.participantTalentProfiles?.["wrestler-marcus-crowe"], undefined);
    assert.equal(lowInput.participantTalentProfiles?.["wrestler-jade-valor"]?.attributes.inRingSkill, 35);
    assert.equal(finishIntentInput.finishIntent?.type, "dirty");
  });

  it("chains sample contract results through the planned pipeline", () => {
    assert.equal(Object.hasOwn(samplePipelineHandoff.matchInput, "context"), false);
    assert.equal(Object.hasOwn(samplePipelineHandoff.fanReactionInput, "context"), false);
    assert.equal(Object.hasOwn(samplePipelineHandoff.socialDiscourseInput, "context"), false);
    assert.equal(samplePipelineHandoff.fanReactionInput.matchResult, samplePipelineHandoff.matchResult);
    assert.equal(
      samplePipelineHandoff.socialDiscourseInput.fanReactionResult,
      samplePipelineHandoff.fanReactionResult
    );
    assert.equal(
      samplePipelineHandoff.socialDiscourseInput.fanReactionShowHandoff?.sourceEngine,
      "fan-reaction"
    );
    assert.equal(
      samplePipelineHandoff.socialDiscourseInput.fanReactionShowHandoff?.playerFacing,
      false
    );
    assert.equal(
      samplePipelineHandoff.socialDiscourseInput.fanReactionShowHandoff?.showOutputReadiness.shellStatus,
      samplePipelineHandoff.fanReactionResult.hiddenState.showOutputShell.status
    );
    assert.deepEqual(samplePipelineHandoff.socialDiscourseInput.fanReactionShowHandoff?.showSignals, {
      crowdEnergyRead: "structurally-ready",
      bookingTrustRead: "structurally-ready",
      featuredTalentReceptionRead: "structurally-ready",
      showMomentumRead: "structurally-ready",
      confidenceRead: "structurally-ready"
    });
    assert.equal(
      samplePipelineHandoff.socialDiscourseInput.matchResult,
      samplePipelineHandoff.matchResult
    );
    assert.equal(samplePipelineHandoff.socialDiscourseResult.engineName, "social-discourse");
  });

  it("keeps hidden state separate from player-facing signals across fixture results", () => {
    const results: readonly SimulationEngineResult[] = [
      sampleMatchEngineResult,
      sampleFanReactionEngineResult,
      sampleSocialDiscourseEngineResult
    ];

    for (const result of results) {
      assert.ok(Object.keys(result.hiddenState).length > 0);
      assert.ok(result.signals.length > 0);
      assert.notEqual(result.hiddenState, result.signals);
      assertEngineResultRespectsOutputBoundary(result);
    }
  });

  it("keeps debug traces optional and explicitly non-player-facing", () => {
    assert.equal(sampleFanReactionEngineResult.debugTrace, undefined);
    assert.equal(sampleSocialDiscourseEngineResult.debugTrace, undefined);
    assertDebugTraceIsNonPlayerFacing(sampleMatchEngineResult.debugTrace);
  });

  it("documents loose HiddenEngineState scaffolding for future tightening", () => {
    const hiddenStates: readonly HiddenEngineState[] = [
      sampleMatchEngineResult.hiddenState,
      sampleFanReactionEngineResult.hiddenState,
      sampleSocialDiscourseEngineResult.hiddenState
    ];

    assert.ok("performanceQuality" in hiddenStates[0]);
    assert.ok("pushAcceptance" in hiddenStates[1]);
    assert.ok("discourseSpread" in hiddenStates[2]);
    assert.ok(
      hiddenStates.every((hiddenState) => Object.values(hiddenState).some((value) => typeof value === "number"))
    );
  });
});
