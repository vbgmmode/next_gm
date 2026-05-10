import {
  type NewGMModeDraftBoardOrderingBlockedReason,
  type NewGMModeDraftBoardOrderingCapabilityFlags,
  createNewGMModeDraftBoardOrderingContractShell
} from "./newGMModeDraftBoardOrderingContractShell.ts";
import { createNewGMModeDraftBoardEligibilityInputSummaryShell } from "./newGMModeDraftBoardEligibilityInputSummaryShell.ts";
import { createNewGMModeStaticWrestlerFixtureCatalogShell } from "./newGMModeStaticWrestlerFixtureCatalogShell.ts";
import {
  NEW_GM_MODE_TALENT_POOL_MINIMUM_ELIGIBLE_TALENT_COUNT
} from "./newGMModeTalentPoolEligibilityRuleContractShell.ts";
import {
  type NewGMModeTalentPoolReadinessAggregatorInput,
  createNewGMModeTalentPoolReadinessAggregatorShell
} from "./newGMModeTalentPoolReadinessAggregatorShell.ts";
import { createNewGMModeTalentPoolFixtureEligibilitySummaryShell } from "./newGMModeTalentPoolFixtureEligibilitySummaryShell.ts";
import { createNewGMModeTalentPoolFixtureEligibilityValidatorShell } from "./newGMModeTalentPoolFixtureEligibilityValidatorShell.ts";

export type NewGMModeDraftBoardOrderingReadinessPhaseId =
  | "draft-board-inputs-not-ready"
  | "insufficient-eligible-fixtures"
  | "duplicate-eligible-wrestler-ids"
  | "invalid-ordering-inputs"
  | "structurally-ready-ordering-blocked";

export type NewGMModeDraftBoardOrderingIssueCode =
  | "draft-board-input-summary-not-structurally-satisfied"
  | "minimum-eligible-requirement-not-satisfied"
  | "missing-deterministic-ordering-key"
  | "duplicate-eligible-wrestler-id"
  | "missing-wrestler-display-identity"
  | "missing-brand-eligibility-visibility"
  | "missing-draft-eligibility-visibility"
  | "missing-availability-status-visibility"
  | "missing-gender-division-eligibility-visibility"
  | "missing-role-category-tag-visibility"
  | "missing-championship-division-eligibility-visibility"
  | "random-ordering-not-allowed";

export interface NewGMModeDraftBoardOrderingIssue {
  readonly fixtureIndex: number;
  readonly wrestlerId?: string;
  readonly fieldId: string;
  readonly issue: NewGMModeDraftBoardOrderingIssueCode;
}

export interface NewGMModeDraftBoardOrderingEntrySummary {
  readonly orderIndex: number;
  readonly fixtureIndex: number;
  readonly orderingKey: string;
  readonly wrestlerId: string;
  readonly displayName: string;
  readonly brandEligibility: readonly string[];
  readonly draftEligibilityVisible: true;
  readonly availabilityStatus: string;
  readonly genderDivisionEligibility: readonly string[];
  readonly roleCategoryTags: readonly string[];
  readonly championshipDivisionEligibility: readonly string[];
}

export interface NewGMModeDraftBoardOrderingExcludedFixtureSummary {
  readonly fixtureIndex: number;
  readonly wrestlerId: string;
  readonly exclusionReasons: readonly string[];
}

export interface NewGMModeDraftBoardOrderingValidatorShell {
  readonly status: "diagnostics-only";
  readonly draftBoardOrderingValidatorId: "new-gm-mode-draft-board-ordering-validator-v0.1";
  readonly version: "0.1";
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly deterministicOrdering: true;
  readonly orderingValidationOnly: true;
  readonly draftBoardEligibilityInputSummaryAvailable: true;
  readonly talentPoolReadinessAvailable: true;
  readonly talentPoolFixtureEligibilitySummaryAvailable: true;
  readonly staticWrestlerFixtureCatalogAvailable: true;
  readonly orderingReadinessPhase: NewGMModeDraftBoardOrderingReadinessPhaseId;
  readonly futureDraftBoardOrderingStructurallySatisfied: boolean;
  readonly orderingSummary: {
    readonly totalFixtureCount: number;
    readonly eligibleOrderedEntryCount: number;
    readonly excludedIneligibleCount: number;
    readonly minimumEligibleRequirement: 8;
    readonly minimumEligibleRequirementSatisfied: boolean;
    readonly validationIssueCount: number;
    readonly actualDraftBoardCreationReady: false;
  };
  readonly deterministicOrderingSummary: {
    readonly orderingAlgorithm: "fixture-index-then-wrestler-id";
    readonly orderingKeyFields: readonly ["fixtureIndex", "wrestlerId"];
    readonly tieBreakerFields: readonly ["wrestlerId"];
    readonly randomOrderingUsed: false;
  };
  readonly eligibleOrderedEntries: readonly NewGMModeDraftBoardOrderingEntrySummary[];
  readonly excludedIneligibleFixtures: readonly NewGMModeDraftBoardOrderingExcludedFixtureSummary[];
  readonly orderingIssues: readonly NewGMModeDraftBoardOrderingIssue[];
  readonly blockedReasons: readonly NewGMModeDraftBoardOrderingBlockedReason[];
  readonly capabilityFlags: NewGMModeDraftBoardOrderingCapabilityFlags;
  readonly actualDraftBoardCreationAvailable: false;
  readonly draftBoardCreationAvailable: false;
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
  readonly randomOrderingUsed: false;
}

export function createNewGMModeDraftBoardOrderingValidatorShell(
  input: NewGMModeTalentPoolReadinessAggregatorInput = {}
): NewGMModeDraftBoardOrderingValidatorShell {
  const catalog = createNewGMModeStaticWrestlerFixtureCatalogShell();
  const fixtures = input.fixtures ?? catalog.fixtures;
  const orderingContract = createNewGMModeDraftBoardOrderingContractShell();
  const draftBoardInputSummary =
    createNewGMModeDraftBoardEligibilityInputSummaryShell(input);
  const talentPoolReadiness =
    createNewGMModeTalentPoolReadinessAggregatorShell(input);
  const talentPoolEligibilitySummary =
    createNewGMModeTalentPoolFixtureEligibilitySummaryShell();
  const talentPoolEligibilityValidator =
    createNewGMModeTalentPoolFixtureEligibilityValidatorShell(input);
  const orderingIssues = collectOrderingIssues(
    fixtures,
    draftBoardInputSummary.futureDraftBoardInputsStructurallySatisfied,
    talentPoolEligibilityValidator.fixtureEligibilitySummary
      .minimumEligibleTalentCountSatisfied
  );
  const eligibleOrderedEntries = collectEligibleOrderedEntries(
    fixtures,
    talentPoolEligibilityValidator.eligibleFixtures
  );
  const excludedIneligibleFixtures =
    talentPoolEligibilityValidator.ineligibleFixtures.map((fixture) =>
      Object.freeze({
        fixtureIndex: fixture.fixtureIndex,
        wrestlerId: fixture.wrestlerId,
        exclusionReasons: fixture.eligibilityReasons
      })
    );
  const futureDraftBoardOrderingStructurallySatisfied =
    draftBoardInputSummary.futureDraftBoardInputsStructurallySatisfied &&
    orderingIssues.length === 0;
  const orderingReadinessPhase = determineOrderingReadinessPhase(
    draftBoardInputSummary.futureDraftBoardInputsStructurallySatisfied,
    talentPoolReadiness.readinessSummary.minimumEligibleRequirementSatisfied,
    orderingIssues
  );

  return Object.freeze({
    status: "diagnostics-only",
    draftBoardOrderingValidatorId:
      "new-gm-mode-draft-board-ordering-validator-v0.1",
    version: "0.1",
    diagnosticsOnly: true,
    playerFacing: false,
    gameplayAffecting: false,
    deterministicOrdering: true,
    orderingValidationOnly: true,
    draftBoardEligibilityInputSummaryAvailable:
      draftBoardInputSummary.draftBoardInputContractAvailable,
    talentPoolReadinessAvailable:
      talentPoolReadiness.talentPoolReadinessAggregatorId ===
      "new-gm-mode-talent-pool-readiness-aggregator-v0.1",
    talentPoolFixtureEligibilitySummaryAvailable:
      talentPoolEligibilitySummary.talentPoolFixtureEligibilitySummaryAvailable,
    staticWrestlerFixtureCatalogAvailable: true,
    orderingReadinessPhase,
    futureDraftBoardOrderingStructurallySatisfied,
    orderingSummary: Object.freeze({
      totalFixtureCount: fixtures.length,
      eligibleOrderedEntryCount: eligibleOrderedEntries.length,
      excludedIneligibleCount: excludedIneligibleFixtures.length,
      minimumEligibleRequirement:
        NEW_GM_MODE_TALENT_POOL_MINIMUM_ELIGIBLE_TALENT_COUNT,
      minimumEligibleRequirementSatisfied:
        talentPoolReadiness.readinessSummary.minimumEligibleRequirementSatisfied,
      validationIssueCount: orderingIssues.length,
      actualDraftBoardCreationReady: false
    }),
    deterministicOrderingSummary: Object.freeze({
      orderingAlgorithm: "fixture-index-then-wrestler-id",
      orderingKeyFields: Object.freeze(["fixtureIndex", "wrestlerId"]),
      tieBreakerFields: Object.freeze(["wrestlerId"]),
      randomOrderingUsed: false
    }),
    eligibleOrderedEntries: Object.freeze(eligibleOrderedEntries),
    excludedIneligibleFixtures: Object.freeze(excludedIneligibleFixtures),
    orderingIssues,
    blockedReasons: orderingContract.blockedReasons,
    capabilityFlags: orderingContract.capabilityFlags,
    actualDraftBoardCreationAvailable: false,
    draftBoardCreationAvailable: false,
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
    genAIUsed: false,
    randomOrderingUsed: false
  });
}

function collectEligibleOrderedEntries(
  fixtures: readonly unknown[],
  eligibleFixtures: readonly { readonly fixtureIndex: number; readonly wrestlerId: string }[]
): readonly NewGMModeDraftBoardOrderingEntrySummary[] {
  return Object.freeze(
    eligibleFixtures.map((candidate, orderIndex) => {
      const fixture = fixtures[candidate.fixtureIndex];
      const record = isRecord(fixture) ? fixture : {};

      return Object.freeze({
        orderIndex,
        fixtureIndex: candidate.fixtureIndex,
        orderingKey: createOrderingKey(candidate.fixtureIndex, candidate.wrestlerId),
        wrestlerId: candidate.wrestlerId,
        displayName: readString(record, "displayName") ?? candidate.wrestlerId,
        brandEligibility: readStringArray(record, "brandEligibility"),
        draftEligibilityVisible: true,
        availabilityStatus: readString(record, "availabilityStatus") ?? "unknown",
        genderDivisionEligibility: readStringArray(
          record,
          "genderDivisionEligibility"
        ),
        roleCategoryTags: readStringArray(record, "roleCategoryTags"),
        championshipDivisionEligibility: readStringArray(
          record,
          "championshipDivisionEligibility"
        )
      });
    })
  );
}

function collectOrderingIssues(
  fixtures: readonly unknown[],
  draftBoardInputsStructurallySatisfied: boolean,
  minimumEligibleRequirementSatisfied: boolean
): readonly NewGMModeDraftBoardOrderingIssue[] {
  const issues: NewGMModeDraftBoardOrderingIssue[] = [];
  const eligibleIdsSeen = new Set<string>();

  fixtures.forEach((fixture, fixtureIndex) => {
    if (!isRecord(fixture)) {
      issues.push(
        createIssue(
          fixtureIndex,
          undefined,
          "fixture",
          "missing-deterministic-ordering-key"
        )
      );
      return;
    }

    const wrestlerId = readString(fixture, "wrestlerId");

    if (!wrestlerId) {
      issues.push(
        createIssue(
          fixtureIndex,
          undefined,
          "wrestlerId",
          "missing-deterministic-ordering-key"
        )
      );
    }

    if (isEligibleForOrderingDuplicateScan(fixture, wrestlerId)) {
      if (eligibleIdsSeen.has(wrestlerId)) {
        issues.push(
          createIssue(
            fixtureIndex,
            wrestlerId,
            "wrestlerId",
            "duplicate-eligible-wrestler-id"
          )
        );
      } else {
        eligibleIdsSeen.add(wrestlerId);
      }
    }

    if (!readString(fixture, "displayName")) {
      issues.push(
        createIssue(
          fixtureIndex,
          wrestlerId,
          "displayName",
          "missing-wrestler-display-identity"
        )
      );
    }

    validateVisibleArray(
      issues,
      fixture,
      fixtureIndex,
      wrestlerId,
      "brandEligibility",
      "missing-brand-eligibility-visibility"
    );

    if (!isRecord(fixture.draftEligibility)) {
      issues.push(
        createIssue(
          fixtureIndex,
          wrestlerId,
          "draftEligibility",
          "missing-draft-eligibility-visibility"
        )
      );
    }

    if (!readString(fixture, "availabilityStatus")) {
      issues.push(
        createIssue(
          fixtureIndex,
          wrestlerId,
          "availabilityStatus",
          "missing-availability-status-visibility"
        )
      );
    }

    validateVisibleArray(
      issues,
      fixture,
      fixtureIndex,
      wrestlerId,
      "genderDivisionEligibility",
      "missing-gender-division-eligibility-visibility"
    );
    validateVisibleArray(
      issues,
      fixture,
      fixtureIndex,
      wrestlerId,
      "roleCategoryTags",
      "missing-role-category-tag-visibility"
    );
    validateVisibleArray(
      issues,
      fixture,
      fixtureIndex,
      wrestlerId,
      "championshipDivisionEligibility",
      "missing-championship-division-eligibility-visibility"
    );
  });

  if (!draftBoardInputsStructurallySatisfied) {
    issues.push(
      createIssue(
        fixtures.length,
        undefined,
        "draftBoardEligibilityInputSummary",
        "draft-board-input-summary-not-structurally-satisfied"
      )
    );
  }

  if (!minimumEligibleRequirementSatisfied) {
    issues.push(
      createIssue(
        fixtures.length,
        undefined,
        "minimumEligibleRequirement",
        "minimum-eligible-requirement-not-satisfied"
      )
    );
  }

  return Object.freeze(issues);
}

function determineOrderingReadinessPhase(
  draftBoardInputsStructurallySatisfied: boolean,
  minimumEligibleRequirementSatisfied: boolean,
  orderingIssues: readonly NewGMModeDraftBoardOrderingIssue[]
): NewGMModeDraftBoardOrderingReadinessPhaseId {
  if (!draftBoardInputsStructurallySatisfied) {
    return "draft-board-inputs-not-ready";
  }

  if (!minimumEligibleRequirementSatisfied) {
    return "insufficient-eligible-fixtures";
  }

  if (
    orderingIssues.some(
      (issue) => issue.issue === "duplicate-eligible-wrestler-id"
    )
  ) {
    return "duplicate-eligible-wrestler-ids";
  }

  if (orderingIssues.length > 0) {
    return "invalid-ordering-inputs";
  }

  return "structurally-ready-ordering-blocked";
}

function validateVisibleArray(
  issues: NewGMModeDraftBoardOrderingIssue[],
  fixture: Record<string, unknown>,
  fixtureIndex: number,
  wrestlerId: string | undefined,
  fieldId: string,
  issue: NewGMModeDraftBoardOrderingIssueCode
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
  issue: NewGMModeDraftBoardOrderingIssueCode
): NewGMModeDraftBoardOrderingIssue {
  return Object.freeze({
    fixtureIndex,
    ...(wrestlerId ? { wrestlerId } : {}),
    fieldId,
    issue
  });
}

function createOrderingKey(fixtureIndex: number, wrestlerId: string): string {
  return `${fixtureIndex.toString().padStart(3, "0")}:${wrestlerId}`;
}

function isEligibleForOrderingDuplicateScan(
  fixture: Record<string, unknown>,
  wrestlerId: string | undefined
): wrestlerId is string {
  return (
    typeof wrestlerId === "string" &&
    isRecord(fixture.draftEligibility) &&
    fixture.draftEligibility.eligible === true &&
    fixture.availabilityStatus === "available"
  );
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

function readStringArray(
  source: Record<string, unknown>,
  key: string
): readonly string[] {
  const value = source[key];

  return Array.isArray(value)
    ? Object.freeze(value.filter((item): item is string => typeof item === "string"))
    : Object.freeze([]);
}
