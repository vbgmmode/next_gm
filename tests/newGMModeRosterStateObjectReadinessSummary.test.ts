import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  createNewGMModeRosterStateObject,
  createNewGMModeRosterStateObjectReadinessSummary
} from "../src/game/domain/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const UNTOUCHED_ROSTER_STATE_OBJECT_READINESS_DATABASE =
  "data/saves/__new-gm-mode-roster-state-object-readiness-should-not-exist.sqlite";
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
const summary = createNewGMModeRosterStateObjectReadinessSummary({
  rosterStateObject
});

describe("New GM Mode Roster State Object Readiness Summary v0.1", () => {
  it("reports valid roster state object as ready while roster mutation and gameplay start remain unavailable", () => {
    assert.equal(
      summary.rosterStateObjectReadinessSummaryId,
      "new-gm-mode-roster-state-object-readiness-summary-v0.1"
    );
    assert.equal(summary.version, "0.1");
    assert.equal(summary.domainObject, true);
    assert.equal(summary.diagnosticsOnly, true);
    assert.equal(summary.playerFacing, false);
    assert.equal(summary.gameplayAffecting, false);
    assert.equal(summary.mutable, false);
    assert.equal(summary.shallowSummary, true);
    assert.equal(summary.deterministicOrdering, true);
    assert.equal(summary.rosterStateObjectAvailable, true);
    assert.equal(
      summary.rosterStateObjectReadinessPhase,
      "roster-state-object-valid-mutation-unavailable"
    );
    assert.deepEqual(summary.validatorStatus, {
      validatorId: "new-gm-mode-roster-state-object-validator-v0.1",
      structurallyValid: true,
      issueCount: 0,
      issueIds: []
    });
  });

  it("reports inert references", () => {
    assert.deepEqual(summary.inertReferences, {
      rosterStateIdSeedReference: explicitInput.rosterStateIdSeedReference,
      brandRosterReference: explicitInput.brandRosterReference,
      assignedWrestlerMembershipReferences:
        explicitInput.assignedWrestlerMembershipReferences,
      sourceRosterAssignmentResultObjectIds:
        explicitInput.sourceRosterAssignmentResultObjectIds,
      versionReference: explicitInput.versionReference
    });
  });

  it("reports invalid phase for malformed injected roster state objects", () => {
    const malformed = JSON.parse(JSON.stringify(rosterStateObject));
    delete malformed.brandRosterReference.brandRosterReference;
    const invalidSummary = createNewGMModeRosterStateObjectReadinessSummary({
      rosterStateObject: malformed
    });

    assert.equal(
      invalidSummary.rosterStateObjectReadinessPhase,
      "roster-state-object-invalid"
    );
    assert.deepEqual(invalidSummary.validatorStatus.issueIds, [
      "brand-roster-reference-missing"
    ]);
  });

  it("preserves injected rosterStateStatus and blockedReasonIds without evaluating them", () => {
    assert.equal(
      summary.preservedRosterStateStatus,
      "roster-state-object-created-mutation-unavailable"
    );
    assert.deepEqual(summary.preservedBlockedReasonIds, [
      "persistence-unavailable",
      "roster-state-creation-not-implemented"
    ]);
  });

  it("keeps roster mutation, persistence, gameplay start, and Week 1 unlock blocked", () => {
    assert.equal(summary.capabilityFlags.canMutateRosterState, false);
    assert.equal(summary.capabilityFlags.canCreateOrMutateRosterState, false);
    assert.equal(summary.capabilityFlags.canPersistGameplayPayload, false);
    assert.equal(summary.capabilityFlags.canWriteDatabase, false);
    assert.equal(summary.capabilityFlags.canStartGameplay, false);
    assert.equal(summary.capabilityFlags.canInitializeWeekOne, false);
    assert.equal(summary.capabilityFlags.canUnlockWeekOne, false);
  });

  it("does not expose selected wrestler, selected candidate object, real mutation, state, persistence, UI, generated text, GenAI, or action payload fields", () => {
    assertForbiddenFieldsAbsent(summary);
    assert.equal(existsSync(UNTOUCHED_ROSTER_STATE_OBJECT_READINESS_DATABASE), false);
  });

  it("exports the roster state object readiness summary from the domain barrel", () => {
    assert.equal(
      typeof createNewGMModeRosterStateObjectReadinessSummary,
      "function"
    );
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed =
      "new-gm-mode-roster-state-object-readiness-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeRosterStateObjectReadinessSummary({ rosterStateObject });

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
