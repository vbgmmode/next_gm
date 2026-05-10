export type NewGMModeDraftSelectionIntentRequirementId =
  | "candidate-readiness-summary-availability"
  | "candidate-object-id-reference-requirement"
  | "source-wrestler-fixture-reference-requirement"
  | "selecting-side-brand-context-placeholder"
  | "draft-round-pick-order-context-placeholder"
  | "selection-timestamp-placeholder"
  | "future-selection-validation-prerequisite"
  | "future-draft-pick-creation-prerequisite";

export type NewGMModeDraftSelectionIntentBlockedReason =
  | "draft-selection-intent-boundary-contract-only"
  | "candidate-readiness-summary-required"
  | "candidate-object-id-reference-not-bound"
  | "source-wrestler-fixture-reference-not-bound"
  | "selecting-side-brand-context-not-implemented"
  | "draft-round-pick-order-context-not-implemented"
  | "selection-timestamp-not-implemented"
  | "future-selection-validation-not-implemented"
  | "future-draft-pick-creation-not-implemented"
  | "real-selection-intent-creation-not-implemented"
  | "draft-pick-validation-not-implemented"
  | "draft-pick-execution-not-implemented"
  | "roster-assignment-not-implemented"
  | "gameplay-persistence-not-implemented"
  | "gameplay-start-not-implemented"
  | "week-one-unlock-not-implemented";

export interface NewGMModeDraftSelectionIntentRequirement {
  readonly id: NewGMModeDraftSelectionIntentRequirementId;
  readonly slug: NewGMModeDraftSelectionIntentRequirementId;
  readonly required: true;
  readonly diagnosticsOnly: true;
}

export interface NewGMModeDraftSelectionIntentCapabilityFlags {
  readonly candidateObjectsAvailable: true;
  readonly candidateReadinessSummaryAvailable: true;
  readonly draftSelectionIntentBoundaryAvailable: true;
  readonly canCreateSelectionIntent: false;
  readonly canCreateDraftPick: false;
  readonly canValidateDraftPick: false;
  readonly canExecuteDraftPick: false;
  readonly canAssignRoster: false;
  readonly canCreateOrMutateRosterState: false;
  readonly canAssignChampionshipOrDivision: false;
  readonly canCreateMatchShowOrWeekState: false;
  readonly canPersistGameplayPayload: false;
  readonly canWriteDatabase: false;
  readonly canStartGameplay: false;
  readonly canUnlockWeekOne: false;
  readonly canCreateUserInterface: false;
  readonly canCreateGeneratedText: false;
  readonly canUseGenAI: false;
}

export interface NewGMModeDraftSelectionIntentContractShell {
  readonly status: "diagnostics-only";
  readonly draftSelectionIntentContractId: "new-gm-mode-draft-selection-intent-contract-v0.1";
  readonly version: "0.1";
  readonly domainObject: true;
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly mutable: false;
  readonly deterministicOrdering: true;
  readonly shallowBoundary: true;
  readonly orderedRequirements: readonly NewGMModeDraftSelectionIntentRequirement[];
  readonly blockedReasons: readonly NewGMModeDraftSelectionIntentBlockedReason[];
  readonly capabilityFlags: NewGMModeDraftSelectionIntentCapabilityFlags;
}

const ORDERED_REQUIREMENT_IDS: readonly NewGMModeDraftSelectionIntentRequirementId[] =
  Object.freeze([
    "candidate-readiness-summary-availability",
    "candidate-object-id-reference-requirement",
    "source-wrestler-fixture-reference-requirement",
    "selecting-side-brand-context-placeholder",
    "draft-round-pick-order-context-placeholder",
    "selection-timestamp-placeholder",
    "future-selection-validation-prerequisite",
    "future-draft-pick-creation-prerequisite"
  ]);

const BLOCKED_REASONS: readonly NewGMModeDraftSelectionIntentBlockedReason[] =
  Object.freeze([
    "draft-selection-intent-boundary-contract-only",
    "candidate-readiness-summary-required",
    "candidate-object-id-reference-not-bound",
    "source-wrestler-fixture-reference-not-bound",
    "selecting-side-brand-context-not-implemented",
    "draft-round-pick-order-context-not-implemented",
    "selection-timestamp-not-implemented",
    "future-selection-validation-not-implemented",
    "future-draft-pick-creation-not-implemented",
    "real-selection-intent-creation-not-implemented",
    "draft-pick-validation-not-implemented",
    "draft-pick-execution-not-implemented",
    "roster-assignment-not-implemented",
    "gameplay-persistence-not-implemented",
    "gameplay-start-not-implemented",
    "week-one-unlock-not-implemented"
  ]);

export const NEW_GM_MODE_DRAFT_SELECTION_INTENT_CAPABILITY_FLAGS: NewGMModeDraftSelectionIntentCapabilityFlags =
  Object.freeze({
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

export function createNewGMModeDraftSelectionIntentContractShell(): NewGMModeDraftSelectionIntentContractShell {
  return Object.freeze({
    status: "diagnostics-only",
    draftSelectionIntentContractId:
      "new-gm-mode-draft-selection-intent-contract-v0.1",
    version: "0.1",
    domainObject: true,
    diagnosticsOnly: true,
    playerFacing: false,
    gameplayAffecting: false,
    mutable: false,
    deterministicOrdering: true,
    shallowBoundary: true,
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
    blockedReasons: BLOCKED_REASONS,
    capabilityFlags: NEW_GM_MODE_DRAFT_SELECTION_INTENT_CAPABILITY_FLAGS
  });
}
