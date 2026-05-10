import {
  createNewGMModeSetupContractShell
} from "./newGMModeSetupContractShell.ts";

export type NewGMModeSetupOptionAvailability =
  | "available-contract-option"
  | "blocked-until-implementation"
  | "planned-not-implemented";

export type NewGMModeSetupOptionsCatalogBlockedReason =
  | "catalog-options-only"
  | "gameplay-start-not-implemented"
  | "draft-execution-not-implemented"
  | "roster-assignment-not-implemented"
  | "title-assignment-not-implemented"
  | "weekly-loop-not-implemented"
  | "gameplay-payload-persistence-not-implemented"
  | "ui-wiring-not-implemented";

export interface NewGMModeSetupCatalogOption {
  readonly id: string;
  readonly label: string;
  readonly availability: NewGMModeSetupOptionAvailability;
  readonly blockedReason?: NewGMModeSetupOptionsCatalogBlockedReason;
}

export interface NewGMModeSetupOptionsCatalogShell {
  readonly status: "diagnostics-only";
  readonly catalogId: "new-gm-mode-setup-options-catalog-v0.1";
  readonly setupContractAvailable: true;
  readonly setupOptionsCatalogAvailable: true;
  readonly deterministicOrdering: true;
  readonly promotionsBrands: readonly NewGMModeSetupCatalogOption[];
  readonly managerIdentityTypes: readonly NewGMModeSetupCatalogOption[];
  readonly difficultyModes: readonly NewGMModeSetupCatalogOption[];
  readonly draftModes: readonly NewGMModeSetupCatalogOption[];
  readonly startingCalendarWeekOptions: readonly NewGMModeSetupCatalogOption[];
  readonly gameplayStartAvailable: false;
  readonly draftExecutionAvailable: false;
  readonly rosterAssignmentAvailable: false;
  readonly titleAssignmentAvailable: false;
  readonly weeklyLoopAvailable: false;
  readonly uiWiringAvailable: false;
  readonly gameplayPayloadPersistenceAvailable: false;
  readonly saveCreated: false;
  readonly sqliteWritten: false;
  readonly sqliteDatabaseOpened: false;
  readonly rostersCreated: false;
  readonly championshipsCreated: false;
  readonly divisionsCreated: false;
  readonly matchesCreated: false;
  readonly showsCreated: false;
  readonly weeksCreated: false;
  readonly draftLogicExecuted: false;
  readonly matchSimulationExecuted: false;
  readonly showBookingCreated: false;
  readonly businessSystemsRun: false;
  readonly fanSocialOutputCreated: false;
  readonly generatedTextCreated: false;
  readonly genAIUsed: false;
  readonly gameplayAffecting: false;
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly blockedReasons: readonly NewGMModeSetupOptionsCatalogBlockedReason[];
}

const PROMOTIONS_BRANDS: readonly NewGMModeSetupCatalogOption[] = Object.freeze([
  createOption("wwe-raw", "WWE Raw", "available-contract-option"),
  createOption("wwe-smackdown", "WWE SmackDown", "available-contract-option"),
  createOption("wwe-nxt", "WWE NXT", "available-contract-option"),
  createOption("aew-dynamite", "AEW Dynamite", "available-contract-option"),
  createOption("aew-collision", "AEW Collision", "available-contract-option")
]);

const MANAGER_IDENTITY_TYPES: readonly NewGMModeSetupCatalogOption[] =
  Object.freeze([
    createOption("custom-gm", "Custom GM", "available-contract-option"),
    createOption(
      "existing-authority-figure",
      "Existing Authority Figure",
      "available-contract-option"
    ),
    createOption(
      "anonymous-owner-representative",
      "Anonymous/Owner Representative",
      "available-contract-option"
    )
  ]);

const DIFFICULTY_MODES: readonly NewGMModeSetupCatalogOption[] = Object.freeze([
  createOption("easy", "Easy", "available-contract-option"),
  createOption("normal", "Normal", "available-contract-option"),
  createOption("hard", "Hard", "available-contract-option"),
  createOption("legend", "Legend", "available-contract-option")
]);

const DRAFT_MODES: readonly NewGMModeSetupCatalogOption[] = Object.freeze([
  createOption(
    "draft-required-before-week-1",
    "Draft required before Week 1",
    "blocked-until-implementation",
    "draft-execution-not-implemented"
  ),
  createOption(
    "manual-draft-planned-not-implemented",
    "Manual draft planned but not implemented",
    "planned-not-implemented",
    "draft-execution-not-implemented"
  ),
  createOption(
    "ai-assisted-draft-planned-not-implemented",
    "AI-assisted draft planned but not implemented",
    "planned-not-implemented",
    "draft-execution-not-implemented"
  )
]);

const STARTING_CALENDAR_WEEK_OPTIONS: readonly NewGMModeSetupCatalogOption[] =
  Object.freeze([
    createOption(
      "week-0-setup-phase",
      "Week 0 setup phase",
      "available-contract-option"
    ),
    createOption(
      "week-1-locked-until-draft-completion",
      "Week 1 locked until draft completion",
      "blocked-until-implementation",
      "weekly-loop-not-implemented"
    )
  ]);

const BLOCKED_REASONS: readonly NewGMModeSetupOptionsCatalogBlockedReason[] =
  Object.freeze([
    "catalog-options-only",
    "gameplay-start-not-implemented",
    "draft-execution-not-implemented",
    "roster-assignment-not-implemented",
    "title-assignment-not-implemented",
    "weekly-loop-not-implemented",
    "gameplay-payload-persistence-not-implemented",
    "ui-wiring-not-implemented"
  ]);

export function createNewGMModeSetupOptionsCatalogShell(): NewGMModeSetupOptionsCatalogShell {
  return Object.freeze({
    status: "diagnostics-only",
    catalogId: "new-gm-mode-setup-options-catalog-v0.1",
    setupContractAvailable:
      typeof createNewGMModeSetupContractShell === "function",
    setupOptionsCatalogAvailable: true,
    deterministicOrdering: true,
    promotionsBrands: PROMOTIONS_BRANDS,
    managerIdentityTypes: MANAGER_IDENTITY_TYPES,
    difficultyModes: DIFFICULTY_MODES,
    draftModes: DRAFT_MODES,
    startingCalendarWeekOptions: STARTING_CALENDAR_WEEK_OPTIONS,
    gameplayStartAvailable: false,
    draftExecutionAvailable: false,
    rosterAssignmentAvailable: false,
    titleAssignmentAvailable: false,
    weeklyLoopAvailable: false,
    uiWiringAvailable: false,
    gameplayPayloadPersistenceAvailable: false,
    saveCreated: false,
    sqliteWritten: false,
    sqliteDatabaseOpened: false,
    rostersCreated: false,
    championshipsCreated: false,
    divisionsCreated: false,
    matchesCreated: false,
    showsCreated: false,
    weeksCreated: false,
    draftLogicExecuted: false,
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

function createOption(
  id: string,
  label: string,
  availability: NewGMModeSetupOptionAvailability,
  blockedReason?: NewGMModeSetupOptionsCatalogBlockedReason
): NewGMModeSetupCatalogOption {
  return Object.freeze({
    id,
    label,
    availability,
    ...(blockedReason ? { blockedReason } : {})
  });
}
