import { createNewGMModeDraftBoardPrerequisiteContractShell } from "./newGMModeDraftBoardPrerequisiteContractShell.ts";
import { createNewGMModeDraftPrerequisiteContractShell } from "./newGMModeDraftPrerequisiteContractShell.ts";
import { createNewGMModeRosterSlotRequirementContractShell } from "./newGMModeRosterSlotRequirementContractShell.ts";
import { createNewGMModeSetupReadinessHandoffShell } from "./newGMModeSetupReadinessHandoffShell.ts";
import { createNewGMModeTalentPoolPrerequisiteContractShell } from "./newGMModeTalentPoolPrerequisiteContractShell.ts";

export type NewGMModeChampionshipDivisionRequirementId =
  | "setup-readiness-handoff-prerequisite"
  | "draft-prerequisite-contract-prerequisite"
  | "talent-pool-prerequisite-contract-prerequisite"
  | "draft-board-prerequisite-contract-prerequisite"
  | "roster-slot-requirement-contract-prerequisite"
  | "selected-brand-context-prerequisite"
  | "mens-world-title-division-requirement"
  | "womens-title-division-requirement"
  | "tag-team-title-division-requirement"
  | "optional-midcard-title-division-requirement"
  | "champion-assignment-prerequisite"
  | "contender-pool-prerequisite"
  | "division-eligibility-tagging-prerequisite"
  | "roster-slot-compatibility-prerequisite"
  | "draft-pick-validation-prerequisite"
  | "championship-division-state-persistence-payload-prerequisite";

export type NewGMModeChampionshipDivisionRequirementBlockedReason =
  | "championship-division-requirement-contract-only"
  | "setup-readiness-handoff-required"
  | "draft-prerequisite-contract-required"
  | "talent-pool-prerequisite-contract-required"
  | "draft-board-prerequisite-contract-required"
  | "roster-slot-requirement-contract-required"
  | "selected-brand-context-required"
  | "mens-world-title-division-not-implemented"
  | "womens-title-division-not-implemented"
  | "tag-team-title-division-not-implemented"
  | "midcard-title-division-not-implemented"
  | "championship-creation-not-implemented"
  | "division-creation-not-implemented"
  | "champion-assignment-not-implemented"
  | "contender-pool-creation-not-implemented"
  | "division-eligibility-tagging-not-implemented"
  | "roster-slot-compatibility-not-implemented"
  | "draft-pick-validation-not-implemented"
  | "gameplay-payload-persistence-not-implemented"
  | "wrestler-assignment-not-implemented"
  | "draft-execution-not-implemented"
  | "week-one-unlock-not-implemented"
  | "gameplay-start-not-implemented"
  | "ui-wiring-not-implemented";

export interface NewGMModeChampionshipDivisionRequirement {
  readonly id: NewGMModeChampionshipDivisionRequirementId;
  readonly label: string;
  readonly blockedReason: NewGMModeChampionshipDivisionRequirementBlockedReason;
}

export interface NewGMModeChampionshipDivisionRequirementContractShell {
  readonly status: "diagnostics-only";
  readonly championshipDivisionRequirementContractId: "new-gm-mode-championship-division-requirement-contract-v0.1";
  readonly deterministicOrdering: true;
  readonly championshipDivisionRequirements: readonly NewGMModeChampionshipDivisionRequirement[];
  readonly championshipDivisionRequirementSummary: {
    readonly requirementCount: number;
    readonly requiredBeforeDraftCompletion: true;
    readonly requiredBeforeWeekOne: true;
    readonly contractOnly: true;
    readonly championshipCreationReady: false;
    readonly divisionCreationReady: false;
    readonly championAssignmentReady: false;
    readonly weekOneUnlockReady: false;
  };
  readonly setupReadinessHandoffAvailable: true;
  readonly draftPrerequisiteContractAvailable: true;
  readonly talentPoolPrerequisiteContractAvailable: true;
  readonly draftBoardPrerequisiteContractAvailable: true;
  readonly rosterSlotRequirementContractAvailable: true;
  readonly championshipDivisionRequirementContractAvailable: true;
  readonly championshipCreationAvailable: false;
  readonly championAssignmentAvailable: false;
  readonly championshipAssignmentAvailable: false;
  readonly divisionCreationAvailable: false;
  readonly divisionAssignmentAvailable: false;
  readonly contenderPoolCreationAvailable: false;
  readonly wrestlerAssignmentAvailable: false;
  readonly draftPickValidationAvailable: false;
  readonly draftExecutionAvailable: false;
  readonly weekOneUnlockAvailable: false;
  readonly gameplayStartAvailable: false;
  readonly gameplayPayloadPersistenceAvailable: false;
  readonly uiWiringAvailable: false;
  readonly selectedBrandContextAvailable: false;
  readonly mensWorldTitleDivisionAvailable: false;
  readonly womensTitleDivisionAvailable: false;
  readonly tagTeamTitleDivisionAvailable: false;
  readonly optionalMidcardTitleDivisionAvailable: false;
  readonly contenderPoolAvailable: false;
  readonly divisionEligibilityTaggingAvailable: false;
  readonly rosterSlotCompatibilityAvailable: false;
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
  readonly wrestlerAssignmentsCreated: false;
  readonly championshipsCreated: false;
  readonly divisionsCreated: false;
  readonly championsCreated: false;
  readonly championAssignmentsCreated: false;
  readonly contenderPoolsCreated: false;
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
  readonly blockedReasons: readonly NewGMModeChampionshipDivisionRequirementBlockedReason[];
}

const CHAMPIONSHIP_DIVISION_REQUIREMENTS: readonly NewGMModeChampionshipDivisionRequirement[] =
  Object.freeze([
    createChampionshipDivisionRequirement(
      "setup-readiness-handoff-prerequisite",
      "Setup readiness handoff prerequisite",
      "setup-readiness-handoff-required"
    ),
    createChampionshipDivisionRequirement(
      "draft-prerequisite-contract-prerequisite",
      "Draft prerequisite contract prerequisite",
      "draft-prerequisite-contract-required"
    ),
    createChampionshipDivisionRequirement(
      "talent-pool-prerequisite-contract-prerequisite",
      "Talent pool prerequisite contract prerequisite",
      "talent-pool-prerequisite-contract-required"
    ),
    createChampionshipDivisionRequirement(
      "draft-board-prerequisite-contract-prerequisite",
      "Draft board prerequisite contract prerequisite",
      "draft-board-prerequisite-contract-required"
    ),
    createChampionshipDivisionRequirement(
      "roster-slot-requirement-contract-prerequisite",
      "Roster slot requirement contract prerequisite",
      "roster-slot-requirement-contract-required"
    ),
    createChampionshipDivisionRequirement(
      "selected-brand-context-prerequisite",
      "Selected brand context prerequisite",
      "selected-brand-context-required"
    ),
    createChampionshipDivisionRequirement(
      "mens-world-title-division-requirement",
      "Men's world title division requirement",
      "mens-world-title-division-not-implemented"
    ),
    createChampionshipDivisionRequirement(
      "womens-title-division-requirement",
      "Women's title division requirement",
      "womens-title-division-not-implemented"
    ),
    createChampionshipDivisionRequirement(
      "tag-team-title-division-requirement",
      "Tag team title division requirement",
      "tag-team-title-division-not-implemented"
    ),
    createChampionshipDivisionRequirement(
      "optional-midcard-title-division-requirement",
      "Optional midcard title division requirement",
      "midcard-title-division-not-implemented"
    ),
    createChampionshipDivisionRequirement(
      "champion-assignment-prerequisite",
      "Champion assignment prerequisite",
      "champion-assignment-not-implemented"
    ),
    createChampionshipDivisionRequirement(
      "contender-pool-prerequisite",
      "Contender pool prerequisite",
      "contender-pool-creation-not-implemented"
    ),
    createChampionshipDivisionRequirement(
      "division-eligibility-tagging-prerequisite",
      "Division eligibility and tagging prerequisite",
      "division-eligibility-tagging-not-implemented"
    ),
    createChampionshipDivisionRequirement(
      "roster-slot-compatibility-prerequisite",
      "Roster-slot compatibility prerequisite",
      "roster-slot-compatibility-not-implemented"
    ),
    createChampionshipDivisionRequirement(
      "draft-pick-validation-prerequisite",
      "Future draft pick validation prerequisite",
      "draft-pick-validation-not-implemented"
    ),
    createChampionshipDivisionRequirement(
      "championship-division-state-persistence-payload-prerequisite",
      "Future persistence payload prerequisite for saved championship and division state",
      "gameplay-payload-persistence-not-implemented"
    )
  ]);

const BLOCKED_REASONS: readonly NewGMModeChampionshipDivisionRequirementBlockedReason[] =
  Object.freeze([
    "championship-division-requirement-contract-only",
    "setup-readiness-handoff-required",
    "draft-prerequisite-contract-required",
    "talent-pool-prerequisite-contract-required",
    "draft-board-prerequisite-contract-required",
    "roster-slot-requirement-contract-required",
    "selected-brand-context-required",
    "mens-world-title-division-not-implemented",
    "womens-title-division-not-implemented",
    "tag-team-title-division-not-implemented",
    "midcard-title-division-not-implemented",
    "championship-creation-not-implemented",
    "division-creation-not-implemented",
    "champion-assignment-not-implemented",
    "contender-pool-creation-not-implemented",
    "division-eligibility-tagging-not-implemented",
    "roster-slot-compatibility-not-implemented",
    "draft-pick-validation-not-implemented",
    "gameplay-payload-persistence-not-implemented",
    "wrestler-assignment-not-implemented",
    "draft-execution-not-implemented",
    "week-one-unlock-not-implemented",
    "gameplay-start-not-implemented",
    "ui-wiring-not-implemented"
  ]);

export function createNewGMModeChampionshipDivisionRequirementContractShell(): NewGMModeChampionshipDivisionRequirementContractShell {
  return Object.freeze({
    status: "diagnostics-only",
    championshipDivisionRequirementContractId:
      "new-gm-mode-championship-division-requirement-contract-v0.1",
    deterministicOrdering: true,
    championshipDivisionRequirements: CHAMPIONSHIP_DIVISION_REQUIREMENTS,
    championshipDivisionRequirementSummary: Object.freeze({
      requirementCount: CHAMPIONSHIP_DIVISION_REQUIREMENTS.length,
      requiredBeforeDraftCompletion: true,
      requiredBeforeWeekOne: true,
      contractOnly: true,
      championshipCreationReady: false,
      divisionCreationReady: false,
      championAssignmentReady: false,
      weekOneUnlockReady: false
    }),
    setupReadinessHandoffAvailable:
      typeof createNewGMModeSetupReadinessHandoffShell === "function",
    draftPrerequisiteContractAvailable:
      typeof createNewGMModeDraftPrerequisiteContractShell === "function",
    talentPoolPrerequisiteContractAvailable:
      typeof createNewGMModeTalentPoolPrerequisiteContractShell === "function",
    draftBoardPrerequisiteContractAvailable:
      typeof createNewGMModeDraftBoardPrerequisiteContractShell === "function",
    rosterSlotRequirementContractAvailable:
      typeof createNewGMModeRosterSlotRequirementContractShell === "function",
    championshipDivisionRequirementContractAvailable: true,
    championshipCreationAvailable: false,
    championAssignmentAvailable: false,
    championshipAssignmentAvailable: false,
    divisionCreationAvailable: false,
    divisionAssignmentAvailable: false,
    contenderPoolCreationAvailable: false,
    wrestlerAssignmentAvailable: false,
    draftPickValidationAvailable: false,
    draftExecutionAvailable: false,
    weekOneUnlockAvailable: false,
    gameplayStartAvailable: false,
    gameplayPayloadPersistenceAvailable: false,
    uiWiringAvailable: false,
    selectedBrandContextAvailable: false,
    mensWorldTitleDivisionAvailable: false,
    womensTitleDivisionAvailable: false,
    tagTeamTitleDivisionAvailable: false,
    optionalMidcardTitleDivisionAvailable: false,
    contenderPoolAvailable: false,
    divisionEligibilityTaggingAvailable: false,
    rosterSlotCompatibilityAvailable: false,
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
    wrestlerAssignmentsCreated: false,
    championshipsCreated: false,
    divisionsCreated: false,
    championsCreated: false,
    championAssignmentsCreated: false,
    contenderPoolsCreated: false,
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

function createChampionshipDivisionRequirement(
  id: NewGMModeChampionshipDivisionRequirementId,
  label: string,
  blockedReason: NewGMModeChampionshipDivisionRequirementBlockedReason
): NewGMModeChampionshipDivisionRequirement {
  return Object.freeze({
    id,
    label,
    blockedReason
  });
}
