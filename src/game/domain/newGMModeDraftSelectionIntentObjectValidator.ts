import {
  type NewGMModeDraftSelectionIntentCapabilityFlags,
  NEW_GM_MODE_DRAFT_SELECTION_INTENT_CAPABILITY_FLAGS
} from "./newGMModeDraftSelectionIntentContractShell.ts";

export type NewGMModeDraftSelectionIntentObjectValidationIssueId =
  | "selection-intent-object-missing"
  | "draft-selection-intent-object-id-missing"
  | "draft-selection-intent-object-id-format-invalid"
  | "draft-selection-intent-object-id-not-deterministic"
  | "candidate-object-id-reference-missing"
  | "source-fixture-id-reference-missing"
  | "source-wrestler-id-reference-missing"
  | "selecting-brand-id-reference-missing"
  | "draft-round-reference-missing"
  | "draft-pick-number-reference-missing"
  | "selecting-brand-reference-not-inert"
  | "draft-order-reference-not-inert"
  | "selection-intent-status-invalid"
  | "domain-object-flag-invalid"
  | "diagnostics-only-flag-invalid"
  | "player-facing-flag-invalid"
  | "gameplay-affecting-flag-invalid"
  | "mutable-flag-invalid"
  | "capability-flags-missing"
  | "capability-flag-enabled"
  | "forbidden-field-present";

export interface NewGMModeDraftSelectionIntentObjectValidationIssue {
  readonly fieldId: string;
  readonly issueId: NewGMModeDraftSelectionIntentObjectValidationIssueId;
}

export interface NewGMModeDraftSelectionIntentObjectValidatorInput {
  readonly selectionIntentObject?: unknown;
}

export interface NewGMModeDraftSelectionIntentObjectValidatorResult {
  readonly validatorId: "new-gm-mode-draft-selection-intent-object-validator-v0.1";
  readonly version: "0.1";
  readonly domainObject: true;
  readonly diagnosticsOnly: false;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly mutable: false;
  readonly validationOnly: true;
  readonly structurallyValid: boolean;
  readonly issueCount: number;
  readonly issues: readonly NewGMModeDraftSelectionIntentObjectValidationIssue[];
  readonly capabilityFlags: NewGMModeDraftSelectionIntentCapabilityFlags;
}

const SELECTION_INTENT_ID_PREFIX = "new-gm-mode-draft-selection-intent:";
const FORBIDDEN_FIELD_IDS = Object.freeze([
  "selectedWrestler",
  "selectedWrestlerId",
  "selectedCandidate",
  "selectedCandidateObject",
  "draftPickId",
  "draftPickResult",
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

export function createNewGMModeDraftSelectionIntentObjectValidator(
  input: NewGMModeDraftSelectionIntentObjectValidatorInput = {}
): NewGMModeDraftSelectionIntentObjectValidatorResult {
  const selectionIntentObject = input.selectionIntentObject;
  const issues: NewGMModeDraftSelectionIntentObjectValidationIssue[] = [];

  validateSelectionIntentObject(selectionIntentObject, issues);

  return Object.freeze({
    validatorId: "new-gm-mode-draft-selection-intent-object-validator-v0.1",
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
    capabilityFlags: NEW_GM_MODE_DRAFT_SELECTION_INTENT_CAPABILITY_FLAGS
  });
}

function validateSelectionIntentObject(
  selectionIntentObject: unknown,
  issues: NewGMModeDraftSelectionIntentObjectValidationIssue[]
): void {
  if (!isRecord(selectionIntentObject)) {
    issues.push(
      createIssue("selectionIntentObject", "selection-intent-object-missing")
    );
    return;
  }

  validateSelectionIntentObjectId(selectionIntentObject, issues);
  validateReferenceFields(selectionIntentObject, issues);
  validateStatus(selectionIntentObject, issues);
  validateDomainFlags(selectionIntentObject, issues);
  validateCapabilityFlags(selectionIntentObject.capabilityFlags, issues);
  validateForbiddenFields(selectionIntentObject, issues);
}

function validateSelectionIntentObjectId(
  selectionIntentObject: Record<string, unknown>,
  issues: NewGMModeDraftSelectionIntentObjectValidationIssue[]
): void {
  const objectId = readString(
    selectionIntentObject,
    "draftSelectionIntentObjectId"
  );

  if (!objectId) {
    issues.push(
      createIssue(
        "draftSelectionIntentObjectId",
        "draft-selection-intent-object-id-missing"
      )
    );
    return;
  }

  if (!objectId.startsWith(SELECTION_INTENT_ID_PREFIX)) {
    issues.push(
      createIssue(
        "draftSelectionIntentObjectId",
        "draft-selection-intent-object-id-format-invalid"
      )
    );
    return;
  }

  const expectedId = createExpectedSelectionIntentObjectId(selectionIntentObject);

  if (expectedId && objectId !== expectedId) {
    issues.push(
      createIssue(
        "draftSelectionIntentObjectId",
        "draft-selection-intent-object-id-not-deterministic"
      )
    );
  }
}

function validateReferenceFields(
  selectionIntentObject: Record<string, unknown>,
  issues: NewGMModeDraftSelectionIntentObjectValidationIssue[]
): void {
  const sourceCandidateReference = selectionIntentObject.sourceCandidateReference;
  const sourceFixtureReference = selectionIntentObject.sourceFixtureReference;
  const sourceWrestlerReference = selectionIntentObject.sourceWrestlerReference;
  const selectingBrandReference = selectionIntentObject.selectingBrandReference;
  const draftOrderReference = selectionIntentObject.draftOrderReference;

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

function validateStatus(
  selectionIntentObject: Record<string, unknown>,
  issues: NewGMModeDraftSelectionIntentObjectValidationIssue[]
): void {
  if (
    selectionIntentObject.validationStatus !==
    "selection-intent-created-validation-unavailable"
  ) {
    issues.push(
      createIssue("validationStatus", "selection-intent-status-invalid")
    );
  }
}

function validateDomainFlags(
  selectionIntentObject: Record<string, unknown>,
  issues: NewGMModeDraftSelectionIntentObjectValidationIssue[]
): void {
  if (selectionIntentObject.domainObject !== true) {
    issues.push(createIssue("domainObject", "domain-object-flag-invalid"));
  }

  if (selectionIntentObject.diagnosticsOnly !== false) {
    issues.push(
      createIssue("diagnosticsOnly", "diagnostics-only-flag-invalid")
    );
  }

  if (selectionIntentObject.playerFacing !== false) {
    issues.push(createIssue("playerFacing", "player-facing-flag-invalid"));
  }

  if (selectionIntentObject.gameplayAffecting !== false) {
    issues.push(
      createIssue("gameplayAffecting", "gameplay-affecting-flag-invalid")
    );
  }

  if (selectionIntentObject.mutable !== false) {
    issues.push(createIssue("mutable", "mutable-flag-invalid"));
  }
}

function validateCapabilityFlags(
  capabilityFlags: unknown,
  issues: NewGMModeDraftSelectionIntentObjectValidationIssue[]
): void {
  if (!isRecord(capabilityFlags)) {
    issues.push(createIssue("capabilityFlags", "capability-flags-missing"));
    return;
  }

  Object.entries(NEW_GM_MODE_DRAFT_SELECTION_INTENT_CAPABILITY_FLAGS).forEach(
    ([flagId, expectedValue]) => {
      if (capabilityFlags[flagId] !== expectedValue) {
        issues.push(
          createIssue(`capabilityFlags.${flagId}`, "capability-flag-enabled")
        );
      }
    }
  );
}

function validateForbiddenFields(
  source: Record<string, unknown>,
  issues: NewGMModeDraftSelectionIntentObjectValidationIssue[]
): void {
  collectForbiddenFieldPaths(source).forEach((fieldPath) => {
    issues.push(createIssue(fieldPath, "forbidden-field-present"));
  });
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

function createExpectedSelectionIntentObjectId(
  selectionIntentObject: Record<string, unknown>
): string | null {
  const sourceCandidateReference = selectionIntentObject.sourceCandidateReference;
  const sourceFixtureReference = selectionIntentObject.sourceFixtureReference;
  const sourceWrestlerReference = selectionIntentObject.sourceWrestlerReference;
  const selectingBrandReference = selectionIntentObject.selectingBrandReference;
  const draftOrderReference = selectionIntentObject.draftOrderReference;

  if (
    !isRecord(sourceCandidateReference) ||
    !isRecord(sourceFixtureReference) ||
    !isRecord(sourceWrestlerReference) ||
    !isRecord(selectingBrandReference) ||
    !isRecord(draftOrderReference)
  ) {
    return null;
  }

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

  if (
    !candidateObjectId ||
    !sourceFixtureId ||
    !sourceWrestlerId ||
    !selectingBrandId ||
    !Number.isFinite(draftRound) ||
    !Number.isFinite(draftPickNumber)
  ) {
    return null;
  }

  return [
    "new-gm-mode-draft-selection-intent",
    normalizeIdPart(candidateObjectId),
    normalizeIdPart(sourceFixtureId),
    normalizeIdPart(sourceWrestlerId),
    normalizeIdPart(selectingBrandId),
    `round-${normalizeIdPart(String(draftRound))}`,
    `pick-${normalizeIdPart(String(draftPickNumber))}`
  ].join(":");
}

function createIssue(
  fieldId: string,
  issueId: NewGMModeDraftSelectionIntentObjectValidationIssueId
): NewGMModeDraftSelectionIntentObjectValidationIssue {
  return Object.freeze({
    fieldId,
    issueId
  });
}

function normalizeIdPart(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(
    /^-|-$/g,
    ""
  );
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
