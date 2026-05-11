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

export function createInitialLocalWeeklyLoopState() {
  return freezeWeeklyLoopState({
    currentWeekNumber: 1,
    lastShowRecap: undefined,
    completedShowRecaps: [],
  });
}

export function createWeekOneBookingProjection({
  selectedBrand,
  miniDraftProgress,
  setupState,
  bookingState,
  weeklyState,
} = {}) {
  return createWeeklyBookingProjection({
    selectedBrand,
    miniDraftProgress,
    setupState,
    bookingState,
    weeklyState,
  });
}

export function createWeeklyHqProjection({
  selectedBrand,
  miniDraftProgress,
  setupState,
  weeklyState,
} = {}) {
  const hqProjection = createWeekOneHqProjection({
    selectedBrand,
    miniDraftProgress,
    setupState,
  });
  const currentWeeklyState = normalizeWeeklyLoopState(weeklyState);
  const weekNumber = currentWeeklyState.currentWeekNumber;
  const lastShowRecap = currentWeeklyState.lastShowRecap;

  return Object.freeze({
    ...hqProjection,
    weekNumber,
    lastShowRecap,
    completedShowCount: currentWeeklyState.completedShowRecaps.length,
    displayLabels: Object.freeze({
      ...hqProjection.displayLabels,
      titleLine: hqProjection.unlocked ? `Week ${weekNumber} HQ` : `Week ${weekNumber} HQ Locked`,
      statusLine: hqProjection.unlocked
        ? `Week ${weekNumber} HQ is open.`
        : `Finish draft setup to unlock Week ${weekNumber} HQ.`,
      bookingLine: hqProjection.unlocked ? `Book Week ${weekNumber} Show` : "Booking Locked",
      lastShowLine: lastShowRecap
        ? `Last Show: ${lastShowRecap.showGrade} / ${lastShowRecap.bestSegmentLine}`
        : "No show run yet",
      bookingNoteLine: hqProjection.unlocked
        ? `Build the Week ${weekNumber} show card.`
        : "Complete setup first",
    }),
  });
}

export function createWeeklyBookingProjection({
  selectedBrand,
  miniDraftProgress,
  setupState,
  bookingState,
  weeklyState,
} = {}) {
  const hqProjection = createWeekOneHqProjection({
    selectedBrand,
    miniDraftProgress,
    setupState,
  });
  const currentWeeklyState = normalizeWeeklyLoopState(weeklyState);
  const currentState = normalizeBookingState(bookingState);
  const rosterOptions = createLocalSetupRosterOptions(miniDraftProgress, {
    selectedBrand,
  });
  const projectedSegments = currentState.segments.map((segment, index) =>
    createSegmentProjection({ segment, segmentNumber: index + 1, rosterOptions })
  );
  const segmentCount = projectedSegments.length;
  const hasMainEvent = projectedSegments.some((segment) => segment.mainEvent);
  const readyToRun =
    hqProjection.unlocked &&
    segmentCount > 0 &&
    hasMainEvent &&
    projectedSegments.every((segment) => segment.valid);

  return Object.freeze({
    locked: !hqProjection.unlocked,
    weekNumber: currentWeeklyState.currentWeekNumber,
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
      readyToRun,
      readyToRunComingNext: readyToRun,
    }),
    displayLabels: Object.freeze({
      titleLine: `Week ${currentWeeklyState.currentWeekNumber} Booking`,
      localOnlyLine: "Local Session Only / Not Saved Yet",
      statusLine: hqProjection.unlocked
        ? `Build the Week ${currentWeeklyState.currentWeekNumber} local show card.`
        : `Complete draft setup before booking Week ${currentWeeklyState.currentWeekNumber}.`,
      segmentCountLine: `Segments ${segmentCount}`,
      mainEventLine: hasMainEvent ? "Main Event Set" : "Main Event Needed",
      readyLine: readyToRun
        ? "Ready to Run"
        : "Run Show Locked",
      runShowLabel: readyToRun ? "Run Show" : "Run Show Locked",
    }),
  });
}

export function addLocalWeekOneBookingSegment({
  selectedBrand,
  miniDraftProgress,
  setupState,
  bookingState,
  weeklyState,
  segmentInput,
} = {}) {
  const projection = createWeekOneBookingProjection({
    selectedBrand,
    miniDraftProgress,
    setupState,
    bookingState,
    weeklyState,
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
      weeklyState,
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
    weeklyState,
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
  weeklyState,
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
      weeklyState,
    }),
    displayLabels: Object.freeze({
      statusLine: "Segment added to the Week 1 show card.",
    }),
  });
}

export function runLocalWeeklyShow({
  selectedBrand,
  miniDraftProgress,
  setupState,
  bookingState,
  weeklyState,
} = {}) {
  const projection = createWeeklyBookingProjection({
    selectedBrand,
    miniDraftProgress,
    setupState,
    bookingState,
    weeklyState,
  });
  const currentWeeklyState = normalizeWeeklyLoopState(weeklyState);

  if (projection.locked) {
    return createRunShowBlockedResult({
      actionStatus: "local-show-run-locked",
      weeklyState: currentWeeklyState,
      projection,
      statusLine: "Complete draft setup before running a show.",
    });
  }

  if (!projection.status.readyToRun) {
    return createRunShowBlockedResult({
      actionStatus: "local-show-run-card-incomplete",
      weeklyState: currentWeeklyState,
      projection,
      statusLine: "Add at least one segment and a main event before running the show.",
    });
  }

  const recap = createLocalShowRecap({
    projection,
    setupState,
    weeklyState: currentWeeklyState,
  });
  const nextWeeklyState = freezeWeeklyLoopState({
    currentWeekNumber: currentWeeklyState.currentWeekNumber,
    lastShowRecap: recap,
    completedShowRecaps: [
      ...currentWeeklyState.completedShowRecaps.filter(
        (show) => show.weekNumber !== recap.weekNumber
      ),
      recap,
    ],
  });

  return Object.freeze({
    actionStatus: "local-weekly-show-ran",
    weeklyState: nextWeeklyState,
    recap,
    projection,
    displayLabels: Object.freeze({
      statusLine: `${recap.weekLabel} complete. Review the recap and advance when ready.`,
    }),
  });
}

export function advanceLocalWeek({ weeklyState } = {}) {
  const currentWeeklyState = normalizeWeeklyLoopState(weeklyState);
  const lastShowRecap = currentWeeklyState.lastShowRecap;

  if (!lastShowRecap) {
    return Object.freeze({
      actionStatus: "local-week-advance-blocked",
      weeklyState: currentWeeklyState,
      displayLabels: Object.freeze({
        statusLine: "Run this week's show before advancing.",
      }),
    });
  }

  const nextWeekNumber = Math.max(
    currentWeeklyState.currentWeekNumber + 1,
    lastShowRecap.weekNumber + 1
  );
  const nextWeeklyState = freezeWeeklyLoopState({
    currentWeekNumber: nextWeekNumber,
    lastShowRecap,
    completedShowRecaps: currentWeeklyState.completedShowRecaps,
  });

  return Object.freeze({
    actionStatus: "local-week-advanced",
    weeklyState: nextWeeklyState,
    displayLabels: Object.freeze({
      statusLine: `Advanced to Week ${nextWeekNumber} HQ.`,
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

function createRunShowBlockedResult({
  actionStatus,
  weeklyState,
  projection,
  statusLine,
}) {
  return Object.freeze({
    actionStatus,
    weeklyState,
    projection,
    displayLabels: Object.freeze({
      statusLine,
    }),
  });
}

function createLocalShowRecap({ projection, setupState, weeklyState }) {
  const currentSetupState = setupState && typeof setupState === "object"
    ? setupState
    : {};
  const championIds = new Set(
    Object.values(currentSetupState.champions || {}).filter(Boolean)
  );
  const rivalries = Array.isArray(currentSetupState.rivalries)
    ? currentSetupState.rivalries.filter((rivalry) => rivalry?.wrestlerAId && rivalry?.wrestlerBId)
    : [];
  const segmentResults = projection.segments.map((segment) =>
    createSegmentResult({ segment, championIds, rivalries, rosterOptions: projection.rosterOptions })
  );
  const bestSegment = findBestSegment(segmentResults);
  const weakSegment = findWeakSegment(segmentResults, bestSegment);
  const championSpotlight = createChampionSpotlight({
    segmentResults,
    championIds,
    rosterOptions: projection.rosterOptions,
  });
  const rivalrySpotlight = createRivalrySpotlight({
    segmentResults,
    rivalries,
    rosterOptions: projection.rosterOptions,
  });
  const showGrade = createShowGrade(segmentResults);
  const crowdRead = createCrowdRead(showGrade);
  const weekNumber = normalizeWeeklyLoopState(weeklyState).currentWeekNumber;

  return freezeShowRecap({
    recapId: `local-week-${weekNumber}-recap`,
    weekNumber,
    weekLabel: `Week ${weekNumber}`,
    brandLabel: projection.brandLabel,
    showGrade,
    crowdRead,
    bestSegmentLine: bestSegment
      ? `${bestSegment.typeLabel}: ${bestSegment.talentLine}`
      : "No standout segment",
    weakSegmentLine: weakSegment
      ? `${weakSegment.typeLabel}: ${weakSegment.talentLine}`
      : "No weak segment",
    championSpotlight,
    rivalrySpotlight,
    momentumNote:
      showGrade === "A" || showGrade === "B"
        ? "Momentum: Up"
        : "Momentum: Steady",
    fanResponseNote: `Fan Response: ${crowdRead}`,
    budgetNote: "Budget: No major change in this local session",
    localOnlyLine: "Local Session Only / Not Saved Yet",
    segmentResults,
  });
}

function createSegmentResult({
  segment,
  championIds,
  rivalries,
  rosterOptions,
}) {
  const wrestlerIds = getSegmentWrestlerIds(segment);
  const championInvolved = wrestlerIds.some((candidateId) =>
    championIds.has(candidateId)
  );
  const rivalryInvolved = rivalries.some((rivalry) =>
    wrestlerIds.includes(rivalry.wrestlerAId) &&
    wrestlerIds.includes(rivalry.wrestlerBId)
  );
  const spotlightBonus = (championInvolved ? 1 : 0) + (rivalryInvolved ? 1 : 0);
  const qualityBand = createSegmentQualityBand({
    segment,
    spotlightBonus,
  });

  return Object.freeze({
    segmentNumber: segment.segmentNumber,
    segmentType: segment.segmentType,
    typeLabel: segment.typeLabel,
    talentLine: segment.talentLine,
    mainEvent: segment.mainEvent,
    championInvolved,
    rivalryInvolved,
    qualityBand,
    resultLine: createSegmentResultLine({ segment, qualityBand }),
    participantNames: Object.freeze(
      wrestlerIds.map((candidateId) => findRosterName(rosterOptions, candidateId))
    ),
  });
}

function createSegmentQualityBand({ segment, spotlightBonus }) {
  if (segment.mainEvent && spotlightBonus > 0) {
    return "Standout";
  }

  if (segment.mainEvent || spotlightBonus > 1) {
    return "Strong";
  }

  if (segment.segmentType === "promo" && spotlightBonus > 0) {
    return "Strong";
  }

  return "Solid";
}

function createSegmentResultLine({ segment, qualityBand }) {
  if (segment.segmentType === "promo") {
    return `${qualityBand} promo segment.`;
  }

  return segment.mainEvent
    ? `${qualityBand} main event match.`
    : `${qualityBand} singles match.`;
}

function createShowGrade(segmentResults) {
  const hasStandout = segmentResults.some((segment) => segment.qualityBand === "Standout");
  const hasMainEvent = segmentResults.some((segment) => segment.mainEvent);
  const spotlightCount = segmentResults.filter(
    (segment) => segment.championInvolved || segment.rivalryInvolved
  ).length;

  if (hasStandout && spotlightCount >= 2) {
    return "A";
  }

  if (hasMainEvent && spotlightCount >= 1) {
    return "B";
  }

  if (hasMainEvent) {
    return "C";
  }

  return "D";
}

function createCrowdRead(showGrade) {
  if (showGrade === "A") {
    return "Hot";
  }

  if (showGrade === "B") {
    return "Strong";
  }

  if (showGrade === "C") {
    return "Solid";
  }

  return "Mixed";
}

function createChampionSpotlight({ segmentResults, championIds, rosterOptions }) {
  const championSegment = segmentResults.find((segment) => segment.championInvolved);

  if (!championSegment) {
    return "Champion Spotlight: Champions stayed in reserve";
  }

  const championName = championSegment.participantNames.find((name) =>
    Array.from(championIds).some(
      (candidateId) => findRosterName(rosterOptions, candidateId) === name
    )
  );

  return `Champion Spotlight: ${championName || "A champion"} appeared`;
}

function createRivalrySpotlight({ segmentResults, rivalries, rosterOptions }) {
  const rivalrySegment = segmentResults.find((segment) => segment.rivalryInvolved);

  if (!rivalrySegment) {
    return "Rivalry Spotlight: Opening stories stayed on the board";
  }

  const rivalry = rivalries.find((candidateRivalry) => {
    const wrestlerAName = findRosterName(rosterOptions, candidateRivalry.wrestlerAId);
    const wrestlerBName = findRosterName(rosterOptions, candidateRivalry.wrestlerBId);
    return (
      rivalrySegment.participantNames.includes(wrestlerAName) &&
      rivalrySegment.participantNames.includes(wrestlerBName)
    );
  });

  if (!rivalry) {
    return "Rivalry Spotlight: A starter rivalry gained heat";
  }

  return `Rivalry Spotlight: ${findRosterName(rosterOptions, rivalry.wrestlerAId)} vs ${findRosterName(rosterOptions, rivalry.wrestlerBId)} gained heat`;
}

function findBestSegment(segmentResults) {
  return [...segmentResults].sort(compareSegmentResults)[0];
}

function findWeakSegment(segmentResults, bestSegment) {
  if (segmentResults.length < 2) {
    return undefined;
  }

  return [...segmentResults]
    .filter((segment) => segment !== bestSegment)
    .sort((a, b) => compareSegmentResults(b, a))[0];
}

function compareSegmentResults(a, b) {
  const rankDelta = getQualityRank(b.qualityBand) - getQualityRank(a.qualityBand);

  if (rankDelta !== 0) {
    return rankDelta;
  }

  if (a.mainEvent !== b.mainEvent) {
    return a.mainEvent ? -1 : 1;
  }

  return a.segmentNumber - b.segmentNumber;
}

function getQualityRank(qualityBand) {
  if (qualityBand === "Standout") {
    return 4;
  }

  if (qualityBand === "Strong") {
    return 3;
  }

  if (qualityBand === "Solid") {
    return 2;
  }

  return 1;
}

function getSegmentWrestlerIds(segment) {
  if (segment.segmentType === "promo") {
    return [segment.featuredWrestlerId].filter(Boolean);
  }

  return [segment.wrestlerAId, segment.wrestlerBId].filter(Boolean);
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

function normalizeWeeklyLoopState(weeklyState) {
  if (!weeklyState || typeof weeklyState !== "object") {
    return createInitialLocalWeeklyLoopState();
  }

  const completedShowRecaps = Array.isArray(weeklyState.completedShowRecaps)
    ? weeklyState.completedShowRecaps.map(normalizeShowRecap).filter(Boolean)
    : [];
  const lastShowRecap = normalizeShowRecap(weeklyState.lastShowRecap);
  const currentWeekNumber =
    typeof weeklyState.currentWeekNumber === "number" &&
    Number.isFinite(weeklyState.currentWeekNumber) &&
    weeklyState.currentWeekNumber > 0
      ? Math.floor(weeklyState.currentWeekNumber)
      : 1;

  return freezeWeeklyLoopState({
    currentWeekNumber,
    lastShowRecap,
    completedShowRecaps,
  });
}

function freezeWeeklyLoopState(state) {
  return Object.freeze({
    currentWeekNumber: state.currentWeekNumber,
    lastShowRecap: state.lastShowRecap
      ? freezeShowRecap(state.lastShowRecap)
      : undefined,
    completedShowRecaps: Object.freeze(
      state.completedShowRecaps.map((recap) => freezeShowRecap(recap))
    ),
  });
}

function normalizeShowRecap(recap) {
  if (!recap || typeof recap !== "object") {
    return undefined;
  }

  return freezeShowRecap({
    recapId: readString(recap.recapId) || "local-show-recap",
    weekNumber: readPositiveNumber(recap.weekNumber, 1),
    weekLabel: readString(recap.weekLabel) || `Week ${readPositiveNumber(recap.weekNumber, 1)}`,
    brandLabel: readString(recap.brandLabel) || "Selected Brand",
    showGrade: readString(recap.showGrade) || "C",
    crowdRead: readString(recap.crowdRead) || "Solid",
    bestSegmentLine: readString(recap.bestSegmentLine) || "No standout segment",
    weakSegmentLine: readString(recap.weakSegmentLine) || "No weak segment",
    championSpotlight:
      readString(recap.championSpotlight) ||
      "Champion Spotlight: Champions stayed in reserve",
    rivalrySpotlight:
      readString(recap.rivalrySpotlight) ||
      "Rivalry Spotlight: Opening stories stayed on the board",
    momentumNote: readString(recap.momentumNote) || "Momentum: Steady",
    fanResponseNote: readString(recap.fanResponseNote) || "Fan Response: Solid",
    budgetNote:
      readString(recap.budgetNote) ||
      "Budget: No major change in this local session",
    localOnlyLine:
      readString(recap.localOnlyLine) || "Local Session Only / Not Saved Yet",
    segmentResults: Array.isArray(recap.segmentResults)
      ? recap.segmentResults.map(normalizeSegmentResult)
      : [],
  });
}

function normalizeSegmentResult(segmentResult) {
  return Object.freeze({
    segmentNumber: readPositiveNumber(segmentResult?.segmentNumber, 1),
    segmentType: readString(segmentResult?.segmentType) || "singles-match",
    typeLabel: readString(segmentResult?.typeLabel) || "Singles Match",
    talentLine: readString(segmentResult?.talentLine) || "Signed Talent",
    mainEvent: Boolean(segmentResult?.mainEvent),
    championInvolved: Boolean(segmentResult?.championInvolved),
    rivalryInvolved: Boolean(segmentResult?.rivalryInvolved),
    qualityBand: readString(segmentResult?.qualityBand) || "Solid",
    resultLine: readString(segmentResult?.resultLine) || "Solid segment.",
    participantNames: Object.freeze(
      Array.isArray(segmentResult?.participantNames)
        ? segmentResult.participantNames.map((name) => readString(name) || "Signed Talent")
        : []
    ),
  });
}

function freezeShowRecap(recap) {
  return Object.freeze({
    recapId: recap.recapId,
    weekNumber: recap.weekNumber,
    weekLabel: recap.weekLabel,
    brandLabel: recap.brandLabel,
    showGrade: recap.showGrade,
    crowdRead: recap.crowdRead,
    bestSegmentLine: recap.bestSegmentLine,
    weakSegmentLine: recap.weakSegmentLine,
    championSpotlight: recap.championSpotlight,
    rivalrySpotlight: recap.rivalrySpotlight,
    momentumNote: recap.momentumNote,
    fanResponseNote: recap.fanResponseNote,
    budgetNote: recap.budgetNote,
    localOnlyLine: recap.localOnlyLine,
    segmentResults: Object.freeze(
      recap.segmentResults.map((segment) => Object.freeze({ ...segment }))
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

function readPositiveNumber(value, fallback) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? Math.floor(value)
    : fallback;
}
