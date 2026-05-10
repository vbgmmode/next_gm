import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  createNewGMModeRosterStateBlockedReasonCatalog,
  createNewGMModeRosterStateContractShell
} from "../src/game/domain/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const UNTOUCHED_ROSTER_STATE_CONTRACT_DATABASE =
  "data/saves/__new-gm-mode-roster-state-contract-should-not-exist.sqlite";
const contract = createNewGMModeRosterStateContractShell();

describe("New GM Mode Roster State Contract Shell v0.1", () => {
  it("exposes stable ordered requirement IDs for the future roster state shape", () => {
    assert.equal(
      contract.newGMModeRosterStateContractId,
      "new-gm-mode-roster-state-contract-v0.1"
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
    assert.equal(contract.realRosterStateCreationOrMutationUnavailable, true);
    assert.deepEqual(
      contract.orderedRequirements.map((requirement) => requirement.id),
      [
        "roster-state-id-requirement",
        "brand-roster-reference-requirement",
        "assigned-wrestler-membership-list-requirement",
        "source-roster-assignment-result-references-requirement",
        "roster-capacity-rules-requirement",
        "duplicate-membership-rules-requirement",
        "division-reference-placeholders-requirement",
        "championship-adjacency-placeholders-requirement",
        "roster-state-status-requirement",
        "mutation-version-placeholder-requirement",
        "persistence-prerequisite",
        "gameplay-unlock-prerequisite"
      ]
    );
    assert.deepEqual(
      contract.orderedRequirements.map((requirement) => requirement.slug),
      contract.orderedRequirements.map((requirement) => requirement.id)
    );
  });

  it("reports real roster state creation and mutation as blocked", () => {
    const catalog = createNewGMModeRosterStateBlockedReasonCatalog();

    assert.equal(contract.capabilityFlags.rosterStateShapeDefined, true);
    assert.equal(contract.capabilityFlags.canCreateOrMutateRosterState, false);
    assert.deepEqual(contract.blockedReasonIds, catalog.blockedReasonIds);
    assert.ok(
      contract.blockedReasonIds.includes(
        "roster-state-creation-not-implemented"
      )
    );
  });

  it("keeps roster state creation or mutation, persistence, gameplay start, and Week 1 unlock blocked", () => {
    assert.deepEqual(contract.capabilityFlags, {
      rosterStateShapeDefined: true,
      canCreateOrMutateRosterState: false,
      canAssignRoster: false,
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

  it("does not expose selected wrestler, selected candidate object, state objects, persistence, UI, generated text, GenAI, or action payload fields", () => {
    assertForbiddenFieldsAbsent(contract);
    assert.equal(existsSync(UNTOUCHED_ROSTER_STATE_CONTRACT_DATABASE), false);
  });

  it("exports the roster state contract shell from the domain barrel", () => {
    assert.equal(typeof createNewGMModeRosterStateContractShell, "function");
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "new-gm-mode-roster-state-contract-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeRosterStateContractShell();

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
    "rosterStateObject",
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
