import {
  NEW_GM_MODE_TALENT_POOL_ELIGIBILITY_CAPABILITY_FLAGS,
  NEW_GM_MODE_TALENT_POOL_MINIMUM_ELIGIBLE_TALENT_COUNT,
  type NewGMModeTalentPoolEligibilityCapabilityFlags,
  type NewGMModeTalentPoolEligibilityRuleBlockedReason,
  createNewGMModeTalentPoolEligibilityRuleContractShell
} from "./newGMModeTalentPoolEligibilityRuleContractShell.ts";
import {
  createNewGMModeStaticWrestlerFixtureCatalogShell
} from "./newGMModeStaticWrestlerFixtureCatalogShell.ts";
import {
  createNewGMModeStaticWrestlerFixtureValidationSummaryShell
} from "./newGMModeStaticWrestlerFixtureValidationSummaryShell.ts";
import {
  createNewGMModeStaticWrestlerFixtureValidatorShell
} from "./newGMModeStaticWrestlerFixtureValidatorShell.ts";

export type NewGMModeTalentPoolFixtureEligibilityIssueCode =
  | "fixture-validation-failed"
  | "missing-wrestler-id"
  | "missing-draft-eligibility"
  | "fixture-not-draft-eligible"
  | "missing-availability-status"
  | "fixture-not-available"
  | "missing-brand-eligibility"
  | "missing-gender-division-eligibility"
  | "missing-role-category-tags"
  | "missing-championship-division-eligibility"
  | "missing-future-persistence-compatibility-marker"
  | "minimum-eligible-talent-count-not-satisfied";

export interface NewGMModeTalentPoolFixtureEligibilityIssue {
  readonly fixtureIndex: number;
  readonly wrestlerId?: string;
  readonly fieldId: string;
  readonly issue: NewGMModeTalentPoolFixtureEligibilityIssueCode;
}

export interface NewGMModeTalentPoolFixtureEligibilityCandidateSummary {
  readonly fixtureIndex: number;
  readonly wrestlerId: string;
  readonly slug: string;
  readonly eligibilityStatus: "eligible" | "ineligible";
  readonly eligibilityReasons: readonly NewGMModeTalentPoolFixtureEligibilityIssueCode[];
}

export interface NewGMModeTalentPoolFixtureEligibilityValidatorInput {
  readonly fixtures?: readonly unknown[];
  readonly sourceCatalogId?: string;
}

export interface NewGMModeTalentPoolFixtureEligibilityValidatorShell {
  readonly status: "diagnostics-only";
  readonly validatorId: "new-gm-mode-talent-pool-fixture-eligibility-validator-v0.1";
  readonly sourceCatalogId: string;
  readonly fixtureValidationSummaryId: "new-gm-mode-static-wrestler-fixture-validation-summary-v0.1";
  readonly ruleContractId: "new-gm-mode-talent-pool-eligibility-rule-contract-v0.1";
  readonly deterministicOrdering: true;
  readonly eligibilityValidationOnly: true;
  readonly minimumEligibleTalentCount: 8;
  readonly eligibilityStatus: "structurally-ready" | "blocked";
  readonly fixtureEligibilitySummary: {
    readonly totalFixtureCount: number;
    readonly eligibleCandidateCount: number;
    readonly ineligibleCandidateCount: number;
    readonly eligibilityIssueCount: number;
    readonly minimumEligibleTalentCount: 8;
    readonly minimumEligibleTalentCountSatisfied: boolean;
    readonly actualTalentPoolCreationReady: false;
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

export function createNewGMModeTalentPoolFixtureEligibilityValidatorShell(
  input: NewGMModeTalentPoolFixtureEligibilityValidatorInput = {}
): NewGMModeTalentPoolFixtureEligibilityValidatorShell {
  const catalog = createNewGMModeStaticWrestlerFixtureCatalogShell();
  const fixtures = input.fixtures ?? catalog.fixtures;
  const fixtureValidator = createNewGMModeStaticWrestlerFixtureValidatorShell({
    fixtures,
    sourceCatalogId: input.sourceCatalogId ?? catalog.staticWrestlerFixtureCatalogId
  });
  const fixtureValidationSummary =
    createNewGMModeStaticWrestlerFixtureValidationSummaryShell();
  const ruleContract = createNewGMModeTalentPoolEligibilityRuleContractShell();
  const eligibilityIssues = collectEligibilityIssues(
    fixtures,
    fixtureValidator.validationIssues
  );
  const candidateSummaries = collectCandidateSummaries(fixtures, eligibilityIssues);
  const eligibleFixtures = candidateSummaries.filter(
    (fixture) => fixture.eligibilityStatus === "eligible"
  );
  const ineligibleFixtures = candidateSummaries.filter(
    (fixture) => fixture.eligibilityStatus === "ineligible"
  );
  const minimumEligibleTalentCountSatisfied =
    eligibleFixtures.length >= NEW_GM_MODE_TALENT_POOL_MINIMUM_ELIGIBLE_TALENT_COUNT;
  const finalEligibilityIssues = minimumEligibleTalentCountSatisfied
    ? eligibilityIssues
    : Object.freeze([
        ...eligibilityIssues,
        createIssue(
          fixtures.length,
          undefined,
          "minimumEligibleTalentCount",
          "minimum-eligible-talent-count-not-satisfied"
        )
      ]);

  return Object.freeze({
    status: "diagnostics-only",
    validatorId: "new-gm-mode-talent-pool-fixture-eligibility-validator-v0.1",
    sourceCatalogId: input.sourceCatalogId ?? catalog.staticWrestlerFixtureCatalogId,
    fixtureValidationSummaryId: fixtureValidationSummary.validationSummaryId,
    ruleContractId: ruleContract.talentPoolEligibilityRuleContractId,
    deterministicOrdering: true,
    eligibilityValidationOnly: true,
    minimumEligibleTalentCount: NEW_GM_MODE_TALENT_POOL_MINIMUM_ELIGIBLE_TALENT_COUNT,
    eligibilityStatus: finalEligibilityIssues.length === 0 ? "structurally-ready" : "blocked",
    fixtureEligibilitySummary: Object.freeze({
      totalFixtureCount: fixtures.length,
      eligibleCandidateCount: eligibleFixtures.length,
      ineligibleCandidateCount: ineligibleFixtures.length,
      eligibilityIssueCount: finalEligibilityIssues.length,
      minimumEligibleTalentCount:
        NEW_GM_MODE_TALENT_POOL_MINIMUM_ELIGIBLE_TALENT_COUNT,
      minimumEligibleTalentCountSatisfied,
      actualTalentPoolCreationReady: false
    }),
    eligibleFixtures: Object.freeze(eligibleFixtures),
    ineligibleFixtures: Object.freeze(ineligibleFixtures),
    eligibilityIssues: finalEligibilityIssues,
    blockedReasons: BLOCKED_REASONS,
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

function collectEligibilityIssues(
  fixtures: readonly unknown[],
  fixtureValidationIssues: readonly { readonly fixtureIndex: number }[]
): readonly NewGMModeTalentPoolFixtureEligibilityIssue[] {
  const issues: NewGMModeTalentPoolFixtureEligibilityIssue[] = [];
  const structurallyInvalidIndexes = new Set(
    fixtureValidationIssues.map((issue) => issue.fixtureIndex)
  );

  fixtures.forEach((fixture, fixtureIndex) => {
    if (!isRecord(fixture)) {
      issues.push(createIssue(fixtureIndex, undefined, "fixture", "fixture-validation-failed"));
      return;
    }

    const wrestlerId = readString(fixture, "wrestlerId");

    if (!wrestlerId) {
      issues.push(createIssue(fixtureIndex, undefined, "wrestlerId", "missing-wrestler-id"));
    }

    if (structurallyInvalidIndexes.has(fixtureIndex)) {
      issues.push(
        createIssue(
          fixtureIndex,
          wrestlerId,
          "fixtureValidation",
          "fixture-validation-failed"
        )
      );
    }

    if (!isRecord(fixture.draftEligibility)) {
      issues.push(
        createIssue(fixtureIndex, wrestlerId, "draftEligibility", "missing-draft-eligibility")
      );
    } else if (fixture.draftEligibility.eligible !== true) {
      issues.push(
        createIssue(fixtureIndex, wrestlerId, "draftEligibility", "fixture-not-draft-eligible")
      );
    }

    const availabilityStatus = readString(fixture, "availabilityStatus");
    if (!availabilityStatus) {
      issues.push(
        createIssue(fixtureIndex, wrestlerId, "availabilityStatus", "missing-availability-status")
      );
    } else if (availabilityStatus !== "available") {
      issues.push(
        createIssue(fixtureIndex, wrestlerId, "availabilityStatus", "fixture-not-available")
      );
    }

    validateRequiredArray(
      issues,
      fixture,
      fixtureIndex,
      wrestlerId,
      "brandEligibility",
      "missing-brand-eligibility"
    );
    validateRequiredArray(
      issues,
      fixture,
      fixtureIndex,
      wrestlerId,
      "genderDivisionEligibility",
      "missing-gender-division-eligibility"
    );
    validateRequiredArray(
      issues,
      fixture,
      fixtureIndex,
      wrestlerId,
      "roleCategoryTags",
      "missing-role-category-tags"
    );
    validateRequiredArray(
      issues,
      fixture,
      fixtureIndex,
      wrestlerId,
      "championshipDivisionEligibility",
      "missing-championship-division-eligibility"
    );

    if (
      fixture.futurePersistenceCompatibilityMarker !==
      "fixture-only-future-persistence-compatible"
    ) {
      issues.push(
        createIssue(
          fixtureIndex,
          wrestlerId,
          "futurePersistenceCompatibilityMarker",
          "missing-future-persistence-compatibility-marker"
        )
      );
    }
  });

  return Object.freeze(issues);
}

function collectCandidateSummaries(
  fixtures: readonly unknown[],
  eligibilityIssues: readonly NewGMModeTalentPoolFixtureEligibilityIssue[]
): readonly NewGMModeTalentPoolFixtureEligibilityCandidateSummary[] {
  return Object.freeze(
    fixtures.map((fixture, fixtureIndex) => {
      const fixtureIssues = eligibilityIssues.filter(
        (issue) => issue.fixtureIndex === fixtureIndex
      );
      const wrestlerId = isRecord(fixture)
        ? readString(fixture, "wrestlerId") ?? `invalid-fixture-${fixtureIndex}`
        : `invalid-fixture-${fixtureIndex}`;

      return Object.freeze({
        fixtureIndex,
        wrestlerId,
        slug: wrestlerId,
        eligibilityStatus: fixtureIssues.length === 0 ? "eligible" : "ineligible",
        eligibilityReasons: Object.freeze(fixtureIssues.map((issue) => issue.issue))
      });
    })
  );
}

function validateRequiredArray(
  issues: NewGMModeTalentPoolFixtureEligibilityIssue[],
  fixture: Record<string, unknown>,
  fixtureIndex: number,
  wrestlerId: string | undefined,
  fieldId: string,
  issue: NewGMModeTalentPoolFixtureEligibilityIssueCode
): void {
  const value = fixture[fieldId];

  if (!Array.isArray(value) || value.length === 0) {
    issues.push(createIssue(fixtureIndex, wrestlerId, fieldId, issue));
  }
}

function createIssue(
  fixtureIndex: number,
  wrestlerId: string | undefined,
  fieldId: string,
  issue: NewGMModeTalentPoolFixtureEligibilityIssueCode
): NewGMModeTalentPoolFixtureEligibilityIssue {
  return Object.freeze({
    fixtureIndex,
    ...(wrestlerId ? { wrestlerId } : {}),
    fieldId,
    issue
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(
  source: Record<string, unknown>,
  key: string
): string | undefined {
  const value = source[key];

  return typeof value === "string" && value.length > 0 ? value : undefined;
}
