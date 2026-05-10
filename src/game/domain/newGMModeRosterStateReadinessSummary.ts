import {
  createNewGMModeDraftPickRosterAssignmentResultObjectReadinessSummary,
  type NewGMModeDraftPickRosterAssignmentResultObjectReadinessPhase
} from "./newGMModeDraftPickRosterAssignmentResultObjectReadinessSummary.ts";
import {
  createNewGMModeRosterStateBoundaryContractShell,
  type NewGMModeRosterStateBoundaryBlockedReason,
  type NewGMModeRosterStateBoundaryCapabilityFlags,
  type NewGMModeRosterStateBoundaryRequirementId
} from "./newGMModeRosterStateBoundaryContractShell.ts";

export type NewGMModeRosterStateReadinessPhase =
  | "roster-state-boundary-ready-state-creation-blocked"
  | "roster-state-boundary-blocked-by-assignment-result";

export interface NewGMModeRosterStateReadinessSummaryInput {
  readonly rosterAssignmentResultObject: unknown;
}

export interface NewGMModeRosterStateReadinessCapabilityFlags
  extends NewGMModeRosterStateBoundaryCapabilityFlags {
  readonly rosterAssignmentResultObjectReadinessConsumed: true;
}

export interface NewGMModeRosterStateReadinessSummary {
  readonly rosterStateReadinessSummaryId: "new-gm-mode-roster-state-readiness-summary-v0.1";
  readonly version: "0.1";
  readonly domainObject: true;
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly mutable: false;
  readonly shallowSummary: true;
  readonly deterministicOrdering: true;
  readonly rosterAssignmentResultObjectReadinessPhase: NewGMModeDraftPickRosterAssignmentResultObjectReadinessPhase;
  readonly rosterStateReadinessPhase: NewGMModeRosterStateReadinessPhase;
  readonly rosterAssignmentResultObjectReadinessConsumed: true;
  readonly rosterAssignmentResultObjectValidatorStatus: {
    readonly validatorId: "new-gm-mode-draft-pick-roster-assignment-result-object-validator-v0.1";
    readonly structurallyValid: boolean;
    readonly issueCount: number;
    readonly issueIds: readonly string[];
  };
  readonly rosterStateBoundaryRequirementIds: readonly NewGMModeRosterStateBoundaryRequirementId[];
  readonly rosterStateBoundaryBlockedReasonIds: readonly NewGMModeRosterStateBoundaryBlockedReason[];
  readonly capabilityFlags: NewGMModeRosterStateReadinessCapabilityFlags;
}

export function createNewGMModeRosterStateReadinessSummary(
  input: NewGMModeRosterStateReadinessSummaryInput
): NewGMModeRosterStateReadinessSummary {
  const assignmentResultObjectReadinessSummary =
    createNewGMModeDraftPickRosterAssignmentResultObjectReadinessSummary({
      rosterAssignmentResultObject: input.rosterAssignmentResultObject
    });
  const rosterStateBoundary = createNewGMModeRosterStateBoundaryContractShell();
  const assignmentResultObjectIsStructurallyReady =
    assignmentResultObjectReadinessSummary.rosterAssignmentResultObjectReadinessPhase ===
    "roster-assignment-result-object-valid-roster-state-unavailable";

  return Object.freeze({
    rosterStateReadinessSummaryId:
      "new-gm-mode-roster-state-readiness-summary-v0.1",
    version: "0.1",
    domainObject: true,
    diagnosticsOnly: true,
    playerFacing: false,
    gameplayAffecting: false,
    mutable: false,
    shallowSummary: true,
    deterministicOrdering: true,
    rosterAssignmentResultObjectReadinessPhase:
      assignmentResultObjectReadinessSummary.rosterAssignmentResultObjectReadinessPhase,
    rosterStateReadinessPhase: assignmentResultObjectIsStructurallyReady
      ? "roster-state-boundary-ready-state-creation-blocked"
      : "roster-state-boundary-blocked-by-assignment-result",
    rosterAssignmentResultObjectReadinessConsumed: true,
    rosterAssignmentResultObjectValidatorStatus: Object.freeze({
      validatorId:
        assignmentResultObjectReadinessSummary.validatorStatus.validatorId,
      structurallyValid:
        assignmentResultObjectReadinessSummary.validatorStatus
          .structurallyValid,
      issueCount:
        assignmentResultObjectReadinessSummary.validatorStatus.issueCount,
      issueIds: Object.freeze([
        ...assignmentResultObjectReadinessSummary.validatorStatus.issueIds
      ])
    }),
    rosterStateBoundaryRequirementIds: Object.freeze(
      rosterStateBoundary.orderedRequirements.map(
        (requirement) => requirement.id
      )
    ),
    rosterStateBoundaryBlockedReasonIds: rosterStateBoundary.blockedReasons,
    capabilityFlags: Object.freeze({
      ...rosterStateBoundary.capabilityFlags,
      rosterAssignmentResultObjectReadinessConsumed: true
    })
  });
}
