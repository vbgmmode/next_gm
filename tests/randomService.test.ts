import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { RandomService } from "../src/game/simulation/index.ts";

describe("RandomService", () => {
  it("returns repeatable next() values for the same seed", () => {
    const first = new RandomService("week-1-show-1");
    const second = new RandomService("week-1-show-1");

    const firstSequence = [first.next(), first.next(), first.next(), first.next()];
    const secondSequence = [second.next(), second.next(), second.next(), second.next()];

    assert.deepEqual(firstSequence, secondSequence);
  });

  it("returns different deterministic next() sequences for different seeds", () => {
    const first = new RandomService("week-1-show-1");
    const second = new RandomService("week-1-show-2");
    const firstReplay = new RandomService("week-1-show-1");
    const secondReplay = new RandomService("week-1-show-2");

    const firstSequence = [first.next(), first.next(), first.next(), first.next()];
    const secondSequence = [second.next(), second.next(), second.next(), second.next()];
    const firstReplaySequence = [
      firstReplay.next(),
      firstReplay.next(),
      firstReplay.next(),
      firstReplay.next()
    ];
    const secondReplaySequence = [
      secondReplay.next(),
      secondReplay.next(),
      secondReplay.next(),
      secondReplay.next()
    ];

    assert.deepEqual(firstSequence, firstReplaySequence);
    assert.deepEqual(secondSequence, secondReplaySequence);
    assert.notDeepEqual(firstSequence, secondSequence);
  });

  it("makes chance() deterministic with the same seed", () => {
    const first = new RandomService("push-risk");
    const second = new RandomService("push-risk");

    const firstResults = [
      first.chance(0.35),
      first.chance(0.35),
      first.chance(0.35),
      first.chance(0.35)
    ];
    const secondResults = [
      second.chance(0.35),
      second.chance(0.35),
      second.chance(0.35),
      second.chance(0.35)
    ];

    assert.deepEqual(firstResults, secondResults);
  });

  it("returns deterministic weighted choices with the same seed", () => {
    const choices = [
      { item: "backfire", weight: 2 },
      { item: "polarize", weight: 3 },
      { item: "connect", weight: 5 }
    ] as const;
    const first = new RandomService("forced-push");
    const second = new RandomService("forced-push");

    const firstResults = [
      first.weightedChoice(choices),
      first.weightedChoice(choices),
      first.weightedChoice(choices)
    ];
    const secondResults = [
      second.weightedChoice(choices),
      second.weightedChoice(choices),
      second.weightedChoice(choices)
    ];

    assert.deepEqual(firstResults, secondResults);
  });
});
