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
  readonly boardRankLabel: string;
  readonly displayName: string;
  readonly eligibilityLabel: "Available" | "Unavailable";
  readonly displayReadinessLabel: "Display ready" | "Display blocked";
  readonly primaryRoleLabel: string;
  readonly divisionSummaryLabel: string;
  readonly roleLabels: readonly string[];
  readonly divisionLabels: readonly string[];
  readonly scoutingSignals: {
    readonly starPowerLabel: string;
    readonly ringWorkLabel: string;
    readonly durabilityLabel: string;
    readonly promoLabel: string;
    readonly tagFitLabel: string;
  };
}

export interface PlayableNewGMModeDraftReadOnlyActionLock {
  readonly actionId: "make-pick" | "auto-draft";
  readonly label: "Make Pick" | "Auto Draft";
  readonly enabled: false;
  readonly locked: true;
  readonly lockReason:
    | "selection-intent-submission-not-approved"
    | "automated-draft-execution-not-approved";
  readonly displayLabel: string;
}

export interface PlayableNewGMModeDraftReadOnlyStatusPanel {
  readonly title: "Read-Only Draft Board Preview";
  readonly readinessLabel:
    | "Candidate projection ready; draft actions locked"
    | "Candidate projection blocked";
  readonly summary: string;
  readonly blockedActionLabels: readonly string[];
  readonly nextApprovedStepLabel: "Selection intent preview";
}

export interface PlayableNewGMModeDraftReadOnlyInitialDraftProjection {
  readonly projectionId: "playable-new-gm-mode-initial-draft-read-only-projection-v0.1";
  readonly projectionSource: "real-draft-system-v1-read-only-boundary";
  readonly broadcastHeader: {
    readonly eyebrow: "Initial Draft";
    readonly title: "Read-Only Talent Board";
    readonly status: "Draft controls locked";
  };
  readonly statusPanel: PlayableNewGMModeDraftReadOnlyStatusPanel;
  readonly actionLocks: readonly PlayableNewGMModeDraftReadOnlyActionLock[];
  readonly candidateBoard: readonly PlayableNewGMModeDraftReadOnlyCandidateDisplay[];
  readonly rosterNeedsByDivision: readonly string[];
  readonly pickOrderPreview: readonly {
    readonly pickLabel: string;
    readonly brandLabel: string;
    readonly statusLabel: string;
    readonly resultLabel: string;
  }[];
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
  readonly initialDraftProjection: PlayableNewGMModeDraftReadOnlyInitialDraftProjection;
  readonly candidateReadinessSummary: NewGMModeDraftPickCandidateReadinessSummary;
  readonly blockedCapabilityFlags: {
    readonly pickExecutionBlocked: true;
    readonly pickCreationBlocked: true;
    readonly selectionIntentSubmissionBlocked: true;
    readonly rosterAssignmentBlocked: true;
    readonly rosterMutationBlocked: true;
    readonly draftCompletionBlocked: true;
    readonly persistenceBlocked: true;
    readonly backendCallsBlocked: true;
    readonly genAIBlocked: true;
  };
  readonly capabilityFlags: {
    readonly canReadCandidateObjects: true;
    readonly canProjectDraftRoomDisplay: true;
    readonly canCreateDraftPick: false;
    readonly canExecuteDraftPick: false;
    readonly canCreateSelectionIntent: false;
    readonly canSubmitSelectionIntent: false;
    readonly canAssignRoster: false;
    readonly canMutateRoster: false;
    readonly canCompleteDraft: false;
    readonly canCreateRosterState: false;
    readonly canPersistGameplayPayload: false;
    readonly canUseBrowserStorage: false;
    readonly canCallBackend: false;
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
  const candidates = candidateObjectSet.candidates.map((candidate, index) => {
    const fixture = fixtureCatalog.fixtures[candidate.sourceFixtureReference.fixtureIndex];

    return createCandidateDisplay({
      candidateObjectId: candidate.candidateId,
      sourceFixtureId: candidate.sourceFixtureReference.fixtureId,
      wrestlerId: candidate.wrestlerIdentityReference.wrestlerId,
      boardRankLabel: String(index + 1).padStart(2, "0"),
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
    initialDraftProjection: createInitialDraftProjection(candidates, structurallyReady),
    candidateReadinessSummary,
    blockedCapabilityFlags: Object.freeze({
      pickExecutionBlocked: true,
      pickCreationBlocked: true,
      selectionIntentSubmissionBlocked: true,
      rosterAssignmentBlocked: true,
      rosterMutationBlocked: true,
      draftCompletionBlocked: true,
      persistenceBlocked: true,
      backendCallsBlocked: true,
      genAIBlocked: true
    }),
    capabilityFlags: Object.freeze({
      canReadCandidateObjects: true,
      canProjectDraftRoomDisplay: true,
      canCreateDraftPick: false,
      canExecuteDraftPick: false,
      canCreateSelectionIntent: false,
      canSubmitSelectionIntent: false,
      canAssignRoster: false,
      canMutateRoster: false,
      canCompleteDraft: false,
      canCreateRosterState: false,
      canPersistGameplayPayload: false,
      canUseBrowserStorage: false,
      canCallBackend: false,
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
  readonly boardRankLabel: string;
  readonly displayReadinessMarker: string;
  readonly eligible: boolean;
  readonly fixture: NewGMModeStaticWrestlerFixture | undefined;
}): PlayableNewGMModeDraftReadOnlyCandidateDisplay {
  const fixture = input.fixture;

  return Object.freeze({
    candidateObjectId: input.candidateObjectId,
    sourceFixtureId: input.sourceFixtureId,
    wrestlerId: input.wrestlerId,
    boardRankLabel: input.boardRankLabel,
    displayName: fixture?.displayName ?? input.wrestlerId,
    eligibilityLabel: input.eligible ? "Available" : "Unavailable",
    displayReadinessLabel:
      input.displayReadinessMarker === "display-ready"
        ? "Display ready"
        : "Display blocked",
    primaryRoleLabel: formatRoleLabel(fixture?.roleCategoryTags[0]),
    divisionSummaryLabel: formatDivisionSummary(fixture?.genderDivisionEligibility),
    roleLabels: Object.freeze(fixture?.roleCategoryTags ?? []),
    divisionLabels: Object.freeze(fixture?.genderDivisionEligibility ?? []),
    scoutingSignals: Object.freeze({
      starPowerLabel: formatFixtureSignal(
        fixture?.placeholderAttributes.popularityStarPower
      ),
      ringWorkLabel: formatFixtureSignal(fixture?.placeholderAttributes.inRingAbility),
      durabilityLabel: formatFixtureSignal(
        fixture?.placeholderAttributes.staminaDurability
      ),
      promoLabel: formatFixtureSignal(fixture?.placeholderAttributes.promoCharisma),
      tagFitLabel: formatFixtureSignal(
        fixture?.placeholderAttributes.tagTeamCompatibility
      )
    })
  });
}

function createInitialDraftProjection(
  candidates: readonly PlayableNewGMModeDraftReadOnlyCandidateDisplay[],
  structurallyReady: boolean
): PlayableNewGMModeDraftReadOnlyInitialDraftProjection {
  return Object.freeze({
    projectionId: "playable-new-gm-mode-initial-draft-read-only-projection-v0.1",
    projectionSource: "real-draft-system-v1-read-only-boundary",
    broadcastHeader: Object.freeze({
      eyebrow: "Initial Draft",
      title: "Read-Only Talent Board",
      status: "Draft controls locked"
    }),
    statusPanel: Object.freeze({
      title: "Read-Only Draft Board Preview",
      readinessLabel: structurallyReady
        ? "Candidate projection ready; draft actions locked"
        : "Candidate projection blocked",
      summary:
        "Initial Draft can display project-backed candidate projection data, but Make Pick and Auto Draft stay locked until selection intent preview is explicitly approved.",
      blockedActionLabels: Object.freeze([
        "Make Pick locked",
        "Auto Draft locked",
        "Selection intent submission blocked",
        "Roster assignment blocked",
        "Draft completion blocked"
      ]),
      nextApprovedStepLabel: "Selection intent preview"
    }),
    actionLocks: Object.freeze([
      Object.freeze({
        actionId: "make-pick",
        label: "Make Pick",
        enabled: false,
        locked: true,
        lockReason: "selection-intent-submission-not-approved",
        displayLabel: "Make Pick Locked"
      }),
      Object.freeze({
        actionId: "auto-draft",
        label: "Auto Draft",
        enabled: false,
        locked: true,
        lockReason: "automated-draft-execution-not-approved",
        displayLabel: "Auto Draft Locked"
      })
    ]),
    candidateBoard: Object.freeze(candidates),
    rosterNeedsByDivision: Object.freeze([
      "Men's division: main-event anchor needed",
      "Women's division: top contender needed",
      "Tag team scene: chemistry depth needed",
      "Prospects: developmental upside open"
    ]),
    pickOrderPreview: Object.freeze([
      createPickOrderPreview("01", "Player Brand", "On Clock", "Read-only"),
      createPickOrderPreview("02", "SmackDown", "Waiting", "Projected"),
      createPickOrderPreview("03", "NXT", "Waiting", "Projected"),
      createPickOrderPreview("04", "AEW", "Waiting", "Projected"),
      createPickOrderPreview("05", "Player Brand", "Next Turn", "Read-only"),
      createPickOrderPreview("06", "SmackDown", "Next Turn", "Projected"),
      createPickOrderPreview("07", "NXT", "Later", "Projected"),
      createPickOrderPreview("08", "AEW", "Later", "Projected")
    ])
  });
}

function createPickOrderPreview(
  pickLabel: string,
  brandLabel: string,
  statusLabel: string,
  resultLabel: string
): PlayableNewGMModeDraftReadOnlyInitialDraftProjection["pickOrderPreview"][number] {
  return Object.freeze({
    pickLabel,
    brandLabel,
    statusLabel,
    resultLabel
  });
}

function formatDivisionSummary(
  divisions: readonly string[] | undefined
): string {
  if (!divisions || divisions.length === 0) {
    return "Division TBD";
  }

  return divisions.map(formatRoleLabel).join(" / ");
}

function formatFixtureSignal(signal: string | undefined): string {
  if (!signal) {
    return "Unknown";
  }

  return formatRoleLabel(signal.replace(/^fixture-/, ""));
}

function formatRoleLabel(value: string | undefined): string {
  if (!value) {
    return "Unassigned";
  }

  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
