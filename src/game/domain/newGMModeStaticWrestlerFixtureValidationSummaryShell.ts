import {
  createNewGMModeStaticWrestlerFixtureCatalogShell
} from "./newGMModeStaticWrestlerFixtureCatalogShell.ts";
import {
  type NewGMModeStaticWrestlerFixtureValidationBlockedReason,
  type NewGMModeStaticWrestlerFixtureValidationIssue,
  createNewGMModeStaticWrestlerFixtureValidatorShell
} from "./newGMModeStaticWrestlerFixtureValidatorShell.ts";
import { createNewGMModeWrestlerDataShapeContractShell } from "./newGMModeWrestlerDataShapeContractShell.ts";

export interface NewGMModeStaticWrestlerFixtureValidationSummaryShell {
  readonly status: "diagnostics-only";
  readonly validationSummaryId: "new-gm-mode-static-wrestler-fixture-validation-summary-v0.1";
  readonly deterministicOrdering: true;
  readonly fixtureValidationOnly: true;
  readonly sourceCatalogId: string;
  readonly validatorId: "new-gm-mode-static-wrestler-fixture-validator-v0.1";
  readonly validationStatus: "structurally-valid" | "blocked";
  readonly fixtureSummary: {
    readonly fixtureCount: number;
    readonly validFixtureCount: number;
    readonly invalidFixtureCount: number;
    readonly validationIssueCount: number;
    readonly fixtureCatalogAvailable: true;
    readonly validatorAvailable: true;
    readonly talentPoolCreationReady: false;
    readonly draftBoardCreationReady: false;
    readonly gameplayStartReady: false;
  };
  readonly validationIssues: readonly NewGMModeStaticWrestlerFixtureValidationIssue[];
  readonly blockedReasons: readonly NewGMModeStaticWrestlerFixtureValidationBlockedReason[];
  readonly staticWrestlerFixtureCatalogAvailable: true;
  readonly staticWrestlerFixtureValidatorAvailable: true;
  readonly staticWrestlerFixtureValidationSummaryAvailable: true;
  readonly wrestlerDataShapeContractAvailable: true;
  readonly wrestlerRecordCreationAvailable: false;
  readonly talentPoolCreationAvailable: false;
  readonly draftBoardCreationAvailable: false;
  readonly draftPickValidationAvailable: false;
  readonly draftExecutionAvailable: false;
  readonly rosterAssignmentAvailable: false;
  readonly championshipDivisionAssignmentAvailable: false;
  readonly gameplayStartAvailable: false;
  readonly gameplayPayloadPersistenceAvailable: false;
  readonly uiWiringAvailable: false;
  readonly capabilityFlags: {
    readonly staticWrestlerFixtureCatalogAvailable: true;
    readonly staticWrestlerFixtureValidatorAvailable: true;
    readonly staticWrestlerFixtureValidationSummaryAvailable: true;
    readonly wrestlerDataShapeContractAvailable: true;
    readonly wrestlerRecordCreationAvailable: false;
    readonly talentPoolCreationAvailable: false;
    readonly draftBoardCreationAvailable: false;
    readonly draftPickValidationAvailable: false;
    readonly draftExecutionAvailable: false;
    readonly rosterAssignmentAvailable: false;
    readonly championshipDivisionAssignmentAvailable: false;
    readonly gameplayStartAvailable: false;
    readonly gameplayPayloadPersistenceAvailable: false;
    readonly uiWiringAvailable: false;
  };
  readonly saveCreated: false;
  readonly sqliteWritten: false;
  readonly sqliteDatabaseOpened: false;
  readonly gameplayStateCreated: false;
  readonly wrestlerRecordsCreated: false;
  readonly rosterStateCreated: false;
  readonly talentPoolStateCreated: false;
  readonly draftBoardStateCreated: false;
  readonly talentPoolsCreated: false;
  readonly eligibleTalentPoolsCreated: false;
  readonly draftBoardsCreated: false;
  readonly draftPicksCreated: false;
  readonly draftPickValidationExecuted: false;
  readonly rostersCreated: false;
  readonly rosterAssignmentsCreated: false;
  readonly championshipsCreated: false;
  readonly championshipAssignmentsCreated: false;
  readonly divisionsCreated: false;
  readonly divisionAssignmentsCreated: false;
  readonly matchesCreated: false;
  readonly showsCreated: false;
  readonly weeksCreated: false;
  readonly draftLogicExecuted: false;
  readonly draftExecutionExecuted: false;
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
}

export function createNewGMModeStaticWrestlerFixtureValidationSummaryShell(): NewGMModeStaticWrestlerFixtureValidationSummaryShell {
  const catalog = createNewGMModeStaticWrestlerFixtureCatalogShell();
  const validator = createNewGMModeStaticWrestlerFixtureValidatorShell({
    fixtures: catalog.fixtures,
    sourceCatalogId: catalog.staticWrestlerFixtureCatalogId
  });
  const dataShapeContract = createNewGMModeWrestlerDataShapeContractShell();

  return Object.freeze({
    status: "diagnostics-only",
    validationSummaryId:
      "new-gm-mode-static-wrestler-fixture-validation-summary-v0.1",
    deterministicOrdering: true,
    fixtureValidationOnly: true,
    sourceCatalogId: catalog.staticWrestlerFixtureCatalogId,
    validatorId: validator.validatorId,
    validationStatus: validator.fixtureValidationStatus,
    fixtureSummary: Object.freeze({
      fixtureCount: catalog.fixtures.length,
      validFixtureCount: validator.validFixtureCount,
      invalidFixtureCount: validator.invalidFixtureCount,
      validationIssueCount: validator.validationIssues.length,
      fixtureCatalogAvailable: true,
      validatorAvailable: true,
      talentPoolCreationReady: false,
      draftBoardCreationReady: false,
      gameplayStartReady: false
    }),
    validationIssues: validator.validationIssues,
    blockedReasons: validator.blockedReasons,
    staticWrestlerFixtureCatalogAvailable: true,
    staticWrestlerFixtureValidatorAvailable: true,
    staticWrestlerFixtureValidationSummaryAvailable: true,
    wrestlerDataShapeContractAvailable:
      dataShapeContract.wrestlerDataShapeContractAvailable,
    wrestlerRecordCreationAvailable: false,
    talentPoolCreationAvailable: false,
    draftBoardCreationAvailable: false,
    draftPickValidationAvailable: false,
    draftExecutionAvailable: false,
    rosterAssignmentAvailable: false,
    championshipDivisionAssignmentAvailable: false,
    gameplayStartAvailable: false,
    gameplayPayloadPersistenceAvailable: false,
    uiWiringAvailable: false,
    capabilityFlags: Object.freeze({
      staticWrestlerFixtureCatalogAvailable: true,
      staticWrestlerFixtureValidatorAvailable: true,
      staticWrestlerFixtureValidationSummaryAvailable: true,
      wrestlerDataShapeContractAvailable: true,
      wrestlerRecordCreationAvailable: false,
      talentPoolCreationAvailable: false,
      draftBoardCreationAvailable: false,
      draftPickValidationAvailable: false,
      draftExecutionAvailable: false,
      rosterAssignmentAvailable: false,
      championshipDivisionAssignmentAvailable: false,
      gameplayStartAvailable: false,
      gameplayPayloadPersistenceAvailable: false,
      uiWiringAvailable: false
    }),
    saveCreated: false,
    sqliteWritten: false,
    sqliteDatabaseOpened: false,
    gameplayStateCreated: false,
    wrestlerRecordsCreated: false,
    rosterStateCreated: false,
    talentPoolStateCreated: false,
    draftBoardStateCreated: false,
    talentPoolsCreated: false,
    eligibleTalentPoolsCreated: false,
    draftBoardsCreated: false,
    draftPicksCreated: false,
    draftPickValidationExecuted: false,
    rostersCreated: false,
    rosterAssignmentsCreated: false,
    championshipsCreated: false,
    championshipAssignmentsCreated: false,
    divisionsCreated: false,
    divisionAssignmentsCreated: false,
    matchesCreated: false,
    showsCreated: false,
    weeksCreated: false,
    draftLogicExecuted: false,
    draftExecutionExecuted: false,
    weekOneUnlocked: false,
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
