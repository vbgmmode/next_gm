import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  createNewGMModeDraftPickValidationReadinessSummary,
  createNewGMModeDraftPickValidationResultReadinessSummary,
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

const UNTOUCHED_VALIDATION_RESULT_READINESS_DATABASE =
  "data/saves/__new-gm-mode-draft-pick-validation-result-readiness-should-not-exist.sqlite";
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
const validationReadinessSummary =
  createNewGMModeDraftPickValidationReadinessSummary({
    selectionIntentReadinessSummary
  });
const summary = createNewGMModeDraftPickValidationResultReadinessSummary({
  draftPickValidationReadinessSummary: validationReadinessSummary
});

describe("New GM Mode Draft Pick Validation Result Readiness Summary v0.1", () => {
  it("consumes draft pick validation readiness", () => {
    assert.equal(
      summary.draftPickValidationResultReadinessSummaryId,
      "new-gm-mode-draft-pick-validation-result-readiness-summary-v0.1"
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
      summary.draftPickValidationReadinessPhase,
      "draft-pick-validation-boundary-ready-validation-blocked"
    );
  });

  it("reports result shape ready while real validation result creation remains blocked", () => {
    assert.equal(
      summary.validationResultReadinessPhase,
      "draft-pick-validation-result-shape-ready-creation-blocked"
    );
    assert.equal(summary.capabilityFlags.validationResultShapeDefined, true);
    assert.equal(summary.capabilityFlags.canCreateRealValidationResult, false);
    assert.ok(
      summary.blockedReasonIds.includes(
        "real-validation-result-creation-not-implemented"
      )
    );
  });

  it("reports blocked phase when validation boundary readiness is invalid", () => {
    const blockedSummary = createNewGMModeDraftPickValidationResultReadinessSummary({
      draftPickValidationReadinessSummary: {
        draftPickValidationReadinessPhase:
          "draft-pick-validation-boundary-blocked-by-selection-intent"
      }
    });
    const malformedSummary =
      createNewGMModeDraftPickValidationResultReadinessSummary({
        draftPickValidationReadinessSummary: {
          draftPickValidationReadinessPhase: "unknown"
        }
      });

    assert.equal(
      blockedSummary.validationResultReadinessPhase,
      "draft-pick-validation-result-shape-blocked-by-validation-boundary"
    );
    assert.equal(
      malformedSummary.draftPickValidationReadinessPhase,
      "unavailable"
    );
    assert.equal(
      malformedSummary.validationResultReadinessPhase,
      "draft-pick-validation-result-shape-blocked-by-validation-boundary"
    );
  });

  it("surfaces result contract requirement IDs and static issue catalog IDs", () => {
    assert.deepEqual(summary.resultContractRequirementIds, [
      "validation-result-id-requirement",
      "source-selection-intent-reference-requirement",
      "candidate-object-reference-requirement",
      "fixture-wrestler-reference-requirement",
      "selecting-brand-reference-requirement",
      "draft-round-pick-number-reference-requirement",
      "validation-status-requirement",
      "issue-ids-requirement",
      "blocked-capability-flags-requirement",
      "future-draft-pick-creation-prerequisite"
    ]);
    assert.deepEqual(summary.staticIssueCatalogIds, [
      "candidate-reference-missing",
      "candidate-not-found",
      "candidate-ineligible",
      "selection-intent-invalid",
      "draft-order-invalid",
      "brand-context-invalid",
      "duplicate-pick-blocked",
      "roster-capacity-blocked",
      "draft-state-unavailable",
      "validation-not-implemented"
    ]);
  });

  it("keeps candidate eligibility validation, real validation result creation, draft pick creation, execution, assignment, persistence, mutation, gameplay start, and Week 1 unlock blocked", () => {
    assert.deepEqual(summary.capabilityFlags, {
      validationResultShapeDefined: true,
      canCreateRealValidationResult: false,
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

  it("does not expose selected wrestler, selected candidate object, draft pick objects, state, persistence, UI, generated text, GenAI, or action payload fields", () => {
    assertForbiddenFieldsAbsent(summary);
    assert.equal(existsSync(UNTOUCHED_VALIDATION_RESULT_READINESS_DATABASE), false);
  });

  it("exports the validation result readiness summary factory from the domain barrel", () => {
    assert.equal(
      typeof createNewGMModeDraftPickValidationResultReadinessSummary,
      "function"
    );
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed =
      "new-gm-mode-draft-pick-validation-result-readiness-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeDraftPickValidationResultReadinessSummary({
      draftPickValidationReadinessSummary: validationReadinessSummary
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
    "draftPickObject",
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
