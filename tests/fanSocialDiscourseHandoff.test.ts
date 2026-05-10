import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createFanSocialDiscourseHandoff,
  type FanSocialDiscourseHandoff
} from "../src/game/engines/index.ts";
import { sampleFanReactionEngineResult } from "./fixtures/index.ts";

describe("Fan Reaction -> Social Discourse hidden handoff", () => {
  it("creates a hidden missing handoff when no show output shell is provided", () => {
    const handoff: FanSocialDiscourseHandoff = createFanSocialDiscourseHandoff();

    assert.equal(handoff.sourceEngine, "fan-reaction");
    assert.equal(handoff.playerFacing, false);
    assert.deepEqual(handoff.showOutputReadiness, {
      provided: false,
      structurallyUsable: false,
      inputStatus: "missing",
      shellStatus: null,
      readyForSocialDiscourseHandoff: false,
      issueCount: 0,
      matchCount: null,
      showId: null
    });
    assert.equal(handoff.showSignals, null);
  });

  it("normalizes a Fan Reaction show output shell into the shared DTO", () => {
    const handoff = createFanSocialDiscourseHandoff(
      sampleFanReactionEngineResult.hiddenState.showOutputShell
    );

    assert.deepEqual(handoff.showOutputReadiness, {
      provided: true,
      structurallyUsable: true,
      inputStatus: "usable",
      shellStatus: "ready",
      readyForSocialDiscourseHandoff: true,
      issueCount: 0,
      matchCount: 1,
      showId: "show-week-7"
    });
    assert.deepEqual(handoff.showSignals, {
      crowdEnergyRead: "structurally-ready",
      bookingTrustRead: "structurally-ready",
      featuredTalentReceptionRead: "structurally-ready",
      showMomentumRead: "structurally-ready",
      confidenceRead: "structurally-ready"
    });
  });

  it("normalizes structurally unusable input without exposing raw shell data", () => {
    const handoff = createFanSocialDiscourseHandoff({
      status: "ready",
      matchCount: -1
    });

    assert.deepEqual(handoff.showOutputReadiness, {
      provided: true,
      structurallyUsable: false,
      inputStatus: "unusable",
      shellStatus: null,
      readyForSocialDiscourseHandoff: false,
      issueCount: 0,
      matchCount: null,
      showId: null
    });
    assert.equal(Object.hasOwn(handoff, "showOutputShell"), false);
    assert.equal(Object.hasOwn(handoff, "signals"), false);
    assert.equal(handoff.showSignals, null);
  });

  it("does not add generated or gameplay output fields", () => {
    const handoff = createFanSocialDiscourseHandoff(
      sampleFanReactionEngineResult.hiddenState.showOutputShell
    );

    assert.equal(Object.hasOwn(handoff, "producedNarratives"), false);
    assert.equal(Object.hasOwn(handoff, "tweets"), false);
    assert.equal(Object.hasOwn(handoff, "reports"), false);
    assert.equal(Object.hasOwn(handoff, "sentimentScore"), false);
    assert.equal(Object.hasOwn(handoff, "backlashScore"), false);
    assert.equal(Object.hasOwn(handoff, "attendance"), false);
    assert.equal(Object.hasOwn(handoff, "revenue"), false);
    assert.equal(Object.hasOwn(handoff, "showGrade"), false);
    assert.equal(Object.hasOwn(handoff, "winnerId"), false);
    assert.equal(Object.hasOwn(handoff, "starRating"), false);
  });
});
