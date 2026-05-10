import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  createNewGMModeGameplayStartBoundaryContractShell
} from "../src/game/domain/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const UNTOUCHED_GAMEPLAY_START_BOUNDARY_DATABASE =
  "data/saves/__new-gm-mode-gameplay-start-boundary-should-not-exist.sqlite";
const contract = createNewGMModeGameplayStartBoundaryContractShell();

describe("New GM Mode Gameplay Start Boundary Contract Shell v0.1", () => {
  it("exposes stable ordered requirement IDs", () => {
    assert.equal(
      contract.gameplayStartBoundaryContractId,
      "new-gm-mode-gameplay-start-boundary-contract-v0.1"
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
    assert.equal(contract.realGameplayStartUnavailable, true);
    assert.deepEqual(
      contract.orderedRequirements.map((requirement) => requirement.id),
      [
        "valid-roster-state-object-readiness-prerequisite",
        "brand-roster-completeness-prerequisite",
        "minimum-roster-count-prerequisite",
        "division-championship-setup-prerequisite",
        "schedule-calendar-prerequisite",
        "save-identity-prerequisite",
        "persistence-prerequisite",
        "week-one-initialization-prerequisite"
      ]
    );
    assert.deepEqual(
      contract.orderedRequirements.map((requirement) => requirement.slug),
      contract.orderedRequirements.map((requirement) => requirement.id)
    );
  });

  it("reports real gameplay start as blocked", () => {
    assert.equal(
      contract.capabilityFlags.rosterStateObjectReadinessConsumable,
      true
    );
    assert.equal(contract.capabilityFlags.canStartGameplay, false);
    assert.ok(contract.blockedReasons.includes("gameplay-start-not-implemented"));
    assert.ok(
      contract.blockedReasons.includes(
        "week-one-initialization-not-implemented"
      )
    );
  });

  it("keeps roster mutation, persistence, gameplay start, Week 1 initialization, UI, generated text, and GenAI blocked", () => {
    assert.deepEqual(contract.capabilityFlags, {
      rosterStateObjectReadinessConsumable: true,
      canMutateRosterState: false,
      canCreateOrMutateRosterState: false,
      canAssignRoster: false,
      canAssignChampionshipOrDivision: false,
      canCreateMatchShowWeekOrCalendarState: false,
      canPersistGameplayPayload: false,
      canWriteDatabase: false,
      canMutateState: false,
      canStartGameplay: false,
      canInitializeWeekOne: false,
      canUnlockWeekOne: false,
      canCreateUserInterface: false,
      canCreateGeneratedText: false,
      canUseGenAI: false
    });
  });

  it("does not expose selected wrestler, selected candidate object, state objects, persistence, UI, generated text, GenAI, or action payload fields", () => {
    assertForbiddenFieldsAbsent(contract);
    assert.equal(existsSync(UNTOUCHED_GAMEPLAY_START_BOUNDARY_DATABASE), false);
  });

  it("exports the gameplay start boundary contract from the domain barrel", () => {
    assert.equal(
      typeof createNewGMModeGameplayStartBoundaryContractShell,
      "function"
    );
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "new-gm-mode-gameplay-start-boundary-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeGameplayStartBoundaryContractShell();

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
    "realRosterMutation",
    "championshipDivision",
    "match",
    "show",
    "week",
    "calendar",
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
