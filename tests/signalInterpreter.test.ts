import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { interpretSignal, interpretSignals } from "../src/game/simulation/signalInterpreter.ts";

describe("signalInterpreter", () => {
  it("maps fatigue values to physical reads without exposing numbers", () => {
    assert.equal(interpretSignal("fatigue", 10).label, "fresh");
    assert.equal(interpretSignal("fatigue", 35).label, "showing wear");
    assert.equal(interpretSignal("fatigue", 60).label, "visibly tired");
    assert.equal(interpretSignal("fatigue", 95).label, "running on fumes");
  });

  it("maps momentum values to crowd reads", () => {
    assert.equal(interpretSignal("momentum", 15).label, "cold");
    assert.equal(interpretSignal("momentum", 45).label, "steady");
    assert.equal(interpretSignal("momentum", 70).label, "heating up");
    assert.equal(interpretSignal("momentum", 90).label, "surging");
  });

  it("maps discourse values to social reads", () => {
    assert.equal(interpretSignal("discourse", 5).label, "quiet");
    assert.equal(interpretSignal("discourse", 40).label, "noticeable chatter");
    assert.equal(interpretSignal("discourse", 65).label, "loud conversation");
    assert.equal(interpretSignal("discourse", 100).label, "dominating discourse");
  });

  it("builds multiple player-facing signal summaries", () => {
    const signals = interpretSignals({
      fatigue: 82,
      momentum: 68,
      financial: 74
    });

    assert.deepEqual(signals.fatigue, {
      label: "running on fumes",
      confidence: "medium"
    });
    assert.deepEqual(signals.momentum, {
      label: "heating up",
      confidence: "medium"
    });
    assert.deepEqual(signals.financial, {
      label: "tightening",
      confidence: "medium"
    });
  });
});
