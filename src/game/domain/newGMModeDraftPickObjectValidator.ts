import {
  createNewGMModeDraftPickObjectBlockedReasonCatalog,
  type NewGMModeDraftPickObjectBlockedReasonCatalogId
} from "./newGMModeDraftPickObjectBlockedReasonCatalog.ts";
import {
  type NewGMModeDraftPickObjectCapabilityFlags,
  NEW_GM_MODE_DRAFT_PICK_OBJECT_INSTANCE_CAPABILITY_FLAGS
} from "./newGMModeDraftPickObject.ts";

export type NewGMModeDraftPickObjectValidationIssueId =
  | "draft-pick-object-missing"
  | "draft-pick-object-id-missing"
  | "draft-pick-object-id-not-deterministic"
  | "source-validation-result-object-id-reference-missing"
  | "source-selection-intent-object-id-reference-missing"
  | "candidate-object-id-reference-missing"
  | "source-fixture-id-reference-missing"
  | "source-wrestler-id-reference-missing"
  | "selecting-brand-id-reference-missing"
  | "draft-round-reference-missing"
  | "draft-pick-number-reference-missing"
  | "selecting-brand-reference-not-inert"
  | "draft-order-reference-not-inert"
  | "draft-pick-status-unknown"
  | "blocked-reason-ids-missing"
  | "blocked-reason-id-not-in-static-catalog"
  | "domain-object-flag-invalid"
  | "diagnostics-only-flag-invalid"
  | "player-facing-flag-invalid"
  | "gameplay-affecting-flag-invalid"
  | "mutable-flag-invalid"
  | "capability-flags-missing"
  | "capability-flag-invalid"
  | "forbidden-field-present";

export interface NewGMModeDraftPickObjectValidationIssue {
  readonly fieldId: string;
  readonly issueId: NewGMModeDraftPickObjectValidationIssueId;
}

export interface NewGMModeDraftPickObjectValidatorInput {
  readonly draftPickObject?: unknown;
}

export interface NewGMModeDraftPickObjectValidatorResult {
  readonly validatorId: "new-gm-mode-draft-pick-object-validator-v0.1";
  readonly version: "0.1";
  readonly domainObject: true;
  readonly diagnosticsOnly: false;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly mutable: false;
  readonly validationOnly: true;
  readonly structurallyValid: boolean;
  readonly issueCount: number;
  readonly issues: readonly NewGMModeDraftPickObjectValidationIssue[];
  readonly capabilityFlags: NewGMModeDraftPickObjectCapabilityFlags;
}

const ALLOWED_DRAFT_PICK_STATUSES = Object.freeze([
  "draft-pick-object-created-execution-unavailable",
  "draft-pick-object-blocked-creation-unavailable",
  "draft-pick-created-execution-ready",
  "draft-pick-creation-blocked"
]);
const FORBIDDEN_FIELD_IDS = Object.freeze([
  "selectedWrestler",
  "selectedWrestlerId",
  "selectedCandidate",
  "selectedCandidateObject",
  "draftState",
  "rosterAssignment",
  "rosterState",
  "championshipDivision",
  "match",
  "matchState",
  "show",
  "showState",
  "week",
  "weekState",
  "save",
  "savePayload",
  "SQLite",
  "sqlite",
  "sqliteConnection",
  "ui",
  "generatedText",
  "genAI",
  "genAIClient"
]);

export function createNewGMModeDraftPickObjectValidator(
  input: NewGMModeDraftPickObjectValidatorInput = {}
): NewGMModeDraftPickObjectValidatorResult {
  const issues: NewGMModeDraftPickObjectValidationIssue[] = [];

  validateDraftPickObject(input.draftPickObject, issues);

  return Object.freeze({
    validatorId: "new-gm-mode-draft-pick-object-validator-v0.1",
    version: "0.1",
    domainObject: true,
    diagnosticsOnly: false,
    playerFacing: false,
    gameplayAffecting: false,
    mutable: false,
    validationOnly: true,
    structurallyValid: issues.length === 0,
    issueCount: issues.length,
    issues: Object.freeze(issues),
    capabilityFlags: NEW_GM_MODE_DRAFT_PICK_OBJECT_INSTANCE_CAPABILITY_FLAGS
  });
}

function validateDraftPickObject(
  draftPickObject: unknown,
  issues: NewGMModeDraftPickObjectValidationIssue[]
): void {
  if (!isRecord(draftPickObject)) {
    issues.push(createIssue("draftPickObject", "draft-pick-object-missing"));
    return;
  }

  validateObjectId(draftPickObject, issues);
  validateReferenceFields(draftPickObject, issues);
  validateDraftPickStatus(draftPickObject, issues);
  validateBlockedReasonIds(draftPickObject, issues);
  validateDomainFlags(draftPickObject, issues);
  validateCapabilityFlags(draftPickObject.capabilityFlags, issues);
  validateForbiddenFields(draftPickObject, issues);
}

function validateObjectId(
  draftPickObject: Record<string, unknown>,
  issues: NewGMModeDraftPickObjectValidationIssue[]
): void {
  const objectId = readString(draftPickObject, "draftPickObjectId");

  if (!objectId) {
    issues.push(
      createIssue("draftPickObjectId", "draft-pick-object-id-missing")
    );
    return;
  }

  const expectedId = createExpectedDraftPickObjectId(draftPickObject);

  if (expectedId && objectId !== expectedId) {
    issues.push(
      createIssue(
        "draftPickObjectId",
        "draft-pick-object-id-not-deterministic"
      )
    );
  }
}

function validateReferenceFields(
  draftPickObject: Record<string, unknown>,
  issues: NewGMModeDraftPickObjectValidationIssue[]
): void {
  const sourceValidationResultReference =
    draftPickObject.sourceValidationResultReference;
  const sourceSelectionIntentReference =
    draftPickObject.sourceSelectionIntentReference;
  const sourceCandidateReference = draftPickObject.sourceCandidateReference;
  const sourceFixtureReference = draftPickObject.sourceFixtureReference;
  const sourceWrestlerReference = draftPickObject.sourceWrestlerReference;
  const selectingBrandReference = draftPickObject.selectingBrandReference;
  const draftOrderReference = draftPickObject.draftOrderReference;

  if (
    !isRecord(sourceValidationResultReference) ||
    !readString(
      sourceValidationResultReference,
      "sourceValidationResultObjectId"
    )
  ) {
    issues.push(
      createIssue(
        "sourceValidationResultReference.sourceValidationResultObjectId",
        "source-validation-result-object-id-reference-missing"
      )
    );
  }

  if (
    !isRecord(sourceSelectionIntentReference) ||
    !readString(
      sourceSelectionIntentReference,
      "sourceSelectionIntentObjectId"
    )
  ) {
    issues.push(
      createIssue(
        "sourceSelectionIntentReference.sourceSelectionIntentObjectId",
        "source-selection-intent-object-id-reference-missing"
      )
    );
  }

  if (
    !isRecord(sourceCandidateReference) ||
    !readString(sourceCandidateReference, "candidateObjectId")
  ) {
    issues.push(
      createIssue(
        "sourceCandidateReference.candidateObjectId",
        "candidate-object-id-reference-missing"
      )
    );
  }

  if (
    !isRecord(sourceFixtureReference) ||
    !readString(sourceFixtureReference, "sourceFixtureId")
  ) {
    issues.push(
      createIssue(
        "sourceFixtureReference.sourceFixtureId",
        "source-fixture-id-reference-missing"
      )
    );
  }

  if (
    !isRecord(sourceWrestlerReference) ||
    !readString(sourceWrestlerReference, "sourceWrestlerId")
  ) {
    issues.push(
      createIssue(
        "sourceWrestlerReference.sourceWrestlerId",
        "source-wrestler-id-reference-missing"
      )
    );
  }

  if (
    !isRecord(selectingBrandReference) ||
    !readString(selectingBrandReference, "selectingBrandId")
  ) {
    issues.push(
      createIssue(
        "selectingBrandReference.selectingBrandId",
        "selecting-brand-id-reference-missing"
      )
    );
  }

  if (
    !isRecord(draftOrderReference) ||
    !Number.isFinite(draftOrderReference.draftRound)
  ) {
    issues.push(
      createIssue(
        "draftOrderReference.draftRound",
        "draft-round-reference-missing"
      )
    );
  }

  if (
    !isRecord(draftOrderReference) ||
    !Number.isFinite(draftOrderReference.draftPickNumber)
  ) {
    issues.push(
      createIssue(
        "draftOrderReference.draftPickNumber",
        "draft-pick-number-reference-missing"
      )
    );
  }

  if (
    isRecord(selectingBrandReference) &&
    selectingBrandReference.placeholderOnly !== true
  ) {
    issues.push(
      createIssue(
        "selectingBrandReference.placeholderOnly",
        "selecting-brand-reference-not-inert"
      )
    );
  }

  if (
    isRecord(draftOrderReference) &&
    draftOrderReference.placeholderOnly !== true
  ) {
    issues.push(
      createIssue(
        "draftOrderReference.placeholderOnly",
        "draft-order-reference-not-inert"
      )
    );
  }
}

function validateDraftPickStatus(
  draftPickObject: Record<string, unknown>,
  issues: NewGMModeDraftPickObjectValidationIssue[]
): void {
  if (
    typeof draftPickObject.draftPickStatus !== "string" ||
    !ALLOWED_DRAFT_PICK_STATUSES.includes(draftPickObject.draftPickStatus)
  ) {
    issues.push(createIssue("draftPickStatus", "draft-pick-status-unknown"));
  }
}

function validateBlockedReasonIds(
  draftPickObject: Record<string, unknown>,
  issues: NewGMModeDraftPickObjectValidationIssue[]
): void {
  const blockedReasonReferences = draftPickObject.blockedReasonReferences;

  if (
    !isRecord(blockedReasonReferences) ||
    !Array.isArray(blockedReasonReferences.blockedReasonIds)
  ) {
    issues.push(
      createIssue(
        "blockedReasonReferences.blockedReasonIds",
        "blocked-reason-ids-missing"
      )
    );
    return;
  }

  const catalogIds = new Set(
    createNewGMModeDraftPickObjectBlockedReasonCatalog().blockedReasonIds
  );

  blockedReasonReferences.blockedReasonIds.forEach((blockedReasonId, index) => {
    if (
      typeof blockedReasonId !== "string" ||
      !catalogIds.has(
        blockedReasonId as NewGMModeDraftPickObjectBlockedReasonCatalogId
      )
    ) {
      issues.push(
        createIssue(
          `blockedReasonReferences.blockedReasonIds.${index}`,
          "blocked-reason-id-not-in-static-catalog"
        )
      );
    }
  });
}

function validateDomainFlags(
  draftPickObject: Record<string, unknown>,
  issues: NewGMModeDraftPickObjectValidationIssue[]
): void {
  if (draftPickObject.domainObject !== true) {
    issues.push(createIssue("domainObject", "domain-object-flag-invalid"));
  }

  if (draftPickObject.diagnosticsOnly !== false) {
    issues.push(
      createIssue("diagnosticsOnly", "diagnostics-only-flag-invalid")
    );
  }

  if (draftPickObject.playerFacing !== false) {
    issues.push(createIssue("playerFacing", "player-facing-flag-invalid"));
  }

  if (draftPickObject.gameplayAffecting !== false) {
    issues.push(
      createIssue("gameplayAffecting", "gameplay-affecting-flag-invalid")
    );
  }

  if (draftPickObject.mutable !== false) {
    issues.push(createIssue("mutable", "mutable-flag-invalid"));
  }
}

function validateCapabilityFlags(
  capabilityFlags: unknown,
  issues: NewGMModeDraftPickObjectValidationIssue[]
): void {
  if (!isRecord(capabilityFlags)) {
    issues.push(createIssue("capabilityFlags", "capability-flags-missing"));
    return;
  }

  Object.entries(NEW_GM_MODE_DRAFT_PICK_OBJECT_INSTANCE_CAPABILITY_FLAGS).forEach(
    ([flagId, expectedValue]) => {
      if (capabilityFlags[flagId] !== expectedValue) {
        issues.push(
          createIssue(`capabilityFlags.${flagId}`, "capability-flag-invalid")
        );
      }
    }
  );
}

function validateForbiddenFields(
  source: Record<string, unknown>,
  issues: NewGMModeDraftPickObjectValidationIssue[]
): void {
  collectForbiddenFieldPaths(source).forEach((fieldPath) => {
    issues.push(createIssue(fieldPath, "forbidden-field-present"));
  });
}

function createExpectedDraftPickObjectId(
  draftPickObject: Record<string, unknown>
): string | null {
  const sourceValidationResultReference =
    draftPickObject.sourceValidationResultReference;
  const sourceSelectionIntentReference =
    draftPickObject.sourceSelectionIntentReference;
  const sourceCandidateReference = draftPickObject.sourceCandidateReference;
  const sourceFixtureReference = draftPickObject.sourceFixtureReference;
  const sourceWrestlerReference = draftPickObject.sourceWrestlerReference;
  const selectingBrandReference = draftPickObject.selectingBrandReference;
  const draftOrderReference = draftPickObject.draftOrderReference;
  const blockedReasonReferences = draftPickObject.blockedReasonReferences;

  if (
    !isRecord(sourceValidationResultReference) ||
    !isRecord(sourceSelectionIntentReference) ||
    !isRecord(sourceCandidateReference) ||
    !isRecord(sourceFixtureReference) ||
    !isRecord(sourceWrestlerReference) ||
    !isRecord(selectingBrandReference) ||
    !isRecord(draftOrderReference) ||
    !isRecord(blockedReasonReferences) ||
    !Array.isArray(blockedReasonReferences.blockedReasonIds) ||
    typeof draftPickObject.draftPickStatus !== "string"
  ) {
    return null;
  }

  const sourceValidationResultObjectId = readString(
    sourceValidationResultReference,
    "sourceValidationResultObjectId"
  );
  const sourceSelectionIntentObjectId = readString(
    sourceSelectionIntentReference,
    "sourceSelectionIntentObjectId"
  );
  const candidateObjectId = readString(
    sourceCandidateReference,
    "candidateObjectId"
  );
  const sourceFixtureId = readString(sourceFixtureReference, "sourceFixtureId");
  const sourceWrestlerId = readString(
    sourceWrestlerReference,
    "sourceWrestlerId"
  );
  const selectingBrandId = readString(
    selectingBrandReference,
    "selectingBrandId"
  );
  const draftRound = draftOrderReference.draftRound;
  const draftPickNumber = draftOrderReference.draftPickNumber;
  const blockedReasonIds = blockedReasonReferences.blockedReasonIds;

  if (
    !sourceValidationResultObjectId ||
    !sourceSelectionIntentObjectId ||
    !candidateObjectId ||
    !sourceFixtureId ||
    !sourceWrestlerId ||
    !selectingBrandId ||
    !Number.isFinite(draftRound) ||
    !Number.isFinite(draftPickNumber) ||
    !blockedReasonIds.every((blockedReasonId) => typeof blockedReasonId === "string")
  ) {
    return null;
  }

  return [
    "new-gm-mode-draft-pick-object",
    normalizeIdPart(sourceValidationResultObjectId),
    normalizeIdPart(sourceSelectionIntentObjectId),
    normalizeIdPart(candidateObjectId),
    normalizeIdPart(sourceFixtureId),
    normalizeIdPart(sourceWrestlerId),
    normalizeIdPart(selectingBrandId),
    `round-${normalizeIdPart(String(draftRound))}`,
    `pick-${normalizeIdPart(String(draftPickNumber))}`,
    normalizeIdPart(draftPickObject.draftPickStatus),
    createBlockedReasonIdPart(blockedReasonIds as string[])
  ].join(":");
}

function createBlockedReasonIdPart(
  blockedReasonIds: readonly string[]
): string {
  if (blockedReasonIds.length === 0) {
    return "blocked-reasons-none";
  }

  return `blocked-reasons-${blockedReasonIds
    .map((id) => normalizeIdPart(id))
    .join("-")}`;
}

function collectForbiddenFieldPaths(
  source: unknown,
  parentPath = ""
): readonly string[] {
  if (Array.isArray(source) || !isRecord(source)) {
    return [];
  }

  return Object.entries(source).flatMap(([key, value]) => {
    const fieldPath = parentPath ? `${parentPath}.${key}` : key;
    const directMatch = FORBIDDEN_FIELD_IDS.includes(key) ? [fieldPath] : [];

    return [...directMatch, ...collectForbiddenFieldPaths(value, fieldPath)];
  });
}

function createIssue(
  fieldId: string,
  issueId: NewGMModeDraftPickObjectValidationIssueId
): NewGMModeDraftPickObjectValidationIssue {
  return Object.freeze({
    fieldId,
    issueId
  });
}

function normalizeIdPart(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized.length > 0 ? normalized : "empty";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(
  source: Record<string, unknown>,
  key: string
): string | undefined {
  const value = source[key];

  return typeof value === "string" && value.length > 0 ? value : undefined;
}
