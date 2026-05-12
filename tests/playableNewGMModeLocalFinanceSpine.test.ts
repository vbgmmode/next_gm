import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  createInitialMiniDraftProgress,
  executeAutoFillMinimumRoster,
  executeInMemoryMakePick,
  executeLocalFinishDraft,
  executeRivalBrandDraftPicks,
} from "../ui/playable-new-gm-mode/inMemoryDraftActionController.js";
import { readLocalGameSetupStartingBudgetUnits } from "../ui/playable-new-gm-mode/localGameSetupController.js";
import {
  completeLocalChampionshipSetup,
  completeLocalRivalrySetup,
  createChampionshipSetupProjection,
  createInitialLocalPostDraftSetupState,
  updateLocalChampionshipSelection,
  updateLocalRivalrySlot,
} from "../ui/playable-new-gm-mode/localPostDraftSetupController.js";
import {
  LOCAL_WEEK_ONE_SEGMENT_TYPES,
  addLocalWeekOneBookingSegment,
  advanceLocalWeek,
  createInitialLocalWeekOneBookingState,
  createInitialLocalWeeklyLoopState,
  createWeekOneBookingProjection,
  createWeeklyHqProjection,
  runLocalWeeklyShow,
} from "../ui/playable-new-gm-mode/localWeekOneBookingController.js";

const selectedBrand = Object.freeze({
  brandId: "raw",
  brandLabel: "Raw",
});
const selectedGm = Object.freeze({
  gmId: "maren-vale",
  displayName: "Maren Vale",
});
const romanReigns = Object.freeze({
  candidateId: "candidate-roman-reigns",
  name: "Roman Reigns",
  availability: "Available",
});

describe("Playable New GM Mode deterministic local finance spine", () => {
  it("flows setup-selected starting cash into the local draft budget", () => {
    const startingDraftBudget = readLocalGameSetupStartingBudgetUnits("hard");
    const progress = createInitialMiniDraftProgress({
      selectedBrand,
      startingDraftBudget,
    });

    assert.equal(startingDraftBudget, 100);
    assert.equal(progress.startingDraftBudget, 100);
    assert.equal(progress.remainingDraftBudget, 100);
    assert.equal(progress.displayLabels.budgetLine, "Budget remaining: 100");
  });

  it("subtracts player signings but leaves rival brand picks out of player budget", () => {
    const playerPick = executeInMemoryMakePick({
      selectedCandidate: romanReigns,
      selectedBrand,
      selectedGm,
      miniDraftProgress: createInitialMiniDraftProgress({ selectedBrand }),
    });
    const afterPlayerBudget = playerPick.miniDraftProgress.remainingDraftBudget;
    const afterRivals = executeRivalBrandDraftPicks({
      competingBrands: [
        { brandId: "smackdown", brandLabel: "SmackDown" },
        { brandId: "nxt", brandLabel: "NXT" },
      ],
      miniDraftProgress: playerPick.miniDraftProgress,
    });

    assert.equal(afterPlayerBudget, 102);
    assert.equal(playerPick.miniDraftProgress.budgetSpent, 18);
    assert.equal(afterRivals.miniDraftProgress.remainingDraftBudget, afterPlayerBudget);
    assert.equal(afterRivals.miniDraftProgress.budgetSpent, 18);
    assert.equal(afterRivals.miniDraftProgress.rivalPickSummaries.length, 2);
  });

  it("projects readable booking costs for every first-session segment type", () => {
    const { miniDraftProgress, setupState, rosterIds } = createCompletedWeekOneSetup();
    let bookingState = createInitialLocalWeekOneBookingState();

    for (const segmentType of LOCAL_WEEK_ONE_SEGMENT_TYPES.map((type) => type.segmentType)) {
      const result = addLocalWeekOneBookingSegment({
        selectedBrand,
        miniDraftProgress,
        setupState,
        bookingState,
        weeklyState: createInitialLocalWeeklyLoopState(),
        segmentInput: createSegmentInput(segmentType, rosterIds),
      });
      assert.equal(result.actionStatus, "week-one-booking-segment-added", segmentType);
      bookingState = result.bookingState;
    }

    const projection = createWeekOneBookingProjection({
      selectedBrand,
      miniDraftProgress,
      setupState,
      bookingState,
      weeklyState: createInitialLocalWeeklyLoopState(),
    });

    assert.equal(projection.status.readyToRun, true);
    assert.equal(projection.bookingFinance.productionCostUnits, 6);
    assert.equal(projection.bookingFinance.segmentCostUnits, 42);
    assert.equal(projection.bookingFinance.projectedShowCostUnits, 48);
    assert.match(projection.displayLabels.projectedCostLine, /Projected Show Cost: \$4,800,000/);
    assert.equal(
      projection.segments.every((segment) => /^Cost \$/.test(segment.costLine)),
      true
    );
  });

  it("creates deterministic show finance and carries the updated budget into Week 2 HQ", () => {
    const { miniDraftProgress, setupState, rosterIds } = createCompletedWeekOneSetup();
    const bookingState = createReadyFinanceCard({
      miniDraftProgress,
      setupState,
      rosterIds,
    });
    const first = runLocalWeeklyShow({
      selectedBrand,
      miniDraftProgress,
      setupState,
      bookingState,
      weeklyState: createInitialLocalWeeklyLoopState(),
    });
    const second = runLocalWeeklyShow({
      selectedBrand,
      miniDraftProgress,
      setupState,
      bookingState,
      weeklyState: createInitialLocalWeeklyLoopState(),
    });
    const advance = advanceLocalWeek({ weeklyState: first.weeklyState });
    const weekTwoHq = createWeeklyHqProjection({
      selectedBrand,
      miniDraftProgress,
      setupState,
      weeklyState: advance.weeklyState,
    });

    assert.equal(first.actionStatus, "local-weekly-show-ran");
    assert.deepEqual(second.recap.financeResult, first.recap.financeResult);
    assert.equal(first.recap.financeResult.startingShowBudgetUnits, miniDraftProgress.remainingDraftBudget);
    assert.equal(first.recap.financeResult.showCostUnits, 25);
    assert.ok(first.recap.financeResult.ticketRevenueUnits > 0);
    assert.ok(first.recap.financeResult.merchRevenueUnits > 0);
    assert.equal(
      first.recap.financeResult.updatedBudgetUnits,
      first.recap.financeResult.startingShowBudgetUnits +
        first.recap.financeResult.netProfitLossUnits
    );
    assert.equal(advance.weeklyState.currentBudgetUnits, first.recap.financeResult.updatedBudgetUnits);
    assert.equal(weekTwoHq.weekNumber, 2);
    assert.equal(weekTwoHq.remainingBudgetUnits, first.recap.financeResult.updatedBudgetUnits);
    assert.match(weekTwoHq.displayLabels.financeObjectiveLine, /^Finance Objective:/);
  });

  it("exposes show recap ticket, merch, costs, net, and updated budget copy in the UI", () => {
    const html = readPlayableUiFile("index.html");
    const appSource = readPlayableUiFile("app.js");

    assert.match(html, /id="booking-summary-projected-cost"/);
    assert.match(html, /id="booking-summary-budget-warning"/);
    assert.match(html, /id="show-recap-finance-tickets"/);
    assert.match(html, /id="show-recap-finance-merch"/);
    assert.match(html, /id="show-recap-finance-net"/);
    assert.match(html, /id="show-recap-finance-updated"/);
    assert.match(html, /id="week-one-hq-finance-objective-tile"/);
    assert.match(appSource, /financeResult/);
    assert.match(appSource, /projectedCostLine/);
    assert.match(appSource, /ticketRevenueLine/);
    assert.doesNotMatch(appSource, /Budget: No major change/);
  });

  it("keeps the local finance spine free of random, generated, storage, scraping, and database behavior", () => {
    const localFinanceSource = [
      readPlayableUiFile("localWeekOneBookingController.js"),
      readPlayableUiFile("inMemoryDraftActionController.js"),
    ].join("\n");
    const forbiddenSnippets = [
      ["fe", "tch("].join(""),
      ["XML", "HttpRequest"].join(""),
      ["local", "Storage"].join(""),
      ["session", "Storage"].join(""),
      ["indexed", "DB"].join(""),
      ["sql", "ite"].join(""),
      ["INSERT", " INTO"].join(""),
      ["UPDATE", " "].join(""),
      ["DELETE", " "].join(""),
      ["Open", "AI"].join(""),
      ["api", " key"].join(""),
      ["canUse", "Gen", "AI: true"].join(""),
      ["canUse", "GeneratedText: true"].join(""),
      ["live", " scraping"].join(""),
      ["Math", "random"].join("."),
    ];

    for (const snippet of forbiddenSnippets) {
      assert.equal(localFinanceSource.includes(snippet), false, snippet);
    }
  });
});

function createCompletedWeekOneSetup() {
  const autoFill = executeAutoFillMinimumRoster({
    selectedBrand,
    selectedGm,
    miniDraftProgress: createInitialMiniDraftProgress({ selectedBrand }),
  });
  const finished = executeLocalFinishDraft({
    selectedBrand,
    selectedGm,
    miniDraftProgress: autoFill.miniDraftProgress,
  });
  const miniDraftProgress = finished.miniDraftProgress;
  const rosterIds = miniDraftProgress.completedPickSummaries
    .slice(0, 6)
    .map((summary) => summary.candidateId);
  const championRosterIds = createChampionRosterIds(miniDraftProgress);
  let setupState = createInitialLocalPostDraftSetupState();

  setupState = updateLocalChampionshipSelection({
    setupState,
    slotId: "mensMainChampionId",
    candidateId: championRosterIds.mensMainChampionId,
  });
  setupState = updateLocalChampionshipSelection({
    setupState,
    slotId: "mensMidcardChampionId",
    candidateId: championRosterIds.mensMidcardChampionId,
  });
  setupState = updateLocalChampionshipSelection({
    setupState,
    slotId: "womensMainChampionId",
    candidateId: championRosterIds.womensMainChampionId,
  });
  setupState = updateLocalChampionshipSelection({
    setupState,
    slotId: "womensMidcardChampionId",
    candidateId: championRosterIds.womensMidcardChampionId,
  });

  const championship = completeLocalChampionshipSetup({
    selectedBrand,
    miniDraftProgress,
    setupState,
  });

  setupState = updateLocalRivalrySlot({
    setupState: championship.setupState,
    slotIndex: 0,
    wrestlerAId: rosterIds[4],
    wrestlerBId: rosterIds[5],
    rivalryType: "Grudge",
    intensity: "Medium",
  });

  const rivalry = completeLocalRivalrySetup({
    selectedBrand,
    miniDraftProgress,
    setupState,
  });

  assert.equal(finished.actionStatus, "local-draft-finished");
  assert.equal(championship.actionStatus, "championship-setup-complete");
  assert.equal(rivalry.actionStatus, "rivalry-setup-complete");

  return {
    miniDraftProgress,
    setupState: rivalry.setupState,
    rosterIds,
  };
}

function createChampionRosterIds(
  miniDraftProgress: ReturnType<typeof createInitialMiniDraftProgress>
) {
  const projection = createChampionshipSetupProjection({
    selectedBrand,
    miniDraftProgress,
    setupState: createInitialLocalPostDraftSetupState(),
  });
  const used = new Set<string>();
  const selectedIds: Record<string, string> = {};

  for (const card of projection.championCards) {
    const candidate = card.eligibleRosterOptions.find(
      (option) => !used.has(option.candidateId)
    );

    assert.ok(candidate, `Missing eligible champion option for ${card.slotId}`);
    used.add(candidate.candidateId);
    selectedIds[card.slotId] = candidate.candidateId;
  }

  return selectedIds as {
    mensMainChampionId: string;
    mensMidcardChampionId: string;
    womensMainChampionId: string;
    womensMidcardChampionId: string;
  };
}

function createSegmentInput(segmentType: string, rosterIds: readonly string[]) {
  const segmentDefinition = LOCAL_WEEK_ONE_SEGMENT_TYPES.find(
    (type) => type.segmentType === segmentType
  );

  if (segmentDefinition?.inputKind === "promo") {
    return {
      segmentType,
      featuredWrestlerId: rosterIds[2],
    };
  }

  return {
    segmentType,
    wrestlerAId: rosterIds[0],
    wrestlerBId: rosterIds[1],
  };
}

function createReadyFinanceCard({
  miniDraftProgress,
  setupState,
  rosterIds,
}: {
  miniDraftProgress: ReturnType<typeof createInitialMiniDraftProgress>;
  setupState: ReturnType<typeof createInitialLocalPostDraftSetupState>;
  rosterIds: readonly string[];
}) {
  const selfPromo = addLocalWeekOneBookingSegment({
    selectedBrand,
    miniDraftProgress,
    setupState,
    bookingState: createInitialLocalWeekOneBookingState(),
    weeklyState: createInitialLocalWeeklyLoopState(),
    segmentInput: {
      segmentType: "self-promo",
      featuredWrestlerId: rosterIds[2],
    },
  });
  const championship = addLocalWeekOneBookingSegment({
    selectedBrand,
    miniDraftProgress,
    setupState,
    bookingState: selfPromo.bookingState,
    weeklyState: createInitialLocalWeeklyLoopState(),
    segmentInput: {
      segmentType: "championship-match",
      wrestlerAId: rosterIds[0],
      wrestlerBId: rosterIds[1],
    },
  });
  const mainEvent = addLocalWeekOneBookingSegment({
    selectedBrand,
    miniDraftProgress,
    setupState,
    bookingState: championship.bookingState,
    weeklyState: createInitialLocalWeeklyLoopState(),
    segmentInput: {
      segmentType: "main-event-singles-match",
      wrestlerAId: rosterIds[4],
      wrestlerBId: rosterIds[5],
    },
  });

  assert.equal(mainEvent.projection.status.readyToRun, true);
  return mainEvent.bookingState;
}

function readPlayableUiFile(fileName: string): string {
  return readFileSync(
    join("ui", "playable-new-gm-mode", fileName),
    "utf8"
  );
}
