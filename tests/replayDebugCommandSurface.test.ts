import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createEngineExecutionTrace,
  createReplayDebugCommandSummary,
  createReplayDebugOrchestration,
  createSimulationEngineContext,
  matchEngine,
  MATCH_ENGINE_V0_ID
} from "../src/game/engines/index.ts";
import { RandomService } from "../src/game/simulation/randomService.ts";
import { createSimulationContext } from "../src/game/simulation/simulationContext.ts";
import { createSampleMatchEngineInput } from "./fixtures/index.ts";

describe("ReplayDebugCommandSurface", () => {
  it("creates deterministic command summaries from the same inputs", () => {
    const first = createReplayDebugCommandSummary({
      intent: "summarize-replay-readiness",
      commandLabel: "readiness",
      orchestration: createCommandSurfaceFixture("command-deterministic").orchestration
    });
    const second = createReplayDebugCommandSummary({
      intent: "summarize-replay-readiness",
      commandLabel: "readiness",
      orchestration: createCommandSurfaceFixture("command-deterministic").orchestration
    });

    assert.deepEqual(first, second);
    assert.equal(first.readiness?.readyForReplayDebug, true);
    assert.equal(first.status, "diagnostics-only");
  });

  it("lists trace markers without executing engines or producing player-facing output", () => {
    const { orchestration } = createCommandSurfaceFixture("trace-markers");
    const summary = createReplayDebugCommandSummary({
      intent: "list-trace-markers",
      commandLabel: "markers",
      orchestration
    });

    assert.deepEqual(summary.traceMarkers, [
      {
        traceId: "match-engine-v0:0.9.0:match-command-trace",
        traceLabel: "match-command-trace",
        markers: ["stage-1", "stage-run"]
      }
    ]);
    assert.equal(summary.playerFacing, false);
    assert.equal(summary.gameplayAffecting, false);
  });

  it("validates debug context as diagnostics-only metadata", () => {
    const validSummary = createReplayDebugCommandSummary({
      intent: "validate-debug-context",
      orchestration: createCommandSurfaceFixture("valid-debug").orchestration
    });
    const missingSummary = createReplayDebugCommandSummary({
      intent: "validate-debug-context"
    });

    assert.deepEqual(validSummary.validation, {
      valid: true,
      issues: []
    });
    assert.deepEqual(missingSummary.validation, {
      valid: false,
      issues: ["missing-orchestration"]
    });
    assert.equal(validSummary.status, "diagnostics-only");
    assert.equal(validSummary.playerFacing, false);
  });

  it("does not let command summaries affect RandomService output", () => {
    const firstRandom = new RandomService("command-random");
    const secondRandom = new RandomService("command-random");

    createReplayDebugCommandSummary({
      intent: "summarize-replay-readiness",
      commandLabel: "summary-a",
      orchestration: createCommandSurfaceFixture("command-random").orchestration
    });
    createReplayDebugCommandSummary({
      intent: "list-trace-markers",
      commandLabel: "summary-b",
      orchestration: createCommandSurfaceFixture("command-random").orchestration
    });

    assert.deepEqual(
      [firstRandom.next(), firstRandom.next(), firstRandom.next()],
      [secondRandom.next(), secondRandom.next(), secondRandom.next()]
    );
  });

  it("keeps existing engine behavior unchanged when command summaries are created separately", () => {
    const input = createSampleMatchEngineInput();
    const firstContext = createSimulationEngineContext({
      seed: "command-engine-behavior",
      week: 7,
      debug: false
    });
    const secondContext = createSimulationEngineContext({
      seed: "command-engine-behavior",
      week: 7,
      debug: false
    });

    const firstResult = matchEngine.run(input, firstContext);
    createReplayDebugCommandSummary({
      intent: "validate-debug-context",
      orchestration: createCommandSurfaceFixture("command-engine-behavior").orchestration
    });
    const secondResult = matchEngine.run(input, secondContext);

    assert.deepEqual(secondResult, firstResult);
  });
});

function createCommandSurfaceFixture(seed: string) {
  const simulationContext = createSimulationContext({
    seed,
    seedLabel: seed,
    replay: {
      replayId: "replay-command",
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
    traceLabel: "match-command-trace",
    engineId: MATCH_ENGINE_V0_ID,
    engineVersion: "0.9.0",
    simulationContext,
    stages: [
      "accepted-debug-command",
      { marker: "stage-run", label: "reserved-for-future-debug-runner" }
    ],
    notes: ["Command surface must not execute engines."]
  });
  const orchestration = createReplayDebugOrchestration({
    orchestrationLabel: "command-surface",
    simulationContext,
    engineContext,
    traces: [trace]
  });

  return { orchestration, trace };
}
