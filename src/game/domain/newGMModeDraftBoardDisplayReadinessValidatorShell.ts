import { createNewGMModeDraftBoardEligibilityInputSummaryShell } from "./newGMModeDraftBoardEligibilityInputSummaryShell.ts";
import {
  type NewGMModeDraftBoardDisplayBlockedReason,
  type NewGMModeDraftBoardDisplayCapabilityFlags,
  createNewGMModeDraftBoardDisplayContractShell
} from "./newGMModeDraftBoardDisplayContractShell.ts";
import { createNewGMModeDraftBoardOrderingSummaryShell } from "./newGMModeDraftBoardOrderingSummaryShell.ts";
import { createNewGMModeDraftBoardOrderingValidatorShell } from "./newGMModeDraftBoardOrderingValidatorShell.ts";
import { createNewGMModeStaticWrestlerFixtureCatalogShell } from "./newGMModeStaticWrestlerFixtureCatalogShell.ts";
import {
  NEW_GM_MODE_TALENT_POOL_MINIMUM_ELIGIBLE_TALENT_COUNT
} from "./newGMModeTalentPoolEligibilityRuleContractShell.ts";
import {
  type NewGMModeTalentPoolReadinessAggregatorInput,
  createNewGMModeTalentPoolReadinessAggregatorShell
} from "./newGMModeTalentPoolReadinessAggregatorShell.ts";

export type NewGMModeDraftBoardDisplayReadinessPhaseId =
  | "draft-board-ordering-not-ready"
  | "insufficient-display-ready-entries"
  | "duplicate-display-wrestler-ids"
  | "invalid-display-fields"
  | "structurally-ready-display-blocked";

export type NewGMModeDraftBoardDisplayReadinessIssueCode =
  | "draft-board-ordering-summary-not-structurally-satisfied"
  | "minimum-display-ready-entry-count-not-satisfied"
  | "missing-display-ready-eligible-entries"
  | "duplicate-display-wrestler-id"
  | "missing-display-name-visibility"
  | "missing-brand-eligibility-visibility"
  | "missing-draft-eligibility-visibility"
  | "missing-availability-status-visibility"
  | "missing-gender-division-eligibility-visibility"
  | "missing-role-category-tag-visibility"
  | "missing-championship-division-eligibility-visibility"
  | "missing-placeholder-attributes-visibility"
  | "ui-rendering-not-allowed";

export interface NewGMModeDraftBoardDisplayReadinessIssue {
  readonly fixtureIndex: number;
  readonly wrestlerId?: string;
  readonly fieldId: string;
  readonly issue: NewGMModeDraftBoardDisplayReadinessIssueCode;
}

export interface NewGMModeDraftBoardDisplayReadyEntrySummary {
  readonly displayOrderIndex: number;
  readonly fixtureIndex: number;
  readonly wrestlerId: string;
  readonly displayName: string;
  readonly brandEligibility: readonly string[];
  readonly draftEligibilityVisible: true;
  readonly availabilityStatus: string;
  readonly genderDivisionEligibility: readonly string[];
  readonly roleCategoryTags: readonly string[];
  readonly championshipDivisionEligibility: readonly string[];
  readonly placeholderAttributes: {
    readonly popularityStarPower: string;
    readonly inRingAbility: string;
    readonly staminaDurability: string;
    readonly promoCharisma: string;
    readonly tagTeamCompatibility: string;
  };
}

export interface NewGMModeDraftBoardDisplayReadinessValidatorShell {
  readonly status: "diagnostics-only";
  readonly draftBoardDisplayReadinessValidatorId: "new-gm-mode-draft-board-display-readiness-validator-v0.1";
  readonly version: "0.1";
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly deterministicOrdering: true;
  readonly displayReadinessValidationOnly: true;
  readonly draftBoardOrderingSummaryAvailable: true;
  readonly draftBoardOrderingValidatorAvailable: true;
  readonly draftBoardEligibilityInputSummaryAvailable: true;
  readonly talentPoolReadinessAvailable: true;
  readonly displayReadinessPhase: NewGMModeDraftBoardDisplayReadinessPhaseId;
  readonly futureDraftBoardDisplayFieldsStructurallySatisfied: boolean;
  readonly displayReadinessSummary: {
    readonly totalFixtureCount: number;
    readonly displayReadyEligibleEntryCount: number;
    readonly excludedIneligibleCount: number;
    readonly minimumEligibleRequirement: 8;
    readonly minimumEligibleRequirementSatisfied: boolean;
    readonly validationIssueCount: number;
    readonly actualDraftBoardCreationReady: false;
    readonly draftBoardUiRenderingReady: false;
  };
  readonly deterministicDisplayFieldReadinessSummary: {
    readonly displayOrderingSource: "draft-board-ordering-validator";
    readonly displayFieldIds: readonly [
      "displayName",
      "brandEligibility",
      "draftEligibility",
      "availabilityStatus",
      "genderDivisionEligibility",
      "roleCategoryTags",
      "championshipDivisionEligibility",
      "placeholderAttributes"
    ];
    readonly uiRenderingCreated: false;
    readonly playerFacingDraftBoardCreated: false;
  };
  readonly displayReadyEntries: readonly NewGMModeDraftBoardDisplayReadyEntrySummary[];
  readonly excludedIneligibleFixtures: readonly {
    readonly fixtureIndex: number;
    readonly wrestlerId: string;
    readonly exclusionReasons: readonly string[];
  }[];
  readonly displayReadinessIssues: readonly NewGMModeDraftBoardDisplayReadinessIssue[];
  readonly blockedReasons: readonly NewGMModeDraftBoardDisplayBlockedReason[];
  readonly capabilityFlags: NewGMModeDraftBoardDisplayCapabilityFlags;
  readonly actualDraftBoardCreationAvailable: false;
  readonly actualDraftBoardDisplayAvailable: false;
  readonly draftBoardCreationAvailable: false;
  readonly draftBoardUiRenderingAvailable: false;
  readonly playerFacingDraftBoardAvailable: false;
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

export function createNewGMModeDraftBoardDisplayReadinessValidatorShell(
  input: NewGMModeTalentPoolReadinessAggregatorInput = {}
): NewGMModeDraftBoardDisplayReadinessValidatorShell {
  const catalog = createNewGMModeStaticWrestlerFixtureCatalogShell();
  const fixtures = input.fixtures ?? catalog.fixtures;
  const displayContract = createNewGMModeDraftBoardDisplayContractShell();
  const orderingSummary = createNewGMModeDraftBoardOrderingSummaryShell(input);
  const orderingValidator = createNewGMModeDraftBoardOrderingValidatorShell(input);
  const draftBoardInputSummary =
    createNewGMModeDraftBoardEligibilityInputSummaryShell(input);
  const talentPoolReadiness =
    createNewGMModeTalentPoolReadinessAggregatorShell(input);
  const displayIssues = collectDisplayReadinessIssues(
    fixtures,
    orderingValidator.eligibleOrderedEntries,
    orderingSummary.futureDraftBoardOrderingStructurallySatisfied
  );
  const displayReadyEntries = collectDisplayReadyEntries(
    fixtures,
    orderingValidator.eligibleOrderedEntries,
    displayIssues
  );
  const minimumEligibleRequirementSatisfied =
    displayReadyEntries.length >= NEW_GM_MODE_TALENT_POOL_MINIMUM_ELIGIBLE_TALENT_COUNT;
  const finalDisplayIssues = minimumEligibleRequirementSatisfied
    ? displayIssues
    : Object.freeze([
        ...displayIssues,
        createIssue(
          orderingValidator.orderingSummary.totalFixtureCount,
          undefined,
          "minimumEligibleRequirement",
          "minimum-display-ready-entry-count-not-satisfied"
        )
      ]);
  const futureDraftBoardDisplayFieldsStructurallySatisfied =
    orderingSummary.futureDraftBoardOrderingStructurallySatisfied &&
    finalDisplayIssues.length === 0;

  return Object.freeze({
    status: "diagnostics-only",
    draftBoardDisplayReadinessValidatorId:
      "new-gm-mode-draft-board-display-readiness-validator-v0.1",
    version: "0.1",
    diagnosticsOnly: true,
    playerFacing: false,
    gameplayAffecting: false,
    deterministicOrdering: true,
    displayReadinessValidationOnly: true,
    draftBoardOrderingSummaryAvailable:
      orderingSummary.draftBoardOrderingSummaryId ===
      "new-gm-mode-draft-board-ordering-summary-v0.1",
    draftBoardOrderingValidatorAvailable:
      orderingValidator.draftBoardOrderingValidatorId ===
      "new-gm-mode-draft-board-ordering-validator-v0.1",
    draftBoardEligibilityInputSummaryAvailable:
      draftBoardInputSummary.draftBoardInputContractAvailable,
    talentPoolReadinessAvailable:
      talentPoolReadiness.talentPoolReadinessAggregatorId ===
      "new-gm-mode-talent-pool-readiness-aggregator-v0.1",
    displayReadinessPhase: determineDisplayReadinessPhase(
      orderingSummary.futureDraftBoardOrderingStructurallySatisfied,
      minimumEligibleRequirementSatisfied,
      finalDisplayIssues
    ),
    futureDraftBoardDisplayFieldsStructurallySatisfied,
    displayReadinessSummary: Object.freeze({
      totalFixtureCount: orderingValidator.orderingSummary.totalFixtureCount,
      displayReadyEligibleEntryCount: displayReadyEntries.length,
      excludedIneligibleCount:
        orderingValidator.orderingSummary.excludedIneligibleCount,
      minimumEligibleRequirement:
        NEW_GM_MODE_TALENT_POOL_MINIMUM_ELIGIBLE_TALENT_COUNT,
      minimumEligibleRequirementSatisfied,
      validationIssueCount: finalDisplayIssues.length,
      actualDraftBoardCreationReady: false,
      draftBoardUiRenderingReady: false
    }),
    deterministicDisplayFieldReadinessSummary: Object.freeze({
      displayOrderingSource: "draft-board-ordering-validator",
      displayFieldIds: Object.freeze([
        "displayName",
        "brandEligibility",
        "draftEligibility",
        "availabilityStatus",
        "genderDivisionEligibility",
        "roleCategoryTags",
        "championshipDivisionEligibility",
        "placeholderAttributes"
      ]),
      uiRenderingCreated: false,
      playerFacingDraftBoardCreated: false
    }),
    displayReadyEntries: Object.freeze(displayReadyEntries),
    excludedIneligibleFixtures:
      orderingValidator.excludedIneligibleFixtures,
    displayReadinessIssues: finalDisplayIssues,
    blockedReasons: displayContract.blockedReasons,
    capabilityFlags: displayContract.capabilityFlags,
    actualDraftBoardCreationAvailable: false,
    actualDraftBoardDisplayAvailable: false,
    draftBoardCreationAvailable: false,
    draftBoardUiRenderingAvailable: false,
    playerFacingDraftBoardAvailable: false,
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

function collectDisplayReadinessIssues(
  fixtures: readonly unknown[],
  orderedEntries: readonly { readonly fixtureIndex: number; readonly wrestlerId: string }[],
  orderingStructurallySatisfied: boolean
): readonly NewGMModeDraftBoardDisplayReadinessIssue[] {
  const issues: NewGMModeDraftBoardDisplayReadinessIssue[] = [];
  const displayIdsSeen = new Set<string>();
  const checkedFixtureIndexes = new Set<number>();

  orderedEntries.forEach((entry) => {
    const fixture = fixtures[entry.fixtureIndex];
    checkedFixtureIndexes.add(entry.fixtureIndex);

    if (!isRecord(fixture)) {
      issues.push(
        createIssue(
          entry.fixtureIndex,
          entry.wrestlerId,
          "fixture",
          "missing-display-ready-eligible-entries"
        )
      );
      return;
    }

    if (displayIdsSeen.has(entry.wrestlerId)) {
      issues.push(
        createIssue(
          entry.fixtureIndex,
          entry.wrestlerId,
          "wrestlerId",
          "duplicate-display-wrestler-id"
        )
      );
    } else {
      displayIdsSeen.add(entry.wrestlerId);
    }

    validateDisplayFields(issues, fixture, entry.fixtureIndex, entry.wrestlerId);
  });

  fixtures.forEach((fixture, fixtureIndex) => {
    if (
      checkedFixtureIndexes.has(fixtureIndex) ||
      !isRecord(fixture) ||
      !isEligibleFixtureLike(fixture)
    ) {
      return;
    }

    const wrestlerId = readString(fixture, "wrestlerId");
    if (wrestlerId) {
      validateDisplayFields(issues, fixture, fixtureIndex, wrestlerId);
    }
  });

  collectDuplicateEligibleFixtureIssues(fixtures, issues);

  if (!orderingStructurallySatisfied) {
    issues.push(
      createIssue(
        fixtures.length,
        undefined,
        "draftBoardOrderingSummary",
        "draft-board-ordering-summary-not-structurally-satisfied"
      )
    );
  }

  return Object.freeze(issues);
}

function collectDisplayReadyEntries(
  fixtures: readonly unknown[],
  orderedEntries: readonly {
    readonly orderIndex: number;
    readonly fixtureIndex: number;
    readonly wrestlerId: string;
  }[],
  displayIssues: readonly NewGMModeDraftBoardDisplayReadinessIssue[]
): readonly NewGMModeDraftBoardDisplayReadyEntrySummary[] {
  const issueIndexes = new Set(
    displayIssues
      .filter((issue) => issue.fixtureIndex < fixtures.length)
      .map((issue) => issue.fixtureIndex)
  );

  return Object.freeze(
    orderedEntries
      .filter((entry) => !issueIndexes.has(entry.fixtureIndex))
      .map((entry) => {
        const fixture = fixtures[entry.fixtureIndex];
        const record = isRecord(fixture) ? fixture : {};

        return Object.freeze({
          displayOrderIndex: entry.orderIndex,
          fixtureIndex: entry.fixtureIndex,
          wrestlerId: entry.wrestlerId,
          displayName: readString(record, "displayName") ?? entry.wrestlerId,
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
          ),
          placeholderAttributes: readPlaceholderAttributes(record)
        });
      })
  );
}

function validateDisplayFields(
  issues: NewGMModeDraftBoardDisplayReadinessIssue[],
  fixture: Record<string, unknown>,
  fixtureIndex: number,
  wrestlerId: string
): void {
  if (!readString(fixture, "displayName")) {
    issues.push(
      createIssue(
        fixtureIndex,
        wrestlerId,
        "displayName",
        "missing-display-name-visibility"
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

  if (!hasVisiblePlaceholderAttributes(fixture)) {
    issues.push(
      createIssue(
        fixtureIndex,
        wrestlerId,
        "placeholderAttributes",
        "missing-placeholder-attributes-visibility"
      )
    );
  }
}

function collectDuplicateEligibleFixtureIssues(
  fixtures: readonly unknown[],
  issues: NewGMModeDraftBoardDisplayReadinessIssue[]
): void {
  const eligibleIdsSeen = new Set<string>();

  fixtures.forEach((fixture, fixtureIndex) => {
    if (!isRecord(fixture)) {
      return;
    }

    const wrestlerId = readString(fixture, "wrestlerId");
    if (
      typeof wrestlerId !== "string" ||
      !isEligibleFixtureLike(fixture)
    ) {
      return;
    }

    if (eligibleIdsSeen.has(wrestlerId)) {
      issues.push(
        createIssue(
          fixtureIndex,
          wrestlerId,
          "wrestlerId",
          "duplicate-display-wrestler-id"
        )
      );
    } else {
      eligibleIdsSeen.add(wrestlerId);
    }
  });
}

function isEligibleFixtureLike(fixture: Record<string, unknown>): boolean {
  return (
    isRecord(fixture.draftEligibility) &&
    fixture.draftEligibility.eligible === true &&
    fixture.availabilityStatus === "available"
  );
}

function determineDisplayReadinessPhase(
  orderingStructurallySatisfied: boolean,
  minimumEligibleRequirementSatisfied: boolean,
  issues: readonly NewGMModeDraftBoardDisplayReadinessIssue[]
): NewGMModeDraftBoardDisplayReadinessPhaseId {
  if (!minimumEligibleRequirementSatisfied) {
    return "insufficient-display-ready-entries";
  }

  if (issues.some((issue) => issue.issue === "duplicate-display-wrestler-id")) {
    return "duplicate-display-wrestler-ids";
  }

  if (
    issues.some(
      (issue) =>
        issue.issue !==
        "draft-board-ordering-summary-not-structurally-satisfied"
    )
  ) {
    return "invalid-display-fields";
  }

  if (!orderingStructurallySatisfied) {
    return "draft-board-ordering-not-ready";
  }

  return "structurally-ready-display-blocked";
}

function validateVisibleArray(
  issues: NewGMModeDraftBoardDisplayReadinessIssue[],
  fixture: Record<string, unknown>,
  fixtureIndex: number,
  wrestlerId: string,
  fieldId: string,
  issue: NewGMModeDraftBoardDisplayReadinessIssueCode
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
  issue: NewGMModeDraftBoardDisplayReadinessIssueCode
): NewGMModeDraftBoardDisplayReadinessIssue {
  return Object.freeze({
    fixtureIndex,
    ...(wrestlerId ? { wrestlerId } : {}),
    fieldId,
    issue
  });
}

function hasVisiblePlaceholderAttributes(
  fixture: Record<string, unknown>
): boolean {
  const placeholderAttributes = fixture.placeholderAttributes;

  return (
    isRecord(placeholderAttributes) &&
    Boolean(readString(placeholderAttributes, "popularityStarPower")) &&
    Boolean(readString(placeholderAttributes, "inRingAbility")) &&
    Boolean(readString(placeholderAttributes, "staminaDurability")) &&
    Boolean(readString(placeholderAttributes, "promoCharisma")) &&
    Boolean(readString(placeholderAttributes, "tagTeamCompatibility"))
  );
}

function readPlaceholderAttributes(
  fixture: Record<string, unknown>
): NewGMModeDraftBoardDisplayReadyEntrySummary["placeholderAttributes"] {
  const placeholderAttributes = fixture.placeholderAttributes;
  const record = isRecord(placeholderAttributes) ? placeholderAttributes : {};

  return Object.freeze({
    popularityStarPower: readString(record, "popularityStarPower") ?? "missing",
    inRingAbility: readString(record, "inRingAbility") ?? "missing",
    staminaDurability: readString(record, "staminaDurability") ?? "missing",
    promoCharisma: readString(record, "promoCharisma") ?? "missing",
    tagTeamCompatibility: readString(record, "tagTeamCompatibility") ?? "missing"
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

function readStringArray(
  source: Record<string, unknown>,
  key: string
): readonly string[] {
  const value = source[key];

  return Array.isArray(value)
    ? Object.freeze(value.filter((item): item is string => typeof item === "string"))
    : Object.freeze([]);
}
