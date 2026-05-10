import {
  createNewGMModeDraftPickExecutionBoundaryContractShell,
  type NewGMModeDraftPickExecutionBoundaryBlockedReason,
  type NewGMModeDraftPickExecutionBoundaryCapabilityFlags,
  type NewGMModeDraftPickExecutionBoundaryRequirementId
} from "./newGMModeDraftPickExecutionBoundaryContractShell.ts";
import {
  createNewGMModeDraftPickObjectReadinessSummary,
  type NewGMModeDraftPickObjectReadinessPhase
} from "./newGMModeDraftPickObjectReadinessSummary.ts";

export type NewGMModeDraftPickExecutionReadinessPhase =
  | "draft-pick-execution-boundary-ready-execution-blocked"
  | "draft-pick-execution-boundary-blocked-by-draft-pick-object";

export interface NewGMModeDraftPickExecutionReadinessSummaryInput {
  readonly draftPickObject: unknown;
}

export interface NewGMModeDraftPickExecutionReadinessCapabilityFlags
  extends NewGMModeDraftPickExecutionBoundaryCapabilityFlags {
  readonly draftPickObjectReadinessConsumed: true;
  readonly canMutateDraftState: false;
}

export interface NewGMModeDraftPickExecutionReadinessSummary {
  readonly draftPickExecutionReadinessSummaryId: "new-gm-mode-draft-pick-execution-readiness-summary-v0.1";
  readonly version: "0.1";
  readonly domainObject: true;
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly mutable: false;
  readonly shallowSummary: true;
  readonly deterministicOrdering: true;
  readonly draftPickObjectReadinessPhase: NewGMModeDraftPickObjectReadinessPhase;
  readonly draftPickExecutionReadinessPhase: NewGMModeDraftPickExecutionReadinessPhase;
  readonly draftPickObjectReadinessConsumed: true;
  readonly draftPickObjectValidatorStatus: {
    readonly validatorId: "new-gm-mode-draft-pick-object-validator-v0.1";
    readonly structurallyValid: boolean;
    readonly issueCount: number;
    readonly issueIds: readonly string[];
  };
  readonly executionBoundaryRequirementIds: readonly NewGMModeDraftPickExecutionBoundaryRequirementId[];
  readonly executionBoundaryBlockedReasonIds: readonly NewGMModeDraftPickExecutionBoundaryBlockedReason[];
  readonly capabilityFlags: NewGMModeDraftPickExecutionReadinessCapabilityFlags;
}

export function createNewGMModeDraftPickExecutionReadinessSummary(
  input: NewGMModeDraftPickExecutionReadinessSummaryInput
): NewGMModeDraftPickExecutionReadinessSummary {
  const draftPickObjectReadinessSummary =
    createNewGMModeDraftPickObjectReadinessSummary({
      draftPickObject: input.draftPickObject
    });
  const executionBoundary =
    createNewGMModeDraftPickExecutionBoundaryContractShell();
  const draftPickObjectIsStructurallyReady =
    draftPickObjectReadinessSummary.draftPickObjectReadinessPhase ===
    "draft-pick-object-valid-execution-unavailable";

  return Object.freeze({
    draftPickExecutionReadinessSummaryId:
      "new-gm-mode-draft-pick-execution-readiness-summary-v0.1",
    version: "0.1",
    domainObject: true,
    diagnosticsOnly: true,
    playerFacing: false,
    gameplayAffecting: false,
    mutable: false,
    shallowSummary: true,
    deterministicOrdering: true,
    draftPickObjectReadinessPhase:
      draftPickObjectReadinessSummary.draftPickObjectReadinessPhase,
    draftPickExecutionReadinessPhase: draftPickObjectIsStructurallyReady
      ? "draft-pick-execution-boundary-ready-execution-blocked"
      : "draft-pick-execution-boundary-blocked-by-draft-pick-object",
    draftPickObjectReadinessConsumed: true,
    draftPickObjectValidatorStatus: Object.freeze({
      validatorId: draftPickObjectReadinessSummary.validatorStatus.validatorId,
      structurallyValid:
        draftPickObjectReadinessSummary.validatorStatus.structurallyValid,
      issueCount: draftPickObjectReadinessSummary.validatorStatus.issueCount,
      issueIds: Object.freeze([
        ...draftPickObjectReadinessSummary.validatorStatus.issueIds
      ])
    }),
    executionBoundaryRequirementIds: Object.freeze(
      executionBoundary.orderedRequirements.map((requirement) => requirement.id)
    ),
    executionBoundaryBlockedReasonIds: executionBoundary.blockedReasons,
    capabilityFlags: Object.freeze({
      ...executionBoundary.capabilityFlags,
      draftPickObjectReadinessConsumed: true,
      canMutateDraftState: false
    })
  });
}
