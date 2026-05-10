import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  createNewGMModeDraftSelectionIntentContractShell
} from "../src/game/domain/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const UNTOUCHED_DRAFT_SELECTION_INTENT_CONTRACT_DATABASE =
  "data/saves/__new-gm-mode-draft-selection-intent-contract-should-not-exist.sqlite";
const contract = createNewGMModeDraftSelectionIntentContractShell();

describe("New GM Mode Draft Selection Intent Contract Shell v0.1", () => {
  it("exposes stable ordered requirement IDs", () => {
    assert.equal(
      contract.draftSelectionIntentContractId,
      "new-gm-mode-draft-selection-intent-contract-v0.1"
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
        "candidate-readiness-summary-availability",
        "candidate-object-id-reference-requirement",
        "source-wrestler-fixture-reference-requirement",
        "selecting-side-brand-context-placeholder",
        "draft-round-pick-order-context-placeholder",
        "selection-timestamp-placeholder",
        "future-selection-validation-prerequisite",
        "future-draft-pick-creation-prerequisite"
      ]
    );
    contract.orderedRequirements.forEach((requirement) => {
      assert.equal(requirement.slug, requirement.id);
      assert.equal(requirement.required, true);
      assert.equal(requirement.diagnosticsOnly, true);
    });
  });

  it("reports selection intent creation as blocked", () => {
    assert.equal(contract.capabilityFlags.candidateObjectsAvailable, true);
    assert.equal(
      contract.capabilityFlags.candidateReadinessSummaryAvailable,
      true
    );
    assert.equal(
      contract.capabilityFlags.draftSelectionIntentBoundaryAvailable,
      true
    );
    assert.equal(contract.capabilityFlags.canCreateSelectionIntent, false);
    assert.ok(
      contract.blockedReasons.includes(
        "real-selection-intent-creation-not-implemented"
      )
    );
  });

  it("keeps downstream capability flags unavailable", () => {
    assert.deepEqual(contract.capabilityFlags, {
      candidateObjectsAvailable: true,
      candidateReadinessSummaryAvailable: true,
      draftSelectionIntentBoundaryAvailable: true,
      canCreateSelectionIntent: false,
      canCreateDraftPick: false,
      canValidateDraftPick: false,
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

  it("does not expose selected wrestler, candidate binding, draft pick, state, persistence, UI, generated text, GenAI, or action payload fields", () => {
    assertForbiddenFieldsAbsent(contract);
    assert.equal(
      existsSync(UNTOUCHED_DRAFT_SELECTION_INTENT_CONTRACT_DATABASE),
      false
    );
  });

  it("exports the contract factory from the domain barrel", () => {
    assert.equal(
      typeof createNewGMModeDraftSelectionIntentContractShell,
      "function"
    );
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed =
      "new-gm-mode-draft-selection-intent-contract-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeDraftSelectionIntentContractShell();

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
    "draftPickId",
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
  assert.equal(keys.includes("selectionIntent"), false);
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
