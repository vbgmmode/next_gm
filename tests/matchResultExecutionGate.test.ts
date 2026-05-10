import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createMatchResultExecutionGate,
  type MatchResultExecutionGate,
  type MatchResultShell,
  type MatchResultShellStatus
} from "../src/game/engines/index.ts";

describe("Match Result Execution Gate", () => {
  it("imports cleanly and returns a hidden MatchResultExecutionGate", () => {
    const gate: MatchResultExecutionGate = createMatchResultExecutionGate(createShell("pending"));

    assert.equal(gate.status, "pending");
    assert.equal(gate.requiredShellStatus, "ready_for_execution");
    assert.equal(gate.canExecuteResult, false);
  });

  it("opens only when the result shell is ready for execution", () => {
    const gate = createMatchResultExecutionGate(createShell("ready_for_execution"));

    assert.equal(gate.status, "open");
    assert.equal(gate.severity, "none");
    assert.deepEqual(gate.reasons, ["result-shell-ready"]);
    assert.equal(gate.observedShellStatus, "ready_for_execution");
    assert.equal(gate.canExecuteResult, true);
  });

  it("blocks when the result shell is blocked", () => {
    const gate = createMatchResultExecutionGate(createShell("blocked"));

    assert.equal(gate.status, "blocked");
    assert.equal(gate.severity, "high");
    assert.deepEqual(gate.reasons, ["result-shell-blocked"]);
    assert.equal(gate.observedShellStatus, "blocked");
    assert.equal(gate.canExecuteResult, false);
  });

  it("remains pending when the result shell is pending", () => {
    const gate = createMatchResultExecutionGate(createShell("pending"));

    assert.equal(gate.status, "pending");
    assert.equal(gate.severity, "moderate");
    assert.deepEqual(gate.reasons, ["result-shell-pending"]);
    assert.equal(gate.observedShellStatus, "pending");
    assert.equal(gate.canExecuteResult, false);
  });

  it("remains closed when the result shell is unavailable", () => {
    const gate = createMatchResultExecutionGate(createShell("unavailable"));

    assert.equal(gate.status, "closed");
    assert.equal(gate.severity, "high");
    assert.deepEqual(gate.reasons, ["result-shell-unavailable"]);
    assert.equal(gate.observedShellStatus, "unavailable");
    assert.equal(gate.canExecuteResult, false);
  });

  it("does not include result payload fields", () => {
    const gate = createMatchResultExecutionGate(createShell("ready_for_execution"));

    assert.equal(Object.hasOwn(gate, "winnerId"), false);
    assert.equal(Object.hasOwn(gate, "loserId"), false);
    assert.equal(Object.hasOwn(gate, "rating"), false);
    assert.equal(Object.hasOwn(gate, "finishResult"), false);
    assert.equal(Object.hasOwn(gate, "consequences"), false);
  });
});

function createShell(status: MatchResultShellStatus): MatchResultShell {
  return {
    status,
    readiness: status === "ready_for_execution" ? "high" : "moderate",
    confidence: status === "unavailable" ? "unknown" : "moderate",
    reasons: [],
    hasWinner: false,
    hasFinish: false,
    hasRating: false,
    hasConsequences: false
  };
}
