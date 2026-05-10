import {
  createNewGMModeDraftPickCandidateObjects,
  type NewGMModeDraftPickCandidateObjectSet
} from "./newGMModeDraftPickCandidateObject.ts";
import {
  createNewGMModeDraftPickCandidateReadinessSummary,
  type NewGMModeDraftPickCandidateReadinessSummary
} from "./newGMModeDraftPickCandidateReadinessSummary.ts";
import {
  createNewGMModeStaticWrestlerFixtureCatalogShell,
  type NewGMModeStaticWrestlerFixture
} from "./newGMModeStaticWrestlerFixtureCatalogShell.ts";

export type PlayableNewGMModeDraftReadOnlyIntegrationPhase =
  | "read-only-draft-display-ready-execution-blocked"
  | "read-only-draft-display-blocked";

export interface PlayableNewGMModeDraftReadOnlyCandidateDisplay {
  readonly candidateObjectId: string;
  readonly sourceFixtureId: string;
  readonly wrestlerId: string;
  readonly displayName: string;
  readonly eligibilityLabel: "Available" | "Unavailable";
  readonly displayReadinessLabel: "Display ready" | "Display blocked";
  readonly roleLabels: readonly string[];
  readonly divisionLabels: readonly string[];
  readonly attributeSignals: {
    readonly starPower: string;
    readonly inRing: string;
    readonly durability: string;
    readonly promo: string;
    readonly tagFit: string;
  };
}

export interface PlayableNewGMModeDraftReadOnlyIntegrationBoundary {
  readonly playableDraftReadOnlyIntegrationBoundaryId: "playable-new-gm-mode-draft-read-only-integration-boundary-v0.1";
  readonly version: "0.1";
  readonly domainObject: true;
  readonly diagnosticsOnly: false;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly mutable: false;
  readonly deterministicOrdering: true;
  readonly integrationPhase: PlayableNewGMModeDraftReadOnlyIntegrationPhase;
  readonly sourceDraftSystemReferences: {
    readonly candidateObjectSetId: "new-gm-mode-draft-pick-candidate-object-set-v0.1";
    readonly candidateReadinessSummaryId: "new-gm-mode-draft-pick-candidate-readiness-summary-v0.1";
    readonly fixtureCatalogId: "new-gm-mode-static-wrestler-fixture-catalog-v0.1";
    readonly executionFlowAvailableButNotCalled: "new-gm-mode-in-memory-draft-flow-v1.0";
  };
  readonly draftRoomSnapshot: {
    readonly brandOnClockLabel: "Voltage Wrestling";
    readonly currentRoundLabel: "Round 1";
    readonly currentPickLabel: "Pick 1";
    readonly boardStatusLabel: "Read-only";
    readonly candidateCounts: {
      readonly total: number;
      readonly eligible: number;
      readonly ineligible: number;
    };
    readonly candidates: readonly PlayableNewGMModeDraftReadOnlyCandidateDisplay[];
  };
  readonly candidateReadinessSummary: NewGMModeDraftPickCandidateReadinessSummary;
  readonly capabilityFlags: {
    readonly canReadCandidateObjects: true;
    readonly canProjectDraftRoomDisplay: true;
    readonly canExecuteDraftPick: false;
    readonly canCreateSelectionIntent: false;
    readonly canCreateRosterState: false;
    readonly canPersistGameplayPayload: false;
    readonly canWriteDatabase: false;
    readonly canStartGameplay: false;
    readonly canInitializeWeekOne: false;
    readonly canCreateGeneratedText: false;
    readonly canUseGenAI: false;
  };
}

export interface PlayableNewGMModeDraftReadOnlyIntegrationBoundaryInput {
  readonly candidateObjectSet?: NewGMModeDraftPickCandidateObjectSet;
}

export function createPlayableNewGMModeDraftReadOnlyIntegrationBoundary(
  input: PlayableNewGMModeDraftReadOnlyIntegrationBoundaryInput = {}
): PlayableNewGMModeDraftReadOnlyIntegrationBoundary {
  const candidateObjectSet =
    input.candidateObjectSet ?? createNewGMModeDraftPickCandidateObjects();
  const candidateReadinessSummary =
    createNewGMModeDraftPickCandidateReadinessSummary({
      candidateSet: candidateObjectSet
    });
  const fixtureCatalog = createNewGMModeStaticWrestlerFixtureCatalogShell();
  const candidates = candidateObjectSet.candidates.map((candidate) => {
    const fixture = fixtureCatalog.fixtures[candidate.sourceFixtureReference.fixtureIndex];

    return createCandidateDisplay({
      candidateObjectId: candidate.candidateId,
      sourceFixtureId: candidate.sourceFixtureReference.fixtureId,
      wrestlerId: candidate.wrestlerIdentityReference.wrestlerId,
      displayReadinessMarker: candidate.displayReadinessMarker,
      eligible: candidate.eligibilityStatus === "eligible",
      fixture
    });
  });
  const structurallyReady =
    candidateReadinessSummary.readinessPhase ===
      "candidate-objects-valid-selection-unavailable" &&
    candidateReadinessSummary.validatorStatus.structurallyValid;

  return Object.freeze({
    playableDraftReadOnlyIntegrationBoundaryId:
      "playable-new-gm-mode-draft-read-only-integration-boundary-v0.1",
    version: "0.1",
    domainObject: true,
    diagnosticsOnly: false,
    playerFacing: false,
    gameplayAffecting: false,
    mutable: false,
    deterministicOrdering: true,
    integrationPhase: structurallyReady
      ? "read-only-draft-display-ready-execution-blocked"
      : "read-only-draft-display-blocked",
    sourceDraftSystemReferences: Object.freeze({
      candidateObjectSetId: candidateObjectSet.draftPickCandidateObjectSetId,
      candidateReadinessSummaryId:
        candidateReadinessSummary.draftPickCandidateReadinessSummaryId,
      fixtureCatalogId: fixtureCatalog.staticWrestlerFixtureCatalogId,
      executionFlowAvailableButNotCalled:
        "new-gm-mode-in-memory-draft-flow-v1.0"
    }),
    draftRoomSnapshot: Object.freeze({
      brandOnClockLabel: "Voltage Wrestling",
      currentRoundLabel: "Round 1",
      currentPickLabel: "Pick 1",
      boardStatusLabel: "Read-only",
      candidateCounts: Object.freeze({
        total: candidateReadinessSummary.candidateCounts.total,
        eligible: candidateReadinessSummary.candidateCounts.eligible,
        ineligible: candidateReadinessSummary.candidateCounts.ineligible
      }),
      candidates: Object.freeze(candidates)
    }),
    candidateReadinessSummary,
    capabilityFlags: Object.freeze({
      canReadCandidateObjects: true,
      canProjectDraftRoomDisplay: true,
      canExecuteDraftPick: false,
      canCreateSelectionIntent: false,
      canCreateRosterState: false,
      canPersistGameplayPayload: false,
      canWriteDatabase: false,
      canStartGameplay: false,
      canInitializeWeekOne: false,
      canCreateGeneratedText: false,
      canUseGenAI: false
    })
  });
}

function createCandidateDisplay(input: {
  readonly candidateObjectId: string;
  readonly sourceFixtureId: string;
  readonly wrestlerId: string;
  readonly displayReadinessMarker: string;
  readonly eligible: boolean;
  readonly fixture: NewGMModeStaticWrestlerFixture | undefined;
}): PlayableNewGMModeDraftReadOnlyCandidateDisplay {
  const fixture = input.fixture;

  return Object.freeze({
    candidateObjectId: input.candidateObjectId,
    sourceFixtureId: input.sourceFixtureId,
    wrestlerId: input.wrestlerId,
    displayName: fixture?.displayName ?? input.wrestlerId,
    eligibilityLabel: input.eligible ? "Available" : "Unavailable",
    displayReadinessLabel:
      input.displayReadinessMarker === "display-ready"
        ? "Display ready"
        : "Display blocked",
    roleLabels: Object.freeze(fixture?.roleCategoryTags ?? []),
    divisionLabels: Object.freeze(fixture?.genderDivisionEligibility ?? []),
    attributeSignals: Object.freeze({
      starPower: fixture?.placeholderAttributes.popularityStarPower ?? "unknown",
      inRing: fixture?.placeholderAttributes.inRingAbility ?? "unknown",
      durability: fixture?.placeholderAttributes.staminaDurability ?? "unknown",
      promo: fixture?.placeholderAttributes.promoCharisma ?? "unknown",
      tagFit: fixture?.placeholderAttributes.tagTeamCompatibility ?? "unknown"
    })
  });
}
