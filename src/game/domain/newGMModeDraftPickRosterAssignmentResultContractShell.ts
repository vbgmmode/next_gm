import {
  createNewGMModeDraftPickRosterAssignmentBlockedReasonCatalog,
  type NewGMModeDraftPickRosterAssignmentBlockedReasonCatalogId
} from "./newGMModeDraftPickRosterAssignmentBlockedReasonCatalog.ts";

export type NewGMModeDraftPickRosterAssignmentResultRequirementId =
  | "roster-assignment-result-id-requirement"
  | "source-execution-result-object-reference-requirement"
  | "source-draft-pick-object-reference-requirement"
  | "candidate-object-reference-requirement"
  | "fixture-wrestler-reference-requirement"
  | "selecting-brand-reference-requirement"
  | "roster-slot-reference-placeholder-requirement"
  | "assignment-status-requirement"
  | "assignment-blocked-reason-ids-requirement"
  | "roster-state-mutation-prerequisite"
  | "transaction-safety-prerequisite"
  | "rollback-prerequisite"
  | "persistence-prerequisite"
  | "gameplay-unlock-prerequisite";

export interface NewGMModeDraftPickRosterAssignmentResultRequirement {
  readonly id: NewGMModeDraftPickRosterAssignmentResultRequirementId;
  readonly slug: NewGMModeDraftPickRosterAssignmentResultRequirementId;
  readonly required: true;
  readonly diagnosticsOnly: true;
}

export interface NewGMModeDraftPickRosterAssignmentResultCapabilityFlags {
  readonly assignmentResultShapeDefined: true;
  readonly canCreateAssignmentResult: false;
  readonly canAssignRoster: false;
  readonly canCreateOrMutateRosterState: false;
  readonly canAssignChampionshipOrDivision: false;
  readonly canPersistGameplayPayload: false;
  readonly canWriteDatabase: false;
  readonly canMutateState: false;
  readonly canStartGameplay: false;
  readonly canUnlockWeekOne: false;
  readonly canCreateUserInterface: false;
  readonly canCreateGeneratedText: false;
  readonly canUseGenAI: false;
}

export interface NewGMModeDraftPickRosterAssignmentResultContractShell {
  readonly status: "diagnostics-only";
  readonly draftPickRosterAssignmentResultContractId: "new-gm-mode-draft-pick-roster-assignment-result-contract-v0.1";
  readonly version: "0.1";
  readonly domainObject: true;
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly mutable: false;
  readonly deterministicOrdering: true;
  readonly shallowBoundary: true;
  readonly realAssignmentResultUnavailable: true;
  readonly orderedRequirements: readonly NewGMModeDraftPickRosterAssignmentResultRequirement[];
  readonly blockedReasonIds: readonly NewGMModeDraftPickRosterAssignmentBlockedReasonCatalogId[];
  readonly capabilityFlags: NewGMModeDraftPickRosterAssignmentResultCapabilityFlags;
}

const ORDERED_REQUIREMENT_IDS: readonly NewGMModeDraftPickRosterAssignmentResultRequirementId[] =
  Object.freeze([
    "roster-assignment-result-id-requirement",
    "source-execution-result-object-reference-requirement",
    "source-draft-pick-object-reference-requirement",
    "candidate-object-reference-requirement",
    "fixture-wrestler-reference-requirement",
    "selecting-brand-reference-requirement",
    "roster-slot-reference-placeholder-requirement",
    "assignment-status-requirement",
    "assignment-blocked-reason-ids-requirement",
    "roster-state-mutation-prerequisite",
    "transaction-safety-prerequisite",
    "rollback-prerequisite",
    "persistence-prerequisite",
    "gameplay-unlock-prerequisite"
  ]);

export const NEW_GM_MODE_DRAFT_PICK_ROSTER_ASSIGNMENT_RESULT_CAPABILITY_FLAGS: NewGMModeDraftPickRosterAssignmentResultCapabilityFlags =
  Object.freeze({
    assignmentResultShapeDefined: true,
    canCreateAssignmentResult: false,
    canAssignRoster: false,
    canCreateOrMutateRosterState: false,
    canAssignChampionshipOrDivision: false,
    canPersistGameplayPayload: false,
    canWriteDatabase: false,
    canMutateState: false,
    canStartGameplay: false,
    canUnlockWeekOne: false,
    canCreateUserInterface: false,
    canCreateGeneratedText: false,
    canUseGenAI: false
  });

export function createNewGMModeDraftPickRosterAssignmentResultContractShell(): NewGMModeDraftPickRosterAssignmentResultContractShell {
  const blockedReasonCatalog =
    createNewGMModeDraftPickRosterAssignmentBlockedReasonCatalog();

  return Object.freeze({
    status: "diagnostics-only",
    draftPickRosterAssignmentResultContractId:
      "new-gm-mode-draft-pick-roster-assignment-result-contract-v0.1",
    version: "0.1",
    domainObject: true,
    diagnosticsOnly: true,
    playerFacing: false,
    gameplayAffecting: false,
    mutable: false,
    deterministicOrdering: true,
    shallowBoundary: true,
    realAssignmentResultUnavailable: true,
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
    capabilityFlags:
      NEW_GM_MODE_DRAFT_PICK_ROSTER_ASSIGNMENT_RESULT_CAPABILITY_FLAGS
  });
}
