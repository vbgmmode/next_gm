import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  createNewGMModeDraftPickExecutionResultObject,
  createNewGMModeDraftPickExecutionResultObjectReadinessSummary,
  createNewGMModeDraftPickRosterAssignmentBoundaryContractShell,
  createNewGMModeDraftPickRosterAssignmentReadinessSummary
} from "../src/game/domain/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const UNTOUCHED_ROSTER_ASSIGNMENT_READINESS_DATABASE =
  "data/saves/__new-gm-mode-draft-pick-roster-assignment-readiness-should-not-exist.sqlite";
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
const directObjectReadiness =
  createNewGMModeDraftPickExecutionResultObjectReadinessSummary({
    executionResultObject
  });
const summary = createNewGMModeDraftPickRosterAssignmentReadinessSummary({
  executionResultObject
});

describe("New GM Mode Draft Pick Roster Assignment Readiness Summary v0.1", () => {
  it("consumes execution result object readiness from the injected execution result object", () => {
    assert.equal(
      summary.draftPickRosterAssignmentReadinessSummaryId,
      "new-gm-mode-draft-pick-roster-assignment-readiness-summary-v0.1"
    );
    assert.equal(summary.version, "0.1");
    assert.equal(summary.domainObject, true);
    assert.equal(summary.diagnosticsOnly, true);
    assert.equal(summary.playerFacing, false);
    assert.equal(summary.gameplayAffecting, false);
    assert.equal(summary.mutable, false);
    assert.equal(summary.shallowSummary, true);
    assert.equal(summary.deterministicOrdering, true);
    assert.equal(summary.executionResultObjectReadinessConsumed, true);
    assert.equal(
      summary.executionResultObjectReadinessPhase,
      directObjectReadiness.executionResultObjectReadinessPhase
    );
    assert.deepEqual(
      summary.executionResultObjectValidatorStatus,
      directObjectReadiness.validatorStatus
    );
  });

  it("reports assignment boundary ready while real roster assignment remains blocked", () => {
    assert.equal(
      summary.executionResultObjectReadinessPhase,
      "draft-pick-execution-result-object-valid-mutation-unavailable"
    );
    assert.equal(
      summary.draftPickRosterAssignmentReadinessPhase,
      "draft-pick-roster-assignment-boundary-ready-assignment-blocked"
    );
    assert.equal(
      summary.capabilityFlags.executionResultObjectReadinessConsumable,
      true
    );
    assert.equal(
      summary.capabilityFlags.executionResultObjectReadinessConsumed,
      true
    );
    assert.equal(summary.capabilityFlags.canAssignRoster, false);
    assert.equal(summary.capabilityFlags.canCreateOrMutateRosterState, false);
  });

  it("reports blocked phase when execution result object readiness is invalid", () => {
    const malformed = JSON.parse(JSON.stringify(executionResultObject));
    delete malformed.sourceDraftPickReference.sourceDraftPickObjectId;
    const invalidSummary =
      createNewGMModeDraftPickRosterAssignmentReadinessSummary({
        executionResultObject: malformed
      });

    assert.equal(
      invalidSummary.executionResultObjectReadinessPhase,
      "draft-pick-execution-result-object-invalid"
    );
    assert.equal(
      invalidSummary.draftPickRosterAssignmentReadinessPhase,
      "draft-pick-roster-assignment-boundary-blocked-by-execution-result"
    );
    assert.deepEqual(
      invalidSummary.executionResultObjectValidatorStatus.issueIds,
      ["source-draft-pick-object-id-reference-missing"]
    );
  });

  it("surfaces roster assignment boundary requirement IDs and blocked reason IDs", () => {
    const boundary = createNewGMModeDraftPickRosterAssignmentBoundaryContractShell();

    assert.deepEqual(
      summary.rosterAssignmentBoundaryRequirementIds,
      boundary.orderedRequirements.map((requirement) => requirement.id)
    );
    assert.deepEqual(
      summary.rosterAssignmentBoundaryBlockedReasonIds,
      boundary.blockedReasons
    );
    assert.deepEqual(summary.rosterAssignmentBoundaryRequirementIds, [
      "valid-execution-result-object-readiness-prerequisite",
      "execution-result-status-prerequisite",
      "candidate-wrestler-reference-prerequisite",
      "selecting-brand-prerequisite",
      "roster-capacity-prerequisite",
      "duplicate-roster-membership-prevention-prerequisite",
      "division-championship-adjacency-prerequisite",
      "transaction-safety-prerequisite",
      "rollback-prerequisite",
      "persistence-prerequisite"
    ]);
  });

  it("keeps roster assignment, roster state mutation, persistence, gameplay start, and Week 1 unlock blocked", () => {
    assert.equal(summary.capabilityFlags.canAssignRoster, false);
    assert.equal(summary.capabilityFlags.canCreateOrMutateRosterState, false);
    assert.equal(summary.capabilityFlags.canPersistGameplayPayload, false);
    assert.equal(summary.capabilityFlags.canWriteDatabase, false);
    assert.equal(summary.capabilityFlags.canMutateState, false);
    assert.equal(summary.capabilityFlags.canStartGameplay, false);
    assert.equal(summary.capabilityFlags.canUnlockWeekOne, false);
  });

  it("does not expose selected wrestler, selected candidate object, state, assignment result object, persistence, UI, generated text, GenAI, or action payload fields", () => {
    assertForbiddenFieldsAbsent(summary);
    assert.equal(existsSync(UNTOUCHED_ROSTER_ASSIGNMENT_READINESS_DATABASE), false);
  });

  it("exports the roster assignment readiness summary from the domain barrel", () => {
    assert.equal(
      typeof createNewGMModeDraftPickRosterAssignmentReadinessSummary,
      "function"
    );
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed =
      "new-gm-mode-draft-pick-roster-assignment-readiness-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeDraftPickRosterAssignmentReadinessSummary({
      executionResultObject
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
    "rosterAssignmentResultObject",
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
