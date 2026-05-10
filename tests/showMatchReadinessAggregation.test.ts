import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createShowMatchReadinessAggregation } from "../src/game/engines/index.ts";

describe("Show Match Readiness Aggregation", () => {
  it("summarizes no matches as unavailable", () => {
    assert.deepEqual(
      createShowMatchReadinessAggregation({ matchRunSummaries: [] }),
      {
        totalMatches: 0,
        readyMatches: 0,
        limitedMatches: 0,
        blockedMatches: 0,
        unavailableMatches: 0,
        protectedFinishReadyMatches: 0,
        overallMatchReadiness: "unavailable"
      }
    );
  });

  it("treats missing classifications as unavailable", () => {
    const aggregation = createShowMatchReadinessAggregation({
      matchRunSummaries: [{}, { resultIntentClassification: "unknown-runtime-value" }]
    });

    assert.equal(aggregation.totalMatches, 2);
    assert.equal(aggregation.unavailableMatches, 2);
    assert.equal(aggregation.overallMatchReadiness, "unavailable");
  });

  it("summarizes mixed ready and limited classifications as partial", () => {
    const aggregation = createShowMatchReadinessAggregation({
      matchRunSummaries: [
        { resultIntentClassification: "standard-match-ready" },
        { resultIntentClassification: "protected-finish-ready" },
        { resultIntentClassification: "needs-more-context" }
      ]
    });

    assert.equal(aggregation.totalMatches, 3);
    assert.equal(aggregation.readyMatches, 2);
    assert.equal(aggregation.limitedMatches, 1);
    assert.equal(aggregation.protectedFinishReadyMatches, 1);
    assert.equal(aggregation.overallMatchReadiness, "partial");
  });

  it("marks any blocked match classification as blocked overall", () => {
    const aggregation = createShowMatchReadinessAggregation({
      matchRunSummaries: [
        { resultIntentClassification: "standard-match-ready" },
        { resultIntentClassification: "blocked" }
      ]
    });

    assert.equal(aggregation.readyMatches, 1);
    assert.equal(aggregation.blockedMatches, 1);
    assert.equal(aggregation.overallMatchReadiness, "blocked");
  });

  it("summarizes all ready classifications as structurally-ready", () => {
    const aggregation = createShowMatchReadinessAggregation({
      matchRunSummaries: [
        { resultIntentClassification: "standard-match-ready" },
        { resultIntentClassification: "protected-finish-ready" }
      ]
    });

    assert.equal(aggregation.readyMatches, 2);
    assert.equal(aggregation.limitedMatches, 0);
    assert.equal(aggregation.blockedMatches, 0);
    assert.equal(aggregation.unavailableMatches, 0);
    assert.equal(aggregation.protectedFinishReadyMatches, 1);
    assert.equal(aggregation.overallMatchReadiness, "structurally-ready");
  });
});
