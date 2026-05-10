import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  createNewGMModeDraftPickCandidateObjects,
  createNewGMModeDraftSelectionIntentObject
} from "../src/game/domain/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const UNTOUCHED_DRAFT_SELECTION_INTENT_OBJECT_DATABASE =
  "data/saves/__new-gm-mode-draft-selection-intent-object-should-not-exist.sqlite";
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

describe("New GM Mode Draft Selection Intent Object v0.1", () => {
  it("creates a frozen read-only selection intent object from explicit injected input", () => {
    assert.equal(
      selectionIntentObject.draftSelectionIntentObjectId,
      "new-gm-mode-draft-selection-intent:new-gm-mode-draft-pick-candidate-wrestler-alpha:wrestler-alpha:wrestler-alpha:brand-red-placeholder:round-1:pick-3"
    );
    assert.equal(selectionIntentObject.version, "0.1");
    assert.equal(selectionIntentObject.domainObject, true);
    assert.equal(selectionIntentObject.diagnosticsOnly, false);
    assert.equal(selectionIntentObject.playerFacing, false);
    assert.equal(selectionIntentObject.gameplayAffecting, false);
    assert.equal(selectionIntentObject.mutable, false);
    assert.equal(Object.isFrozen(selectionIntentObject), true);
    assert.equal(
      Object.isFrozen(selectionIntentObject.sourceCandidateReference),
      true
    );
    assert.equal(
      Object.isFrozen(selectionIntentObject.sourceFixtureReference),
      true
    );
    assert.equal(
      Object.isFrozen(selectionIntentObject.sourceWrestlerReference),
      true
    );
    assert.equal(
      Object.isFrozen(selectionIntentObject.selectingBrandReference),
      true
    );
    assert.equal(Object.isFrozen(selectionIntentObject.draftOrderReference), true);
  });

  it("produces a stable deterministic selection intent ID from injected input", () => {
    const first = createNewGMModeDraftSelectionIntentObject(explicitInput);
    const second = createNewGMModeDraftSelectionIntentObject({
      ...explicitInput
    });
    const differentPick = createNewGMModeDraftSelectionIntentObject({
      ...explicitInput,
      draftPickNumber: 4
    });

    assert.equal(first.draftSelectionIntentObjectId, second.draftSelectionIntentObjectId);
    assert.notEqual(
      first.draftSelectionIntentObjectId,
      differentPick.draftSelectionIntentObjectId
    );
  });

  it("preserves candidate, fixture, wrestler, brand, round, and pick references as inert references only", () => {
    assert.deepEqual(selectionIntentObject.sourceCandidateReference, {
      candidateObjectId: explicitInput.candidateObjectId
    });
    assert.deepEqual(selectionIntentObject.sourceFixtureReference, {
      sourceFixtureId: explicitInput.sourceFixtureId
    });
    assert.deepEqual(selectionIntentObject.sourceWrestlerReference, {
      sourceWrestlerId: explicitInput.sourceWrestlerId
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

  it("reports validation unavailable", () => {
    assert.equal(
      selectionIntentObject.validationStatus,
      "selection-intent-created-validation-unavailable"
    );
  });

  it("keeps validation, draft pick creation, execution, assignment, persistence, mutation, gameplay start, and Week 1 unlock blocked", () => {
    assert.deepEqual(selectionIntentObject.capabilityFlags, {
      candidateObjectsAvailable: true,
      candidateReadinessSummaryAvailable: true,
      draftSelectionIntentBoundaryAvailable: true,
      canCreateSelectionIntent: false,
      canCreateDraftPick: false,
      canValidateDraftPick: false,
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

  it("does not inspect, choose from, or mutate the candidate list", () => {
    const candidateSet = createNewGMModeDraftPickCandidateObjects();
    const candidateSnapshot = JSON.stringify(candidateSet);
    const object = createNewGMModeDraftSelectionIntentObject({
      ...explicitInput,
      candidateObjectId: "explicit-candidate-not-from-list",
      sourceFixtureId: "explicit-fixture-not-from-list",
      sourceWrestlerId: "explicit-wrestler-not-from-list",
      candidateSet
    } as any);

    assert.equal(JSON.stringify(candidateSet), candidateSnapshot);
    assert.deepEqual(object.sourceCandidateReference, {
      candidateObjectId: "explicit-candidate-not-from-list"
    });
    assert.deepEqual(object.sourceFixtureReference, {
      sourceFixtureId: "explicit-fixture-not-from-list"
    });
    assert.deepEqual(object.sourceWrestlerReference, {
      sourceWrestlerId: "explicit-wrestler-not-from-list"
    });
  });

  it("does not expose selected wrestler, selected candidate object, draft pick result, state, persistence, UI, generated text, GenAI, or action payload fields", () => {
    assertForbiddenFieldsAbsent(selectionIntentObject);
    assert.equal(
      existsSync(UNTOUCHED_DRAFT_SELECTION_INTENT_OBJECT_DATABASE),
      false
    );
  });

  it("exports the object factory from the domain barrel", () => {
    assert.equal(typeof createNewGMModeDraftSelectionIntentObject, "function");
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed =
      "new-gm-mode-draft-selection-intent-object-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeDraftSelectionIntentObject(explicitInput);

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
