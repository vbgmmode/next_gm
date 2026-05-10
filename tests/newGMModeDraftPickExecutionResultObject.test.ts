import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  createNewGMModeDraftPickExecutionBlockedReasonCatalog,
  createNewGMModeDraftPickExecutionResultObject
} from "../src/game/domain/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const UNTOUCHED_EXECUTION_RESULT_OBJECT_DATABASE =
  "data/saves/__new-gm-mode-draft-pick-execution-result-object-should-not-exist.sqlite";
const explicitInput = {
  sourceDraftPickObjectId: "new-gm-mode-draft-pick-object:alpha",
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
  executionStatus:
    "draft-pick-execution-result-created-mutation-unavailable" as const,
  blockedReasonIds: [
    "draft-state-unavailable",
    "draft-pick-execution-not-implemented"
  ] as const
};
const executionResultObject =
  createNewGMModeDraftPickExecutionResultObject(explicitInput);

describe("New GM Mode Draft Pick Execution Result Object v0.1", () => {
  it("creates a frozen read-only object from explicit injected input", () => {
    assert.equal(executionResultObject.version, "0.1");
    assert.equal(executionResultObject.domainObject, true);
    assert.equal(executionResultObject.diagnosticsOnly, false);
    assert.equal(executionResultObject.playerFacing, false);
    assert.equal(executionResultObject.gameplayAffecting, false);
    assert.equal(executionResultObject.mutable, false);
    assert.equal(Object.isFrozen(executionResultObject), true);
    assert.equal(
      Object.isFrozen(executionResultObject.sourceDraftPickReference),
      true
    );
    assert.equal(
      Object.isFrozen(executionResultObject.sourceValidationResultReference),
      true
    );
    assert.equal(
      Object.isFrozen(executionResultObject.sourceSelectionIntentReference),
      true
    );
    assert.equal(
      Object.isFrozen(executionResultObject.sourceCandidateReference),
      true
    );
    assert.equal(
      Object.isFrozen(executionResultObject.sourceFixtureReference),
      true
    );
    assert.equal(
      Object.isFrozen(executionResultObject.sourceWrestlerReference),
      true
    );
    assert.equal(
      Object.isFrozen(executionResultObject.selectingBrandReference),
      true
    );
    assert.equal(
      Object.isFrozen(executionResultObject.draftOrderReference),
      true
    );
    assert.equal(
      Object.isFrozen(executionResultObject.blockedReasonReferences),
      true
    );
    assert.equal(
      Object.isFrozen(
        executionResultObject.blockedReasonReferences.blockedReasonIds
      ),
      true
    );
  });

  it("produces a stable deterministic draftPickExecutionResultObjectId", () => {
    const first = createNewGMModeDraftPickExecutionResultObject(explicitInput);
    const second = createNewGMModeDraftPickExecutionResultObject({
      ...explicitInput
    });
    const differentReasons = createNewGMModeDraftPickExecutionResultObject({
      ...explicitInput,
      blockedReasonIds: ["draft-state-unavailable"]
    });

    assert.equal(
      first.draftPickExecutionResultObjectId,
      second.draftPickExecutionResultObjectId
    );
    assert.notEqual(
      first.draftPickExecutionResultObjectId,
      differentReasons.draftPickExecutionResultObjectId
    );
    assert.equal(
      first.draftPickExecutionResultObjectId,
      "new-gm-mode-draft-pick-execution-result:new-gm-mode-draft-pick-object-alpha:new-gm-mode-draft-pick-validation-result-alpha:new-gm-mode-draft-selection-intent-alpha:new-gm-mode-draft-pick-candidate-wrestler-alpha:wrestler-alpha:wrestler-alpha:brand-red-placeholder:round-1:pick-3:draft-pick-execution-result-created-mutation-unavailable:blocked-reasons-draft-state-unavailable-draft-pick-execution-not-implemented"
    );
  });

  it("preserves all references as inert references", () => {
    assert.deepEqual(executionResultObject.sourceDraftPickReference, {
      sourceDraftPickObjectId: explicitInput.sourceDraftPickObjectId
    });
    assert.deepEqual(executionResultObject.sourceValidationResultReference, {
      sourceValidationResultObjectId:
        explicitInput.sourceValidationResultObjectId
    });
    assert.deepEqual(executionResultObject.sourceSelectionIntentReference, {
      sourceSelectionIntentObjectId:
        explicitInput.sourceSelectionIntentObjectId
    });
    assert.deepEqual(executionResultObject.sourceCandidateReference, {
      candidateObjectId: explicitInput.candidateObjectId
    });
    assert.deepEqual(executionResultObject.sourceFixtureReference, {
      sourceFixtureId: explicitInput.sourceFixtureId
    });
    assert.deepEqual(executionResultObject.sourceWrestlerReference, {
      sourceWrestlerId: explicitInput.sourceWrestlerId
    });
    assert.deepEqual(executionResultObject.selectingBrandReference, {
      selectingBrandId: explicitInput.selectingBrandId,
      placeholderOnly: true
    });
    assert.deepEqual(executionResultObject.draftOrderReference, {
      draftRound: explicitInput.draftRound,
      draftPickNumber: explicitInput.draftPickNumber,
      placeholderOnly: true
    });
  });

  it("preserves injected executionStatus and blockedReasonIds without evaluating them", () => {
    const blockedObject = createNewGMModeDraftPickExecutionResultObject({
      ...explicitInput,
      candidateObjectId: "explicit-candidate-not-inspected",
      executionStatus:
        "draft-pick-execution-result-blocked-execution-unavailable",
      blockedReasonIds: [
        "draft-pick-object-invalid",
        "roster-assignment-unavailable"
      ]
    });

    assert.equal(
      executionResultObject.executionStatus,
      "draft-pick-execution-result-created-mutation-unavailable"
    );
    assert.equal(
      blockedObject.executionStatus,
      "draft-pick-execution-result-blocked-execution-unavailable"
    );
    assert.deepEqual(blockedObject.blockedReasonReferences, {
      blockedReasonIds: [
        "draft-pick-object-invalid",
        "roster-assignment-unavailable"
      ],
      staticCatalogOnly: true,
      evaluatedNow: false
    });
    assert.deepEqual(blockedObject.sourceCandidateReference, {
      candidateObjectId: "explicit-candidate-not-inspected"
    });
  });

  it("allows blocked reason IDs from the static Draft Pick Execution Blocked Reason Catalog", () => {
    const catalog = createNewGMModeDraftPickExecutionBlockedReasonCatalog();
    const object = createNewGMModeDraftPickExecutionResultObject({
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

  it("keeps draft state mutation, roster assignment, persistence, gameplay start, and Week 1 unlock blocked", () => {
    assert.deepEqual(executionResultObject.capabilityFlags, {
      executionResultObjectAvailable: true,
      canExecuteDraftPick: false,
      canMutateDraftState: false,
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
    const object = createNewGMModeDraftPickExecutionResultObject({
      ...explicitInput,
      candidateSet
    } as any);

    assert.equal(JSON.stringify(candidateSet), snapshot);
    assert.deepEqual(object.sourceCandidateReference, {
      candidateObjectId: explicitInput.candidateObjectId
    });
    assertForbiddenFieldsAbsent(executionResultObject);
    assert.equal(existsSync(UNTOUCHED_EXECUTION_RESULT_OBJECT_DATABASE), false);
  });

  it("exports the execution result object factory from the domain barrel", () => {
    assert.equal(
      typeof createNewGMModeDraftPickExecutionResultObject,
      "function"
    );
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed =
      "new-gm-mode-draft-pick-execution-result-object-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeDraftPickExecutionResultObject(explicitInput);

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
