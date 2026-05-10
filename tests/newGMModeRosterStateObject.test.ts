import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  createNewGMModeRosterStateBlockedReasonCatalog,
  createNewGMModeRosterStateObject
} from "../src/game/domain/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const UNTOUCHED_ROSTER_STATE_OBJECT_DATABASE =
  "data/saves/__new-gm-mode-roster-state-object-should-not-exist.sqlite";
const explicitInput = {
  rosterStateIdSeedReference: "next-gm-roster-state-alpha",
  brandRosterReference: "brand-red-roster",
  assignedWrestlerMembershipReferences: [
    "wrestler-alpha-membership",
    "wrestler-beta-membership"
  ] as const,
  sourceRosterAssignmentResultObjectIds: [
    "new-gm-mode-draft-pick-roster-assignment-result:alpha"
  ] as const,
  rosterStateStatus:
    "roster-state-object-created-mutation-unavailable" as const,
  blockedReasonIds: [
    "persistence-unavailable",
    "roster-state-creation-not-implemented"
  ] as const,
  versionReference: "v0.1-placeholder"
};
const rosterStateObject = createNewGMModeRosterStateObject(explicitInput);

describe("New GM Mode Roster State Object v0.1", () => {
  it("creates a frozen read-only object from explicit injected input", () => {
    assert.equal(rosterStateObject.version, "0.1");
    assert.equal(rosterStateObject.domainObject, true);
    assert.equal(rosterStateObject.diagnosticsOnly, false);
    assert.equal(rosterStateObject.playerFacing, false);
    assert.equal(rosterStateObject.gameplayAffecting, false);
    assert.equal(rosterStateObject.mutable, false);
    assert.equal(Object.isFrozen(rosterStateObject), true);
    assert.equal(Object.isFrozen(rosterStateObject.rosterStateSeedReference), true);
    assert.equal(Object.isFrozen(rosterStateObject.brandRosterReference), true);
    assert.equal(
      Object.isFrozen(rosterStateObject.assignedWrestlerMembershipReferences),
      true
    );
    assert.equal(
      Object.isFrozen(rosterStateObject.sourceRosterAssignmentResultObjectIds),
      true
    );
    assert.equal(Object.isFrozen(rosterStateObject.versionReference), true);
    assert.equal(Object.isFrozen(rosterStateObject.blockedReasonReferences), true);
    assert.equal(
      Object.isFrozen(rosterStateObject.blockedReasonReferences.blockedReasonIds),
      true
    );
  });

  it("produces a stable deterministic rosterStateObjectId", () => {
    const first = createNewGMModeRosterStateObject(explicitInput);
    const second = createNewGMModeRosterStateObject({ ...explicitInput });
    const differentVersion = createNewGMModeRosterStateObject({
      ...explicitInput,
      versionReference: "v0.2-placeholder"
    });

    assert.equal(first.rosterStateObjectId, second.rosterStateObjectId);
    assert.notEqual(
      first.rosterStateObjectId,
      differentVersion.rosterStateObjectId
    );
    assert.equal(
      first.rosterStateObjectId,
      "new-gm-mode-roster-state-object:next-gm-roster-state-alpha:brand-red-roster:membership-wrestler-alpha-membership-wrestler-beta-membership:assignment-results-new-gm-mode-draft-pick-roster-assignment-result-alpha:roster-state-object-created-mutation-unavailable:blocked-reasons-persistence-unavailable-roster-state-creation-not-implemented:v0-1-placeholder"
    );
  });

  it("preserves brand roster, membership, assignment result, status, blocked reason, and version references as inert references", () => {
    assert.deepEqual(rosterStateObject.rosterStateSeedReference, {
      rosterStateIdSeedReference: explicitInput.rosterStateIdSeedReference
    });
    assert.deepEqual(rosterStateObject.brandRosterReference, {
      brandRosterReference: explicitInput.brandRosterReference,
      placeholderOnly: true
    });
    assert.deepEqual(
      rosterStateObject.assignedWrestlerMembershipReferences,
      explicitInput.assignedWrestlerMembershipReferences
    );
    assert.deepEqual(
      rosterStateObject.sourceRosterAssignmentResultObjectIds,
      explicitInput.sourceRosterAssignmentResultObjectIds
    );
    assert.deepEqual(rosterStateObject.versionReference, {
      versionReference: explicitInput.versionReference,
      placeholderOnly: true
    });
  });

  it("preserves injected rosterStateStatus and blockedReasonIds without evaluating them", () => {
    const blockedObject = createNewGMModeRosterStateObject({
      ...explicitInput,
      assignedWrestlerMembershipReferences: ["explicit-membership-not-evaluated"],
      rosterStateStatus: "roster-state-object-blocked-creation-unavailable",
      blockedReasonIds: [
        "assignment-result-object-invalid",
        "brand-roster-reference-missing"
      ]
    });

    assert.equal(
      rosterStateObject.rosterStateStatus,
      "roster-state-object-created-mutation-unavailable"
    );
    assert.equal(
      blockedObject.rosterStateStatus,
      "roster-state-object-blocked-creation-unavailable"
    );
    assert.deepEqual(blockedObject.assignedWrestlerMembershipReferences, [
      "explicit-membership-not-evaluated"
    ]);
    assert.deepEqual(blockedObject.blockedReasonReferences, {
      blockedReasonIds: [
        "assignment-result-object-invalid",
        "brand-roster-reference-missing"
      ],
      staticCatalogOnly: true,
      evaluatedNow: false
    });
  });

  it("allows blocked reason IDs from the static Roster State Blocked Reason Catalog", () => {
    const catalog = createNewGMModeRosterStateBlockedReasonCatalog();
    const object = createNewGMModeRosterStateObject({
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

  it("keeps roster mutation, persistence, gameplay start, and Week 1 unlock blocked", () => {
    assert.deepEqual(rosterStateObject.capabilityFlags, {
      rosterStateObjectAvailable: true,
      canMutateRosterState: false,
      canCreateOrMutateRosterState: false,
      canAssignRoster: false,
      canAssignChampionshipOrDivision: false,
      canCreateMatchShowWeekOrCalendarState: false,
      canPersistGameplayPayload: false,
      canWriteDatabase: false,
      canMutateState: false,
      canStartGameplay: false,
      canInitializeWeekOne: false,
      canUnlockWeekOne: false,
      canCreateUserInterface: false,
      canCreateGeneratedText: false,
      canUseGenAI: false
    });
  });

  it("does not infer membership from assignment data or expose forbidden fields/actions", () => {
    const assignmentResultObjects = Object.freeze([{ objectId: "untouched" }]);
    const snapshot = JSON.stringify(assignmentResultObjects);
    const object = createNewGMModeRosterStateObject({
      ...explicitInput,
      assignmentResultObjects
    } as any);

    assert.equal(JSON.stringify(assignmentResultObjects), snapshot);
    assert.deepEqual(
      object.assignedWrestlerMembershipReferences,
      explicitInput.assignedWrestlerMembershipReferences
    );
    assertForbiddenFieldsAbsent(rosterStateObject);
    assert.equal(existsSync(UNTOUCHED_ROSTER_STATE_OBJECT_DATABASE), false);
  });

  it("exports the roster state object factory from the domain barrel", () => {
    assert.equal(typeof createNewGMModeRosterStateObject, "function");
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "new-gm-mode-roster-state-object-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeRosterStateObject(explicitInput);

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
    "realRosterMutation",
    "championshipDivision",
    "match",
    "show",
    "week",
    "calendar",
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
