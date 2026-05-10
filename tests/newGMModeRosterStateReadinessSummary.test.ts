import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  createNewGMModeDraftPickRosterAssignmentResultObject,
  createNewGMModeDraftPickRosterAssignmentResultObjectReadinessSummary,
  createNewGMModeRosterStateBoundaryContractShell,
  createNewGMModeRosterStateReadinessSummary
} from "../src/game/domain/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const UNTOUCHED_ROSTER_STATE_READINESS_DATABASE =
  "data/saves/__new-gm-mode-roster-state-readiness-should-not-exist.sqlite";
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
const directObjectReadiness =
  createNewGMModeDraftPickRosterAssignmentResultObjectReadinessSummary({
    rosterAssignmentResultObject
  });
const summary = createNewGMModeRosterStateReadinessSummary({
  rosterAssignmentResultObject
});

describe("New GM Mode Roster State Readiness Summary v0.1", () => {
  it("consumes roster assignment result object readiness from the injected object", () => {
    assert.equal(
      summary.rosterStateReadinessSummaryId,
      "new-gm-mode-roster-state-readiness-summary-v0.1"
    );
    assert.equal(summary.version, "0.1");
    assert.equal(summary.domainObject, true);
    assert.equal(summary.diagnosticsOnly, true);
    assert.equal(summary.playerFacing, false);
    assert.equal(summary.gameplayAffecting, false);
    assert.equal(summary.mutable, false);
    assert.equal(summary.shallowSummary, true);
    assert.equal(summary.deterministicOrdering, true);
    assert.equal(
      summary.rosterAssignmentResultObjectReadinessConsumed,
      true
    );
    assert.equal(
      summary.rosterAssignmentResultObjectReadinessPhase,
      directObjectReadiness.rosterAssignmentResultObjectReadinessPhase
    );
    assert.deepEqual(
      summary.rosterAssignmentResultObjectValidatorStatus,
      directObjectReadiness.validatorStatus
    );
  });

  it("reports roster state boundary ready while real roster state creation and mutation remain blocked", () => {
    assert.equal(
      summary.rosterAssignmentResultObjectReadinessPhase,
      "roster-assignment-result-object-valid-roster-state-unavailable"
    );
    assert.equal(
      summary.rosterStateReadinessPhase,
      "roster-state-boundary-ready-state-creation-blocked"
    );
    assert.equal(
      summary.capabilityFlags.rosterAssignmentResultObjectReadinessConsumable,
      true
    );
    assert.equal(
      summary.capabilityFlags.rosterAssignmentResultObjectReadinessConsumed,
      true
    );
    assert.equal(summary.capabilityFlags.canCreateOrMutateRosterState, false);
  });

  it("reports blocked phase when assignment result object readiness is invalid", () => {
    const malformed = JSON.parse(JSON.stringify(rosterAssignmentResultObject));
    delete malformed.sourceCandidateReference.candidateObjectId;
    const invalidSummary = createNewGMModeRosterStateReadinessSummary({
      rosterAssignmentResultObject: malformed
    });

    assert.equal(
      invalidSummary.rosterAssignmentResultObjectReadinessPhase,
      "roster-assignment-result-object-invalid"
    );
    assert.equal(
      invalidSummary.rosterStateReadinessPhase,
      "roster-state-boundary-blocked-by-assignment-result"
    );
    assert.deepEqual(
      invalidSummary.rosterAssignmentResultObjectValidatorStatus.issueIds,
      ["candidate-object-id-reference-missing"]
    );
  });

  it("surfaces roster state boundary requirement IDs and blocked reason IDs", () => {
    const boundary = createNewGMModeRosterStateBoundaryContractShell();

    assert.deepEqual(
      summary.rosterStateBoundaryRequirementIds,
      boundary.orderedRequirements.map((requirement) => requirement.id)
    );
    assert.deepEqual(
      summary.rosterStateBoundaryBlockedReasonIds,
      boundary.blockedReasons
    );
    assert.deepEqual(summary.rosterStateBoundaryRequirementIds, [
      "valid-roster-assignment-result-object-readiness-prerequisite",
      "assignment-result-status-prerequisite",
      "brand-roster-reference-prerequisite",
      "wrestler-roster-membership-prerequisite",
      "roster-capacity-prerequisite",
      "duplicate-membership-prevention-prerequisite",
      "division-championship-adjacency-prerequisite",
      "transaction-safety-prerequisite",
      "rollback-prerequisite",
      "persistence-prerequisite",
      "gameplay-unlock-prerequisite"
    ]);
  });

  it("keeps roster state creation or mutation, persistence, gameplay start, and Week 1 unlock blocked", () => {
    assert.equal(summary.capabilityFlags.canAssignRoster, false);
    assert.equal(summary.capabilityFlags.canCreateOrMutateRosterState, false);
    assert.equal(summary.capabilityFlags.canPersistGameplayPayload, false);
    assert.equal(summary.capabilityFlags.canWriteDatabase, false);
    assert.equal(summary.capabilityFlags.canMutateState, false);
    assert.equal(summary.capabilityFlags.canStartGameplay, false);
    assert.equal(summary.capabilityFlags.canUnlockWeekOne, false);
  });

  it("does not expose selected wrestler, selected candidate object, state objects, persistence, UI, generated text, GenAI, or action payload fields", () => {
    assertForbiddenFieldsAbsent(summary);
    assert.equal(existsSync(UNTOUCHED_ROSTER_STATE_READINESS_DATABASE), false);
  });

  it("exports the roster state readiness summary from the domain barrel", () => {
    assert.equal(typeof createNewGMModeRosterStateReadinessSummary, "function");
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "new-gm-mode-roster-state-readiness-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeRosterStateReadinessSummary({
      rosterAssignmentResultObject
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
    "draftState",
    "rosterState",
    "rosterStateObject",
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
