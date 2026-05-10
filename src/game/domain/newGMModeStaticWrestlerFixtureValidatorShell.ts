import {
  type NewGMModeStaticWrestlerFixture,
  type NewGMModeStaticWrestlerFixtureCatalogShell,
  createNewGMModeStaticWrestlerFixtureCatalogShell
} from "./newGMModeStaticWrestlerFixtureCatalogShell.ts";
import { createNewGMModeWrestlerDataShapeContractShell } from "./newGMModeWrestlerDataShapeContractShell.ts";

export type NewGMModeStaticWrestlerFixtureValidationIssueCode =
  | "fixture-entry-not-object"
  | "missing-wrestler-id"
  | "duplicate-wrestler-id"
  | "unstable-wrestler-id-order"
  | "missing-slug"
  | "slug-does-not-match-wrestler-id"
  | "missing-display-name"
  | "missing-gender-division-eligibility"
  | "invalid-gender-division-eligibility"
  | "missing-role-category-tags"
  | "missing-brand-eligibility"
  | "invalid-brand-eligibility"
  | "missing-availability-status"
  | "invalid-availability-status"
  | "missing-draft-eligibility"
  | "invalid-draft-eligibility"
  | "missing-championship-division-eligibility"
  | "invalid-championship-division-eligibility"
  | "missing-placeholder-attributes"
  | "missing-popularity-star-power-placeholder"
  | "missing-in-ring-ability-placeholder"
  | "missing-stamina-durability-placeholder"
  | "missing-promo-charisma-placeholder"
  | "missing-tag-team-compatibility-placeholder"
  | "invalid-future-persistence-compatibility-marker"
  | "fixture-created-roster-state"
  | "fixture-created-talent-pool-state"
  | "fixture-created-draft-board-state"
  | "fixture-created-gameplay-state";

export type NewGMModeStaticWrestlerFixtureValidationBlockedReason =
  | "static-wrestler-fixture-validation-only"
  | "external-wrestler-data-loading-not-implemented"
  | "wrestler-record-creation-not-implemented"
  | "talent-pool-creation-not-implemented"
  | "draft-board-creation-not-implemented"
  | "draft-pick-validation-not-implemented"
  | "draft-execution-not-implemented"
  | "roster-assignment-not-implemented"
  | "championship-division-assignment-not-implemented"
  | "gameplay-start-not-implemented"
  | "gameplay-payload-persistence-not-implemented"
  | "ui-wiring-not-implemented";

export interface NewGMModeStaticWrestlerFixtureValidationIssue {
  readonly fixtureIndex: number;
  readonly wrestlerId?: string;
  readonly fieldId: string;
  readonly issue: NewGMModeStaticWrestlerFixtureValidationIssueCode;
}

export interface NewGMModeStaticWrestlerFixtureValidatorInput {
  readonly fixtures?: readonly unknown[];
  readonly sourceCatalogId?: string;
}

export interface NewGMModeStaticWrestlerFixtureValidatorShell {
  readonly status: "diagnostics-only";
  readonly validatorId: "new-gm-mode-static-wrestler-fixture-validator-v0.1";
  readonly sourceCatalogId: string;
  readonly deterministicOrdering: true;
  readonly fixtureValidationStatus: "structurally-valid" | "blocked";
  readonly fixturesInspected: number;
  readonly validFixtureCount: number;
  readonly invalidFixtureCount: number;
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
  readonly wrestlerDataCreated: false;
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

const BLOCKED_REASONS: readonly NewGMModeStaticWrestlerFixtureValidationBlockedReason[] =
  Object.freeze([
    "static-wrestler-fixture-validation-only",
    "external-wrestler-data-loading-not-implemented",
    "wrestler-record-creation-not-implemented",
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

const GENDER_DIVISION_ELIGIBILITY = Object.freeze([
  "mens-division",
  "womens-division"
]);

const BRAND_ELIGIBILITY = Object.freeze([
  "brand-alpha",
  "brand-beta",
  "brand-cross-eligible"
]);

const AVAILABILITY_STATUSES = Object.freeze([
  "available",
  "unavailable-fixture-example"
]);

const DRAFT_BLOCKED_REASONS = Object.freeze([
  "fixture-available-for-draft-validation",
  "fixture-unavailable-example-only"
]);

const CHAMPIONSHIP_DIVISION_ELIGIBILITY = Object.freeze([
  "world-title",
  "womens-world-title",
  "midcard-title",
  "tag-team-title"
]);

export function createNewGMModeStaticWrestlerFixtureValidatorShell(
  input: NewGMModeStaticWrestlerFixtureValidatorInput = {}
): NewGMModeStaticWrestlerFixtureValidatorShell {
  const catalog = createNewGMModeStaticWrestlerFixtureCatalogShell();
  const dataShapeContract = createNewGMModeWrestlerDataShapeContractShell();
  const fixtures = input.fixtures ?? catalog.fixtures;
  const validationIssues = collectValidationIssues(fixtures);
  const invalidFixtureIndexes = new Set(
    validationIssues.map((issue) => issue.fixtureIndex)
  );
  const invalidFixtureCount = invalidFixtureIndexes.size;

  return Object.freeze({
    status: "diagnostics-only",
    validatorId: "new-gm-mode-static-wrestler-fixture-validator-v0.1",
    sourceCatalogId: input.sourceCatalogId ?? catalog.staticWrestlerFixtureCatalogId,
    deterministicOrdering: true,
    fixtureValidationStatus:
      validationIssues.length === 0 ? "structurally-valid" : "blocked",
    fixturesInspected: fixtures.length,
    validFixtureCount: fixtures.length - invalidFixtureCount,
    invalidFixtureCount,
    validationIssues,
    blockedReasons: BLOCKED_REASONS,
    staticWrestlerFixtureCatalogAvailable:
      typeof createNewGMModeStaticWrestlerFixtureCatalogShell === "function",
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
    wrestlerDataCreated: false,
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

function collectValidationIssues(
  fixtures: readonly unknown[]
): readonly NewGMModeStaticWrestlerFixtureValidationIssue[] {
  const issues: NewGMModeStaticWrestlerFixtureValidationIssue[] = [];
  const seenWrestlerIds = new Set<string>();

  fixtures.forEach((fixture, fixtureIndex) => {
    if (!isRecord(fixture)) {
      issues.push(createIssue(fixtureIndex, undefined, "fixture", "fixture-entry-not-object"));
      return;
    }

    const wrestlerId = readString(fixture, "wrestlerId");

    if (!wrestlerId) {
      issues.push(createIssue(fixtureIndex, undefined, "wrestlerId", "missing-wrestler-id"));
    } else {
      if (seenWrestlerIds.has(wrestlerId)) {
        issues.push(createIssue(fixtureIndex, wrestlerId, "wrestlerId", "duplicate-wrestler-id"));
      }
      seenWrestlerIds.add(wrestlerId);

      const expectedPrefix = `fixture-wrestler-${String(fixtureIndex + 1).padStart(3, "0")}-`;
      if (!wrestlerId.startsWith(expectedPrefix)) {
        issues.push(createIssue(fixtureIndex, wrestlerId, "wrestlerId", "unstable-wrestler-id-order"));
      }
    }

    validateStringField(issues, fixture, fixtureIndex, wrestlerId, "slug", "missing-slug");
    if (readString(fixture, "slug") && wrestlerId && readString(fixture, "slug") !== wrestlerId) {
      issues.push(createIssue(fixtureIndex, wrestlerId, "slug", "slug-does-not-match-wrestler-id"));
    }

    validateStringField(
      issues,
      fixture,
      fixtureIndex,
      wrestlerId,
      "displayName",
      "missing-display-name"
    );
    validateStringArrayField(
      issues,
      fixture,
      fixtureIndex,
      wrestlerId,
      "genderDivisionEligibility",
      GENDER_DIVISION_ELIGIBILITY,
      "missing-gender-division-eligibility",
      "invalid-gender-division-eligibility"
    );
    validateStringArrayField(
      issues,
      fixture,
      fixtureIndex,
      wrestlerId,
      "roleCategoryTags",
      undefined,
      "missing-role-category-tags",
      "missing-role-category-tags"
    );
    validateStringArrayField(
      issues,
      fixture,
      fixtureIndex,
      wrestlerId,
      "brandEligibility",
      BRAND_ELIGIBILITY,
      "missing-brand-eligibility",
      "invalid-brand-eligibility"
    );
    validateStringEnumField(
      issues,
      fixture,
      fixtureIndex,
      wrestlerId,
      "availabilityStatus",
      AVAILABILITY_STATUSES,
      "missing-availability-status",
      "invalid-availability-status"
    );
    validateDraftEligibility(issues, fixture, fixtureIndex, wrestlerId);
    validateStringArrayField(
      issues,
      fixture,
      fixtureIndex,
      wrestlerId,
      "championshipDivisionEligibility",
      CHAMPIONSHIP_DIVISION_ELIGIBILITY,
      "missing-championship-division-eligibility",
      "invalid-championship-division-eligibility"
    );
    validatePlaceholderAttributes(issues, fixture, fixtureIndex, wrestlerId);

    if (
      fixture.futurePersistenceCompatibilityMarker !==
      "fixture-only-future-persistence-compatible"
    ) {
      issues.push(
        createIssue(
          fixtureIndex,
          wrestlerId,
          "futurePersistenceCompatibilityMarker",
          "invalid-future-persistence-compatibility-marker"
        )
      );
    }

    validateFalseFlag(
      issues,
      fixture,
      fixtureIndex,
      wrestlerId,
      "createsRosterState",
      "fixture-created-roster-state"
    );
    validateFalseFlag(
      issues,
      fixture,
      fixtureIndex,
      wrestlerId,
      "createsTalentPoolState",
      "fixture-created-talent-pool-state"
    );
    validateFalseFlag(
      issues,
      fixture,
      fixtureIndex,
      wrestlerId,
      "createsDraftBoardState",
      "fixture-created-draft-board-state"
    );
    validateFalseFlag(
      issues,
      fixture,
      fixtureIndex,
      wrestlerId,
      "createsGameplayState",
      "fixture-created-gameplay-state"
    );
  });

  return Object.freeze(issues);
}

function validateStringField(
  issues: NewGMModeStaticWrestlerFixtureValidationIssue[],
  fixture: Record<string, unknown>,
  fixtureIndex: number,
  wrestlerId: string | undefined,
  fieldId: string,
  issue: NewGMModeStaticWrestlerFixtureValidationIssueCode
): void {
  if (!readString(fixture, fieldId)) {
    issues.push(createIssue(fixtureIndex, wrestlerId, fieldId, issue));
  }
}

function validateStringArrayField(
  issues: NewGMModeStaticWrestlerFixtureValidationIssue[],
  fixture: Record<string, unknown>,
  fixtureIndex: number,
  wrestlerId: string | undefined,
  fieldId: string,
  allowedValues: readonly string[] | undefined,
  missingIssue: NewGMModeStaticWrestlerFixtureValidationIssueCode,
  invalidIssue: NewGMModeStaticWrestlerFixtureValidationIssueCode
): void {
  const fieldValue = fixture[fieldId];

  if (
    !Array.isArray(fieldValue) ||
    fieldValue.length === 0 ||
    !fieldValue.every((value) => typeof value === "string" && value.length > 0)
  ) {
    issues.push(createIssue(fixtureIndex, wrestlerId, fieldId, missingIssue));
    return;
  }

  if (
    allowedValues &&
    !fieldValue.every((value) => allowedValues.includes(value))
  ) {
    issues.push(createIssue(fixtureIndex, wrestlerId, fieldId, invalidIssue));
  }
}

function validateStringEnumField(
  issues: NewGMModeStaticWrestlerFixtureValidationIssue[],
  fixture: Record<string, unknown>,
  fixtureIndex: number,
  wrestlerId: string | undefined,
  fieldId: string,
  allowedValues: readonly string[],
  missingIssue: NewGMModeStaticWrestlerFixtureValidationIssueCode,
  invalidIssue: NewGMModeStaticWrestlerFixtureValidationIssueCode
): void {
  const fieldValue = readString(fixture, fieldId);

  if (!fieldValue) {
    issues.push(createIssue(fixtureIndex, wrestlerId, fieldId, missingIssue));
    return;
  }

  if (!allowedValues.includes(fieldValue)) {
    issues.push(createIssue(fixtureIndex, wrestlerId, fieldId, invalidIssue));
  }
}

function validateDraftEligibility(
  issues: NewGMModeStaticWrestlerFixtureValidationIssue[],
  fixture: Record<string, unknown>,
  fixtureIndex: number,
  wrestlerId: string | undefined
): void {
  if (!isRecord(fixture.draftEligibility)) {
    issues.push(createIssue(fixtureIndex, wrestlerId, "draftEligibility", "missing-draft-eligibility"));
    return;
  }

  if (
    typeof fixture.draftEligibility.eligible !== "boolean" ||
    !DRAFT_BLOCKED_REASONS.includes(readString(fixture.draftEligibility, "blockedReason") ?? "")
  ) {
    issues.push(createIssue(fixtureIndex, wrestlerId, "draftEligibility", "invalid-draft-eligibility"));
  }
}

function validatePlaceholderAttributes(
  issues: NewGMModeStaticWrestlerFixtureValidationIssue[],
  fixture: Record<string, unknown>,
  fixtureIndex: number,
  wrestlerId: string | undefined
): void {
  if (!isRecord(fixture.placeholderAttributes)) {
    issues.push(
      createIssue(
        fixtureIndex,
        wrestlerId,
        "placeholderAttributes",
        "missing-placeholder-attributes"
      )
    );
    return;
  }

  validateStringField(
    issues,
    fixture.placeholderAttributes,
    fixtureIndex,
    wrestlerId,
    "popularityStarPower",
    "missing-popularity-star-power-placeholder"
  );
  validateStringField(
    issues,
    fixture.placeholderAttributes,
    fixtureIndex,
    wrestlerId,
    "inRingAbility",
    "missing-in-ring-ability-placeholder"
  );
  validateStringField(
    issues,
    fixture.placeholderAttributes,
    fixtureIndex,
    wrestlerId,
    "staminaDurability",
    "missing-stamina-durability-placeholder"
  );
  validateStringField(
    issues,
    fixture.placeholderAttributes,
    fixtureIndex,
    wrestlerId,
    "promoCharisma",
    "missing-promo-charisma-placeholder"
  );
  validateStringField(
    issues,
    fixture.placeholderAttributes,
    fixtureIndex,
    wrestlerId,
    "tagTeamCompatibility",
    "missing-tag-team-compatibility-placeholder"
  );
}

function validateFalseFlag(
  issues: NewGMModeStaticWrestlerFixtureValidationIssue[],
  fixture: Record<string, unknown>,
  fixtureIndex: number,
  wrestlerId: string | undefined,
  fieldId: keyof Pick<
    NewGMModeStaticWrestlerFixture,
    | "createsRosterState"
    | "createsTalentPoolState"
    | "createsDraftBoardState"
    | "createsGameplayState"
  >,
  issue: NewGMModeStaticWrestlerFixtureValidationIssueCode
): void {
  if (fixture[fieldId] !== false) {
    issues.push(createIssue(fixtureIndex, wrestlerId, fieldId, issue));
  }
}

function createIssue(
  fixtureIndex: number,
  wrestlerId: string | undefined,
  fieldId: string,
  issue: NewGMModeStaticWrestlerFixtureValidationIssueCode
): NewGMModeStaticWrestlerFixtureValidationIssue {
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
