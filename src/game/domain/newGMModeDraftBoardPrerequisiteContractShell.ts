import { createNewGMModeDraftPrerequisiteContractShell } from "./newGMModeDraftPrerequisiteContractShell.ts";
import { createNewGMModeSetupReadinessHandoffShell } from "./newGMModeSetupReadinessHandoffShell.ts";
import { createNewGMModeTalentPoolPrerequisiteContractShell } from "./newGMModeTalentPoolPrerequisiteContractShell.ts";

export type NewGMModeDraftBoardPrerequisiteId =
  | "setup-readiness-handoff-prerequisite"
  | "draft-prerequisite-contract-prerequisite"
  | "talent-pool-prerequisite-contract-prerequisite"
  | "eligible-talent-pool-prerequisite"
  | "draft-board-ordering-prerequisite"
  | "wrestler-display-identity-prerequisite"
  | "brand-eligibility-visibility-prerequisite"
  | "role-division-visibility-prerequisite"
  | "availability-status-prerequisite"
  | "draft-pick-validation-prerequisite"
  | "roster-slot-compatibility-prerequisite"
  | "draft-board-state-persistence-payload-prerequisite";

export type NewGMModeDraftBoardPrerequisiteBlockedReason =
  | "draft-board-prerequisite-contract-only"
  | "setup-readiness-handoff-required"
  | "draft-prerequisite-contract-required"
  | "talent-pool-prerequisite-contract-required"
  | "eligible-talent-pool-not-implemented"
  | "draft-board-creation-not-implemented"
  | "draft-ordering-not-implemented"
  | "wrestler-data-loading-not-implemented"
  | "wrestler-display-identity-not-implemented"
  | "brand-eligibility-visibility-not-implemented"
  | "role-division-visibility-not-implemented"
  | "availability-status-not-implemented"
  | "draft-pick-validation-not-implemented"
  | "roster-slot-compatibility-not-implemented"
  | "gameplay-payload-persistence-not-implemented"
  | "draft-execution-not-implemented"
  | "roster-assignment-not-implemented"
  | "championship-assignment-not-implemented"
  | "division-assignment-not-implemented"
  | "week-one-unlock-not-implemented"
  | "gameplay-start-not-implemented"
  | "ui-wiring-not-implemented";

export interface NewGMModeDraftBoardPrerequisite {
  readonly id: NewGMModeDraftBoardPrerequisiteId;
  readonly label: string;
  readonly blockedReason: NewGMModeDraftBoardPrerequisiteBlockedReason;
}

export interface NewGMModeDraftBoardPrerequisiteContractShell {
  readonly status: "diagnostics-only";
  readonly draftBoardPrerequisiteContractId: "new-gm-mode-draft-board-prerequisite-contract-v0.1";
  readonly deterministicOrdering: true;
  readonly draftBoardPrerequisites: readonly NewGMModeDraftBoardPrerequisite[];
  readonly draftBoardPrerequisiteSummary: {
    readonly prerequisiteCount: number;
    readonly requiredBeforeDraftExecution: true;
    readonly contractOnly: true;
    readonly draftBoardCreationReady: false;
    readonly draftPickValidationReady: false;
    readonly draftExecutionReady: false;
  };
  readonly setupContractAvailable: true;
  readonly setupOptionsCatalogAvailable: true;
  readonly setupSelectionValidatorAvailable: true;
  readonly setupReadinessHandoffAvailable: true;
  readonly draftPrerequisiteContractAvailable: true;
  readonly talentPoolPrerequisiteContractAvailable: true;
  readonly draftBoardPrerequisiteContractAvailable: true;
  readonly draftBoardCreationAvailable: false;
  readonly wrestlerDataLoadingAvailable: false;
  readonly eligibleTalentPoolCreationAvailable: false;
  readonly draftOrderingAvailable: false;
  readonly wrestlerDisplayIdentityAvailable: false;
  readonly brandEligibilityVisibilityAvailable: false;
  readonly roleDivisionVisibilityAvailable: false;
  readonly availabilityStatusAvailable: false;
  readonly draftPickValidationAvailable: false;
  readonly rosterSlotCompatibilityAvailable: false;
  readonly draftExecutionAvailable: false;
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
  readonly wrestlerDataCreated: false;
  readonly wrestlerIdentityRecordsCreated: false;
  readonly eligibleTalentPoolsCreated: false;
  readonly talentPoolsCreated: false;
  readonly draftBoardsCreated: false;
  readonly draftOrderingGenerated: false;
  readonly draftPicksCreated: false;
  readonly draftPickValidationExecuted: false;
  readonly rostersCreated: false;
  readonly championshipsCreated: false;
  readonly divisionsCreated: false;
  readonly matchesCreated: false;
  readonly showsCreated: false;
  readonly weeksCreated: false;
  readonly draftLogicExecuted: false;
  readonly rosterAssignmentExecuted: false;
  readonly championshipAssignmentExecuted: false;
  readonly divisionAssignmentExecuted: false;
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
  readonly blockedReasons: readonly NewGMModeDraftBoardPrerequisiteBlockedReason[];
}

const DRAFT_BOARD_PREREQUISITES: readonly NewGMModeDraftBoardPrerequisite[] =
  Object.freeze([
    createDraftBoardPrerequisite(
      "setup-readiness-handoff-prerequisite",
      "Setup readiness handoff prerequisite",
      "setup-readiness-handoff-required"
    ),
    createDraftBoardPrerequisite(
      "draft-prerequisite-contract-prerequisite",
      "Draft prerequisite contract prerequisite",
      "draft-prerequisite-contract-required"
    ),
    createDraftBoardPrerequisite(
      "talent-pool-prerequisite-contract-prerequisite",
      "Talent pool prerequisite contract prerequisite",
      "talent-pool-prerequisite-contract-required"
    ),
    createDraftBoardPrerequisite(
      "eligible-talent-pool-prerequisite",
      "Eligible talent pool prerequisite",
      "eligible-talent-pool-not-implemented"
    ),
    createDraftBoardPrerequisite(
      "draft-board-ordering-prerequisite",
      "Draft board ordering prerequisite",
      "draft-ordering-not-implemented"
    ),
    createDraftBoardPrerequisite(
      "wrestler-display-identity-prerequisite",
      "Wrestler display identity prerequisite",
      "wrestler-display-identity-not-implemented"
    ),
    createDraftBoardPrerequisite(
      "brand-eligibility-visibility-prerequisite",
      "Brand eligibility visibility prerequisite",
      "brand-eligibility-visibility-not-implemented"
    ),
    createDraftBoardPrerequisite(
      "role-division-visibility-prerequisite",
      "Role and division visibility prerequisite",
      "role-division-visibility-not-implemented"
    ),
    createDraftBoardPrerequisite(
      "availability-status-prerequisite",
      "Availability status prerequisite",
      "availability-status-not-implemented"
    ),
    createDraftBoardPrerequisite(
      "draft-pick-validation-prerequisite",
      "Future draft pick validation prerequisite",
      "draft-pick-validation-not-implemented"
    ),
    createDraftBoardPrerequisite(
      "roster-slot-compatibility-prerequisite",
      "Future roster-slot compatibility prerequisite",
      "roster-slot-compatibility-not-implemented"
    ),
    createDraftBoardPrerequisite(
      "draft-board-state-persistence-payload-prerequisite",
      "Future persistence payload prerequisite for saved draft board state",
      "gameplay-payload-persistence-not-implemented"
    )
  ]);

const BLOCKED_REASONS: readonly NewGMModeDraftBoardPrerequisiteBlockedReason[] =
  Object.freeze([
    "draft-board-prerequisite-contract-only",
    "setup-readiness-handoff-required",
    "draft-prerequisite-contract-required",
    "talent-pool-prerequisite-contract-required",
    "eligible-talent-pool-not-implemented",
    "draft-board-creation-not-implemented",
    "draft-ordering-not-implemented",
    "wrestler-data-loading-not-implemented",
    "wrestler-display-identity-not-implemented",
    "brand-eligibility-visibility-not-implemented",
    "role-division-visibility-not-implemented",
    "availability-status-not-implemented",
    "draft-pick-validation-not-implemented",
    "roster-slot-compatibility-not-implemented",
    "gameplay-payload-persistence-not-implemented",
    "draft-execution-not-implemented",
    "roster-assignment-not-implemented",
    "championship-assignment-not-implemented",
    "division-assignment-not-implemented",
    "week-one-unlock-not-implemented",
    "gameplay-start-not-implemented",
    "ui-wiring-not-implemented"
  ]);

export function createNewGMModeDraftBoardPrerequisiteContractShell(): NewGMModeDraftBoardPrerequisiteContractShell {
  return Object.freeze({
    status: "diagnostics-only",
    draftBoardPrerequisiteContractId:
      "new-gm-mode-draft-board-prerequisite-contract-v0.1",
    deterministicOrdering: true,
    draftBoardPrerequisites: DRAFT_BOARD_PREREQUISITES,
    draftBoardPrerequisiteSummary: Object.freeze({
      prerequisiteCount: DRAFT_BOARD_PREREQUISITES.length,
      requiredBeforeDraftExecution: true,
      contractOnly: true,
      draftBoardCreationReady: false,
      draftPickValidationReady: false,
      draftExecutionReady: false
    }),
    setupContractAvailable: true,
    setupOptionsCatalogAvailable: true,
    setupSelectionValidatorAvailable: true,
    setupReadinessHandoffAvailable:
      typeof createNewGMModeSetupReadinessHandoffShell === "function",
    draftPrerequisiteContractAvailable:
      typeof createNewGMModeDraftPrerequisiteContractShell === "function",
    talentPoolPrerequisiteContractAvailable:
      typeof createNewGMModeTalentPoolPrerequisiteContractShell === "function",
    draftBoardPrerequisiteContractAvailable: true,
    draftBoardCreationAvailable: false,
    wrestlerDataLoadingAvailable: false,
    eligibleTalentPoolCreationAvailable: false,
    draftOrderingAvailable: false,
    wrestlerDisplayIdentityAvailable: false,
    brandEligibilityVisibilityAvailable: false,
    roleDivisionVisibilityAvailable: false,
    availabilityStatusAvailable: false,
    draftPickValidationAvailable: false,
    rosterSlotCompatibilityAvailable: false,
    draftExecutionAvailable: false,
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
    wrestlerDataCreated: false,
    wrestlerIdentityRecordsCreated: false,
    eligibleTalentPoolsCreated: false,
    talentPoolsCreated: false,
    draftBoardsCreated: false,
    draftOrderingGenerated: false,
    draftPicksCreated: false,
    draftPickValidationExecuted: false,
    rostersCreated: false,
    championshipsCreated: false,
    divisionsCreated: false,
    matchesCreated: false,
    showsCreated: false,
    weeksCreated: false,
    draftLogicExecuted: false,
    rosterAssignmentExecuted: false,
    championshipAssignmentExecuted: false,
    divisionAssignmentExecuted: false,
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

function createDraftBoardPrerequisite(
  id: NewGMModeDraftBoardPrerequisiteId,
  label: string,
  blockedReason: NewGMModeDraftBoardPrerequisiteBlockedReason
): NewGMModeDraftBoardPrerequisite {
  return Object.freeze({
    id,
    label,
    blockedReason
  });
}
