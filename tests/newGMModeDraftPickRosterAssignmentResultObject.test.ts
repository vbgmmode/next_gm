import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  createNewGMModeDraftPickRosterAssignmentBlockedReasonCatalog,
  createNewGMModeDraftPickRosterAssignmentResultObject
} from "../src/game/domain/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const UNTOUCHED_ASSIGNMENT_RESULT_OBJECT_DATABASE =
  "data/saves/__new-gm-mode-draft-pick-roster-assignment-result-object-should-not-exist.sqlite";
const explicitInput = {
  sourceExecutionResultObjectId:
    "new-gm-mode-draft-pick-execution-result:alpha",
  sourceDraftPickObjectId: "new-gm-mode-draft-pick-object:alpha",
  candidateObjectId: "new-gm-mode-draft-pick-candidate:wrestler-alpha",
  sourceFixtureId: "wrestler-alpha",
  sourceWrestlerId: "wrestler-alpha",
  selectingBrandId: "brand-red-placeholder",
  rosterSlotReference: "brand-red-pick-3",
  assignmentStatus:
    "roster-assignment-result-created-mutation-unavailable" as const,
  blockedReasonIds: [
    "roster-state-unavailable",
    "roster-assignment-not-implemented"
  ] as const
};
const rosterAssignmentResultObject =
  createNewGMModeDraftPickRosterAssignmentResultObject(explicitInput);

describe("New GM Mode Draft Pick Roster Assignment Result Object v0.1", () => {
  it("creates a frozen read-only object from explicit injected input", () => {
    assert.equal(rosterAssignmentResultObject.version, "0.1");
    assert.equal(rosterAssignmentResultObject.domainObject, true);
    assert.equal(rosterAssignmentResultObject.diagnosticsOnly, false);
    assert.equal(rosterAssignmentResultObject.playerFacing, false);
    assert.equal(rosterAssignmentResultObject.gameplayAffecting, false);
    assert.equal(rosterAssignmentResultObject.mutable, false);
    assert.equal(Object.isFrozen(rosterAssignmentResultObject), true);
    assert.equal(
      Object.isFrozen(
        rosterAssignmentResultObject.sourceExecutionResultReference
      ),
      true
    );
    assert.equal(
      Object.isFrozen(rosterAssignmentResultObject.sourceDraftPickReference),
      true
    );
    assert.equal(
      Object.isFrozen(rosterAssignmentResultObject.sourceCandidateReference),
      true
    );
    assert.equal(
      Object.isFrozen(rosterAssignmentResultObject.sourceFixtureReference),
      true
    );
    assert.equal(
      Object.isFrozen(rosterAssignmentResultObject.sourceWrestlerReference),
      true
    );
    assert.equal(
      Object.isFrozen(rosterAssignmentResultObject.selectingBrandReference),
      true
    );
    assert.equal(
      Object.isFrozen(rosterAssignmentResultObject.rosterSlotReference),
      true
    );
    assert.equal(
      Object.isFrozen(rosterAssignmentResultObject.blockedReasonReferences),
      true
    );
    assert.equal(
      Object.isFrozen(
        rosterAssignmentResultObject.blockedReasonReferences.blockedReasonIds
      ),
      true
    );
  });

  it("produces a stable deterministic rosterAssignmentResultObjectId", () => {
    const first =
      createNewGMModeDraftPickRosterAssignmentResultObject(explicitInput);
    const second = createNewGMModeDraftPickRosterAssignmentResultObject({
      ...explicitInput
    });
    const differentReasons =
      createNewGMModeDraftPickRosterAssignmentResultObject({
        ...explicitInput,
        blockedReasonIds: ["roster-state-unavailable"]
      });

    assert.equal(
      first.rosterAssignmentResultObjectId,
      second.rosterAssignmentResultObjectId
    );
    assert.notEqual(
      first.rosterAssignmentResultObjectId,
      differentReasons.rosterAssignmentResultObjectId
    );
    assert.equal(
      first.rosterAssignmentResultObjectId,
      "new-gm-mode-draft-pick-roster-assignment-result:new-gm-mode-draft-pick-execution-result-alpha:new-gm-mode-draft-pick-object-alpha:new-gm-mode-draft-pick-candidate-wrestler-alpha:wrestler-alpha:wrestler-alpha:brand-red-placeholder:brand-red-pick-3:roster-assignment-result-created-mutation-unavailable:blocked-reasons-roster-state-unavailable-roster-assignment-not-implemented"
    );
  });

  it("preserves all references as inert references", () => {
    assert.deepEqual(
      rosterAssignmentResultObject.sourceExecutionResultReference,
      {
        sourceExecutionResultObjectId:
          explicitInput.sourceExecutionResultObjectId
      }
    );
    assert.deepEqual(rosterAssignmentResultObject.sourceDraftPickReference, {
      sourceDraftPickObjectId: explicitInput.sourceDraftPickObjectId
    });
    assert.deepEqual(rosterAssignmentResultObject.sourceCandidateReference, {
      candidateObjectId: explicitInput.candidateObjectId
    });
    assert.deepEqual(rosterAssignmentResultObject.sourceFixtureReference, {
      sourceFixtureId: explicitInput.sourceFixtureId
    });
    assert.deepEqual(rosterAssignmentResultObject.sourceWrestlerReference, {
      sourceWrestlerId: explicitInput.sourceWrestlerId
    });
    assert.deepEqual(rosterAssignmentResultObject.selectingBrandReference, {
      selectingBrandId: explicitInput.selectingBrandId,
      placeholderOnly: true
    });
    assert.deepEqual(rosterAssignmentResultObject.rosterSlotReference, {
      rosterSlotReference: explicitInput.rosterSlotReference,
      placeholderOnly: true
    });
  });

  it("preserves injected assignmentStatus and blockedReasonIds without evaluating them", () => {
    const blockedObject = createNewGMModeDraftPickRosterAssignmentResultObject({
      ...explicitInput,
      candidateObjectId: "explicit-candidate-not-inspected",
      assignmentStatus:
        "roster-assignment-result-blocked-assignment-unavailable",
      blockedReasonIds: [
        "execution-result-object-invalid",
        "duplicate-roster-membership-check-unavailable"
      ]
    });

    assert.equal(
      rosterAssignmentResultObject.assignmentStatus,
      "roster-assignment-result-created-mutation-unavailable"
    );
    assert.equal(
      blockedObject.assignmentStatus,
      "roster-assignment-result-blocked-assignment-unavailable"
    );
    assert.deepEqual(blockedObject.blockedReasonReferences, {
      blockedReasonIds: [
        "execution-result-object-invalid",
        "duplicate-roster-membership-check-unavailable"
      ],
      staticCatalogOnly: true,
      evaluatedNow: false
    });
    assert.deepEqual(blockedObject.sourceCandidateReference, {
      candidateObjectId: "explicit-candidate-not-inspected"
    });
  });

  it("allows blocked reason IDs from the static Roster Assignment Blocked Reason Catalog", () => {
    const catalog =
      createNewGMModeDraftPickRosterAssignmentBlockedReasonCatalog();
    const object = createNewGMModeDraftPickRosterAssignmentResultObject({
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

  it("keeps roster state mutation, persistence, gameplay start, and Week 1 unlock blocked", () => {
    assert.deepEqual(rosterAssignmentResultObject.capabilityFlags, {
      rosterAssignmentResultObjectAvailable: true,
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
    const object = createNewGMModeDraftPickRosterAssignmentResultObject({
      ...explicitInput,
      candidateSet
    } as any);

    assert.equal(JSON.stringify(candidateSet), snapshot);
    assert.deepEqual(object.sourceCandidateReference, {
      candidateObjectId: explicitInput.candidateObjectId
    });
    assertForbiddenFieldsAbsent(rosterAssignmentResultObject);
    assert.equal(existsSync(UNTOUCHED_ASSIGNMENT_RESULT_OBJECT_DATABASE), false);
  });

  it("exports the roster assignment result object factory from the domain barrel", () => {
    assert.equal(
      typeof createNewGMModeDraftPickRosterAssignmentResultObject,
      "function"
    );
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed =
      "new-gm-mode-draft-pick-roster-assignment-result-object-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeDraftPickRosterAssignmentResultObject(explicitInput);

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
