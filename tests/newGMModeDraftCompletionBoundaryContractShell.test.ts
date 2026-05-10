import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  createNewGMModeDraftCompletionBoundaryContractShell
} from "../src/game/domain/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const UNTOUCHED_DRAFT_COMPLETION_BOUNDARY_DATABASE =
  "data/saves/__new-gm-mode-draft-completion-boundary-should-not-exist.sqlite";
const contract = createNewGMModeDraftCompletionBoundaryContractShell();

describe("New GM Mode Draft Completion Boundary Contract Shell v0.1", () => {
  it("exposes stable ordered requirement IDs", () => {
    assert.equal(
      contract.draftCompletionBoundaryContractId,
      "new-gm-mode-draft-completion-boundary-contract-v0.1"
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
        "valid-roster-state-object-readiness-prerequisite",
        "roster-completeness-prerequisite",
        "brand-roster-minimum-prerequisite",
        "duplicate-membership-prevention-prerequisite",
        "championship-division-setup-prerequisite",
        "save-identity-prerequisite",
        "persistence-prerequisite",
        "gameplay-start-prerequisite",
        "week-one-initialization-prerequisite"
      ]
    );
    assert.deepEqual(
      contract.orderedRequirements.map((requirement) => requirement.slug),
      contract.orderedRequirements.map((requirement) => requirement.id)
    );
  });

  it("reports real draft completion as blocked", () => {
    assert.equal(contract.realDraftCompletionUnavailable, true);
    assert.equal(contract.capabilityFlags.draftCompletionShapeDefined, true);
    assert.equal(contract.capabilityFlags.canCompleteDraft, false);
    assert.ok(
      contract.blockedReasonIds.includes("draft-completion-not-implemented")
    );
  });

  it("keeps draft completion, gameplay start, Week 1 initialization, persistence, UI, generated text, and GenAI blocked", () => {
    assert.deepEqual(contract.capabilityFlags, {
      draftCompletionShapeDefined: true,
      rosterStateObjectReadinessConsumable: true,
      canCompleteDraft: false,
      canStartGameplay: false,
      canInitializeWeekOne: false,
      canUnlockWeekOne: false,
      canPersistGameplayPayload: false,
      canWriteDatabase: false,
      canMutateState: false,
      canCreateUserInterface: false,
      canCreateGeneratedText: false,
      canUseGenAI: false
    });
  });

  it("does not expose real draft completion, gameplay start state, Week 1 state, roster mutation, persistence, UI, generated text, GenAI, or action payload fields", () => {
    assertForbiddenFieldsAbsent(contract);
    assert.equal(existsSync(UNTOUCHED_DRAFT_COMPLETION_BOUNDARY_DATABASE), false);
  });

  it("exports the draft completion boundary contract from the domain barrel", () => {
    assert.equal(
      typeof createNewGMModeDraftCompletionBoundaryContractShell,
      "function"
    );
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "new-gm-mode-draft-completion-boundary-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeDraftCompletionBoundaryContractShell();

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
    "draftCompletion",
    "draftCompletionObject",
    "draftCompletionResult",
    "draftCompletionState",
    "gameplayStart",
    "gameplayStartState",
    "weekOneState",
    "rosterMutation",
    "realRosterMutation",
    "championshipDivision",
    "championshipDivisionAssignment",
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
