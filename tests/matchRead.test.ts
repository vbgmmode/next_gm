import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createMatchReadSummary,
  createMatchTalentRead,
  type MatchReadSummary
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

describe("Match Read", () => {
  it("imports cleanly and returns a hidden MatchReadSummary", () => {
    const talentRead = createMatchTalentRead(matchParticipantWrestlerIds);
    const matchRead: MatchReadSummary = createMatchReadSummary({
      talentReadSummary: talentRead.summary,
      skillBalanceGap: 4,
      chemistryEstimate: 60,
      crowdEngagementRead: 62
    });

    assert.equal(matchRead.talentCoverage, "none");
    assert.equal(matchRead.readinessRead, "uneven");
  });

  it("uses normalized talent bands to produce categorical hidden reads", () => {
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

    assert.equal(matchRead.talentCoverage, "full");
    assert.equal(matchRead.competitivenessRead, "even");
    assert.equal(matchRead.crowdPotentialRead, "hot");
    assert.equal(matchRead.readinessRead, "ready");
    assert.equal(matchRead.riskPressureRead, "moderate");
    assert.equal(matchRead.chemistryRead, "promising");
    assert.equal(matchRead.strongestReadinessBand, "strong");
    assert.equal(matchRead.weakestReadinessBand, "solid");
  });

  it("lets weaker talent bands change hidden match reads", () => {
    const strongTalentRead = createMatchTalentRead(
      matchParticipantWrestlerIds,
      createParticipantTalentProfiles(sampleTalentProfiles)
    );
    const weakInput = createSampleMatchEngineInputWithLowTalentProfiles();
    const weakTalentRead = createMatchTalentRead(
      matchParticipantWrestlerIds,
      weakInput.participantTalentProfiles
    );
    const baseline = {
      skillBalanceGap: 4,
      chemistryEstimate: 67,
      crowdEngagementRead: 70
    };
    const strongRead = createMatchReadSummary({
      talentReadSummary: strongTalentRead.summary,
      ...baseline
    });
    const weakRead = createMatchReadSummary({
      talentReadSummary: weakTalentRead.summary,
      ...baseline
    });

    assert.equal(strongRead.readinessRead, "ready");
    assert.equal(weakRead.readinessRead, "poor");
    assert.equal(strongRead.crowdPotentialRead, "hot");
    assert.equal(weakRead.crowdPotentialRead, "modest");
    assert.equal(strongRead.riskPressureRead, "moderate");
    assert.equal(weakRead.riskPressureRead, "elevated");
  });

  it("does not expose numeric leaves in the hidden match read summary", () => {
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

    assert.deepEqual(collectNumericLeaves(matchRead), []);
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
