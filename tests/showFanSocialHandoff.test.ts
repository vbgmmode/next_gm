import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createShowFanSocialHandoff,
  type ShowFanSocialHandoff,
  type ShowFanSocialHandoffInput
} from "../src/game/engines/index.ts";
import { showEngine } from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleShowEngineInput,
  createSampleShowEngineInputWithMultipleMatches,
  createSampleShowEngineInputWithoutMatches
} from "./fixtures/index.ts";

describe("Show Fan/Social Handoff", () => {
  it("imports cleanly and returns a hidden handoff shell", () => {
    const result = showEngine.run(
      createSampleShowEngineInput(),
      createSampleEngineContext("show-handoff-unit", 7)
    );
    const handoff: ShowFanSocialHandoff = createShowFanSocialHandoff(
      createInputFromResult(createSampleShowEngineInput(), result.hiddenState)
    );

    assert.equal(handoff.status, "ready");
    assert.equal(handoff.confidence, "strong");
    assert.equal(handoff.hasExecutionOrder, true);
    assert.equal(handoff.hasRunSummary, true);
    assert.equal(handoff.hasBookingValidation, true);
  });

  it("summarizes zero booked matches as an empty handoff", () => {
    const showInput = createSampleShowEngineInputWithoutMatches();
    const result = showEngine.run(showInput, createSampleEngineContext("show-handoff-empty", 7));
    const handoff = result.hiddenState.fanSocialHandoff;

    assert.equal(handoff.status, "empty");
    assert.equal(handoff.confidence, "unknown");
    assert.equal(handoff.matchCount, 0);
    assert.deepEqual(handoff.orderedMatchSummaries, []);
    assert.ok(handoff.issues.includes("no-booked-matches"));
  });

  it("preserves execution order and opener/main event flags", () => {
    const showInput = createSampleShowEngineInputWithMultipleMatches();
    const result = showEngine.run(showInput, createSampleEngineContext("show-handoff-order", 7));
    const handoff = result.hiddenState.fanSocialHandoff;

    assert.equal(handoff.status, "ready");
    assert.deepEqual(
      handoff.orderedMatchSummaries.map((summary) => summary.matchId),
      ["match-opener", "match-main-event"]
    );
    assert.equal(handoff.orderedMatchSummaries[0].isOpener, true);
    assert.equal(handoff.orderedMatchSummaries[0].isMainEvent, false);
    assert.equal(handoff.orderedMatchSummaries[1].isOpener, false);
    assert.equal(handoff.orderedMatchSummaries[1].isMainEvent, true);
  });

  it("keeps compact match finish and validation reads without raw match hidden state", () => {
    const result = showEngine.run(
      createSampleShowEngineInput(),
      createSampleEngineContext("show-handoff-compact-match", 7)
    );
    const matchSummary = result.hiddenState.fanSocialHandoff.orderedMatchSummaries[0];

    assert.equal(matchSummary.finishIntentType, "unspecified");
    assert.equal(matchSummary.finishValidationStatus, "underspecified");
    assert.equal(matchSummary.resultGateStatus, "pending");
    assert.equal(matchSummary.resultShellStatus, "pending");
    assert.equal(Object.hasOwn(matchSummary, "hiddenState"), false);
    assert.equal(Object.hasOwn(matchSummary, "resultExecutionGate"), false);
    assert.equal(Object.hasOwn(matchSummary, "resultShell"), false);
  });
});

function createInputFromResult(
  showInput: ShowFanSocialHandoffInput["showInput"],
  hiddenState: {
    bookingValidation: ShowFanSocialHandoffInput["bookingValidation"];
    executionOrder: ShowFanSocialHandoffInput["executionOrder"];
    runSummary: ShowFanSocialHandoffInput["runSummary"];
    matchRunSummaries: ShowFanSocialHandoffInput["matchRunSummaries"];
  }
): ShowFanSocialHandoffInput {
  return {
    showInput,
    bookingValidation: hiddenState.bookingValidation,
    executionOrder: hiddenState.executionOrder,
    runSummary: hiddenState.runSummary,
    matchRunSummaries: hiddenState.matchRunSummaries
  };
}
