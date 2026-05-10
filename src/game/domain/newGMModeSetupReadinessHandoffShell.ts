import {
  type NewGMModeSetupRequiredInput,
  createNewGMModeSetupContractShell
} from "./newGMModeSetupContractShell.ts";
import { createNewGMModeSetupOptionsCatalogShell } from "./newGMModeSetupOptionsCatalogShell.ts";
import {
  type NewGMModeSetupSelectionInput,
  type NewGMModeSetupSelectionIssue,
  createNewGMModeSetupSelectionValidatorShell
} from "./newGMModeSetupSelectionValidatorShell.ts";

export type NewGMModeSetupReadinessHandoffStatus =
  | "blocked_missing_selection"
  | "blocked_invalid_selection"
  | "blocked_save_identity_prerequisite"
  | "blocked_draft_incomplete"
  | "structurally_ready_gameplay_start_unavailable";

export interface NewGMModeSetupReadinessHandoffShell {
  readonly status: "diagnostics-only";
  readonly handoffId: "new-gm-mode-setup-readiness-handoff-v0.1";
  readonly readinessPhase: NewGMModeSetupReadinessHandoffStatus;
  readonly setupContractSummary: {
    readonly setupContractId: "new-gm-mode-setup-contract-v0.1";
    readonly requiredFutureSetupInputs: readonly NewGMModeSetupRequiredInput[];
    readonly requiredInputCount: number;
    readonly gameplayStartAvailable: false;
  };
  readonly setupOptionsCatalogSummary: {
    readonly catalogId: "new-gm-mode-setup-options-catalog-v0.1";
    readonly setupOptionsCatalogAvailable: true;
    readonly promotionOrBrandOptionCount: number;
    readonly managerIdentityTypeOptionCount: number;
    readonly difficultyModeOptionCount: number;
    readonly draftModeOptionCount: number;
    readonly startingCalendarWeekOptionCount: number;
  };
  readonly selectionValidationSummary: {
    readonly validatorId: "new-gm-mode-setup-selection-validator-v0.1";
    readonly selectionValidity: "blocked" | "structurally-valid";
    readonly structurallyValidSelection: boolean;
    readonly validSelectionCount: number;
    readonly validationIssues: readonly NewGMModeSetupSelectionIssue[];
    readonly blockedReasons: readonly NewGMModeSetupSelectionIssue[];
  };
  readonly requiredInputsSummary: {
    readonly requiredSelectionCount: 6;
    readonly validSelectionCount: number;
    readonly missingOrInvalidSelectionCount: number;
  };
  readonly missingOrInvalidSelections: readonly NewGMModeSetupSelectionIssue[];
  readonly saveIdentityPrerequisiteStatus: "missing" | "satisfied" | "unsatisfied";
  readonly draftCompletionStatus: "complete" | "incomplete";
  readonly readinessIssues: readonly NewGMModeSetupSelectionIssue[];
  readonly blockedReasons: readonly NewGMModeSetupSelectionIssue[];
  readonly setupContractAvailable: true;
  readonly setupOptionsCatalogAvailable: true;
  readonly setupSelectionValidationAvailable: true;
  readonly setupReadinessHandoffAvailable: true;
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
  readonly gameplayStateCreated: false;
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
}

export function createNewGMModeSetupReadinessHandoffShell(
  selection: NewGMModeSetupSelectionInput
): NewGMModeSetupReadinessHandoffShell {
  const contract = createNewGMModeSetupContractShell();
  const catalog = createNewGMModeSetupOptionsCatalogShell();
  const validation = createNewGMModeSetupSelectionValidatorShell(selection);
  const missingOrInvalidSelections = collectMissingOrInvalidSelections(
    validation.validationIssues
  );
  const readinessIssues = collectReadinessIssues(validation.validationIssues);
  const readinessPhase = determineReadinessPhase(readinessIssues);

  return Object.freeze({
    status: "diagnostics-only",
    handoffId: "new-gm-mode-setup-readiness-handoff-v0.1",
    readinessPhase,
    setupContractSummary: Object.freeze({
      setupContractId: contract.setupContractId,
      requiredFutureSetupInputs: contract.requiredFutureSetupInputs,
      requiredInputCount: contract.setupReadinessSummary.requiredInputCount,
      gameplayStartAvailable: false
    }),
    setupOptionsCatalogSummary: Object.freeze({
      catalogId: catalog.catalogId,
      setupOptionsCatalogAvailable: true,
      promotionOrBrandOptionCount: catalog.promotionsBrands.length,
      managerIdentityTypeOptionCount: catalog.managerIdentityTypes.length,
      difficultyModeOptionCount: catalog.difficultyModes.length,
      draftModeOptionCount: catalog.draftModes.length,
      startingCalendarWeekOptionCount:
        catalog.startingCalendarWeekOptions.length
    }),
    selectionValidationSummary: Object.freeze({
      validatorId: validation.validatorId,
      selectionValidity: validation.selectionValidity,
      structurallyValidSelection:
        validation.setupReadinessSummary.structurallyValidSelection,
      validSelectionCount: validation.setupReadinessSummary.validSelectionCount,
      validationIssues: validation.validationIssues,
      blockedReasons: validation.blockedReasons
    }),
    requiredInputsSummary: Object.freeze({
      requiredSelectionCount: validation.setupReadinessSummary.requiredSelectionCount,
      validSelectionCount: validation.setupReadinessSummary.validSelectionCount,
      missingOrInvalidSelectionCount: missingOrInvalidSelections.length
    }),
    missingOrInvalidSelections,
    saveIdentityPrerequisiteStatus:
      getSaveIdentityPrerequisiteStatus(selection),
    draftCompletionStatus:
      validation.setupReadinessSummary.draftComplete ? "complete" : "incomplete",
    readinessIssues,
    blockedReasons: readinessIssues,
    setupContractAvailable: true,
    setupOptionsCatalogAvailable: true,
    setupSelectionValidationAvailable: true,
    setupReadinessHandoffAvailable: true,
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
    gameplayStateCreated: false,
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
    playerFacing: false
  });
}

function collectMissingOrInvalidSelections(
  validationIssues: readonly NewGMModeSetupSelectionIssue[]
): readonly NewGMModeSetupSelectionIssue[] {
  return Object.freeze(
    validationIssues.filter(
      (issue) => issue.startsWith("missing-") || issue.startsWith("unknown-")
    )
  );
}

function collectReadinessIssues(
  validationIssues: readonly NewGMModeSetupSelectionIssue[]
): readonly NewGMModeSetupSelectionIssue[] {
  return Object.freeze([
    ...validationIssues.filter((issue) => issue !== "gameplay-start-not-implemented"),
    "gameplay-start-not-implemented"
  ]);
}

function determineReadinessPhase(
  readinessIssues: readonly NewGMModeSetupSelectionIssue[]
): NewGMModeSetupReadinessHandoffStatus {
  if (readinessIssues.some((issue) => issue.startsWith("missing-"))) {
    return "blocked_missing_selection";
  }

  if (readinessIssues.some((issue) => issue.startsWith("unknown-"))) {
    return "blocked_invalid_selection";
  }

  if (readinessIssues.includes("save-identity-prerequisite-not-satisfied")) {
    return "blocked_save_identity_prerequisite";
  }

  if (readinessIssues.includes("draft-incomplete")) {
    return "blocked_draft_incomplete";
  }

  return "structurally_ready_gameplay_start_unavailable";
}

function getSaveIdentityPrerequisiteStatus(
  selection: NewGMModeSetupSelectionInput
): "missing" | "satisfied" | "unsatisfied" {
  if (selection.saveIdentityPrerequisiteSatisfied === undefined) {
    return "missing";
  }

  return selection.saveIdentityPrerequisiteSatisfied ? "satisfied" : "unsatisfied";
}
