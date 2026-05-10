import {
  createNewGMModeDraftPickCreationBoundaryContractShell,
  type NewGMModeDraftPickCreationBoundaryBlockedReason,
  type NewGMModeDraftPickCreationBoundaryCapabilityFlags,
  type NewGMModeDraftPickCreationBoundaryRequirementId
} from "./newGMModeDraftPickCreationBoundaryContractShell.ts";
import {
  createNewGMModeDraftPickValidationResultObjectReadinessSummary,
  type NewGMModeDraftPickValidationResultObjectReadinessPhase
} from "./newGMModeDraftPickValidationResultObjectReadinessSummary.ts";

export type NewGMModeDraftPickCreationReadinessPhase =
  | "draft-pick-creation-boundary-ready-creation-blocked"
  | "draft-pick-creation-boundary-blocked-by-validation-result";

export interface NewGMModeDraftPickCreationReadinessSummaryInput {
  readonly validationResultObject: unknown;
}

export interface NewGMModeDraftPickCreationReadinessCapabilityFlags
  extends NewGMModeDraftPickCreationBoundaryCapabilityFlags {
  readonly validationResultObjectReadinessConsumed: true;
  readonly canCreateDraftPickObject: false;
  readonly canMutateState: false;
}

export interface NewGMModeDraftPickCreationReadinessSummary {
  readonly draftPickCreationReadinessSummaryId: "new-gm-mode-draft-pick-creation-readiness-summary-v0.1";
  readonly version: "0.1";
  readonly domainObject: true;
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly mutable: false;
  readonly shallowSummary: true;
  readonly deterministicOrdering: true;
  readonly validationResultObjectReadinessPhase: NewGMModeDraftPickValidationResultObjectReadinessPhase;
  readonly draftPickCreationReadinessPhase: NewGMModeDraftPickCreationReadinessPhase;
  readonly validationResultObjectReadinessConsumed: true;
  readonly validationResultObjectValidatorStatus: {
    readonly validatorId: "new-gm-mode-draft-pick-validation-result-object-validator-v0.1";
    readonly structurallyValid: boolean;
    readonly issueCount: number;
    readonly issueIds: readonly string[];
  };
  readonly creationBoundaryRequirementIds: readonly NewGMModeDraftPickCreationBoundaryRequirementId[];
  readonly creationBoundaryBlockedReasonIds: readonly NewGMModeDraftPickCreationBoundaryBlockedReason[];
  readonly capabilityFlags: NewGMModeDraftPickCreationReadinessCapabilityFlags;
}

export function createNewGMModeDraftPickCreationReadinessSummary(
  input: NewGMModeDraftPickCreationReadinessSummaryInput
): NewGMModeDraftPickCreationReadinessSummary {
  const validationResultObjectReadinessSummary =
    createNewGMModeDraftPickValidationResultObjectReadinessSummary({
      validationResultObject: input.validationResultObject
    });
  const creationBoundary =
    createNewGMModeDraftPickCreationBoundaryContractShell();
  const validationResultIsStructurallyReady =
    validationResultObjectReadinessSummary.validationResultObjectReadinessPhase ===
    "draft-pick-validation-result-object-valid-pick-creation-unavailable";

  return Object.freeze({
    draftPickCreationReadinessSummaryId:
      "new-gm-mode-draft-pick-creation-readiness-summary-v0.1",
    version: "0.1",
    domainObject: true,
    diagnosticsOnly: true,
    playerFacing: false,
    gameplayAffecting: false,
    mutable: false,
    shallowSummary: true,
    deterministicOrdering: true,
    validationResultObjectReadinessPhase:
      validationResultObjectReadinessSummary.validationResultObjectReadinessPhase,
    draftPickCreationReadinessPhase: validationResultIsStructurallyReady
      ? "draft-pick-creation-boundary-ready-creation-blocked"
      : "draft-pick-creation-boundary-blocked-by-validation-result",
    validationResultObjectReadinessConsumed: true,
    validationResultObjectValidatorStatus: Object.freeze({
      validatorId:
        validationResultObjectReadinessSummary.validatorStatus.validatorId,
      structurallyValid:
        validationResultObjectReadinessSummary.validatorStatus.structurallyValid,
      issueCount: validationResultObjectReadinessSummary.validatorStatus.issueCount,
      issueIds: Object.freeze([
        ...validationResultObjectReadinessSummary.validatorStatus.issueIds
      ])
    }),
    creationBoundaryRequirementIds: Object.freeze(
      creationBoundary.orderedRequirements.map((requirement) => requirement.id)
    ),
    creationBoundaryBlockedReasonIds: creationBoundary.blockedReasons,
    capabilityFlags: Object.freeze({
      ...creationBoundary.capabilityFlags,
      validationResultObjectReadinessConsumed: true,
      canCreateDraftPickObject: false,
      canMutateState: false
    })
  });
}
