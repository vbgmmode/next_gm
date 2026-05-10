import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import {
  normalizeMatchFinishIntent,
  createMatchFinishReadSummary,
  createMatchReadSummary,
  createMatchTalentRead,
  type MatchFinishReadSummary
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

describe("Match Finish Read", () => {
  it("normalizes missing finish intent to unspecified defaults", () => {
    assert.deepEqual(normalizeMatchFinishIntent(undefined), {
      type: "unspecified",
      protection: "unspecified",
      controversy: "unspecified"
    });
  });

  it("imports cleanly and returns a hidden MatchFinishReadSummary", () => {
    const talentRead = createMatchTalentRead(matchParticipantWrestlerIds);
    const matchRead = createMatchReadSummary({
      talentReadSummary: talentRead.summary,
      skillBalanceGap: 4,
      chemistryEstimate: 60,
      crowdEngagementRead: 62
    });
    const finishRead: MatchFinishReadSummary = createMatchFinishReadSummary({
      matchReadSummary: matchRead,
      talentReadSummary: talentRead.summary,
      participantCount: 2,
      plannedMinutes: 18
    });

    assert.equal(finishRead.finishIntentTypeRead, "unspecified");
    assert.equal(finishRead.finishConfidenceRead, "unknown");
    assert.equal(finishRead.finishProtectionRead, "unknown");
  });

  it("produces stable protected reads for healthy full-coverage match reads", () => {
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
    const finishRead = createMatchFinishReadSummary({
      matchReadSummary: matchRead,
      talentReadSummary: talentRead.summary,
      participantCount: 2,
      plannedMinutes: 18
    });

    assert.equal(finishRead.finishIntentTypeRead, "unspecified");
    assert.equal(finishRead.finishConfidenceRead, "stable");
    assert.equal(finishRead.finishRiskRead, "stable");
    assert.equal(finishRead.finishControversyRead, "stable");
    assert.equal(finishRead.finishMomentumRead, "protected");
  });

  it("lets clean protected intent improve hidden finish protection without creating a result", () => {
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
    const finishRead = createMatchFinishReadSummary({
      matchReadSummary: matchRead,
      talentReadSummary: talentRead.summary,
      participantCount: 2,
      plannedMinutes: 18,
      finishIntent: {
        type: "clean",
        protection: "protected",
        controversy: "low"
      }
    });

    assert.equal(finishRead.finishIntentTypeRead, "clean");
    assert.equal(finishRead.finishConfidenceRead, "protected");
    assert.equal(finishRead.finishRiskRead, "stable");
    assert.equal(finishRead.finishControversyRead, "stable");
    assert.equal(finishRead.finishMomentumRead, "protected");
    assert.equal(finishRead.finishProtectionRead, "protected");
  });

  it("lets dirty, interference, and non-finish intent increase hidden controversy or risk", () => {
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
    const dirtyRead = createMatchFinishReadSummary({
      matchReadSummary: matchRead,
      talentReadSummary: talentRead.summary,
      participantCount: 2,
      plannedMinutes: 18,
      finishIntent: { type: "dirty", protection: "disputed", controversy: "moderate" }
    });
    const interferenceRead = createMatchFinishReadSummary({
      matchReadSummary: matchRead,
      talentReadSummary: talentRead.summary,
      participantCount: 2,
      plannedMinutes: 18,
      finishIntent: { type: "interference", controversy: "high" }
    });
    const nonFinishRead = createMatchFinishReadSummary({
      matchReadSummary: matchRead,
      talentReadSummary: talentRead.summary,
      participantCount: 3,
      plannedMinutes: 18,
      finishIntent: { type: "non_finish", controversy: "moderate" }
    });

    assert.equal(dirtyRead.finishRiskRead, "risky");
    assert.equal(dirtyRead.finishControversyRead, "disputed");
    assert.equal(interferenceRead.finishControversyRead, "volatile");
    assert.equal(nonFinishRead.finishRiskRead, "volatile");
  });

  it("lets draw and stoppage intent stay hidden without deciding an outcome", () => {
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
    const drawRead = createMatchFinishReadSummary({
      matchReadSummary: matchRead,
      talentReadSummary: talentRead.summary,
      participantCount: 2,
      plannedMinutes: 18,
      finishIntent: { type: "draw", controversy: "moderate" }
    });
    const stoppageRead = createMatchFinishReadSummary({
      matchReadSummary: matchRead,
      talentReadSummary: talentRead.summary,
      participantCount: 2,
      plannedMinutes: 18,
      finishIntent: { type: "stoppage", controversy: "moderate" }
    });

    assert.equal(drawRead.finishIntentTypeRead, "draw");
    assert.equal(drawRead.finishMomentumRead, "disputed");
    assert.equal(stoppageRead.finishIntentTypeRead, "stoppage");
    assert.equal(stoppageRead.finishMomentumRead, "disputed");
  });

  it("trends risky or volatile when hidden match reads are under pressure", () => {
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
    const finishRead = createMatchFinishReadSummary({
      matchReadSummary: matchRead,
      talentReadSummary: talentRead.summary,
      participantCount: 3,
      plannedMinutes: 22
    });

    assert.equal(finishRead.finishRiskRead, "volatile");
    assert.equal(finishRead.finishProtectionRead, "volatile");
    assert.equal(finishRead.finishControversyRead, "volatile");
    assert.equal(finishRead.finishMomentumRead, "volatile");
  });

  it("does not expose numeric leaves in the hidden finish read summary", () => {
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
    const finishRead = createMatchFinishReadSummary({
      matchReadSummary: matchRead,
      talentReadSummary: talentRead.summary,
      participantCount: 2,
      plannedMinutes: 18
    });

    assert.deepEqual(collectNumericLeaves(finishRead), []);
  });

  it("does not import or read raw TalentProfile numeric stats", () => {
    const source = readFileSync("src/game/engines/matchFinishRead.ts", "utf8");

    assert.equal(source.includes("TalentProfile"), false);
    assert.equal(source.includes("attributes"), false);
    assert.equal(source.includes("condition"), false);
    assert.equal(source.includes("backstage"), false);
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
