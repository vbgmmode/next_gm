import {
  createLocalSetupRosterOptions,
  createWeekOneHqProjection,
} from "./localPostDraftSetupController.js";
import {
  createFanSocialDiscourseHandoff,
  createProductionEngineRegistry,
  createSimulationEngineContext,
  runRegisteredSocialDiscourseEngine,
  runShowFanReactionSmokePipeline,
} from "../../src/game/engines/index.ts";

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

export const LOCAL_SPECIAL_EVENT_CADENCE_WEEKS = 4;

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
    rosterHistorySnapshots: [],
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
  const seasonCalendar = createLocalSeasonCalendarProjection({
    weeklyState: currentWeeklyState,
  });
  const specialEventActive = seasonCalendar.weeksUntilSpecialEvent === 0;
  const hqTitleLine = specialEventActive
    ? `${seasonCalendar.specialEventLabel} HQ`
    : `Week ${weekNumber} HQ`;
  const bookingLine = specialEventActive
    ? `Book ${seasonCalendar.specialEventLabel}`
    : `Book Week ${weekNumber} Show`;

  return Object.freeze({
    ...hqProjection,
    weekNumber,
    seasonCalendar,
    specialEventActive,
    lastShowRecap,
    latestRosterHistorySnapshot: getLatestRosterHistorySnapshot(currentWeeklyState),
    completedShowCount: currentWeeklyState.completedShowRecaps.length,
    displayLabels: Object.freeze({
      ...hqProjection.displayLabels,
      titleLine: hqProjection.unlocked ? hqTitleLine : `Week ${weekNumber} HQ Locked`,
      statusLine: hqProjection.unlocked
        ? specialEventActive
          ? `${seasonCalendar.specialEventLabel} week is open.`
          : `Week ${weekNumber} HQ is open.`
        : `Finish draft setup to unlock Week ${weekNumber} HQ.`,
      bookingLine: hqProjection.unlocked ? bookingLine : "Booking Locked",
      lastShowLine: lastShowRecap
        ? `Last Show: ${lastShowRecap.showGrade} / ${lastShowRecap.bestSegmentLine}`
        : "No show run yet",
      bookingNoteLine: hqProjection.unlocked
        ? specialEventActive
          ? `Build the ${seasonCalendar.specialEventLabel} card.`
          : `Build the Week ${weekNumber} show card.`
        : "Complete setup first",
      calendarLine: seasonCalendar.displayLabels.calendarLine,
      titleDefenseLine: seasonCalendar.displayLabels.titleDefenseLine,
      rivalryPayoffLine: seasonCalendar.displayLabels.rivalryPayoffLine,
      showHistoryLine: seasonCalendar.displayLabels.showHistoryLine,
      rosterHistoryLine: createRosterHistoryDisplayLine(currentWeeklyState),
    }),
  });
}

export function createLocalSeasonCalendarProjection({ weeklyState } = {}) {
  const currentWeeklyState = normalizeWeeklyLoopState(weeklyState);
  const currentWeekNumber = currentWeeklyState.currentWeekNumber;
  const nextSpecialEventWeek =
    Math.ceil(currentWeekNumber / LOCAL_SPECIAL_EVENT_CADENCE_WEEKS) *
    LOCAL_SPECIAL_EVENT_CADENCE_WEEKS;
  const weeksUntilSpecialEvent = Math.max(
    0,
    nextSpecialEventWeek - currentWeekNumber
  );
  const specialEventLabel = `Week ${nextSpecialEventWeek} Special Event`;
  const roadToEventLabel =
    weeksUntilSpecialEvent === 0
      ? `${specialEventLabel} is this week`
      : `${specialEventLabel} in ${weeksUntilSpecialEvent} week${weeksUntilSpecialEvent === 1 ? "" : "s"}`;

  return Object.freeze({
    currentWeekNumber,
    nextSpecialEventWeek,
    weeksUntilSpecialEvent,
    specialEventLabel,
    completedShowCount: currentWeeklyState.completedShowRecaps.length,
    displayLabels: Object.freeze({
      calendarLine: `Road To Special Event: ${roadToEventLabel}`,
      titleDefenseLine:
        weeksUntilSpecialEvent === 0
          ? "Title Defense Window: Open"
          : `Title Defense Window: Opens Week ${nextSpecialEventWeek}`,
      rivalryPayoffLine:
        weeksUntilSpecialEvent === 0
          ? "Rivalry Payoff: Available"
          : `Rivalry Payoff: Build ${weeksUntilSpecialEvent} week${weeksUntilSpecialEvent === 1 ? "" : "s"}`,
      showHistoryLine:
        currentWeeklyState.completedShowRecaps.length === 0
          ? "Show History: No shows run"
          : `Show History: ${currentWeeklyState.completedShowRecaps.length} show${currentWeeklyState.completedShowRecaps.length === 1 ? "" : "s"} logged`,
    }),
  });
}

export function createLocalRosterHistorySnapshot({ projection, recap } = {}) {
  const signedRosterCount = readPositiveNumber(projection?.signedRosterCount, 0);
  const showRecap = normalizeShowRecap(recap);
  const weekNumber = showRecap?.weekNumber || readPositiveNumber(projection?.weekNumber, 1);
  const momentumLine = readString(showRecap?.momentumNote) || "Momentum: Steady";
  const fanResponseLine = readString(showRecap?.fanResponseNote) || "Fan Response: Solid";
  const topSegmentLine =
    readString(showRecap?.bestSegmentLine) || "No standout segment";

  return freezeRosterHistorySnapshot({
    snapshotId: `local-week-${weekNumber}-roster-snapshot`,
    weekNumber,
    weekLabel: `Week ${weekNumber}`,
    signedRosterCount,
    momentumLine,
    fanResponseLine,
    topSegmentLine,
    deltaLine: `Roster Delta: ${signedRosterCount} signed, ${momentumLine}`,
    displayLine: `Roster History: Week ${weekNumber} - ${signedRosterCount} signed, ${momentumLine}`,
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
  const seasonCalendar = createLocalSeasonCalendarProjection({
    weeklyState: currentWeeklyState,
  });
  const specialEventActive = seasonCalendar.weeksUntilSpecialEvent === 0;
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
    seasonCalendar,
    specialEventActive,
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
      titleLine: specialEventActive
        ? `${seasonCalendar.specialEventLabel} Booking`
        : `Week ${currentWeeklyState.currentWeekNumber} Booking`,
      localOnlyLine: "Local Session Only / Not Saved Yet",
      statusLine: hqProjection.unlocked
        ? specialEventActive
          ? `Build the ${seasonCalendar.specialEventLabel} local card.`
          : `Build the Week ${currentWeeklyState.currentWeekNumber} local show card.`
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
  const rosterHistorySnapshot = createLocalRosterHistorySnapshot({
    projection,
    recap,
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
    rosterHistorySnapshots: [
      ...currentWeeklyState.rosterHistorySnapshots.filter(
        (snapshot) => snapshot.weekNumber !== recap.weekNumber
      ),
      rosterHistorySnapshot,
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
    rosterHistorySnapshots: currentWeeklyState.rosterHistorySnapshots,
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
  const engineRun = runLocalShowEngineShell({
    projection,
    rivalries,
    weeklyState,
  });
  const segmentResults = projection.segments.map((segment) =>
    createSegmentResult({
      segment,
      championIds,
      rivalries,
      rosterOptions: projection.rosterOptions,
      engineRun,
    })
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
    fanResponseNote: createFanResponseNote({ crowdRead, engineRun }),
    socialBuzzNote: createSocialBuzzNote(engineRun),
    budgetNote: "Budget: No major change in this local session",
    localOnlyLine: "Local Session Only / Not Saved Yet",
    cardReadinessLine: createCardReadinessLine(engineRun),
    simulationBacked: engineRun !== undefined,
    segmentResults,
  });
}

function createSegmentResult({
  segment,
  championIds,
  rivalries,
  rosterOptions,
  engineRun,
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
  const engineMatchResult = engineRun?.matchResultsBySegmentId.get(segment.segmentId);
  const qualityBand = createSegmentQualityBand({
    segment,
    spotlightBonus,
    engineMatchResult,
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
    resultLine: createSegmentResultLine({ segment, qualityBand, engineMatchResult }),
    matchRatingLabel: createMatchRatingLabel({ segment, qualityBand }),
    crowdResponseLine: createCrowdResponseLine({ segment, engineMatchResult }),
    momentumSignalLine: createMomentumSignalLine({ segment, engineMatchResult }),
    participantNames: Object.freeze(
      wrestlerIds.map((candidateId) => findRosterName(rosterOptions, candidateId))
    ),
  });
}

function createSegmentQualityBand({ segment, spotlightBonus, engineMatchResult }) {
  const signalLabels = readEngineSignalLabels(engineMatchResult);

  if (signalLabels.has("overdelivered")) {
    return "Standout";
  }

  if (
    signalLabels.has("crowd was engaged") ||
    signalLabels.has("momentum shift")
  ) {
    return segment.mainEvent || spotlightBonus > 0 ? "Standout" : "Strong";
  }

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

function createSegmentResultLine({ segment, qualityBand, engineMatchResult }) {
  if (segment.segmentType === "promo") {
    return `${qualityBand} promo segment.`;
  }

  const signalLabels = readEngineSignalLabels(engineMatchResult);
  const crowdLine = signalLabels.has("flat reaction")
    ? "crowd needs a stronger hook"
    : "crowd stayed with it";

  return segment.mainEvent
    ? `${qualityBand} main event match; ${crowdLine}.`
    : `${qualityBand} singles match; ${crowdLine}.`;
}

function createMatchRatingLabel({ segment, qualityBand }) {
  if (segment.segmentType === "promo") {
    return `Segment Rating: ${qualityBand}`;
  }

  return `Match Rating: ${qualityBand}`;
}

function createCrowdResponseLine({ segment, engineMatchResult }) {
  if (segment.segmentType === "promo") {
    return "Crowd Response: Story advanced";
  }

  const signalLabels = readEngineSignalLabels(engineMatchResult);

  if (signalLabels.has("overdelivered")) {
    return "Crowd Response: Overdelivered";
  }

  if (signalLabels.has("crowd was engaged")) {
    return "Crowd Response: Engaged";
  }

  if (signalLabels.has("flat reaction")) {
    return "Crowd Response: Needs spark";
  }

  return "Crowd Response: Solid";
}

function createMomentumSignalLine({ segment, engineMatchResult }) {
  if (segment.segmentType === "promo") {
    return "Momentum Signal: Story beat";
  }

  const signalLabels = readEngineSignalLabels(engineMatchResult);

  if (signalLabels.has("momentum shift")) {
    return "Momentum Signal: Shift";
  }

  if (segment.mainEvent) {
    return "Momentum Signal: Featured";
  }

  return "Momentum Signal: Steady";
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

function runLocalShowEngineShell({ projection, rivalries, weeklyState }) {
  const weekNumber = normalizeWeeklyLoopState(weeklyState).currentWeekNumber;
  const promotion = createLocalPromotion({ projection });
  const show = createLocalShow({ projection, weekNumber, promotion });
  const wrestlers = createLocalWrestlers({
    projection,
    promotionId: promotion.id,
  });
  const fanSegments = createLocalFanSegments({ promotion });
  const domainRivalries = createLocalDomainRivalries({
    rivalries,
    projection,
    promotionId: promotion.id,
  });
  const bookedMatches = projection.segments
    .filter((segment) => segment.segmentType !== "promo")
    .map((segment) =>
      createLocalBookedMatch({
        segment,
        show,
        promotion,
        wrestlers,
        fanSegments,
        rivalry: findLocalDomainRivalry(domainRivalries, segment),
      })
    )
    .filter(Boolean);

  const registry = createProductionEngineRegistry();
  const context = createSimulationEngineContext({
    seed: `playable-${projection.brandLabel}-week-${weekNumber}-${projection.segments.length}`,
    seedLabel: `playable-week-${weekNumber}-show`,
    week: weekNumber,
  });
  const pipelineResult = runShowFanReactionSmokePipeline(
    registry,
    {
      show,
      bookedMatches,
      promotion,
      marketState: promotion.marketState,
      backstageState: promotion.backstageState,
    },
    context
  );
  const socialDiscourseResult = runRegisteredSocialDiscourseEngine(
    registry,
    {
      promotion,
      relevantWrestlers: findRelevantWrestlers(bookedMatches),
      relevantRivalries: domainRivalries,
      existingNarratives: [],
      fanReactionResult: pipelineResult.fanReactionResult,
      fanReactionShowHandoff: createFanSocialDiscourseHandoff(
        pipelineResult.fanReactionResult.hiddenState.showOutputShell
      ),
    },
    context
  );
  const result = pipelineResult.showResult;

  return Object.freeze({
    showEngineId: "show-engine-v0",
    showEngineVersion: "0.8.0",
    fanReactionBacked: true,
    socialDiscourseBacked: true,
    showReadinessStatus: result.hiddenState.showReadinessStatus,
    fanSignalLabels: readEngineSignalLabels(pipelineResult.fanReactionResult),
    socialSignalLabels: readEngineSignalLabels(socialDiscourseResult),
    completedMatchEngineRuns: result.hiddenState.completedMatchEngineRuns,
    failedMatchEngineRuns: result.hiddenState.failedMatchEngineRuns,
    matchResultsBySegmentId: new Map(
      result.matchResults.map((matchResult) => [
        readSegmentIdFromMatchId(matchResult.matchId),
        matchResult,
      ])
    ),
  });
}

function findRelevantWrestlers(bookedMatches) {
  const wrestlersById = new Map();

  for (const bookedMatch of bookedMatches) {
    for (const wrestler of bookedMatch.matchInput.participants) {
      wrestlersById.set(wrestler.id, wrestler);
    }
  }

  return [...wrestlersById.values()];
}

function createLocalPromotion({ projection }) {
  return Object.freeze({
    id: slugify(`promotion-${projection.brandLabel}`),
    name: projection.brandLabel,
    marketState: Object.freeze({
      id: slugify(`market-${projection.brandLabel}`),
      name: `${projection.brandLabel} Home Market`,
      totalAudience: 1000000,
      marketShare: 50,
      growth: 50,
      competitionIntensity: 50,
      mediaAttention: 55,
      ticketDemand: 55,
    }),
    financialState: Object.freeze({
      cashOnHand: projection.remainingDraftBudget,
      weeklyRevenue: 0,
      weeklyExpenses: 0,
      payrollCost: 0,
      productionCost: 0,
      marketingSpend: 0,
      profitabilityTrend: 50,
      budgetPressure: 45,
    }),
    backstageState: Object.freeze({
      morale: 55,
      cohesion: 55,
      politics: 45,
      leakRisk: 25,
      injuryConcern: 30,
      creativeConfidence: 55,
    }),
    rosterIds: projection.rosterOptions.map((option) => option.candidateId),
    fanTrust: 55,
    brandIdentity: Object.freeze(["local-preview", "player-brand"]),
    momentum: 55,
  });
}

function createLocalShow({ projection, weekNumber, promotion }) {
  return Object.freeze({
    id: slugify(`${promotion.id}-week-${weekNumber}-show`),
    promotionId: promotion.id,
    name: `${projection.brandLabel} Week ${weekNumber}`,
    week: weekNumber,
    marketId: promotion.marketState.id,
    venueName: `${projection.brandLabel} Arena`,
    segmentIds: projection.segments.map((segment) => segment.segmentId),
    segments: projection.segments.map((segment) =>
      Object.freeze({
        id: segment.segmentId,
        type: segment.segmentType === "promo" ? "promo" : "match",
        matchId:
          segment.segmentType === "promo"
            ? undefined
            : createMatchId(segment.segmentId),
        involvedWrestlerIds: getSegmentWrestlerIds(segment),
        rivalryId: undefined,
        plannedMinutes: segment.mainEvent ? 15 : 8,
      })
    ),
    budgetAllocated: 0,
  });
}

function createLocalWrestlers({ projection, promotionId }) {
  const wrestlersById = new Map();

  for (const option of projection.rosterOptions) {
    const rating = ratingForSigningTier(option.signingTier);
    wrestlersById.set(
      option.candidateId,
      Object.freeze({
        id: option.candidateId,
        name: option.displayName,
        age: 30,
        alignment: "tweener",
        promotionId,
        popularity: rating.popularity,
        credibility: rating.credibility,
        inRingSkill: rating.inRingSkill,
        promoSkill: rating.promoSkill,
        stamina: rating.stamina,
        health: 88,
        morale: 62,
        momentum: rating.momentum,
        contractCostPerWeek: option.signingCost,
        traits: Object.freeze([option.divisionCategory, option.signingTier]),
      })
    );
  }

  return wrestlersById;
}

function ratingForSigningTier(signingTier) {
  const normalizedTier = readString(signingTier)?.toLowerCase() || "";

  if (normalizedTier.includes("elite") || normalizedTier.includes("main event")) {
    return {
      popularity: 76,
      credibility: 78,
      inRingSkill: 74,
      promoSkill: 72,
      stamina: 78,
      momentum: 72,
    };
  }

  if (normalizedTier.includes("featured") || normalizedTier.includes("upper")) {
    return {
      popularity: 68,
      credibility: 70,
      inRingSkill: 68,
      promoSkill: 66,
      stamina: 72,
      momentum: 66,
    };
  }

  return {
    popularity: 60,
    credibility: 60,
    inRingSkill: 62,
    promoSkill: 60,
    stamina: 68,
    momentum: 58,
  };
}

function createLocalFanSegments({ promotion }) {
  return Object.freeze([
    Object.freeze({
      id: `${promotion.id}-core-fans`,
      kind: "hardcore",
      name: `${promotion.name} Core Fans`,
      marketShare: 55,
      companyTrust: promotion.fanTrust,
      noveltyPreference: 55,
      workratePreference: 60,
      storyPreference: 62,
      metaAwareness: 55,
      toleranceForForcedPushes: 50,
      fatigueSensitivity: 45,
    }),
  ]);
}

function createLocalDomainRivalries({ rivalries, projection, promotionId }) {
  return rivalries.map((rivalry, index) =>
    Object.freeze({
      id: `local-rivalry-${index + 1}`,
      promotionId,
      participantIds: [rivalry.wrestlerAId, rivalry.wrestlerBId],
      title: `${findRosterName(projection.rosterOptions, rivalry.wrestlerAId)} vs ${findRosterName(projection.rosterOptions, rivalry.wrestlerBId)}`,
      heat: rivalry.intensity === "High" ? 72 : rivalry.intensity === "Low" ? 48 : 60,
      clarity: 62,
      freshness: 68,
      polarization: 45,
      beats: [],
    })
  );
}

function createLocalBookedMatch({
  segment,
  show,
  promotion,
  wrestlers,
  fanSegments,
  rivalry,
}) {
  const participantIds = getSegmentWrestlerIds(segment);
  const participants = participantIds
    .map((wrestlerId) => wrestlers.get(wrestlerId))
    .filter(Boolean);

  if (participants.length < 2) {
    return undefined;
  }

  const match = Object.freeze({
    id: createMatchId(segment.segmentId),
    showId: show.id,
    participantIds: Object.freeze(
      participants.map((wrestler, index) =>
        Object.freeze({
          wrestlerId: wrestler.id,
          sideId: `side-${index + 1}`,
        })
      )
    ),
    rivalryId: rivalry?.id,
    stipulation: segment.mainEvent ? "Main Event Singles" : "Singles",
    plannedWinnerId: undefined,
    actualWinnerId: undefined,
    finishType: undefined,
    plannedMinutes: segment.mainEvent ? 15 : 10,
    stakes: segment.mainEvent ? "major" : rivalry ? "high" : "medium",
  });

  return Object.freeze({
    id: `booked-${match.id}`,
    orderIndex: segment.segmentNumber,
    matchInput: Object.freeze({
      match,
      show,
      promotion,
      participants: Object.freeze(participants),
      fanSegments,
      rivalry,
      finishIntent: Object.freeze({
        type: "clean",
        protection: "protected",
        controversy: "low",
      }),
    }),
  });
}

function findLocalDomainRivalry(rivalries, segment) {
  const wrestlerIds = getSegmentWrestlerIds(segment);

  return rivalries.find((rivalry) =>
    rivalry.participantIds.every((wrestlerId) => wrestlerIds.includes(wrestlerId))
  );
}

function createMatchId(segmentId) {
  return `${segmentId}-match`;
}

function readSegmentIdFromMatchId(matchId) {
  return readString(matchId)?.replace(/-match$/, "") || "";
}

function readEngineSignalLabels(engineMatchResult) {
  if (!engineMatchResult) {
    return new Set();
  }

  return new Set(
    engineMatchResult.signals.flatMap((group) =>
      group.signals.map((signal) => signal.label)
    )
  );
}

function createCardReadinessLine(engineRun) {
  if (!engineRun) {
    return "Card Status: Local recap prepared";
  }

  if (engineRun.showReadinessStatus === "ready") {
    return "Card Status: Processed";
  }

  if (engineRun.failedMatchEngineRuns > 0) {
    return "Card Status: Needs attention";
  }

  return "Card Status: Partially processed";
}

function createFanResponseNote({ crowdRead, engineRun }) {
  const fanSignalLabels = engineRun?.fanSignalLabels || new Set();

  if (fanSignalLabels.has("crowd was engaged")) {
    return "Fan Response: Crowd was engaged";
  }

  if (fanSignalLabels.has("casual fans interested")) {
    return "Fan Response: Casual fans interested";
  }

  if (fanSignalLabels.has("hardcore fans skeptical")) {
    return "Fan Response: Hardcore fans skeptical";
  }

  if (fanSignalLabels.has("audience is cooling")) {
    return "Fan Response: Audience is cooling";
  }

  return `Fan Response: ${crowdRead}`;
}

function createSocialBuzzNote(engineRun) {
  const socialSignalLabels = engineRun?.socialSignalLabels || new Set();

  if (socialSignalLabels.has("praise cycle building")) {
    return "Social Buzz: Praise cycle building";
  }

  if (socialSignalLabels.has("IWC discourse rising")) {
    return "Social Buzz: IWC discourse rising";
  }

  if (socialSignalLabels.has("pushback forming")) {
    return "Social Buzz: Pushback forming";
  }

  if (socialSignalLabels.has("discourse is fragmented")) {
    return "Social Buzz: Discourse is fragmented";
  }

  if (socialSignalLabels.has("rumor mill active")) {
    return "Social Buzz: Rumor mill active";
  }

  return "Social Buzz: Early chatter";
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
    rosterHistorySnapshots: Array.isArray(weeklyState.rosterHistorySnapshots)
      ? weeklyState.rosterHistorySnapshots
          .map(normalizeRosterHistorySnapshot)
          .filter(Boolean)
      : [],
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
    rosterHistorySnapshots: Object.freeze(
      state.rosterHistorySnapshots.map((snapshot) =>
        freezeRosterHistorySnapshot(snapshot)
      )
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
    socialBuzzNote: readString(recap.socialBuzzNote) || "Social Buzz: Early chatter",
    budgetNote:
      readString(recap.budgetNote) ||
      "Budget: No major change in this local session",
    localOnlyLine:
      readString(recap.localOnlyLine) || "Local Session Only / Not Saved Yet",
    cardReadinessLine:
      readString(recap.cardReadinessLine) || "Card Status: Local recap prepared",
    simulationBacked: Boolean(recap.simulationBacked),
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
    matchRatingLabel:
      readString(segmentResult?.matchRatingLabel) || "Match Rating: Solid",
    crowdResponseLine:
      readString(segmentResult?.crowdResponseLine) || "Crowd Response: Solid",
    momentumSignalLine:
      readString(segmentResult?.momentumSignalLine) || "Momentum Signal: Steady",
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
    socialBuzzNote: recap.socialBuzzNote,
    budgetNote: recap.budgetNote,
    localOnlyLine: recap.localOnlyLine,
    cardReadinessLine: recap.cardReadinessLine,
    simulationBacked: Boolean(recap.simulationBacked),
    segmentResults: Object.freeze(
      recap.segmentResults.map((segment) => Object.freeze({ ...segment }))
    ),
  });
}

function normalizeRosterHistorySnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== "object") {
    return undefined;
  }

  const weekNumber = readPositiveNumber(snapshot.weekNumber, 1);
  const signedRosterCount = readPositiveNumber(snapshot.signedRosterCount, 0);
  const momentumLine = readString(snapshot.momentumLine) || "Momentum: Steady";

  return freezeRosterHistorySnapshot({
    snapshotId:
      readString(snapshot.snapshotId) || `local-week-${weekNumber}-roster-snapshot`,
    weekNumber,
    weekLabel: readString(snapshot.weekLabel) || `Week ${weekNumber}`,
    signedRosterCount,
    momentumLine,
    fanResponseLine: readString(snapshot.fanResponseLine) || "Fan Response: Solid",
    topSegmentLine: readString(snapshot.topSegmentLine) || "No standout segment",
    deltaLine:
      readString(snapshot.deltaLine) ||
      `Roster Delta: ${signedRosterCount} signed, ${momentumLine}`,
    displayLine:
      readString(snapshot.displayLine) ||
      `Roster History: Week ${weekNumber} - ${signedRosterCount} signed, ${momentumLine}`,
  });
}

function freezeRosterHistorySnapshot(snapshot) {
  return Object.freeze({
    snapshotId: snapshot.snapshotId,
    weekNumber: snapshot.weekNumber,
    weekLabel: snapshot.weekLabel,
    signedRosterCount: snapshot.signedRosterCount,
    momentumLine: snapshot.momentumLine,
    fanResponseLine: snapshot.fanResponseLine,
    topSegmentLine: snapshot.topSegmentLine,
    deltaLine: snapshot.deltaLine,
    displayLine: snapshot.displayLine,
  });
}

function getLatestRosterHistorySnapshot(weeklyState) {
  return weeklyState.rosterHistorySnapshots
    .slice()
    .sort((first, second) => second.weekNumber - first.weekNumber)[0];
}

function createRosterHistoryDisplayLine(weeklyState) {
  const latestSnapshot = getLatestRosterHistorySnapshot(weeklyState);
  return latestSnapshot
    ? latestSnapshot.displayLine
    : "Roster History: No weekly snapshot yet";
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

function slugify(value) {
  return (
    readString(value)
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "local"
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
