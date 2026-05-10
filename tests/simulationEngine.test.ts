import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type {
  SimulationEngine,
  SimulationEngineContext,
  SimulationEngineResult
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleFanReactionEngineInput,
  createSampleMatchEngineInput,
  createSampleSocialDiscourseEngineInput,
  fakeFanReactionEngine,
  fakeMatchEngine,
  fakeSocialDiscourseEngine
} from "./fixtures/index.ts";
import {
  assertDebugTraceIsNonPlayerFacing,
  assertEngineResultRespectsOutputBoundary
} from "./helpers/engineOutputBoundaryAssertions.ts";

describe("SimulationEngine interface", () => {
  it("allows a fake engine to be defined with metadata and run()", () => {
    const engine: SimulationEngine<ReturnType<typeof createSampleMatchEngineInput>, SimulationEngineResult> =
      fakeMatchEngine;

    assert.equal(engine.metadata.id, "fake-match-engine");
    assert.equal(engine.metadata.name, "Fake Match Engine");
    assert.equal(typeof engine.run, "function");
  });

  it("invokes fake engines through run(input, context)", () => {
    const context = createSampleEngineContext("callable-engine-test", 7);
    const matchInput = createSampleMatchEngineInput();

    const result = fakeMatchEngine.run(matchInput, context);

    assert.equal(result.engineName, "match");
    assert.equal(result.matchId, matchInput.match.id);
    assert.deepEqual(
      result.changedWrestlerIds,
      matchInput.participants.map((wrestler) => wrestler.id)
    );
    assert.equal(result.debugTrace, undefined);
  });

  it("keeps engine input objects free of embedded runtime context", () => {
    const matchInput = createSampleMatchEngineInput();
    const fanInput = createSampleFanReactionEngineInput();
    const socialInput = createSampleSocialDiscourseEngineInput();

    assert.equal(Object.hasOwn(matchInput, "context"), false);
    assert.equal(Object.hasOwn(fanInput, "context"), false);
    assert.equal(Object.hasOwn(socialInput, "context"), false);
  });

  it("uses context.random deterministically when fake engines touch randomness", () => {
    const firstContext = createSampleEngineContext("deterministic-fake-engine", 7);
    const secondContext = createSampleEngineContext("deterministic-fake-engine", 7);
    const matchInput = createSampleMatchEngineInput();

    const firstResult = fakeMatchEngine.run(matchInput, firstContext, { debug: true });
    const secondResult = fakeMatchEngine.run(matchInput, secondContext, { debug: true });

    assert.equal(firstResult.hiddenState.fixtureRoll, secondResult.hiddenState.fixtureRoll);
    assert.deepEqual(firstResult.debugTrace?.hiddenRolls, secondResult.debugTrace?.hiddenRolls);
  });

  it("uses only the second run argument context when fake engines touch randomness", () => {
    const matchInput = {
      ...createSampleMatchEngineInput(),
      context: createSampleEngineContext("extra-input-context", 99)
    } as ReturnType<typeof createSampleMatchEngineInput>;

    const firstResult = fakeMatchEngine.run(
      matchInput,
      createSampleEngineContext("canonical-fake-context", 7),
      { debug: true }
    );
    const secondResult = fakeMatchEngine.run(
      createSampleMatchEngineInput(),
      createSampleEngineContext("canonical-fake-context", 7),
      { debug: true }
    );

    assert.deepEqual(firstResult, secondResult);
  });

  it("runs a callable no-op pipeline through match, fan reaction, and social discourse engines", () => {
    const context = createSampleEngineContext("callable-pipeline", 7);
    const matchInput = createSampleMatchEngineInput();
    const matchResult = fakeMatchEngine.run(matchInput, context, { debug: true });

    const fanInput = createSampleFanReactionEngineInput(matchResult);
    const fanResult = fakeFanReactionEngine.run(fanInput, context, { debug: true });

    const socialInput = createSampleSocialDiscourseEngineInput(matchResult, fanResult);
    const socialResult = fakeSocialDiscourseEngine.run(socialInput, context, { debug: true });

    assert.equal(fanInput.matchResult, matchResult);
    assert.equal(socialInput.matchResult, matchResult);
    assert.equal(socialInput.fanReactionResult, fanResult);
    assert.equal(socialResult.engineName, "social-discourse");
    assert.deepEqual(socialResult.updatedNarrativeIds, socialInput.existingNarratives.map((narrative) => narrative.id));
  });

  it("keeps fake engine hidden state separate from player-facing signals", () => {
    const context = createSampleEngineContext("boundary-fake-engine", 7);
    const matchResult = fakeMatchEngine.run(createSampleMatchEngineInput(), context, { debug: true });
    const fanResult = fakeFanReactionEngine.run(createSampleFanReactionEngineInput(matchResult), context);
    const socialResult = fakeSocialDiscourseEngine.run(
      createSampleSocialDiscourseEngineInput(matchResult, fanResult),
      context
    );

    for (const result of [matchResult, fanResult, socialResult]) {
      assert.ok(Object.keys(result.hiddenState).length > 0);
      assert.ok(result.signals.length > 0);
      assertEngineResultRespectsOutputBoundary(result);
    }
  });

  it("keeps debug traces optional and non-player-facing", () => {
    const context = createSampleEngineContext("debug-trace-fake-engine", 7);
    const matchInput = createSampleMatchEngineInput();

    const withoutDebug = fakeMatchEngine.run(matchInput, context);
    const withDebug = fakeMatchEngine.run(matchInput, createSampleEngineContext("debug-trace-fake-engine", 7), {
      debug: true
    });

    assert.equal(withoutDebug.debugTrace, undefined);
    assertDebugTraceIsNonPlayerFacing(withDebug.debugTrace);
  });
});
