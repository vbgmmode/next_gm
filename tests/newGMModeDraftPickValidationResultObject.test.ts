import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  createNewGMModeDraftPickCandidateObjects,
  createNewGMModeDraftPickValidationIssueCatalog,
  createNewGMModeDraftPickValidationResultObject
} from "../src/game/domain/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const UNTOUCHED_VALIDATION_RESULT_OBJECT_DATABASE =
  "data/saves/__new-gm-mode-draft-pick-validation-result-object-should-not-exist.sqlite";
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

describe("New GM Mode Draft Pick Validation Result Object v0.1", () => {
  it("creates a frozen read-only validation result object from explicit injected input", () => {
    assert.equal(
      validationResultObject.draftPickValidationResultObjectId,
      "new-gm-mode-draft-pick-validation-result:new-gm-mode-draft-selection-intent-new-gm-mode-draft-pick-candidate-wrestler-alpha-wrestler-alpha-wrestler-alpha-brand-red-placeholder-round-1-pick-3:new-gm-mode-draft-pick-candidate-wrestler-alpha:wrestler-alpha:wrestler-alpha:brand-red-placeholder:round-1:pick-3:validation-result-created-real-validation-unavailable:issues-validation-not-implemented"
    );
    assert.equal(validationResultObject.version, "0.1");
    assert.equal(validationResultObject.domainObject, true);
    assert.equal(validationResultObject.diagnosticsOnly, false);
    assert.equal(validationResultObject.playerFacing, false);
    assert.equal(validationResultObject.gameplayAffecting, false);
    assert.equal(validationResultObject.mutable, false);
    assert.equal(Object.isFrozen(validationResultObject), true);
    assert.equal(
      Object.isFrozen(validationResultObject.sourceSelectionIntentReference),
      true
    );
    assert.equal(
      Object.isFrozen(validationResultObject.sourceCandidateReference),
      true
    );
    assert.equal(
      Object.isFrozen(validationResultObject.sourceFixtureReference),
      true
    );
    assert.equal(
      Object.isFrozen(validationResultObject.sourceWrestlerReference),
      true
    );
    assert.equal(
      Object.isFrozen(validationResultObject.selectingBrandReference),
      true
    );
    assert.equal(
      Object.isFrozen(validationResultObject.draftOrderReference),
      true
    );
    assert.equal(Object.isFrozen(validationResultObject.issueReferences), true);
    assert.equal(
      Object.isFrozen(validationResultObject.issueReferences.issueIds),
      true
    );
  });

  it("produces a stable deterministic result object ID", () => {
    const first = createNewGMModeDraftPickValidationResultObject(explicitInput);
    const second = createNewGMModeDraftPickValidationResultObject({
      ...explicitInput
    });
    const differentIssues = createNewGMModeDraftPickValidationResultObject({
      ...explicitInput,
      issueIds: ["selection-intent-invalid", "validation-not-implemented"]
    });

    assert.equal(
      first.draftPickValidationResultObjectId,
      second.draftPickValidationResultObjectId
    );
    assert.notEqual(
      first.draftPickValidationResultObjectId,
      differentIssues.draftPickValidationResultObjectId
    );
  });

  it("preserves selection intent, candidate, fixture, wrestler, brand, round, and pick references as inert references", () => {
    assert.deepEqual(validationResultObject.sourceSelectionIntentReference, {
      sourceSelectionIntentObjectId: explicitInput.sourceSelectionIntentObjectId
    });
    assert.deepEqual(validationResultObject.sourceCandidateReference, {
      candidateObjectId: explicitInput.candidateObjectId
    });
    assert.deepEqual(validationResultObject.sourceFixtureReference, {
      sourceFixtureId: explicitInput.sourceFixtureId
    });
    assert.deepEqual(validationResultObject.sourceWrestlerReference, {
      sourceWrestlerId: explicitInput.sourceWrestlerId
    });
    assert.deepEqual(validationResultObject.selectingBrandReference, {
      selectingBrandId: explicitInput.selectingBrandId,
      placeholderOnly: true
    });
    assert.deepEqual(validationResultObject.draftOrderReference, {
      draftRound: explicitInput.draftRound,
      draftPickNumber: explicitInput.draftPickNumber,
      placeholderOnly: true
    });
  });

  it("preserves injected validation status without inferring it", () => {
    const blockedObject = createNewGMModeDraftPickValidationResultObject({
      ...explicitInput,
      validationStatus: "validation-result-blocked-real-validation-unavailable",
      issueIds: []
    });

    assert.equal(
      validationResultObject.validationStatus,
      "validation-result-created-real-validation-unavailable"
    );
    assert.equal(
      blockedObject.validationStatus,
      "validation-result-blocked-real-validation-unavailable"
    );
    assert.deepEqual(blockedObject.issueReferences.issueIds, []);
  });

  it("preserves injected issue IDs without evaluating them", () => {
    const object = createNewGMModeDraftPickValidationResultObject({
      ...explicitInput,
      candidateObjectId: "not-looked-up-or-evaluated",
      issueIds: ["candidate-not-found", "candidate-ineligible"]
    });

    assert.deepEqual(object.issueReferences, {
      issueIds: ["candidate-not-found", "candidate-ineligible"],
      staticCatalogOnly: true,
      evaluatedNow: false
    });
    assert.deepEqual(object.sourceCandidateReference, {
      candidateObjectId: "not-looked-up-or-evaluated"
    });
  });

  it("allows issue IDs from the static issue catalog", () => {
    const catalog = createNewGMModeDraftPickValidationIssueCatalog();
    const object = createNewGMModeDraftPickValidationResultObject({
      ...explicitInput,
      issueIds: catalog.issueIds
    });

    assert.deepEqual(object.issueReferences.issueIds, catalog.issueIds);
    assert.equal(object.issueReferences.staticCatalogOnly, true);
    assert.equal(object.issueReferences.evaluatedNow, false);
  });

  it("keeps draft pick creation, execution, assignment, persistence, mutation, gameplay start, and Week 1 unlock blocked", () => {
    assert.deepEqual(validationResultObject.capabilityFlags, {
      validationResultShapeDefined: true,
      canCreateRealValidationResult: false,
      canValidateCandidateEligibility: false,
      canValidateDraftPick: false,
      canCreateDraftPick: false,
      canExecuteDraftPick: false,
      canAssignRoster: false,
      canCreateOrMutateRosterState: false,
      canAssignChampionshipOrDivision: false,
      canCreateMatchShowOrWeekState: false,
      canPersistGameplayPayload: false,
      canWriteDatabase: false,
      canStartGameplay: false,
      canUnlockWeekOne: false,
      canCreateUserInterface: false,
      canCreateGeneratedText: false,
      canUseGenAI: false
    });
  });

  it("does not inspect candidate fixtures, choose candidates, validate eligibility, or create draft picks", () => {
    const candidateSet = createNewGMModeDraftPickCandidateObjects();
    const candidateSnapshot = JSON.stringify(candidateSet);
    const object = createNewGMModeDraftPickValidationResultObject({
      ...explicitInput,
      sourceSelectionIntentObjectId: "explicit-intent-not-derived",
      candidateObjectId: "explicit-candidate-not-from-list",
      sourceFixtureId: "explicit-fixture-not-from-list",
      sourceWrestlerId: "explicit-wrestler-not-from-list",
      candidateSet
    } as any);

    assert.equal(JSON.stringify(candidateSet), candidateSnapshot);
    assert.deepEqual(object.sourceSelectionIntentReference, {
      sourceSelectionIntentObjectId: "explicit-intent-not-derived"
    });
    assert.deepEqual(object.sourceCandidateReference, {
      candidateObjectId: "explicit-candidate-not-from-list"
    });
    assert.deepEqual(object.sourceFixtureReference, {
      sourceFixtureId: "explicit-fixture-not-from-list"
    });
    assert.deepEqual(object.sourceWrestlerReference, {
      sourceWrestlerId: "explicit-wrestler-not-from-list"
    });
    assert.equal(object.capabilityFlags.canCreateDraftPick, false);
  });

  it("does not expose selected wrestler, selected candidate object, draft pick IDs or objects, state, persistence, UI, generated text, GenAI, or action payload fields", () => {
    assertForbiddenFieldsAbsent(validationResultObject);
    assert.equal(existsSync(UNTOUCHED_VALIDATION_RESULT_OBJECT_DATABASE), false);
  });

  it("exports the validation result object factory from the domain barrel", () => {
    assert.equal(
      typeof createNewGMModeDraftPickValidationResultObject,
      "function"
    );
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed =
      "new-gm-mode-draft-pick-validation-result-object-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeDraftPickValidationResultObject(explicitInput);

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
