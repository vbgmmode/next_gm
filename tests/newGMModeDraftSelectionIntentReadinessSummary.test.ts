import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  createNewGMModeDraftPickCandidateObjects,
  createNewGMModeDraftSelectionIntentObject,
  createNewGMModeDraftSelectionIntentReadinessSummary
} from "../src/game/domain/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const UNTOUCHED_DRAFT_SELECTION_INTENT_READINESS_DATABASE =
  "data/saves/__new-gm-mode-draft-selection-intent-readiness-should-not-exist.sqlite";
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
const summary = createNewGMModeDraftSelectionIntentReadinessSummary({
  selectionIntentObject
});

describe("New GM Mode Draft Selection Intent Readiness Summary v0.1", () => {
  it("reports a valid selection intent object as ready while pick validation remains unavailable", () => {
    assert.equal(
      summary.draftSelectionIntentReadinessSummaryId,
      "new-gm-mode-draft-selection-intent-readiness-summary-v0.1"
    );
    assert.equal(summary.version, "0.1");
    assert.equal(summary.domainObject, true);
    assert.equal(summary.diagnosticsOnly, true);
    assert.equal(summary.playerFacing, false);
    assert.equal(summary.gameplayAffecting, false);
    assert.equal(summary.mutable, false);
    assert.equal(summary.shallowSummary, true);
    assert.equal(summary.deterministicOrdering, true);
    assert.equal(summary.selectionIntentObjectAvailable, true);
    assert.equal(
      summary.selectionIntentReadinessPhase,
      "selection-intent-object-valid-pick-validation-unavailable"
    );
    assert.equal(summary.capabilityFlags.canValidateDraftPick, false);
  });

  it("reports validator status and deterministic issue IDs", () => {
    assert.deepEqual(summary.validatorStatus, {
      validatorId: "new-gm-mode-draft-selection-intent-object-validator-v0.1",
      structurallyValid: true,
      issueCount: 0,
      issueIds: []
    });

    const malformed = cloneIntentObject();
    malformed.draftSelectionIntentObjectId = "bad-id";
    delete malformed.sourceCandidateReference.candidateObjectId;
    malformed.capabilityFlags.canCreateDraftPick = true;
    const malformedSummary =
      createNewGMModeDraftSelectionIntentReadinessSummary({
        selectionIntentObject: malformed
      });

    assert.equal(malformedSummary.validatorStatus.structurallyValid, false);
    assert.deepEqual(malformedSummary.validatorStatus.issueIds, [
      "draft-selection-intent-object-id-format-invalid",
      "candidate-object-id-reference-missing",
      "capability-flag-enabled"
    ]);
  });

  it("reports inert candidate, fixture, wrestler, brand, round, and pick references", () => {
    assert.deepEqual(summary.inertReferences, {
      candidateObjectId: explicitInput.candidateObjectId,
      sourceFixtureId: explicitInput.sourceFixtureId,
      sourceWrestlerId: explicitInput.sourceWrestlerId,
      selectingBrandId: explicitInput.selectingBrandId,
      draftRound: explicitInput.draftRound,
      draftPickNumber: explicitInput.draftPickNumber
    });
  });

  it("reports invalid phase for malformed injected intent objects", () => {
    const malformed = cloneIntentObject();
    delete malformed.validationStatus;
    const malformedSummary =
      createNewGMModeDraftSelectionIntentReadinessSummary({
        selectionIntentObject: malformed
      });

    assert.equal(
      malformedSummary.selectionIntentReadinessPhase,
      "selection-intent-object-invalid"
    );
    assert.deepEqual(malformedSummary.validatorStatus.issueIds, [
      "selection-intent-status-invalid"
    ]);
  });

  it("keeps candidate eligibility validation, draft pick validation, creation, execution, assignment, persistence, mutation, gameplay start, and Week 1 unlock blocked", () => {
    assert.deepEqual(summary.capabilityFlags, {
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
      canUseGenAI: false,
      selectionIntentObjectAvailable: true,
      canValidateCandidateEligibility: false
    });
  });

  it("does not inspect or mutate candidate lists", () => {
    const candidateSet = createNewGMModeDraftPickCandidateObjects();
    const candidateSnapshot = JSON.stringify(candidateSet);
    const objectWithUnusedCandidateSet = {
      ...selectionIntentObject,
      candidateSet
    };
    const result = createNewGMModeDraftSelectionIntentReadinessSummary({
      selectionIntentObject: objectWithUnusedCandidateSet
    });

    assert.equal(result.validatorStatus.structurallyValid, true);
    assert.equal(JSON.stringify(candidateSet), candidateSnapshot);
  });

  it("does not expose selected wrestler, selected candidate object, draft pick result, state, persistence, UI, generated text, GenAI, or action payload fields", () => {
    assertForbiddenFieldsAbsent(summary);
    assert.equal(
      existsSync(UNTOUCHED_DRAFT_SELECTION_INTENT_READINESS_DATABASE),
      false
    );
  });

  it("exports the readiness summary factory from the domain barrel", () => {
    assert.equal(
      typeof createNewGMModeDraftSelectionIntentReadinessSummary,
      "function"
    );
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed =
      "new-gm-mode-draft-selection-intent-readiness-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeDraftSelectionIntentReadinessSummary({
      selectionIntentObject
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

function cloneIntentObject(): any {
  return JSON.parse(JSON.stringify(selectionIntentObject));
}

function assertForbiddenFieldsAbsent(source: unknown): void {
  const forbiddenFields = [
    "selectedWrestler",
    "selectedCandidate",
    "selectedCandidateObject",
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
