import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createMatchReadSummary,
  createMatchTalentRead,
  validateMatchFinishIntent
} from "../src/game/engines/index.ts";
import {
  createParticipantTalentProfiles,
  createSampleMatchEngineInputWithLowTalentProfiles,
  sampleMatch,
  sampleTalentProfiles
} from "./fixtures/index.ts";

const matchParticipantWrestlerIds = sampleMatch.participantIds.map(
  (participant) => participant.wrestlerId
);

describe("Match Finish Intent Validation", () => {
  it("marks missing finish intent as underspecified without crashing", () => {
    const talentRead = createMatchTalentRead(matchParticipantWrestlerIds);
    const matchRead = createMatchReadSummary({
      talentReadSummary: talentRead.summary,
      skillBalanceGap: 4,
      chemistryEstimate: 60,
      crowdEngagementRead: 62
    });
    const validation = validateMatchFinishIntent({
      matchReadSummary: matchRead,
      talentReadSummary: talentRead.summary,
      participantCount: 2,
      plannedMinutes: 18
    });

    assert.equal(validation.status, "underspecified");
    assert.equal(validation.severity, "moderate");
    assert.deepEqual(validation.reasons, [
      "finish-intent-unspecified",
      "missing-talent-coverage"
    ]);
    assert.equal(validation.confidenceBand, "unknown");
  });

  it("validates clean finish intent safely in a covered singles match", () => {
    const talentRead = createMatchTalentRead(
      matchParticipantWrestlerIds,
      createParticipantTalentProfiles(sampleTalentProfiles)
    );
    const matchRead = createMatchReadSummary({
      talentReadSummary: talentRead.summary,
      skillBalanceGap: 4,
      chemistryEstimate: 67,
      crowdEngagementRead: 70
    });
    const validation = validateMatchFinishIntent({
      finishIntent: { type: "clean", protection: "protected", controversy: "low" },
      matchReadSummary: matchRead,
      talentReadSummary: talentRead.summary,
      participantCount: 2,
      plannedMinutes: 18
    });

    assert.equal(validation.status, "valid");
    assert.equal(validation.severity, "none");
    assert.deepEqual(validation.reasons, ["finish-intent-supported"]);
    assert.equal(validation.confidenceBand, "high");
  });

  it("marks dirty, interference, and non-finish intent as questionable or risky", () => {
    const talentRead = createMatchTalentRead(
      matchParticipantWrestlerIds,
      createParticipantTalentProfiles(sampleTalentProfiles)
    );
    const matchRead = createMatchReadSummary({
      talentReadSummary: talentRead.summary,
      skillBalanceGap: 4,
      chemistryEstimate: 67,
      crowdEngagementRead: 70
    });
    const dirtyValidation = validateMatchFinishIntent({
      finishIntent: { type: "dirty", protection: "disputed", controversy: "moderate" },
      matchReadSummary: matchRead,
      talentReadSummary: talentRead.summary,
      participantCount: 2,
      plannedMinutes: 18
    });
    const interferenceValidation = validateMatchFinishIntent({
      finishIntent: { type: "interference", controversy: "high" },
      matchReadSummary: matchRead,
      talentReadSummary: talentRead.summary,
      participantCount: 2,
      plannedMinutes: 18
    });
    const nonFinishValidation = validateMatchFinishIntent({
      finishIntent: { type: "non_finish", controversy: "moderate" },
      matchReadSummary: matchRead,
      talentReadSummary: talentRead.summary,
      participantCount: 3,
      plannedMinutes: 18
    });

    assert.equal(dirtyValidation.status, "questionable");
    assert.equal(interferenceValidation.status, "risky");
    assert.equal(nonFinishValidation.status, "questionable");
  });

  it("marks draw and stoppage intent as questionable or risky without creating outcomes", () => {
    const talentRead = createMatchTalentRead(
      matchParticipantWrestlerIds,
      createParticipantTalentProfiles(sampleTalentProfiles)
    );
    const matchRead = createMatchReadSummary({
      talentReadSummary: talentRead.summary,
      skillBalanceGap: 4,
      chemistryEstimate: 67,
      crowdEngagementRead: 70
    });
    const drawValidation = validateMatchFinishIntent({
      finishIntent: { type: "draw", controversy: "moderate" },
      matchReadSummary: matchRead,
      talentReadSummary: talentRead.summary,
      participantCount: 2,
      plannedMinutes: 18
    });
    const shortDrawValidation = validateMatchFinishIntent({
      finishIntent: { type: "draw", controversy: "moderate" },
      matchReadSummary: matchRead,
      talentReadSummary: talentRead.summary,
      participantCount: 2,
      plannedMinutes: 8
    });
    const stoppageValidation = validateMatchFinishIntent({
      finishIntent: { type: "stoppage", controversy: "moderate" },
      matchReadSummary: matchRead,
      talentReadSummary: talentRead.summary,
      participantCount: 2,
      plannedMinutes: 18
    });

    assert.equal(drawValidation.status, "questionable");
    assert.equal(shortDrawValidation.status, "risky");
    assert.equal(stoppageValidation.status, "risky");
  });

  it("uses hidden match risk pressure as a validation reason", () => {
    const weakInput = createSampleMatchEngineInputWithLowTalentProfiles();
    const talentRead = createMatchTalentRead(
      matchParticipantWrestlerIds,
      weakInput.participantTalentProfiles
    );
    const matchRead = createMatchReadSummary({
      talentReadSummary: talentRead.summary,
      skillBalanceGap: 4,
      chemistryEstimate: 67,
      crowdEngagementRead: 70
    });
    const validation = validateMatchFinishIntent({
      finishIntent: { type: "clean", protection: "protected", controversy: "low" },
      matchReadSummary: matchRead,
      talentReadSummary: talentRead.summary,
      participantCount: 2,
      plannedMinutes: 18
    });

    assert.equal(validation.status, "risky");
    assert.ok(validation.reasons.includes("hidden-match-risk-pressure"));
  });

  it("can flag unsupported runtime finish intent shapes without blocking execution", () => {
    const talentRead = createMatchTalentRead(
      matchParticipantWrestlerIds,
      createParticipantTalentProfiles(sampleTalentProfiles)
    );
    const matchRead = createMatchReadSummary({
      talentReadSummary: talentRead.summary,
      skillBalanceGap: 4,
      chemistryEstimate: 67,
      crowdEngagementRead: 70
    });
    const validation = validateMatchFinishIntent({
      finishIntent: { type: "ladder-fall" } as Parameters<typeof validateMatchFinishIntent>[0]["finishIntent"],
      matchReadSummary: matchRead,
      talentReadSummary: talentRead.summary,
      participantCount: 2,
      plannedMinutes: 18
    });

    assert.equal(validation.status, "unsupported");
    assert.equal(validation.severity, "high");
    assert.ok(validation.reasons.includes("finish-intent-unsupported"));
  });

  it("does not expose numeric leaves in validation summary", () => {
    const talentRead = createMatchTalentRead(
      matchParticipantWrestlerIds,
      createParticipantTalentProfiles(sampleTalentProfiles)
    );
    const matchRead = createMatchReadSummary({
      talentReadSummary: talentRead.summary,
      skillBalanceGap: 4,
      chemistryEstimate: 67,
      crowdEngagementRead: 70
    });
    const validation = validateMatchFinishIntent({
      finishIntent: { type: "clean", protection: "protected", controversy: "low" },
      matchReadSummary: matchRead,
      talentReadSummary: talentRead.summary,
      participantCount: 2,
      plannedMinutes: 18
    });

    assert.deepEqual(collectNumericLeaves(validation), []);
  });
});

function collectNumericLeaves(value: unknown): number[] {
  if (typeof value === "number") {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap(collectNumericLeaves);
  }

  if (value !== null && typeof value === "object") {
    return Object.values(value).flatMap(collectNumericLeaves);
  }

  return [];
}
