import {
  NEW_GM_MODE_TALENT_POOL_ELIGIBILITY_CAPABILITY_FLAGS,
  type NewGMModeTalentPoolEligibilityCapabilityFlags,
  type NewGMModeTalentPoolEligibilityRuleBlockedReason,
  createNewGMModeTalentPoolEligibilityRuleContractShell
} from "./newGMModeTalentPoolEligibilityRuleContractShell.ts";
import {
  type NewGMModeTalentPoolFixtureEligibilityCandidateSummary,
  type NewGMModeTalentPoolFixtureEligibilityIssue,
  createNewGMModeTalentPoolFixtureEligibilityValidatorShell
} from "./newGMModeTalentPoolFixtureEligibilityValidatorShell.ts";
import { createNewGMModeStaticWrestlerFixtureCatalogShell } from "./newGMModeStaticWrestlerFixtureCatalogShell.ts";
import { createNewGMModeStaticWrestlerFixtureValidationSummaryShell } from "./newGMModeStaticWrestlerFixtureValidationSummaryShell.ts";

export interface NewGMModeTalentPoolFixtureEligibilitySummaryShell {
  readonly status: "diagnostics-only";
  readonly eligibilitySummaryId: "new-gm-mode-talent-pool-fixture-eligibility-summary-v0.1";
  readonly sourceCatalogId: string;
  readonly ruleContractId: "new-gm-mode-talent-pool-eligibility-rule-contract-v0.1";
  readonly validatorId: "new-gm-mode-talent-pool-fixture-eligibility-validator-v0.1";
  readonly deterministicOrdering: true;
  readonly eligibilityValidationOnly: true;
  readonly eligibilitySummary: {
    readonly totalFixtureCount: number;
    readonly eligibleCandidateCount: number;
    readonly ineligibleCandidateCount: number;
    readonly eligibilityIssueCount: number;
    readonly minimumEligibleTalentCountSatisfied: boolean;
    readonly actualTalentPoolCreationReady: false;
    readonly draftBoardCreationReady: false;
    readonly draftExecutionReady: false;
    readonly gameplayStartReady: false;
  };
  readonly eligibleFixtures: readonly NewGMModeTalentPoolFixtureEligibilityCandidateSummary[];
  readonly ineligibleFixtures: readonly NewGMModeTalentPoolFixtureEligibilityCandidateSummary[];
  readonly eligibilityIssues: readonly NewGMModeTalentPoolFixtureEligibilityIssue[];
  readonly blockedReasons: readonly NewGMModeTalentPoolEligibilityRuleBlockedReason[];
  readonly staticWrestlerFixtureCatalogAvailable: true;
  readonly staticWrestlerFixtureValidatorAvailable: true;
  readonly staticWrestlerFixtureValidationSummaryAvailable: true;
  readonly wrestlerDataShapeContractAvailable: true;
  readonly talentPoolEligibilityRuleContractAvailable: true;
  readonly talentPoolFixtureEligibilityValidatorAvailable: true;
  readonly talentPoolFixtureEligibilitySummaryAvailable: true;
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
  readonly capabilityFlags: NewGMModeTalentPoolEligibilityCapabilityFlags;
  readonly saveCreated: false;
  readonly sqliteWritten: false;
  readonly sqliteDatabaseOpened: false;
  readonly gameplayStateCreated: false;
  readonly wrestlerRecordsCreated: false;
  readonly rosterStateCreated: false;
  readonly talentPoolStateCreated: false;
  readonly draftBoardStateCreated: false;
  readonly wrestlerDataCreated: false;
  readonly talentPoolsCreated: false;
  readonly eligibleTalentPoolsCreated: false;
  readonly eligibleTalentPoolStateCreated: false;
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

export function createNewGMModeTalentPoolFixtureEligibilitySummaryShell(): NewGMModeTalentPoolFixtureEligibilitySummaryShell {
  const catalog = createNewGMModeStaticWrestlerFixtureCatalogShell();
  const fixtureValidationSummary =
    createNewGMModeStaticWrestlerFixtureValidationSummaryShell();
  const ruleContract = createNewGMModeTalentPoolEligibilityRuleContractShell();
  const validator = createNewGMModeTalentPoolFixtureEligibilityValidatorShell({
    fixtures: catalog.fixtures,
    sourceCatalogId: catalog.staticWrestlerFixtureCatalogId
  });

  return Object.freeze({
    status: "diagnostics-only",
    eligibilitySummaryId:
      "new-gm-mode-talent-pool-fixture-eligibility-summary-v0.1",
    sourceCatalogId: catalog.staticWrestlerFixtureCatalogId,
    ruleContractId: ruleContract.talentPoolEligibilityRuleContractId,
    validatorId: validator.validatorId,
    deterministicOrdering: true,
    eligibilityValidationOnly: true,
    eligibilitySummary: Object.freeze({
      totalFixtureCount: catalog.fixtures.length,
      eligibleCandidateCount: validator.fixtureEligibilitySummary.eligibleCandidateCount,
      ineligibleCandidateCount:
        validator.fixtureEligibilitySummary.ineligibleCandidateCount,
      eligibilityIssueCount: validator.fixtureEligibilitySummary.eligibilityIssueCount,
      minimumEligibleTalentCountSatisfied:
        validator.fixtureEligibilitySummary.minimumEligibleTalentCountSatisfied,
      actualTalentPoolCreationReady: false,
      draftBoardCreationReady: false,
      draftExecutionReady: false,
      gameplayStartReady: false
    }),
    eligibleFixtures: validator.eligibleFixtures,
    ineligibleFixtures: validator.ineligibleFixtures,
    eligibilityIssues: validator.eligibilityIssues,
    blockedReasons: validator.blockedReasons,
    staticWrestlerFixtureCatalogAvailable: true,
    staticWrestlerFixtureValidatorAvailable: true,
    staticWrestlerFixtureValidationSummaryAvailable:
      fixtureValidationSummary.staticWrestlerFixtureValidationSummaryAvailable,
    wrestlerDataShapeContractAvailable:
      ruleContract.wrestlerDataShapeContractAvailable,
    talentPoolEligibilityRuleContractAvailable: true,
    talentPoolFixtureEligibilityValidatorAvailable: true,
    talentPoolFixtureEligibilitySummaryAvailable: true,
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
    capabilityFlags: NEW_GM_MODE_TALENT_POOL_ELIGIBILITY_CAPABILITY_FLAGS,
    saveCreated: false,
    sqliteWritten: false,
    sqliteDatabaseOpened: false,
    gameplayStateCreated: false,
    wrestlerRecordsCreated: false,
    rosterStateCreated: false,
    talentPoolStateCreated: false,
    draftBoardStateCreated: false,
    wrestlerDataCreated: false,
    talentPoolsCreated: false,
    eligibleTalentPoolsCreated: false,
    eligibleTalentPoolStateCreated: false,
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
