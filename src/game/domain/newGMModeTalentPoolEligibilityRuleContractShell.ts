import { createNewGMModeStaticWrestlerFixtureCatalogShell } from "./newGMModeStaticWrestlerFixtureCatalogShell.ts";
import { createNewGMModeWrestlerDataShapeContractShell } from "./newGMModeWrestlerDataShapeContractShell.ts";

export type NewGMModeTalentPoolEligibilityRuleId =
  | "static-wrestler-fixture-catalog-prerequisite"
  | "static-wrestler-fixture-validator-prerequisite"
  | "static-wrestler-fixture-validation-summary-prerequisite"
  | "wrestler-data-shape-contract-prerequisite"
  | "selected-brand-context-prerequisite"
  | "draft-eligibility-requirement"
  | "availability-status-requirement"
  | "brand-eligibility-requirement"
  | "gender-division-eligibility-requirement"
  | "championship-division-eligibility-requirement"
  | "role-category-tag-requirement"
  | "minimum-eligible-talent-count-requirement"
  | "future-roster-slot-compatibility-prerequisite"
  | "future-draft-board-compatibility-prerequisite"
  | "future-persistence-payload-compatibility-prerequisite";

export type NewGMModeTalentPoolEligibilityRuleBlockedReason =
  | "talent-pool-eligibility-rule-contract-only"
  | "selected-brand-context-not-implemented"
  | "real-wrestler-record-creation-not-implemented"
  | "talent-pool-creation-not-implemented"
  | "draft-board-creation-not-implemented"
  | "draft-pick-validation-not-implemented"
  | "draft-execution-not-implemented"
  | "roster-assignment-not-implemented"
  | "championship-division-assignment-not-implemented"
  | "gameplay-start-not-implemented"
  | "gameplay-payload-persistence-not-implemented"
  | "ui-wiring-not-implemented";

export interface NewGMModeTalentPoolEligibilityRule {
  readonly id: NewGMModeTalentPoolEligibilityRuleId;
  readonly slug: NewGMModeTalentPoolEligibilityRuleId;
  readonly label: string;
  readonly blockedReason: NewGMModeTalentPoolEligibilityRuleBlockedReason;
}

export interface NewGMModeTalentPoolEligibilityRuleContractShell {
  readonly status: "diagnostics-only";
  readonly talentPoolEligibilityRuleContractId: "new-gm-mode-talent-pool-eligibility-rule-contract-v0.1";
  readonly deterministicOrdering: true;
  readonly minimumEligibleTalentCount: 8;
  readonly eligibilityRules: readonly NewGMModeTalentPoolEligibilityRule[];
  readonly ruleContractSummary: {
    readonly ruleCount: number;
    readonly eligibilityValidationOnly: true;
    readonly actualTalentPoolCreationReady: false;
    readonly draftBoardCreationReady: false;
    readonly draftExecutionReady: false;
    readonly gameplayStartReady: false;
  };
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
  readonly talentPoolsCreated: false;
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
  readonly blockedReasons: readonly NewGMModeTalentPoolEligibilityRuleBlockedReason[];
}

export interface NewGMModeTalentPoolEligibilityCapabilityFlags {
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
}

export const NEW_GM_MODE_TALENT_POOL_MINIMUM_ELIGIBLE_TALENT_COUNT = 8;

export const NEW_GM_MODE_TALENT_POOL_ELIGIBILITY_CAPABILITY_FLAGS: NewGMModeTalentPoolEligibilityCapabilityFlags =
  Object.freeze({
    staticWrestlerFixtureCatalogAvailable: true,
    staticWrestlerFixtureValidatorAvailable: true,
    staticWrestlerFixtureValidationSummaryAvailable: true,
    wrestlerDataShapeContractAvailable: true,
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
    uiWiringAvailable: false
  });

const ELIGIBILITY_RULES: readonly NewGMModeTalentPoolEligibilityRule[] =
  Object.freeze([
    createRule(
      "static-wrestler-fixture-catalog-prerequisite",
      "Static wrestler fixture catalog prerequisite",
      "talent-pool-eligibility-rule-contract-only"
    ),
    createRule(
      "static-wrestler-fixture-validator-prerequisite",
      "Static wrestler fixture validator prerequisite",
      "talent-pool-eligibility-rule-contract-only"
    ),
    createRule(
      "static-wrestler-fixture-validation-summary-prerequisite",
      "Static wrestler fixture validation summary prerequisite",
      "talent-pool-eligibility-rule-contract-only"
    ),
    createRule(
      "wrestler-data-shape-contract-prerequisite",
      "Wrestler data shape contract prerequisite",
      "talent-pool-eligibility-rule-contract-only"
    ),
    createRule(
      "selected-brand-context-prerequisite",
      "Selected brand context prerequisite",
      "selected-brand-context-not-implemented"
    ),
    createRule(
      "draft-eligibility-requirement",
      "Draft eligibility requirement",
      "talent-pool-creation-not-implemented"
    ),
    createRule(
      "availability-status-requirement",
      "Availability status requirement",
      "talent-pool-creation-not-implemented"
    ),
    createRule(
      "brand-eligibility-requirement",
      "Brand eligibility requirement",
      "talent-pool-creation-not-implemented"
    ),
    createRule(
      "gender-division-eligibility-requirement",
      "Gender and division eligibility requirement",
      "talent-pool-creation-not-implemented"
    ),
    createRule(
      "championship-division-eligibility-requirement",
      "Championship division eligibility requirement",
      "championship-division-assignment-not-implemented"
    ),
    createRule(
      "role-category-tag-requirement",
      "Role and category tag requirement",
      "talent-pool-creation-not-implemented"
    ),
    createRule(
      "minimum-eligible-talent-count-requirement",
      "Minimum eligible talent count requirement",
      "talent-pool-creation-not-implemented"
    ),
    createRule(
      "future-roster-slot-compatibility-prerequisite",
      "Future roster-slot compatibility prerequisite",
      "roster-assignment-not-implemented"
    ),
    createRule(
      "future-draft-board-compatibility-prerequisite",
      "Future draft-board compatibility prerequisite",
      "draft-board-creation-not-implemented"
    ),
    createRule(
      "future-persistence-payload-compatibility-prerequisite",
      "Future persistence payload compatibility prerequisite",
      "gameplay-payload-persistence-not-implemented"
    )
  ]);

const BLOCKED_REASONS: readonly NewGMModeTalentPoolEligibilityRuleBlockedReason[] =
  Object.freeze([
    "talent-pool-eligibility-rule-contract-only",
    "selected-brand-context-not-implemented",
    "real-wrestler-record-creation-not-implemented",
    "talent-pool-creation-not-implemented",
    "draft-board-creation-not-implemented",
    "draft-pick-validation-not-implemented",
    "draft-execution-not-implemented",
    "roster-assignment-not-implemented",
    "championship-division-assignment-not-implemented",
    "gameplay-start-not-implemented",
    "gameplay-payload-persistence-not-implemented",
    "ui-wiring-not-implemented"
  ]);

export function createNewGMModeTalentPoolEligibilityRuleContractShell(): NewGMModeTalentPoolEligibilityRuleContractShell {
  return Object.freeze({
    status: "diagnostics-only",
    talentPoolEligibilityRuleContractId:
      "new-gm-mode-talent-pool-eligibility-rule-contract-v0.1",
    deterministicOrdering: true,
    minimumEligibleTalentCount: NEW_GM_MODE_TALENT_POOL_MINIMUM_ELIGIBLE_TALENT_COUNT,
    eligibilityRules: ELIGIBILITY_RULES,
    ruleContractSummary: Object.freeze({
      ruleCount: ELIGIBILITY_RULES.length,
      eligibilityValidationOnly: true,
      actualTalentPoolCreationReady: false,
      draftBoardCreationReady: false,
      draftExecutionReady: false,
      gameplayStartReady: false
    }),
    staticWrestlerFixtureCatalogAvailable:
      typeof createNewGMModeStaticWrestlerFixtureCatalogShell === "function",
    staticWrestlerFixtureValidatorAvailable: true,
    staticWrestlerFixtureValidationSummaryAvailable: true,
    wrestlerDataShapeContractAvailable:
      typeof createNewGMModeWrestlerDataShapeContractShell === "function",
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
    talentPoolsCreated: false,
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
    playerFacing: false,
    blockedReasons: BLOCKED_REASONS
  });
}

function createRule(
  id: NewGMModeTalentPoolEligibilityRuleId,
  label: string,
  blockedReason: NewGMModeTalentPoolEligibilityRuleBlockedReason
): NewGMModeTalentPoolEligibilityRule {
  return Object.freeze({
    id,
    slug: id,
    label,
    blockedReason
  });
}
