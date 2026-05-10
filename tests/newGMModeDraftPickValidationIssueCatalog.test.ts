import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  createNewGMModeDraftPickValidationIssueCatalog
} from "../src/game/domain/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const UNTOUCHED_VALIDATION_ISSUE_CATALOG_DATABASE =
  "data/saves/__new-gm-mode-draft-pick-validation-issue-catalog-should-not-exist.sqlite";
const catalog = createNewGMModeDraftPickValidationIssueCatalog();

describe("New GM Mode Draft Pick Validation Issue Catalog v0.1", () => {
  it("exposes stable ordered issue IDs", () => {
    assert.equal(
      catalog.draftPickValidationIssueCatalogId,
      "new-gm-mode-draft-pick-validation-issue-catalog-v0.1"
    );
    assert.equal(catalog.version, "0.1");
    assert.equal(catalog.domainObject, true);
    assert.equal(catalog.diagnosticsOnly, true);
    assert.equal(catalog.playerFacing, false);
    assert.equal(catalog.gameplayAffecting, false);
    assert.equal(catalog.mutable, false);
    assert.equal(catalog.deterministicOrdering, true);
    assert.equal(catalog.staticCatalog, true);
    assert.equal(catalog.evaluatedNow, false);
    assert.deepEqual(catalog.issueIds, [
      "candidate-reference-missing",
      "candidate-not-found",
      "candidate-ineligible",
      "selection-intent-invalid",
      "draft-order-invalid",
      "brand-context-invalid",
      "duplicate-pick-blocked",
      "roster-capacity-blocked",
      "draft-state-unavailable",
      "validation-not-implemented"
    ]);
    assert.deepEqual(
      catalog.issues.map((issue) => issue.id),
      catalog.issueIds
    );
  });

  it("keeps the issue catalog frozen and read-only", () => {
    assert.equal(Object.isFrozen(catalog), true);
    assert.equal(Object.isFrozen(catalog.issueIds), true);
    assert.equal(Object.isFrozen(catalog.issues), true);
    assert.equal(
      catalog.issues.every((issue) => Object.isFrozen(issue)),
      true
    );
    assert.equal(
      catalog.issues.every(
        (issue) => issue.futureOnly === true && issue.evaluatedNow === false
      ),
      true
    );
  });

  it("does not expose selected wrestler, selected candidate object, draft pick objects, state, persistence, UI, generated text, GenAI, or action payload fields", () => {
    assertForbiddenFieldsAbsent(catalog);
    assert.equal(existsSync(UNTOUCHED_VALIDATION_ISSUE_CATALOG_DATABASE), false);
  });

  it("exports the issue catalog factory from the domain barrel", () => {
    assert.equal(typeof createNewGMModeDraftPickValidationIssueCatalog, "function");
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed =
      "new-gm-mode-draft-pick-validation-issue-catalog-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeDraftPickValidationIssueCatalog();

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
