import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  createNewGMModeDraftPickRosterAssignmentResultObject,
  createNewGMModeDraftPickRosterAssignmentResultObjectReadinessSummary
} from "../src/game/domain/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const UNTOUCHED_ASSIGNMENT_RESULT_OBJECT_READINESS_DATABASE =
  "data/saves/__new-gm-mode-draft-pick-roster-assignment-result-object-readiness-should-not-exist.sqlite";
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
const summary =
  createNewGMModeDraftPickRosterAssignmentResultObjectReadinessSummary({
    rosterAssignmentResultObject
  });

describe("New GM Mode Draft Pick Roster Assignment Result Object Readiness Summary v0.1", () => {
  it("reports valid assignment result object as ready while roster state remains unavailable", () => {
    assert.equal(
      summary.draftPickRosterAssignmentResultObjectReadinessSummaryId,
      "new-gm-mode-draft-pick-roster-assignment-result-object-readiness-summary-v0.1"
    );
    assert.equal(summary.version, "0.1");
    assert.equal(summary.domainObject, true);
    assert.equal(summary.diagnosticsOnly, true);
    assert.equal(summary.playerFacing, false);
    assert.equal(summary.gameplayAffecting, false);
    assert.equal(summary.mutable, false);
    assert.equal(summary.shallowSummary, true);
    assert.equal(summary.deterministicOrdering, true);
    assert.equal(summary.rosterAssignmentResultObjectAvailable, true);
    assert.equal(
      summary.rosterAssignmentResultObjectReadinessPhase,
      "roster-assignment-result-object-valid-roster-state-unavailable"
    );
    assert.deepEqual(summary.validatorStatus, {
      validatorId:
        "new-gm-mode-draft-pick-roster-assignment-result-object-validator-v0.1",
      structurallyValid: true,
      issueCount: 0,
      issueIds: []
    });
    assert.equal(summary.capabilityFlags.canCreateOrMutateRosterState, false);
  });

  it("reports inert references", () => {
    assert.deepEqual(summary.inertReferences, {
      sourceExecutionResultObjectId:
        explicitInput.sourceExecutionResultObjectId,
      sourceDraftPickObjectId: explicitInput.sourceDraftPickObjectId,
      candidateObjectId: explicitInput.candidateObjectId,
      sourceFixtureId: explicitInput.sourceFixtureId,
      sourceWrestlerId: explicitInput.sourceWrestlerId,
      selectingBrandId: explicitInput.selectingBrandId,
      rosterSlotReference: explicitInput.rosterSlotReference
    });
  });

  it("reports invalid phase for malformed injected assignment result objects", () => {
    const malformed = JSON.parse(JSON.stringify(rosterAssignmentResultObject));
    delete malformed.sourceCandidateReference.candidateObjectId;
    const invalidSummary =
      createNewGMModeDraftPickRosterAssignmentResultObjectReadinessSummary({
        rosterAssignmentResultObject: malformed
      });

    assert.equal(
      invalidSummary.rosterAssignmentResultObjectReadinessPhase,
      "roster-assignment-result-object-invalid"
    );
    assert.deepEqual(invalidSummary.validatorStatus.issueIds, [
      "candidate-object-id-reference-missing"
    ]);
  });

  it("preserves injected assignmentStatus and blockedReasonIds without evaluating them", () => {
    assert.equal(
      summary.preservedAssignmentStatus,
      "roster-assignment-result-created-mutation-unavailable"
    );
    assert.deepEqual(summary.preservedBlockedReasonIds, [
      "roster-state-unavailable",
      "roster-assignment-not-implemented"
    ]);
  });

  it("keeps roster state mutation, persistence, gameplay start, and Week 1 unlock blocked", () => {
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
      existsSync(UNTOUCHED_ASSIGNMENT_RESULT_OBJECT_READINESS_DATABASE),
      false
    );
  });

  it("exports the assignment result object readiness summary from the domain barrel", () => {
    assert.equal(
      typeof createNewGMModeDraftPickRosterAssignmentResultObjectReadinessSummary,
      "function"
    );
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed =
      "new-gm-mode-draft-pick-roster-assignment-result-object-readiness-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeDraftPickRosterAssignmentResultObjectReadinessSummary({
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
