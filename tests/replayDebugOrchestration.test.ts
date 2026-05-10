import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createEngineExecutionTrace,
  createReplayDebugOrchestration,
  createSimulationEngineContext,
  matchEngine,
  MATCH_ENGINE_V0_ID
} from "../src/game/engines/index.ts";
import { RandomService } from "../src/game/simulation/randomService.ts";
import { createSimulationContext } from "../src/game/simulation/simulationContext.ts";
import { createSampleMatchEngineInput } from "./fixtures/index.ts";

describe("ReplayDebugOrchestration", () => {
  it("creates deterministic orchestration summaries from the same seed and context", () => {
    const first = createReplayDebugFixture("replay-debug-seed");
    const second = createReplayDebugFixture("replay-debug-seed");

    assert.deepEqual(first.orchestration, second.orchestration);
    assert.deepEqual(first.orchestration.readiness, {
      simulationContextPresent: true,
      engineContextPresent: true,
      traceCount: 1,
      readyForReplayDebug: true,
      missing: []
    });
    assert.equal(first.orchestration.seedReference?.seed, "replay-debug-seed");
    assert.equal(first.orchestration.engineContextReference?.week, 7);
  });

  it("keeps trace grouping diagnostics-only", () => {
    const { orchestration, trace } = createReplayDebugFixture("trace-grouping");

    assert.deepEqual(orchestration.traces, [trace]);
    assert.equal(orchestration.status, "diagnostics-only");
    assert.equal(orchestration.gameplayAffecting, false);
    assert.equal(orchestration.playerFacing, false);
    assert.equal(orchestration.traces[0].gameplayAffecting, false);
  });

  it("does not let orchestration metadata affect RandomService output", () => {
    const firstRandom = new RandomService("orchestration-random");
    const secondRandom = new RandomService("orchestration-random");

    createReplayDebugFixture("orchestration-random", "debug-a");
    createReplayDebugFixture("orchestration-random", "debug-b");

    assert.deepEqual(
      [firstRandom.next(), firstRandom.next(), firstRandom.next()],
      [secondRandom.next(), secondRandom.next(), secondRandom.next()]
    );
  });

  it("keeps existing engine behavior unchanged when orchestration is created separately", () => {
    const input = createSampleMatchEngineInput();
    const firstContext = createSimulationEngineContext({
      seed: "orchestration-engine-behavior",
      week: 7,
      debug: false
    });
    const secondContext = createSimulationEngineContext({
      seed: "orchestration-engine-behavior",
      week: 7,
      debug: false
    });

    const firstResult = matchEngine.run(input, firstContext);
    createReplayDebugOrchestration({
      orchestrationLabel: "out-of-band",
      simulationContext: secondContext.simulation,
      engineContext: secondContext,
      traces: [
        createEngineExecutionTrace({
          traceLabel: "out-of-band-trace",
          engineId: matchEngine.metadata.id,
          engineVersion: matchEngine.metadata.version,
          simulationContext: secondContext.simulation,
          stages: ["created-out-of-band"]
        })
      ]
    });
    const secondResult = matchEngine.run(input, secondContext);

    assert.deepEqual(secondResult, firstResult);
  });

  it("summarizes missing replay/debug pieces without implying gameplay state", () => {
    const orchestration = createReplayDebugOrchestration({
      orchestrationLabel: "empty-shell"
    });

    assert.deepEqual(orchestration.readiness, {
      simulationContextPresent: false,
      engineContextPresent: false,
      traceCount: 0,
      readyForReplayDebug: false,
      missing: ["simulation-context", "engine-context", "engine-execution-trace"]
    });
    assert.equal(orchestration.status, "diagnostics-only");
    assert.equal(orchestration.gameplayAffecting, false);
  });
});

function createReplayDebugFixture(seed: string, orchestrationLabel = "debug-flow") {
  const simulationContext = createSimulationContext({
    seed,
    seedLabel: seed,
    replay: {
      replayId: "replay-1",
      rulesetVersion: "ruleset-test",
      sequenceLabel: "match"
    }
  });
  const engineContext = createSimulationEngineContext({
    seed,
    seedLabel: seed,
    week: 7,
    replay: simulationContext.replay
  });
  const trace = createEngineExecutionTrace({
    traceLabel: "match-trace",
    engineId: MATCH_ENGINE_V0_ID,
    engineVersion: "0.9.0",
    simulationContext,
    stages: ["accepted-input", "prepared-debug-shell"],
    notes: ["Diagnostics only."]
  });
  const orchestration = createReplayDebugOrchestration({
    orchestrationLabel,
    simulationContext,
    engineContext,
    traces: [trace]
  });

  return { orchestration, trace };
}
