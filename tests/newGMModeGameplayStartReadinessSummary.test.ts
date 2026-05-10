import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  createNewGMModeGameplayStartBoundaryContractShell,
  createNewGMModeGameplayStartReadinessSummary,
  createNewGMModeRosterStateObject,
  createNewGMModeRosterStateObjectReadinessSummary
} from "../src/game/domain/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const UNTOUCHED_GAMEPLAY_START_READINESS_DATABASE =
  "data/saves/__new-gm-mode-gameplay-start-readiness-should-not-exist.sqlite";
const explicitInput = {
  rosterStateIdSeedReference: "next-gm-roster-state-alpha",
  brandRosterReference: "brand-red-roster",
  assignedWrestlerMembershipReferences: [
    "wrestler-alpha-membership",
    "wrestler-beta-membership"
  ] as const,
  sourceRosterAssignmentResultObjectIds: [
    "new-gm-mode-draft-pick-roster-assignment-result:alpha"
  ] as const,
  rosterStateStatus:
    "roster-state-object-created-mutation-unavailable" as const,
  blockedReasonIds: [
    "persistence-unavailable",
    "roster-state-creation-not-implemented"
  ] as const,
  versionReference: "v0.1-placeholder"
};
const rosterStateObject = createNewGMModeRosterStateObject(explicitInput);
const directObjectReadiness =
  createNewGMModeRosterStateObjectReadinessSummary({ rosterStateObject });
const summary = createNewGMModeGameplayStartReadinessSummary({
  rosterStateObject
});

describe("New GM Mode Gameplay Start Readiness Summary v0.1", () => {
  it("consumes roster state object readiness from the injected object", () => {
    assert.equal(
      summary.gameplayStartReadinessSummaryId,
      "new-gm-mode-gameplay-start-readiness-summary-v0.1"
    );
    assert.equal(summary.version, "0.1");
    assert.equal(summary.domainObject, true);
    assert.equal(summary.diagnosticsOnly, true);
    assert.equal(summary.playerFacing, false);
    assert.equal(summary.gameplayAffecting, false);
    assert.equal(summary.mutable, false);
    assert.equal(summary.shallowSummary, true);
    assert.equal(summary.deterministicOrdering, true);
    assert.equal(summary.rosterStateObjectReadinessConsumed, true);
    assert.equal(
      summary.rosterStateObjectReadinessPhase,
      directObjectReadiness.rosterStateObjectReadinessPhase
    );
    assert.deepEqual(
      summary.rosterStateObjectValidatorStatus,
      directObjectReadiness.validatorStatus
    );
  });

  it("reports gameplay start boundary ready while real gameplay start remains blocked", () => {
    assert.equal(
      summary.rosterStateObjectReadinessPhase,
      "roster-state-object-valid-mutation-unavailable"
    );
    assert.equal(
      summary.gameplayStartReadinessPhase,
      "gameplay-start-boundary-ready-start-blocked"
    );
    assert.equal(
      summary.capabilityFlags.rosterStateObjectReadinessConsumable,
      true
    );
    assert.equal(summary.capabilityFlags.rosterStateObjectReadinessConsumed, true);
    assert.equal(summary.capabilityFlags.canStartGameplay, false);
  });

  it("reports blocked phase when roster state object readiness is invalid", () => {
    const malformed = JSON.parse(JSON.stringify(rosterStateObject));
    delete malformed.brandRosterReference.brandRosterReference;
    const invalidSummary = createNewGMModeGameplayStartReadinessSummary({
      rosterStateObject: malformed
    });

    assert.equal(
      invalidSummary.rosterStateObjectReadinessPhase,
      "roster-state-object-invalid"
    );
    assert.equal(
      invalidSummary.gameplayStartReadinessPhase,
      "gameplay-start-boundary-blocked-by-roster-state"
    );
    assert.deepEqual(
      invalidSummary.rosterStateObjectValidatorStatus.issueIds,
      ["brand-roster-reference-missing"]
    );
  });

  it("surfaces gameplay start requirement IDs and blocked reason IDs", () => {
    const boundary = createNewGMModeGameplayStartBoundaryContractShell();

    assert.deepEqual(
      summary.gameplayStartBoundaryRequirementIds,
      boundary.orderedRequirements.map((requirement) => requirement.id)
    );
    assert.deepEqual(
      summary.gameplayStartBoundaryBlockedReasonIds,
      boundary.blockedReasons
    );
    assert.deepEqual(summary.gameplayStartBoundaryRequirementIds, [
      "valid-roster-state-object-readiness-prerequisite",
      "brand-roster-completeness-prerequisite",
      "minimum-roster-count-prerequisite",
      "division-championship-setup-prerequisite",
      "schedule-calendar-prerequisite",
      "save-identity-prerequisite",
      "persistence-prerequisite",
      "week-one-initialization-prerequisite"
    ]);
  });

  it("keeps gameplay start, Week 1 initialization, persistence, UI, generated text, and GenAI blocked", () => {
    assert.equal(summary.capabilityFlags.canStartGameplay, false);
    assert.equal(summary.capabilityFlags.canInitializeWeekOne, false);
    assert.equal(summary.capabilityFlags.canUnlockWeekOne, false);
    assert.equal(summary.capabilityFlags.canPersistGameplayPayload, false);
    assert.equal(summary.capabilityFlags.canWriteDatabase, false);
    assert.equal(summary.capabilityFlags.canCreateUserInterface, false);
    assert.equal(summary.capabilityFlags.canCreateGeneratedText, false);
    assert.equal(summary.capabilityFlags.canUseGenAI, false);
  });

  it("does not expose draft completion, gameplay start state, roster mutation, persistence, UI, generated text, GenAI, or action payload fields", () => {
    assertForbiddenFieldsAbsent(summary);
    assert.equal(existsSync(UNTOUCHED_GAMEPLAY_START_READINESS_DATABASE), false);
  });

  it("exports the gameplay start readiness summary from the domain barrel", () => {
    assert.equal(typeof createNewGMModeGameplayStartReadinessSummary, "function");
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "new-gm-mode-gameplay-start-readiness-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeGameplayStartReadinessSummary({ rosterStateObject });

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
