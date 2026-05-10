import {
  createNewGMModeRosterStateObjectValidator,
  type NewGMModeRosterStateObjectValidationIssueId
} from "./newGMModeRosterStateObjectValidator.ts";

export type NewGMModeDraftCompletionPhase =
  | "draft-complete-in-memory-roster-created-gameplay-start-blocked"
  | "draft-completion-blocked";

export interface NewGMModeDraftCompletionSummaryInput {
  readonly rosterStateObject: unknown;
}

export interface NewGMModeDraftCompletionCapabilityFlags {
  readonly inMemoryRosterStateConsumable: boolean;
  readonly canCompleteDraftInMemory: boolean;
  readonly canStartGameplay: false;
  readonly canInitializeWeekOne: false;
  readonly canUnlockWeekOne: false;
  readonly canPersistGameplayPayload: false;
  readonly canWriteDatabase: false;
  readonly canCreateUserInterface: false;
  readonly canCreateGeneratedText: false;
  readonly canUseGenAI: false;
}

export interface NewGMModeDraftCompletionSummary {
  readonly draftCompletionSummaryId: "new-gm-mode-draft-completion-summary-v1.0";
  readonly version: "1.0";
  readonly domainObject: true;
  readonly diagnosticsOnly: false;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly mutable: false;
  readonly deterministicOrdering: true;
  readonly draftCompletionPhase: NewGMModeDraftCompletionPhase;
  readonly rosterStateObjectValidatorStatus: {
    readonly validatorId: "new-gm-mode-roster-state-object-validator-v0.1";
    readonly structurallyValid: boolean;
    readonly issueCount: number;
    readonly issueIds: readonly NewGMModeRosterStateObjectValidationIssueId[];
  };
  readonly rosterMembershipCount: number;
  readonly brandRosterReferences: readonly string[];
  readonly capabilityFlags: NewGMModeDraftCompletionCapabilityFlags;
}

export function createNewGMModeDraftCompletionSummary(
  input: NewGMModeDraftCompletionSummaryInput
): NewGMModeDraftCompletionSummary {
  const validator = createNewGMModeRosterStateObjectValidator({
    rosterStateObject: input.rosterStateObject
  });
  const status = readRosterStateStatus(input.rosterStateObject);
  const completed =
    validator.structurallyValid &&
    status === "roster-state-created-draft-complete-gameplay-start-blocked";
  const rosterMembershipCount = readMembershipCount(input.rosterStateObject);

  return Object.freeze({
    draftCompletionSummaryId: "new-gm-mode-draft-completion-summary-v1.0",
    version: "1.0",
    domainObject: true,
    diagnosticsOnly: false,
    playerFacing: false,
    gameplayAffecting: false,
    mutable: false,
    deterministicOrdering: true,
    draftCompletionPhase: completed
      ? "draft-complete-in-memory-roster-created-gameplay-start-blocked"
      : "draft-completion-blocked",
    rosterStateObjectValidatorStatus: Object.freeze({
      validatorId: validator.validatorId,
      structurallyValid: validator.structurallyValid,
      issueCount: validator.issueCount,
      issueIds: Object.freeze(validator.issues.map((issue) => issue.issueId))
    }),
    rosterMembershipCount,
    brandRosterReferences: Object.freeze(
      readBrandRosterReferences(input.rosterStateObject)
    ),
    capabilityFlags: Object.freeze({
      inMemoryRosterStateConsumable: validator.structurallyValid,
      canCompleteDraftInMemory: completed,
      canStartGameplay: false,
      canInitializeWeekOne: false,
      canUnlockWeekOne: false,
      canPersistGameplayPayload: false,
      canWriteDatabase: false,
      canCreateUserInterface: false,
      canCreateGeneratedText: false,
      canUseGenAI: false
    })
  });
}

function readRosterStateStatus(rosterStateObject: unknown): string | null {
  return isRecord(rosterStateObject) && typeof rosterStateObject.rosterStateStatus === "string"
    ? rosterStateObject.rosterStateStatus
    : null;
}

function readMembershipCount(rosterStateObject: unknown): number {
  return isRecord(rosterStateObject) &&
    Array.isArray(rosterStateObject.assignedWrestlerMembershipReferences)
    ? rosterStateObject.assignedWrestlerMembershipReferences.length
    : 0;
}

function readBrandRosterReferences(rosterStateObject: unknown): readonly string[] {
  if (!isRecord(rosterStateObject)) {
    return [];
  }

  const brandRosterReference = rosterStateObject.brandRosterReference;

  if (!isRecord(brandRosterReference)) {
    return [];
  }

  const value = brandRosterReference.brandRosterReference;

  return typeof value === "string" && value.length > 0 ? [value] : [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
