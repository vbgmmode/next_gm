import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createShowExecutionOrder,
  getBookedMatchesInExecutionOrder,
  type ShowEngineInput,
  type ShowExecutionOrderPlan
} from "../src/game/engines/index.ts";
import {
  createSampleShowEngineInput,
  createSampleShowEngineInputWithMultipleMatches,
  createSampleShowEngineInputWithoutMatches
} from "./fixtures/index.ts";

describe("Show Execution Order", () => {
  it("imports cleanly and returns a hidden execution order plan", () => {
    const plan: ShowExecutionOrderPlan = createShowExecutionOrder(createSampleShowEngineInput());

    assert.equal(plan.status, "inferred");
    assert.equal(plan.confidence, "strong");
    assert.deepEqual(plan.orderedMatchIds, ["match-main-event"]);
  });

  it("summarizes zero booked matches safely as empty", () => {
    const plan = createShowExecutionOrder(createSampleShowEngineInputWithoutMatches());

    assert.equal(plan.status, "empty");
    assert.equal(plan.confidence, "unknown");
    assert.deepEqual(plan.orderedMatchIds, []);
    assert.equal(plan.openerMatchId, undefined);
    assert.equal(plan.mainEventMatchId, undefined);
    assert.deepEqual(plan.issues, ["no-booked-matches"]);
  });

  it("marks one booked match as both opener and main event", () => {
    const plan = createShowExecutionOrder(createSampleShowEngineInput());

    assert.equal(plan.entries.length, 1);
    assert.equal(plan.openerMatchId, "match-main-event");
    assert.equal(plan.mainEventMatchId, "match-main-event");
    assert.equal(plan.entries[0].isOpener, true);
    assert.equal(plan.entries[0].isMainEvent, true);
  });

  it("uses stable input array order when no explicit order index exists", () => {
    const input = createSampleShowEngineInputWithMultipleMatches();
    const plan = createShowExecutionOrder(input);

    assert.equal(plan.status, "inferred");
    assert.deepEqual(plan.orderedMatchIds, ["match-opener", "match-main-event"]);
    assert.equal(plan.openerMatchId, "match-opener");
    assert.equal(plan.mainEventMatchId, "match-main-event");
    assert.deepEqual(
      getBookedMatchesInExecutionOrder(input, plan).map((bookedMatch) => bookedMatch.id),
      ["booked-opener", "booked-main-event"]
    );
  });

  it("respects explicit order index when provided", () => {
    const input = createExplicitOrderInput();
    const plan = createShowExecutionOrder(input);

    assert.equal(plan.status, "ordered");
    assert.equal(plan.confidence, "strong");
    assert.deepEqual(plan.orderedMatchIds, ["match-main-event", "match-opener"]);
    assert.equal(plan.openerMatchId, "match-main-event");
    assert.equal(plan.mainEventMatchId, "match-opener");
  });

  it("detects duplicate order indexes without blocking execution order creation", () => {
    const input = createDuplicateOrderIndexInput();
    const plan = createShowExecutionOrder(input);

    assert.equal(plan.status, "partial");
    assert.equal(plan.confidence, "moderate");
    assert.ok(plan.issues.includes("duplicate-order-indexes"));
    assert.deepEqual(plan.orderedMatchIds, ["match-opener", "match-main-event"]);
  });

  it("handles missing match ids safely", () => {
    const input = createMissingMatchIdInput();
    const plan = createShowExecutionOrder(input);

    assert.equal(plan.status, "invalid");
    assert.equal(plan.confidence, "low");
    assert.ok(plan.issues.includes("missing-match-ids"));
    assert.deepEqual(plan.orderedMatchIds, [""]);
    assert.equal(plan.openerMatchId, undefined);
    assert.equal(plan.mainEventMatchId, undefined);
  });
});

function createExplicitOrderInput(): ShowEngineInput {
  const input = createSampleShowEngineInputWithMultipleMatches();

  return {
    ...input,
    bookedMatches: [
      {
        ...input.bookedMatches[0],
        orderIndex: 20
      },
      {
        ...input.bookedMatches[1],
        orderIndex: 10
      }
    ]
  };
}

function createDuplicateOrderIndexInput(): ShowEngineInput {
  const input = createSampleShowEngineInputWithMultipleMatches();

  return {
    ...input,
    bookedMatches: input.bookedMatches.map((bookedMatch) => ({
      ...bookedMatch,
      orderIndex: 10
    }))
  };
}

function createMissingMatchIdInput(): ShowEngineInput {
  const input = createSampleShowEngineInput();

  return {
    ...input,
    bookedMatches: [
      {
        ...input.bookedMatches[0],
        matchInput: {
          ...input.bookedMatches[0].matchInput,
          match: {
            ...input.bookedMatches[0].matchInput.match,
            id: ""
          }
        }
      }
    ]
  };
}
