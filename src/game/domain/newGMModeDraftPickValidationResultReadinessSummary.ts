import {
  createNewGMModeDraftPickValidationIssueCatalog,
  type NewGMModeDraftPickValidationIssueCatalogId
} from "./newGMModeDraftPickValidationIssueCatalog.ts";
import {
  createNewGMModeDraftPickValidationReadinessSummary,
  type NewGMModeDraftPickValidationReadinessPhase
} from "./newGMModeDraftPickValidationReadinessSummary.ts";
import {
  createNewGMModeDraftPickValidationResultContractShell,
  type NewGMModeDraftPickValidationResultBlockedReason,
  type NewGMModeDraftPickValidationResultCapabilityFlags,
  type NewGMModeDraftPickValidationResultRequirementId
} from "./newGMModeDraftPickValidationResultContractShell.ts";

export type NewGMModeDraftPickValidationResultReadinessPhase =
  | "draft-pick-validation-result-shape-ready-creation-blocked"
  | "draft-pick-validation-result-shape-blocked-by-validation-boundary";

export interface NewGMModeDraftPickValidationResultReadinessSummaryInput {
  readonly draftPickValidationReadinessSummary?: unknown;
  readonly selectionIntentReadinessSummary?: unknown;
  readonly selectionIntentObject?: unknown;
}

export interface NewGMModeDraftPickValidationResultReadinessSummary {
  readonly draftPickValidationResultReadinessSummaryId: "new-gm-mode-draft-pick-validation-result-readiness-summary-v0.1";
  readonly version: "0.1";
  readonly domainObject: true;
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly mutable: false;
  readonly shallowSummary: true;
  readonly deterministicOrdering: true;
  readonly draftPickValidationReadinessPhase:
    | NewGMModeDraftPickValidationReadinessPhase
    | "unavailable";
  readonly validationResultReadinessPhase: NewGMModeDraftPickValidationResultReadinessPhase;
  readonly resultContractRequirementIds: readonly NewGMModeDraftPickValidationResultRequirementId[];
  readonly staticIssueCatalogIds: readonly NewGMModeDraftPickValidationIssueCatalogId[];
  readonly blockedReasonIds: readonly NewGMModeDraftPickValidationResultBlockedReason[];
  readonly capabilityFlags: NewGMModeDraftPickValidationResultCapabilityFlags;
}

export function createNewGMModeDraftPickValidationResultReadinessSummary(
  input: NewGMModeDraftPickValidationResultReadinessSummaryInput = {}
): NewGMModeDraftPickValidationResultReadinessSummary {
  const validationReadinessSummary =
    input.draftPickValidationReadinessSummary ??
    createNewGMModeDraftPickValidationReadinessSummary({
      selectionIntentReadinessSummary: input.selectionIntentReadinessSummary,
      selectionIntentObject: input.selectionIntentObject
    });
  const validationReadinessPhase = readValidationReadinessPhase(
    validationReadinessSummary
  );
  const contract = createNewGMModeDraftPickValidationResultContractShell();
  const issueCatalog = createNewGMModeDraftPickValidationIssueCatalog();

  return Object.freeze({
    draftPickValidationResultReadinessSummaryId:
      "new-gm-mode-draft-pick-validation-result-readiness-summary-v0.1",
    version: "0.1",
    domainObject: true,
    diagnosticsOnly: true,
    playerFacing: false,
    gameplayAffecting: false,
    mutable: false,
    shallowSummary: true,
    deterministicOrdering: true,
    draftPickValidationReadinessPhase: validationReadinessPhase,
    validationResultReadinessPhase:
      validationReadinessPhase ===
      "draft-pick-validation-boundary-ready-validation-blocked"
        ? "draft-pick-validation-result-shape-ready-creation-blocked"
        : "draft-pick-validation-result-shape-blocked-by-validation-boundary",
    resultContractRequirementIds: Object.freeze(
      contract.orderedRequirements.map((requirement) => requirement.id)
    ),
    staticIssueCatalogIds: issueCatalog.issueIds,
    blockedReasonIds: contract.blockedReasons,
    capabilityFlags: contract.capabilityFlags
  });
}

function readValidationReadinessPhase(
  validationReadinessSummary: unknown
): NewGMModeDraftPickValidationReadinessPhase | "unavailable" {
  if (
    isRecord(validationReadinessSummary) &&
    (validationReadinessSummary.draftPickValidationReadinessPhase ===
      "draft-pick-validation-boundary-ready-validation-blocked" ||
      validationReadinessSummary.draftPickValidationReadinessPhase ===
        "draft-pick-validation-boundary-blocked-by-selection-intent")
  ) {
    return validationReadinessSummary.draftPickValidationReadinessPhase;
  }

  return "unavailable";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
