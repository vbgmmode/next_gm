import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  createNewGMModeDraftPickCreationBoundaryContractShell,
  createNewGMModeDraftPickCreationReadinessSummary,
  createNewGMModeDraftPickValidationResultObject,
  createNewGMModeDraftPickValidationResultObjectReadinessSummary
} from "../src/game/domain/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const UNTOUCHED_DRAFT_PICK_CREATION_READINESS_DATABASE =
  "data/saves/__new-gm-mode-draft-pick-creation-readiness-should-not-exist.sqlite";
const explicitInput = {
  sourceSelectionIntentObjectId:
    "new-gm-mode-draft-selection-intent:new-gm-mode-draft-pick-candidate-wrestler-alpha:wrestler-alpha:wrestler-alpha:brand-red-placeholder:round-1:pick-3",
  candidateObjectId: "new-gm-mode-draft-pick-candidate:wrestler-alpha",
  sourceFixtureId: "wrestler-alpha",
  sourceWrestlerId: "wrestler-alpha",
  selectingBrandId: "brand-red-placeholder",
  draftRound: 1,
  draftPickNumber: 3,
  validationStatus: "validation-result-created-real-validation-unavailable" as const,
  issueIds: ["validation-not-implemented"] as const
};
const validationResultObject =
  createNewGMModeDraftPickValidationResultObject(explicitInput);
const directValidationResultObjectReadiness =
  createNewGMModeDraftPickValidationResultObjectReadinessSummary({
    validationResultObject
  });
const summary = createNewGMModeDraftPickCreationReadinessSummary({
  validationResultObject
});

describe("New GM Mode Draft Pick Creation Readiness Summary v0.1", () => {
  it("consumes validation-result object readiness from the injected validation result object", () => {
    assert.equal(
      summary.draftPickCreationReadinessSummaryId,
      "new-gm-mode-draft-pick-creation-readiness-summary-v0.1"
    );
    assert.equal(summary.version, "0.1");
    assert.equal(summary.domainObject, true);
    assert.equal(summary.diagnosticsOnly, true);
    assert.equal(summary.playerFacing, false);
    assert.equal(summary.gameplayAffecting, false);
    assert.equal(summary.mutable, false);
    assert.equal(summary.shallowSummary, true);
    assert.equal(summary.deterministicOrdering, true);
    assert.equal(summary.validationResultObjectReadinessConsumed, true);
    assert.equal(
      summary.validationResultObjectReadinessPhase,
      directValidationResultObjectReadiness.validationResultObjectReadinessPhase
    );
    assert.deepEqual(
      summary.validationResultObjectValidatorStatus,
      directValidationResultObjectReadiness.validatorStatus
    );
  });

  it("reports the creation boundary ready while real draft pick object creation remains blocked", () => {
    assert.equal(
      summary.validationResultObjectReadinessPhase,
      "draft-pick-validation-result-object-valid-pick-creation-unavailable"
    );
    assert.equal(
      summary.draftPickCreationReadinessPhase,
      "draft-pick-creation-boundary-ready-creation-blocked"
    );
    assert.equal(
      summary.capabilityFlags.validationResultObjectReadinessConsumable,
      true
    );
    assert.equal(summary.capabilityFlags.validationResultObjectReadinessConsumed, true);
    assert.equal(summary.capabilityFlags.canCreateDraftPickObject, false);
    assert.equal(summary.capabilityFlags.canCreateDraftPick, false);
  });

  it("reports blocked phase when validation-result object readiness is invalid", () => {
    const malformed = JSON.parse(JSON.stringify(validationResultObject));
    delete malformed.sourceCandidateReference.candidateObjectId;
    const invalidSummary = createNewGMModeDraftPickCreationReadinessSummary({
      validationResultObject: malformed
    });

    assert.equal(
      invalidSummary.validationResultObjectReadinessPhase,
      "draft-pick-validation-result-object-invalid"
    );
    assert.equal(
      invalidSummary.draftPickCreationReadinessPhase,
      "draft-pick-creation-boundary-blocked-by-validation-result"
    );
    assert.deepEqual(invalidSummary.validationResultObjectValidatorStatus.issueIds, [
      "candidate-object-id-reference-missing"
    ]);
  });

  it("surfaces creation boundary requirement IDs and blocked reason IDs", () => {
    const boundary = createNewGMModeDraftPickCreationBoundaryContractShell();

    assert.deepEqual(
      summary.creationBoundaryRequirementIds,
      boundary.orderedRequirements.map((requirement) => requirement.id)
    );
    assert.deepEqual(
      summary.creationBoundaryBlockedReasonIds,
      boundary.blockedReasons
    );
    assert.deepEqual(summary.creationBoundaryRequirementIds, [
      "valid-validation-result-object-readiness-prerequisite",
      "validation-result-status-prerequisite",
      "candidate-object-reference-prerequisite",
      "selection-intent-reference-prerequisite",
      "draft-order-prerequisite",
      "brand-context-prerequisite",
      "duplicate-pick-prevention-prerequisite",
      "future-draft-state-prerequisite",
      "future-roster-assignment-prerequisite"
    ]);
  });

  it("keeps draft pick object creation, execution, assignment, persistence, mutation, gameplay start, and Week 1 unlock blocked", () => {
    assert.equal(summary.capabilityFlags.canCreateDraftPickObject, false);
    assert.equal(summary.capabilityFlags.canCreateDraftPick, false);
    assert.equal(summary.capabilityFlags.canExecuteDraftPick, false);
    assert.equal(summary.capabilityFlags.canAssignRoster, false);
    assert.equal(summary.capabilityFlags.canCreateOrMutateRosterState, false);
    assert.equal(summary.capabilityFlags.canPersistGameplayPayload, false);
    assert.equal(summary.capabilityFlags.canWriteDatabase, false);
    assert.equal(summary.capabilityFlags.canMutateState, false);
    assert.equal(summary.capabilityFlags.canStartGameplay, false);
    assert.equal(summary.capabilityFlags.canUnlockWeekOne, false);
  });

  it("does not expose selected wrestler, selected candidate object, draft pick IDs or objects, state, persistence, UI, generated text, GenAI, or action payload fields", () => {
    assertForbiddenFieldsAbsent(summary);
    assert.equal(existsSync(UNTOUCHED_DRAFT_PICK_CREATION_READINESS_DATABASE), false);
  });

  it("exports the draft pick creation readiness summary from the domain barrel", () => {
    assert.equal(typeof createNewGMModeDraftPickCreationReadinessSummary, "function");
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed =
      "new-gm-mode-draft-pick-creation-readiness-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeDraftPickCreationReadinessSummary({
      validationResultObject
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
