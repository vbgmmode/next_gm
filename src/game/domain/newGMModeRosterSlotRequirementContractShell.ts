import { createNewGMModeDraftBoardPrerequisiteContractShell } from "./newGMModeDraftBoardPrerequisiteContractShell.ts";
import { createNewGMModeDraftPrerequisiteContractShell } from "./newGMModeDraftPrerequisiteContractShell.ts";
import { createNewGMModeSetupReadinessHandoffShell } from "./newGMModeSetupReadinessHandoffShell.ts";
import { createNewGMModeTalentPoolPrerequisiteContractShell } from "./newGMModeTalentPoolPrerequisiteContractShell.ts";

export type NewGMModeRosterSlotRequirementId =
  | "setup-readiness-handoff-prerequisite"
  | "draft-prerequisite-contract-prerequisite"
  | "talent-pool-prerequisite-contract-prerequisite"
  | "draft-board-prerequisite-contract-prerequisite"
  | "selected-brand-context-prerequisite"
  | "minimum-total-roster-size-requirement"
  | "maximum-total-roster-size-guideline"
  | "mens-division-roster-slot-requirement"
  | "womens-division-roster-slot-requirement"
  | "tag-team-division-roster-slot-requirement"
  | "main-event-top-contender-depth-requirement"
  | "championship-division-compatibility-prerequisite"
  | "draft-pick-validation-prerequisite"
  | "roster-state-persistence-payload-prerequisite";

export type NewGMModeRosterSlotRequirementBlockedReason =
  | "roster-slot-requirement-contract-only"
  | "setup-readiness-handoff-required"
  | "draft-prerequisite-contract-required"
  | "talent-pool-prerequisite-contract-required"
  | "draft-board-prerequisite-contract-required"
  | "selected-brand-context-required"
  | "minimum-roster-size-not-implemented"
  | "maximum-roster-size-guideline-not-implemented"
  | "mens-division-slots-not-implemented"
  | "womens-division-slots-not-implemented"
  | "tag-team-division-slots-not-implemented"
  | "main-event-depth-not-implemented"
  | "championship-division-compatibility-not-implemented"
  | "draft-pick-validation-not-implemented"
  | "gameplay-payload-persistence-not-implemented"
  | "roster-creation-not-implemented"
  | "wrestler-assignment-not-implemented"
  | "draft-execution-not-implemented"
  | "championship-assignment-not-implemented"
  | "division-assignment-not-implemented"
  | "week-one-unlock-not-implemented"
  | "gameplay-start-not-implemented"
  | "ui-wiring-not-implemented";

export interface NewGMModeRosterSlotRequirement {
  readonly id: NewGMModeRosterSlotRequirementId;
  readonly label: string;
  readonly blockedReason: NewGMModeRosterSlotRequirementBlockedReason;
}

export interface NewGMModeRosterSlotRequirementContractShell {
  readonly status: "diagnostics-only";
  readonly rosterSlotRequirementContractId: "new-gm-mode-roster-slot-requirement-contract-v0.1";
  readonly deterministicOrdering: true;
  readonly rosterSlotRequirements: readonly NewGMModeRosterSlotRequirement[];
  readonly rosterSlotRequirementSummary: {
    readonly requirementCount: number;
    readonly requiredBeforeDraftCompletion: true;
    readonly requiredBeforeWeekOne: true;
    readonly contractOnly: true;
    readonly rosterCreationReady: false;
    readonly draftPickValidationReady: false;
    readonly weekOneUnlockReady: false;
  };
  readonly setupReadinessHandoffAvailable: true;
  readonly draftPrerequisiteContractAvailable: true;
  readonly talentPoolPrerequisiteContractAvailable: true;
  readonly draftBoardPrerequisiteContractAvailable: true;
  readonly rosterSlotRequirementContractAvailable: true;
  readonly rosterCreationAvailable: false;
  readonly wrestlerAssignmentAvailable: false;
  readonly draftPickValidationAvailable: false;
  readonly draftExecutionAvailable: false;
  readonly championshipAssignmentAvailable: false;
  readonly divisionAssignmentAvailable: false;
  readonly weekOneUnlockAvailable: false;
  readonly gameplayStartAvailable: false;
  readonly gameplayPayloadPersistenceAvailable: false;
  readonly uiWiringAvailable: false;
  readonly selectedBrandContextAvailable: false;
  readonly minimumTotalRosterSizeAvailable: false;
  readonly maximumTotalRosterSizeGuidelineAvailable: false;
  readonly mensDivisionRosterSlotsAvailable: false;
  readonly womensDivisionRosterSlotsAvailable: false;
  readonly tagTeamDivisionRosterSlotsAvailable: false;
  readonly mainEventTopContenderDepthAvailable: false;
  readonly championshipDivisionCompatibilityAvailable: false;
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
  readonly blockedReasons: readonly NewGMModeRosterSlotRequirementBlockedReason[];
}

const ROSTER_SLOT_REQUIREMENTS: readonly NewGMModeRosterSlotRequirement[] =
  Object.freeze([
    createRosterSlotRequirement(
      "setup-readiness-handoff-prerequisite",
      "Setup readiness handoff prerequisite",
      "setup-readiness-handoff-required"
    ),
    createRosterSlotRequirement(
      "draft-prerequisite-contract-prerequisite",
      "Draft prerequisite contract prerequisite",
      "draft-prerequisite-contract-required"
    ),
    createRosterSlotRequirement(
      "talent-pool-prerequisite-contract-prerequisite",
      "Talent pool prerequisite contract prerequisite",
      "talent-pool-prerequisite-contract-required"
    ),
    createRosterSlotRequirement(
      "draft-board-prerequisite-contract-prerequisite",
      "Draft board prerequisite contract prerequisite",
      "draft-board-prerequisite-contract-required"
    ),
    createRosterSlotRequirement(
      "selected-brand-context-prerequisite",
      "Selected brand context prerequisite",
      "selected-brand-context-required"
    ),
    createRosterSlotRequirement(
      "minimum-total-roster-size-requirement",
      "Minimum total roster size requirement",
      "minimum-roster-size-not-implemented"
    ),
    createRosterSlotRequirement(
      "maximum-total-roster-size-guideline",
      "Maximum total roster size guideline",
      "maximum-roster-size-guideline-not-implemented"
    ),
    createRosterSlotRequirement(
      "mens-division-roster-slot-requirement",
      "Men's division roster slot requirement",
      "mens-division-slots-not-implemented"
    ),
    createRosterSlotRequirement(
      "womens-division-roster-slot-requirement",
      "Women's division roster slot requirement",
      "womens-division-slots-not-implemented"
    ),
    createRosterSlotRequirement(
      "tag-team-division-roster-slot-requirement",
      "Tag team division roster slot requirement",
      "tag-team-division-slots-not-implemented"
    ),
    createRosterSlotRequirement(
      "main-event-top-contender-depth-requirement",
      "Main event and top contender depth requirement",
      "main-event-depth-not-implemented"
    ),
    createRosterSlotRequirement(
      "championship-division-compatibility-prerequisite",
      "Future championship and division compatibility prerequisite",
      "championship-division-compatibility-not-implemented"
    ),
    createRosterSlotRequirement(
      "draft-pick-validation-prerequisite",
      "Future draft pick validation prerequisite",
      "draft-pick-validation-not-implemented"
    ),
    createRosterSlotRequirement(
      "roster-state-persistence-payload-prerequisite",
      "Future persistence payload prerequisite for saved roster state",
      "gameplay-payload-persistence-not-implemented"
    )
  ]);

const BLOCKED_REASONS: readonly NewGMModeRosterSlotRequirementBlockedReason[] =
  Object.freeze([
    "roster-slot-requirement-contract-only",
    "setup-readiness-handoff-required",
    "draft-prerequisite-contract-required",
    "talent-pool-prerequisite-contract-required",
    "draft-board-prerequisite-contract-required",
    "selected-brand-context-required",
    "minimum-roster-size-not-implemented",
    "maximum-roster-size-guideline-not-implemented",
    "mens-division-slots-not-implemented",
    "womens-division-slots-not-implemented",
    "tag-team-division-slots-not-implemented",
    "main-event-depth-not-implemented",
    "championship-division-compatibility-not-implemented",
    "draft-pick-validation-not-implemented",
    "gameplay-payload-persistence-not-implemented",
    "roster-creation-not-implemented",
    "wrestler-assignment-not-implemented",
    "draft-execution-not-implemented",
    "championship-assignment-not-implemented",
    "division-assignment-not-implemented",
    "week-one-unlock-not-implemented",
    "gameplay-start-not-implemented",
    "ui-wiring-not-implemented"
  ]);

export function createNewGMModeRosterSlotRequirementContractShell(): NewGMModeRosterSlotRequirementContractShell {
  return Object.freeze({
    status: "diagnostics-only",
    rosterSlotRequirementContractId:
      "new-gm-mode-roster-slot-requirement-contract-v0.1",
    deterministicOrdering: true,
    rosterSlotRequirements: ROSTER_SLOT_REQUIREMENTS,
    rosterSlotRequirementSummary: Object.freeze({
      requirementCount: ROSTER_SLOT_REQUIREMENTS.length,
      requiredBeforeDraftCompletion: true,
      requiredBeforeWeekOne: true,
      contractOnly: true,
      rosterCreationReady: false,
      draftPickValidationReady: false,
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
    rosterSlotRequirementContractAvailable: true,
    rosterCreationAvailable: false,
    wrestlerAssignmentAvailable: false,
    draftPickValidationAvailable: false,
    draftExecutionAvailable: false,
    championshipAssignmentAvailable: false,
    divisionAssignmentAvailable: false,
    weekOneUnlockAvailable: false,
    gameplayStartAvailable: false,
    gameplayPayloadPersistenceAvailable: false,
    uiWiringAvailable: false,
    selectedBrandContextAvailable: false,
    minimumTotalRosterSizeAvailable: false,
    maximumTotalRosterSizeGuidelineAvailable: false,
    mensDivisionRosterSlotsAvailable: false,
    womensDivisionRosterSlotsAvailable: false,
    tagTeamDivisionRosterSlotsAvailable: false,
    mainEventTopContenderDepthAvailable: false,
    championshipDivisionCompatibilityAvailable: false,
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

function createRosterSlotRequirement(
  id: NewGMModeRosterSlotRequirementId,
  label: string,
  blockedReason: NewGMModeRosterSlotRequirementBlockedReason
): NewGMModeRosterSlotRequirement {
  return Object.freeze({
    id,
    label,
    blockedReason
  });
}
