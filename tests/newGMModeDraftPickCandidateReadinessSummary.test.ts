import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  createNewGMModeDraftPickCandidateObjects,
  createNewGMModeDraftPickCandidateReadinessSummary
} from "../src/game/domain/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const UNTOUCHED_DRAFT_PICK_CANDIDATE_READINESS_DATABASE =
  "data/saves/__new-gm-mode-draft-pick-candidate-readiness-should-not-exist.sqlite";
const candidateSet = createNewGMModeDraftPickCandidateObjects();
const summary = createNewGMModeDraftPickCandidateReadinessSummary({
  candidateSet
});

describe("New GM Mode Draft Pick Candidate Readiness Summary v0.1", () => {
  it("reports the generated candidate object layer as ready while selection remains unavailable", () => {
    assert.equal(
      summary.draftPickCandidateReadinessSummaryId,
      "new-gm-mode-draft-pick-candidate-readiness-summary-v0.1"
    );
    assert.equal(summary.version, "0.1");
    assert.equal(summary.domainObject, true);
    assert.equal(summary.diagnosticsOnly, false);
    assert.equal(summary.playerFacing, false);
    assert.equal(summary.gameplayAffecting, false);
    assert.equal(summary.mutable, false);
    assert.equal(summary.shallowSummary, true);
    assert.equal(summary.deterministicOrdering, true);
    assert.equal(summary.candidateObjectLayerAvailable, true);
    assert.equal(summary.validatorAvailable, true);
    assert.equal(
      summary.readinessPhase,
      "candidate-objects-valid-selection-unavailable"
    );
    assert.equal(summary.capabilityFlags.canUseCandidateObjects, true);
    assert.equal(summary.capabilityFlags.canSelectCandidate, false);
  });

  it("preserves full static roster candidate counts", () => {
    assert.deepEqual(summary.candidateCounts, {
      total: 245,
      eligible: 235,
      ineligible: 10,
      expectedTotal: 245,
      expectedEligible: 235,
      expectedIneligible: 10
    });
  });

  it("includes validator status and deterministic issue IDs", () => {
    assert.deepEqual(summary.validatorStatus, {
      validatorId: "new-gm-mode-draft-pick-candidate-object-validator-v0.1",
      structurallyValid: true,
      issueCount: 0,
      issueIds: []
    });

    const malformed = cloneCandidateSet();
    malformed.candidates[0].candidateId = "bad-id";
    malformed.candidates[0].readinessReasonIds = [];
    delete malformed.candidates[0].displayReadinessMarker;
    malformed.candidates[0].capabilityFlags.canStartGameplay = true;
    const malformedSummary =
      createNewGMModeDraftPickCandidateReadinessSummary({
        candidateSet: malformed
      });

    assert.equal(malformedSummary.validatorStatus.structurallyValid, false);
    assert.equal(malformedSummary.validatorStatus.issueCount, 4);
    assert.deepEqual(malformedSummary.validatorStatus.issueIds, [
      "candidate-id-format-invalid",
      "readiness-reason-ids-missing",
      "display-readiness-marker-missing",
      "capability-flag-enabled"
    ]);
  });

  it("reports invalid readiness phase for malformed injected candidate sets", () => {
    const malformed = cloneCandidateSet();
    malformed.candidates.splice(0, 1);
    const malformedSummary =
      createNewGMModeDraftPickCandidateReadinessSummary({
        candidateSet: malformed
      });

    assert.equal(
      malformedSummary.readinessPhase,
      "candidate-objects-invalid"
    );
    assert.deepEqual(malformedSummary.candidateCounts, {
      total: 244,
      eligible: 235,
      ineligible: 9,
      expectedTotal: 245,
      expectedEligible: 235,
      expectedIneligible: 10
    });
    assert.deepEqual(malformedSummary.validatorStatus.issueIds, [
      "candidate-count-not-stable",
      "ineligible-candidate-count-not-stable"
    ]);
  });

  it("keeps selection, draft pick creation, validation, execution, assignment, persistence, mutation, gameplay start, and Week 1 unlock blocked", () => {
    assert.deepEqual(summary.capabilityFlags, {
      canUseCandidateObjects: true,
      canSelectCandidate: false,
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

  it("does not expose downstream fields or action payloads", () => {
    const forbiddenFields = [
      "selectedWrestler",
      "selectedWrestlerId",
      "draftPickId",
      "selectionIntent",
      "draftSelectionIntent",
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
    const summaryKeys = collectKeys(summary);

    for (const field of forbiddenFields) {
      assert.equal(summaryKeys.includes(field), false, field);
    }
    assert.equal(
      summaryKeys.some((key) => key === "action" || key.endsWith("Action")),
      false
    );
    assert.equal(
      existsSync(UNTOUCHED_DRAFT_PICK_CANDIDATE_READINESS_DATABASE),
      false
    );
  });

  it("exports the readiness summary factory from the domain barrel", () => {
    assert.equal(
      typeof createNewGMModeDraftPickCandidateReadinessSummary,
      "function"
    );
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed =
      "new-gm-mode-draft-pick-candidate-readiness-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeDraftPickCandidateReadinessSummary({
      candidateSet
    });

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

function cloneCandidateSet(): any {
  return JSON.parse(JSON.stringify(candidateSet));
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
