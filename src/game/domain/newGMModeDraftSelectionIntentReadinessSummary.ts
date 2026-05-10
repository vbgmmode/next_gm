import {
  type NewGMModeDraftSelectionIntentCapabilityFlags,
  NEW_GM_MODE_DRAFT_SELECTION_INTENT_CAPABILITY_FLAGS
} from "./newGMModeDraftSelectionIntentContractShell.ts";
import {
  createNewGMModeDraftSelectionIntentObjectValidator,
  type NewGMModeDraftSelectionIntentObjectValidationIssueId
} from "./newGMModeDraftSelectionIntentObjectValidator.ts";

export type NewGMModeDraftSelectionIntentReadinessPhase =
  | "selection-intent-object-valid-pick-validation-unavailable"
  | "selection-intent-object-invalid";

export interface NewGMModeDraftSelectionIntentReadinessSummaryInput {
  readonly selectionIntentObject?: unknown;
}

export interface NewGMModeDraftSelectionIntentReadinessReferences {
  readonly candidateObjectId: string | null;
  readonly sourceFixtureId: string | null;
  readonly sourceWrestlerId: string | null;
  readonly selectingBrandId: string | null;
  readonly draftRound: number | null;
  readonly draftPickNumber: number | null;
}

export interface NewGMModeDraftSelectionIntentReadinessCapabilityFlags
  extends NewGMModeDraftSelectionIntentCapabilityFlags {
  readonly selectionIntentObjectAvailable: boolean;
  readonly canValidateCandidateEligibility: false;
  readonly canValidateDraftPick: false;
  readonly canCreateDraftPick: false;
  readonly canExecuteDraftPick: false;
}

export interface NewGMModeDraftSelectionIntentReadinessSummary {
  readonly draftSelectionIntentReadinessSummaryId: "new-gm-mode-draft-selection-intent-readiness-summary-v0.1";
  readonly version: "0.1";
  readonly domainObject: true;
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly mutable: false;
  readonly shallowSummary: true;
  readonly deterministicOrdering: true;
  readonly selectionIntentObjectAvailable: boolean;
  readonly selectionIntentReadinessPhase: NewGMModeDraftSelectionIntentReadinessPhase;
  readonly validatorStatus: {
    readonly validatorId: "new-gm-mode-draft-selection-intent-object-validator-v0.1";
    readonly structurallyValid: boolean;
    readonly issueCount: number;
    readonly issueIds: readonly NewGMModeDraftSelectionIntentObjectValidationIssueId[];
  };
  readonly inertReferences: NewGMModeDraftSelectionIntentReadinessReferences;
  readonly capabilityFlags: NewGMModeDraftSelectionIntentReadinessCapabilityFlags;
}

export function createNewGMModeDraftSelectionIntentReadinessSummary(
  input: NewGMModeDraftSelectionIntentReadinessSummaryInput = {}
): NewGMModeDraftSelectionIntentReadinessSummary {
  const validator = createNewGMModeDraftSelectionIntentObjectValidator({
    selectionIntentObject: input.selectionIntentObject
  });
  const selectionIntentObjectAvailable = isRecord(input.selectionIntentObject);

  return Object.freeze({
    draftSelectionIntentReadinessSummaryId:
      "new-gm-mode-draft-selection-intent-readiness-summary-v0.1",
    version: "0.1",
    domainObject: true,
    diagnosticsOnly: true,
    playerFacing: false,
    gameplayAffecting: false,
    mutable: false,
    shallowSummary: true,
    deterministicOrdering: true,
    selectionIntentObjectAvailable,
    selectionIntentReadinessPhase: validator.structurallyValid
      ? "selection-intent-object-valid-pick-validation-unavailable"
      : "selection-intent-object-invalid",
    validatorStatus: Object.freeze({
      validatorId: validator.validatorId,
      structurallyValid: validator.structurallyValid,
      issueCount: validator.issueCount,
      issueIds: Object.freeze(validator.issues.map((issue) => issue.issueId))
    }),
    inertReferences: readInertReferences(input.selectionIntentObject),
    capabilityFlags: Object.freeze({
      ...NEW_GM_MODE_DRAFT_SELECTION_INTENT_CAPABILITY_FLAGS,
      selectionIntentObjectAvailable,
      canValidateCandidateEligibility: false,
      canValidateDraftPick: false,
      canCreateDraftPick: false,
      canExecuteDraftPick: false
    })
  });
}

function readInertReferences(
  selectionIntentObject: unknown
): NewGMModeDraftSelectionIntentReadinessReferences {
  if (!isRecord(selectionIntentObject)) {
    return EMPTY_REFERENCES;
  }

  return Object.freeze({
    candidateObjectId: readNestedString(
      selectionIntentObject,
      "sourceCandidateReference",
      "candidateObjectId"
    ),
    sourceFixtureId: readNestedString(
      selectionIntentObject,
      "sourceFixtureReference",
      "sourceFixtureId"
    ),
    sourceWrestlerId: readNestedString(
      selectionIntentObject,
      "sourceWrestlerReference",
      "sourceWrestlerId"
    ),
    selectingBrandId: readNestedString(
      selectionIntentObject,
      "selectingBrandReference",
      "selectingBrandId"
    ),
    draftRound: readNestedNumber(
      selectionIntentObject,
      "draftOrderReference",
      "draftRound"
    ),
    draftPickNumber: readNestedNumber(
      selectionIntentObject,
      "draftOrderReference",
      "draftPickNumber"
    )
  });
}

const EMPTY_REFERENCES: NewGMModeDraftSelectionIntentReadinessReferences =
  Object.freeze({
    candidateObjectId: null,
    sourceFixtureId: null,
    sourceWrestlerId: null,
    selectingBrandId: null,
    draftRound: null,
    draftPickNumber: null
  });

function readNestedString(
  source: Record<string, unknown>,
  parentKey: string,
  childKey: string
): string | null {
  const parent = source[parentKey];

  if (!isRecord(parent)) {
    return null;
  }

  const value = parent[childKey];

  return typeof value === "string" && value.length > 0 ? value : null;
}

function readNestedNumber(
  source: Record<string, unknown>,
  parentKey: string,
  childKey: string
): number | null {
  const parent = source[parentKey];

  if (!isRecord(parent)) {
    return null;
  }

  const value = parent[childKey];

  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
