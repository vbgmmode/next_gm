import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  createNewGMModeDraftPickCandidateObjects,
  createNewGMModeDraftSelectionIntentObject,
  createNewGMModeDraftSelectionIntentObjectValidator
} from "../src/game/domain/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const UNTOUCHED_DRAFT_SELECTION_INTENT_VALIDATOR_DATABASE =
  "data/saves/__new-gm-mode-draft-selection-intent-validator-should-not-exist.sqlite";
const explicitInput = {
  candidateObjectId: "new-gm-mode-draft-pick-candidate:wrestler-alpha",
  sourceFixtureId: "wrestler-alpha",
  sourceWrestlerId: "wrestler-alpha",
  selectingBrandId: "brand-red-placeholder",
  draftRound: 1,
  draftPickNumber: 3
};
const selectionIntentObject =
  createNewGMModeDraftSelectionIntentObject(explicitInput);
const validation = createNewGMModeDraftSelectionIntentObjectValidator({
  selectionIntentObject
});

describe("New GM Mode Draft Selection Intent Object Validator v0.1", () => {
  it("validates a generated selection intent object as structurally valid", () => {
    assert.equal(
      validation.validatorId,
      "new-gm-mode-draft-selection-intent-object-validator-v0.1"
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

  it("produces deterministic issue IDs for malformed injected intent objects", () => {
    const malformed = cloneIntentObject();
    malformed.draftSelectionIntentObjectId = "bad-id";
    delete malformed.sourceCandidateReference.candidateObjectId;
    malformed.selectingBrandReference.placeholderOnly = false;
    malformed.validationStatus = "validated";
    malformed.domainObject = false;
    malformed.capabilityFlags.canValidateDraftPick = true;
    malformed.selectedWrestler = { wrestlerId: "forbidden" };
    const result = createNewGMModeDraftSelectionIntentObjectValidator({
      selectionIntentObject: malformed
    });

    assert.equal(result.structurallyValid, false);
    assert.deepEqual(issueIds(result), [
      "draft-selection-intent-object-id-format-invalid",
      "candidate-object-id-reference-missing",
      "selecting-brand-reference-not-inert",
      "selection-intent-status-invalid",
      "domain-object-flag-invalid",
      "capability-flag-enabled",
      "forbidden-field-present"
    ]);
    assert.deepEqual(
      result.issues.map((issue) => issue.fieldId),
      [
        "draftSelectionIntentObjectId",
        "sourceCandidateReference.candidateObjectId",
        "selectingBrandReference.placeholderOnly",
        "validationStatus",
        "domainObject",
        "capabilityFlags.canValidateDraftPick",
        "selectedWrestler"
      ]
    );
  });

  it("detects missing draftSelectionIntentObjectId", () => {
    const malformed = cloneIntentObject();
    delete malformed.draftSelectionIntentObjectId;
    const result = createNewGMModeDraftSelectionIntentObjectValidator({
      selectionIntentObject: malformed
    });

    assert.deepEqual(issueIds(result), [
      "draft-selection-intent-object-id-missing"
    ]);
  });

  it("detects non-deterministic draftSelectionIntentObjectId", () => {
    const malformed = cloneIntentObject();
    malformed.draftSelectionIntentObjectId =
      "new-gm-mode-draft-selection-intent:wrong:wrestler-alpha:wrestler-alpha:brand-red-placeholder:round-1:pick-3";
    const result = createNewGMModeDraftSelectionIntentObjectValidator({
      selectionIntentObject: malformed
    });

    assert.deepEqual(issueIds(result), [
      "draft-selection-intent-object-id-not-deterministic"
    ]);
  });

  it("detects missing candidate, fixture, wrestler, brand, round, and pick references", () => {
    const malformed = cloneIntentObject();
    delete malformed.sourceCandidateReference.candidateObjectId;
    delete malformed.sourceFixtureReference.sourceFixtureId;
    delete malformed.sourceWrestlerReference.sourceWrestlerId;
    delete malformed.selectingBrandReference.selectingBrandId;
    delete malformed.draftOrderReference.draftRound;
    delete malformed.draftOrderReference.draftPickNumber;
    const result = createNewGMModeDraftSelectionIntentObjectValidator({
      selectionIntentObject: malformed
    });

    assert.deepEqual(issueIds(result), [
      "candidate-object-id-reference-missing",
      "source-fixture-id-reference-missing",
      "source-wrestler-id-reference-missing",
      "selecting-brand-id-reference-missing",
      "draft-round-reference-missing",
      "draft-pick-number-reference-missing"
    ]);
  });

  it("detects incorrect status", () => {
    const malformed = cloneIntentObject();
    malformed.validationStatus = "selection-intent-validated";
    const result = createNewGMModeDraftSelectionIntentObjectValidator({
      selectionIntentObject: malformed
    });

    assert.deepEqual(issueIds(result), ["selection-intent-status-invalid"]);
  });

  it("detects incorrect domain flags", () => {
    const malformed = cloneIntentObject();
    malformed.domainObject = false;
    malformed.diagnosticsOnly = true;
    malformed.playerFacing = true;
    malformed.gameplayAffecting = true;
    malformed.mutable = true;
    const result = createNewGMModeDraftSelectionIntentObjectValidator({
      selectionIntentObject: malformed
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
    const missingFlags = cloneIntentObject();
    delete missingFlags.capabilityFlags;
    const missingResult = createNewGMModeDraftSelectionIntentObjectValidator({
      selectionIntentObject: missingFlags
    });

    assert.deepEqual(issueIds(missingResult), ["capability-flags-missing"]);

    const enabledFlags = cloneIntentObject();
    enabledFlags.capabilityFlags.canValidateDraftPick = true;
    enabledFlags.capabilityFlags.canCreateDraftPick = true;
    enabledFlags.capabilityFlags.canExecuteDraftPick = true;
    enabledFlags.capabilityFlags.canAssignRoster = true;
    enabledFlags.capabilityFlags.canCreateOrMutateRosterState = true;
    enabledFlags.capabilityFlags.canPersistGameplayPayload = true;
    enabledFlags.capabilityFlags.canWriteDatabase = true;
    enabledFlags.capabilityFlags.canStartGameplay = true;
    enabledFlags.capabilityFlags.canUnlockWeekOne = true;
    const enabledResult = createNewGMModeDraftSelectionIntentObjectValidator({
      selectionIntentObject: enabledFlags
    });

    assert.deepEqual(issueIds(enabledResult), [
      "capability-flag-enabled",
      "capability-flag-enabled",
      "capability-flag-enabled",
      "capability-flag-enabled",
      "capability-flag-enabled",
      "capability-flag-enabled",
      "capability-flag-enabled",
      "capability-flag-enabled",
      "capability-flag-enabled"
    ]);
    assert.deepEqual(
      enabledResult.issues.map((issue) => issue.fieldId),
      [
        "capabilityFlags.canCreateDraftPick",
        "capabilityFlags.canValidateDraftPick",
        "capabilityFlags.canExecuteDraftPick",
        "capabilityFlags.canAssignRoster",
        "capabilityFlags.canCreateOrMutateRosterState",
        "capabilityFlags.canPersistGameplayPayload",
        "capabilityFlags.canWriteDatabase",
        "capabilityFlags.canStartGameplay",
        "capabilityFlags.canUnlockWeekOne"
      ]
    );
  });

  it("proves references remain inert and no candidate list inspection occurs", () => {
    const candidateSet = createNewGMModeDraftPickCandidateObjects();
    const candidateSnapshot = JSON.stringify(candidateSet);
    const objectWithUnusedCandidateSet = {
      ...selectionIntentObject,
      candidateSet
    };
    const result = createNewGMModeDraftSelectionIntentObjectValidator({
      selectionIntentObject: objectWithUnusedCandidateSet
    });

    assert.equal(result.structurallyValid, true);
    assert.equal(JSON.stringify(candidateSet), candidateSnapshot);
    assert.deepEqual(selectionIntentObject.sourceCandidateReference, {
      candidateObjectId: explicitInput.candidateObjectId
    });
    assert.deepEqual(selectionIntentObject.selectingBrandReference, {
      selectingBrandId: explicitInput.selectingBrandId,
      placeholderOnly: true
    });
    assert.deepEqual(selectionIntentObject.draftOrderReference, {
      draftRound: explicitInput.draftRound,
      draftPickNumber: explicitInput.draftPickNumber,
      placeholderOnly: true
    });
  });

  it("does not expose selected wrestler, selected candidate object, draft pick result, state, persistence, UI, generated text, GenAI, or action payload fields", () => {
    assertForbiddenFieldsAbsent(validation);
    assertForbiddenFieldsAbsent(selectionIntentObject);
    assert.equal(
      existsSync(UNTOUCHED_DRAFT_SELECTION_INTENT_VALIDATOR_DATABASE),
      false
    );
  });

  it("exports the validator from the domain barrel", () => {
    assert.equal(
      typeof createNewGMModeDraftSelectionIntentObjectValidator,
      "function"
    );
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed =
      "new-gm-mode-draft-selection-intent-object-validator-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeDraftSelectionIntentObjectValidator({
      selectionIntentObject
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

function cloneIntentObject(): any {
  return JSON.parse(JSON.stringify(selectionIntentObject));
}

function issueIds(result: {
  readonly issues: readonly { readonly issueId: string }[];
}): readonly string[] {
  return result.issues.map((issue) => issue.issueId);
}

function assertForbiddenFieldsAbsent(source: unknown): void {
  const forbiddenFields = [
    "selectedWrestler",
    "selectedCandidate",
    "selectedCandidateObject",
    "draftPickId",
    "draftPickResult",
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
