import {
  createNewGMModeDraftPickCandidateObjects,
  createNewGMModeDraftSelectionIntentObject,
  createNewGMModeInMemoryDraftFlow,
} from "../../src/game/domain/index.ts";

export const IN_MEMORY_MAKE_PICK_STATUS = Object.freeze({
  READY: "ready-for-in-memory-make-pick",
  BLOCKED_MISSING_CANDIDATE: "blocked-missing-candidate",
  BLOCKED_UNAVAILABLE_CANDIDATE: "blocked-unavailable-candidate",
  BLOCKED_MISSING_BRAND: "blocked-missing-brand",
  BLOCKED_MISSING_DRAFT_SLOT: "blocked-missing-draft-slot",
  BLOCKED_ALREADY_DRAFTED: "blocked-candidate-already-drafted",
  BLOCKED_MINI_DRAFT_COMPLETE: "blocked-mini-draft-complete",
  BLOCKED_DOMAIN_CANDIDATE_MISSING: "blocked-domain-candidate-missing",
  SUCCEEDED: "in-memory-make-pick-succeeded",
  DOMAIN_BLOCKED: "in-memory-make-pick-domain-blocked",
});

export const MINI_DRAFT_MAX_PICKS = 3;

const DEFAULT_SERVICES = Object.freeze({
  createCandidateObjectSet: createNewGMModeDraftPickCandidateObjects,
  createSelectionIntentObject: createNewGMModeDraftSelectionIntentObject,
  runInMemoryDraftFlow: createNewGMModeInMemoryDraftFlow,
});

export function createMakePickReadiness({
  selectedCandidate,
  selectedBrand,
  draftSlot,
  miniDraftProgress,
} = {}) {
  const progress = normalizeMiniDraftProgress(miniDraftProgress);
  const blockedReasonIds = [];
  const selectedCandidateId = readString(selectedCandidate?.candidateId);

  if (progress.miniDraftComplete) {
    blockedReasonIds.push("mini-draft-complete");
  }

  if (!selectedCandidateId) {
    blockedReasonIds.push("candidate-selection-missing");
  } else if (progress.draftedCandidateIds.includes(selectedCandidateId)) {
    blockedReasonIds.push("candidate-already-drafted");
  } else if (selectedCandidate?.availability !== "Available") {
    blockedReasonIds.push("candidate-unavailable");
  }

  if (!readString(selectedBrand?.brandId)) {
    blockedReasonIds.push("brand-selection-missing");
  }

  if (!isValidDraftSlot(draftSlot)) {
    blockedReasonIds.push("draft-slot-missing");
  }

  const actionStatus = createReadinessStatus(blockedReasonIds);

  return Object.freeze({
    actionStatus,
    canMakePick: actionStatus === IN_MEMORY_MAKE_PICK_STATUS.READY,
    blocked: actionStatus !== IN_MEMORY_MAKE_PICK_STATUS.READY,
    blockedReasonIds: Object.freeze(blockedReasonIds),
    displayLabels: Object.freeze({
      buttonLabel:
        actionStatus === IN_MEMORY_MAKE_PICK_STATUS.READY
          ? "Make Pick"
          : createBlockedButtonLabel(actionStatus),
      statusLine: createReadinessStatusLine(actionStatus),
      noteLine: createReadinessNoteLine(actionStatus),
    }),
  });
}

export function createInitialMiniDraftProgress({
  maxPicks = MINI_DRAFT_MAX_PICKS,
  selectedBrand,
} = {}) {
  return Object.freeze({
    progressKind: "playable-new-gm-mode-local-mini-draft-progress",
    version: "0.1",
    localOnly: true,
    inMemoryOnly: true,
    persisted: false,
    currentPickIndex: 0,
    maxPicks,
    selectedBrandReference: createSelectedBrandReference(selectedBrand),
    currentDraftSlot: createDraftSlotForIndex(0),
    completedPickSummaries: Object.freeze([]),
    draftedCandidateIds: Object.freeze([]),
    miniDraftComplete: false,
    displayLabels: Object.freeze({
      progressLine: `Pick 1 of ${maxPicks}`,
      statusLine: "Mini draft ready",
      noteLine: "Local preview only. Reload resets draft progress.",
    }),
  });
}

export function executeInMemoryMakePick(input = {}, services = DEFAULT_SERVICES) {
  const miniDraftProgress = normalizeMiniDraftProgress(input.miniDraftProgress);
  const draftSlot = miniDraftProgress.currentDraftSlot;
  const readiness = createMakePickReadiness({
    ...input,
    draftSlot,
    miniDraftProgress,
  });

  if (!readiness.canMakePick) {
    return createBlockedActionResult(readiness);
  }

  const candidateObjectSet = services.createCandidateObjectSet();
  const domainCandidate = findDomainCandidate(
    candidateObjectSet,
    input.selectedCandidate
  );

  if (!domainCandidate) {
    return createBlockedActionResult(
      Object.freeze({
        actionStatus: IN_MEMORY_MAKE_PICK_STATUS.BLOCKED_DOMAIN_CANDIDATE_MISSING,
        canMakePick: false,
        blocked: true,
        blockedReasonIds: Object.freeze(["domain-candidate-reference-missing"]),
        displayLabels: Object.freeze({
          buttonLabel: "Make Pick Locked",
          statusLine: "Make Pick blocked - candidate reference missing",
          noteLine:
            "The UI selection could not be matched to the Real Draft System v1 candidate set.",
        }),
      })
    );
  }

  const selectionIntentObject = services.createSelectionIntentObject({
    candidateObjectId: domainCandidate.candidateId,
    sourceFixtureId: domainCandidate.sourceFixtureReference.fixtureId,
    sourceWrestlerId: domainCandidate.wrestlerIdentityReference.wrestlerId,
    selectingBrandId: input.selectedBrand.brandId,
    draftRound: draftSlot.roundNumber,
    draftPickNumber: draftSlot.pickNumber,
  });
  const flowResult = services.runInMemoryDraftFlow({
    selectionIntentObject,
    candidateObjectSetOverride: candidateObjectSet,
  });
  const currentPickSummary = createPickSummary({
    flowResult,
    selectedCandidate: input.selectedCandidate,
    selectedBrand: input.selectedBrand,
    selectedGm: input.selectedGm,
    draftSlot,
    pickNumber: miniDraftProgress.completedPickSummaries.length + 1,
  });
  const succeeded = currentPickSummary.completedInMemory;
  const nextMiniDraftProgress = succeeded
    ? appendPickSummaryToProgress({
        progress: miniDraftProgress,
        pickSummary: currentPickSummary,
        selectedBrand: input.selectedBrand,
      })
    : miniDraftProgress;
  const projection = createDraftRecapProjection({
    miniDraftProgress: nextMiniDraftProgress,
    selectedBrand: input.selectedBrand,
    selectedGm: input.selectedGm,
  });

  return Object.freeze({
    actionStatus: succeeded
      ? IN_MEMORY_MAKE_PICK_STATUS.SUCCEEDED
      : IN_MEMORY_MAKE_PICK_STATUS.DOMAIN_BLOCKED,
    localOnly: true,
    inMemoryOnly: true,
    persisted: false,
    selectionIntentObject,
    flowResult,
    currentPickSummary,
    miniDraftProgress: nextMiniDraftProgress,
    projection,
    capabilityFlags: Object.freeze({
      canAutoDraft: false,
      canCompleteFullDraft: false,
      canPersistGameplayPayload: false,
      canWriteDatabase: false,
      canInitializeWeekOne: false,
      canStartGameplay: false,
      canCreateGeneratedText: false,
      canUseGenAI: false,
    }),
  });
}

function createDraftRecapProjection({
  selectedBrand,
  selectedGm,
  miniDraftProgress,
}) {
  const brandLabel = readString(selectedBrand?.brandLabel) || "Selected brand";
  const gmName = readString(selectedGm?.displayName) || "GM preview missing";
  const progress = normalizeMiniDraftProgress(miniDraftProgress);
  const pickCount = progress.completedPickSummaries.length;
  const pickList = createPickListLabel(progress.completedPickSummaries);
  const completedInMemory = pickCount > 0;
  const miniDraftComplete = progress.miniDraftComplete;

  return Object.freeze({
    projectionKind: "local-mini-draft-recap-projection",
    version: "0.1",
    localOnly: true,
    inMemoryOnly: true,
    persisted: false,
    completedInMemory,
    miniDraftComplete,
    pickCount,
    selectedBrandLabel: brandLabel,
    selectedGmLabel: gmName,
    draftedCandidateLabel: pickList,
    pickSlotLabel: miniDraftComplete
      ? `3 of ${progress.maxPicks} local picks`
      : `${pickCount} of ${progress.maxPicks} local picks`,
    rosterMembershipCount: pickCount,
    displayLabels: Object.freeze({
      recapStatusLine: miniDraftComplete
        ? "Mini Draft Complete - local only"
        : "Local In-Memory Draft Preview - not saved",
      pathLine: "Real in-memory draft path",
      titleLine: `${brandLabel} mini draft recap`,
      rosterLine: completedInMemory
        ? `${pickCount} local pick${pickCount === 1 ? "" : "s"} recorded`
        : `${brandLabel} local draft preview empty`,
      copyLine: completedInMemory
        ? "This recap is backed by approved Real Draft System v1 in-memory Make Pick results. It is not saved, not a full roster, and resets on reload."
        : "No local in-memory picks have been made yet. The mock QA recap remains available for shell checks.",
      gmLine: gmName,
      brandLine: `${brandLabel} local in-memory result`,
      candidateLine: pickList,
      pickLine: miniDraftComplete
        ? `Mini draft complete: ${pickCount} of ${progress.maxPicks}`
        : `Mini draft in progress: ${pickCount} of ${progress.maxPicks}`,
      draftResultStatusLine: miniDraftComplete
        ? "Draft preview complete"
        : "Draft preview still local",
      rosterStatusLine: "No full roster created",
      noteLine:
        "Local-only mini draft result. No save, persistence, full roster, Week 1 initialization, booking, or gameplay start occurred.",
      dashboardLine: miniDraftComplete
        ? "Mini Draft Complete locally. Full draft, roster setup, Week 1 gameplay, booking, and saving remain locked."
        : "Local mini draft in progress. Week 1 gameplay and saving remain locked.",
    }),
    blockedCapabilityLabels: Object.freeze([
      "Auto Draft remains locked",
      "No full roster draft",
      "No save payload",
      "No SQLite write",
      "No Week 1 initialization",
      "No gameplay start",
      "No generated text",
      "No GenAI",
    ]),
  });
}

function createBlockedActionResult(readiness) {
  return Object.freeze({
    actionStatus: readiness.actionStatus,
    localOnly: true,
    inMemoryOnly: true,
    persisted: false,
    blocked: true,
    blockedReasonIds: readiness.blockedReasonIds,
    displayLabels: readiness.displayLabels,
    capabilityFlags: Object.freeze({
      canAutoDraft: false,
      canCompleteFullDraft: false,
      canPersistGameplayPayload: false,
      canWriteDatabase: false,
      canInitializeWeekOne: false,
      canStartGameplay: false,
      canCreateGeneratedText: false,
      canUseGenAI: false,
    }),
  });
}

function createReadinessStatus(blockedReasonIds) {
  if (blockedReasonIds.includes("mini-draft-complete")) {
    return IN_MEMORY_MAKE_PICK_STATUS.BLOCKED_MINI_DRAFT_COMPLETE;
  }

  if (blockedReasonIds.includes("candidate-already-drafted")) {
    return IN_MEMORY_MAKE_PICK_STATUS.BLOCKED_ALREADY_DRAFTED;
  }

  if (blockedReasonIds.includes("candidate-selection-missing")) {
    return IN_MEMORY_MAKE_PICK_STATUS.BLOCKED_MISSING_CANDIDATE;
  }

  if (blockedReasonIds.includes("candidate-unavailable")) {
    return IN_MEMORY_MAKE_PICK_STATUS.BLOCKED_UNAVAILABLE_CANDIDATE;
  }

  if (blockedReasonIds.includes("brand-selection-missing")) {
    return IN_MEMORY_MAKE_PICK_STATUS.BLOCKED_MISSING_BRAND;
  }

  if (blockedReasonIds.includes("draft-slot-missing")) {
    return IN_MEMORY_MAKE_PICK_STATUS.BLOCKED_MISSING_DRAFT_SLOT;
  }

  return IN_MEMORY_MAKE_PICK_STATUS.READY;
}

function createBlockedButtonLabel(actionStatus) {
  if (actionStatus === IN_MEMORY_MAKE_PICK_STATUS.BLOCKED_MINI_DRAFT_COMPLETE) {
    return "Mini Draft Complete";
  }

  if (actionStatus === IN_MEMORY_MAKE_PICK_STATUS.BLOCKED_ALREADY_DRAFTED) {
    return "Already Drafted";
  }

  return "Make Pick Locked";
}

function createReadinessStatusLine(actionStatus) {
  if (actionStatus === IN_MEMORY_MAKE_PICK_STATUS.READY) {
    return "Ready for in-memory Make Pick";
  }

  if (actionStatus === IN_MEMORY_MAKE_PICK_STATUS.BLOCKED_UNAVAILABLE_CANDIDATE) {
    return "Make Pick blocked - candidate unavailable";
  }

  if (actionStatus === IN_MEMORY_MAKE_PICK_STATUS.BLOCKED_MISSING_BRAND) {
    return "Make Pick blocked - brand missing";
  }

  if (actionStatus === IN_MEMORY_MAKE_PICK_STATUS.BLOCKED_ALREADY_DRAFTED) {
    return "Make Pick blocked - candidate already drafted";
  }

  if (actionStatus === IN_MEMORY_MAKE_PICK_STATUS.BLOCKED_MINI_DRAFT_COMPLETE) {
    return "Mini draft complete";
  }

  return "Make Pick blocked - selection incomplete";
}

function createReadinessNoteLine(actionStatus) {
  if (actionStatus === IN_MEMORY_MAKE_PICK_STATUS.READY) {
    return "Make Pick will run the approved Real Draft System v1 in memory only.";
  }

  if (actionStatus === IN_MEMORY_MAKE_PICK_STATUS.BLOCKED_UNAVAILABLE_CANDIDATE) {
    return "Unavailable candidates cannot be picked.";
  }

  if (actionStatus === IN_MEMORY_MAKE_PICK_STATUS.BLOCKED_ALREADY_DRAFTED) {
    return "Choose another available candidate for the next local pick.";
  }

  if (actionStatus === IN_MEMORY_MAKE_PICK_STATUS.BLOCKED_MINI_DRAFT_COMPLETE) {
    return "Reload resets this local-only mini draft.";
  }

  return "Select an available candidate and brand before making a pick.";
}

function findDomainCandidate(candidateObjectSet, selectedCandidate) {
  const uiCandidateSlug = createUiCandidateSlug(selectedCandidate);

  if (!uiCandidateSlug) {
    return undefined;
  }

  return candidateObjectSet.candidates.find((candidate) =>
    candidate.sourceFixtureReference.fixtureSlug.endsWith(`-${uiCandidateSlug}`)
  );
}

function createUiCandidateSlug(selectedCandidate) {
  const candidateId = readString(selectedCandidate?.candidateId);

  if (!candidateId) {
    return undefined;
  }

  return candidateId.replace(/^candidate-/, "");
}

function createPickLabel(draftSlot) {
  const roundLabel = readString(draftSlot?.roundLabel) || "Round 1";
  const pickLabel = readString(draftSlot?.pickLabel) || "Pick 1";

  return `${roundLabel} / ${pickLabel}`;
}

function createDraftSlotForIndex(index) {
  const pickNumber = index + 1;

  return Object.freeze({
    roundNumber: 1,
    pickNumber,
    roundLabel: "Round 1",
    pickLabel: `Pick ${pickNumber}`,
    placeholderOnly: true,
  });
}

function normalizeMiniDraftProgress(progress) {
  if (!progress || typeof progress !== "object") {
    return createInitialMiniDraftProgress();
  }

  const maxPicks = readPositiveNumber(progress.maxPicks, MINI_DRAFT_MAX_PICKS);
  const completedPickSummaries = Array.isArray(progress.completedPickSummaries)
    ? progress.completedPickSummaries.slice(0, maxPicks)
    : [];
  const draftedCandidateIds = Array.isArray(progress.draftedCandidateIds)
    ? progress.draftedCandidateIds.filter((candidateId) => readString(candidateId))
    : completedPickSummaries
        .map((summary) => readString(summary?.candidateId))
        .filter(Boolean);
  const currentPickIndex = Math.min(
    maxPicks,
    readPositiveOrZeroNumber(progress.currentPickIndex, completedPickSummaries.length)
  );
  const miniDraftComplete =
    Boolean(progress.miniDraftComplete) ||
    completedPickSummaries.length >= maxPicks ||
    currentPickIndex >= maxPicks;
  const currentDraftSlot = miniDraftComplete
    ? createDraftSlotForIndex(maxPicks - 1)
    : createDraftSlotForIndex(currentPickIndex);

  return Object.freeze({
    progressKind: "playable-new-gm-mode-local-mini-draft-progress",
    version: "0.1",
    localOnly: true,
    inMemoryOnly: true,
    persisted: false,
    currentPickIndex,
    maxPicks,
    selectedBrandReference: createSelectedBrandReference(
      progress.selectedBrandReference || progress.selectedBrand
    ),
    currentDraftSlot,
    completedPickSummaries: Object.freeze(completedPickSummaries),
    draftedCandidateIds: Object.freeze(draftedCandidateIds),
    miniDraftComplete,
    displayLabels: Object.freeze({
      progressLine: miniDraftComplete
        ? `Mini draft complete: ${completedPickSummaries.length} of ${maxPicks}`
        : `Pick ${currentPickIndex + 1} of ${maxPicks}`,
      statusLine: miniDraftComplete ? "Mini draft complete" : "Mini draft in progress",
      noteLine: "Local preview only. Reload resets draft progress.",
    }),
  });
}

function appendPickSummaryToProgress({ progress, pickSummary, selectedBrand }) {
  const normalizedProgress = normalizeMiniDraftProgress(progress);
  const completedPickSummaries = [
    ...normalizedProgress.completedPickSummaries,
    pickSummary,
  ].slice(0, normalizedProgress.maxPicks);
  const draftedCandidateIds = [
    ...normalizedProgress.draftedCandidateIds,
    pickSummary.candidateId,
  ].filter(Boolean);
  const currentPickIndex = Math.min(
    completedPickSummaries.length,
    normalizedProgress.maxPicks
  );
  const miniDraftComplete = currentPickIndex >= normalizedProgress.maxPicks;

  return normalizeMiniDraftProgress({
    ...normalizedProgress,
    currentPickIndex,
    selectedBrandReference: createSelectedBrandReference(selectedBrand),
    currentDraftSlot: miniDraftComplete
      ? normalizedProgress.currentDraftSlot
      : createDraftSlotForIndex(currentPickIndex),
    completedPickSummaries,
    draftedCandidateIds,
    miniDraftComplete,
  });
}

function createSelectedBrandReference(selectedBrand) {
  const brandId = readString(selectedBrand?.brandId);
  const brandLabel = readString(selectedBrand?.brandLabel);

  return Object.freeze({
    hasBrand: Boolean(brandId),
    brandId: brandId || "brand-not-selected",
    brandLabel: brandLabel || "Brand not selected",
    localOnly: true,
  });
}

function createPickSummary({
  flowResult,
  selectedCandidate,
  selectedBrand,
  selectedGm,
  draftSlot,
  pickNumber,
}) {
  const completedInMemory =
    flowResult?.draftCompletionSummary?.draftCompletionPhase ===
    "draft-complete-in-memory-roster-created-gameplay-start-blocked";
  const candidateName = readString(selectedCandidate?.name) || "Drafted candidate";
  const brandLabel = readString(selectedBrand?.brandLabel) || "Selected brand";
  const gmName = readString(selectedGm?.displayName) || "GM preview missing";
  const pickLabel = createPickLabel(draftSlot);

  return Object.freeze({
    summaryKind: "local-mini-draft-pick-summary",
    version: "0.1",
    localOnly: true,
    inMemoryOnly: true,
    persisted: false,
    completedInMemory,
    candidateId: readString(selectedCandidate?.candidateId),
    candidateName,
    brandLabel,
    gmName,
    pickLabel,
    pickNumber,
    displayLabel: `${pickLabel}: ${candidateName}`,
    displayStatusLine: completedInMemory
      ? "Pick recorded locally"
      : "Pick blocked locally",
  });
}

function createPickListLabel(pickSummaries) {
  if (!pickSummaries.length) {
    return "No local picks recorded";
  }

  return pickSummaries.map((summary) => summary.displayLabel).join(" | ");
}

function isValidDraftSlot(draftSlot) {
  return (
    Number.isFinite(draftSlot?.roundNumber) &&
    draftSlot.roundNumber > 0 &&
    Number.isFinite(draftSlot?.pickNumber) &&
    draftSlot.pickNumber > 0
  );
}

function readPositiveNumber(value, fallback) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : fallback;
}

function readPositiveOrZeroNumber(value, fallback) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : fallback;
}

function readString(value) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}
