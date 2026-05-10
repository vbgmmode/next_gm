import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  createNewGMModeDraftPickRosterAssignmentBlockedReasonCatalog
} from "../src/game/domain/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const UNTOUCHED_ROSTER_ASSIGNMENT_BLOCKED_REASON_DATABASE =
  "data/saves/__new-gm-mode-draft-pick-roster-assignment-blocked-reason-should-not-exist.sqlite";
const catalog = createNewGMModeDraftPickRosterAssignmentBlockedReasonCatalog();

describe("New GM Mode Draft Pick Roster Assignment Blocked Reason Catalog v0.1", () => {
  it("exposes stable ordered blocked reason IDs without evaluating real data", () => {
    assert.equal(
      catalog.catalogId,
      "new-gm-mode-draft-pick-roster-assignment-blocked-reason-catalog-v0.1"
    );
    assert.equal(catalog.version, "0.1");
    assert.equal(catalog.domainObject, true);
    assert.equal(catalog.diagnosticsOnly, true);
    assert.equal(catalog.playerFacing, false);
    assert.equal(catalog.gameplayAffecting, false);
    assert.equal(catalog.mutable, false);
    assert.equal(catalog.deterministicOrdering, true);
    assert.equal(catalog.staticCatalogOnly, true);
    assert.equal(catalog.evaluatedNow, false);
    assert.deepEqual(catalog.blockedReasonIds, [
      "execution-result-object-invalid",
      "execution-result-status-not-assignable",
      "candidate-reference-missing",
      "wrestler-reference-missing",
      "brand-reference-missing",
      "roster-capacity-unavailable",
      "duplicate-roster-membership-check-unavailable",
      "division-championship-adjacency-unavailable",
      "roster-state-unavailable",
      "roster-assignment-not-implemented"
    ]);
    assert.deepEqual(
      catalog.blockedReasons.map((reason) => reason.id),
      catalog.blockedReasonIds
    );
    assert.deepEqual(
      catalog.blockedReasons.map((reason) => reason.slug),
      catalog.blockedReasonIds
    );
    assert.deepEqual(
      catalog.blockedReasons.map((reason) => reason.evaluatedNow),
      catalog.blockedReasonIds.map(() => false)
    );
  });

  it("is frozen and read-only", () => {
    assert.equal(Object.isFrozen(catalog), true);
    assert.equal(Object.isFrozen(catalog.blockedReasonIds), true);
    assert.equal(Object.isFrozen(catalog.blockedReasons), true);
    assert.equal(
      catalog.blockedReasons.every((reason) => Object.isFrozen(reason)),
      true
    );
    assert.throws(() => {
      (catalog.blockedReasonIds as string[]).push(
        "roster-assignment-not-implemented"
      );
    }, TypeError);
  });

  it("does not expose selected wrestler, selected candidate object, state, assignment result object, persistence, UI, generated text, GenAI, or action payload fields", () => {
    assertForbiddenFieldsAbsent(catalog);
    assert.equal(
      existsSync(UNTOUCHED_ROSTER_ASSIGNMENT_BLOCKED_REASON_DATABASE),
      false
    );
  });

  it("exports the roster assignment blocked reason catalog from the domain barrel", () => {
    assert.equal(
      typeof createNewGMModeDraftPickRosterAssignmentBlockedReasonCatalog,
      "function"
    );
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed =
      "new-gm-mode-draft-pick-roster-assignment-blocked-reason-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeDraftPickRosterAssignmentBlockedReasonCatalog();

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
