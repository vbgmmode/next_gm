import type { NewGMModeDraftPickValidationIssueCatalogId } from "./newGMModeDraftPickValidationIssueCatalog.ts";
import {
  type NewGMModeDraftPickValidationResultCapabilityFlags,
  NEW_GM_MODE_DRAFT_PICK_VALIDATION_RESULT_CAPABILITY_FLAGS
} from "./newGMModeDraftPickValidationResultContractShell.ts";

export type NewGMModeDraftPickValidationResultStatus =
  | "validation-result-created-real-validation-unavailable"
  | "validation-result-blocked-real-validation-unavailable"
  | "draft-pick-validation-approved"
  | "draft-pick-validation-blocked";

export interface NewGMModeDraftPickValidationResultObjectInput {
  readonly sourceSelectionIntentObjectId: string;
  readonly candidateObjectId: string;
  readonly sourceFixtureId: string;
  readonly sourceWrestlerId: string;
  readonly selectingBrandId: string;
  readonly draftRound: number;
  readonly draftPickNumber: number;
  readonly validationStatus: NewGMModeDraftPickValidationResultStatus;
  readonly issueIds: readonly NewGMModeDraftPickValidationIssueCatalogId[];
}

export interface NewGMModeDraftPickValidationResultObject {
  readonly draftPickValidationResultObjectId: string;
  readonly version: "0.1";
  readonly domainObject: true;
  readonly diagnosticsOnly: false;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly mutable: false;
  readonly validationStatus: NewGMModeDraftPickValidationResultStatus;
  readonly sourceSelectionIntentReference: {
    readonly sourceSelectionIntentObjectId: string;
  };
  readonly sourceCandidateReference: {
    readonly candidateObjectId: string;
  };
  readonly sourceFixtureReference: {
    readonly sourceFixtureId: string;
  };
  readonly sourceWrestlerReference: {
    readonly sourceWrestlerId: string;
  };
  readonly selectingBrandReference: {
    readonly selectingBrandId: string;
    readonly placeholderOnly: true;
  };
  readonly draftOrderReference: {
    readonly draftRound: number;
    readonly draftPickNumber: number;
    readonly placeholderOnly: true;
  };
  readonly issueReferences: {
    readonly issueIds: readonly NewGMModeDraftPickValidationIssueCatalogId[];
    readonly staticCatalogOnly: true;
    readonly evaluatedNow: false;
  };
  readonly capabilityFlags: NewGMModeDraftPickValidationResultCapabilityFlags;
}

export function createNewGMModeDraftPickValidationResultObject(
  input: NewGMModeDraftPickValidationResultObjectInput
): NewGMModeDraftPickValidationResultObject {
  return Object.freeze({
    draftPickValidationResultObjectId:
      createDraftPickValidationResultObjectId(input),
    version: "0.1",
    domainObject: true,
    diagnosticsOnly: false,
    playerFacing: false,
    gameplayAffecting: false,
    mutable: false,
    validationStatus: input.validationStatus,
    sourceSelectionIntentReference: Object.freeze({
      sourceSelectionIntentObjectId: input.sourceSelectionIntentObjectId
    }),
    sourceCandidateReference: Object.freeze({
      candidateObjectId: input.candidateObjectId
    }),
    sourceFixtureReference: Object.freeze({
      sourceFixtureId: input.sourceFixtureId
    }),
    sourceWrestlerReference: Object.freeze({
      sourceWrestlerId: input.sourceWrestlerId
    }),
    selectingBrandReference: Object.freeze({
      selectingBrandId: input.selectingBrandId,
      placeholderOnly: true
    }),
    draftOrderReference: Object.freeze({
      draftRound: input.draftRound,
      draftPickNumber: input.draftPickNumber,
      placeholderOnly: true
    }),
    issueReferences: Object.freeze({
      issueIds: Object.freeze([...input.issueIds]),
      staticCatalogOnly: true,
      evaluatedNow: false
    }),
    capabilityFlags: NEW_GM_MODE_DRAFT_PICK_VALIDATION_RESULT_CAPABILITY_FLAGS
  });
}

function createDraftPickValidationResultObjectId(
  input: NewGMModeDraftPickValidationResultObjectInput
): string {
  return [
    "new-gm-mode-draft-pick-validation-result",
    normalizeIdPart(input.sourceSelectionIntentObjectId),
    normalizeIdPart(input.candidateObjectId),
    normalizeIdPart(input.sourceFixtureId),
    normalizeIdPart(input.sourceWrestlerId),
    normalizeIdPart(input.selectingBrandId),
    `round-${normalizeIdPart(String(input.draftRound))}`,
    `pick-${normalizeIdPart(String(input.draftPickNumber))}`,
    normalizeIdPart(input.validationStatus),
    createIssueIdPart(input.issueIds)
  ].join(":");
}

function createIssueIdPart(
  issueIds: readonly NewGMModeDraftPickValidationIssueCatalogId[]
): string {
  if (issueIds.length === 0) {
    return "issues-none";
  }

  return `issues-${issueIds.map((id) => normalizeIdPart(id)).join("-")}`;
}

function normalizeIdPart(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized.length > 0 ? normalized : "empty";
}
