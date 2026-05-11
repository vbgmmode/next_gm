import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, it } from "node:test";

import {
  createNewGMModeDraftPickCandidateObjectValidator,
  createNewGMModeDraftPickCandidateObjects
} from "../src/game/domain/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const UNTOUCHED_DRAFT_PICK_CANDIDATE_VALIDATOR_DATABASE =
  "data/saves/__new-gm-mode-draft-pick-candidate-validator-should-not-exist.sqlite";
const candidateSet = createNewGMModeDraftPickCandidateObjects();
const validation = createNewGMModeDraftPickCandidateObjectValidator({
  candidateSet
});

describe("New GM Mode Draft Pick Candidate Object Validator v0.1", () => {
  it("validates the generated candidate set as structurally valid", () => {
    assert.equal(
      validation.validatorId,
      "new-gm-mode-draft-pick-candidate-object-validator-v0.1"
    );
    assert.equal(validation.version, "0.1");
    assert.equal(validation.domainObject, true);
    assert.equal(validation.diagnosticsOnly, false);
    assert.equal(validation.playerFacing, false);
    assert.equal(validation.gameplayAffecting, false);
    assert.equal(validation.mutable, false);
    assert.equal(validation.validationOnly, true);
    assert.equal(validation.structurallyValid, true);
    assert.equal(validation.issueCount, 0);
    assert.deepEqual(validation.issues, []);
  });

  it("preserves full static roster candidate counts", () => {
    assert.deepEqual(validation.candidateSummary, {
      totalCandidateCount: 245,
      eligibleCandidateCount: 235,
      ineligibleCandidateCount: 10,
      expectedTotalCandidateCount: 245,
      expectedEligibleCandidateCount: 235,
      expectedIneligibleCandidateCount: 10
    });
  });

  it("detects duplicate candidate IDs", () => {
    const malformed = cloneCandidateSet();
    malformed.candidates[1].candidateId = malformed.candidates[0].candidateId;
    const result = createNewGMModeDraftPickCandidateObjectValidator({
      candidateSet: malformed
    });

    assert.equal(result.structurallyValid, false);
    assert.deepEqual(issueIds(result), ["candidate-id-duplicate"]);
  });

  it("detects missing source fixture and wrestler identity references", () => {
    const malformed = cloneCandidateSet();
    delete malformed.candidates[0].sourceFixtureReference;
    delete malformed.candidates[0].wrestlerIdentityReference;
    const result = createNewGMModeDraftPickCandidateObjectValidator({
      candidateSet: malformed
    });

    assert.deepEqual(issueIds(result), [
      "source-fixture-reference-missing",
      "wrestler-identity-reference-missing"
    ]);
  });

  it("detects unknown eligibility status and unstable eligibility counts", () => {
    const malformed = cloneCandidateSet();
    malformed.candidates[0].eligibilityStatus = "unknown";
    const result = createNewGMModeDraftPickCandidateObjectValidator({
      candidateSet: malformed
    });

    assert.deepEqual(issueIds(result), [
      "ineligible-candidate-count-not-stable",
      "eligibility-status-unknown"
    ]);
  });

  it("detects missing readiness reason IDs", () => {
    const malformed = cloneCandidateSet();
    malformed.candidates[0].readinessReasonIds = [];
    const result = createNewGMModeDraftPickCandidateObjectValidator({
      candidateSet: malformed
    });

    assert.deepEqual(issueIds(result), ["readiness-reason-ids-missing"]);
  });

  it("detects missing display-readiness marker", () => {
    const malformed = cloneCandidateSet();
    delete malformed.candidates[0].displayReadinessMarker;
    const result = createNewGMModeDraftPickCandidateObjectValidator({
      candidateSet: malformed
    });

    assert.deepEqual(issueIds(result), ["display-readiness-marker-missing"]);
  });

  it("detects incorrect domain flags", () => {
    const malformed = cloneCandidateSet();
    malformed.candidates[0].domainObject = false;
    malformed.candidates[0].diagnosticsOnly = true;
    malformed.candidates[0].playerFacing = true;
    malformed.candidates[0].gameplayAffecting = true;
    malformed.candidates[0].mutable = true;
    const result = createNewGMModeDraftPickCandidateObjectValidator({
      candidateSet: malformed
    });

    assert.deepEqual(issueIds(result), [
      "domain-object-flag-invalid",
      "diagnostics-only-flag-invalid",
      "player-facing-flag-invalid",
      "gameplay-affecting-flag-invalid",
      "mutable-flag-invalid"
    ]);
  });

  it("detects missing or incorrectly enabled capability flags", () => {
    const missingFlags = cloneCandidateSet();
    delete missingFlags.candidates[0].capabilityFlags;
    const missingResult = createNewGMModeDraftPickCandidateObjectValidator({
      candidateSet: missingFlags
    });

    assert.deepEqual(issueIds(missingResult), ["capability-flags-missing"]);

    const enabledFlags = cloneCandidateSet();
    enabledFlags.candidates[0].capabilityFlags.canStartGameplay = true;
    enabledFlags.candidates[0].capabilityFlags.canUnlockWeekOne = true;
    const enabledResult = createNewGMModeDraftPickCandidateObjectValidator({
      candidateSet: enabledFlags
    });

    assert.deepEqual(issueIds(enabledResult), [
      "capability-flag-enabled",
      "capability-flag-enabled"
    ]);
    assert.deepEqual(
      enabledResult.issues.map((issue) => issue.fieldId),
      [
        "capabilityFlags.canStartGameplay",
        "capabilityFlags.canUnlockWeekOne"
      ]
    );
  });

  it("returns deterministic issue reason IDs for malformed injected candidate objects", () => {
    const malformed = cloneCandidateSet();
    malformed.candidates[0].candidateId = "bad-id";
    malformed.candidates[0].readinessReasonIds = [];
    delete malformed.candidates[0].displayReadinessMarker;
    malformed.candidates[0].domainObject = false;
    malformed.candidates[0].capabilityFlags.canStartGameplay = true;
    malformed.candidates[0].selectedWrestler = {
      wrestlerId: "forbidden"
    };
    const result = createNewGMModeDraftPickCandidateObjectValidator({
      candidateSet: malformed
    });

    assert.deepEqual(issueIds(result), [
      "candidate-id-format-invalid",
      "readiness-reason-ids-missing",
      "display-readiness-marker-missing",
      "domain-object-flag-invalid",
      "capability-flag-enabled",
      "forbidden-field-present"
    ]);
    assert.deepEqual(
      result.issues.map((issue) => issue.fieldId),
      [
        "candidateId",
        "readinessReasonIds",
        "displayReadinessMarker",
        "domainObject",
        "capabilityFlags.canStartGameplay",
        "selectedWrestler"
      ]
    );
  });

  it("blocks selection, validation, execution, assignment, persistence, mutation, gameplay start, and Week 1 unlock", () => {
    assert.deepEqual(validation.capabilityFlags, {
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
      assert.equal(Object.hasOwn(validation, field), false);
      assert.equal(Object.hasOwn(candidateSet, field), false);
      candidateSet.candidates.forEach((candidate) => {
        assert.equal(Object.hasOwn(candidate, field), false);
      });
    }
    assert.equal(existsSync(UNTOUCHED_DRAFT_PICK_CANDIDATE_VALIDATOR_DATABASE), false);
  });

  it("exports the validator from the domain barrel", () => {
    assert.equal(
      typeof createNewGMModeDraftPickCandidateObjectValidator,
      "function"
    );
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed =
      "new-gm-mode-draft-pick-candidate-validator-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeDraftPickCandidateObjectValidator({
      candidateSet
    });

    const secondResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });
});

function cloneCandidateSet(): any {
  return JSON.parse(JSON.stringify(candidateSet));
}

function issueIds(result: {
  readonly issues: readonly { readonly issueId: string }[];
}): readonly string[] {
  return result.issues.map((issue) => issue.issueId);
}
