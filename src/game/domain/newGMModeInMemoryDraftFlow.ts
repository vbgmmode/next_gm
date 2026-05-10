import {
  createNewGMModeDraftCompletionSummary,
  type NewGMModeDraftCompletionSummary
} from "./newGMModeDraftCompletionSummary.ts";
import {
  createNewGMModeDraftPickCreationService
} from "./newGMModeDraftPickCreationService.ts";
import {
  createNewGMModeDraftPickExecutionService
} from "./newGMModeDraftPickExecutionService.ts";
import {
  createNewGMModeDraftPickRosterAssignmentService
} from "./newGMModeDraftPickRosterAssignmentService.ts";
import {
  createNewGMModeDraftPickValidationService
} from "./newGMModeDraftPickValidationService.ts";
import type { NewGMModeDraftPickCandidateObjectSet } from "./newGMModeDraftPickCandidateObject.ts";
import type { NewGMModeDraftPickExecutionResultObject } from "./newGMModeDraftPickExecutionResultObject.ts";
import type { NewGMModeDraftPickObject } from "./newGMModeDraftPickObject.ts";
import type { NewGMModeDraftPickRosterAssignmentResultObject } from "./newGMModeDraftPickRosterAssignmentResultObject.ts";
import type { NewGMModeDraftPickValidationResultObject } from "./newGMModeDraftPickValidationResultObject.ts";
import {
  createNewGMModeRosterStateCreationService
} from "./newGMModeRosterStateCreationService.ts";
import type { NewGMModeRosterStateObject } from "./newGMModeRosterStateObject.ts";

export interface NewGMModeInMemoryDraftFlowInput {
  readonly selectionIntentObject: unknown;
  readonly candidateObjectSetOverride?: NewGMModeDraftPickCandidateObjectSet;
}

export interface NewGMModeInMemoryDraftFlowResult {
  readonly inMemoryDraftFlowId: "new-gm-mode-in-memory-draft-flow-v1.0";
  readonly version: "1.0";
  readonly domainObject: true;
  readonly diagnosticsOnly: false;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly mutable: false;
  readonly deterministicOrdering: true;
  readonly validationResultObject: NewGMModeDraftPickValidationResultObject;
  readonly draftPickObject: NewGMModeDraftPickObject;
  readonly executionResultObject: NewGMModeDraftPickExecutionResultObject;
  readonly rosterAssignmentResultObject: NewGMModeDraftPickRosterAssignmentResultObject;
  readonly rosterStateObject: NewGMModeRosterStateObject;
  readonly draftCompletionSummary: NewGMModeDraftCompletionSummary;
  readonly capabilityFlags: {
    readonly canPersistGameplayPayload: false;
    readonly canWriteDatabase: false;
    readonly canStartGameplay: false;
    readonly canInitializeWeekOne: false;
    readonly canCreateUserInterface: false;
    readonly canCreateGeneratedText: false;
    readonly canUseGenAI: false;
  };
}

export function createNewGMModeInMemoryDraftFlow(
  input: NewGMModeInMemoryDraftFlowInput
): NewGMModeInMemoryDraftFlowResult {
  const validationResultObject = createNewGMModeDraftPickValidationService({
    selectionIntentObject: input.selectionIntentObject,
    candidateObjectSetOverride: input.candidateObjectSetOverride
  });
  const draftPickObject = createNewGMModeDraftPickCreationService({
    validationResultObject
  });
  const executionResultObject = createNewGMModeDraftPickExecutionService({
    draftPickObject
  });
  const rosterAssignmentResultObject =
    createNewGMModeDraftPickRosterAssignmentService({
      executionResultObject
    });
  const rosterStateObject = createNewGMModeRosterStateCreationService({
    rosterAssignmentResultObjects: [rosterAssignmentResultObject]
  });
  const draftCompletionSummary = createNewGMModeDraftCompletionSummary({
    rosterStateObject
  });

  return Object.freeze({
    inMemoryDraftFlowId: "new-gm-mode-in-memory-draft-flow-v1.0",
    version: "1.0",
    domainObject: true,
    diagnosticsOnly: false,
    playerFacing: false,
    gameplayAffecting: false,
    mutable: false,
    deterministicOrdering: true,
    validationResultObject,
    draftPickObject,
    executionResultObject,
    rosterAssignmentResultObject,
    rosterStateObject,
    draftCompletionSummary,
    capabilityFlags: Object.freeze({
      canPersistGameplayPayload: false,
      canWriteDatabase: false,
      canStartGameplay: false,
      canInitializeWeekOne: false,
      canCreateUserInterface: false,
      canCreateGeneratedText: false,
      canUseGenAI: false
    })
  });
}
