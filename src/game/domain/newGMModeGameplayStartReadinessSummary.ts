import {
  createNewGMModeGameplayStartBoundaryContractShell,
  type NewGMModeGameplayStartBoundaryBlockedReason,
  type NewGMModeGameplayStartBoundaryCapabilityFlags,
  type NewGMModeGameplayStartBoundaryRequirementId
} from "./newGMModeGameplayStartBoundaryContractShell.ts";
import {
  createNewGMModeRosterStateObjectReadinessSummary,
  type NewGMModeRosterStateObjectReadinessPhase
} from "./newGMModeRosterStateObjectReadinessSummary.ts";

export type NewGMModeGameplayStartReadinessPhase =
  | "gameplay-start-boundary-ready-start-blocked"
  | "gameplay-start-boundary-blocked-by-roster-state";

export interface NewGMModeGameplayStartReadinessSummaryInput {
  readonly rosterStateObject: unknown;
}

export interface NewGMModeGameplayStartReadinessCapabilityFlags
  extends NewGMModeGameplayStartBoundaryCapabilityFlags {
  readonly rosterStateObjectReadinessConsumed: true;
}

export interface NewGMModeGameplayStartReadinessSummary {
  readonly gameplayStartReadinessSummaryId: "new-gm-mode-gameplay-start-readiness-summary-v0.1";
  readonly version: "0.1";
  readonly domainObject: true;
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly mutable: false;
  readonly shallowSummary: true;
  readonly deterministicOrdering: true;
  readonly rosterStateObjectReadinessPhase: NewGMModeRosterStateObjectReadinessPhase;
  readonly gameplayStartReadinessPhase: NewGMModeGameplayStartReadinessPhase;
  readonly rosterStateObjectReadinessConsumed: true;
  readonly rosterStateObjectValidatorStatus: {
    readonly validatorId: "new-gm-mode-roster-state-object-validator-v0.1";
    readonly structurallyValid: boolean;
    readonly issueCount: number;
    readonly issueIds: readonly string[];
  };
  readonly gameplayStartBoundaryRequirementIds: readonly NewGMModeGameplayStartBoundaryRequirementId[];
  readonly gameplayStartBoundaryBlockedReasonIds: readonly NewGMModeGameplayStartBoundaryBlockedReason[];
  readonly capabilityFlags: NewGMModeGameplayStartReadinessCapabilityFlags;
}

export function createNewGMModeGameplayStartReadinessSummary(
  input: NewGMModeGameplayStartReadinessSummaryInput
): NewGMModeGameplayStartReadinessSummary {
  const rosterStateObjectReadinessSummary =
    createNewGMModeRosterStateObjectReadinessSummary({
      rosterStateObject: input.rosterStateObject
    });
  const gameplayStartBoundary =
    createNewGMModeGameplayStartBoundaryContractShell();
  const rosterStateObjectIsStructurallyReady =
    rosterStateObjectReadinessSummary.rosterStateObjectReadinessPhase ===
    "roster-state-object-valid-mutation-unavailable";

  return Object.freeze({
    gameplayStartReadinessSummaryId:
      "new-gm-mode-gameplay-start-readiness-summary-v0.1",
    version: "0.1",
    domainObject: true,
    diagnosticsOnly: true,
    playerFacing: false,
    gameplayAffecting: false,
    mutable: false,
    shallowSummary: true,
    deterministicOrdering: true,
    rosterStateObjectReadinessPhase:
      rosterStateObjectReadinessSummary.rosterStateObjectReadinessPhase,
    gameplayStartReadinessPhase: rosterStateObjectIsStructurallyReady
      ? "gameplay-start-boundary-ready-start-blocked"
      : "gameplay-start-boundary-blocked-by-roster-state",
    rosterStateObjectReadinessConsumed: true,
    rosterStateObjectValidatorStatus: Object.freeze({
      validatorId: rosterStateObjectReadinessSummary.validatorStatus.validatorId,
      structurallyValid:
        rosterStateObjectReadinessSummary.validatorStatus.structurallyValid,
      issueCount: rosterStateObjectReadinessSummary.validatorStatus.issueCount,
      issueIds: Object.freeze([
        ...rosterStateObjectReadinessSummary.validatorStatus.issueIds
      ])
    }),
    gameplayStartBoundaryRequirementIds: Object.freeze(
      gameplayStartBoundary.orderedRequirements.map(
        (requirement) => requirement.id
      )
    ),
    gameplayStartBoundaryBlockedReasonIds:
      gameplayStartBoundary.blockedReasons,
    capabilityFlags: Object.freeze({
      ...gameplayStartBoundary.capabilityFlags,
      rosterStateObjectReadinessConsumed: true
    })
  });
}
