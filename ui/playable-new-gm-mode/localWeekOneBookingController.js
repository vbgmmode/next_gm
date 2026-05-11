import {
  createLocalSetupRosterOptions,
  createWeekOneHqProjection,
} from "./localPostDraftSetupController.js";

export const LOCAL_WEEK_ONE_SEGMENT_TYPES = Object.freeze([
  Object.freeze({
    segmentType: "singles-match",
    label: "Singles Match",
    mainEvent: false,
  }),
  Object.freeze({
    segmentType: "promo",
    label: "Promo",
    mainEvent: false,
  }),
  Object.freeze({
    segmentType: "main-event-singles-match",
    label: "Main Event Singles Match",
    mainEvent: true,
  }),
]);

export function createInitialLocalWeekOneBookingState() {
  return freezeBookingState({
    nextSegmentIdNumber: 1,
    segments: [],
  });
}

export function createWeekOneBookingProjection({
  selectedBrand,
  miniDraftProgress,
  setupState,
  bookingState,
} = {}) {
  const hqProjection = createWeekOneHqProjection({
    selectedBrand,
    miniDraftProgress,
    setupState,
  });
  const currentState = normalizeBookingState(bookingState);
  const rosterOptions = createLocalSetupRosterOptions(miniDraftProgress, {
    selectedBrand,
  });
  const projectedSegments = currentState.segments.map((segment, index) =>
    createSegmentProjection({ segment, segmentNumber: index + 1, rosterOptions })
  );
  const segmentCount = projectedSegments.length;
  const hasMainEvent = projectedSegments.some((segment) => segment.mainEvent);
  const readyToRunComingNext =
    hqProjection.unlocked && segmentCount > 0 && hasMainEvent;

  return Object.freeze({
    locked: !hqProjection.unlocked,
    brandLabel: hqProjection.brandLabel,
    rosterOptions,
    signedRosterCount: hqProjection.signedRosterCount,
    remainingDraftBudget: hqProjection.remainingDraftBudget,
    champions: hqProjection.champions,
    rivalries: hqProjection.rivalries,
    segments: Object.freeze(projectedSegments),
    status: Object.freeze({
      segmentCount,
      hasMainEvent,
      readyToRunComingNext,
    }),
    displayLabels: Object.freeze({
      titleLine: "Week 1 Booking",
      localOnlyLine: "Local Session Only / Not Saved Yet",
      statusLine: hqProjection.unlocked
        ? "Build the first local Week 1 show card."
        : "Complete draft setup before booking Week 1.",
      segmentCountLine: `Segments ${segmentCount}`,
      mainEventLine: hasMainEvent ? "Main Event Set" : "Main Event Needed",
      readyLine: readyToRunComingNext
        ? "Ready to Run: Coming Next"
        : "Run Show Locked",
      runShowLabel: "Run Show - Coming Next",
    }),
  });
}

export function addLocalWeekOneBookingSegment({
  selectedBrand,
  miniDraftProgress,
  setupState,
  bookingState,
  segmentInput,
} = {}) {
  const projection = createWeekOneBookingProjection({
    selectedBrand,
    miniDraftProgress,
    setupState,
    bookingState,
  });
  const currentState = normalizeBookingState(bookingState);
  const segmentType = normalizeSegmentType(segmentInput?.segmentType);

  if (projection.locked) {
    return createBlockedResult({
      actionStatus: "week-one-booking-locked",
      bookingState: currentState,
      projection,
      statusLine: "Complete draft setup before booking Week 1.",
    });
  }

  if (segmentType === "promo") {
    const featuredWrestlerId = normalizeRosterSelection(
      segmentInput?.featuredWrestlerId,
      projection.rosterOptions
    );

    if (!featuredWrestlerId) {
      return createBlockedResult({
        actionStatus: "week-one-booking-missing-wrestler",
        bookingState: currentState,
        projection,
        statusLine: "Choose signed talent for the promo.",
      });
    }

    return createAddedSegmentResult({
      selectedBrand,
      miniDraftProgress,
      setupState,
      currentState,
      segment: {
        segmentType,
        featuredWrestlerId,
      },
    });
  }

  const wrestlerAId = normalizeRosterSelection(
    segmentInput?.wrestlerAId,
    projection.rosterOptions
  );
  const wrestlerBId = normalizeRosterSelection(
    segmentInput?.wrestlerBId,
    projection.rosterOptions
  );

  if (!wrestlerAId || !wrestlerBId) {
    return createBlockedResult({
      actionStatus: "week-one-booking-missing-wrestler",
      bookingState: currentState,
      projection,
      statusLine: "Choose signed talent for both sides.",
    });
  }

  if (wrestlerAId === wrestlerBId) {
    return createBlockedResult({
      actionStatus: "week-one-booking-same-wrestler-blocked",
      bookingState: currentState,
      projection,
      statusLine: "Same wrestler cannot face themselves.",
    });
  }

  return createAddedSegmentResult({
    selectedBrand,
    miniDraftProgress,
    setupState,
    currentState,
    segment: {
      segmentType,
      wrestlerAId,
      wrestlerBId,
    },
  });
}

export function removeLocalWeekOneBookingSegment({
  bookingState,
  segmentId,
} = {}) {
  const currentState = normalizeBookingState(bookingState);
  const nextSegments = currentState.segments.filter(
    (segment) => segment.segmentId !== readString(segmentId)
  );

  return freezeBookingState({
    nextSegmentIdNumber: currentState.nextSegmentIdNumber,
    segments: nextSegments,
  });
}

function createAddedSegmentResult({
  selectedBrand,
  miniDraftProgress,
  setupState,
  currentState,
  segment,
}) {
  const nextIdNumber = currentState.nextSegmentIdNumber;
  const nextState = freezeBookingState({
    nextSegmentIdNumber: nextIdNumber + 1,
    segments: [
      ...currentState.segments,
      {
        segmentId: `week-one-segment-${nextIdNumber}`,
        ...segment,
      },
    ],
  });

  return Object.freeze({
    actionStatus: "week-one-booking-segment-added",
    bookingState: nextState,
    projection: createWeekOneBookingProjection({
      selectedBrand,
      miniDraftProgress,
      setupState,
      bookingState: nextState,
    }),
    displayLabels: Object.freeze({
      statusLine: "Segment added to the Week 1 show card.",
    }),
  });
}

function createBlockedResult({
  actionStatus,
  bookingState,
  projection,
  statusLine,
}) {
  return Object.freeze({
    actionStatus,
    bookingState,
    projection,
    displayLabels: Object.freeze({
      statusLine,
    }),
  });
}

function createSegmentProjection({ segment, segmentNumber, rosterOptions }) {
  const segmentType = normalizeSegmentType(segment?.segmentType);
  const segmentDefinition = findSegmentType(segmentType);
  const mainEvent = Boolean(segmentDefinition.mainEvent);

  if (segmentType === "promo") {
    const featuredWrestlerName = findRosterName(
      rosterOptions,
      segment?.featuredWrestlerId
    );

    return Object.freeze({
      segmentId: readString(segment?.segmentId) || `segment-${segmentNumber}`,
      segmentNumber,
      segmentType,
      typeLabel: segmentDefinition.label,
      mainEvent,
      featuredWrestlerId: readString(segment?.featuredWrestlerId) || "",
      featuredWrestlerName,
      talentLine: `${featuredWrestlerName} promo`,
      valid: featuredWrestlerName !== "Missing Wrestler",
    });
  }

  const wrestlerAName = findRosterName(rosterOptions, segment?.wrestlerAId);
  const wrestlerBName = findRosterName(rosterOptions, segment?.wrestlerBId);

  return Object.freeze({
    segmentId: readString(segment?.segmentId) || `segment-${segmentNumber}`,
    segmentNumber,
    segmentType,
    typeLabel: segmentDefinition.label,
    mainEvent,
    wrestlerAId: readString(segment?.wrestlerAId) || "",
    wrestlerBId: readString(segment?.wrestlerBId) || "",
    wrestlerAName,
    wrestlerBName,
    talentLine: `${wrestlerAName} vs ${wrestlerBName}`,
    valid:
      wrestlerAName !== "Missing Wrestler" &&
      wrestlerBName !== "Missing Wrestler" &&
      wrestlerAName !== wrestlerBName,
  });
}

function normalizeBookingState(bookingState) {
  if (!bookingState || typeof bookingState !== "object") {
    return createInitialLocalWeekOneBookingState();
  }

  const segments = Array.isArray(bookingState.segments)
    ? bookingState.segments
    : [];
  const nextSegmentIdNumber =
    typeof bookingState.nextSegmentIdNumber === "number" &&
    Number.isFinite(bookingState.nextSegmentIdNumber) &&
    bookingState.nextSegmentIdNumber > 0
      ? Math.floor(bookingState.nextSegmentIdNumber)
      : segments.length + 1;

  return freezeBookingState({
    nextSegmentIdNumber,
    segments: segments.map((segment, index) => ({
      segmentId: readString(segment?.segmentId) || `week-one-segment-${index + 1}`,
      segmentType: normalizeSegmentType(segment?.segmentType),
      wrestlerAId: readString(segment?.wrestlerAId) || "",
      wrestlerBId: readString(segment?.wrestlerBId) || "",
      featuredWrestlerId: readString(segment?.featuredWrestlerId) || "",
    })),
  });
}

function freezeBookingState(state) {
  return Object.freeze({
    nextSegmentIdNumber: state.nextSegmentIdNumber,
    segments: Object.freeze(
      state.segments.map((segment) => Object.freeze({ ...segment }))
    ),
  });
}

function normalizeSegmentType(value) {
  const segmentType = readString(value);
  return LOCAL_WEEK_ONE_SEGMENT_TYPES.some(
    (type) => type.segmentType === segmentType
  )
    ? segmentType
    : "singles-match";
}

function findSegmentType(segmentType) {
  return (
    LOCAL_WEEK_ONE_SEGMENT_TYPES.find(
      (type) => type.segmentType === segmentType
    ) || LOCAL_WEEK_ONE_SEGMENT_TYPES[0]
  );
}

function normalizeRosterSelection(candidateId, rosterOptions) {
  const value = readString(candidateId);
  return rosterOptions.some((option) => option.candidateId === value)
    ? value
    : "";
}

function findRosterName(rosterOptions, candidateId) {
  const value = readString(candidateId);
  return (
    rosterOptions.find((option) => option.candidateId === value)?.displayName ||
    "Missing Wrestler"
  );
}

function readString(value) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}
