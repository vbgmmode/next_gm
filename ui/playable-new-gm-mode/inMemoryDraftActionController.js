import {
  createNewGMModeDraftPickCandidateObjects,
  createNewGMModeDraftFinanceProjection,
  createNewGMModeDraftSelectionIntentObject,
  createNewGMModeInMemoryDraftFlow,
  NEW_GM_MODE_DRAFT_FINANCE_BOOKING_RESERVE_PLACEHOLDER,
  NEW_GM_MODE_DRAFT_FINANCE_MINIMUM_ROSTER_TARGET_PLACEHOLDER,
  NEW_GM_MODE_DRAFT_FINANCE_STARTING_BUDGET_PLACEHOLDER,
} from "../../src/game/domain/index.ts";

export const IN_MEMORY_MAKE_PICK_STATUS = Object.freeze({
  READY: "ready-for-in-memory-make-pick",
  BLOCKED_MISSING_CANDIDATE: "blocked-missing-candidate",
  BLOCKED_UNAVAILABLE_CANDIDATE: "blocked-unavailable-candidate",
  BLOCKED_MISSING_BRAND: "blocked-missing-brand",
  BLOCKED_MISSING_DRAFT_SLOT: "blocked-missing-draft-slot",
  BLOCKED_ALREADY_DRAFTED: "blocked-candidate-already-drafted",
  BLOCKED_UNAFFORDABLE_CANDIDATE: "blocked-candidate-unaffordable",
  BLOCKED_LOCAL_DRAFT_FINISHED: "blocked-local-draft-finished",
  BLOCKED_NO_DRAFT_CONTINUATION: "blocked-no-draft-continuation",
  BLOCKED_DOMAIN_CANDIDATE_MISSING: "blocked-domain-candidate-missing",
  SUCCEEDED: "in-memory-make-pick-succeeded",
  DOMAIN_BLOCKED: "in-memory-make-pick-domain-blocked",
});

export const LOCAL_DRAFT_MINIMUM_VIABLE_ROSTER_COUNT =
  NEW_GM_MODE_DRAFT_FINANCE_MINIMUM_ROSTER_TARGET_PLACEHOLDER;
export const LOCAL_DRAFT_BOOKING_RESERVE_BUDGET =
  NEW_GM_MODE_DRAFT_FINANCE_BOOKING_RESERVE_PLACEHOLDER;

export const AUTO_FILL_MINIMUM_ROSTER_STATUS = Object.freeze({
  READY: "ready-for-auto-fill-minimum-roster",
  SUCCEEDED: "auto-fill-minimum-roster-succeeded",
  STOPPED_MINIMUM_NOT_REACHED: "auto-fill-stopped-minimum-not-reached",
  BLOCKED_MISSING_BRAND: "blocked-auto-fill-missing-brand",
  BLOCKED_LOCAL_DRAFT_FINISHED: "blocked-auto-fill-local-draft-finished",
  BLOCKED_MINIMUM_ALREADY_VIABLE: "blocked-auto-fill-minimum-roster-viable",
  BLOCKED_NO_RESERVE_SAFE_CANDIDATES:
    "blocked-auto-fill-no-reserve-safe-candidates",
});

export const LOCAL_FINISH_DRAFT_STATUS = Object.freeze({
  READY: "ready-to-finish-local-draft",
  SUCCEEDED: "local-draft-finished",
  BLOCKED_MISSING_BRAND: "blocked-finish-draft-missing-brand",
  BLOCKED_MINIMUM_NOT_VIABLE: "blocked-finish-draft-minimum-not-viable",
  BLOCKED_ALREADY_FINISHED: "blocked-finish-draft-already-finished",
});

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
  const selectedCandidateFinanceProjection = createFinanceProjectionForCandidate({
    selectedCandidate,
    miniDraftProgress: progress,
  });

  if (progress.localDraftFinished) {
    blockedReasonIds.push("local-draft-finished");
  }

  if (!progress.draftCanContinue && !progress.localDraftFinished) {
    blockedReasonIds.push("draft-cannot-continue");
  }

  if (!selectedCandidateId) {
    blockedReasonIds.push("candidate-selection-missing");
  } else if (progress.draftedCandidateIds.includes(selectedCandidateId)) {
    blockedReasonIds.push("candidate-already-drafted");
  } else if (selectedCandidate?.availability !== "Available") {
    blockedReasonIds.push("candidate-unavailable");
  } else if (
    selectedCandidateFinanceProjection?.affordabilityStatus === "not-affordable"
  ) {
    blockedReasonIds.push("candidate-unaffordable");
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
      noteLine: createReadinessNoteLine(
        actionStatus,
        selectedCandidateFinanceProjection,
        progress
      ),
    }),
    selectedCandidateFinanceProjection,
  });
}

export function createInitialMiniDraftProgress({
  selectedBrand,
} = {}) {
  return Object.freeze({
    progressKind: "playable-new-gm-mode-local-finance-limited-draft-progress",
    version: "0.1",
    localOnly: true,
    inMemoryOnly: true,
    persisted: false,
    startingDraftBudget: NEW_GM_MODE_DRAFT_FINANCE_STARTING_BUDGET_PLACEHOLDER,
    remainingDraftBudget: NEW_GM_MODE_DRAFT_FINANCE_STARTING_BUDGET_PLACEHOLDER,
    budgetSpent: 0,
    signedTalentCount: 0,
    minimumViableRosterCount:
      NEW_GM_MODE_DRAFT_FINANCE_MINIMUM_ROSTER_TARGET_PLACEHOLDER,
    minimumRosterTarget:
      NEW_GM_MODE_DRAFT_FINANCE_MINIMUM_ROSTER_TARGET_PLACEHOLDER,
    bookingReserveBudget: NEW_GM_MODE_DRAFT_FINANCE_BOOKING_RESERVE_PLACEHOLDER,
    minimumRosterViable: false,
    bookingReserveProtected: true,
    draftCanContinue: true,
    localDraftFinished: false,
    currentPickIndex: 0,
    selectedBrandReference: createSelectedBrandReference(selectedBrand),
    currentDraftSlot: createDraftSlotForIndex(0),
    completedPickSummaries: Object.freeze([]),
    draftedCandidateIds: Object.freeze([]),
    miniDraftComplete: false,
    displayLabels: Object.freeze({
      progressLine: "Pick 1",
      statusLine: "Finance-limited draft ready",
      budgetLine: "Budget remaining: 120",
      viabilityLine: "Minimum roster not viable: 0 of 16",
      reserveLine: "Booking reserve protected",
      noteLine: "Not Saved Yet. Reload resets draft progress.",
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
            "The selected wrestler is no longer available on this draft board.",
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
  const candidateFinanceProjection = createFinanceProjectionForCandidate({
    selectedCandidate: input.selectedCandidate,
    miniDraftProgress,
  });
  const currentPickSummary = createPickSummary({
    flowResult,
    selectedCandidate: input.selectedCandidate,
    selectedBrand: input.selectedBrand,
    selectedGm: input.selectedGm,
    draftSlot,
    pickNumber: miniDraftProgress.completedPickSummaries.length + 1,
    financeProjection: candidateFinanceProjection,
    budgetBeforeSigning: miniDraftProgress.remainingDraftBudget,
    bookingReserveBudget: miniDraftProgress.bookingReserveBudget,
    pickSource: input.pickSource,
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

export function createAutoFillMinimumRosterReadiness(
  { selectedBrand, miniDraftProgress } = {},
  services = DEFAULT_SERVICES
) {
  const progress = normalizeMiniDraftProgress(miniDraftProgress);
  const blockedReasonIds = [];

  if (!readString(selectedBrand?.brandId)) {
    blockedReasonIds.push("brand-selection-missing");
  }

  if (progress.localDraftFinished) {
    blockedReasonIds.push("local-draft-finished");
  }

  if (progress.minimumRosterViable) {
    blockedReasonIds.push("minimum-roster-already-viable");
  }

  const candidateObjectSet = services.createCandidateObjectSet();
  const autoFillOptions = collectAutoFillCandidateOptions({
    progress,
    candidateObjectSet,
    preserveBookingReserve: true,
  });

  if (!autoFillOptions.length) {
    blockedReasonIds.push("no-reserve-safe-affordable-candidates");
  }

  const actionStatus = createAutoFillReadinessStatus(blockedReasonIds);

  return Object.freeze({
    actionStatus,
    canAutoFill: actionStatus === AUTO_FILL_MINIMUM_ROSTER_STATUS.READY,
    blocked: actionStatus !== AUTO_FILL_MINIMUM_ROSTER_STATUS.READY,
    blockedReasonIds: Object.freeze(blockedReasonIds),
    displayLabels: Object.freeze({
      buttonLabel:
        actionStatus === AUTO_FILL_MINIMUM_ROSTER_STATUS.READY
          ? "Auto-Fill Toward 16"
          : "Auto-Fill Locked",
      statusLine: createAutoFillStatusLine(actionStatus),
      noteLine: createAutoFillNoteLine(actionStatus, progress),
    }),
  });
}

export function executeAutoFillMinimumRoster(
  input = {},
  services = DEFAULT_SERVICES
) {
  const initialProgress = normalizeMiniDraftProgress(input.miniDraftProgress);
  const readiness = createAutoFillMinimumRosterReadiness(
    {
      selectedBrand: input.selectedBrand,
      miniDraftProgress: initialProgress,
    },
    services
  );

  if (!readiness.canAutoFill) {
    return createBlockedAutoFillResult(readiness, initialProgress, input);
  }

  let currentProgress = initialProgress;
  const autoFilledPickSummaries = [];

  while (!currentProgress.minimumRosterViable) {
    const candidateObjectSet = services.createCandidateObjectSet();
    const [nextCandidate] = collectAutoFillCandidateOptions({
      progress: currentProgress,
      candidateObjectSet,
      preserveBookingReserve: true,
    });

    if (!nextCandidate) {
      break;
    }

    const pickResult = executeInMemoryMakePick(
      {
        selectedCandidate: nextCandidate.selectedCandidate,
        selectedBrand: input.selectedBrand,
        selectedGm: input.selectedGm,
        miniDraftProgress: currentProgress,
        pickSource: "auto-fill",
      },
      services
    );

    if (pickResult.actionStatus !== IN_MEMORY_MAKE_PICK_STATUS.SUCCEEDED) {
      break;
    }

    currentProgress = pickResult.miniDraftProgress;
    autoFilledPickSummaries.push(pickResult.currentPickSummary);
  }

  const projection = createDraftRecapProjection({
    miniDraftProgress: currentProgress,
    selectedBrand: input.selectedBrand,
    selectedGm: input.selectedGm,
  });
  const reachedMinimum = currentProgress.minimumRosterViable;

  return Object.freeze({
    actionStatus: reachedMinimum
      ? AUTO_FILL_MINIMUM_ROSTER_STATUS.SUCCEEDED
      : AUTO_FILL_MINIMUM_ROSTER_STATUS.STOPPED_MINIMUM_NOT_REACHED,
    localOnly: true,
    inMemoryOnly: true,
    persisted: false,
    autoFilledCount: autoFilledPickSummaries.length,
    autoFilledPickSummaries: Object.freeze(autoFilledPickSummaries),
    miniDraftProgress: currentProgress,
    projection,
    blockedReasonIds: reachedMinimum
      ? Object.freeze([])
      : Object.freeze(["minimum-roster-not-reached-with-reserve-protected"]),
    displayLabels: Object.freeze({
      statusLine: reachedMinimum
        ? "Auto-Fill reached minimum roster viability"
        : "Auto-Fill stopped before minimum roster viability",
      noteLine: reachedMinimum
        ? "Auto-Fill stopped at 16 and kept the booking reserve protected."
        : "Auto-Fill stopped rather than dipping into booking reserve or signing unavailable talent.",
    }),
    capabilityFlags: createBlockedCapabilityFlags(),
  });
}

export function createFinishDraftReadiness({
  selectedBrand,
  miniDraftProgress,
} = {}) {
  const progress = normalizeMiniDraftProgress(miniDraftProgress);
  const blockedReasonIds = [];

  if (!readString(selectedBrand?.brandId)) {
    blockedReasonIds.push("brand-selection-missing");
  }

  if (progress.localDraftFinished) {
    blockedReasonIds.push("local-draft-already-finished");
  }

  if (!progress.minimumRosterViable) {
    blockedReasonIds.push("minimum-roster-not-viable");
  }

  const actionStatus = createFinishDraftReadinessStatus(blockedReasonIds);

  return Object.freeze({
    actionStatus,
    canFinishDraft: actionStatus === LOCAL_FINISH_DRAFT_STATUS.READY,
    blocked: actionStatus !== LOCAL_FINISH_DRAFT_STATUS.READY,
    blockedReasonIds: Object.freeze(blockedReasonIds),
    displayLabels: Object.freeze({
      buttonLabel:
        actionStatus === LOCAL_FINISH_DRAFT_STATUS.READY
          ? "Finish Draft"
          : "Finish Locked",
      statusLine: createFinishDraftStatusLine(actionStatus),
      noteLine: createFinishDraftNoteLine(actionStatus, progress),
    }),
  });
}

export function executeLocalFinishDraft(input = {}) {
  const progress = normalizeMiniDraftProgress(input.miniDraftProgress);
  const readiness = createFinishDraftReadiness({
    selectedBrand: input.selectedBrand,
    miniDraftProgress: progress,
  });

  if (!readiness.canFinishDraft) {
    return Object.freeze({
      actionStatus: readiness.actionStatus,
      localOnly: true,
      inMemoryOnly: true,
      persisted: false,
      blocked: true,
      blockedReasonIds: readiness.blockedReasonIds,
      displayLabels: readiness.displayLabels,
      capabilityFlags: createBlockedCapabilityFlags(),
    });
  }

  const nextProgress = normalizeMiniDraftProgress({
    ...progress,
    localDraftFinished: true,
    miniDraftComplete: true,
  });
  const projection = createDraftRecapProjection({
    miniDraftProgress: nextProgress,
    selectedBrand: input.selectedBrand,
    selectedGm: input.selectedGm,
  });

  return Object.freeze({
    actionStatus: LOCAL_FINISH_DRAFT_STATUS.SUCCEEDED,
    localOnly: true,
    inMemoryOnly: true,
    persisted: false,
    miniDraftProgress: nextProgress,
    projection,
    displayLabels: Object.freeze({
      statusLine: "Draft Finished Locally",
      noteLine: "This draft is not saved yet. Week 1 setup remains locked.",
    }),
    capabilityFlags: createBlockedCapabilityFlags(),
  });
}

export function createPostDraftRosterHubProjection({
  selectedBrand,
  miniDraftProgress,
} = {}) {
  const progress = normalizeMiniDraftProgress(miniDraftProgress);
  const brandLabel =
    readString(selectedBrand?.brandLabel) ||
    progress.selectedBrandReference.brandLabel ||
    "Selected brand";
  const signedTalent = progress.completedPickSummaries.map((summary, index) =>
    createPostDraftRosterTalentCard(summary, index, brandLabel)
  );
  const localDraftFinished = progress.localDraftFinished;

  return Object.freeze({
    projectionKind: "post-draft-local-roster-hub-projection",
    version: "0.1",
    localOnly: true,
    inMemoryOnly: true,
    persisted: false,
    localDraftFinished,
    locked: !localDraftFinished,
    brandLabel,
    signedTalent: Object.freeze(signedTalent),
    summary: Object.freeze({
      signedTalentCount: progress.signedTalentCount,
      minimumViableRosterCount: progress.minimumViableRosterCount,
      minimumRosterViable: progress.minimumRosterViable,
      startingDraftBudget: progress.startingDraftBudget,
      budgetSpent: progress.budgetSpent,
      remainingDraftBudget: progress.remainingDraftBudget,
      bookingReserveBudget: progress.bookingReserveBudget,
      bookingReserveProtected: progress.bookingReserveProtected,
      localOnly: true,
      weekOneLocked: true,
      persisted: false,
    }),
    lockedSetupCards: Object.freeze([
      createLockedSetupCard("Championship Setup", "Setup Locked"),
      createLockedSetupCard("Rivalry Setup", "Setup Locked"),
      createLockedSetupCard("Week 1 HQ", "Week 1 Locked"),
      createLockedSetupCard("Save", "Not Saved Yet"),
    ]),
    capabilityFlags: createBlockedCapabilityFlags(),
    displayLabels: Object.freeze({
      titleLine: localDraftFinished
        ? `${brandLabel} Draft Recap`
        : `${brandLabel} roster locked`,
      statusLine: localDraftFinished
        ? "Post-draft command ready"
        : "Finish the draft to view your roster.",
      signedCountLine: `Signed Superstars: ${progress.signedTalentCount}`,
      minimumRosterLine: `Minimum Viable Roster: ${progress.minimumViableRosterCount}`,
      minimumRosterStatusLine: progress.minimumRosterViable
        ? "Minimum roster viable"
        : "Minimum roster not viable",
      startingBudgetLine: `Starting Budget: ${progress.startingDraftBudget}`,
      budgetSpentLine: `Budget Spent: ${progress.budgetSpent}`,
      remainingBudgetLine: `Remaining Budget: ${progress.remainingDraftBudget}`,
      bookingReserveLine: `Booking Reserve Target: ${progress.bookingReserveBudget}`,
      bookingReserveStatusLine: progress.bookingReserveProtected
        ? "Booking reserve protected"
        : "Booking reserve dipped",
      localOnlyLine: "Local Draft Only / Not Saved Yet",
      weekOneLockedLine: "Week 1 Locked",
      emptyRosterLine: "Finish the draft to view your roster.",
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
  const localDraftFinished = progress.localDraftFinished;
  const budgetSummary = Object.freeze({
    startingDraftBudget: progress.startingDraftBudget,
    budgetSpent: progress.budgetSpent,
    remainingDraftBudget: progress.remainingDraftBudget,
    signedTalentCount: progress.signedTalentCount,
    minimumViableRosterCount: progress.minimumViableRosterCount,
    minimumRosterTarget: progress.minimumViableRosterCount,
    minimumRosterViable: progress.minimumRosterViable,
    bookingReserveBudget: progress.bookingReserveBudget,
    bookingReserveProtected: progress.bookingReserveProtected,
  });

  return Object.freeze({
    projectionKind: "local-finance-limited-draft-recap-projection",
    version: "0.1",
    localOnly: true,
    inMemoryOnly: true,
    persisted: false,
    completedInMemory,
    miniDraftComplete: localDraftFinished,
    localDraftFinished,
    minimumRosterViable: progress.minimumRosterViable,
    bookingReserveProtected: progress.bookingReserveProtected,
    pickCount,
    selectedBrandLabel: brandLabel,
    selectedGmLabel: gmName,
    draftedCandidateLabel: pickList,
    budgetSummary,
    pickSlotLabel: `${pickCount} local signing${pickCount === 1 ? "" : "s"}`,
    rosterMembershipCount: pickCount,
    displayLabels: Object.freeze({
      recapStatusLine: localDraftFinished
        ? "Draft Finished Locally"
        : "Draft still open",
      pathLine: "Draft Results",
      titleLine: `${brandLabel} draft recap`,
      rosterLine: completedInMemory
        ? `${pickCount} superstar${pickCount === 1 ? "" : "s"} signed`
        : `${brandLabel} draft board empty`,
      copyLine: completedInMemory
        ? "This recap shows signed draft results from this session. It is not saved and resets on reload."
        : "No picks have been made yet. Preview Recap remains available for shell checks.",
      gmLine: gmName,
      brandLine: `${brandLabel} draft results`,
      candidateLine: pickList,
      budgetLine: `Budget: ${budgetSummary.remainingDraftBudget} remaining / ${budgetSummary.budgetSpent} spent / reserve ${budgetSummary.bookingReserveBudget}`,
      pickLine: localDraftFinished
        ? `Draft finished: ${pickCount} signed`
        : `Draft still open: ${pickCount} signed`,
      draftResultStatusLine: localDraftFinished
        ? "Draft Finished Locally"
        : "Draft still open",
      rosterStatusLine: progress.minimumRosterViable
        ? `Minimum roster viable: ${pickCount} of ${progress.minimumViableRosterCount}`
        : `Sign at least ${progress.minimumViableRosterCount} superstars before finishing the draft`,
      reserveStatusLine: progress.bookingReserveProtected
        ? "Booking reserve protected"
        : "Booking reserve dipped",
      noteLine:
        "Not saved yet. Week 1, booking, and gameplay start remain locked.",
      dashboardLine: localDraftFinished
        ? "Draft Finished Locally. Week 1 setup, booking, gameplay, and saving remain locked."
        : progress.minimumRosterViable
          ? "Draft is minimum viable but still open. Finish Draft when ready."
          : "Finance-limited draft in progress. Week 1 gameplay and saving remain locked.",
    }),
    blockedCapabilityLabels: Object.freeze([
      "Auto-Fill stops at 16 in v0.1",
      "Not Saved Yet",
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
    selectedCandidateFinanceProjection:
      readiness.selectedCandidateFinanceProjection,
    capabilityFlags: createBlockedCapabilityFlags(),
  });
}

function createBlockedAutoFillResult(readiness, progress, input) {
  return Object.freeze({
    actionStatus: readiness.actionStatus,
    localOnly: true,
    inMemoryOnly: true,
    persisted: false,
    blocked: true,
    blockedReasonIds: readiness.blockedReasonIds,
    displayLabels: readiness.displayLabels,
    miniDraftProgress: progress,
    projection: createDraftRecapProjection({
      miniDraftProgress: progress,
      selectedBrand: input.selectedBrand,
      selectedGm: input.selectedGm,
    }),
    capabilityFlags: createBlockedCapabilityFlags(),
  });
}

function createBlockedCapabilityFlags() {
  return Object.freeze({
    canAutoDraft: false,
    canCompleteFullDraft: false,
    canPersistGameplayPayload: false,
    canWriteDatabase: false,
    canInitializeWeekOne: false,
    canStartGameplay: false,
    canCreateGeneratedText: false,
    canUseGenAI: false,
  });
}

function createReadinessStatus(blockedReasonIds) {
  if (blockedReasonIds.includes("local-draft-finished")) {
    return IN_MEMORY_MAKE_PICK_STATUS.BLOCKED_LOCAL_DRAFT_FINISHED;
  }

  if (blockedReasonIds.includes("draft-cannot-continue")) {
    return IN_MEMORY_MAKE_PICK_STATUS.BLOCKED_NO_DRAFT_CONTINUATION;
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

  if (blockedReasonIds.includes("candidate-unaffordable")) {
    return IN_MEMORY_MAKE_PICK_STATUS.BLOCKED_UNAFFORDABLE_CANDIDATE;
  }

  if (blockedReasonIds.includes("brand-selection-missing")) {
    return IN_MEMORY_MAKE_PICK_STATUS.BLOCKED_MISSING_BRAND;
  }

  if (blockedReasonIds.includes("draft-slot-missing")) {
    return IN_MEMORY_MAKE_PICK_STATUS.BLOCKED_MISSING_DRAFT_SLOT;
  }

  return IN_MEMORY_MAKE_PICK_STATUS.READY;
}

function createAutoFillReadinessStatus(blockedReasonIds) {
  if (blockedReasonIds.includes("brand-selection-missing")) {
    return AUTO_FILL_MINIMUM_ROSTER_STATUS.BLOCKED_MISSING_BRAND;
  }

  if (blockedReasonIds.includes("local-draft-finished")) {
    return AUTO_FILL_MINIMUM_ROSTER_STATUS.BLOCKED_LOCAL_DRAFT_FINISHED;
  }

  if (blockedReasonIds.includes("minimum-roster-already-viable")) {
    return AUTO_FILL_MINIMUM_ROSTER_STATUS.BLOCKED_MINIMUM_ALREADY_VIABLE;
  }

  if (blockedReasonIds.includes("no-reserve-safe-affordable-candidates")) {
    return AUTO_FILL_MINIMUM_ROSTER_STATUS.BLOCKED_NO_RESERVE_SAFE_CANDIDATES;
  }

  return AUTO_FILL_MINIMUM_ROSTER_STATUS.READY;
}

function createAutoFillStatusLine(actionStatus) {
  if (actionStatus === AUTO_FILL_MINIMUM_ROSTER_STATUS.READY) {
    return "Auto-Fill can sign toward minimum roster viability";
  }

  if (
    actionStatus ===
    AUTO_FILL_MINIMUM_ROSTER_STATUS.BLOCKED_MINIMUM_ALREADY_VIABLE
  ) {
    return "Minimum roster already viable";
  }

  if (
    actionStatus ===
    AUTO_FILL_MINIMUM_ROSTER_STATUS.BLOCKED_NO_RESERVE_SAFE_CANDIDATES
  ) {
    return "Auto-Fill blocked - no reserve-safe affordable candidates";
  }

  if (
    actionStatus === AUTO_FILL_MINIMUM_ROSTER_STATUS.BLOCKED_LOCAL_DRAFT_FINISHED
  ) {
    return "Auto-Fill blocked - draft finished locally";
  }

  return "Auto-Fill blocked";
}

function createAutoFillNoteLine(actionStatus, progress) {
  if (actionStatus === AUTO_FILL_MINIMUM_ROSTER_STATUS.READY) {
    return "Auto-Fill signs lowest-cost available talent until 16 or until reserve-safe options run out.";
  }

  if (
    actionStatus ===
    AUTO_FILL_MINIMUM_ROSTER_STATUS.BLOCKED_MINIMUM_ALREADY_VIABLE
  ) {
    return "You can keep signing manually if budget and candidates remain.";
  }

  if (
    actionStatus ===
    AUTO_FILL_MINIMUM_ROSTER_STATUS.BLOCKED_NO_RESERVE_SAFE_CANDIDATES
  ) {
    return `Auto-Fill will not dip below the ${progress.bookingReserveBudget} booking reserve target.`;
  }

  if (
    actionStatus === AUTO_FILL_MINIMUM_ROSTER_STATUS.BLOCKED_LOCAL_DRAFT_FINISHED
  ) {
    return "This local draft is finished. Reload resets the page-lifetime draft.";
  }

  return "Select a brand before auto-filling toward the minimum roster.";
}

function createFinishDraftReadinessStatus(blockedReasonIds) {
  if (blockedReasonIds.includes("brand-selection-missing")) {
    return LOCAL_FINISH_DRAFT_STATUS.BLOCKED_MISSING_BRAND;
  }

  if (blockedReasonIds.includes("local-draft-already-finished")) {
    return LOCAL_FINISH_DRAFT_STATUS.BLOCKED_ALREADY_FINISHED;
  }

  if (blockedReasonIds.includes("minimum-roster-not-viable")) {
    return LOCAL_FINISH_DRAFT_STATUS.BLOCKED_MINIMUM_NOT_VIABLE;
  }

  return LOCAL_FINISH_DRAFT_STATUS.READY;
}

function createFinishDraftStatusLine(actionStatus) {
  if (actionStatus === LOCAL_FINISH_DRAFT_STATUS.READY) {
    return "Ready to finish local draft";
  }

  if (actionStatus === LOCAL_FINISH_DRAFT_STATUS.BLOCKED_ALREADY_FINISHED) {
    return "Draft already finished locally";
  }

  if (actionStatus === LOCAL_FINISH_DRAFT_STATUS.BLOCKED_MINIMUM_NOT_VIABLE) {
    return "Finish Draft blocked - minimum roster not viable";
  }

  return "Finish Draft blocked";
}

function createFinishDraftNoteLine(actionStatus, progress) {
  if (actionStatus === LOCAL_FINISH_DRAFT_STATUS.READY) {
    return "Finish Draft opens the recap. Week 1 setup remains locked.";
  }

  if (actionStatus === LOCAL_FINISH_DRAFT_STATUS.BLOCKED_MINIMUM_NOT_VIABLE) {
    return `Sign at least ${progress.minimumViableRosterCount} superstars before finishing the draft.`;
  }

  if (actionStatus === LOCAL_FINISH_DRAFT_STATUS.BLOCKED_ALREADY_FINISHED) {
    return "This draft is not saved yet. Reload resets draft progress.";
  }

  return "Select a brand before finishing the draft.";
}

function createBlockedButtonLabel(actionStatus) {
  if (actionStatus === IN_MEMORY_MAKE_PICK_STATUS.BLOCKED_LOCAL_DRAFT_FINISHED) {
    return "Draft Finished";
  }

  if (actionStatus === IN_MEMORY_MAKE_PICK_STATUS.BLOCKED_NO_DRAFT_CONTINUATION) {
    return "Draft Paused";
  }

  if (actionStatus === IN_MEMORY_MAKE_PICK_STATUS.BLOCKED_ALREADY_DRAFTED) {
    return "Already Drafted";
  }

  if (actionStatus === IN_MEMORY_MAKE_PICK_STATUS.BLOCKED_UNAFFORDABLE_CANDIDATE) {
    return "Budget Too Low";
  }

  return "Make Pick Locked";
}

function createReadinessStatusLine(actionStatus) {
  if (actionStatus === IN_MEMORY_MAKE_PICK_STATUS.READY) {
    return "Ready to make pick";
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

  if (actionStatus === IN_MEMORY_MAKE_PICK_STATUS.BLOCKED_UNAFFORDABLE_CANDIDATE) {
    return "Make Pick blocked - not enough draft budget";
  }

  if (actionStatus === IN_MEMORY_MAKE_PICK_STATUS.BLOCKED_LOCAL_DRAFT_FINISHED) {
    return "Draft finished";
  }

  if (actionStatus === IN_MEMORY_MAKE_PICK_STATUS.BLOCKED_NO_DRAFT_CONTINUATION) {
    return "Draft cannot continue - no affordable wrestlers remain";
  }

  return "Make Pick blocked - selection incomplete";
}

function createReadinessNoteLine(
  actionStatus,
  candidateFinanceProjection,
  miniDraftProgress
) {
  if (actionStatus === IN_MEMORY_MAKE_PICK_STATUS.READY) {
    if (
      candidateFinanceProjection &&
      candidateFinanceProjection.budgetPreviewAfterSigning <
        miniDraftProgress.bookingReserveBudget
    ) {
      return "This signing dips into your booking reserve. You can still sign, but Week 1 booking funds may be tight.";
    }

    return "Make Pick signs this wrestler to your draft roster and updates the budget.";
  }

  if (actionStatus === IN_MEMORY_MAKE_PICK_STATUS.BLOCKED_UNAVAILABLE_CANDIDATE) {
    return "Unavailable candidates cannot be picked.";
  }

  if (actionStatus === IN_MEMORY_MAKE_PICK_STATUS.BLOCKED_ALREADY_DRAFTED) {
    return "Choose another available wrestler for the next pick.";
  }

  if (actionStatus === IN_MEMORY_MAKE_PICK_STATUS.BLOCKED_UNAFFORDABLE_CANDIDATE) {
    const neededBudget = readPositiveOrZeroNumber(
      candidateFinanceProjection?.projectedSigningCost,
      0
    );
    const remainingBudget = readPositiveOrZeroNumber(
      miniDraftProgress?.remainingDraftBudget,
      0
    );

    return `Not enough draft budget. Need ${neededBudget} budget, you have ${remainingBudget}.`;
  }

  if (actionStatus === IN_MEMORY_MAKE_PICK_STATUS.BLOCKED_LOCAL_DRAFT_FINISHED) {
    return "Draft finished. This draft is not saved yet, and Week 1 setup remains locked.";
  }

  if (actionStatus === IN_MEMORY_MAKE_PICK_STATUS.BLOCKED_NO_DRAFT_CONTINUATION) {
    return "No available affordable wrestlers remain on this draft board.";
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

  const completedPickSummaries = Array.isArray(progress.completedPickSummaries)
    ? progress.completedPickSummaries.slice()
    : [];
  const draftedCandidateIds = Array.isArray(progress.draftedCandidateIds)
    ? progress.draftedCandidateIds.filter((candidateId) => readString(candidateId))
    : completedPickSummaries
        .map((summary) => readString(summary?.candidateId))
        .filter(Boolean);
  const currentPickIndex = readPositiveOrZeroNumber(
    progress.currentPickIndex,
    completedPickSummaries.length
  );
  const signedTalentCount = readPositiveOrZeroNumber(
    progress.signedTalentCount,
    completedPickSummaries.length
  );
  const startingDraftBudget = readPositiveOrZeroNumber(
    progress.startingDraftBudget,
    NEW_GM_MODE_DRAFT_FINANCE_STARTING_BUDGET_PLACEHOLDER
  );
  const budgetSpent = readPositiveOrZeroNumber(
    progress.budgetSpent,
    completedPickSummaries.reduce(
      (total, summary) =>
        total + readPositiveOrZeroNumber(summary?.signingCost, 0),
      0
    )
  );
  const remainingDraftBudget = readPositiveOrZeroNumber(
    progress.remainingDraftBudget,
    Math.max(0, startingDraftBudget - budgetSpent)
  );
  const minimumViableRosterCount = readPositiveNumber(
    progress.minimumViableRosterCount ?? progress.minimumRosterTarget,
    NEW_GM_MODE_DRAFT_FINANCE_MINIMUM_ROSTER_TARGET_PLACEHOLDER
  );
  const bookingReserveBudget = readPositiveOrZeroNumber(
    progress.bookingReserveBudget,
    NEW_GM_MODE_DRAFT_FINANCE_BOOKING_RESERVE_PLACEHOLDER
  );
  const localDraftFinished =
    Boolean(progress.localDraftFinished) || Boolean(progress.miniDraftComplete);
  const minimumRosterViable = signedTalentCount >= minimumViableRosterCount;
  const bookingReserveProtected = remainingDraftBudget >= bookingReserveBudget;
  const draftCanContinue =
    !localDraftFinished &&
    hasAvailableAffordableCandidate({
      draftedCandidateIds,
      remainingDraftBudget,
    });
  const currentDraftSlot = createDraftSlotForIndex(currentPickIndex);

  return Object.freeze({
    progressKind: "playable-new-gm-mode-local-finance-limited-draft-progress",
    version: "0.1",
    localOnly: true,
    inMemoryOnly: true,
    persisted: false,
    startingDraftBudget,
    remainingDraftBudget,
    budgetSpent,
    signedTalentCount,
    minimumViableRosterCount,
    minimumRosterTarget: minimumViableRosterCount,
    bookingReserveBudget,
    minimumRosterViable,
    bookingReserveProtected,
    draftCanContinue,
    localDraftFinished,
    currentPickIndex,
    selectedBrandReference: createSelectedBrandReference(
      progress.selectedBrandReference || progress.selectedBrand
    ),
    currentDraftSlot,
    completedPickSummaries: Object.freeze(completedPickSummaries),
    draftedCandidateIds: Object.freeze(draftedCandidateIds),
    miniDraftComplete: localDraftFinished,
    displayLabels: Object.freeze({
      progressLine: localDraftFinished
        ? `Draft finished locally: ${signedTalentCount} signed`
        : `Pick ${currentPickIndex + 1}`,
      statusLine: localDraftFinished
        ? "Draft Finished Locally"
        : minimumRosterViable
          ? "Minimum roster viable - draft still open"
          : "Finance-limited draft in progress",
      budgetLine: `Budget remaining: ${remainingDraftBudget}`,
      viabilityLine: minimumRosterViable
        ? `Minimum roster viable: ${signedTalentCount} of ${minimumViableRosterCount}`
        : `Minimum roster not viable: ${signedTalentCount} of ${minimumViableRosterCount}`,
      reserveLine: bookingReserveProtected
        ? "Booking reserve protected"
        : "Booking reserve dipped",
      noteLine: "Local preview only. Reload resets draft progress.",
    }),
  });
}

function appendPickSummaryToProgress({ progress, pickSummary, selectedBrand }) {
  const normalizedProgress = normalizeMiniDraftProgress(progress);
  const completedPickSummaries = [
    ...normalizedProgress.completedPickSummaries,
    pickSummary,
  ];
  const draftedCandidateIds = [
    ...normalizedProgress.draftedCandidateIds,
    pickSummary.candidateId,
  ].filter(Boolean);
  const signingCost = readPositiveOrZeroNumber(pickSummary.signingCost, 0);
  const budgetSpent = normalizedProgress.budgetSpent + signingCost;
  const remainingDraftBudget = Math.max(
    0,
    normalizedProgress.remainingDraftBudget - signingCost
  );
  const currentPickIndex = completedPickSummaries.length;

  return normalizeMiniDraftProgress({
    ...normalizedProgress,
    currentPickIndex,
    selectedBrandReference: createSelectedBrandReference(selectedBrand),
    currentDraftSlot: createDraftSlotForIndex(currentPickIndex),
    completedPickSummaries,
    draftedCandidateIds,
    remainingDraftBudget,
    budgetSpent,
    signedTalentCount: normalizedProgress.signedTalentCount + 1,
    localDraftFinished: false,
    miniDraftComplete: false,
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
  financeProjection,
  budgetBeforeSigning,
  bookingReserveBudget,
  pickSource,
}) {
  const completedInMemory =
    flowResult?.draftCompletionSummary?.draftCompletionPhase ===
    "draft-complete-in-memory-roster-created-gameplay-start-blocked";
  const candidateName = readString(selectedCandidate?.name) || "Drafted candidate";
  const brandLabel = readString(selectedBrand?.brandLabel) || "Selected brand";
  const gmName = readString(selectedGm?.displayName) || "GM preview missing";
  const pickLabel = createPickLabel(draftSlot);
  const signingTier =
    readString(financeProjection?.projectedSigningTier) || "Locked pending rules";
  const signingCost = readPositiveOrZeroNumber(
    financeProjection?.projectedSigningCost,
    0
  );
  const budgetBefore = readPositiveOrZeroNumber(
    budgetBeforeSigning,
    financeProjection?.remainingDraftBudgetPreview ?? 0
  );
  const budgetAfterSigning = budgetBefore - signingCost;
  const source = pickSource === "auto-fill" ? "auto-fill" : "manual";
  const bookingReserveAfterSigning = budgetAfterSigning >=
    readPositiveOrZeroNumber(bookingReserveBudget, 0);

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
    signingTier,
    signingCost,
    sourceRosterPool:
      readString(financeProjection?.sourceRosterPool) || "Roster",
    divisionCategory:
      formatDivisionCategoryLabel(financeProjection?.divisionCategory),
    pickSource: source,
    budgetBeforeSigning: budgetBefore,
    budgetAfterSigning,
    bookingReserveAfterSigning,
    reserveWarningLine: bookingReserveAfterSigning
      ? "Booking reserve protected"
      : "This signing dips into your booking reserve",
    affordabilityStatus:
      financeProjection?.affordabilityStatus || "locked-pending-rules",
    displayLabel: `${pickLabel}: ${candidateName} (${brandLabel}, ${source === "auto-fill" ? "Auto-Fill, " : ""}${signingTier}, Cost ${signingCost})`,
    displayStatusLine: completedInMemory
      ? "Pick recorded locally"
      : "Pick blocked locally",
  });
}

function createPostDraftRosterTalentCard(summary, index, brandLabel) {
  const pickNumber = readPositiveNumber(summary?.pickNumber, index + 1);
  const pickSource = readString(summary?.pickSource) === "auto-fill"
    ? "Auto-Filled"
    : "Manual";
  const activeBrandLabel = readString(brandLabel) || "Selected brand";
  const sourceRosterPool = readString(summary?.sourceRosterPool) || "Roster";

  return Object.freeze({
    displayName: readString(summary?.candidateName) || "Signed superstar",
    activeBrandLabel,
    signedToBrandLine: `Signed to ${activeBrandLabel}`,
    sourceRosterPool,
    draftedFromLine: `Drafted From ${sourceRosterPool}`,
    signingTier: readString(summary?.signingTier) || "Locked pending rules",
    signingCost: readPositiveOrZeroNumber(summary?.signingCost, 0),
    pickSource,
    pickNumber,
    pickLabel: readString(summary?.pickLabel) || `Pick ${pickNumber}`,
    divisionCategory:
      readString(summary?.divisionCategory) || "Men's division",
    signedStatus: "Signed",
    bookingReserveStatus: summary?.bookingReserveAfterSigning
      ? "Reserve protected"
      : "Reserve dipped",
  });
}

function createLockedSetupCard(label, status) {
  return Object.freeze({
    label,
    status,
    displayOnly: true,
    locked: true,
  });
}

function createPickListLabel(pickSummaries) {
  if (!pickSummaries.length) {
    return "No local picks recorded";
  }

  return pickSummaries.map((summary) => summary.displayLabel).join(" | ");
}

function hasAvailableAffordableCandidate({
  draftedCandidateIds,
  remainingDraftBudget,
}) {
  const candidateObjectSet = createNewGMModeDraftPickCandidateObjects();
  return collectAutoFillCandidateOptions({
    progress: {
      draftedCandidateIds,
      remainingDraftBudget,
      bookingReserveBudget: 0,
    },
    candidateObjectSet,
    preserveBookingReserve: false,
  }).length > 0;
}

function collectAutoFillCandidateOptions({
  progress,
  candidateObjectSet,
  preserveBookingReserve,
}) {
  const normalizedDraftedIds = Array.isArray(progress.draftedCandidateIds)
    ? progress.draftedCandidateIds
    : [];
  const remainingDraftBudget = readPositiveOrZeroNumber(
    progress.remainingDraftBudget,
    NEW_GM_MODE_DRAFT_FINANCE_STARTING_BUDGET_PLACEHOLDER
  );
  const bookingReserveBudget = preserveBookingReserve
    ? readPositiveOrZeroNumber(progress.bookingReserveBudget, 0)
    : 0;
  const projection = createNewGMModeDraftFinanceProjection({
    candidateObjectSet,
    remainingDraftBudgetPreview: remainingDraftBudget,
    alreadyDraftedCandidateIds: normalizedDraftedIds,
  });

  return candidateObjectSet.candidates
    .map((candidate) => {
      const candidateProjection = projection.candidateProjections.find(
        (projectedCandidate) =>
          projectedCandidate.candidateObjectId === candidate.candidateId
      );

      return Object.freeze({
        domainCandidate: candidate,
        candidateProjection,
        selectedCandidate: Object.freeze({
          candidateId: createUiCandidateIdFromDomainCandidate(candidate),
          name:
            candidateProjection?.displayName ||
            candidate.wrestlerIdentityReference.slug,
          availability:
            candidate.eligibilityStatus === "eligible" ? "Available" : "Unavailable",
        }),
      });
    })
    .filter((option) => {
      const candidateId = option.selectedCandidate.candidateId;
      const cost = readPositiveOrZeroNumber(
        option.candidateProjection?.projectedSigningCost,
        0
      );
      const budgetAfterSigning = remainingDraftBudget - cost;

      return (
        option.domainCandidate.eligibilityStatus === "eligible" &&
        !normalizedDraftedIds.includes(candidateId) &&
        !normalizedDraftedIds.includes(option.domainCandidate.candidateId) &&
        cost <= remainingDraftBudget &&
        budgetAfterSigning >= bookingReserveBudget
      );
    })
    .sort((left, right) => {
      const leftCost = readPositiveOrZeroNumber(
        left.candidateProjection?.projectedSigningCost,
        0
      );
      const rightCost = readPositiveOrZeroNumber(
        right.candidateProjection?.projectedSigningCost,
        0
      );

      if (leftCost !== rightCost) {
        return leftCost - rightCost;
      }

      return (
        left.domainCandidate.sourceFixtureReference.fixtureIndex -
        right.domainCandidate.sourceFixtureReference.fixtureIndex
      );
    });
}

function createFinanceProjectionForCandidate({ selectedCandidate, miniDraftProgress }) {
  const candidateId = readString(selectedCandidate?.candidateId);

  if (!candidateId) {
    return undefined;
  }

  const progress = normalizeMiniDraftProgress(miniDraftProgress);
  const projection = createNewGMModeDraftFinanceProjection({
    selectedCandidateId: candidateId,
    remainingDraftBudgetPreview: progress.remainingDraftBudget,
    alreadyDraftedCandidateIds: progress.draftedCandidateIds,
  });

  return projection.selectedCandidateProjection;
}

function createUiCandidateIdFromDomainCandidate(candidate) {
  return `candidate-${candidate.sourceFixtureReference.fixtureSlug.replace(
    /^fixture-wrestler-\d+-/,
    ""
  )}`;
}

function formatDivisionCategoryLabel(divisionCategory) {
  if (divisionCategory === "women") {
    return "Women's division";
  }

  if (divisionCategory === "tag") {
    return "Tag category";
  }

  return "Men's division";
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
