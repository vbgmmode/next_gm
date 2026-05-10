import {
  createNewGMModeDraftPickExecutionResultObjectReadinessSummary,
  type NewGMModeDraftPickExecutionResultObjectReadinessPhase
} from "./newGMModeDraftPickExecutionResultObjectReadinessSummary.ts";
import {
  createNewGMModeDraftPickRosterAssignmentBoundaryContractShell,
  type NewGMModeDraftPickRosterAssignmentBoundaryBlockedReason,
  type NewGMModeDraftPickRosterAssignmentBoundaryCapabilityFlags,
  type NewGMModeDraftPickRosterAssignmentBoundaryRequirementId
} from "./newGMModeDraftPickRosterAssignmentBoundaryContractShell.ts";

export type NewGMModeDraftPickRosterAssignmentReadinessPhase =
  | "draft-pick-roster-assignment-boundary-ready-assignment-blocked"
  | "draft-pick-roster-assignment-boundary-blocked-by-execution-result";

export interface NewGMModeDraftPickRosterAssignmentReadinessSummaryInput {
  readonly executionResultObject: unknown;
}

export interface NewGMModeDraftPickRosterAssignmentReadinessCapabilityFlags
  extends NewGMModeDraftPickRosterAssignmentBoundaryCapabilityFlags {
  readonly executionResultObjectReadinessConsumed: true;
}

export interface NewGMModeDraftPickRosterAssignmentReadinessSummary {
  readonly draftPickRosterAssignmentReadinessSummaryId: "new-gm-mode-draft-pick-roster-assignment-readiness-summary-v0.1";
  readonly version: "0.1";
  readonly domainObject: true;
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly mutable: false;
  readonly shallowSummary: true;
  readonly deterministicOrdering: true;
  readonly executionResultObjectReadinessPhase: NewGMModeDraftPickExecutionResultObjectReadinessPhase;
  readonly draftPickRosterAssignmentReadinessPhase: NewGMModeDraftPickRosterAssignmentReadinessPhase;
  readonly executionResultObjectReadinessConsumed: true;
  readonly executionResultObjectValidatorStatus: {
    readonly validatorId: "new-gm-mode-draft-pick-execution-result-object-validator-v0.1";
    readonly structurallyValid: boolean;
    readonly issueCount: number;
    readonly issueIds: readonly string[];
  };
  readonly rosterAssignmentBoundaryRequirementIds: readonly NewGMModeDraftPickRosterAssignmentBoundaryRequirementId[];
  readonly rosterAssignmentBoundaryBlockedReasonIds: readonly NewGMModeDraftPickRosterAssignmentBoundaryBlockedReason[];
  readonly capabilityFlags: NewGMModeDraftPickRosterAssignmentReadinessCapabilityFlags;
}

export function createNewGMModeDraftPickRosterAssignmentReadinessSummary(
  input: NewGMModeDraftPickRosterAssignmentReadinessSummaryInput
): NewGMModeDraftPickRosterAssignmentReadinessSummary {
  const executionResultObjectReadinessSummary =
    createNewGMModeDraftPickExecutionResultObjectReadinessSummary({
      executionResultObject: input.executionResultObject
    });
  const rosterAssignmentBoundary =
    createNewGMModeDraftPickRosterAssignmentBoundaryContractShell();
  const executionResultObjectIsStructurallyReady =
    executionResultObjectReadinessSummary.executionResultObjectReadinessPhase ===
    "draft-pick-execution-result-object-valid-mutation-unavailable";

  return Object.freeze({
    draftPickRosterAssignmentReadinessSummaryId:
      "new-gm-mode-draft-pick-roster-assignment-readiness-summary-v0.1",
    version: "0.1",
    domainObject: true,
    diagnosticsOnly: true,
    playerFacing: false,
    gameplayAffecting: false,
    mutable: false,
    shallowSummary: true,
    deterministicOrdering: true,
    executionResultObjectReadinessPhase:
      executionResultObjectReadinessSummary.executionResultObjectReadinessPhase,
    draftPickRosterAssignmentReadinessPhase:
      executionResultObjectIsStructurallyReady
        ? "draft-pick-roster-assignment-boundary-ready-assignment-blocked"
        : "draft-pick-roster-assignment-boundary-blocked-by-execution-result",
    executionResultObjectReadinessConsumed: true,
    executionResultObjectValidatorStatus: Object.freeze({
      validatorId:
        executionResultObjectReadinessSummary.validatorStatus.validatorId,
      structurallyValid:
        executionResultObjectReadinessSummary.validatorStatus.structurallyValid,
      issueCount:
        executionResultObjectReadinessSummary.validatorStatus.issueCount,
      issueIds: Object.freeze([
        ...executionResultObjectReadinessSummary.validatorStatus.issueIds
      ])
    }),
    rosterAssignmentBoundaryRequirementIds: Object.freeze(
      rosterAssignmentBoundary.orderedRequirements.map(
        (requirement) => requirement.id
      )
    ),
    rosterAssignmentBoundaryBlockedReasonIds:
      rosterAssignmentBoundary.blockedReasons,
    capabilityFlags: Object.freeze({
      ...rosterAssignmentBoundary.capabilityFlags,
      executionResultObjectReadinessConsumed: true
    })
  });
}
