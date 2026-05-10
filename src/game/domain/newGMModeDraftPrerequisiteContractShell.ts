import { createNewGMModeSetupReadinessHandoffShell } from "./newGMModeSetupReadinessHandoffShell.ts";

export type NewGMModeDraftPrerequisiteId =
  | "setup-readiness-handoff-prerequisite"
  | "selected-promotion-brand-prerequisite"
  | "manager-identity-prerequisite"
  | "draft-mode-prerequisite"
  | "eligible-talent-pool-prerequisite"
  | "brand-roster-slot-requirements"
  | "minimum-roster-size-requirement"
  | "championship-division-assignment-prerequisite"
  | "draft-completion-before-week-1-prerequisite"
  | "draft-result-persistence-payload-prerequisite";

export type NewGMModeDraftPrerequisiteBlockedReason =
  | "draft-prerequisite-contract-only"
  | "draft-execution-not-implemented"
  | "talent-pool-not-implemented"
  | "roster-assignment-not-implemented"
  | "brand-roster-balancing-not-implemented"
  | "championship-assignment-not-implemented"
  | "division-assignment-not-implemented"
  | "week-one-unlock-not-implemented"
  | "gameplay-start-not-implemented"
  | "gameplay-payload-persistence-not-implemented"
  | "ui-wiring-not-implemented";

export interface NewGMModeDraftPrerequisite {
  readonly id: NewGMModeDraftPrerequisiteId;
  readonly label: string;
  readonly blockedReason: NewGMModeDraftPrerequisiteBlockedReason;
}

export interface NewGMModeDraftPrerequisiteContractShell {
  readonly status: "diagnostics-only";
  readonly draftPrerequisiteContractId: "new-gm-mode-draft-prerequisite-contract-v0.1";
  readonly deterministicOrdering: true;
  readonly draftPrerequisites: readonly NewGMModeDraftPrerequisite[];
  readonly draftPrerequisiteSummary: {
    readonly prerequisiteCount: number;
    readonly requiredBeforeWeekOne: true;
    readonly contractOnly: true;
    readonly draftExecutionReady: false;
    readonly weekOneUnlockReady: false;
  };
  readonly setupContractAvailable: true;
  readonly setupOptionsCatalogAvailable: true;
  readonly setupSelectionValidatorAvailable: true;
  readonly setupReadinessHandoffAvailable: true;
  readonly draftPrerequisiteContractAvailable: true;
  readonly draftExecutionAvailable: false;
  readonly talentPoolAvailable: false;
  readonly rosterAssignmentAvailable: false;
  readonly championshipAssignmentAvailable: false;
  readonly divisionAssignmentAvailable: false;
  readonly weekOneUnlockAvailable: false;
  readonly gameplayStartAvailable: false;
  readonly gameplayPayloadPersistenceAvailable: false;
  readonly uiWiringAvailable: false;
  readonly saveCreated: false;
  readonly sqliteWritten: false;
  readonly sqliteDatabaseOpened: false;
  readonly gameplayStateCreated: false;
  readonly talentPoolsCreated: false;
  readonly rostersCreated: false;
  readonly championshipsCreated: false;
  readonly divisionsCreated: false;
  readonly matchesCreated: false;
  readonly showsCreated: false;
  readonly weeksCreated: false;
  readonly brandRosterBalancingExecuted: false;
  readonly draftLogicExecuted: false;
  readonly weekOneUnlocked: false;
  readonly matchSimulationExecuted: false;
  readonly showBookingCreated: false;
  readonly businessSystemsRun: false;
  readonly fanSocialOutputCreated: false;
  readonly generatedTextCreated: false;
  readonly genAIUsed: false;
  readonly gameplayAffecting: false;
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly blockedReasons: readonly NewGMModeDraftPrerequisiteBlockedReason[];
}

const DRAFT_PREREQUISITES: readonly NewGMModeDraftPrerequisite[] =
  Object.freeze([
    createDraftPrerequisite(
      "setup-readiness-handoff-prerequisite",
      "Setup readiness handoff prerequisite",
      "draft-prerequisite-contract-only"
    ),
    createDraftPrerequisite(
      "selected-promotion-brand-prerequisite",
      "Selected promotion or brand prerequisite",
      "draft-prerequisite-contract-only"
    ),
    createDraftPrerequisite(
      "manager-identity-prerequisite",
      "Manager identity prerequisite",
      "draft-prerequisite-contract-only"
    ),
    createDraftPrerequisite(
      "draft-mode-prerequisite",
      "Draft mode prerequisite",
      "draft-execution-not-implemented"
    ),
    createDraftPrerequisite(
      "eligible-talent-pool-prerequisite",
      "Eligible talent pool prerequisite",
      "talent-pool-not-implemented"
    ),
    createDraftPrerequisite(
      "brand-roster-slot-requirements",
      "Brand roster slot requirements",
      "brand-roster-balancing-not-implemented"
    ),
    createDraftPrerequisite(
      "minimum-roster-size-requirement",
      "Minimum roster size requirement",
      "roster-assignment-not-implemented"
    ),
    createDraftPrerequisite(
      "championship-division-assignment-prerequisite",
      "Championship and division assignment prerequisite",
      "championship-assignment-not-implemented"
    ),
    createDraftPrerequisite(
      "draft-completion-before-week-1-prerequisite",
      "Draft completion prerequisite before Week 1",
      "week-one-unlock-not-implemented"
    ),
    createDraftPrerequisite(
      "draft-result-persistence-payload-prerequisite",
      "Persistence payload prerequisite for future saved draft results",
      "gameplay-payload-persistence-not-implemented"
    )
  ]);

const BLOCKED_REASONS: readonly NewGMModeDraftPrerequisiteBlockedReason[] =
  Object.freeze([
    "draft-prerequisite-contract-only",
    "draft-execution-not-implemented",
    "talent-pool-not-implemented",
    "roster-assignment-not-implemented",
    "brand-roster-balancing-not-implemented",
    "championship-assignment-not-implemented",
    "division-assignment-not-implemented",
    "week-one-unlock-not-implemented",
    "gameplay-start-not-implemented",
    "gameplay-payload-persistence-not-implemented",
    "ui-wiring-not-implemented"
  ]);

export function createNewGMModeDraftPrerequisiteContractShell(): NewGMModeDraftPrerequisiteContractShell {
  return Object.freeze({
    status: "diagnostics-only",
    draftPrerequisiteContractId:
      "new-gm-mode-draft-prerequisite-contract-v0.1",
    deterministicOrdering: true,
    draftPrerequisites: DRAFT_PREREQUISITES,
    draftPrerequisiteSummary: Object.freeze({
      prerequisiteCount: DRAFT_PREREQUISITES.length,
      requiredBeforeWeekOne: true,
      contractOnly: true,
      draftExecutionReady: false,
      weekOneUnlockReady: false
    }),
    setupContractAvailable: true,
    setupOptionsCatalogAvailable: true,
    setupSelectionValidatorAvailable: true,
    setupReadinessHandoffAvailable:
      typeof createNewGMModeSetupReadinessHandoffShell === "function",
    draftPrerequisiteContractAvailable: true,
    draftExecutionAvailable: false,
    talentPoolAvailable: false,
    rosterAssignmentAvailable: false,
    championshipAssignmentAvailable: false,
    divisionAssignmentAvailable: false,
    weekOneUnlockAvailable: false,
    gameplayStartAvailable: false,
    gameplayPayloadPersistenceAvailable: false,
    uiWiringAvailable: false,
    saveCreated: false,
    sqliteWritten: false,
    sqliteDatabaseOpened: false,
    gameplayStateCreated: false,
    talentPoolsCreated: false,
    rostersCreated: false,
    championshipsCreated: false,
    divisionsCreated: false,
    matchesCreated: false,
    showsCreated: false,
    weeksCreated: false,
    brandRosterBalancingExecuted: false,
    draftLogicExecuted: false,
    weekOneUnlocked: false,
    matchSimulationExecuted: false,
    showBookingCreated: false,
    businessSystemsRun: false,
    fanSocialOutputCreated: false,
    generatedTextCreated: false,
    genAIUsed: false,
    gameplayAffecting: false,
    diagnosticsOnly: true,
    playerFacing: false,
    blockedReasons: BLOCKED_REASONS
  });
}

function createDraftPrerequisite(
  id: NewGMModeDraftPrerequisiteId,
  label: string,
  blockedReason: NewGMModeDraftPrerequisiteBlockedReason
): NewGMModeDraftPrerequisite {
  return Object.freeze({
    id,
    label,
    blockedReason
  });
}
