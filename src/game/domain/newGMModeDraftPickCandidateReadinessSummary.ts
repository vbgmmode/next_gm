import {
  createNewGMModeDraftPickCandidateObjects
} from "./newGMModeDraftPickCandidateObject.ts";
import {
  createNewGMModeDraftPickCandidateObjectValidator,
  type NewGMModeDraftPickCandidateObjectValidationIssueId
} from "./newGMModeDraftPickCandidateObjectValidator.ts";

export type NewGMModeDraftPickCandidateReadinessPhase =
  | "candidate-objects-valid-selection-unavailable"
  | "candidate-objects-invalid";

export interface NewGMModeDraftPickCandidateReadinessCapabilityFlags {
  readonly canUseCandidateObjects: true;
  readonly canSelectCandidate: false;
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

export interface NewGMModeDraftPickCandidateReadinessSummaryInput {
  readonly candidateSet?: unknown;
}

export interface NewGMModeDraftPickCandidateReadinessSummary {
  readonly draftPickCandidateReadinessSummaryId: "new-gm-mode-draft-pick-candidate-readiness-summary-v0.1";
  readonly version: "0.1";
  readonly domainObject: true;
  readonly diagnosticsOnly: false;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly mutable: false;
  readonly shallowSummary: true;
  readonly deterministicOrdering: true;
  readonly candidateObjectLayerAvailable: true;
  readonly validatorAvailable: true;
  readonly readinessPhase: NewGMModeDraftPickCandidateReadinessPhase;
  readonly candidateCounts: {
    readonly total: number;
    readonly eligible: number;
    readonly ineligible: number;
    readonly expectedTotal: number;
    readonly expectedEligible: number;
    readonly expectedIneligible: number;
  };
  readonly validatorStatus: {
    readonly validatorId: "new-gm-mode-draft-pick-candidate-object-validator-v0.1";
    readonly structurallyValid: boolean;
    readonly issueCount: number;
    readonly issueIds: readonly NewGMModeDraftPickCandidateObjectValidationIssueId[];
  };
  readonly capabilityFlags: NewGMModeDraftPickCandidateReadinessCapabilityFlags;
}

export const NEW_GM_MODE_DRAFT_PICK_CANDIDATE_READINESS_CAPABILITY_FLAGS: NewGMModeDraftPickCandidateReadinessCapabilityFlags =
  Object.freeze({
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

export function createNewGMModeDraftPickCandidateReadinessSummary(
  input: NewGMModeDraftPickCandidateReadinessSummaryInput = {}
): NewGMModeDraftPickCandidateReadinessSummary {
  const candidateSet =
    input.candidateSet ?? createNewGMModeDraftPickCandidateObjects();
  const validator = createNewGMModeDraftPickCandidateObjectValidator({
    candidateSet
  });

  return Object.freeze({
    draftPickCandidateReadinessSummaryId:
      "new-gm-mode-draft-pick-candidate-readiness-summary-v0.1",
    version: "0.1",
    domainObject: true,
    diagnosticsOnly: false,
    playerFacing: false,
    gameplayAffecting: false,
    mutable: false,
    shallowSummary: true,
    deterministicOrdering: true,
    candidateObjectLayerAvailable: true,
    validatorAvailable: true,
    readinessPhase: validator.structurallyValid
      ? "candidate-objects-valid-selection-unavailable"
      : "candidate-objects-invalid",
    candidateCounts: Object.freeze({
      total: validator.candidateSummary.totalCandidateCount,
      eligible: validator.candidateSummary.eligibleCandidateCount,
      ineligible: validator.candidateSummary.ineligibleCandidateCount,
      expectedTotal: validator.candidateSummary.expectedTotalCandidateCount,
      expectedEligible:
        validator.candidateSummary.expectedEligibleCandidateCount,
      expectedIneligible:
        validator.candidateSummary.expectedIneligibleCandidateCount
    }),
    validatorStatus: Object.freeze({
      validatorId: validator.validatorId,
      structurallyValid: validator.structurallyValid,
      issueCount: validator.issueCount,
      issueIds: Object.freeze(validator.issues.map((issue) => issue.issueId))
    }),
    capabilityFlags:
      NEW_GM_MODE_DRAFT_PICK_CANDIDATE_READINESS_CAPABILITY_FLAGS
  });
}
