import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  createNewGMModeDraftPickExecutionBlockedReasonCatalog,
  createNewGMModeDraftPickExecutionResultContractShell
} from "../src/game/domain/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const UNTOUCHED_DRAFT_PICK_EXECUTION_RESULT_CONTRACT_DATABASE =
  "data/saves/__new-gm-mode-draft-pick-execution-result-contract-should-not-exist.sqlite";
const contract = createNewGMModeDraftPickExecutionResultContractShell();

describe("New GM Mode Draft Pick Execution Result Contract Shell v0.1", () => {
  it("exposes stable ordered requirement IDs for the future execution result shape", () => {
    assert.equal(
      contract.draftPickExecutionResultContractId,
      "new-gm-mode-draft-pick-execution-result-contract-v0.1"
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
    assert.equal(contract.realExecutionResultUnavailable, true);
    assert.deepEqual(
      contract.orderedRequirements.map((requirement) => requirement.id),
      [
        "execution-result-id-requirement",
        "source-draft-pick-object-reference-requirement",
        "source-validation-result-object-reference-requirement",
        "source-selection-intent-object-reference-requirement",
        "candidate-object-reference-requirement",
        "fixture-wrestler-reference-requirement",
        "selecting-brand-reference-requirement",
        "draft-round-pick-number-reference-requirement",
        "execution-status-requirement",
        "execution-blocked-reason-ids-requirement",
        "draft-state-mutation-prerequisite",
        "roster-assignment-prerequisite",
        "transaction-safety-prerequisite",
        "rollback-prerequisite",
        "persistence-prerequisite",
        "gameplay-unlock-prerequisite"
      ]
    );
    assert.deepEqual(
      contract.orderedRequirements.map((requirement) => requirement.slug),
      contract.orderedRequirements.map((requirement) => requirement.id)
    );
  });

  it("reports real execution result creation as blocked", () => {
    const catalog = createNewGMModeDraftPickExecutionBlockedReasonCatalog();

    assert.equal(contract.capabilityFlags.executionResultShapeDefined, true);
    assert.equal(contract.capabilityFlags.canCreateExecutionResult, false);
    assert.equal(contract.capabilityFlags.canExecuteDraftPick, false);
    assert.deepEqual(contract.blockedReasonIds, catalog.blockedReasonIds);
    assert.ok(
      contract.blockedReasonIds.includes("draft-pick-execution-not-implemented")
    );
  });

  it("keeps execution, draft state mutation, roster assignment, persistence, gameplay start, and Week 1 unlock blocked", () => {
    assert.deepEqual(contract.capabilityFlags, {
      executionResultShapeDefined: true,
      canCreateExecutionResult: false,
      canExecuteDraftPick: false,
      canMutateDraftState: false,
      canAssignRoster: false,
      canCreateOrMutateRosterState: false,
      canAssignChampionshipOrDivision: false,
      canCreateMatchShowOrWeekState: false,
      canPersistGameplayPayload: false,
      canWriteDatabase: false,
      canMutateState: false,
      canStartGameplay: false,
      canUnlockWeekOne: false,
      canCreateUserInterface: false,
      canCreateGeneratedText: false,
      canUseGenAI: false
    });
  });

  it("does not expose selected wrestler, selected candidate object, execution result object, state, persistence, UI, generated text, GenAI, or action payload fields", () => {
    assertForbiddenFieldsAbsent(contract);
    assert.equal(
      existsSync(UNTOUCHED_DRAFT_PICK_EXECUTION_RESULT_CONTRACT_DATABASE),
      false
    );
  });

  it("exports the draft pick execution result contract shell from the domain barrel", () => {
    assert.equal(
      typeof createNewGMModeDraftPickExecutionResultContractShell,
      "function"
    );
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed =
      "new-gm-mode-draft-pick-execution-result-contract-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeDraftPickExecutionResultContractShell();

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
    "executionResultObject",
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
