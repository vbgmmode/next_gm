import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import {
  createShowEngine,
  matchEngine,
  showEngine,
  validateShowFanSocialHandoff,
  type MatchSimulationEngine,
  type ShowFanSocialHandoff
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleShowEngineInput,
  createSampleShowEngineInputWithoutMatches
} from "./fixtures/index.ts";

describe("Show Fan/Social Handoff Validation", () => {
  it("adds a hidden validation field to show execution", () => {
    const result = showEngine.run(
      createSampleShowEngineInput(),
      createSampleEngineContext("show-handoff-validation-field", 7)
    );

    assert.equal(result.hiddenState.fanSocialHandoffValidation.status, "ready");
    assert.equal(result.hiddenState.fanSocialHandoffValidation.confidence, "strong");
    assert.equal(result.hiddenState.fanSocialHandoffValidation.expectedMatchCount, 1);
    assert.equal(result.hiddenState.fanSocialHandoffValidation.readyForFanReactionOrchestration, true);
    assert.equal(
      result.hiddenState.fanSocialHandoffValidation.readyForSocialDiscourseOrchestration,
      true
    );
  });

  it("validates zero booked matches safely", () => {
    const input = createSampleShowEngineInputWithoutMatches();
    const result = showEngine.run(input, createSampleEngineContext("show-handoff-validation-empty", 7));
    const validation = result.hiddenState.fanSocialHandoffValidation;

    assert.equal(validation.status, "empty");
    assert.equal(validation.confidence, "unknown");
    assert.equal(validation.expectedMatchCount, 0);
    assert.equal(validation.handoffMatchCount, 0);
    assert.equal(validation.orderedMatchSummaryCount, 0);
    assert.deepEqual(validation.issues, []);
    assert.equal(validation.readyForFanReactionOrchestration, false);
    assert.equal(validation.readyForSocialDiscourseOrchestration, false);
  });

  it("validates a complete handoff as ready", () => {
    const input = createSampleShowEngineInput();
    const result = showEngine.run(input, createSampleEngineContext("show-handoff-validation-ready", 7));
    const validation = validateShowFanSocialHandoff({
      showInput: input,
      fanSocialHandoff: result.hiddenState.fanSocialHandoff
    });

    assert.equal(validation.status, "ready");
    assert.equal(validation.severity, "low");
    assert.equal(validation.confidence, "strong");
    assert.deepEqual(validation.issues, []);
  });

  it("validates incomplete handoffs as partial or invalid without throwing", () => {
    const input = createSampleShowEngineInput();
    const result = showEngine.run(input, createSampleEngineContext("show-handoff-validation-incomplete", 7));
    const partialHandoff: ShowFanSocialHandoff = {
      ...result.hiddenState.fanSocialHandoff,
      orderedMatchSummaries: [
        {
          ...result.hiddenState.fanSocialHandoff.orderedMatchSummaries[0],
          matchId: "",
          resultGateStatus: undefined,
          resultShellStatus: undefined
        }
      ]
    };
    const invalidHandoff: ShowFanSocialHandoff = {
      ...partialHandoff,
      matchCount: 2
    };
    const unavailableValidation = validateShowFanSocialHandoff({ showInput: input });
    const partialValidation = validateShowFanSocialHandoff({
      showInput: input,
      fanSocialHandoff: partialHandoff
    });
    const invalidValidation = validateShowFanSocialHandoff({
      showInput: input,
      fanSocialHandoff: invalidHandoff
    });

    assert.equal(unavailableValidation.status, "unavailable");
    assert.equal(partialValidation.status, "partial");
    assert.ok(partialValidation.issues.some((issue) => issue.code === "missing-match-ids"));
    assert.ok(
      partialValidation.issues.some((issue) => issue.code === "missing-result-shell-status")
    );
    assert.ok(partialValidation.issues.some((issue) => issue.code === "missing-result-gate-status"));
    assert.equal(invalidValidation.status, "invalid");
    assert.ok(invalidValidation.issues.some((issue) => issue.code === "match-count-mismatch"));
  });

  it("does not block show execution when validation detects match run failures", () => {
    const input = createSampleShowEngineInput();
    const failingMatchEngine: MatchSimulationEngine = {
      ...matchEngine,
      run() {
        throw new Error("match engine unavailable");
      }
    };
    const engine = createShowEngine(failingMatchEngine);
    const result = engine.run(input, createSampleEngineContext("show-handoff-validation-failure", 7));

    assert.equal(result.hiddenState.failedMatchEngineRuns, 1);
    assert.equal(result.hiddenState.fanSocialHandoffValidation.status, "partial");
    assert.ok(
      result.hiddenState.fanSocialHandoffValidation.issues.some(
        (issue) => issue.code === "match-run-failures"
      )
    );
    assert.deepEqual(result.matchResults, []);
  });

  it("does not call or import fan reaction or social discourse engines from show execution", () => {
    const showEngineSource = readFileSync("src/game/engines/showEngine.ts", "utf8");

    assert.equal(showEngineSource.includes("fanReactionEngine"), false);
    assert.equal(showEngineSource.includes("socialDiscourseEngine"), false);
    assert.equal(showEngineSource.includes("runRegisteredFanReactionEngine"), false);
    assert.equal(showEngineSource.includes("runRegisteredSocialDiscourseEngine"), false);
  });

  it("keeps validation internals out of player-facing output", () => {
    const result = showEngine.run(
      createSampleShowEngineInput(),
      createSampleEngineContext("show-handoff-validation-output-boundary", 7),
      { debug: true }
    );
    const serializedSignals = JSON.stringify(result.signals);

    assert.equal(serializedSignals.includes("fanSocialHandoffValidation"), false);
    assert.equal(serializedSignals.includes("readyForFanReactionOrchestration"), false);
    assert.equal(serializedSignals.includes("readyForSocialDiscourseOrchestration"), false);
    assert.equal(serializedSignals.includes("match-count-mismatch"), false);
    assert.equal(serializedSignals.includes("missing-result-shell-status"), false);
    assert.equal(serializedSignals.includes("missing-result-gate-status"), false);
  });
});
