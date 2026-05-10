import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createSimulationContext } from "../src/game/simulation/index.ts";

describe("SimulationContext", () => {
  it("creates deterministic seeded random access for the same seed", () => {
    const first = createSimulationContext({
      seed: "week-7-show-context",
      replay: { replayId: "replay-a", sequenceLabel: "show" }
    });
    const second = createSimulationContext({
      seed: "week-7-show-context",
      replay: { replayId: "replay-a", sequenceLabel: "show" }
    });

    const firstSequence = [first.random.next(), first.random.next(), first.random.next()];
    const secondSequence = [second.random.next(), second.random.next(), second.random.next()];
    const firstFactorySequence = [
      first.createRandomService().next(),
      first.createRandomService("alternate-stream").next()
    ];
    const secondFactorySequence = [
      second.createRandomService().next(),
      second.createRandomService("alternate-stream").next()
    ];

    assert.equal(first.seedLabel, second.seedLabel);
    assert.deepEqual(firstSequence, secondSequence);
    assert.deepEqual(firstFactorySequence, secondFactorySequence);
  });

  it("produces different RandomService sequences for different seeds", () => {
    const first = createSimulationContext({ seed: "week-7-show-context" });
    const second = createSimulationContext({ seed: "week-8-show-context" });

    const firstSequence = [first.random.next(), first.random.next(), first.random.next()];
    const secondSequence = [second.random.next(), second.random.next(), second.random.next()];

    assert.notDeepEqual(firstSequence, secondSequence);
  });

  it("keeps diagnostics metadata from affecting deterministic random access", () => {
    const first = createSimulationContext({
      seed: "diagnostics-only",
      diagnostics: {
        caller: "test-a",
        debugEnabled: true,
        runIndex: 1
      }
    });
    const second = createSimulationContext({
      seed: "diagnostics-only",
      diagnostics: {
        caller: "test-b",
        debugEnabled: false,
        runIndex: 99
      }
    });

    const firstSequence = [first.random.next(), first.random.next(), first.random.next()];
    const secondSequence = [second.random.next(), second.random.next(), second.random.next()];

    assert.deepEqual(firstSequence, secondSequence);
    assert.deepEqual(first.diagnostics, {
      caller: "test-a",
      debugEnabled: true,
      runIndex: 1
    });
    assert.deepEqual(second.diagnostics, {
      caller: "test-b",
      debugEnabled: false,
      runIndex: 99
    });
  });
});
