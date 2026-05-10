import {
  createNewGMModeDraftPickValidationBoundaryContractShell,
  type NewGMModeDraftPickValidationBoundaryBlockedReason,
  type NewGMModeDraftPickValidationBoundaryCapabilityFlags,
  type NewGMModeDraftPickValidationBoundaryRequirementId
} from "./newGMModeDraftPickValidationBoundaryContractShell.ts";
import {
  createNewGMModeDraftSelectionIntentReadinessSummary,
  type NewGMModeDraftSelectionIntentReadinessPhase
} from "./newGMModeDraftSelectionIntentReadinessSummary.ts";

export type NewGMModeDraftPickValidationReadinessPhase =
  | "draft-pick-validation-boundary-ready-validation-blocked"
  | "draft-pick-validation-boundary-blocked-by-selection-intent";

export interface NewGMModeDraftPickValidationReadinessSummaryInput {
  readonly selectionIntentReadinessSummary?: unknown;
  readonly selectionIntentObject?: unknown;
}

export interface NewGMModeDraftPickValidationReadinessSummary {
  readonly draftPickValidationReadinessSummaryId: "new-gm-mode-draft-pick-validation-readiness-summary-v0.1";
  readonly version: "0.1";
  readonly domainObject: true;
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly mutable: false;
  readonly shallowSummary: true;
  readonly deterministicOrdering: true;
  readonly selectionIntentReadinessPhase: NewGMModeDraftSelectionIntentReadinessPhase | "unavailable";
  readonly draftPickValidationReadinessPhase: NewGMModeDraftPickValidationReadinessPhase;
  readonly contractRequirementIds: readonly NewGMModeDraftPickValidationBoundaryRequirementId[];
  readonly blockedReasonIds: readonly NewGMModeDraftPickValidationBoundaryBlockedReason[];
  readonly capabilityFlags: NewGMModeDraftPickValidationBoundaryCapabilityFlags;
}

export function createNewGMModeDraftPickValidationReadinessSummary(
  input: NewGMModeDraftPickValidationReadinessSummaryInput = {}
): NewGMModeDraftPickValidationReadinessSummary {
  const contract = createNewGMModeDraftPickValidationBoundaryContractShell();
  const selectionIntentReadinessSummary =
    input.selectionIntentReadinessSummary ??
    createNewGMModeDraftSelectionIntentReadinessSummary({
      selectionIntentObject: input.selectionIntentObject
    });
  const selectionIntentReadinessPhase = readSelectionIntentReadinessPhase(
    selectionIntentReadinessSummary
  );

  return Object.freeze({
    draftPickValidationReadinessSummaryId:
      "new-gm-mode-draft-pick-validation-readiness-summary-v0.1",
    version: "0.1",
    domainObject: true,
    diagnosticsOnly: true,
    playerFacing: false,
    gameplayAffecting: false,
    mutable: false,
    shallowSummary: true,
    deterministicOrdering: true,
    selectionIntentReadinessPhase,
    draftPickValidationReadinessPhase:
      selectionIntentReadinessPhase ===
      "selection-intent-object-valid-pick-validation-unavailable"
        ? "draft-pick-validation-boundary-ready-validation-blocked"
        : "draft-pick-validation-boundary-blocked-by-selection-intent",
    contractRequirementIds: Object.freeze(
      contract.orderedRequirements.map((requirement) => requirement.id)
    ),
    blockedReasonIds: contract.blockedReasons,
    capabilityFlags: contract.capabilityFlags
  });
}

function readSelectionIntentReadinessPhase(
  selectionIntentReadinessSummary: unknown
): NewGMModeDraftSelectionIntentReadinessPhase | "unavailable" {
  if (
    isRecord(selectionIntentReadinessSummary) &&
    (selectionIntentReadinessSummary.selectionIntentReadinessPhase ===
      "selection-intent-object-valid-pick-validation-unavailable" ||
      selectionIntentReadinessSummary.selectionIntentReadinessPhase ===
        "selection-intent-object-invalid")
  ) {
    return selectionIntentReadinessSummary.selectionIntentReadinessPhase;
  }

  return "unavailable";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
