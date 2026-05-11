import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, it } from "node:test";

import {
  createNewGMModeDraftPickCandidateObjects,
  createNewGMModeStaticWrestlerFixtureCatalogShell
} from "../src/game/domain/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const UNTOUCHED_DRAFT_PICK_CANDIDATE_DATABASE =
  "data/saves/__new-gm-mode-draft-pick-candidate-should-not-exist.sqlite";
const candidateSet = createNewGMModeDraftPickCandidateObjects();
const fixtureCatalog = createNewGMModeStaticWrestlerFixtureCatalogShell();

describe("New GM Mode Draft Pick Candidate Object v0.1", () => {
  it("creates a real read-only internal domain object set from the fixture catalog", () => {
    assert.equal(
      candidateSet.draftPickCandidateObjectSetId,
      "new-gm-mode-draft-pick-candidate-object-set-v0.1"
    );
    assert.equal(candidateSet.version, "0.1");
    assert.equal(candidateSet.domainObject, true);
    assert.equal(candidateSet.diagnosticsOnly, false);
    assert.equal(candidateSet.playerFacing, false);
    assert.equal(candidateSet.gameplayAffecting, false);
    assert.equal(candidateSet.mutable, false);
    assert.equal(candidateSet.deterministicOrdering, true);
    assert.equal(Object.isFrozen(candidateSet), true);
    assert.equal(Object.isFrozen(candidateSet.candidates), true);
  });

  it("creates a full static roster universe and preserves the eligible / ineligible split", () => {
    assert.equal(candidateSet.candidates.length, 245);
    assert.deepEqual(candidateSet.candidateSummary, {
      totalCandidateCount: 245,
      eligibleCandidateCount: 235,
      ineligibleCandidateCount: 10,
      expectedTotalCandidateCount: 245,
      expectedEligibleCandidateCount: 235,
      expectedIneligibleCandidateCount: 10
    });
    assert.equal(
      candidateSet.candidates.filter(
        (candidate) => candidate.eligibilityStatus === "eligible"
      ).length,
      235
    );
    assert.equal(
      candidateSet.candidates.filter(
        (candidate) => candidate.eligibilityStatus === "ineligible"
      ).length,
      10
    );
  });

  it("includes broad eligible coverage by source roster pool", () => {
    const countsByPool = countEligibleCandidatesBySourceRosterPool();

    assert.deepEqual(countsByPool, {
      Raw: 52,
      SmackDown: 52,
      NXT: 44,
      AEW: 87
    });
    assert.equal(countsByPool.Raw > 40, true);
    assert.equal(countsByPool.SmackDown > 40, true);
    assert.equal(countsByPool.NXT > 35, true);
    assert.equal(countsByPool.AEW > 70, true);
  });

  it("produces stable deterministic candidate IDs from source fixture identity", () => {
    const candidateIds = candidateSet.candidates.map(
      (candidate) => candidate.candidateId
    );

    assert.deepEqual(
      candidateIds,
      fixtureCatalog.fixtures.map(
        (fixture) => `new-gm-mode-draft-pick-candidate:${fixture.wrestlerId}`
      )
    );
    assert.equal(new Set(candidateIds).size, candidateIds.length);
    assert.deepEqual(
      createNewGMModeDraftPickCandidateObjects(),
      candidateSet
    );
  });

  it("preserves source fixture and wrestler identity references without selection", () => {
    candidateSet.candidates.forEach((candidate, index) => {
      const fixture = fixtureCatalog.fixtures[index];

      assert.equal(candidate.sourceFixtureReference.sourceCatalogId, candidateSet.sourceCatalogId);
      assert.equal(candidate.sourceFixtureReference.fixtureIndex, index);
      assert.equal(candidate.sourceFixtureReference.fixtureId, fixture.wrestlerId);
      assert.equal(candidate.sourceFixtureReference.fixtureSlug, fixture.slug);
      assert.deepEqual(candidate.wrestlerIdentityReference, {
        wrestlerId: fixture.wrestlerId,
        slug: fixture.slug
      });
      assert.equal(candidate.domainObject, true);
      assert.equal(candidate.diagnosticsOnly, false);
      assert.equal(candidate.playerFacing, false);
      assert.equal(candidate.gameplayAffecting, false);
      assert.equal(candidate.mutable, false);
      assert.equal(Object.isFrozen(candidate), true);
    });
  });

  it("represents eligible and ineligible candidate shapes with readiness reasons and display markers", () => {
    const eligibleCandidate = candidateSet.candidates.find(
      (candidate) => candidate.eligibilityStatus === "eligible"
    );
    const ineligibleCandidate = candidateSet.candidates.find(
      (candidate) =>
        candidate.eligibilityStatus === "ineligible" &&
        candidate.readinessReasonIds.includes("source-fixture-not-available")
    );

    assert.ok(eligibleCandidate);
    assert.ok(ineligibleCandidate);
    assert.equal(eligibleCandidate.eligibilityStatus, "eligible");
    assert.deepEqual(eligibleCandidate.readinessReasonIds, [
      "source-fixture-identity-present",
      "source-fixture-display-ready",
      "source-fixture-draft-eligible",
      "source-fixture-available"
    ]);
    assert.equal(eligibleCandidate.displayReadinessMarker, "display-ready");
    assert.deepEqual(ineligibleCandidate.readinessReasonIds, [
      "source-fixture-identity-present",
      "source-fixture-display-ready",
      "source-fixture-not-draft-eligible",
      "source-fixture-not-available"
    ]);
    assert.equal(ineligibleCandidate.displayReadinessMarker, "display-ready");
  });

  it("blocks selection, validation, execution, assignment, persistence, mutation, gameplay start, and Week 1 unlock", () => {
    const expectedCapabilities = {
      canSelectCandidate: false,
      canValidateAsDraftPick: false,
      canExecuteDraftPick: false,
      canCreateDraftState: false,
      canAssignToRoster: false,
      canCreateOrMutateRoster: false,
      canAssignTitleOrDivision: false,
      canCreateMatchShowOrWeekState: false,
      canStartGameplay: false,
      canUnlockWeekOne: false,
      canPersistGameplayPayload: false,
      canWriteDatabase: false,
      canCreateUserInterface: false,
      canCreateGeneratedText: false,
      canUseGenAI: false
    };

    assert.deepEqual(candidateSet.capabilityFlags, expectedCapabilities);
    candidateSet.candidates.forEach((candidate) => {
      assert.deepEqual(candidate.capabilityFlags, expectedCapabilities);
    });
  });

  it("does not add selected wrestler, draft pick ID, selection intent, roster, championship, state, persistence, UI, generated text, or GenAI payload fields", () => {
    const forbiddenFields = [
      "selectedWrestler",
      "selectedWrestlerId",
      "selectedWrestlerHandled",
      "draftPickId",
      "draftPick",
      "selectionIntent",
      "draftSelectionIntent",
      "rosterAssignment",
      "rosterState",
      "championshipDivision",
      "match",
      "matchState",
      "show",
      "showState",
      "week",
      "weekState",
      "save",
      "savePayload",
      "sqlite",
      "sqliteConnection",
      "ui",
      "generatedText",
      "genAI",
      "genAIClient"
    ];

    for (const field of forbiddenFields) {
      assert.equal(Object.hasOwn(candidateSet, field), false);
      candidateSet.candidates.forEach((candidate) => {
        assert.equal(Object.hasOwn(candidate, field), false);
      });
    }
    assert.equal(existsSync(UNTOUCHED_DRAFT_PICK_CANDIDATE_DATABASE), false);
  });

  it("exports the candidate object factory from the domain barrel", () => {
    assert.equal(typeof createNewGMModeDraftPickCandidateObjects, "function");
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "new-gm-mode-draft-pick-candidate-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeDraftPickCandidateObjects();

    const secondResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });
});

function countEligibleCandidatesBySourceRosterPool(): Record<string, number> {
  const counts: Record<string, number> = {
    Raw: 0,
    SmackDown: 0,
    NXT: 0,
    AEW: 0
  };

  for (const candidate of candidateSet.candidates) {
    if (candidate.eligibilityStatus !== "eligible") {
      continue;
    }

    const fixture =
      fixtureCatalog.fixtures[candidate.sourceFixtureReference.fixtureIndex];
    counts[fixture.sourceRosterPool] =
      (counts[fixture.sourceRosterPool] ?? 0) + 1;
  }

  return counts;
}
