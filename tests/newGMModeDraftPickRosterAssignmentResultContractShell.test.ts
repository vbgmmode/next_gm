import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  createNewGMModeDraftPickRosterAssignmentBlockedReasonCatalog,
  createNewGMModeDraftPickRosterAssignmentResultContractShell
} from "../src/game/domain/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const UNTOUCHED_ROSTER_ASSIGNMENT_RESULT_CONTRACT_DATABASE =
  "data/saves/__new-gm-mode-draft-pick-roster-assignment-result-contract-should-not-exist.sqlite";
const contract = createNewGMModeDraftPickRosterAssignmentResultContractShell();

describe("New GM Mode Draft Pick Roster Assignment Result Contract Shell v0.1", () => {
  it("exposes stable ordered requirement IDs for the future assignment result shape", () => {
    assert.equal(
      contract.draftPickRosterAssignmentResultContractId,
      "new-gm-mode-draft-pick-roster-assignment-result-contract-v0.1"
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
    assert.equal(contract.realAssignmentResultUnavailable, true);
    assert.deepEqual(
      contract.orderedRequirements.map((requirement) => requirement.id),
      [
        "roster-assignment-result-id-requirement",
        "source-execution-result-object-reference-requirement",
        "source-draft-pick-object-reference-requirement",
        "candidate-object-reference-requirement",
        "fixture-wrestler-reference-requirement",
        "selecting-brand-reference-requirement",
        "roster-slot-reference-placeholder-requirement",
        "assignment-status-requirement",
        "assignment-blocked-reason-ids-requirement",
        "roster-state-mutation-prerequisite",
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

  it("reports real assignment result creation as blocked", () => {
    const catalog = createNewGMModeDraftPickRosterAssignmentBlockedReasonCatalog();

    assert.equal(contract.capabilityFlags.assignmentResultShapeDefined, true);
    assert.equal(contract.capabilityFlags.canCreateAssignmentResult, false);
    assert.equal(contract.capabilityFlags.canAssignRoster, false);
    assert.deepEqual(contract.blockedReasonIds, catalog.blockedReasonIds);
    assert.ok(
      contract.blockedReasonIds.includes("roster-assignment-not-implemented")
    );
  });

  it("keeps roster assignment, roster state mutation, persistence, gameplay start, and Week 1 unlock blocked", () => {
    assert.deepEqual(contract.capabilityFlags, {
      assignmentResultShapeDefined: true,
      canCreateAssignmentResult: false,
      canAssignRoster: false,
      canCreateOrMutateRosterState: false,
      canAssignChampionshipOrDivision: false,
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

  it("does not expose selected wrestler, selected candidate object, state, assignment result object, persistence, UI, generated text, GenAI, or action payload fields", () => {
    assertForbiddenFieldsAbsent(contract);
    assert.equal(
      existsSync(UNTOUCHED_ROSTER_ASSIGNMENT_RESULT_CONTRACT_DATABASE),
      false
    );
  });

  it("exports the roster assignment result contract shell from the domain barrel", () => {
    assert.equal(
      typeof createNewGMModeDraftPickRosterAssignmentResultContractShell,
      "function"
    );
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed =
      "new-gm-mode-draft-pick-roster-assignment-result-contract-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeDraftPickRosterAssignmentResultContractShell();

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
