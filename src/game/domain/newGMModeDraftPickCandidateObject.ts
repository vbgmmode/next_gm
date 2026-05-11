import {
  type NewGMModeStaticWrestlerFixture,
  createNewGMModeStaticWrestlerFixtureCatalogShell
} from "./newGMModeStaticWrestlerFixtureCatalogShell.ts";

export type NewGMModeDraftPickCandidateEligibilityStatus =
  | "eligible"
  | "ineligible";

export type NewGMModeDraftPickCandidateReadinessReasonId =
  | "source-fixture-identity-present"
  | "source-fixture-display-ready"
  | "source-fixture-draft-eligible"
  | "source-fixture-available"
  | "source-fixture-not-draft-eligible"
  | "source-fixture-not-available";

export type NewGMModeDraftPickCandidateDisplayReadinessMarker =
  | "display-ready"
  | "display-blocked";

export interface NewGMModeDraftPickCandidateCapabilityFlags {
  readonly canSelectCandidate: false;
  readonly canValidateAsDraftPick: false;
  readonly canExecuteDraftPick: false;
  readonly canCreateDraftState: false;
  readonly canAssignToRoster: false;
  readonly canCreateOrMutateRoster: false;
  readonly canAssignTitleOrDivision: false;
  readonly canCreateMatchShowOrWeekState: false;
  readonly canStartGameplay: false;
  readonly canUnlockWeekOne: false;
  readonly canPersistGameplayPayload: false;
  readonly canWriteDatabase: false;
  readonly canCreateUserInterface: false;
  readonly canCreateGeneratedText: false;
  readonly canUseGenAI: false;
}

export interface NewGMModeDraftPickCandidateObject {
  readonly candidateId: string;
  readonly version: "0.1";
  readonly domainObject: true;
  readonly diagnosticsOnly: false;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly mutable: false;
  readonly sourceFixtureReference: {
    readonly sourceCatalogId: "new-gm-mode-static-wrestler-fixture-catalog-v0.1";
    readonly fixtureIndex: number;
    readonly fixtureId: string;
    readonly fixtureSlug: string;
  };
  readonly wrestlerIdentityReference: {
    readonly wrestlerId: string;
    readonly slug: string;
  };
  readonly eligibilityStatus: NewGMModeDraftPickCandidateEligibilityStatus;
  readonly readinessReasonIds: readonly NewGMModeDraftPickCandidateReadinessReasonId[];
  readonly displayReadinessMarker: NewGMModeDraftPickCandidateDisplayReadinessMarker;
  readonly capabilityFlags: NewGMModeDraftPickCandidateCapabilityFlags;
}

export interface NewGMModeDraftPickCandidateObjectSet {
  readonly draftPickCandidateObjectSetId: "new-gm-mode-draft-pick-candidate-object-set-v0.1";
  readonly version: "0.1";
  readonly domainObject: true;
  readonly diagnosticsOnly: false;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly mutable: false;
  readonly sourceCatalogId: "new-gm-mode-static-wrestler-fixture-catalog-v0.1";
  readonly deterministicOrdering: true;
  readonly candidates: readonly NewGMModeDraftPickCandidateObject[];
  readonly candidateSummary: {
    readonly totalCandidateCount: number;
    readonly eligibleCandidateCount: number;
    readonly ineligibleCandidateCount: number;
    readonly expectedTotalCandidateCount: number;
    readonly expectedEligibleCandidateCount: number;
    readonly expectedIneligibleCandidateCount: number;
  };
  readonly capabilityFlags: NewGMModeDraftPickCandidateCapabilityFlags;
}

export const NEW_GM_MODE_DRAFT_PICK_CANDIDATE_CAPABILITY_FLAGS: NewGMModeDraftPickCandidateCapabilityFlags =
  Object.freeze({
    canSelectCandidate: false,
    canValidateAsDraftPick: false,
    canExecuteDraftPick: false,
    canCreateDraftState: false,
    canAssignToRoster: false,
    canCreateOrMutateRoster: false,
    canAssignTitleOrDivision: false,
    canCreateMatchShowOrWeekState: false,
    canStartGameplay: false,
    canUnlockWeekOne: false,
    canPersistGameplayPayload: false,
    canWriteDatabase: false,
    canCreateUserInterface: false,
    canCreateGeneratedText: false,
    canUseGenAI: false
  });

export function createNewGMModeDraftPickCandidateObjects(): NewGMModeDraftPickCandidateObjectSet {
  const catalog = createNewGMModeStaticWrestlerFixtureCatalogShell();
  const candidates = catalog.fixtures.map((fixture, fixtureIndex) =>
    createCandidateFromFixture(
      catalog.staticWrestlerFixtureCatalogId,
      fixture,
      fixtureIndex
    )
  );
  const eligibleCandidateCount = candidates.filter(
    (candidate) => candidate.eligibilityStatus === "eligible"
  ).length;
  const ineligibleCandidateCount = candidates.length - eligibleCandidateCount;

  return Object.freeze({
    draftPickCandidateObjectSetId:
      "new-gm-mode-draft-pick-candidate-object-set-v0.1",
    version: "0.1",
    domainObject: true,
    diagnosticsOnly: false,
    playerFacing: false,
    gameplayAffecting: false,
    mutable: false,
    sourceCatalogId: catalog.staticWrestlerFixtureCatalogId,
    deterministicOrdering: true,
    candidates: Object.freeze(candidates),
    candidateSummary: Object.freeze({
      totalCandidateCount: candidates.length,
      eligibleCandidateCount,
      ineligibleCandidateCount,
      expectedTotalCandidateCount: candidates.length,
      expectedEligibleCandidateCount: eligibleCandidateCount,
      expectedIneligibleCandidateCount: ineligibleCandidateCount
    }),
    capabilityFlags: NEW_GM_MODE_DRAFT_PICK_CANDIDATE_CAPABILITY_FLAGS
  });
}

function createCandidateFromFixture(
  sourceCatalogId: "new-gm-mode-static-wrestler-fixture-catalog-v0.1",
  fixture: NewGMModeStaticWrestlerFixture,
  fixtureIndex: number
): NewGMModeDraftPickCandidateObject {
  const readinessReasonIds = collectReadinessReasonIds(fixture);
  const displayReadinessMarker = isDisplayReady(fixture)
    ? "display-ready"
    : "display-blocked";
  const eligibilityStatus =
    fixture.draftEligibility.eligible &&
    fixture.availabilityStatus === "available"
      ? "eligible"
      : "ineligible";

  return Object.freeze({
    candidateId: `new-gm-mode-draft-pick-candidate:${fixture.wrestlerId}`,
    version: "0.1",
    domainObject: true,
    diagnosticsOnly: false,
    playerFacing: false,
    gameplayAffecting: false,
    mutable: false,
    sourceFixtureReference: Object.freeze({
      sourceCatalogId,
      fixtureIndex,
      fixtureId: fixture.wrestlerId,
      fixtureSlug: fixture.slug
    }),
    wrestlerIdentityReference: Object.freeze({
      wrestlerId: fixture.wrestlerId,
      slug: fixture.slug
    }),
    eligibilityStatus,
    readinessReasonIds,
    displayReadinessMarker,
    capabilityFlags: NEW_GM_MODE_DRAFT_PICK_CANDIDATE_CAPABILITY_FLAGS
  });
}

function collectReadinessReasonIds(
  fixture: NewGMModeStaticWrestlerFixture
): readonly NewGMModeDraftPickCandidateReadinessReasonId[] {
  const reasonIds: NewGMModeDraftPickCandidateReadinessReasonId[] = [
    "source-fixture-identity-present"
  ];

  if (isDisplayReady(fixture)) {
    reasonIds.push("source-fixture-display-ready");
  }

  if (fixture.draftEligibility.eligible) {
    reasonIds.push("source-fixture-draft-eligible");
  } else {
    reasonIds.push("source-fixture-not-draft-eligible");
  }

  if (fixture.availabilityStatus === "available") {
    reasonIds.push("source-fixture-available");
  } else {
    reasonIds.push("source-fixture-not-available");
  }

  return Object.freeze(reasonIds);
}

function isDisplayReady(fixture: NewGMModeStaticWrestlerFixture): boolean {
  return (
    fixture.displayName.length > 0 &&
    fixture.brandEligibility.length > 0 &&
    fixture.genderDivisionEligibility.length > 0 &&
    fixture.roleCategoryTags.length > 0
  );
}
