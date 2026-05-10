import { createNewGMModeDraftPrerequisiteContractShell } from "./newGMModeDraftPrerequisiteContractShell.ts";
import { createNewGMModeSetupReadinessHandoffShell } from "./newGMModeSetupReadinessHandoffShell.ts";

export type NewGMModeTalentPoolPrerequisiteId =
  | "setup-readiness-handoff-prerequisite"
  | "draft-prerequisite-contract-prerequisite"
  | "selected-promotion-brand-context-prerequisite"
  | "eligible-wrestler-data-source-prerequisite"
  | "wrestler-identity-prerequisite"
  | "wrestler-availability-free-agent-eligibility-prerequisite"
  | "brand-eligibility-prerequisite"
  | "minimum-draftable-talent-count-prerequisite"
  | "division-eligibility-tagging-prerequisite"
  | "role-category-tagging-prerequisite"
  | "roster-slot-compatibility-prerequisite"
  | "draft-talent-state-persistence-payload-prerequisite";

export type NewGMModeTalentPoolPrerequisiteBlockedReason =
  | "talent-pool-prerequisite-contract-only"
  | "setup-readiness-handoff-required"
  | "draft-prerequisite-contract-required"
  | "promotion-brand-context-required"
  | "wrestler-data-source-not-implemented"
  | "wrestler-identity-records-not-implemented"
  | "free-agent-eligibility-not-implemented"
  | "brand-eligibility-not-implemented"
  | "minimum-draftable-talent-count-not-implemented"
  | "division-eligibility-tagging-not-implemented"
  | "role-category-tagging-not-implemented"
  | "roster-slot-compatibility-not-implemented"
  | "gameplay-payload-persistence-not-implemented"
  | "talent-pool-creation-not-implemented"
  | "draft-board-not-implemented"
  | "draft-execution-not-implemented"
  | "week-one-unlock-not-implemented"
  | "gameplay-start-not-implemented"
  | "ui-wiring-not-implemented";

export interface NewGMModeTalentPoolPrerequisite {
  readonly id: NewGMModeTalentPoolPrerequisiteId;
  readonly label: string;
  readonly blockedReason: NewGMModeTalentPoolPrerequisiteBlockedReason;
}

export interface NewGMModeTalentPoolPrerequisiteContractShell {
  readonly status: "diagnostics-only";
  readonly talentPoolPrerequisiteContractId: "new-gm-mode-talent-pool-prerequisite-contract-v0.1";
  readonly deterministicOrdering: true;
  readonly talentPoolPrerequisites: readonly NewGMModeTalentPoolPrerequisite[];
  readonly talentPoolPrerequisiteSummary: {
    readonly prerequisiteCount: number;
    readonly requiredBeforeDraftExecution: true;
    readonly contractOnly: true;
    readonly talentPoolCreationReady: false;
    readonly draftBoardReady: false;
    readonly draftExecutionReady: false;
  };
  readonly setupContractAvailable: true;
  readonly setupOptionsCatalogAvailable: true;
  readonly setupSelectionValidatorAvailable: true;
  readonly setupReadinessHandoffAvailable: true;
  readonly draftPrerequisiteContractAvailable: true;
  readonly talentPoolPrerequisiteContractAvailable: true;
  readonly talentPoolCreationAvailable: false;
  readonly wrestlerDataLoadingAvailable: false;
  readonly wrestlerIdentityRecordsAvailable: false;
  readonly freeAgentEligibilityAvailable: false;
  readonly brandEligibilityAvailable: false;
  readonly minimumDraftableTalentCountAvailable: false;
  readonly divisionEligibilityTaggingAvailable: false;
  readonly roleCategoryTaggingAvailable: false;
  readonly rosterSlotCompatibilityAvailable: false;
  readonly draftBoardAvailable: false;
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
  readonly talentPoolsCreated: false;
  readonly freeAgentPoolCreated: false;
  readonly draftBoardsCreated: false;
  readonly draftPicksCreated: false;
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
  readonly blockedReasons: readonly NewGMModeTalentPoolPrerequisiteBlockedReason[];
}

const TALENT_POOL_PREREQUISITES: readonly NewGMModeTalentPoolPrerequisite[] =
  Object.freeze([
    createTalentPoolPrerequisite(
      "setup-readiness-handoff-prerequisite",
      "Setup readiness handoff prerequisite",
      "setup-readiness-handoff-required"
    ),
    createTalentPoolPrerequisite(
      "draft-prerequisite-contract-prerequisite",
      "Draft prerequisite contract prerequisite",
      "draft-prerequisite-contract-required"
    ),
    createTalentPoolPrerequisite(
      "selected-promotion-brand-context-prerequisite",
      "Selected promotion or brand context prerequisite",
      "promotion-brand-context-required"
    ),
    createTalentPoolPrerequisite(
      "eligible-wrestler-data-source-prerequisite",
      "Eligible wrestler data source prerequisite",
      "wrestler-data-source-not-implemented"
    ),
    createTalentPoolPrerequisite(
      "wrestler-identity-prerequisite",
      "Wrestler identity prerequisite",
      "wrestler-identity-records-not-implemented"
    ),
    createTalentPoolPrerequisite(
      "wrestler-availability-free-agent-eligibility-prerequisite",
      "Wrestler availability and free-agent eligibility prerequisite",
      "free-agent-eligibility-not-implemented"
    ),
    createTalentPoolPrerequisite(
      "brand-eligibility-prerequisite",
      "Brand eligibility prerequisite",
      "brand-eligibility-not-implemented"
    ),
    createTalentPoolPrerequisite(
      "minimum-draftable-talent-count-prerequisite",
      "Minimum draftable talent count prerequisite",
      "minimum-draftable-talent-count-not-implemented"
    ),
    createTalentPoolPrerequisite(
      "division-eligibility-tagging-prerequisite",
      "Division eligibility tagging prerequisite",
      "division-eligibility-tagging-not-implemented"
    ),
    createTalentPoolPrerequisite(
      "role-category-tagging-prerequisite",
      "Role and category tagging prerequisite",
      "role-category-tagging-not-implemented"
    ),
    createTalentPoolPrerequisite(
      "roster-slot-compatibility-prerequisite",
      "Future roster-slot compatibility prerequisite",
      "roster-slot-compatibility-not-implemented"
    ),
    createTalentPoolPrerequisite(
      "draft-talent-state-persistence-payload-prerequisite",
      "Future persistence payload prerequisite for saved draft and talent state",
      "gameplay-payload-persistence-not-implemented"
    )
  ]);

const BLOCKED_REASONS: readonly NewGMModeTalentPoolPrerequisiteBlockedReason[] =
  Object.freeze([
    "talent-pool-prerequisite-contract-only",
    "setup-readiness-handoff-required",
    "draft-prerequisite-contract-required",
    "promotion-brand-context-required",
    "wrestler-data-source-not-implemented",
    "wrestler-identity-records-not-implemented",
    "free-agent-eligibility-not-implemented",
    "brand-eligibility-not-implemented",
    "minimum-draftable-talent-count-not-implemented",
    "division-eligibility-tagging-not-implemented",
    "role-category-tagging-not-implemented",
    "roster-slot-compatibility-not-implemented",
    "gameplay-payload-persistence-not-implemented",
    "talent-pool-creation-not-implemented",
    "draft-board-not-implemented",
    "draft-execution-not-implemented",
    "week-one-unlock-not-implemented",
    "gameplay-start-not-implemented",
    "ui-wiring-not-implemented"
  ]);

export function createNewGMModeTalentPoolPrerequisiteContractShell(): NewGMModeTalentPoolPrerequisiteContractShell {
  return Object.freeze({
    status: "diagnostics-only",
    talentPoolPrerequisiteContractId:
      "new-gm-mode-talent-pool-prerequisite-contract-v0.1",
    deterministicOrdering: true,
    talentPoolPrerequisites: TALENT_POOL_PREREQUISITES,
    talentPoolPrerequisiteSummary: Object.freeze({
      prerequisiteCount: TALENT_POOL_PREREQUISITES.length,
      requiredBeforeDraftExecution: true,
      contractOnly: true,
      talentPoolCreationReady: false,
      draftBoardReady: false,
      draftExecutionReady: false
    }),
    setupContractAvailable: true,
    setupOptionsCatalogAvailable: true,
    setupSelectionValidatorAvailable: true,
    setupReadinessHandoffAvailable:
      typeof createNewGMModeSetupReadinessHandoffShell === "function",
    draftPrerequisiteContractAvailable:
      typeof createNewGMModeDraftPrerequisiteContractShell === "function",
    talentPoolPrerequisiteContractAvailable: true,
    talentPoolCreationAvailable: false,
    wrestlerDataLoadingAvailable: false,
    wrestlerIdentityRecordsAvailable: false,
    freeAgentEligibilityAvailable: false,
    brandEligibilityAvailable: false,
    minimumDraftableTalentCountAvailable: false,
    divisionEligibilityTaggingAvailable: false,
    roleCategoryTaggingAvailable: false,
    rosterSlotCompatibilityAvailable: false,
    draftBoardAvailable: false,
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
    talentPoolsCreated: false,
    freeAgentPoolCreated: false,
    draftBoardsCreated: false,
    draftPicksCreated: false,
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

function createTalentPoolPrerequisite(
  id: NewGMModeTalentPoolPrerequisiteId,
  label: string,
  blockedReason: NewGMModeTalentPoolPrerequisiteBlockedReason
): NewGMModeTalentPoolPrerequisite {
  return Object.freeze({
    id,
    label,
    blockedReason
  });
}
