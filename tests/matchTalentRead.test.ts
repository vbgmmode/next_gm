import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createMatchTalentRead,
  type MatchTalentRead,
  type MatchTalentReadBand
} from "../src/game/engines/index.ts";
import {
  createParticipantTalentProfiles,
  sampleMatch,
  sampleTalentProfiles
} from "./fixtures/index.ts";

const matchParticipantWrestlerIds = sampleMatch.participantIds.map(
  (participant) => participant.wrestlerId
);

describe("Match Talent Read", () => {
  it("imports cleanly and returns a MatchTalentRead", () => {
    const read: MatchTalentRead = createMatchTalentRead(matchParticipantWrestlerIds);

    assert.equal(read.summary.participantCoverage, "none");
    assert.equal(read.summary.readStatus, "not-provided");
  });

  it("works with no talent profiles", () => {
    const read = createMatchTalentRead(matchParticipantWrestlerIds);

    assert.equal(read.summary.participantCoverage, "none");
    assert.equal(read.summary.matchedProfileCount, 0);
    assert.deepEqual(read.summary.missingProfileWrestlerIds, [
      "wrestler-jade-valor",
      "wrestler-marcus-crowe"
    ]);
    assert.ok(read.summary.participantReads.every((participantRead) => !participantRead.profilePresent));
    assert.ok(
      read.summary.participantReads.every(
        (participantRead) => participantRead.overallReadinessBand === "missing"
      )
    );
  });

  it("works with partial talent profile coverage", () => {
    const read = createMatchTalentRead(
      matchParticipantWrestlerIds,
      createParticipantTalentProfiles([sampleTalentProfiles[0]])
    );

    assert.equal(read.summary.participantCoverage, "partial");
    assert.equal(read.summary.matchedProfileCount, 1);
    assert.deepEqual(read.summary.missingProfileWrestlerIds, ["wrestler-marcus-crowe"]);
    assert.equal(read.summary.readStatus, "partial-coverage");
    assert.equal(read.summary.participantReads[0].profilePresent, true);
    assert.equal(read.summary.participantReads[1].profilePresent, false);
  });

  it("works with full talent profile coverage", () => {
    const read = createMatchTalentRead(
      matchParticipantWrestlerIds,
      createParticipantTalentProfiles(sampleTalentProfiles)
    );

    assert.equal(read.summary.participantCoverage, "full");
    assert.equal(read.summary.matchedProfileCount, 2);
    assert.deepEqual(read.summary.missingProfileWrestlerIds, []);
    assert.equal(read.summary.readStatus, "full-coverage");
    assert.ok(read.summary.participantReads.every((participantRead) => participantRead.profilePresent));
  });

  it("maps raw internal attributes into bands", () => {
    const read = createMatchTalentRead(
      sampleTalentProfiles.map((profile) => profile.wrestlerId),
      createParticipantTalentProfiles(sampleTalentProfiles)
    );
    const jadeRead = read.summary.participantReads.find(
      (participantRead) => participantRead.wrestlerId === "wrestler-jade-valor"
    );
    const marcusRead = read.summary.participantReads.find(
      (participantRead) => participantRead.wrestlerId === "wrestler-marcus-crowe"
    );
    const rioRead = read.summary.participantReads.find(
      (participantRead) => participantRead.wrestlerId === "wrestler-rio-ace"
    );

    assert.equal(jadeRead?.inRingBand, "strong");
    assert.equal(jadeRead?.overallReadinessBand, "strong");
    assert.equal(marcusRead?.promoBand, "elite");
    assert.equal(marcusRead?.fatiguePressureBand, "developing");
    assert.equal(rioRead?.starPowerBand, "solid");
    assert.equal(rioRead?.backstageRiskBand, "low");
  });

  it("does not return raw TalentProfile stat fields or values in the hidden read summary", () => {
    const read = createMatchTalentRead(
      matchParticipantWrestlerIds,
      createParticipantTalentProfiles(sampleTalentProfiles)
    );
    const forbiddenRawFieldNames = [
      "inRingSkill",
      "promoSkill",
      "charisma",
      "stamina",
      "fatigue",
      "morale",
      "professionalism"
    ];
    const bandValues: readonly MatchTalentReadBand[] = [
      "missing",
      "low",
      "developing",
      "solid",
      "strong",
      "elite"
    ];
    const summaryKeys = collectObjectKeys(read.summary);
    const numericLeaves = collectNumericLeaves(read.summary);

    for (const rawFieldName of forbiddenRawFieldNames) {
      assert.equal(summaryKeys.includes(rawFieldName), false);
    }

    assert.deepEqual(numericLeaves, [2]);
    for (const bandValue of bandValues) {
      assert.equal(typeof bandValue, "string");
    }
  });
});

function collectObjectKeys(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap(collectObjectKeys);
  }

  if (value !== null && typeof value === "object") {
    return Object.entries(value).flatMap(([key, nestedValue]) => [
      key,
      ...collectObjectKeys(nestedValue)
    ]);
  }

  return [];
}

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
