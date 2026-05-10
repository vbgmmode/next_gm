import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  createNewGMModeDraftPickValidationBoundaryContractShell
} from "../src/game/domain/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const UNTOUCHED_DRAFT_PICK_VALIDATION_BOUNDARY_DATABASE =
  "data/saves/__new-gm-mode-draft-pick-validation-boundary-should-not-exist.sqlite";
const contract = createNewGMModeDraftPickValidationBoundaryContractShell();

describe("New GM Mode Draft Pick Validation Boundary Contract Shell v0.1", () => {
  it("exposes stable ordered requirement IDs", () => {
    assert.equal(
      contract.draftPickValidationBoundaryContractId,
      "new-gm-mode-draft-pick-validation-boundary-contract-v0.1"
    );
    assert.equal(contract.status, "diagnostics-only");
    assert.equal(contract.version, "0.1");
    assert.equal(contract.domainObject, true);
    assert.equal(contract.diagnosticsOnly, true);
    assert.equal(contract.playerFacing, false);
    assert.equal(contract.gameplayAffecting, false);
    assert.equal(contract.mutable, false);
    assert.equal(contract.deterministicOrdering, true);
    assert.equal(contract.shallowBoundary, true);
    assert.deepEqual(
      contract.orderedRequirements.map((requirement) => requirement.id),
      [
        "valid-selection-intent-readiness-prerequisite",
        "candidate-object-lookup-prerequisite",
        "candidate-eligibility-prerequisite",
        "draft-order-prerequisite",
        "brand-selection-context-prerequisite",
        "duplicate-pick-prevention-prerequisite",
        "roster-capacity-prerequisite",
        "future-draft-state-prerequisite",
        "future-validation-result-prerequisite"
      ]
    );
  });

  it("reports real validation as blocked", () => {
    assert.equal(contract.capabilityFlags.selectionIntentReadinessConsumable, true);
    assert.equal(contract.capabilityFlags.canValidateCandidateEligibility, false);
    assert.equal(contract.capabilityFlags.canValidateDraftPick, false);
    assert.ok(
      contract.blockedReasons.includes(
        "candidate-eligibility-validation-not-implemented"
      )
    );
    assert.ok(
      contract.blockedReasons.includes("validation-result-not-implemented")
    );
  });

  it("keeps draft pick validation, creation, execution, assignment, persistence, mutation, gameplay start, and Week 1 unlock blocked", () => {
    assert.deepEqual(contract.capabilityFlags, {
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
    assertForbiddenFieldsAbsent(contract);
    assert.equal(
      existsSync(UNTOUCHED_DRAFT_PICK_VALIDATION_BOUNDARY_DATABASE),
      false
    );
  });

  it("exports the boundary contract factory from the domain barrel", () => {
    assert.equal(
      typeof createNewGMModeDraftPickValidationBoundaryContractShell,
      "function"
    );
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed =
      "new-gm-mode-draft-pick-validation-boundary-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeDraftPickValidationBoundaryContractShell();

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
