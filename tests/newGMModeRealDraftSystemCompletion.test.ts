import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  createNewGMModeDraftPickCandidateObjects,
  createNewGMModeDraftPickCreationService,
  createNewGMModeDraftPickExecutionService,
  createNewGMModeDraftPickRosterAssignmentService,
  createNewGMModeDraftPickValidationResultObject,
  createNewGMModeDraftPickValidationService,
  createNewGMModeDraftSelectionIntentObject,
  createNewGMModeDraftCompletionSummary,
  createNewGMModeInMemoryDraftFlow,
  createNewGMModeRosterStateCreationService
} from "../src/game/domain/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const UNTOUCHED_REAL_DRAFT_SYSTEM_DATABASE =
  "data/saves/__new-gm-mode-real-draft-system-should-not-exist.sqlite";
const candidateSet = createNewGMModeDraftPickCandidateObjects();
const eligibleCandidate = candidateSet.candidates.find(
  (candidate) => candidate.eligibilityStatus === "eligible"
);
const ineligibleCandidate = candidateSet.candidates.find(
  (candidate) => candidate.eligibilityStatus === "ineligible"
);

if (!eligibleCandidate || !ineligibleCandidate) {
  throw new Error("Expected static candidate fixture coverage was missing.");
}

const validSelectionIntent = createNewGMModeDraftSelectionIntentObject({
  candidateObjectId: eligibleCandidate.candidateId,
  sourceFixtureId: eligibleCandidate.sourceFixtureReference.fixtureId,
  sourceWrestlerId: eligibleCandidate.wrestlerIdentityReference.wrestlerId,
  selectingBrandId: "brand-red",
  draftRound: 1,
  draftPickNumber: 1
});

describe("New GM Mode Real Draft System Completion v1.0", () => {
  it("valid eligible candidate selection produces approved validation result", () => {
    const validationResult = createNewGMModeDraftPickValidationService({
      selectionIntentObject: validSelectionIntent
    });

    assert.equal(
      validationResult.validationStatus,
      "draft-pick-validation-approved"
    );
    assert.deepEqual(validationResult.issueReferences.issueIds, []);
    assert.equal(Object.isFrozen(validationResult), true);
  });

  it("ineligible candidate selection produces blocked validation result", () => {
    const intent = createNewGMModeDraftSelectionIntentObject({
      candidateObjectId: ineligibleCandidate.candidateId,
      sourceFixtureId: ineligibleCandidate.sourceFixtureReference.fixtureId,
      sourceWrestlerId: ineligibleCandidate.wrestlerIdentityReference.wrestlerId,
      selectingBrandId: "brand-red",
      draftRound: 1,
      draftPickNumber: 2
    });
    const validationResult = createNewGMModeDraftPickValidationService({
      selectionIntentObject: intent
    });

    assert.equal(validationResult.validationStatus, "draft-pick-validation-blocked");
    assert.deepEqual(validationResult.issueReferences.issueIds, [
      "candidate-ineligible"
    ]);
  });

  it("missing candidateObjectId produces blocked validation result", () => {
    const malformed = JSON.parse(JSON.stringify(validSelectionIntent));
    delete malformed.sourceCandidateReference.candidateObjectId;
    const validationResult = createNewGMModeDraftPickValidationService({
      selectionIntentObject: malformed
    });

    assert.equal(validationResult.validationStatus, "draft-pick-validation-blocked");
    assert.ok(
      validationResult.issueReferences.issueIds.includes(
        "candidate-reference-missing"
      )
    );
  });

  it("mismatched candidate, fixture, and wrestler references produce blocked validation result", () => {
    const malformed = createNewGMModeDraftSelectionIntentObject({
      candidateObjectId: eligibleCandidate.candidateId,
      sourceFixtureId: "fixture-does-not-match",
      sourceWrestlerId: "wrestler-does-not-match",
      selectingBrandId: "brand-red",
      draftRound: 1,
      draftPickNumber: 3
    });
    const validationResult = createNewGMModeDraftPickValidationService({
      selectionIntentObject: malformed
    });

    assert.equal(validationResult.validationStatus, "draft-pick-validation-blocked");
    assert.deepEqual(validationResult.issueReferences.issueIds, [
      "selection-intent-invalid"
    ]);
  });

  it("approved validation result creates a draft pick object with execution-ready status", () => {
    const validationResult = createNewGMModeDraftPickValidationService({
      selectionIntentObject: validSelectionIntent
    });
    const draftPickObject = createNewGMModeDraftPickCreationService({
      validationResultObject: validationResult
    });

    assert.equal(draftPickObject.draftPickStatus, "draft-pick-created-execution-ready");
    assert.equal(
      draftPickObject.sourceValidationResultReference
        .sourceValidationResultObjectId,
      validationResult.draftPickValidationResultObjectId
    );
    assert.deepEqual(draftPickObject.blockedReasonReferences.blockedReasonIds, []);
    assert.equal(Object.isFrozen(draftPickObject), true);
  });

  it("blocked validation result does not create an execution-ready draft pick", () => {
    const blockedValidationResult = createNewGMModeDraftPickValidationResultObject({
      sourceSelectionIntentObjectId:
        validSelectionIntent.draftSelectionIntentObjectId,
      candidateObjectId: eligibleCandidate.candidateId,
      sourceFixtureId: eligibleCandidate.sourceFixtureReference.fixtureId,
      sourceWrestlerId: eligibleCandidate.wrestlerIdentityReference.wrestlerId,
      selectingBrandId: "brand-red",
      draftRound: 1,
      draftPickNumber: 4,
      validationStatus: "draft-pick-validation-blocked",
      issueIds: ["candidate-ineligible"]
    });
    const draftPickObject = createNewGMModeDraftPickCreationService({
      validationResultObject: blockedValidationResult
    });

    assert.equal(draftPickObject.draftPickStatus, "draft-pick-creation-blocked");
    assert.deepEqual(draftPickObject.blockedReasonReferences.blockedReasonIds, [
      "validation-result-status-not-approved"
    ]);
  });

  it("execution-ready draft pick creates execution result with roster-assignment-ready status", () => {
    const draftPickObject = createHappyPathDraftPickObject();
    const executionResult = createNewGMModeDraftPickExecutionService({
      draftPickObject
    });

    assert.equal(
      executionResult.executionStatus,
      "draft-pick-executed-roster-assignment-ready"
    );
    assert.deepEqual(executionResult.blockedReasonReferences.blockedReasonIds, []);
    assert.equal(Object.isFrozen(executionResult), true);
  });

  it("non-executable draft pick produces blocked execution result", () => {
    const draftPickObject = createNewGMModeDraftPickCreationService({
      validationResultObject: createNewGMModeDraftPickValidationResultObject({
        sourceSelectionIntentObjectId:
          validSelectionIntent.draftSelectionIntentObjectId,
        candidateObjectId: eligibleCandidate.candidateId,
        sourceFixtureId: eligibleCandidate.sourceFixtureReference.fixtureId,
        sourceWrestlerId: eligibleCandidate.wrestlerIdentityReference.wrestlerId,
        selectingBrandId: "brand-red",
        draftRound: 1,
        draftPickNumber: 5,
        validationStatus: "draft-pick-validation-blocked",
        issueIds: ["candidate-ineligible"]
      })
    });
    const executionResult = createNewGMModeDraftPickExecutionService({
      draftPickObject
    });

    assert.equal(executionResult.executionStatus, "draft-pick-execution-blocked");
    assert.deepEqual(executionResult.blockedReasonReferences.blockedReasonIds, [
      "draft-pick-status-not-executable"
    ]);
  });

  it("roster-assignment-ready execution result creates roster assignment result", () => {
    const executionResult = createHappyPathExecutionResultObject();
    const assignmentResult = createNewGMModeDraftPickRosterAssignmentService({
      executionResultObject: executionResult
    });

    assert.equal(
      assignmentResult.assignmentStatus,
      "roster-assignment-created-roster-state-ready"
    );
    assert.deepEqual(assignmentResult.blockedReasonReferences.blockedReasonIds, []);
    assert.equal(Object.isFrozen(assignmentResult), true);
  });

  it("assignment result creates deterministic rosterSlotReference", () => {
    const executionResult = createHappyPathExecutionResultObject();
    const first = createNewGMModeDraftPickRosterAssignmentService({
      executionResultObject: executionResult
    });
    const second = createNewGMModeDraftPickRosterAssignmentService({
      executionResultObject: executionResult
    });

    assert.equal(
      first.rosterSlotReference.rosterSlotReference,
      second.rosterSlotReference.rosterSlotReference
    );
    assert.equal(
      first.rosterSlotReference.rosterSlotReference,
      `new-gm-mode-roster-slot:brand-red:${eligibleCandidate.sourceFixtureReference.fixtureId}:${normalizeIdPart(first.sourceDraftPickReference.sourceDraftPickObjectId)}`
    );
  });

  it("roster state creation accepts valid assignment results and creates frozen in-memory roster state object", () => {
    const assignmentResult = createHappyPathRosterAssignmentResultObject();
    const rosterStateObject = createNewGMModeRosterStateCreationService({
      rosterAssignmentResultObjects: [assignmentResult]
    });

    assert.equal(
      rosterStateObject.rosterStateStatus,
      "roster-state-created-draft-complete-gameplay-start-blocked"
    );
    assert.equal(rosterStateObject.assignedWrestlerMembershipReferences.length, 1);
    assert.deepEqual(rosterStateObject.sourceRosterAssignmentResultObjectIds, [
      assignmentResult.rosterAssignmentResultObjectId
    ]);
    assert.equal(Object.isFrozen(rosterStateObject), true);
  });

  it("roster state creation blocks duplicate wrestler membership for the same brand", () => {
    const assignmentResult = createHappyPathRosterAssignmentResultObject();
    const duplicateRosterStateObject = createNewGMModeRosterStateCreationService({
      rosterAssignmentResultObjects: [assignmentResult, assignmentResult]
    });

    assert.equal(
      duplicateRosterStateObject.rosterStateStatus,
      "roster-state-creation-blocked"
    );
    assert.ok(
      duplicateRosterStateObject.blockedReasonReferences.blockedReasonIds.includes(
        "duplicate-membership-rules-unavailable"
      )
    );
  });

  it("draft completion summary reports complete for valid in-memory roster state while gameplay start remains blocked", () => {
    const rosterStateObject = createNewGMModeRosterStateCreationService({
      rosterAssignmentResultObjects: [createHappyPathRosterAssignmentResultObject()]
    });
    const summary = createNewGMModeDraftCompletionSummary({ rosterStateObject });

    assert.equal(
      summary.draftCompletionPhase,
      "draft-complete-in-memory-roster-created-gameplay-start-blocked"
    );
    assert.equal(summary.rosterMembershipCount, 1);
    assert.deepEqual(summary.brandRosterReferences, [
      rosterStateObject.brandRosterReference.brandRosterReference
    ]);
    assert.equal(summary.capabilityFlags.canStartGameplay, false);
    assert.equal(summary.capabilityFlags.canInitializeWeekOne, false);
    assert.equal(summary.capabilityFlags.canPersistGameplayPayload, false);
  });

  it("one-shot in-memory draft flow returns every intermediate object and summary", () => {
    const flow = createNewGMModeInMemoryDraftFlow({
      selectionIntentObject: validSelectionIntent
    });

    assert.equal(
      flow.validationResultObject.validationStatus,
      "draft-pick-validation-approved"
    );
    assert.equal(flow.draftPickObject.draftPickStatus, "draft-pick-created-execution-ready");
    assert.equal(
      flow.executionResultObject.executionStatus,
      "draft-pick-executed-roster-assignment-ready"
    );
    assert.equal(
      flow.rosterAssignmentResultObject.assignmentStatus,
      "roster-assignment-created-roster-state-ready"
    );
    assert.equal(
      flow.rosterStateObject.rosterStateStatus,
      "roster-state-created-draft-complete-gameplay-start-blocked"
    );
    assert.equal(
      flow.draftCompletionSummary.draftCompletionPhase,
      "draft-complete-in-memory-roster-created-gameplay-start-blocked"
    );
  });

  it("one-shot in-memory draft flow remains deterministic for identical inputs", () => {
    const first = createNewGMModeInMemoryDraftFlow({
      selectionIntentObject: validSelectionIntent
    });
    const second = createNewGMModeInMemoryDraftFlow({
      selectionIntentObject: validSelectionIntent
    });

    assert.deepEqual(second, first);
  });

  it("all returned objects are frozen and keep forbidden capabilities blocked", () => {
    const flow = createNewGMModeInMemoryDraftFlow({
      selectionIntentObject: validSelectionIntent
    });
    const returnedObjects = [
      flow,
      flow.validationResultObject,
      flow.draftPickObject,
      flow.executionResultObject,
      flow.rosterAssignmentResultObject,
      flow.rosterStateObject,
      flow.draftCompletionSummary
    ];

    assert.equal(returnedObjects.every((object) => Object.isFrozen(object)), true);
    assert.equal(flow.capabilityFlags.canStartGameplay, false);
    assert.equal(flow.capabilityFlags.canInitializeWeekOne, false);
    assert.equal(flow.capabilityFlags.canPersistGameplayPayload, false);
    assert.equal(flow.capabilityFlags.canCreateUserInterface, false);
    assert.equal(flow.capabilityFlags.canCreateGeneratedText, false);
    assert.equal(flow.capabilityFlags.canUseGenAI, false);
  });

  it("does not add SQLite writes, save payloads, routes, React UI, generated text, GenAI, adjacent gameplay state, or engine metadata changes", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "new-gm-mode-real-draft-system-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();
    const flow = createNewGMModeInMemoryDraftFlow({
      selectionIntentObject: validSelectionIntent
    });

    const secondResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assertForbiddenFieldsAbsent(flow);
    assertNewServiceSourceBoundaries();
    assert.equal(existsSync(UNTOUCHED_REAL_DRAFT_SYSTEM_DATABASE), false);
    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });

  it("keeps direct unseeded entropy calls out of source and tests", () => {
    const forbiddenCall = ["Math", "random"].join(".");
    const matches = findTextMatches(["src", "tests"], forbiddenCall);

    assert.deepEqual(matches, []);
  });
});

function createHappyPathDraftPickObject() {
  const validationResult = createNewGMModeDraftPickValidationService({
    selectionIntentObject: validSelectionIntent
  });

  return createNewGMModeDraftPickCreationService({
    validationResultObject: validationResult
  });
}

function createHappyPathExecutionResultObject() {
  return createNewGMModeDraftPickExecutionService({
    draftPickObject: createHappyPathDraftPickObject()
  });
}

function createHappyPathRosterAssignmentResultObject() {
  return createNewGMModeDraftPickRosterAssignmentService({
    executionResultObject: createHappyPathExecutionResultObject()
  });
}

function assertForbiddenFieldsAbsent(source: unknown): void {
  const forbiddenFields = [
    "savePayload",
    "SQLite",
    "sqlite",
    "sqliteConnection",
    "route",
    "routes",
    "React",
    "react",
    "generatedText",
    "genAI",
    "genAIClient",
    "matchState",
    "showState",
    "weekState",
    "calendarState",
    "financeState",
    "fanState",
    "socialState",
    "businessState",
    "championshipDivisionAssignment"
  ];
  const keys = collectKeys(source);

  for (const field of forbiddenFields) {
    assert.equal(keys.includes(field), false, field);
  }
}

function assertNewServiceSourceBoundaries(): void {
  const source = [
    "newGMModeDraftPickValidationService.ts",
    "newGMModeDraftPickCreationService.ts",
    "newGMModeDraftPickExecutionService.ts",
    "newGMModeDraftPickRosterAssignmentService.ts",
    "newGMModeRosterStateCreationService.ts",
    "newGMModeDraftCompletionSummary.ts",
    "newGMModeInMemoryDraftFlow.ts"
  ]
    .map((fileName) =>
      readFileSync(join("src", "game", "domain", fileName), "utf8")
    )
    .join("\n");
  const forbiddenSnippets = [
    "writeFile",
    "INSERT INTO",
    "UPDATE ",
    "DELETE ",
    "sqlite",
    "savePayload",
    "express",
    "router",
    "React",
    "generatedText",
    "genAI",
    "matchState",
    "showState",
    "weekState",
    "calendarState",
    "financeState",
    "fanState",
    "socialState",
    "businessState",
    "championshipDivisionAssignment"
  ];

  for (const snippet of forbiddenSnippets) {
    assert.equal(source.includes(snippet), false, snippet);
  }
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

function normalizeIdPart(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized.length > 0 ? normalized : "empty";
}
