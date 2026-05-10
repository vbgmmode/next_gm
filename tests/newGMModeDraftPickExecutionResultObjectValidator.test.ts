import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  createNewGMModeDraftPickExecutionResultObject,
  createNewGMModeDraftPickExecutionResultObjectValidator
} from "../src/game/domain/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const explicitInput = {
  sourceDraftPickObjectId: "new-gm-mode-draft-pick-object:alpha",
  sourceValidationResultObjectId:
    "new-gm-mode-draft-pick-validation-result:alpha",
  sourceSelectionIntentObjectId:
    "new-gm-mode-draft-selection-intent:alpha",
  candidateObjectId: "new-gm-mode-draft-pick-candidate:wrestler-alpha",
  sourceFixtureId: "wrestler-alpha",
  sourceWrestlerId: "wrestler-alpha",
  selectingBrandId: "brand-red-placeholder",
  draftRound: 1,
  draftPickNumber: 3,
  executionStatus:
    "draft-pick-execution-result-created-mutation-unavailable" as const,
  blockedReasonIds: [
    "draft-state-unavailable",
    "draft-pick-execution-not-implemented"
  ] as const
};
const executionResultObject =
  createNewGMModeDraftPickExecutionResultObject(explicitInput);

describe("New GM Mode Draft Pick Execution Result Object Validator v0.1", () => {
  it("accepts a generated execution result object as structurally valid", () => {
    const result = createNewGMModeDraftPickExecutionResultObjectValidator({
      executionResultObject
    });

    assert.equal(
      result.validatorId,
      "new-gm-mode-draft-pick-execution-result-object-validator-v0.1"
    );
    assert.equal(result.version, "0.1");
    assert.equal(result.domainObject, true);
    assert.equal(result.diagnosticsOnly, false);
    assert.equal(result.playerFacing, false);
    assert.equal(result.gameplayAffecting, false);
    assert.equal(result.mutable, false);
    assert.equal(result.validationOnly, true);
    assert.equal(result.structurallyValid, true);
    assert.equal(result.issueCount, 0);
    assert.deepEqual(result.issues, []);
  });

  it("produces deterministic issue IDs for malformed injected execution result objects", () => {
    const malformed = JSON.parse(JSON.stringify(executionResultObject));
    delete malformed.sourceDraftPickReference.sourceDraftPickObjectId;
    delete malformed.sourceValidationResultReference.sourceValidationResultObjectId;
    delete malformed.sourceSelectionIntentReference.sourceSelectionIntentObjectId;
    delete malformed.sourceCandidateReference.candidateObjectId;
    const first = issueIdsFor(malformed);
    const second = issueIdsFor(malformed);

    assert.deepEqual(first, [
      "source-draft-pick-object-id-reference-missing",
      "source-validation-result-object-id-reference-missing",
      "source-selection-intent-object-id-reference-missing",
      "candidate-object-id-reference-missing"
    ]);
    assert.deepEqual(first, second);
  });

  it("detects missing or mismatched draftPickExecutionResultObjectId", () => {
    const missing = JSON.parse(JSON.stringify(executionResultObject));
    delete missing.draftPickExecutionResultObjectId;
    const mismatched = {
      ...executionResultObject,
      draftPickExecutionResultObjectId: "not-the-deterministic-id"
    };

    assert.deepEqual(issueIdsFor(missing), [
      "draft-pick-execution-result-object-id-missing"
    ]);
    assert.deepEqual(issueIdsFor(mismatched), [
      "draft-pick-execution-result-object-id-not-deterministic"
    ]);
  });

  it("detects missing required references", () => {
    const malformed = JSON.parse(JSON.stringify(executionResultObject));
    delete malformed.sourceDraftPickReference.sourceDraftPickObjectId;
    delete malformed.sourceValidationResultReference.sourceValidationResultObjectId;
    delete malformed.sourceSelectionIntentReference.sourceSelectionIntentObjectId;
    delete malformed.sourceCandidateReference.candidateObjectId;
    delete malformed.sourceFixtureReference.sourceFixtureId;
    delete malformed.sourceWrestlerReference.sourceWrestlerId;
    delete malformed.selectingBrandReference.selectingBrandId;
    delete malformed.draftOrderReference.draftRound;
    delete malformed.draftOrderReference.draftPickNumber;

    assert.deepEqual(issueIdsFor(malformed), [
      "source-draft-pick-object-id-reference-missing",
      "source-validation-result-object-id-reference-missing",
      "source-selection-intent-object-id-reference-missing",
      "candidate-object-id-reference-missing",
      "source-fixture-id-reference-missing",
      "source-wrestler-id-reference-missing",
      "selecting-brand-id-reference-missing",
      "draft-round-reference-missing",
      "draft-pick-number-reference-missing"
    ]);
  });

  it("detects unknown executionStatus", () => {
    const malformed = {
      ...executionResultObject,
      executionStatus: "execution-status-from-candidate-data"
    };

    assert.deepEqual(issueIdsFor(malformed), [
      "draft-pick-execution-result-object-id-not-deterministic",
      "execution-status-unknown"
    ]);
  });

  it("detects missing blockedReasonIds and IDs outside the static execution catalog", () => {
    const missing = JSON.parse(JSON.stringify(executionResultObject));
    delete missing.blockedReasonReferences.blockedReasonIds;
    const unknown = JSON.parse(JSON.stringify(executionResultObject));
    unknown.blockedReasonReferences.blockedReasonIds = [
      "not-in-static-catalog"
    ];

    assert.deepEqual(issueIdsFor(missing), ["blocked-reason-ids-missing"]);
    assert.deepEqual(issueIdsFor(unknown), [
      "draft-pick-execution-result-object-id-not-deterministic",
      "blocked-reason-id-not-in-static-catalog"
    ]);
  });

  it("detects incorrect domain flags", () => {
    const malformed = {
      ...executionResultObject,
      domainObject: false,
      diagnosticsOnly: true,
      playerFacing: true,
      gameplayAffecting: true,
      mutable: true
    };

    assert.deepEqual(issueIdsFor(malformed), [
      "domain-object-flag-invalid",
      "diagnostics-only-flag-invalid",
      "player-facing-flag-invalid",
      "gameplay-affecting-flag-invalid",
      "mutable-flag-invalid"
    ]);
  });

  it("detects missing or incorrectly enabled capability flags", () => {
    const missingFlags = JSON.parse(JSON.stringify(executionResultObject));
    delete missingFlags.capabilityFlags;
    const enabled = JSON.parse(JSON.stringify(executionResultObject));
    enabled.capabilityFlags.canMutateDraftState = true;
    enabled.capabilityFlags.canAssignRoster = true;
    enabled.capabilityFlags.canCreateOrMutateRosterState = true;
    enabled.capabilityFlags.canPersistGameplayPayload = true;
    enabled.capabilityFlags.canStartGameplay = true;
    enabled.capabilityFlags.canUnlockWeekOne = true;

    assert.deepEqual(issueIdsFor(missingFlags), ["capability-flags-missing"]);
    assert.deepEqual(issueIdsFor(enabled), [
      "capability-flag-invalid",
      "capability-flag-invalid",
      "capability-flag-invalid",
      "capability-flag-invalid",
      "capability-flag-invalid",
      "capability-flag-invalid"
    ]);
  });

  it("detects forbidden selected wrestler, selected candidate object, state, persistence, UI, generated text, and GenAI fields", () => {
    const malformed = {
      ...executionResultObject,
      selectedWrestler: "not-allowed",
      selectedCandidateObject: {},
      draftState: {},
      rosterAssignment: {},
      rosterState: {},
      championshipDivision: {},
      match: {},
      show: {},
      week: {},
      save: {},
      sqlite: {},
      ui: {},
      generatedText: "",
      genAI: {}
    };

    assert.equal(
      issueIdsFor(malformed).filter(
        (issueId) => issueId === "forbidden-field-present"
      ).length,
      14
    );
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed =
      "new-gm-mode-draft-pick-execution-result-object-validator-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeDraftPickExecutionResultObjectValidator({
      executionResultObject
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

function issueIdsFor(source: unknown): readonly string[] {
  return createNewGMModeDraftPickExecutionResultObjectValidator({
    executionResultObject: source
  }).issues.map((issue) => issue.issueId);
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
