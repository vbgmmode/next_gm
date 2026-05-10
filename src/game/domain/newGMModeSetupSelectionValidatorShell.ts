import { createNewGMModeSetupContractShell } from "./newGMModeSetupContractShell.ts";
import {
  type NewGMModeSetupCatalogOption,
  createNewGMModeSetupOptionsCatalogShell
} from "./newGMModeSetupOptionsCatalogShell.ts";

export interface NewGMModeSetupSelectionInput {
  readonly promotionOrBrandId?: string;
  readonly managerIdentityTypeId?: string;
  readonly difficultyModeId?: string;
  readonly draftStatusId?: string;
  readonly draftModeId?: string;
  readonly startingWeekOptionId?: string;
  readonly saveIdentityPrerequisiteSatisfied?: boolean;
  readonly draftComplete?: boolean;
}

export type NewGMModeSetupSelectionIssue =
  | "missing-promotion-or-brand"
  | "missing-manager-identity-type"
  | "missing-difficulty-mode"
  | "missing-draft-status-or-mode"
  | "missing-starting-week-option"
  | "missing-save-identity-prerequisite-status"
  | "unknown-promotion-or-brand"
  | "unknown-manager-identity-type"
  | "unknown-difficulty-mode"
  | "unknown-draft-status-or-mode"
  | "unknown-starting-week-option"
  | "save-identity-prerequisite-not-satisfied"
  | "draft-incomplete"
  | "gameplay-start-not-implemented";

export type NewGMModeSetupSelectionValidity =
  | "blocked"
  | "structurally-valid";

export type NewGMModeSetupSelectionReadiness =
  | "blocked"
  | "structurally-ready";

export interface NewGMModeSetupSelectionValidatorShell {
  readonly status: "diagnostics-only";
  readonly validatorId: "new-gm-mode-setup-selection-validator-v0.1";
  readonly selectionValidity: NewGMModeSetupSelectionValidity;
  readonly setupReadiness: NewGMModeSetupSelectionReadiness;
  readonly setupReadinessSummary: {
    readonly requiredSelectionCount: 6;
    readonly validSelectionCount: number;
    readonly structurallyValidSelection: boolean;
    readonly saveIdentityPrerequisiteSatisfied: boolean;
    readonly draftComplete: boolean;
    readonly playableStartReady: false;
  };
  readonly selectedOptionIds: {
    readonly promotionOrBrandId?: string;
    readonly managerIdentityTypeId?: string;
    readonly difficultyModeId?: string;
    readonly draftStatusOrModeId?: string;
    readonly startingWeekOptionId?: string;
  };
  readonly validationIssues: readonly NewGMModeSetupSelectionIssue[];
  readonly blockedReasons: readonly NewGMModeSetupSelectionIssue[];
  readonly setupContractAvailable: true;
  readonly setupOptionsCatalogAvailable: true;
  readonly setupSelectionValidationAvailable: true;
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

const REQUIRED_SELECTION_COUNT = 6;

export function createNewGMModeSetupSelectionValidatorShell(
  selection: NewGMModeSetupSelectionInput
): NewGMModeSetupSelectionValidatorShell {
  const catalog = createNewGMModeSetupOptionsCatalogShell();
  const validationIssues = collectValidationIssues(selection, catalog);
  const selectionValidity =
    validationIssues.some(isSelectionShapeIssue) ? "blocked" : "structurally-valid";
  const blockedReasons = collectBlockedReasons(validationIssues);
  const setupReadiness =
    blockedReasons.length === 0 ? "structurally-ready" : "blocked";

  return Object.freeze({
    status: "diagnostics-only",
    validatorId: "new-gm-mode-setup-selection-validator-v0.1",
    selectionValidity,
    setupReadiness,
    setupReadinessSummary: Object.freeze({
      requiredSelectionCount: REQUIRED_SELECTION_COUNT,
      validSelectionCount: countValidSelections(selection, catalog),
      structurallyValidSelection: selectionValidity === "structurally-valid",
      saveIdentityPrerequisiteSatisfied:
        selection.saveIdentityPrerequisiteSatisfied === true,
      draftComplete: selection.draftComplete === true,
      playableStartReady: false
    }),
    selectedOptionIds: Object.freeze({
      ...(selection.promotionOrBrandId
        ? { promotionOrBrandId: selection.promotionOrBrandId }
        : {}),
      ...(selection.managerIdentityTypeId
        ? { managerIdentityTypeId: selection.managerIdentityTypeId }
        : {}),
      ...(selection.difficultyModeId
        ? { difficultyModeId: selection.difficultyModeId }
        : {}),
      ...(selection.draftStatusId || selection.draftModeId
        ? { draftStatusOrModeId: selection.draftStatusId ?? selection.draftModeId }
        : {}),
      ...(selection.startingWeekOptionId
        ? { startingWeekOptionId: selection.startingWeekOptionId }
        : {})
    }),
    validationIssues,
    blockedReasons,
    setupContractAvailable:
      typeof createNewGMModeSetupContractShell === "function",
    setupOptionsCatalogAvailable:
      typeof createNewGMModeSetupOptionsCatalogShell === "function",
    setupSelectionValidationAvailable: true,
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

function collectValidationIssues(
  selection: NewGMModeSetupSelectionInput,
  catalog: ReturnType<typeof createNewGMModeSetupOptionsCatalogShell>
): readonly NewGMModeSetupSelectionIssue[] {
  const issues: NewGMModeSetupSelectionIssue[] = [];
  const draftStatusOrModeId = selection.draftStatusId ?? selection.draftModeId;

  pushMissingOrUnknown(
    issues,
    selection.promotionOrBrandId,
    catalog.promotionsBrands,
    "missing-promotion-or-brand",
    "unknown-promotion-or-brand"
  );
  pushMissingOrUnknown(
    issues,
    selection.managerIdentityTypeId,
    catalog.managerIdentityTypes,
    "missing-manager-identity-type",
    "unknown-manager-identity-type"
  );
  pushMissingOrUnknown(
    issues,
    selection.difficultyModeId,
    catalog.difficultyModes,
    "missing-difficulty-mode",
    "unknown-difficulty-mode"
  );
  pushMissingOrUnknown(
    issues,
    draftStatusOrModeId,
    catalog.draftModes,
    "missing-draft-status-or-mode",
    "unknown-draft-status-or-mode"
  );
  pushMissingOrUnknown(
    issues,
    selection.startingWeekOptionId,
    catalog.startingCalendarWeekOptions,
    "missing-starting-week-option",
    "unknown-starting-week-option"
  );

  if (selection.saveIdentityPrerequisiteSatisfied === undefined) {
    issues.push("missing-save-identity-prerequisite-status");
  } else if (selection.saveIdentityPrerequisiteSatisfied === false) {
    issues.push("save-identity-prerequisite-not-satisfied");
  }

  if (
    draftStatusOrModeId &&
    optionExists(draftStatusOrModeId, catalog.draftModes) &&
    selection.draftComplete !== true
  ) {
    issues.push("draft-incomplete");
  }

  issues.push("gameplay-start-not-implemented");

  return Object.freeze(issues);
}

function collectBlockedReasons(
  validationIssues: readonly NewGMModeSetupSelectionIssue[]
): readonly NewGMModeSetupSelectionIssue[] {
  return Object.freeze(
    validationIssues.filter(
      (issue) =>
        issue === "save-identity-prerequisite-not-satisfied" ||
        issue === "draft-incomplete" ||
        issue === "gameplay-start-not-implemented"
    )
  );
}

function pushMissingOrUnknown(
  issues: NewGMModeSetupSelectionIssue[],
  selectedId: string | undefined,
  options: readonly NewGMModeSetupCatalogOption[],
  missingIssue: NewGMModeSetupSelectionIssue,
  unknownIssue: NewGMModeSetupSelectionIssue
): void {
  if (!selectedId) {
    issues.push(missingIssue);
    return;
  }

  if (!optionExists(selectedId, options)) {
    issues.push(unknownIssue);
  }
}

function countValidSelections(
  selection: NewGMModeSetupSelectionInput,
  catalog: ReturnType<typeof createNewGMModeSetupOptionsCatalogShell>
): number {
  const draftStatusOrModeId = selection.draftStatusId ?? selection.draftModeId;
  const validIds = [
    optionExists(selection.promotionOrBrandId, catalog.promotionsBrands),
    optionExists(selection.managerIdentityTypeId, catalog.managerIdentityTypes),
    optionExists(selection.difficultyModeId, catalog.difficultyModes),
    optionExists(draftStatusOrModeId, catalog.draftModes),
    optionExists(
      selection.startingWeekOptionId,
      catalog.startingCalendarWeekOptions
    ),
    selection.saveIdentityPrerequisiteSatisfied !== undefined
  ];

  return validIds.filter(Boolean).length;
}

function optionExists(
  selectedId: string | undefined,
  options: readonly NewGMModeSetupCatalogOption[]
): boolean {
  return selectedId !== undefined && options.some((option) => option.id === selectedId);
}

function isSelectionShapeIssue(issue: NewGMModeSetupSelectionIssue): boolean {
  return (
    issue.startsWith("missing-") ||
    issue.startsWith("unknown-")
  );
}
