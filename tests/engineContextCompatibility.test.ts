import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createSimulationEngineContext,
  createSimulationEngineContextFromSimulationContext,
  matchEngine
} from "../src/game/engines/index.ts";
import { RandomService } from "../src/game/simulation/randomService.ts";
import { createSimulationContext } from "../src/game/simulation/simulationContext.ts";
import { createSampleMatchEngineInput } from "./fixtures/index.ts";

describe("SimulationEngineContext compatibility", () => {
  it("preserves seed identity from the shared SimulationContext", () => {
    const simulationContext = createSimulationContext({
      seed: "compat-seed",
      seedLabel: "Week 7 compatibility seed"
    });
    const engineContext = createSimulationEngineContextFromSimulationContext(simulationContext, {
      week: 7,
      debug: false
    });

    assert.equal(engineContext.seed, simulationContext.seed);
    assert.equal(engineContext.simulation, simulationContext);
    assert.equal(engineContext.simulation?.seedLabel, "Week 7 compatibility seed");
    assert.equal(engineContext.week, 7);
  });

  it("keeps RandomService sequences deterministic through the shared context", () => {
    const first = createSimulationEngineContext({ seed: "compat-random", week: 7 });
    const second = createSimulationEngineContext({ seed: "compat-random", week: 7 });

    const firstSequence = [first.random.next(), first.random.next(), first.random.next()];
    const secondSequence = [second.random.next(), second.random.next(), second.random.next()];
    const firstSharedSequence = [
      first.simulation?.createRandomService().next(),
      first.simulation?.createRandomService("compat-alt").next()
    ];
    const secondSharedSequence = [
      second.simulation?.createRandomService().next(),
      second.simulation?.createRandomService("compat-alt").next()
    ];

    assert.deepEqual(firstSequence, secondSequence);
    assert.deepEqual(firstSharedSequence, secondSharedSequence);
  });

  it("keeps diagnostics and replay metadata as non-gameplay infrastructure", () => {
    const input = createSampleMatchEngineInput();
    const firstContext = createSimulationEngineContext({
      seed: "metadata-non-gameplay",
      week: 7,
      replay: {
        replayId: "replay-a",
        rulesetVersion: "ruleset-test-a",
        sequenceLabel: "match"
      },
      diagnostics: {
        caller: "test-a",
        trace: true
      }
    });
    const secondContext = createSimulationEngineContext({
      seed: "metadata-non-gameplay",
      week: 7,
      replay: {
        replayId: "replay-b",
        rulesetVersion: "ruleset-test-b",
        sequenceLabel: "show"
      },
      diagnostics: {
        caller: "test-b",
        trace: false
      }
    });

    const firstResult = matchEngine.run(input, firstContext);
    const secondResult = matchEngine.run(input, secondContext);

    assert.deepEqual(firstResult, secondResult);
    assert.deepEqual(firstContext.simulation?.replay, {
      replayId: "replay-a",
      rulesetVersion: "ruleset-test-a",
      sequenceLabel: "match"
    });
    assert.deepEqual(secondContext.simulation?.diagnostics, {
      caller: "test-b",
      trace: false
    });
  });

  it("preserves existing engine behavior against the legacy context shape", () => {
    const input = createSampleMatchEngineInput();
    const legacyContext = {
      random: new RandomService("legacy-compatible"),
      seed: "legacy-compatible",
      week: 7,
      debug: false
    };
    const sharedContext = createSimulationEngineContext({
      seed: "legacy-compatible",
      week: 7,
      debug: false
    });

    const legacyResult = matchEngine.run(input, legacyContext);
    const sharedResult = matchEngine.run(input, sharedContext);

    assert.deepEqual(sharedResult, legacyResult);
  });
});
