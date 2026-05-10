import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  createNewGMModeDraftPickValidationResultObject,
  createNewGMModeDraftPickValidationResultObjectValidator
} from "../src/game/domain/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const UNTOUCHED_VALIDATION_RESULT_OBJECT_VALIDATOR_DATABASE =
  "data/saves/__new-gm-mode-draft-pick-validation-result-object-validator-should-not-exist.sqlite";
const explicitInput = {
  sourceSelectionIntentObjectId:
    "new-gm-mode-draft-selection-intent:new-gm-mode-draft-pick-candidate-wrestler-alpha:wrestler-alpha:wrestler-alpha:brand-red-placeholder:round-1:pick-3",
  candidateObjectId: "new-gm-mode-draft-pick-candidate:wrestler-alpha",
  sourceFixtureId: "wrestler-alpha",
  sourceWrestlerId: "wrestler-alpha",
  selectingBrandId: "brand-red-placeholder",
  draftRound: 1,
  draftPickNumber: 3,
  validationStatus: "validation-result-created-real-validation-unavailable" as const,
  issueIds: ["validation-not-implemented"] as const
};
const validationResultObject =
  createNewGMModeDraftPickValidationResultObject(explicitInput);

describe("New GM Mode Draft Pick Validation Result Object Validator v0.1", () => {
  it("accepts a generated validation result object as structurally valid", () => {
    const validator = createNewGMModeDraftPickValidationResultObjectValidator({
      validationResultObject
    });

    assert.equal(
      validator.validatorId,
      "new-gm-mode-draft-pick-validation-result-object-validator-v0.1"
    );
    assert.equal(validator.version, "0.1");
    assert.equal(validator.domainObject, true);
    assert.equal(validator.diagnosticsOnly, false);
    assert.equal(validator.playerFacing, false);
    assert.equal(validator.gameplayAffecting, false);
    assert.equal(validator.mutable, false);
    assert.equal(validator.validationOnly, true);
    assert.equal(validator.structurallyValid, true);
    assert.equal(validator.issueCount, 0);
    assert.deepEqual(validator.issues, []);
  });

  it("produces deterministic issue IDs for malformed injected validation-result objects", () => {
    const validator = createNewGMModeDraftPickValidationResultObjectValidator({
      validationResultObject: {}
    });

    assert.equal(validator.structurallyValid, false);
    assert.deepEqual(
      validator.issues.map((issue) => issue.issueId),
      [
        "draft-pick-validation-result-object-id-missing",
        "source-selection-intent-object-id-reference-missing",
        "candidate-object-id-reference-missing",
        "source-fixture-id-reference-missing",
        "source-wrestler-id-reference-missing",
        "selecting-brand-id-reference-missing",
        "draft-round-reference-missing",
        "draft-pick-number-reference-missing",
        "validation-status-unknown",
        "issue-ids-missing",
        "domain-object-flag-invalid",
        "diagnostics-only-flag-invalid",
        "player-facing-flag-invalid",
        "gameplay-affecting-flag-invalid",
        "mutable-flag-invalid",
        "capability-flags-missing"
      ]
    );
  });

  it("detects missing or mismatched draftPickValidationResultObjectId", () => {
    const missingId = JSON.parse(JSON.stringify(validationResultObject));
    const mismatchedId = JSON.parse(JSON.stringify(validationResultObject));
    delete missingId.draftPickValidationResultObjectId;
    mismatchedId.draftPickValidationResultObjectId =
      "new-gm-mode-draft-pick-validation-result:mismatched";

    assert.deepEqual(
      createNewGMModeDraftPickValidationResultObjectValidator({
        validationResultObject: missingId
      }).issues.map((issue) => issue.issueId),
      ["draft-pick-validation-result-object-id-missing"]
    );
    assert.deepEqual(
      createNewGMModeDraftPickValidationResultObjectValidator({
        validationResultObject: mismatchedId
      }).issues.map((issue) => issue.issueId),
      ["draft-pick-validation-result-object-id-not-deterministic"]
    );
  });

  it("detects missing selection intent, candidate, fixture, wrestler, brand, round, and pick references", () => {
    const malformed = JSON.parse(JSON.stringify(validationResultObject));
    delete malformed.sourceSelectionIntentReference.sourceSelectionIntentObjectId;
    delete malformed.sourceCandidateReference.candidateObjectId;
    delete malformed.sourceFixtureReference.sourceFixtureId;
    delete malformed.sourceWrestlerReference.sourceWrestlerId;
    delete malformed.selectingBrandReference.selectingBrandId;
    delete malformed.draftOrderReference.draftRound;
    delete malformed.draftOrderReference.draftPickNumber;

    assert.deepEqual(
      createNewGMModeDraftPickValidationResultObjectValidator({
        validationResultObject: malformed
      }).issues.map((issue) => issue.issueId),
      [
        "source-selection-intent-object-id-reference-missing",
        "candidate-object-id-reference-missing",
        "source-fixture-id-reference-missing",
        "source-wrestler-id-reference-missing",
        "selecting-brand-id-reference-missing",
        "draft-round-reference-missing",
        "draft-pick-number-reference-missing"
      ]
    );
  });

  it("detects unknown validationStatus", () => {
    const malformed = JSON.parse(JSON.stringify(validationResultObject));
    malformed.validationStatus = "candidate-eligible";
    malformed.draftPickValidationResultObjectId =
      "new-gm-mode-draft-pick-validation-result:mismatched";

    assert.deepEqual(
      createNewGMModeDraftPickValidationResultObjectValidator({
        validationResultObject: malformed
      }).issues.map((issue) => issue.issueId),
      [
        "draft-pick-validation-result-object-id-not-deterministic",
        "validation-status-unknown"
      ]
    );
  });

  it("detects missing issueIds", () => {
    const malformed = JSON.parse(JSON.stringify(validationResultObject));
    delete malformed.issueReferences.issueIds;

    assert.deepEqual(
      createNewGMModeDraftPickValidationResultObjectValidator({
        validationResultObject: malformed
      }).issues.map((issue) => issue.issueId),
      ["issue-ids-missing"]
    );
  });

  it("detects issueIds not present in the static issue catalog", () => {
    const malformed = JSON.parse(JSON.stringify(validationResultObject));
    malformed.issueReferences.issueIds = ["unknown-future-issue"];
    malformed.draftPickValidationResultObjectId =
      "new-gm-mode-draft-pick-validation-result:mismatched";

    assert.deepEqual(
      createNewGMModeDraftPickValidationResultObjectValidator({
        validationResultObject: malformed
      }).issues.map((issue) => issue.issueId),
      [
        "draft-pick-validation-result-object-id-not-deterministic",
        "issue-id-not-in-static-catalog"
      ]
    );
  });

  it("detects incorrect domain flags", () => {
    const malformed = JSON.parse(JSON.stringify(validationResultObject));
    malformed.domainObject = false;
    malformed.diagnosticsOnly = true;
    malformed.playerFacing = true;
    malformed.gameplayAffecting = true;
    malformed.mutable = true;

    assert.deepEqual(
      createNewGMModeDraftPickValidationResultObjectValidator({
        validationResultObject: malformed
      }).issues.map((issue) => issue.issueId),
      [
        "domain-object-flag-invalid",
        "diagnostics-only-flag-invalid",
        "player-facing-flag-invalid",
        "gameplay-affecting-flag-invalid",
        "mutable-flag-invalid"
      ]
    );
  });

  it("detects missing or incorrectly enabled capability flags", () => {
    const missingFlags = JSON.parse(JSON.stringify(validationResultObject));
    const enabledFlags = JSON.parse(JSON.stringify(validationResultObject));
    delete missingFlags.capabilityFlags;
    enabledFlags.capabilityFlags.canCreateDraftPick = true;
    enabledFlags.capabilityFlags.canExecuteDraftPick = true;
    enabledFlags.capabilityFlags.canAssignRoster = true;
    enabledFlags.capabilityFlags.canPersistGameplayPayload = true;
    enabledFlags.capabilityFlags.canStartGameplay = true;
    enabledFlags.capabilityFlags.canUnlockWeekOne = true;

    assert.deepEqual(
      createNewGMModeDraftPickValidationResultObjectValidator({
        validationResultObject: missingFlags
      }).issues.map((issue) => issue.issueId),
      ["capability-flags-missing"]
    );
    assert.deepEqual(
      createNewGMModeDraftPickValidationResultObjectValidator({
        validationResultObject: enabledFlags
      }).issues.map((issue) => issue.issueId),
      [
        "capability-flag-invalid",
        "capability-flag-invalid",
        "capability-flag-invalid",
        "capability-flag-invalid",
        "capability-flag-invalid",
        "capability-flag-invalid"
      ]
    );
  });

  it("keeps draft pick creation, execution, assignment, persistence, mutation, gameplay start, and Week 1 unlock blocked", () => {
    const validator = createNewGMModeDraftPickValidationResultObjectValidator({
      validationResultObject
    });

    assert.equal(validator.capabilityFlags.canCreateDraftPick, false);
    assert.equal(validator.capabilityFlags.canExecuteDraftPick, false);
    assert.equal(validator.capabilityFlags.canAssignRoster, false);
    assert.equal(validator.capabilityFlags.canCreateOrMutateRosterState, false);
    assert.equal(validator.capabilityFlags.canPersistGameplayPayload, false);
    assert.equal(validator.capabilityFlags.canStartGameplay, false);
    assert.equal(validator.capabilityFlags.canUnlockWeekOne, false);
  });

  it("does not expose selected wrestler, selected candidate object, draft pick IDs or objects, state, persistence, UI, generated text, GenAI, or action payload fields", () => {
    const validator = createNewGMModeDraftPickValidationResultObjectValidator({
      validationResultObject
    });

    assertForbiddenFieldsAbsent(validator);
    assert.equal(
      existsSync(UNTOUCHED_VALIDATION_RESULT_OBJECT_VALIDATOR_DATABASE),
      false
    );
  });

  it("exports the validation result object validator from the domain barrel", () => {
    assert.equal(
      typeof createNewGMModeDraftPickValidationResultObjectValidator,
      "function"
    );
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed =
      "new-gm-mode-draft-pick-validation-result-object-validator-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeDraftPickValidationResultObjectValidator({
      validationResultObject
    });

    const secondResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });

  it("keeps direct unseeded entropy calls out of source and tests", () => {
    const forbiddenCall = ["Math", "random"].join(".");
    const matches = findTextMatches(["src", "tests"], forbiddenCall);

    assert.deepEqual(matches, []);
  });
});

function assertForbiddenFieldsAbsent(source: unknown): void {
  const forbiddenFields = [
    "selectedWrestler",
    "selectedCandidate",
    "selectedCandidateObject",
    "draftPickId",
    "draftPickObject",
    "draftState",
    "rosterAssignment",
    "rosterState",
    "championshipDivision",
    "match",
    "show",
    "week",
    "save",
    "savePayload",
    "SQLite",
    "sqlite",
    "sqliteConnection",
    "ui",
    "generatedText",
    "genAI",
    "genAIClient"
  ];
  const keys = collectKeys(source);

  for (const field of forbiddenFields) {
    assert.equal(keys.includes(field), false, field);
  }
  assert.equal(
    keys.some((key) => key === "action" || key.endsWith("Action")),
    false
  );
}

function collectKeys(source: unknown): string[] {
  if (Array.isArray(source)) {
    return source.flatMap((item) => collectKeys(item));
  }

  if (!source || typeof source !== "object") {
    return [];
  }

  return Object.entries(source).flatMap(([key, value]) => [
    key,
    ...collectKeys(value)
  ]);
}

function findTextMatches(paths: readonly string[], text: string): string[] {
  return paths.flatMap((path) => scanPath(path, text));
}

function scanPath(path: string, text: string): string[] {
  const stats = statSync(path);

  if (stats.isDirectory()) {
    return readdirSync(path).flatMap((entry) => scanPath(join(path, entry), text));
  }

  if (!path.endsWith(".ts")) {
    return [];
  }

  return readFileSync(path, "utf8").includes(text) ? [path] : [];
}
