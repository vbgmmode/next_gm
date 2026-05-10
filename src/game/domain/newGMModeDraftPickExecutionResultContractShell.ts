import {
  createNewGMModeDraftPickExecutionBlockedReasonCatalog,
  type NewGMModeDraftPickExecutionBlockedReasonCatalogId
} from "./newGMModeDraftPickExecutionBlockedReasonCatalog.ts";

export type NewGMModeDraftPickExecutionResultRequirementId =
  | "execution-result-id-requirement"
  | "source-draft-pick-object-reference-requirement"
  | "source-validation-result-object-reference-requirement"
  | "source-selection-intent-object-reference-requirement"
  | "candidate-object-reference-requirement"
  | "fixture-wrestler-reference-requirement"
  | "selecting-brand-reference-requirement"
  | "draft-round-pick-number-reference-requirement"
  | "execution-status-requirement"
  | "execution-blocked-reason-ids-requirement"
  | "draft-state-mutation-prerequisite"
  | "roster-assignment-prerequisite"
  | "transaction-safety-prerequisite"
  | "rollback-prerequisite"
  | "persistence-prerequisite"
  | "gameplay-unlock-prerequisite";

export interface NewGMModeDraftPickExecutionResultRequirement {
  readonly id: NewGMModeDraftPickExecutionResultRequirementId;
  readonly slug: NewGMModeDraftPickExecutionResultRequirementId;
  readonly required: true;
  readonly diagnosticsOnly: true;
}

export interface NewGMModeDraftPickExecutionResultCapabilityFlags {
  readonly executionResultShapeDefined: true;
  readonly canCreateExecutionResult: false;
  readonly canExecuteDraftPick: false;
  readonly canMutateDraftState: false;
  readonly canAssignRoster: false;
  readonly canCreateOrMutateRosterState: false;
  readonly canAssignChampionshipOrDivision: false;
  readonly canCreateMatchShowOrWeekState: false;
  readonly canPersistGameplayPayload: false;
  readonly canWriteDatabase: false;
  readonly canMutateState: false;
  readonly canStartGameplay: false;
  readonly canUnlockWeekOne: false;
  readonly canCreateUserInterface: false;
  readonly canCreateGeneratedText: false;
  readonly canUseGenAI: false;
}

export interface NewGMModeDraftPickExecutionResultContractShell {
  readonly status: "diagnostics-only";
  readonly draftPickExecutionResultContractId: "new-gm-mode-draft-pick-execution-result-contract-v0.1";
  readonly version: "0.1";
  readonly domainObject: true;
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly mutable: false;
  readonly deterministicOrdering: true;
  readonly shallowBoundary: true;
  readonly realExecutionResultUnavailable: true;
  readonly orderedRequirements: readonly NewGMModeDraftPickExecutionResultRequirement[];
  readonly blockedReasonIds: readonly NewGMModeDraftPickExecutionBlockedReasonCatalogId[];
  readonly capabilityFlags: NewGMModeDraftPickExecutionResultCapabilityFlags;
}

const ORDERED_REQUIREMENT_IDS: readonly NewGMModeDraftPickExecutionResultRequirementId[] =
  Object.freeze([
    "execution-result-id-requirement",
    "source-draft-pick-object-reference-requirement",
    "source-validation-result-object-reference-requirement",
    "source-selection-intent-object-reference-requirement",
    "candidate-object-reference-requirement",
    "fixture-wrestler-reference-requirement",
    "selecting-brand-reference-requirement",
    "draft-round-pick-number-reference-requirement",
    "execution-status-requirement",
    "execution-blocked-reason-ids-requirement",
    "draft-state-mutation-prerequisite",
    "roster-assignment-prerequisite",
    "transaction-safety-prerequisite",
    "rollback-prerequisite",
    "persistence-prerequisite",
    "gameplay-unlock-prerequisite"
  ]);

export const NEW_GM_MODE_DRAFT_PICK_EXECUTION_RESULT_CAPABILITY_FLAGS: NewGMModeDraftPickExecutionResultCapabilityFlags =
  Object.freeze({
    executionResultShapeDefined: true,
    canCreateExecutionResult: false,
    canExecuteDraftPick: false,
    canMutateDraftState: false,
    canAssignRoster: false,
    canCreateOrMutateRosterState: false,
    canAssignChampionshipOrDivision: false,
    canCreateMatchShowOrWeekState: false,
    canPersistGameplayPayload: false,
    canWriteDatabase: false,
    canMutateState: false,
    canStartGameplay: false,
    canUnlockWeekOne: false,
    canCreateUserInterface: false,
    canCreateGeneratedText: false,
    canUseGenAI: false
  });

export function createNewGMModeDraftPickExecutionResultContractShell(): NewGMModeDraftPickExecutionResultContractShell {
  const blockedReasonCatalog =
    createNewGMModeDraftPickExecutionBlockedReasonCatalog();

  return Object.freeze({
    status: "diagnostics-only",
    draftPickExecutionResultContractId:
      "new-gm-mode-draft-pick-execution-result-contract-v0.1",
    version: "0.1",
    domainObject: true,
    diagnosticsOnly: true,
    playerFacing: false,
    gameplayAffecting: false,
    mutable: false,
    deterministicOrdering: true,
    shallowBoundary: true,
    realExecutionResultUnavailable: true,
    orderedRequirements: Object.freeze(
      ORDERED_REQUIREMENT_IDS.map((id) =>
        Object.freeze({
          id,
          slug: id,
          required: true,
          diagnosticsOnly: true
        })
      )
    ),
    blockedReasonIds: blockedReasonCatalog.blockedReasonIds,
    capabilityFlags: NEW_GM_MODE_DRAFT_PICK_EXECUTION_RESULT_CAPABILITY_FLAGS
  });
}
