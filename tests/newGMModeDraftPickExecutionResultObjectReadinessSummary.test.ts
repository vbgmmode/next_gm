import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  createNewGMModeDraftPickExecutionResultObject,
  createNewGMModeDraftPickExecutionResultObjectReadinessSummary
} from "../src/game/domain/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const UNTOUCHED_EXECUTION_RESULT_OBJECT_READINESS_DATABASE =
  "data/saves/__new-gm-mode-draft-pick-execution-result-object-readiness-should-not-exist.sqlite";
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
const summary =
  createNewGMModeDraftPickExecutionResultObjectReadinessSummary({
    executionResultObject
  });

describe("New GM Mode Draft Pick Execution Result Object Readiness Summary v0.1", () => {
  it("reports valid execution result object as ready while roster assignment remains unavailable", () => {
    assert.equal(
      summary.draftPickExecutionResultObjectReadinessSummaryId,
      "new-gm-mode-draft-pick-execution-result-object-readiness-summary-v0.1"
    );
    assert.equal(summary.version, "0.1");
    assert.equal(summary.domainObject, true);
    assert.equal(summary.diagnosticsOnly, true);
    assert.equal(summary.playerFacing, false);
    assert.equal(summary.gameplayAffecting, false);
    assert.equal(summary.mutable, false);
    assert.equal(summary.shallowSummary, true);
    assert.equal(summary.deterministicOrdering, true);
    assert.equal(summary.executionResultObjectAvailable, true);
    assert.equal(
      summary.executionResultObjectReadinessPhase,
      "draft-pick-execution-result-object-valid-mutation-unavailable"
    );
    assert.deepEqual(summary.validatorStatus, {
      validatorId:
        "new-gm-mode-draft-pick-execution-result-object-validator-v0.1",
      structurallyValid: true,
      issueCount: 0,
      issueIds: []
    });
    assert.equal(summary.capabilityFlags.canAssignRoster, false);
  });

  it("reports inert references", () => {
    assert.deepEqual(summary.inertReferences, {
      sourceDraftPickObjectId: explicitInput.sourceDraftPickObjectId,
      sourceValidationResultObjectId:
        explicitInput.sourceValidationResultObjectId,
      sourceSelectionIntentObjectId:
        explicitInput.sourceSelectionIntentObjectId,
      candidateObjectId: explicitInput.candidateObjectId,
      sourceFixtureId: explicitInput.sourceFixtureId,
      sourceWrestlerId: explicitInput.sourceWrestlerId,
      selectingBrandId: explicitInput.selectingBrandId,
      draftRound: explicitInput.draftRound,
      draftPickNumber: explicitInput.draftPickNumber
    });
  });

  it("reports invalid phase for malformed injected execution result objects", () => {
    const malformed = JSON.parse(JSON.stringify(executionResultObject));
    delete malformed.sourceCandidateReference.candidateObjectId;
    const invalidSummary =
      createNewGMModeDraftPickExecutionResultObjectReadinessSummary({
        executionResultObject: malformed
      });

    assert.equal(
      invalidSummary.executionResultObjectReadinessPhase,
      "draft-pick-execution-result-object-invalid"
    );
    assert.deepEqual(invalidSummary.validatorStatus.issueIds, [
      "candidate-object-id-reference-missing"
    ]);
  });

  it("preserves injected executionStatus and blockedReasonIds without evaluating them", () => {
    assert.equal(
      summary.preservedExecutionStatus,
      "draft-pick-execution-result-created-mutation-unavailable"
    );
    assert.deepEqual(summary.preservedBlockedReasonIds, [
      "draft-state-unavailable",
      "draft-pick-execution-not-implemented"
    ]);
  });

  it("keeps draft state mutation, roster assignment, persistence, gameplay start, and Week 1 unlock blocked", () => {
    assert.equal(summary.capabilityFlags.canMutateDraftState, false);
    assert.equal(summary.capabilityFlags.canAssignRoster, false);
    assert.equal(summary.capabilityFlags.canCreateOrMutateRosterState, false);
    assert.equal(summary.capabilityFlags.canPersistGameplayPayload, false);
    assert.equal(summary.capabilityFlags.canWriteDatabase, false);
    assert.equal(summary.capabilityFlags.canStartGameplay, false);
    assert.equal(summary.capabilityFlags.canUnlockWeekOne, false);
  });

  it("does not expose selected wrestler, selected candidate object, state, persistence, UI, generated text, GenAI, or action payload fields", () => {
    assertForbiddenFieldsAbsent(summary);
    assert.equal(
      existsSync(UNTOUCHED_EXECUTION_RESULT_OBJECT_READINESS_DATABASE),
      false
    );
  });

  it("exports the execution result object readiness summary from the domain barrel", () => {
    assert.equal(
      typeof createNewGMModeDraftPickExecutionResultObjectReadinessSummary,
      "function"
    );
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed =
      "new-gm-mode-draft-pick-execution-result-object-readiness-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeDraftPickExecutionResultObjectReadinessSummary({
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
