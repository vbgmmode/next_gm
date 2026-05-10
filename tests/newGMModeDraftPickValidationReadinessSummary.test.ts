import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  createNewGMModeDraftPickValidationReadinessSummary,
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

const UNTOUCHED_DRAFT_PICK_VALIDATION_READINESS_DATABASE =
  "data/saves/__new-gm-mode-draft-pick-validation-readiness-should-not-exist.sqlite";
const selectionIntentObject = createNewGMModeDraftSelectionIntentObject({
  candidateObjectId: "new-gm-mode-draft-pick-candidate:wrestler-alpha",
  sourceFixtureId: "wrestler-alpha",
  sourceWrestlerId: "wrestler-alpha",
  selectingBrandId: "brand-red-placeholder",
  draftRound: 1,
  draftPickNumber: 3
});
const selectionIntentReadinessSummary =
  createNewGMModeDraftSelectionIntentReadinessSummary({
    selectionIntentObject
  });
const summary = createNewGMModeDraftPickValidationReadinessSummary({
  selectionIntentReadinessSummary
});

describe("New GM Mode Draft Pick Validation Readiness Summary v0.1", () => {
  it("consumes selection intent readiness", () => {
    assert.equal(
      summary.draftPickValidationReadinessSummaryId,
      "new-gm-mode-draft-pick-validation-readiness-summary-v0.1"
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
      summary.selectionIntentReadinessPhase,
      "selection-intent-object-valid-pick-validation-unavailable"
    );
  });

  it("reports validation boundary ready while real validation remains blocked", () => {
    assert.equal(
      summary.draftPickValidationReadinessPhase,
      "draft-pick-validation-boundary-ready-validation-blocked"
    );
    assert.ok(
      summary.blockedReasonIds.includes(
        "candidate-eligibility-validation-not-implemented"
      )
    );
    assert.equal(summary.capabilityFlags.canValidateDraftPick, false);
  });

  it("surfaces contract requirement IDs and blocked reason IDs", () => {
    assert.deepEqual(summary.contractRequirementIds, [
      "valid-selection-intent-readiness-prerequisite",
      "candidate-object-lookup-prerequisite",
      "candidate-eligibility-prerequisite",
      "draft-order-prerequisite",
      "brand-selection-context-prerequisite",
      "duplicate-pick-prevention-prerequisite",
      "roster-capacity-prerequisite",
      "future-draft-state-prerequisite",
      "future-validation-result-prerequisite"
    ]);
    assert.deepEqual(summary.blockedReasonIds, [
      "draft-pick-validation-boundary-contract-only",
      "selection-intent-readiness-required",
      "candidate-object-lookup-not-implemented",
      "candidate-eligibility-validation-not-implemented",
      "draft-order-validation-not-implemented",
      "brand-selection-context-validation-not-implemented",
      "duplicate-pick-prevention-not-implemented",
      "roster-capacity-validation-not-implemented",
      "draft-state-not-implemented",
      "validation-result-not-implemented",
      "draft-pick-creation-not-implemented",
      "draft-pick-execution-not-implemented",
      "roster-assignment-not-implemented",
      "gameplay-persistence-not-implemented",
      "gameplay-start-not-implemented",
      "week-one-unlock-not-implemented"
    ]);
  });

  it("reports blocked phase when selection intent readiness is invalid", () => {
    const malformedObject = JSON.parse(JSON.stringify(selectionIntentObject));
    delete malformedObject.validationStatus;
    const invalidSummary = createNewGMModeDraftPickValidationReadinessSummary({
      selectionIntentObject: malformedObject
    });

    assert.equal(
      invalidSummary.selectionIntentReadinessPhase,
      "selection-intent-object-invalid"
    );
    assert.equal(
      invalidSummary.draftPickValidationReadinessPhase,
      "draft-pick-validation-boundary-blocked-by-selection-intent"
    );
  });

  it("keeps candidate eligibility validation, draft pick validation, creation, execution, assignment, persistence, mutation, gameplay start, and Week 1 unlock blocked", () => {
    assert.deepEqual(summary.capabilityFlags, {
      selectionIntentReadinessConsumable: true,
      canLookupCandidateObject: false,
      canValidateCandidateEligibility: false,
      canValidateDraftPick: false,
      canCreateDraftPick: false,
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
      canUseGenAI: false
    });
  });

  it("does not expose selected wrestler, selected candidate object, draft pick result, state, persistence, UI, generated text, GenAI, or action payload fields", () => {
    assertForbiddenFieldsAbsent(summary);
    assert.equal(
      existsSync(UNTOUCHED_DRAFT_PICK_VALIDATION_READINESS_DATABASE),
      false
    );
  });

  it("exports the validation readiness summary factory from the domain barrel", () => {
    assert.equal(
      typeof createNewGMModeDraftPickValidationReadinessSummary,
      "function"
    );
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed =
      "new-gm-mode-draft-pick-validation-readiness-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeDraftPickValidationReadinessSummary({
      selectionIntentReadinessSummary
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
