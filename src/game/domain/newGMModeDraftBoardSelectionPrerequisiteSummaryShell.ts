import { createNewGMModeChampionshipDivisionRequirementContractShell } from "./newGMModeChampionshipDivisionRequirementContractShell.ts";
import { createNewGMModeDraftBoardEligibilityInputSummaryShell } from "./newGMModeDraftBoardEligibilityInputSummaryShell.ts";
import { createNewGMModeDraftBoardDisplayReadinessSummaryShell } from "./newGMModeDraftBoardDisplayReadinessSummaryShell.ts";
import { createNewGMModeDraftBoardOrderingSummaryShell } from "./newGMModeDraftBoardOrderingSummaryShell.ts";
import { createNewGMModeDraftBoardPrerequisiteContractShell } from "./newGMModeDraftBoardPrerequisiteContractShell.ts";
import {
  type NewGMModeDraftBoardSelectionPrerequisiteBlockedReason,
  type NewGMModeDraftBoardSelectionPrerequisiteCapabilityFlags,
  createNewGMModeDraftBoardSelectionPrerequisiteContractShell
} from "./newGMModeDraftBoardSelectionPrerequisiteContractShell.ts";
import { createNewGMModeRosterSlotRequirementContractShell } from "./newGMModeRosterSlotRequirementContractShell.ts";
import {
  type NewGMModeTalentPoolReadinessAggregatorInput,
  createNewGMModeTalentPoolReadinessAggregatorShell
} from "./newGMModeTalentPoolReadinessAggregatorShell.ts";

export type NewGMModeDraftBoardSelectionPrerequisitePhaseId =
  | "missing-selection-prerequisite-contract"
  | "missing-display-readiness"
  | "missing-ordering-readiness"
  | "missing-draft-board-input-readiness"
  | "missing-talent-pool-readiness"
  | "insufficient-display-ready-entries"
  | "selection-prerequisites-structurally-ready-pick-validation-blocked";

export interface NewGMModeDraftBoardSelectionPrerequisiteSummaryShell {
  readonly status: "diagnostics-only";
  readonly draftBoardSelectionPrerequisiteSummaryId: "new-gm-mode-draft-board-selection-prerequisite-summary-v0.1";
  readonly version: "0.1";
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly deterministicOrdering: true;
  readonly selectionPrerequisiteContractAvailable: true;
  readonly displayReadinessAvailable: true;
  readonly orderingReadinessAvailable: true;
  readonly draftBoardInputReadinessAvailable: true;
  readonly talentPoolReadinessAvailable: true;
  readonly draftBoardPrerequisiteContractAvailable: true;
  readonly rosterSlotRequirementAvailable: true;
  readonly championshipDivisionRequirementAvailable: true;
  readonly selectionPrerequisitePhase: NewGMModeDraftBoardSelectionPrerequisitePhaseId;
  readonly futureSelectionPrerequisitesStructurallySatisfied: boolean;
  readonly selectionPrerequisiteSummary: {
    readonly totalFixtureCount: number;
    readonly displayReadyEligibleCount: number;
    readonly excludedIneligibleCount: number;
    readonly minimumEligibleRequirement: 8;
    readonly minimumEligibleRequirementSatisfied: boolean;
    readonly selectedWrestlerChosen: false;
    readonly actualDraftPickValidationReady: false;
    readonly actualDraftPickExecutionReady: false;
  };
  readonly blockedReasons: readonly NewGMModeDraftBoardSelectionPrerequisiteBlockedReason[];
  readonly capabilityFlags: NewGMModeDraftBoardSelectionPrerequisiteCapabilityFlags;
  readonly selectedWrestlerChosen: false;
  readonly selectedWrestlerId: null;
  readonly actualDraftBoardCreationAvailable: false;
  readonly actualDraftBoardDisplayAvailable: false;
  readonly draftBoardCreationAvailable: false;
  readonly draftBoardUiRenderingAvailable: false;
  readonly playerFacingDraftBoardAvailable: false;
  readonly selectedWrestlerIdentitySelectionAvailable: false;
  readonly draftPickValidationAvailable: false;
  readonly actualDraftPickValidationAvailable: false;
  readonly draftExecutionAvailable: false;
  readonly actualDraftPickExecutionAvailable: false;
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

export function createNewGMModeDraftBoardSelectionPrerequisiteSummaryShell(
  input: NewGMModeTalentPoolReadinessAggregatorInput = {}
): NewGMModeDraftBoardSelectionPrerequisiteSummaryShell {
  const selectionContract =
    createNewGMModeDraftBoardSelectionPrerequisiteContractShell();
  const displayReadiness =
    createNewGMModeDraftBoardDisplayReadinessSummaryShell(input);
  const orderingReadiness = createNewGMModeDraftBoardOrderingSummaryShell(input);
  const draftBoardInputReadiness =
    createNewGMModeDraftBoardEligibilityInputSummaryShell(input);
  const talentPoolReadiness =
    createNewGMModeTalentPoolReadinessAggregatorShell(input);
  const draftBoardPrerequisite = createNewGMModeDraftBoardPrerequisiteContractShell();
  const rosterSlotRequirement = createNewGMModeRosterSlotRequirementContractShell();
  const championshipDivisionRequirement =
    createNewGMModeChampionshipDivisionRequirementContractShell();
  const futureSelectionPrerequisitesStructurallySatisfied =
    displayReadiness.futureDraftBoardDisplayFieldsStructurallySatisfied &&
    orderingReadiness.futureDraftBoardOrderingStructurallySatisfied &&
    draftBoardInputReadiness.futureDraftBoardInputsStructurallySatisfied &&
    talentPoolReadiness.readinessSummary.structuralTalentPoolReadinessSatisfied;

  return Object.freeze({
    status: "diagnostics-only",
    draftBoardSelectionPrerequisiteSummaryId:
      "new-gm-mode-draft-board-selection-prerequisite-summary-v0.1",
    version: "0.1",
    diagnosticsOnly: true,
    playerFacing: false,
    gameplayAffecting: false,
    deterministicOrdering: true,
    selectionPrerequisiteContractAvailable:
      selectionContract.selectionPrerequisiteContractAvailable,
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
    draftBoardPrerequisiteContractAvailable:
      draftBoardPrerequisite.draftBoardPrerequisiteContractAvailable,
    rosterSlotRequirementAvailable:
      rosterSlotRequirement.rosterSlotRequirementContractAvailable,
    championshipDivisionRequirementAvailable:
      championshipDivisionRequirement.championshipDivisionRequirementContractAvailable,
    selectionPrerequisitePhase: determineSelectionPrerequisitePhase(
      selectionContract.selectionPrerequisiteContractAvailable,
      displayReadiness.futureDraftBoardDisplayFieldsStructurallySatisfied,
      orderingReadiness.futureDraftBoardOrderingStructurallySatisfied,
      draftBoardInputReadiness.futureDraftBoardInputsStructurallySatisfied,
      talentPoolReadiness.readinessSummary.structuralTalentPoolReadinessSatisfied,
      displayReadiness.displayReadinessSummary.minimumEligibleRequirementSatisfied
    ),
    futureSelectionPrerequisitesStructurallySatisfied,
    selectionPrerequisiteSummary: Object.freeze({
      totalFixtureCount:
        displayReadiness.displayReadinessSummary.totalFixtureCount,
      displayReadyEligibleCount:
        displayReadiness.displayReadinessSummary.displayReadyEligibleCount,
      excludedIneligibleCount:
        displayReadiness.displayReadinessSummary.excludedIneligibleCount,
      minimumEligibleRequirement:
        displayReadiness.displayReadinessSummary.minimumEligibleRequirement,
      minimumEligibleRequirementSatisfied:
        displayReadiness.displayReadinessSummary.minimumEligibleRequirementSatisfied,
      selectedWrestlerChosen: false,
      actualDraftPickValidationReady: false,
      actualDraftPickExecutionReady: false
    }),
    blockedReasons: selectionContract.blockedReasons,
    capabilityFlags: selectionContract.capabilityFlags,
    selectedWrestlerChosen: false,
    selectedWrestlerId: null,
    actualDraftBoardCreationAvailable: false,
    actualDraftBoardDisplayAvailable: false,
    draftBoardCreationAvailable: false,
    draftBoardUiRenderingAvailable: false,
    playerFacingDraftBoardAvailable: false,
    selectedWrestlerIdentitySelectionAvailable: false,
    draftPickValidationAvailable: false,
    actualDraftPickValidationAvailable: false,
    draftExecutionAvailable: false,
    actualDraftPickExecutionAvailable: false,
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

function determineSelectionPrerequisitePhase(
  selectionContractAvailable: boolean,
  displayReadinessStructurallySatisfied: boolean,
  orderingReadinessStructurallySatisfied: boolean,
  draftBoardInputReadinessStructurallySatisfied: boolean,
  talentPoolReadinessStructurallySatisfied: boolean,
  minimumEligibleRequirementSatisfied: boolean
): NewGMModeDraftBoardSelectionPrerequisitePhaseId {
  if (!selectionContractAvailable) {
    return "missing-selection-prerequisite-contract";
  }

  if (!minimumEligibleRequirementSatisfied) {
    return "insufficient-display-ready-entries";
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

  return "selection-prerequisites-structurally-ready-pick-validation-blocked";
}
