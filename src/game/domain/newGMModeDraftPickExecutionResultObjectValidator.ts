import {
  createNewGMModeDraftPickExecutionBlockedReasonCatalog,
  type NewGMModeDraftPickExecutionBlockedReasonCatalogId
} from "./newGMModeDraftPickExecutionBlockedReasonCatalog.ts";
import {
  type NewGMModeDraftPickExecutionResultObjectCapabilityFlags,
  NEW_GM_MODE_DRAFT_PICK_EXECUTION_RESULT_OBJECT_CAPABILITY_FLAGS
} from "./newGMModeDraftPickExecutionResultObject.ts";

export type NewGMModeDraftPickExecutionResultObjectValidationIssueId =
  | "draft-pick-execution-result-object-missing"
  | "draft-pick-execution-result-object-id-missing"
  | "draft-pick-execution-result-object-id-not-deterministic"
  | "source-draft-pick-object-id-reference-missing"
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
  | "execution-status-unknown"
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

export interface NewGMModeDraftPickExecutionResultObjectValidationIssue {
  readonly fieldId: string;
  readonly issueId: NewGMModeDraftPickExecutionResultObjectValidationIssueId;
}

export interface NewGMModeDraftPickExecutionResultObjectValidatorInput {
  readonly executionResultObject?: unknown;
}

export interface NewGMModeDraftPickExecutionResultObjectValidatorResult {
  readonly validatorId: "new-gm-mode-draft-pick-execution-result-object-validator-v0.1";
  readonly version: "0.1";
  readonly domainObject: true;
  readonly diagnosticsOnly: false;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly mutable: false;
  readonly validationOnly: true;
  readonly structurallyValid: boolean;
  readonly issueCount: number;
  readonly issues: readonly NewGMModeDraftPickExecutionResultObjectValidationIssue[];
  readonly capabilityFlags: NewGMModeDraftPickExecutionResultObjectCapabilityFlags;
}

const ALLOWED_EXECUTION_STATUSES = Object.freeze([
  "draft-pick-execution-result-created-mutation-unavailable",
  "draft-pick-execution-result-blocked-execution-unavailable",
  "draft-pick-executed-roster-assignment-ready",
  "draft-pick-execution-blocked"
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

export function createNewGMModeDraftPickExecutionResultObjectValidator(
  input: NewGMModeDraftPickExecutionResultObjectValidatorInput = {}
): NewGMModeDraftPickExecutionResultObjectValidatorResult {
  const issues: NewGMModeDraftPickExecutionResultObjectValidationIssue[] = [];

  validateExecutionResultObject(input.executionResultObject, issues);

  return Object.freeze({
    validatorId:
      "new-gm-mode-draft-pick-execution-result-object-validator-v0.1",
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
    capabilityFlags:
      NEW_GM_MODE_DRAFT_PICK_EXECUTION_RESULT_OBJECT_CAPABILITY_FLAGS
  });
}

function validateExecutionResultObject(
  executionResultObject: unknown,
  issues: NewGMModeDraftPickExecutionResultObjectValidationIssue[]
): void {
  if (!isRecord(executionResultObject)) {
    issues.push(
      createIssue(
        "executionResultObject",
        "draft-pick-execution-result-object-missing"
      )
    );
    return;
  }

  validateObjectId(executionResultObject, issues);
  validateReferenceFields(executionResultObject, issues);
  validateExecutionStatus(executionResultObject, issues);
  validateBlockedReasonIds(executionResultObject, issues);
  validateDomainFlags(executionResultObject, issues);
  validateCapabilityFlags(executionResultObject.capabilityFlags, issues);
  validateForbiddenFields(executionResultObject, issues);
}

function validateObjectId(
  executionResultObject: Record<string, unknown>,
  issues: NewGMModeDraftPickExecutionResultObjectValidationIssue[]
): void {
  const objectId = readString(
    executionResultObject,
    "draftPickExecutionResultObjectId"
  );

  if (!objectId) {
    issues.push(
      createIssue(
        "draftPickExecutionResultObjectId",
        "draft-pick-execution-result-object-id-missing"
      )
    );
    return;
  }

  const expectedId = createExpectedExecutionResultObjectId(
    executionResultObject
  );

  if (expectedId && objectId !== expectedId) {
    issues.push(
      createIssue(
        "draftPickExecutionResultObjectId",
        "draft-pick-execution-result-object-id-not-deterministic"
      )
    );
  }
}

function validateReferenceFields(
  executionResultObject: Record<string, unknown>,
  issues: NewGMModeDraftPickExecutionResultObjectValidationIssue[]
): void {
  const sourceDraftPickReference =
    executionResultObject.sourceDraftPickReference;
  const sourceValidationResultReference =
    executionResultObject.sourceValidationResultReference;
  const sourceSelectionIntentReference =
    executionResultObject.sourceSelectionIntentReference;
  const sourceCandidateReference =
    executionResultObject.sourceCandidateReference;
  const sourceFixtureReference =
    executionResultObject.sourceFixtureReference;
  const sourceWrestlerReference =
    executionResultObject.sourceWrestlerReference;
  const selectingBrandReference =
    executionResultObject.selectingBrandReference;
  const draftOrderReference = executionResultObject.draftOrderReference;

  if (
    !isRecord(sourceDraftPickReference) ||
    !readString(sourceDraftPickReference, "sourceDraftPickObjectId")
  ) {
    issues.push(
      createIssue(
        "sourceDraftPickReference.sourceDraftPickObjectId",
        "source-draft-pick-object-id-reference-missing"
      )
    );
  }

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

function validateExecutionStatus(
  executionResultObject: Record<string, unknown>,
  issues: NewGMModeDraftPickExecutionResultObjectValidationIssue[]
): void {
  if (
    typeof executionResultObject.executionStatus !== "string" ||
    !ALLOWED_EXECUTION_STATUSES.includes(
      executionResultObject.executionStatus
    )
  ) {
    issues.push(createIssue("executionStatus", "execution-status-unknown"));
  }
}

function validateBlockedReasonIds(
  executionResultObject: Record<string, unknown>,
  issues: NewGMModeDraftPickExecutionResultObjectValidationIssue[]
): void {
  const blockedReasonReferences = executionResultObject.blockedReasonReferences;

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
    createNewGMModeDraftPickExecutionBlockedReasonCatalog().blockedReasonIds
  );

  blockedReasonReferences.blockedReasonIds.forEach((blockedReasonId, index) => {
    if (
      typeof blockedReasonId !== "string" ||
      !catalogIds.has(
        blockedReasonId as NewGMModeDraftPickExecutionBlockedReasonCatalogId
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
  executionResultObject: Record<string, unknown>,
  issues: NewGMModeDraftPickExecutionResultObjectValidationIssue[]
): void {
  if (executionResultObject.domainObject !== true) {
    issues.push(createIssue("domainObject", "domain-object-flag-invalid"));
  }

  if (executionResultObject.diagnosticsOnly !== false) {
    issues.push(
      createIssue("diagnosticsOnly", "diagnostics-only-flag-invalid")
    );
  }

  if (executionResultObject.playerFacing !== false) {
    issues.push(createIssue("playerFacing", "player-facing-flag-invalid"));
  }

  if (executionResultObject.gameplayAffecting !== false) {
    issues.push(
      createIssue("gameplayAffecting", "gameplay-affecting-flag-invalid")
    );
  }

  if (executionResultObject.mutable !== false) {
    issues.push(createIssue("mutable", "mutable-flag-invalid"));
  }
}

function validateCapabilityFlags(
  capabilityFlags: unknown,
  issues: NewGMModeDraftPickExecutionResultObjectValidationIssue[]
): void {
  if (!isRecord(capabilityFlags)) {
    issues.push(createIssue("capabilityFlags", "capability-flags-missing"));
    return;
  }

  Object.entries(NEW_GM_MODE_DRAFT_PICK_EXECUTION_RESULT_OBJECT_CAPABILITY_FLAGS).forEach(
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
  issues: NewGMModeDraftPickExecutionResultObjectValidationIssue[]
): void {
  collectForbiddenFieldPaths(source).forEach((fieldPath) => {
    issues.push(createIssue(fieldPath, "forbidden-field-present"));
  });
}

function createExpectedExecutionResultObjectId(
  executionResultObject: Record<string, unknown>
): string | null {
  const sourceDraftPickReference =
    executionResultObject.sourceDraftPickReference;
  const sourceValidationResultReference =
    executionResultObject.sourceValidationResultReference;
  const sourceSelectionIntentReference =
    executionResultObject.sourceSelectionIntentReference;
  const sourceCandidateReference =
    executionResultObject.sourceCandidateReference;
  const sourceFixtureReference =
    executionResultObject.sourceFixtureReference;
  const sourceWrestlerReference =
    executionResultObject.sourceWrestlerReference;
  const selectingBrandReference =
    executionResultObject.selectingBrandReference;
  const draftOrderReference = executionResultObject.draftOrderReference;
  const blockedReasonReferences =
    executionResultObject.blockedReasonReferences;

  if (
    !isRecord(sourceDraftPickReference) ||
    !isRecord(sourceValidationResultReference) ||
    !isRecord(sourceSelectionIntentReference) ||
    !isRecord(sourceCandidateReference) ||
    !isRecord(sourceFixtureReference) ||
    !isRecord(sourceWrestlerReference) ||
    !isRecord(selectingBrandReference) ||
    !isRecord(draftOrderReference) ||
    !isRecord(blockedReasonReferences) ||
    !Array.isArray(blockedReasonReferences.blockedReasonIds) ||
    typeof executionResultObject.executionStatus !== "string"
  ) {
    return null;
  }

  const sourceDraftPickObjectId = readString(
    sourceDraftPickReference,
    "sourceDraftPickObjectId"
  );
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
    !sourceDraftPickObjectId ||
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
    "new-gm-mode-draft-pick-execution-result",
    normalizeIdPart(sourceDraftPickObjectId),
    normalizeIdPart(sourceValidationResultObjectId),
    normalizeIdPart(sourceSelectionIntentObjectId),
    normalizeIdPart(candidateObjectId),
    normalizeIdPart(sourceFixtureId),
    normalizeIdPart(sourceWrestlerId),
    normalizeIdPart(selectingBrandId),
    `round-${normalizeIdPart(String(draftRound))}`,
    `pick-${normalizeIdPart(String(draftPickNumber))}`,
    normalizeIdPart(executionResultObject.executionStatus),
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
  issueId: NewGMModeDraftPickExecutionResultObjectValidationIssueId
): NewGMModeDraftPickExecutionResultObjectValidationIssue {
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
