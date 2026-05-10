import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  createNewGMModeDraftPickObject,
  createNewGMModeDraftPickObjectBlockedReasonCatalog
} from "../src/game/domain/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const UNTOUCHED_DRAFT_PICK_OBJECT_DATABASE =
  "data/saves/__new-gm-mode-draft-pick-object-should-not-exist.sqlite";
const explicitInput = {
  sourceValidationResultObjectId:
    "new-gm-mode-draft-pick-validation-result:alpha",
  sourceSelectionIntentObjectId:
    "new-gm-mode-draft-selection-intent:alpha",
  candidateObjectId: "new-gm-mode-draft-pick-candidate:wrestler-alpha",
  sourceFixtureId: "wrestler-alpha",
  sourceWrestlerId: "wrestler-alpha",
  selectingBrandId: "brand-red-placeholder",
  draftRound: 1,
  draftPickNumber: 3,
  draftPickStatus: "draft-pick-object-created-execution-unavailable" as const,
  blockedReasonIds: [
    "draft-state-unavailable",
    "draft-pick-creation-not-implemented"
  ] as const
};
const draftPickObject = createNewGMModeDraftPickObject(explicitInput);

describe("New GM Mode Draft Pick Object v0.1", () => {
  it("creates a frozen read-only object from explicit injected input", () => {
    assert.equal(draftPickObject.version, "0.1");
    assert.equal(draftPickObject.domainObject, true);
    assert.equal(draftPickObject.diagnosticsOnly, false);
    assert.equal(draftPickObject.playerFacing, false);
    assert.equal(draftPickObject.gameplayAffecting, false);
    assert.equal(draftPickObject.mutable, false);
    assert.equal(Object.isFrozen(draftPickObject), true);
    assert.equal(
      Object.isFrozen(draftPickObject.sourceValidationResultReference),
      true
    );
    assert.equal(
      Object.isFrozen(draftPickObject.sourceSelectionIntentReference),
      true
    );
    assert.equal(Object.isFrozen(draftPickObject.sourceCandidateReference), true);
    assert.equal(Object.isFrozen(draftPickObject.sourceFixtureReference), true);
    assert.equal(Object.isFrozen(draftPickObject.sourceWrestlerReference), true);
    assert.equal(Object.isFrozen(draftPickObject.selectingBrandReference), true);
    assert.equal(Object.isFrozen(draftPickObject.draftOrderReference), true);
    assert.equal(Object.isFrozen(draftPickObject.blockedReasonReferences), true);
    assert.equal(
      Object.isFrozen(draftPickObject.blockedReasonReferences.blockedReasonIds),
      true
    );
  });

  it("produces a stable deterministic draftPickObjectId", () => {
    const first = createNewGMModeDraftPickObject(explicitInput);
    const second = createNewGMModeDraftPickObject({ ...explicitInput });
    const differentReasons = createNewGMModeDraftPickObject({
      ...explicitInput,
      blockedReasonIds: ["draft-state-unavailable"]
    });

    assert.equal(first.draftPickObjectId, second.draftPickObjectId);
    assert.notEqual(first.draftPickObjectId, differentReasons.draftPickObjectId);
    assert.equal(
      first.draftPickObjectId,
      "new-gm-mode-draft-pick-object:new-gm-mode-draft-pick-validation-result-alpha:new-gm-mode-draft-selection-intent-alpha:new-gm-mode-draft-pick-candidate-wrestler-alpha:wrestler-alpha:wrestler-alpha:brand-red-placeholder:round-1:pick-3:draft-pick-object-created-execution-unavailable:blocked-reasons-draft-state-unavailable-draft-pick-creation-not-implemented"
    );
  });

  it("preserves validation result, selection intent, candidate, fixture, wrestler, brand, round, and pick references as inert references", () => {
    assert.deepEqual(draftPickObject.sourceValidationResultReference, {
      sourceValidationResultObjectId: explicitInput.sourceValidationResultObjectId
    });
    assert.deepEqual(draftPickObject.sourceSelectionIntentReference, {
      sourceSelectionIntentObjectId: explicitInput.sourceSelectionIntentObjectId
    });
    assert.deepEqual(draftPickObject.sourceCandidateReference, {
      candidateObjectId: explicitInput.candidateObjectId
    });
    assert.deepEqual(draftPickObject.sourceFixtureReference, {
      sourceFixtureId: explicitInput.sourceFixtureId
    });
    assert.deepEqual(draftPickObject.sourceWrestlerReference, {
      sourceWrestlerId: explicitInput.sourceWrestlerId
    });
    assert.deepEqual(draftPickObject.selectingBrandReference, {
      selectingBrandId: explicitInput.selectingBrandId,
      placeholderOnly: true
    });
    assert.deepEqual(draftPickObject.draftOrderReference, {
      draftRound: explicitInput.draftRound,
      draftPickNumber: explicitInput.draftPickNumber,
      placeholderOnly: true
    });
  });

  it("preserves injected draftPickStatus without inferring it", () => {
    const blockedObject = createNewGMModeDraftPickObject({
      ...explicitInput,
      draftPickStatus: "draft-pick-object-blocked-creation-unavailable",
      blockedReasonIds: []
    });

    assert.equal(
      draftPickObject.draftPickStatus,
      "draft-pick-object-created-execution-unavailable"
    );
    assert.equal(
      blockedObject.draftPickStatus,
      "draft-pick-object-blocked-creation-unavailable"
    );
  });

  it("preserves injected blockedReasonIds without evaluating them", () => {
    const object = createNewGMModeDraftPickObject({
      ...explicitInput,
      candidateObjectId: "explicit-candidate-not-inspected",
      blockedReasonIds: [
        "candidate-reference-missing",
        "duplicate-pick-check-unavailable"
      ]
    });

    assert.deepEqual(object.blockedReasonReferences, {
      blockedReasonIds: [
        "candidate-reference-missing",
        "duplicate-pick-check-unavailable"
      ],
      staticCatalogOnly: true,
      evaluatedNow: false
    });
    assert.deepEqual(object.sourceCandidateReference, {
      candidateObjectId: "explicit-candidate-not-inspected"
    });
  });

  it("allows blocked reason IDs from the static Draft Pick Object Blocked Reason Catalog", () => {
    const catalog = createNewGMModeDraftPickObjectBlockedReasonCatalog();
    const object = createNewGMModeDraftPickObject({
      ...explicitInput,
      blockedReasonIds: catalog.blockedReasonIds
    });

    assert.deepEqual(
      object.blockedReasonReferences.blockedReasonIds,
      catalog.blockedReasonIds
    );
    assert.equal(object.blockedReasonReferences.staticCatalogOnly, true);
    assert.equal(object.blockedReasonReferences.evaluatedNow, false);
  });

  it("keeps execution, roster assignment, persistence, mutation, gameplay start, and Week 1 unlock blocked", () => {
    assert.deepEqual(draftPickObject.capabilityFlags, {
      draftPickObjectAvailable: true,
      canExecuteDraftPick: false,
      canAssignRoster: false,
      canCreateOrMutateRosterState: false,
      canAssignChampionshipOrDivision: false,
      canCreateMatchShowOrWeekState: false,
      canPersistGameplayPayload: false,
      canWriteDatabase: false,
      canMutateState: false,
      canStartGameplay: false,
      canUnlockWeekOne: false,
      canCreateUserInterface: false,
      canCreateGeneratedText: false,
      canUseGenAI: false
    });
  });

  it("does not inspect candidate lists or expose forbidden state, persistence, UI, generated text, GenAI, or action payload fields", () => {
    const candidateSet = Object.freeze([{ candidateObjectId: "untouched" }]);
    const snapshot = JSON.stringify(candidateSet);
    const object = createNewGMModeDraftPickObject({
      ...explicitInput,
      candidateSet
    } as any);

    assert.equal(JSON.stringify(candidateSet), snapshot);
    assert.deepEqual(object.sourceCandidateReference, {
      candidateObjectId: explicitInput.candidateObjectId
    });
    assertForbiddenFieldsAbsent(draftPickObject);
    assert.equal(existsSync(UNTOUCHED_DRAFT_PICK_OBJECT_DATABASE), false);
  });

  it("exports the draft pick object factory from the domain barrel", () => {
    assert.equal(typeof createNewGMModeDraftPickObject, "function");
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "new-gm-mode-draft-pick-object-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeDraftPickObject(explicitInput);

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
