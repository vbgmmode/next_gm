import { createNewGMModeChampionshipDivisionRequirementContractShell } from "./newGMModeChampionshipDivisionRequirementContractShell.ts";
import { createNewGMModeDraftBoardEligibilityInputSummaryShell } from "./newGMModeDraftBoardEligibilityInputSummaryShell.ts";
import { createNewGMModeDraftBoardDisplayReadinessSummaryShell } from "./newGMModeDraftBoardDisplayReadinessSummaryShell.ts";
import { createNewGMModeDraftBoardOrderingSummaryShell } from "./newGMModeDraftBoardOrderingSummaryShell.ts";
import { createNewGMModeDraftBoardSelectionPrerequisiteSummaryShell } from "./newGMModeDraftBoardSelectionPrerequisiteSummaryShell.ts";
import {
  type NewGMModeDraftPickValidationBlockedReason,
  type NewGMModeDraftPickValidationCapabilityFlags,
  createNewGMModeDraftPickValidationContractShell
} from "./newGMModeDraftPickValidationContractShell.ts";
import { createNewGMModeRosterSlotRequirementContractShell } from "./newGMModeRosterSlotRequirementContractShell.ts";
import {
  type NewGMModeTalentPoolReadinessAggregatorInput,
  createNewGMModeTalentPoolReadinessAggregatorShell
} from "./newGMModeTalentPoolReadinessAggregatorShell.ts";

export type NewGMModeDraftPickValidationReadinessPhaseId =
  | "missing-draft-pick-validation-contract"
  | "missing-selection-prerequisites"
  | "missing-display-readiness"
  | "missing-ordering-readiness"
  | "missing-draft-board-input-readiness"
  | "missing-talent-pool-readiness"
  | "insufficient-display-ready-entries"
  | "validation-prerequisites-ready-concrete-pick-validation-blocked";

export type NewGMModeDraftPickValidationReadinessIssueCode =
  | "selection-prerequisite-summary-not-structurally-satisfied"
  | "display-readiness-not-structurally-satisfied"
  | "ordering-readiness-not-structurally-satisfied"
  | "draft-board-input-readiness-not-structurally-satisfied"
  | "talent-pool-readiness-not-structurally-satisfied"
  | "display-ready-eligible-entries-missing"
  | "fixture-count-not-stable"
  | "display-ready-eligible-count-not-stable"
  | "excluded-ineligible-count-not-stable"
  | "roster-slot-requirement-contract-missing"
  | "championship-division-requirement-contract-missing";

export interface NewGMModeDraftPickValidationReadinessIssue {
  readonly fieldId: string;
  readonly issue: NewGMModeDraftPickValidationReadinessIssueCode;
}

export interface NewGMModeDraftPickValidationReadinessValidatorShell {
  readonly status: "diagnostics-only";
  readonly draftPickValidationReadinessValidatorId: "new-gm-mode-draft-pick-validation-readiness-validator-v0.1";
  readonly version: "0.1";
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly deterministicOrdering: true;
  readonly draftPickValidationReadinessOnly: true;
  readonly draftPickValidationContractAvailable: true;
  readonly selectionPrerequisiteSummaryAvailable: true;
  readonly displayReadinessAvailable: true;
  readonly orderingReadinessAvailable: true;
  readonly draftBoardInputReadinessAvailable: true;
  readonly talentPoolReadinessAvailable: true;
  readonly rosterSlotRequirementAvailable: true;
  readonly championshipDivisionRequirementAvailable: true;
  readonly validationReadinessPhase: NewGMModeDraftPickValidationReadinessPhaseId;
  readonly futureDraftPickValidationPrerequisitesStructurallySatisfied: boolean;
  readonly validationReadinessSummary: {
    readonly totalFixtureCount: number;
    readonly displayReadyEligibleCount: number;
    readonly excludedIneligibleCount: number;
    readonly expectedFixtureCount: 10;
    readonly expectedDisplayReadyEligibleCount: 9;
    readonly expectedExcludedIneligibleCount: 1;
    readonly selectedWrestlerChosen: false;
    readonly concreteDraftPickValidated: false;
    readonly actualDraftPickExecutionReady: false;
    readonly validationIssueCount: number;
  };
  readonly validationReadinessIssues: readonly NewGMModeDraftPickValidationReadinessIssue[];
  readonly blockedReasons: readonly NewGMModeDraftPickValidationBlockedReason[];
  readonly capabilityFlags: NewGMModeDraftPickValidationCapabilityFlags;
  readonly selectedWrestlerChosen: false;
  readonly selectedWrestlerId: null;
  readonly concreteDraftPickValidated: false;
  readonly draftPickCreated: false;
  readonly actualDraftBoardCreationAvailable: false;
  readonly draftBoardCreationAvailable: false;
  readonly draftBoardUiRenderingAvailable: false;
  readonly playerFacingDraftBoardAvailable: false;
  readonly concreteDraftPickValidationAvailable: false;
  readonly actualDraftPickExecutionAvailable: false;
  readonly draftPickValidationAvailable: false;
  readonly draftExecutionAvailable: false;
  readonly rosterAssignmentAvailable: false;
  readonly championshipDivisionAssignmentAvailable: false;
  readonly gameplayStartAvailable: false;
  readonly gameplayPayloadPersistenceAvailable: false;
  readonly uiWiringAvailable: false;
  readonly saveCreated: false;
  readonly sqliteWritten: false;
  readonly sqliteDatabaseOpened: false;
  readonly gameplayStateCreated: false;
  readonly talentPoolStateCreated: false;
  readonly draftBoardStateCreated: false;
  readonly draftOrderStateCreated: false;
  readonly draftBoardUiCreated: false;
  readonly playerFacingDraftBoardCreated: false;
  readonly draftBoardsCreated: false;
  readonly draftPicksCreated: false;
  readonly draftPickValidationExecuted: false;
  readonly draftExecutionExecuted: false;
  readonly rosterAssignmentsCreated: false;
  readonly championshipAssignmentsCreated: false;
  readonly divisionAssignmentsCreated: false;
  readonly matchesCreated: false;
  readonly showsCreated: false;
  readonly weeksCreated: false;
  readonly weekOneUnlocked: false;
  readonly persistencePayloadsCreated: false;
  readonly generatedTextCreated: false;
  readonly genAIUsed: false;
}

const EXPECTED_FIXTURE_COUNT = 10;
const EXPECTED_DISPLAY_READY_ELIGIBLE_COUNT = 9;
const EXPECTED_EXCLUDED_INELIGIBLE_COUNT = 1;

export function createNewGMModeDraftPickValidationReadinessValidatorShell(
  input: NewGMModeTalentPoolReadinessAggregatorInput = {}
): NewGMModeDraftPickValidationReadinessValidatorShell {
  const validationContract = createNewGMModeDraftPickValidationContractShell();
  const selectionPrerequisites =
    createNewGMModeDraftBoardSelectionPrerequisiteSummaryShell(input);
  const displayReadiness =
    createNewGMModeDraftBoardDisplayReadinessSummaryShell(input);
  const orderingReadiness = createNewGMModeDraftBoardOrderingSummaryShell(input);
  const draftBoardInputReadiness =
    createNewGMModeDraftBoardEligibilityInputSummaryShell(input);
  const talentPoolReadiness =
    createNewGMModeTalentPoolReadinessAggregatorShell(input);
  const rosterSlotRequirement = createNewGMModeRosterSlotRequirementContractShell();
  const championshipDivisionRequirement =
    createNewGMModeChampionshipDivisionRequirementContractShell();
  const issues = collectValidationReadinessIssues(
    selectionPrerequisites.futureSelectionPrerequisitesStructurallySatisfied,
    displayReadiness.futureDraftBoardDisplayFieldsStructurallySatisfied,
    orderingReadiness.futureDraftBoardOrderingStructurallySatisfied,
    draftBoardInputReadiness.futureDraftBoardInputsStructurallySatisfied,
    talentPoolReadiness.readinessSummary.structuralTalentPoolReadinessSatisfied,
    displayReadiness.displayReadinessSummary.totalFixtureCount,
    displayReadiness.displayReadinessSummary.displayReadyEligibleCount,
    displayReadiness.displayReadinessSummary.excludedIneligibleCount,
    rosterSlotRequirement.rosterSlotRequirementContractAvailable,
    championshipDivisionRequirement.championshipDivisionRequirementContractAvailable
  );
  const futureDraftPickValidationPrerequisitesStructurallySatisfied =
    issues.length === 0;

  return Object.freeze({
    status: "diagnostics-only",
    draftPickValidationReadinessValidatorId:
      "new-gm-mode-draft-pick-validation-readiness-validator-v0.1",
    version: "0.1",
    diagnosticsOnly: true,
    playerFacing: false,
    gameplayAffecting: false,
    deterministicOrdering: true,
    draftPickValidationReadinessOnly: true,
    draftPickValidationContractAvailable:
      validationContract.draftPickValidationContractAvailable,
    selectionPrerequisiteSummaryAvailable:
      selectionPrerequisites.draftBoardSelectionPrerequisiteSummaryId ===
      "new-gm-mode-draft-board-selection-prerequisite-summary-v0.1",
    displayReadinessAvailable:
      displayReadiness.draftBoardDisplayReadinessSummaryId ===
      "new-gm-mode-draft-board-display-readiness-summary-v0.1",
    orderingReadinessAvailable:
      orderingReadiness.draftBoardOrderingSummaryId ===
      "new-gm-mode-draft-board-ordering-summary-v0.1",
    draftBoardInputReadinessAvailable:
      draftBoardInputReadiness.draftBoardInputContractAvailable,
    talentPoolReadinessAvailable:
      talentPoolReadiness.talentPoolReadinessAggregatorId ===
      "new-gm-mode-talent-pool-readiness-aggregator-v0.1",
    rosterSlotRequirementAvailable:
      rosterSlotRequirement.rosterSlotRequirementContractAvailable,
    championshipDivisionRequirementAvailable:
      championshipDivisionRequirement.championshipDivisionRequirementContractAvailable,
    validationReadinessPhase: determineValidationReadinessPhase(
      validationContract.draftPickValidationContractAvailable,
      selectionPrerequisites.futureSelectionPrerequisitesStructurallySatisfied,
      displayReadiness.futureDraftBoardDisplayFieldsStructurallySatisfied,
      orderingReadiness.futureDraftBoardOrderingStructurallySatisfied,
      draftBoardInputReadiness.futureDraftBoardInputsStructurallySatisfied,
      talentPoolReadiness.readinessSummary.structuralTalentPoolReadinessSatisfied,
      displayReadiness.displayReadinessSummary.minimumEligibleRequirementSatisfied
    ),
    futureDraftPickValidationPrerequisitesStructurallySatisfied,
    validationReadinessSummary: Object.freeze({
      totalFixtureCount:
        displayReadiness.displayReadinessSummary.totalFixtureCount,
      displayReadyEligibleCount:
        displayReadiness.displayReadinessSummary.displayReadyEligibleCount,
      excludedIneligibleCount:
        displayReadiness.displayReadinessSummary.excludedIneligibleCount,
      expectedFixtureCount: EXPECTED_FIXTURE_COUNT,
      expectedDisplayReadyEligibleCount: EXPECTED_DISPLAY_READY_ELIGIBLE_COUNT,
      expectedExcludedIneligibleCount: EXPECTED_EXCLUDED_INELIGIBLE_COUNT,
      selectedWrestlerChosen: false,
      concreteDraftPickValidated: false,
      actualDraftPickExecutionReady: false,
      validationIssueCount: issues.length
    }),
    validationReadinessIssues: issues,
    blockedReasons: validationContract.blockedReasons,
    capabilityFlags: validationContract.capabilityFlags,
    selectedWrestlerChosen: false,
    selectedWrestlerId: null,
    concreteDraftPickValidated: false,
    draftPickCreated: false,
    actualDraftBoardCreationAvailable: false,
    draftBoardCreationAvailable: false,
    draftBoardUiRenderingAvailable: false,
    playerFacingDraftBoardAvailable: false,
    concreteDraftPickValidationAvailable: false,
    actualDraftPickExecutionAvailable: false,
    draftPickValidationAvailable: false,
    draftExecutionAvailable: false,
    rosterAssignmentAvailable: false,
    championshipDivisionAssignmentAvailable: false,
    gameplayStartAvailable: false,
    gameplayPayloadPersistenceAvailable: false,
    uiWiringAvailable: false,
    saveCreated: false,
    sqliteWritten: false,
    sqliteDatabaseOpened: false,
    gameplayStateCreated: false,
    talentPoolStateCreated: false,
    draftBoardStateCreated: false,
    draftOrderStateCreated: false,
    draftBoardUiCreated: false,
    playerFacingDraftBoardCreated: false,
    draftBoardsCreated: false,
    draftPicksCreated: false,
    draftPickValidationExecuted: false,
    draftExecutionExecuted: false,
    rosterAssignmentsCreated: false,
    championshipAssignmentsCreated: false,
    divisionAssignmentsCreated: false,
    matchesCreated: false,
    showsCreated: false,
    weeksCreated: false,
    weekOneUnlocked: false,
    persistencePayloadsCreated: false,
    generatedTextCreated: false,
    genAIUsed: false
  });
}

function collectValidationReadinessIssues(
  selectionPrerequisitesStructurallySatisfied: boolean,
  displayReadinessStructurallySatisfied: boolean,
  orderingReadinessStructurallySatisfied: boolean,
  draftBoardInputReadinessStructurallySatisfied: boolean,
  talentPoolReadinessStructurallySatisfied: boolean,
  totalFixtureCount: number,
  displayReadyEligibleCount: number,
  excludedIneligibleCount: number,
  rosterSlotRequirementAvailable: boolean,
  championshipDivisionRequirementAvailable: boolean
): readonly NewGMModeDraftPickValidationReadinessIssue[] {
  const issues: NewGMModeDraftPickValidationReadinessIssue[] = [];

  if (!selectionPrerequisitesStructurallySatisfied) {
    issues.push(
      createIssue(
        "draftBoardSelectionPrerequisiteSummary",
        "selection-prerequisite-summary-not-structurally-satisfied"
      )
    );
  }

  if (!displayReadinessStructurallySatisfied) {
    issues.push(
      createIssue(
        "draftBoardDisplayReadinessSummary",
        "display-readiness-not-structurally-satisfied"
      )
    );
  }

  if (!orderingReadinessStructurallySatisfied) {
    issues.push(
      createIssue(
        "draftBoardOrderingSummary",
        "ordering-readiness-not-structurally-satisfied"
      )
    );
  }

  if (!draftBoardInputReadinessStructurallySatisfied) {
    issues.push(
      createIssue(
        "draftBoardEligibilityInputSummary",
        "draft-board-input-readiness-not-structurally-satisfied"
      )
    );
  }

  if (!talentPoolReadinessStructurallySatisfied) {
    issues.push(
      createIssue(
        "talentPoolReadinessAggregator",
        "talent-pool-readiness-not-structurally-satisfied"
      )
    );
  }

  if (displayReadyEligibleCount === 0) {
    issues.push(
      createIssue(
        "displayReadyEligibleCount",
        "display-ready-eligible-entries-missing"
      )
    );
  }

  if (totalFixtureCount !== EXPECTED_FIXTURE_COUNT) {
    issues.push(createIssue("totalFixtureCount", "fixture-count-not-stable"));
  }

  if (displayReadyEligibleCount !== EXPECTED_DISPLAY_READY_ELIGIBLE_COUNT) {
    issues.push(
      createIssue(
        "displayReadyEligibleCount",
        "display-ready-eligible-count-not-stable"
      )
    );
  }

  if (excludedIneligibleCount !== EXPECTED_EXCLUDED_INELIGIBLE_COUNT) {
    issues.push(
      createIssue(
        "excludedIneligibleCount",
        "excluded-ineligible-count-not-stable"
      )
    );
  }

  if (!rosterSlotRequirementAvailable) {
    issues.push(
      createIssue(
        "rosterSlotRequirementContract",
        "roster-slot-requirement-contract-missing"
      )
    );
  }

  if (!championshipDivisionRequirementAvailable) {
    issues.push(
      createIssue(
        "championshipDivisionRequirementContract",
        "championship-division-requirement-contract-missing"
      )
    );
  }

  return Object.freeze(issues);
}

function determineValidationReadinessPhase(
  validationContractAvailable: boolean,
  selectionPrerequisitesStructurallySatisfied: boolean,
  displayReadinessStructurallySatisfied: boolean,
  orderingReadinessStructurallySatisfied: boolean,
  draftBoardInputReadinessStructurallySatisfied: boolean,
  talentPoolReadinessStructurallySatisfied: boolean,
  minimumEligibleRequirementSatisfied: boolean
): NewGMModeDraftPickValidationReadinessPhaseId {
  if (!validationContractAvailable) {
    return "missing-draft-pick-validation-contract";
  }

  if (!minimumEligibleRequirementSatisfied) {
    return "insufficient-display-ready-entries";
  }

  if (!selectionPrerequisitesStructurallySatisfied) {
    return "missing-selection-prerequisites";
  }

  if (!displayReadinessStructurallySatisfied) {
    return "missing-display-readiness";
  }

  if (!orderingReadinessStructurallySatisfied) {
    return "missing-ordering-readiness";
  }

  if (!draftBoardInputReadinessStructurallySatisfied) {
    return "missing-draft-board-input-readiness";
  }

  if (!talentPoolReadinessStructurallySatisfied) {
    return "missing-talent-pool-readiness";
  }

  return "validation-prerequisites-ready-concrete-pick-validation-blocked";
}

function createIssue(
  fieldId: string,
  issue: NewGMModeDraftPickValidationReadinessIssueCode
): NewGMModeDraftPickValidationReadinessIssue {
  return Object.freeze({ fieldId, issue });
}
