import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createEngineExecutionTrace,
  createSimulationEngineContext,
  matchEngine,
  MATCH_ENGINE_V0_ID
} from "../src/game/engines/index.ts";
import { RandomService } from "../src/game/simulation/randomService.ts";
import { createSimulationContext } from "../src/game/simulation/simulationContext.ts";
import { createSampleMatchEngineInput } from "./fixtures/index.ts";

describe("EngineExecutionTrace", () => {
  it("creates deterministic traces from the same inputs", () => {
    const simulationContext = createSimulationContext({
      seed: "trace-seed",
      seedLabel: "Trace Seed",
      replay: {
        replayId: "replay-trace",
        rulesetVersion: "ruleset-test",
        sequenceLabel: "match"
      }
    });
    const first = createEngineExecutionTrace({
      traceLabel: "match-shell",
      engineId: MATCH_ENGINE_V0_ID,
      engineVersion: "0.9.0",
      simulationContext,
      stages: [
        "accepted-input",
        { marker: "stage-random", label: "prepared-random-access" }
      ],
      notes: ["diagnostics only"]
    });
    const second = createEngineExecutionTrace({
      traceLabel: "match-shell",
      engineId: MATCH_ENGINE_V0_ID,
      engineVersion: "0.9.0",
      simulationContext,
      stages: [
        "accepted-input",
        { marker: "stage-random", label: "prepared-random-access" }
      ],
      notes: ["diagnostics only"]
    });

    assert.deepEqual(first, second);
    assert.equal(first.traceId, "match-engine-v0:0.9.0:match-shell");
    assert.deepEqual(first.stages, [
      { marker: "stage-1", label: "accepted-input" },
      { marker: "stage-random", label: "prepared-random-access" }
    ]);
  });

  it("does not let trace metadata affect RandomService output", () => {
    const firstRandom = new RandomService("trace-random");
    const secondRandom = new RandomService("trace-random");

    createEngineExecutionTrace({
      traceLabel: "trace-a",
      engineId: MATCH_ENGINE_V0_ID,
      engineVersion: "0.9.0",
      seedReference: {
        seed: "trace-random",
        seedLabel: "Diagnostics A",
        replayId: "replay-a"
      },
      stages: ["diagnostics-a"],
      notes: ["note a"]
    });
    createEngineExecutionTrace({
      traceLabel: "trace-b",
      engineId: MATCH_ENGINE_V0_ID,
      engineVersion: "0.9.0",
      seedReference: {
        seed: "trace-random",
        seedLabel: "Diagnostics B",
        replayId: "replay-b"
      },
      stages: ["diagnostics-b"],
      notes: ["note b"]
    });

    assert.deepEqual(
      [firstRandom.next(), firstRandom.next(), firstRandom.next()],
      [secondRandom.next(), secondRandom.next(), secondRandom.next()]
    );
  });

  it("marks trace status as diagnostics-only and non-gameplay", () => {
    const trace = createEngineExecutionTrace({
      traceLabel: "non-gameplay-status",
      engineId: MATCH_ENGINE_V0_ID,
      engineVersion: "0.9.0",
      stages: ["prepared-trace"]
    });

    assert.equal(trace.status, "diagnostics-only");
    assert.equal(trace.gameplayAffecting, false);
    assert.equal(trace.playerFacing, false);
  });

  it("keeps existing engine behavior unchanged when traces are created separately", () => {
    const input = createSampleMatchEngineInput();
    const firstContext = createSimulationEngineContext({
      seed: "trace-engine-behavior",
      week: 7,
      debug: false
    });
    const secondContext = createSimulationEngineContext({
      seed: "trace-engine-behavior",
      week: 7,
      debug: false
    });

    const firstResult = matchEngine.run(input, firstContext);
    createEngineExecutionTrace({
      traceLabel: "match-out-of-band-trace",
      engineId: matchEngine.metadata.id,
      engineVersion: matchEngine.metadata.version,
      simulationContext: secondContext.simulation,
      stages: ["created-out-of-band"],
      notes: ["Not passed to the engine."]
    });
    const secondResult = matchEngine.run(input, secondContext);

    assert.deepEqual(secondResult, firstResult);
  });
});
