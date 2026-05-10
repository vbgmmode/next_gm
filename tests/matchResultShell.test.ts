import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createMatchFinishReadSummary,
  createMatchReadSummary,
  createMatchResultShell,
  createMatchTalentRead,
  validateMatchFinishIntent,
  type MatchResultShell
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

describe("Match Result Shell", () => {
  it("imports cleanly and returns a hidden MatchResultShell", () => {
    const shell: MatchResultShell = createShell(undefined);

    assert.equal(shell.hasWinner, false);
    assert.equal(shell.hasFinish, false);
    assert.equal(shell.hasRating, false);
    assert.equal(shell.hasConsequences, false);
  });

  it("defaults safely to pending when finish intent is missing", () => {
    const shell = createShell(undefined);

    assert.equal(shell.status, "pending");
    assert.equal(shell.readiness, "moderate");
    assert.equal(shell.confidence, "moderate");
    assert.ok(shell.reasons.includes("finish-intent-underspecified"));
  });

  it("can become ready for execution for valid clean intent without result data", () => {
    const shell = createShell({
      type: "clean",
      protection: "protected",
      controversy: "low"
    });

    assert.equal(shell.status, "ready_for_execution");
    assert.equal(shell.readiness, "high");
    assert.equal(shell.confidence, "high");
    assert.equal(shell.hasWinner, false);
    assert.equal(shell.hasFinish, false);
    assert.equal(shell.hasRating, false);
    assert.equal(shell.hasConsequences, false);
  });

  it("can become pending for questionable intent", () => {
    const shell = createShell({
      type: "dirty",
      protection: "disputed",
      controversy: "moderate"
    });

    assert.equal(shell.status, "pending");
    assert.equal(shell.readiness, "moderate");
    assert.equal(shell.confidence, "moderate");
    assert.ok(shell.reasons.includes("finish-intent-questionable"));
  });

  it("can become blocked when validation or hidden reads are risky", () => {
    const shell = createWeakShell({
      type: "clean",
      protection: "protected",
      controversy: "low"
    });

    assert.equal(shell.status, "blocked");
    assert.equal(shell.readiness, "low");
    assert.equal(shell.confidence, "low");
    assert.ok(shell.reasons.includes("finish-intent-risky"));
  });

  it("can become unavailable for unsupported runtime finish intent shapes", () => {
    const shell = createShell({ type: "ladder-fall" } as Parameters<typeof createShell>[0]);

    assert.equal(shell.status, "unavailable");
    assert.equal(shell.readiness, "unknown");
    assert.equal(shell.confidence, "unknown");
    assert.ok(shell.reasons.includes("finish-intent-unsupported"));
  });

  it("does not expose numeric leaves or result payload fields", () => {
    const shell = createShell({
      type: "clean",
      protection: "protected",
      controversy: "low"
    });

    assert.deepEqual(collectNumericLeaves(shell), []);
    assert.equal(Object.hasOwn(shell, "winnerId"), false);
    assert.equal(Object.hasOwn(shell, "loserId"), false);
    assert.equal(Object.hasOwn(shell, "rating"), false);
    assert.equal(Object.hasOwn(shell, "finishResult"), false);
  });
});

function createShell(finishIntent: Parameters<typeof validateMatchFinishIntent>[0]["finishIntent"]) {
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
    finishIntent,
    matchReadSummary: matchRead,
    talentReadSummary: talentRead.summary,
    participantCount: 2,
    plannedMinutes: 18
  });
  const finishRead = createMatchFinishReadSummary({
    matchReadSummary: matchRead,
    talentReadSummary: talentRead.summary,
    participantCount: 2,
    plannedMinutes: 18,
    finishIntent,
    finishIntentValidation: validation
  });

  return createMatchResultShell({
    matchReadSummary: matchRead,
    finishReadSummary: finishRead,
    finishIntentValidation: validation,
    talentReadSummary: talentRead.summary
  });
}

function createWeakShell(finishIntent: Parameters<typeof validateMatchFinishIntent>[0]["finishIntent"]) {
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
    finishIntent,
    matchReadSummary: matchRead,
    talentReadSummary: talentRead.summary,
    participantCount: 2,
    plannedMinutes: 18
  });
  const finishRead = createMatchFinishReadSummary({
    matchReadSummary: matchRead,
    talentReadSummary: talentRead.summary,
    participantCount: 2,
    plannedMinutes: 18,
    finishIntent,
    finishIntentValidation: validation
  });

  return createMatchResultShell({
    matchReadSummary: matchRead,
    finishReadSummary: finishRead,
    finishIntentValidation: validation,
    talentReadSummary: talentRead.summary
  });
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
