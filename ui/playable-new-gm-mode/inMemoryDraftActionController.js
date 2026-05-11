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
  BLOCKED_ALREADY_COMPLETED: "blocked-already-completed",
  BLOCKED_DOMAIN_CANDIDATE_MISSING: "blocked-domain-candidate-missing",
  SUCCEEDED: "in-memory-make-pick-succeeded",
  DOMAIN_BLOCKED: "in-memory-make-pick-domain-blocked",
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
  completedInMemoryDraftResult,
} = {}) {
  const blockedReasonIds = [];

  if (completedInMemoryDraftResult?.actionStatus === IN_MEMORY_MAKE_PICK_STATUS.SUCCEEDED) {
    blockedReasonIds.push("in-memory-draft-pick-already-completed");
  }

  if (!readString(selectedCandidate?.candidateId)) {
    blockedReasonIds.push("candidate-selection-missing");
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

export function executeInMemoryMakePick(input = {}, services = DEFAULT_SERVICES) {
  const readiness = createMakePickReadiness(input);

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
    draftRound: input.draftSlot.roundNumber,
    draftPickNumber: input.draftSlot.pickNumber,
  });
  const flowResult = services.runInMemoryDraftFlow({
    selectionIntentObject,
    candidateObjectSetOverride: candidateObjectSet,
  });
  const projection = createDraftRecapProjection({
    flowResult,
    selectedCandidate: input.selectedCandidate,
    selectedBrand: input.selectedBrand,
    selectedGm: input.selectedGm,
    draftSlot: input.draftSlot,
  });
  const succeeded = projection.completedInMemory;

  return Object.freeze({
    actionStatus: succeeded
      ? IN_MEMORY_MAKE_PICK_STATUS.SUCCEEDED
      : IN_MEMORY_MAKE_PICK_STATUS.DOMAIN_BLOCKED,
    localOnly: true,
    inMemoryOnly: true,
    persisted: false,
    selectionIntentObject,
    flowResult,
    projection,
    capabilityFlags: Object.freeze({
      canAutoDraft: false,
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
  flowResult,
  selectedCandidate,
  selectedBrand,
  selectedGm,
  draftSlot,
}) {
  const completedInMemory =
    flowResult?.draftCompletionSummary?.draftCompletionPhase ===
    "draft-complete-in-memory-roster-created-gameplay-start-blocked";
  const candidateName = readString(selectedCandidate?.name) || "Drafted candidate";
  const brandLabel = readString(selectedBrand?.brandLabel) || "Selected brand";
  const gmName = readString(selectedGm?.displayName) || "GM preview missing";
  const pickLabel = createPickLabel(draftSlot);
  const membershipCount = readNumber(
    flowResult?.draftCompletionSummary?.rosterMembershipCount,
    0
  );

  return Object.freeze({
    projectionKind: "real-in-memory-draft-result-projection",
    version: "0.1",
    localOnly: true,
    inMemoryOnly: true,
    persisted: false,
    completedInMemory,
    selectedBrandLabel: brandLabel,
    selectedGmLabel: gmName,
    draftedCandidateLabel: candidateName,
    pickSlotLabel: pickLabel,
    rosterMembershipCount: membershipCount,
    displayLabels: Object.freeze({
      recapStatusLine: completedInMemory
        ? "Real In-Memory Draft Result - not saved"
        : "In-Memory Draft Blocked - not saved",
      pathLine: "Real in-memory draft path",
      titleLine: `${brandLabel} in-memory draft recap`,
      rosterLine: completedInMemory
        ? `${brandLabel} local roster preview created`
        : `${brandLabel} local roster preview blocked`,
      copyLine: completedInMemory
        ? "This recap is backed by the approved Real Draft System v1 in-memory flow. It is still local-only and resets on reload."
        : "The Real Draft System v1 flow returned a blocked in-memory result. No saved roster exists.",
      gmLine: gmName,
      brandLine: `${brandLabel} local in-memory result`,
      candidateLine: `${candidateName} drafted in memory`,
      pickLine: pickLabel,
      draftResultStatusLine: createDraftResultStatusLine(flowResult),
      rosterStatusLine: createRosterStatusLine(flowResult),
      noteLine:
        "Local-only result. No save, persistence, Week 1 initialization, booking, or gameplay start occurred.",
      dashboardLine: completedInMemory
        ? "Local in-memory draft result available. Week 1 gameplay and saving remain locked."
        : "Week 1 Setup preview - draft result blocked and gameplay remains locked.",
    }),
    blockedCapabilityLabels: Object.freeze([
      "Auto Draft remains locked",
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
  if (blockedReasonIds.includes("in-memory-draft-pick-already-completed")) {
    return IN_MEMORY_MAKE_PICK_STATUS.BLOCKED_ALREADY_COMPLETED;
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
  if (actionStatus === IN_MEMORY_MAKE_PICK_STATUS.BLOCKED_ALREADY_COMPLETED) {
    return "Pick Complete";
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

  if (actionStatus === IN_MEMORY_MAKE_PICK_STATUS.BLOCKED_ALREADY_COMPLETED) {
    return "In-memory pick already completed";
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

  if (actionStatus === IN_MEMORY_MAKE_PICK_STATUS.BLOCKED_ALREADY_COMPLETED) {
    return "Reload resets this local-only draft result.";
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

function createDraftResultStatusLine(flowResult) {
  if (
    flowResult?.draftPickObject?.draftPickStatus ===
      "draft-pick-created-execution-ready" &&
    flowResult?.executionResultObject?.executionStatus ===
      "draft-pick-executed-roster-assignment-ready"
  ) {
    return "Pick executed in local memory";
  }

  return "Pick blocked in local memory";
}

function createRosterStatusLine(flowResult) {
  if (
    flowResult?.rosterAssignmentResultObject?.assignmentStatus ===
      "roster-assignment-created-roster-state-ready" &&
    flowResult?.rosterStateObject?.rosterStateStatus ===
      "roster-state-created-draft-complete-gameplay-start-blocked"
  ) {
    return "Roster preview created in local memory";
  }

  return "Roster preview blocked";
}

function isValidDraftSlot(draftSlot) {
  return (
    Number.isFinite(draftSlot?.roundNumber) &&
    draftSlot.roundNumber > 0 &&
    Number.isFinite(draftSlot?.pickNumber) &&
    draftSlot.pickNumber > 0
  );
}

function readNumber(value, fallback) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function readString(value) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}
