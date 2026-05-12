import {
  createCandidateDisplayFromDataset,
  createDraftSelectionIntentPreview,
} from "./draftSelectionIntentAdapter.js";
import { createMockDraftRecapPreviewState } from "./draftRecapPreviewState.js";
import {
  createLocalDraftOrderPreviewProjection,
  createLocalGameSetupProjection,
  readLocalGameSetupStartingBudgetUnits,
} from "./localGameSetupController.js";
import {
  createAutoFillMinimumRosterReadiness,
  createFinishDraftReadiness,
  createInitialMiniDraftProgress,
  createMakePickReadiness,
  createPostDraftRosterHubProjection,
  executeAutoFillMinimumRoster,
  executeInMemoryMakePick,
  executeLocalFinishDraft,
  executeRivalBrandDraftPicks,
} from "./inMemoryDraftActionController.js";
import {
  LOCAL_RIVALRY_INTENSITIES,
  LOCAL_RIVALRY_TYPES,
  completeLocalChampionshipSetup,
  completeLocalRivalrySetup,
  createChampionshipSetupProjection,
  createInitialLocalPostDraftSetupState,
  createRivalrySetupProjection,
  createWeekOneHqProjection,
  updateLocalChampionshipSelection,
  updateLocalRivalrySlot,
} from "./localPostDraftSetupController.js";
import {
  LOCAL_WEEK_ONE_SEGMENT_TYPES,
  addLocalWeekOneBookingSegment,
  advanceLocalWeek,
  createInitialLocalWeekOneBookingState,
  createInitialLocalWeeklyLoopState,
  createWeeklyHqProjection,
  createWeekOneBookingProjection,
  removeLocalWeekOneBookingSegment,
  runLocalWeeklyShow,
} from "./localWeekOneBookingController.js";
import {
  createNewGMModeDraftPickCandidateObjects,
  createNewGMModeDraftFinanceProjection,
  createPlayableNewGMModeGameplayStateModel,
  NEW_GM_MODE_DRAFT_FINANCE_BOOKING_RESERVE_PLACEHOLDER,
  NEW_GM_MODE_DRAFT_FINANCE_MINIMUM_ROSTER_TARGET_PLACEHOLDER,
  NEW_GM_MODE_DRAFT_FINANCE_STARTING_BUDGET_PLACEHOLDER,
} from "../../src/game/domain/index.ts";
import {
  resolveActiveDockSection,
  shouldShowDock,
} from "./screenShellState.js";

(() => {
  const sections = Array.from(document.querySelectorAll("[data-screen-title]"));
  const navDock = document.querySelector(".bottom-nav-dock");
  const navItems = Array.from(document.querySelectorAll("[data-nav-target]"));
  const flowCards = Array.from(document.querySelectorAll("[data-flow-target]"));
  const jumpControls = Array.from(document.querySelectorAll("[data-go-to]"));
  const previewControls = Array.from(document.querySelectorAll("[data-preview-go-to]"));
  const makePickControl = document.querySelector("[data-make-pick-action]");
  const autoFillControl = document.querySelector("[data-auto-fill-minimum-roster]");
  const finishDraftControl = document.querySelector("[data-finish-local-draft]");
  const recapControl = document.querySelector("[data-local-recap-action]");
  const saveControls = Array.from(document.querySelectorAll("[data-save-current-game]"));
  const continueSaveControls = Array.from(document.querySelectorAll("[data-continue-save]"));
  const saveStatusTargets = Array.from(document.querySelectorAll(".js-save-status"));
  const talentList = document.querySelector(".talent-list");
  renderPlayableRosterUniverse(talentList);
  const talentRows = Array.from(document.querySelectorAll("[data-talent-name]"));
  const gmCards = Array.from(document.querySelectorAll("[data-gm-id]"));
  const brandControls = Array.from(document.querySelectorAll("[data-brand]"));
  const difficultyControls = Array.from(document.querySelectorAll("[data-difficulty]"));
  const activeBrandCountControls = Array.from(document.querySelectorAll("[data-active-brand-count]"));
  const activeLabel = document.getElementById("active-screen-label");
  const railActiveLabel = document.getElementById("rail-active-label");
  const brandBug = document.getElementById("brand-bug");
  const phaseLabel = document.getElementById("phase-label");
  const miniDraftPickBadge = document.getElementById("mini-draft-pick-badge");
  const draftBudgetTargets = {
    starting: document.getElementById("draft-budget-starting"),
    remaining: document.getElementById("draft-budget-remaining"),
    spent: document.getElementById("draft-budget-spent"),
    signed: document.getElementById("draft-budget-signed"),
    minimumRosterTarget: document.getElementById("draft-budget-minimum-roster"),
    reserve: document.getElementById("draft-budget-booking-reserve"),
    viability: document.getElementById("draft-budget-viability"),
    reserveStatus: document.getElementById("draft-budget-reserve-status"),
  };
  const draftPickOrderTargets = {
    board: document.getElementById("draft-pick-order-board"),
    onClockBrand: document.getElementById("draft-on-clock-brand"),
    competingBrands: document.getElementById("draft-competing-brands"),
    ticker: document.getElementById("draft-ticker-list"),
  };
  const draftSignedRosterTargets = {
    count: document.getElementById("draft-signed-roster-count"),
    list: document.getElementById("draft-signed-roster-list"),
  };
  const brandNameTargets = Array.from(document.querySelectorAll(".js-brand-name"));
  const setupBasicsTargets = {
    difficulty: document.getElementById("setup-difficulty-summary"),
    activeBrands: document.getElementById("setup-active-brands-summary"),
    startingBudget: document.getElementById("setup-starting-budget-summary"),
    playerBrand: document.getElementById("setup-player-brand-summary"),
    activeBrandList: document.getElementById("setup-active-brand-list"),
    competingGmList: document.getElementById("setup-competing-gm-list"),
  };
  const intentPreviewTargets = {
    candidate: document.getElementById("intent-preview-candidate"),
    brand: document.getElementById("intent-preview-brand"),
    pick: document.getElementById("intent-preview-pick"),
    status: document.getElementById("intent-preview-status"),
    note: document.getElementById("intent-preview-note"),
  };
  const financePreviewTargets = {
    startingBudget: document.getElementById("finance-preview-starting-budget"),
    remainingBudget: document.getElementById("finance-preview-remaining-budget"),
    tier: document.getElementById("finance-preview-tier"),
    cost: document.getElementById("finance-preview-cost"),
    afterSigning: document.getElementById("finance-preview-after-signing"),
    affordability: document.getElementById("finance-preview-affordability"),
    reserve: document.getElementById("finance-preview-reserve"),
  };
  const draftRecapTargets = {
    badge: document.getElementById("draft-recap-badge"),
    path: document.getElementById("draft-recap-path-label"),
    title: document.getElementById("draft-recap-title"),
    copy: document.getElementById("draft-recap-copy"),
    gm: document.getElementById("draft-recap-gm"),
    brand: document.getElementById("draft-recap-brand"),
    difficulty: document.getElementById("draft-recap-difficulty"),
    competitors: document.getElementById("draft-recap-competitors"),
    candidate: document.getElementById("draft-recap-candidate"),
    pick: document.getElementById("draft-recap-pick"),
    budget: document.getElementById("draft-recap-budget-summary"),
    status: document.getElementById("draft-recap-result-status"),
    rosterStatus: document.getElementById("draft-recap-roster-status"),
    roster: document.getElementById("draft-recap-roster"),
    note: document.getElementById("draft-recap-note"),
    dashboard: document.getElementById("dashboard-preview-note"),
    dashboardMiniDraftState: document.getElementById("dashboard-mini-draft-state"),
  };
  const draftRecapCommandTargets = {
    lock: document.getElementById("draft-recap-lock"),
    list: document.getElementById("draft-recap-roster-list"),
    signedCount: document.getElementById("draft-recap-summary-signed-count"),
    topSignings: document.getElementById("draft-recap-summary-top-signings"),
    minimumRoster: document.getElementById("draft-recap-summary-minimum"),
    minimumStatus: document.getElementById("draft-recap-summary-minimum-status"),
    startingBudget: document.getElementById("draft-recap-summary-starting-budget"),
    budgetSpent: document.getElementById("draft-recap-summary-budget-spent"),
    remainingBudget: document.getElementById("draft-recap-summary-remaining-budget"),
    bookingReserve: document.getElementById("draft-recap-summary-booking-reserve"),
    bookingReserveStatus: document.getElementById("draft-recap-summary-reserve-status"),
    localOnly: document.getElementById("draft-recap-summary-local-only"),
    weekOneLocked: document.getElementById("draft-recap-summary-week-one"),
  };
  const rosterHubTargets = {
    title: document.getElementById("roster-hub-title"),
    status: document.getElementById("roster-hub-status"),
    lock: document.getElementById("roster-hub-lock"),
    list: document.getElementById("post-draft-roster-list"),
    signedCount: document.getElementById("roster-summary-signed-count"),
    minimumRoster: document.getElementById("roster-summary-minimum"),
    minimumStatus: document.getElementById("roster-summary-minimum-status"),
    startingBudget: document.getElementById("roster-summary-starting-budget"),
    budgetSpent: document.getElementById("roster-summary-budget-spent"),
    remainingBudget: document.getElementById("roster-summary-remaining-budget"),
    bookingReserve: document.getElementById("roster-summary-booking-reserve"),
    bookingReserveStatus: document.getElementById("roster-summary-reserve-status"),
    localOnly: document.getElementById("roster-summary-local-only"),
    weekOneLocked: document.getElementById("roster-summary-week-one"),
  };
  const postDraftSetupTargets = {
    championshipCard: document.getElementById("post-draft-championship-card"),
    championshipStatus: document.getElementById("post-draft-championship-status"),
    championshipAction: document.getElementById("post-draft-championship-action"),
    rivalryCard: document.getElementById("post-draft-rivalry-card"),
    rivalryStatus: document.getElementById("post-draft-rivalry-status"),
    rivalryAction: document.getElementById("post-draft-rivalry-action"),
    weekOneCard: document.getElementById("post-draft-week-one-card"),
    weekOneStatus: document.getElementById("post-draft-week-one-status"),
    weekOneAction: document.getElementById("post-draft-week-one-action"),
  };
  const championshipSetupTargets = {
    status: document.getElementById("championship-setup-status"),
    message: document.getElementById("championship-setup-message"),
    summaryList: document.getElementById("championship-summary-list"),
    complete: document.getElementById("complete-championship-setup"),
    continue: document.getElementById("championship-continue-rivalries"),
    selects: {
      mensMainChampionId: document.getElementById("champion-mens-main-select"),
      mensMidcardChampionId: document.getElementById("champion-mens-midcard-select"),
      womensMainChampionId: document.getElementById("champion-womens-main-select"),
      womensMidcardChampionId: document.getElementById("champion-womens-midcard-select"),
    },
    titleLabels: {
      mensMainChampionId: document.getElementById("champion-mens-main-title"),
      mensMidcardChampionId: document.getElementById("champion-mens-midcard-title"),
      womensMainChampionId: document.getElementById("champion-womens-main-title"),
      womensMidcardChampionId: document.getElementById("champion-womens-midcard-title"),
    },
    mensTagTitle: document.getElementById("champion-mens-tag-title"),
    womensTagTitle: document.getElementById("champion-womens-tag-title"),
  };
  const rivalrySetupTargets = {
    status: document.getElementById("rivalry-setup-status"),
    message: document.getElementById("rivalry-setup-message"),
    summaryList: document.getElementById("rivalry-summary-list"),
    complete: document.getElementById("complete-rivalry-setup"),
    continue: document.getElementById("rivalry-continue-week-one"),
    slots: Array.from(document.querySelectorAll("[data-rivalry-slot]")).map((slot) => ({
      slot,
      wrestlerA: slot.querySelector(".rivalry-wrestler-a"),
      wrestlerB: slot.querySelector(".rivalry-wrestler-b"),
      type: slot.querySelector(".rivalry-type"),
      intensity: slot.querySelector(".rivalry-intensity"),
    })),
  };
  const weekOneHqTargets = {
    title: document.getElementById("brand-dashboard-title"),
    note: document.getElementById("dashboard-preview-note"),
    rosterCount: document.getElementById("week-one-hq-roster-count"),
    budget: document.getElementById("week-one-hq-budget"),
    setupStatus: document.getElementById("week-one-hq-setup-status"),
    local: document.getElementById("week-one-hq-local"),
    bookingAction: document.getElementById("week-one-hq-booking-action"),
    bookingState: document.getElementById("week-one-hq-booking-state"),
    bookingNote: document.getElementById("week-one-hq-booking-note"),
    bookingTile: document.getElementById("week-one-hq-booking-tile"),
    champions: document.getElementById("week-one-hq-champions"),
    rivalries: document.getElementById("week-one-hq-rivalries"),
    statusCard: document.getElementById("week-one-hq-status-card"),
    rosterTile: document.getElementById("week-one-hq-roster-tile"),
    budgetTile: document.getElementById("week-one-hq-budget-tile"),
    championTile: document.getElementById("week-one-hq-champion-tile"),
    rivalryTile: document.getElementById("week-one-hq-rivalry-tile"),
    calendarTile: document.getElementById("week-one-hq-calendar-tile"),
    titleDefenseTile: document.getElementById("week-one-hq-title-defense-tile"),
    rivalryPayoffTile: document.getElementById("week-one-hq-rivalry-payoff-tile"),
    historyTile: document.getElementById("week-one-hq-history-tile"),
    rosterHistoryTile: document.getElementById("week-one-hq-roster-history-tile"),
    financeObjectiveTile: document.getElementById("week-one-hq-finance-objective-tile"),
  };
  const bookingTargets = {
    title: document.getElementById("week-one-booking-title"),
    status: document.getElementById("week-one-booking-status"),
    message: document.getElementById("booking-builder-message"),
    segmentType: document.getElementById("booking-segment-type"),
    wrestlerA: document.getElementById("booking-wrestler-a"),
    wrestlerB: document.getElementById("booking-wrestler-b"),
    promoWrestler: document.getElementById("booking-promo-wrestler"),
    matchFields: Array.from(document.querySelectorAll(".booking-match-field")),
    promoFields: Array.from(document.querySelectorAll(".booking-promo-field")),
    addSegment: document.getElementById("add-week-one-segment"),
    segmentCount: document.getElementById("booking-segment-count"),
    mainEventStatus: document.getElementById("booking-main-event-status"),
    readyStatus: document.getElementById("booking-ready-status"),
    showCardList: document.getElementById("week-one-show-card-list"),
    summaryBrand: document.getElementById("booking-summary-brand"),
    summaryRoster: document.getElementById("booking-summary-roster"),
    summaryBudget: document.getElementById("booking-summary-budget"),
    projectedCost: document.getElementById("booking-summary-projected-cost"),
    afterCost: document.getElementById("booking-summary-after-cost"),
    budgetWarning: document.getElementById("booking-summary-budget-warning"),
    summaryChampions: document.getElementById("booking-summary-champions"),
    summaryRivalries: document.getElementById("booking-summary-rivalries"),
    runShow: document.getElementById("booking-run-show-action"),
    runShowFooter: document.getElementById("booking-run-show-footer-action"),
  };
  const showRecapTargets = {
    title: document.getElementById("show-recap-title"),
    status: document.getElementById("show-recap-status"),
    grade: document.getElementById("show-recap-grade"),
    crowd: document.getElementById("show-recap-crowd"),
    best: document.getElementById("show-recap-best"),
    weak: document.getElementById("show-recap-weak"),
    champion: document.getElementById("show-recap-champion"),
    rivalry: document.getElementById("show-recap-rivalry"),
    momentum: document.getElementById("show-recap-momentum"),
    fan: document.getElementById("show-recap-fan"),
    social: document.getElementById("show-recap-social"),
    budget: document.getElementById("show-recap-budget"),
    financeStarting: document.getElementById("show-recap-finance-starting"),
    financeCosts: document.getElementById("show-recap-finance-costs"),
    financeTickets: document.getElementById("show-recap-finance-tickets"),
    financeMerch: document.getElementById("show-recap-finance-merch"),
    financeNet: document.getElementById("show-recap-finance-net"),
    financeUpdated: document.getElementById("show-recap-finance-updated"),
    local: document.getElementById("show-recap-local"),
    segments: document.getElementById("show-recap-segments"),
    advance: document.getElementById("show-recap-advance-week"),
  };
  const talentDetail = {
    panel: document.querySelector(".selected-profile"),
    initials: document.getElementById("talent-detail-initials"),
    name: document.getElementById("talent-detail-name"),
    role: document.getElementById("talent-detail-role"),
    availability: document.getElementById("talent-detail-availability"),
    read: document.getElementById("talent-detail-read"),
    fit: document.getElementById("talent-detail-fit"),
    previewStatus: document.getElementById("talent-detail-preview-status"),
    starPower: document.getElementById("talent-detail-star-power"),
    ringWork: document.getElementById("talent-detail-ring-work"),
    promo: document.getElementById("talent-detail-promo"),
    durability: document.getElementById("talent-detail-durability"),
    risk: document.getElementById("talent-detail-risk"),
    confidence: document.getElementById("talent-detail-confidence"),
    starMeter: document.getElementById("talent-detail-star-meter"),
    ringMeter: document.getElementById("talent-detail-ring-meter"),
    promoMeter: document.getElementById("talent-detail-promo-meter"),
    durabilityMeter: document.getElementById("talent-detail-durability-meter"),
    riskMeter: document.getElementById("talent-detail-risk-meter"),
    confidenceMeter: document.getElementById("talent-detail-confidence-meter"),
  };
  const flowOrder = [
    "save-selection",
    "contract-signing",
    "setup-basics",
    "ai-setup",
    "choose-gm",
    "select-brand",
    "draft-room",
    "draft-recap",
    "championship-setup",
    "rivalry-setup",
    "brand-dashboard",
    "week-one-booking",
    "show-recap",
  ];

  const sectionNavMap = {
    "game-landing": undefined,
    "save-selection": undefined,
    "settings-screen": "settings",
    "contract-signing": undefined,
    "setup-basics": undefined,
    "ai-setup": undefined,
    "choose-gm": undefined,
    "select-brand": undefined,
    "draft-room": "booking",
    "draft-recap": "roster",
    "roster-hub": "roster",
    "championship-setup": "roster",
    "rivalry-setup": "roster",
    "brand-dashboard": "dashboard",
    "week-one-booking": "booking",
    "show-recap": "booking",
  };

  const brandLabels = {
    raw: { label: "Raw", mark: "RAW" },
    smackdown: { label: "SmackDown", mark: "SD" },
    nxt: { label: "NXT", mark: "NXT" },
    aew: { label: "AEW", mark: "AEW" },
  };
  const uiState = {
    currentScreenId: "game-landing",
    selectedGmId: "maren-vale",
    selectedBrandId: "raw",
    selectedDifficulty: "normal",
    activeBrandCount: 4,
    selectedCandidateId: "candidate-roman-reigns",
    selectedDraftIntentPreview: undefined,
    mockDraftRecapPreview: undefined,
    miniDraftProgress: createInitialMiniDraftProgress({
      selectedBrand: { brandId: "raw", brandLabel: "Raw" },
      startingDraftBudget: 120,
    }),
    localPostDraftSetup: createInitialLocalPostDraftSetupState(),
    localWeekOneBooking: createInitialLocalWeekOneBookingState(),
    localWeeklyLoop: createInitialLocalWeeklyLoopState(),
    lastSaveStatusLine: "Not Saved Yet",
  };
  let dockCollapseTimer;

  function clearDockCollapseTimer() {
    if (dockCollapseTimer) {
      window.clearTimeout(dockCollapseTimer);
      dockCollapseTimer = undefined;
    }
  }

  function collapseDock() {
    clearDockCollapseTimer();
    navDock?.classList.add("dock-collapsed");
  }

  function releaseDockCollapse() {
    clearDockCollapseTimer();
    navDock?.classList.remove("dock-collapsed");
  }

  function scheduleDockCollapse() {
    clearDockCollapseTimer();
    dockCollapseTimer = window.setTimeout(collapseDock, 180);
  }

  function getSection(targetId) {
    return sections.find((section) => section.id === targetId);
  }

  function updateFlow(targetId) {
    const activeIndex = flowOrder.indexOf(targetId);

    flowCards.forEach((card) => {
      const cardId = card.dataset.flowTarget;
      const cardIndex = flowOrder.indexOf(cardId);
      const isCurrent = cardId === targetId;
      const isComplete = activeIndex > -1 && cardIndex > -1 && cardIndex < activeIndex;

      card.classList.toggle("active", isCurrent);
      card.classList.toggle("complete", isComplete);
    });
  }

  function showSection(targetId, preferredNavSection, options = {}) {
    const resolvedTargetId =
      targetId === "roster-hub" && uiState.miniDraftProgress.localDraftFinished
        ? "draft-recap"
        : targetId;
    const target = getSection(resolvedTargetId);

    if (!target) {
      return;
    }

    uiState.currentScreenId = resolvedTargetId;
    const navigationContext = options.navigationContext;
    const dockVisible = shouldShowDock(resolvedTargetId, { navigationContext });
    const activeNavSection = resolveActiveDockSection({
      screenId: resolvedTargetId,
      preferredNavSection,
      sectionNavMap,
      navigationContext,
    });
    const activeNavItem = navItems.find((item) => item.dataset.navSection === activeNavSection);

    sections.forEach((section) => {
      const isActive = section === target;
      section.hidden = !isActive;
      section.classList.toggle("active-screen", isActive);
    });

    if (navDock) {
      navDock.hidden = !dockVisible;
      navDock.setAttribute("aria-hidden", String(!dockVisible));
      if (!dockVisible) {
        navDock.classList.add("dock-collapsed");
      }
    }

    navItems.forEach((item) => {
      const isActive = item.dataset.navSection === activeNavSection;
      item.classList.toggle("active", isActive);
      item.tabIndex = dockVisible ? 0 : -1;
      if (isActive) {
        item.setAttribute("aria-current", "page");
      } else {
        item.removeAttribute("aria-current");
      }
    });

    updateFlow(resolvedTargetId);
    document.body.classList.toggle("is-landing", resolvedTargetId === "game-landing");
    document.body.classList.toggle("is-dock-hidden", !dockVisible);
    document.body.classList.toggle("is-game-shell", dockVisible);

    if (activeLabel) {
      activeLabel.textContent = target.dataset.screenTitle;
    }

    if (railActiveLabel) {
      railActiveLabel.textContent = activeNavItem?.dataset.navLabel || target.dataset.screenTitle;
    }

    if (phaseLabel) {
      phaseLabel.textContent = target.dataset.flowPhase || "Preview";
    }

    if (resolvedTargetId === "setup-basics") {
      updateSetupBasicsSurface();
    }

    if (resolvedTargetId === "draft-room") {
      updateDraftPickOrderSurface();
    }

    if (resolvedTargetId === "roster-hub") {
      updatePostDraftRosterHub();
    }

    if (resolvedTargetId === "draft-recap") {
      updateDraftRecapCommandSurface();
    }

    if (resolvedTargetId === "championship-setup") {
      updateChampionshipSetupSurface();
    }

    if (resolvedTargetId === "rivalry-setup") {
      updateRivalrySetupSurface();
    }

    if (resolvedTargetId === "brand-dashboard") {
      updateWeekOneHqSurface();
    }

    if (resolvedTargetId === "week-one-booking") {
      updateWeekOneBookingSurface();
    }

    if (resolvedTargetId === "show-recap") {
      updateShowRecapSurface();
    }
  }

  function getBrandLabel() {
    return brandLabels[uiState.selectedBrandId]?.label || "Raw";
  }

  function setBrand(brandId) {
    const brand = brandLabels[brandId];

    if (!brand) {
      return;
    }

    uiState.selectedBrandId = brandId;
    document.body.classList.remove("brand-raw", "brand-smackdown", "brand-nxt", "brand-aew");
    document.body.classList.add(`brand-${brandId}`);

    brandControls.forEach((control) => {
      control.classList.toggle("selected", control.dataset.brand === brandId);
    });

    if (brandBug) {
      brandBug.textContent = brand.mark;
    }

    brandNameTargets.forEach((target) => {
      target.textContent = brand.label;
    });

    resetDraftProgressForSetupIfSafe();
    updateSetupBasicsSurface();
    updateDraftPickOrderSurface();
    updatePostDraftRosterHub();

    const selectedRow = talentRows.find((row) => row.dataset.candidateId === uiState.selectedCandidateId);
    if (selectedRow) {
      setSelectedCandidate(selectedRow);
    }
  }

  function setSelectedGm(card) {
    uiState.selectedGmId = card.dataset.gmId;

    gmCards.forEach((item) => {
      const isSelected = item === card;
      item.classList.toggle("selected", isSelected);
      item.setAttribute("aria-pressed", String(isSelected));
    });
  }

  function setDifficulty(difficulty) {
    if (!["easy", "normal", "hard"].includes(difficulty)) {
      return;
    }

    uiState.selectedDifficulty = difficulty;
    resetDraftProgressForSetupIfSafe();
    updateSetupBasicsSurface();
  }

  function setActiveBrandCount(activeBrandCount) {
    const normalizedCount = Number(activeBrandCount);

    if (![2, 3, 4].includes(normalizedCount)) {
      return;
    }

    uiState.activeBrandCount = normalizedCount;
    resetDraftProgressForSetupIfSafe();
    updateSetupBasicsSurface();
  }

  function resetDraftProgressForSetupIfSafe() {
    if (
      uiState.miniDraftProgress.completedPickSummaries.length ||
      uiState.miniDraftProgress.rivalPickSummaries?.length ||
      uiState.miniDraftProgress.localDraftFinished
    ) {
      return;
    }

    uiState.miniDraftProgress = createInitialMiniDraftProgress({
      selectedBrand: getSelectedBrandDisplay(),
      startingDraftBudget: readLocalGameSetupStartingBudgetUnits(
        uiState.selectedDifficulty
      ),
    });
    updateDraftBudgetPanel();
    updateFinanceCandidateRows();
  }

  function updateSetupBasicsSurface() {
    const setupProjection = createLocalGameSetupProjection({
      selectedDifficulty: uiState.selectedDifficulty,
      activeBrandCount: uiState.activeBrandCount,
      selectedBrandId: uiState.selectedBrandId,
      selectedGm: getSelectedGmDisplay(),
    });

    difficultyControls.forEach((control) => {
      const active = control.dataset.difficulty === uiState.selectedDifficulty;
      control.classList.toggle("active", active);
      control.setAttribute("aria-pressed", String(active));
    });

    activeBrandCountControls.forEach((control) => {
      const active = Number(control.dataset.activeBrandCount) === uiState.activeBrandCount;
      control.classList.toggle("active", active);
      control.setAttribute("aria-pressed", String(active));
    });

    setText(setupBasicsTargets.difficulty, setupProjection.displayLabels.difficultyLine);
    setText(setupBasicsTargets.activeBrands, setupProjection.displayLabels.activeBrandsLine);
    setText(setupBasicsTargets.startingBudget, setupProjection.displayLabels.startingBudgetLine);
    setText(setupBasicsTargets.playerBrand, getBrandLabel());
    setText(setupBasicsTargets.activeBrandList, setupProjection.displayLabels.activeBrandLine);
    setText(setupBasicsTargets.competingGmList, setupProjection.displayLabels.competingGmLine);
    setText(
      document.getElementById("brand-baseline-budget"),
      `Starting Budget: ${setupProjection.displayLabels.startingBudgetLine}`
    );
    setText(
      document.getElementById("brand-baseline-difficulty"),
      `Difficulty: ${setupProjection.displayLabels.difficultyLine}`
    );
    setText(
      document.getElementById("brand-baseline-active-brands"),
      `Active Brands: ${setupProjection.displayLabels.activeBrandsLine}`
    );
    setText(
      document.getElementById("brand-baseline-competitors"),
      `Competitors: ${setupProjection.competingBrands.map((brand) => brand.brandLabel).join(", ")}`
    );
  }

  function getSelectedGmDisplay() {
    const selectedCard = gmCards.find((card) => card.dataset.gmId === uiState.selectedGmId);
    const displayName = selectedCard?.querySelector("h3")?.textContent;

    return {
      gmId: uiState.selectedGmId,
      displayName,
    };
  }

  function getSelectedCandidateDisplay() {
    const selectedRow = talentRows.find((row) => row.dataset.candidateId === uiState.selectedCandidateId);

    if (!selectedRow) {
      return undefined;
    }

    const candidate = createCandidateDisplayFromDataset(selectedRow.dataset);

    if (uiState.miniDraftProgress.draftedCandidateIds.includes(candidate.candidateId)) {
      return {
        ...candidate,
        availability: "Drafted",
      };
    }

    return candidate;
  }

  function getSelectedBrandDisplay() {
    return {
      brandId: uiState.selectedBrandId,
      brandLabel: getBrandLabel(),
    };
  }

  function createDraftSelectionIntentPresentationPreview(row) {
    return createDraftSelectionIntentPreview({
      selectedCandidate: getCandidateDisplayFromRow(row),
      selectedBrand: getSelectedBrandDisplay(),
      draftSlot: uiState.miniDraftProgress.currentDraftSlot,
    });
  }

  function updateIntentPreview(preview) {
    if (intentPreviewTargets.candidate) {
      intentPreviewTargets.candidate.textContent = preview.displayLabels.candidateLine;
    }

    if (intentPreviewTargets.brand) {
      intentPreviewTargets.brand.textContent = preview.displayLabels.brandLine;
    }

    if (intentPreviewTargets.pick) {
      intentPreviewTargets.pick.textContent = preview.displayLabels.pickLine;
    }

    if (intentPreviewTargets.status) {
      intentPreviewTargets.status.textContent = preview.displayLabels.statusLine;
    }

    if (intentPreviewTargets.note) {
      intentPreviewTargets.note.textContent = preview.displayLabels.noteLine;
    }
  }

  function updateFinancePreviewForCandidate(candidate) {
    const projection = createNewGMModeDraftFinanceProjection({
      selectedCandidateId: candidate?.candidateId,
      remainingDraftBudgetPreview: uiState.miniDraftProgress.remainingDraftBudget,
      alreadyDraftedCandidateIds: uiState.miniDraftProgress.draftedCandidateIds,
    });
    const candidateProjection = projection.selectedCandidateProjection;

    setText(
      financePreviewTargets.startingBudget,
      `Starting Budget: ${formatBudgetUnitsAsMoney(
        uiState.miniDraftProgress.startingDraftBudget ??
          NEW_GM_MODE_DRAFT_FINANCE_STARTING_BUDGET_PLACEHOLDER
      )}`
    );
    setText(
      financePreviewTargets.remainingBudget,
      `Remaining Budget: ${formatBudgetUnitsAsMoney(
        uiState.miniDraftProgress.remainingDraftBudget
      )}`
    );
    setText(
      financePreviewTargets.tier,
      candidateProjection
        ? `Signing Tier: ${candidateProjection.projectedSigningTier}`
        : "Signing Tier: Locked"
    );
    setText(
      financePreviewTargets.cost,
      candidateProjection
        ? `Signing Cost: ${formatBudgetUnitsAsMoney(candidateProjection.projectedSigningCost)}`
        : "Signing Cost: Locked"
    );
    setText(
      financePreviewTargets.afterSigning,
      candidateProjection
        ? `Budget After Signing: ${formatBudgetUnitsAsMoney(
            candidateProjection.budgetPreviewAfterSigning
          )}`
        : "Budget After Signing: Locked pending rules"
    );
    setText(
      financePreviewTargets.affordability,
      formatCandidateAffordabilityLine(candidateProjection) ||
        "Locked pending finance rules"
    );
    setText(
      financePreviewTargets.reserve,
      formatCandidateReserveLine(candidateProjection) ||
        `Booking Reserve Target: ${formatBudgetUnitsAsMoney(
          NEW_GM_MODE_DRAFT_FINANCE_BOOKING_RESERVE_PLACEHOLDER
        )}`
    );
  }

  function updateDraftBudgetPanel() {
    const progress = uiState.miniDraftProgress;
    const minimumTarget =
      progress.minimumViableRosterCount ??
      progress.minimumRosterTarget ??
      NEW_GM_MODE_DRAFT_FINANCE_MINIMUM_ROSTER_TARGET_PLACEHOLDER;
    const startingBudget =
      progress.startingDraftBudget ??
      NEW_GM_MODE_DRAFT_FINANCE_STARTING_BUDGET_PLACEHOLDER;
    const reserveBudget =
      progress.bookingReserveBudget ??
      NEW_GM_MODE_DRAFT_FINANCE_BOOKING_RESERVE_PLACEHOLDER;

    setText(draftBudgetTargets.starting, `Starting Budget ${formatBudgetUnitsAsMoney(startingBudget)}`);
    setText(draftBudgetTargets.remaining, `Remaining ${formatBudgetUnitsAsMoney(progress.remainingDraftBudget)}`);
    setText(draftBudgetTargets.spent, `Spent ${formatBudgetUnitsAsMoney(progress.budgetSpent)}`);
    setText(draftBudgetTargets.signed, `Signed ${progress.signedTalentCount}/${minimumTarget}`);
    setText(draftBudgetTargets.minimumRosterTarget, `Min Roster ${minimumTarget}`);
    setText(draftBudgetTargets.reserve, `Reserve ${formatBudgetUnitsAsMoney(reserveBudget)}`);
    setText(
      draftBudgetTargets.viability,
      progress.minimumRosterViable ? "Roster Ready" : "Roster Not Ready"
    );
    setText(
      draftBudgetTargets.reserveStatus,
      progress.bookingReserveProtected ? "Reserve Protected" : "Reserve Dipped"
    );
    updateDraftSignedRosterPanel();
    updateDraftPickOrderSurface();
  }

  function updateDraftPickOrderSurface() {
    if (!draftPickOrderTargets.board) {
      return;
    }

    const projection = createLocalDraftOrderPreviewProjection({
      selectedDifficulty: uiState.selectedDifficulty,
      activeBrandCount: uiState.activeBrandCount,
      selectedBrandId: uiState.selectedBrandId,
      selectedGm: getSelectedGmDisplay(),
    });
    const currentTurn = getCurrentDraftTurnBrand(projection.rows);
    setText(draftPickOrderTargets.onClockBrand, currentTurn.brandLabel);
    setText(
      draftPickOrderTargets.competingBrands,
      `Competing brands: ${projection.setupProjection.competingBrands.map((brand) => brand.brandLabel).join(", ")}`
    );
    setText(draftPickOrderTargets.ticker, createDraftTickerLine());

    draftPickOrderTargets.board.replaceChildren(
      createDraftOrderHeaderRow(),
      ...projection.rows.map((row) => createDraftOrderRow(row))
    );
  }

  function updateDraftSignedRosterPanel() {
    const progress = uiState.miniDraftProgress;
    const minimumTarget =
      progress.minimumViableRosterCount ??
      progress.minimumRosterTarget ??
      NEW_GM_MODE_DRAFT_FINANCE_MINIMUM_ROSTER_TARGET_PLACEHOLDER;

    setText(
      draftSignedRosterTargets.count,
      `${progress.signedTalentCount}/${minimumTarget} Signed`
    );

    if (!draftSignedRosterTargets.list) {
      return;
    }

    if (!progress.completedPickSummaries.length) {
      const empty = document.createElement("p");
      empty.className = "empty-signed-roster";
      empty.textContent = "No picks yet. Make Pick to add your first signing.";
      draftSignedRosterTargets.list.replaceChildren(empty);
      return;
    }

    draftSignedRosterTargets.list.replaceChildren(
      ...progress.completedPickSummaries.map((summary) =>
        createDraftSignedRosterItem(summary)
      )
    );
  }

  function createDraftSignedRosterItem(summary) {
    const item = document.createElement("article");
    item.className = "draft-signed-item";

    const pick = document.createElement("span");
    pick.textContent = `#${summary.pickNumber}`;

    const name = document.createElement("strong");
    name.textContent = summary.candidateName || "Signed Superstar";

    const meta = document.createElement("em");
    meta.textContent = [
      summary.pickSource === "auto-fill" ? "Auto-Filled" : "Manual",
      summary.signingTier,
      `Cost ${formatBudgetUnitsAsMoney(summary.signingCost)}`,
    ].filter(Boolean).join(" / ");

    item.append(pick, name, meta);
    return item;
  }

  function createDraftOrderHeaderRow() {
    const row = document.createElement("div");
    row.className = "board-row board-head";
    ["Pick", "Brand", "Status"].forEach((label) => {
      const span = document.createElement("span");
      span.textContent = label;
      row.append(span);
    });

    return row;
  }

  function createDraftOrderRow(orderRow) {
    const row = document.createElement("div");
    const currentTurn =
      orderRow.pickNumber === uiState.miniDraftProgress.currentPickIndex + 1;
    row.className = currentTurn ? "board-row current" : "board-row";

    const pick = document.createElement("span");
    pick.textContent = String(orderRow.pickNumber).padStart(2, "0");

    const brand = document.createElement("strong");
    brand.textContent = orderRow.brandLabel;

    const status = document.createElement("em");
    status.textContent = currentTurn ? "On The Clock" : orderRow.statusLabel;

    row.append(pick, brand, status);
    return row;
  }

  function getCurrentDraftTurnBrand(rows) {
    return (
      rows.find((row) => row.pickNumber === uiState.miniDraftProgress.currentPickIndex + 1) ||
      rows[0] ||
      { brandLabel: getBrandLabel() }
    );
  }

  function getCompetingBrandsForSetup() {
    return createLocalGameSetupProjection({
      selectedDifficulty: uiState.selectedDifficulty,
      activeBrandCount: uiState.activeBrandCount,
      selectedBrandId: uiState.selectedBrandId,
      selectedGm: getSelectedGmDisplay(),
    }).competingBrands;
  }

  function createDraftTickerLine() {
    const picks = [
      ...uiState.miniDraftProgress.completedPickSummaries,
      ...(uiState.miniDraftProgress.rivalPickSummaries || []),
    ]
      .slice()
      .sort((first, second) => first.pickNumber - second.pickNumber)
      .slice(-6);

    if (!picks.length) {
      return `${getBrandLabel()} opens Draft Night on the clock.`;
    }

    return picks
      .map((pick) => `${pick.pickNumber}. ${pick.candidateName} signed to ${pick.brandLabel}`)
      .join(" | ");
  }

  function updateFinanceCandidateRows() {
    talentRows.forEach((row) => {
      const projection = createNewGMModeDraftFinanceProjection({
        selectedCandidateId: row.dataset.candidateId,
        remainingDraftBudgetPreview: uiState.miniDraftProgress.remainingDraftBudget,
        alreadyDraftedCandidateIds: uiState.miniDraftProgress.draftedCandidateIds,
      });
      const candidateProjection = projection.selectedCandidateProjection;
      const drafted = uiState.miniDraftProgress.draftedCandidateIds.includes(row.dataset.candidateId);
      const unavailable = row.dataset.availability === "Unavailable";
      const unaffordable =
        candidateProjection?.affordabilityStatus === "not-affordable" &&
        !drafted &&
        !unavailable;
      const reserveWarning =
        candidateProjection &&
        candidateProjection.budgetPreviewAfterSigning <
          uiState.miniDraftProgress.bookingReserveBudget &&
        !drafted &&
        !unavailable &&
        !unaffordable;
      const meta = row.querySelector("small");

      row.classList.toggle("budget-blocked", unaffordable);
      row.classList.toggle("reserve-warning", Boolean(reserveWarning));

      if (meta && candidateProjection) {
        meta.textContent = [
          row.dataset.draftRank,
          drafted
            ? createDraftedStatusLine(row.dataset.candidateId)
            : unavailable
              ? "Unavailable"
              : reserveWarning
                ? "Reserve Warning"
                : formatRowAffordability(candidateProjection),
          candidateProjection.projectedSigningTier,
          `Cost ${formatBudgetUnitsAsMoney(candidateProjection.projectedSigningCost)}`,
        ].join(" | ");
      }

      setText(
        row.querySelector(".talent-cost"),
        candidateProjection
          ? `Cost ${formatBudgetUnitsAsMoney(candidateProjection.projectedSigningCost)}`
          : "Cost --"
      );
      setText(
        row.querySelector(".talent-tier"),
        candidateProjection?.projectedSigningTier || "Tier Locked"
      );
    });
  }

  function createDraftedStatusLine(candidateId) {
    const summary = findDraftedPickSummary(candidateId);

    return summary?.pickSource === "rival-brand"
      ? `Signed to ${summary.brandLabel}`
      : "Already Signed";
  }

  function findDraftedPickSummary(candidateId) {
    return [
      ...uiState.miniDraftProgress.completedPickSummaries,
      ...(uiState.miniDraftProgress.rivalPickSummaries || []),
    ].find((summary) => summary.candidateId === candidateId);
  }

  function createMockDraftRecapPreviewFromUiState() {
    return createMockDraftRecapPreviewState({
      selectedGm: getSelectedGmDisplay(),
      selectedBrand: getSelectedBrandDisplay(),
      selectedCandidate: getSelectedCandidateDisplay(),
    });
  }

  function updateMockDraftRecapPreview(preview) {
    setText(draftRecapTargets.badge, preview.displayLabels.recapStatusLine);
    setText(draftRecapTargets.path, "Draft Recap Preview");
    setText(draftRecapTargets.title, `Welcome to ${getBrandWelcomeLabel(getBrandLabel())}`);
    setText(
      draftRecapTargets.copy,
      "Finish the draft to review your signed roster, budget position, and locked next steps."
    );
    setText(draftRecapTargets.gm, preview.displayLabels.gmLine);
    setText(draftRecapTargets.brand, preview.displayLabels.brandLine);
    setText(draftRecapTargets.difficulty, getDifficultyLabel());
    setText(
      draftRecapTargets.competitors,
      getCompetingBrandsForSetup().map((brand) => brand.brandLabel).join(", ")
    );
    setText(draftRecapTargets.candidate, preview.displayLabels.candidateLine);
    setText(draftRecapTargets.pick, "Draft not finished");
    setText(draftRecapTargets.budget, "No local budget spent");
    setText(draftRecapTargets.status, "Draft not finished");
    setText(draftRecapTargets.rosterStatus, "Roster locked");
    setText(draftRecapTargets.roster, preview.displayLabels.rosterLine);
    setText(draftRecapTargets.note, preview.displayLabels.noteLine);
    setText(draftRecapTargets.dashboard, preview.displayLabels.dashboardLine);
    updateDraftRecapCommandSurface();
  }

  function updateInMemoryDraftRecapProjection(projection) {
    setText(draftRecapTargets.badge, projection.displayLabels.recapStatusLine);
    setText(draftRecapTargets.path, projection.displayLabels.pathLine);
    setText(draftRecapTargets.title, `Welcome to ${getBrandWelcomeLabel(getBrandLabel())}`);
    setText(draftRecapTargets.copy, projection.displayLabels.copyLine);
    setText(draftRecapTargets.gm, projection.displayLabels.gmLine);
    setText(draftRecapTargets.brand, projection.displayLabels.brandLine);
    setText(draftRecapTargets.difficulty, getDifficultyLabel());
    setText(
      draftRecapTargets.competitors,
      getCompetingBrandsForSetup().map((brand) => brand.brandLabel).join(", ")
    );
    setText(draftRecapTargets.candidate, projection.displayLabels.candidateLine);
    setText(draftRecapTargets.pick, projection.displayLabels.pickLine);
    setText(draftRecapTargets.budget, formatDraftBudgetSummaryLine(projection.budgetSummary));
    setText(draftRecapTargets.status, projection.displayLabels.draftResultStatusLine);
    setText(draftRecapTargets.rosterStatus, projection.displayLabels.rosterStatusLine);
    setText(draftRecapTargets.roster, projection.displayLabels.rosterLine);
    setText(draftRecapTargets.note, projection.displayLabels.noteLine);
    setText(draftRecapTargets.dashboard, projection.displayLabels.dashboardLine);
    updateDashboardMiniDraftState(projection);
    updateDraftRecapCommandSurface();
  }

  function updateDashboardMiniDraftState(projection) {
    const stateCard = draftRecapTargets.dashboardMiniDraftState;

    if (!stateCard) {
      return;
    }

    setText(stateCard.querySelector("span"), "Initial Draft");
    setText(
      stateCard.querySelector("strong"),
      projection.localDraftFinished
        ? "Draft Finished Locally"
        : projection.minimumRosterViable
          ? "Minimum Viable, Still Open"
          : "Draft Still Open"
    );
    setText(
      stateCard.querySelector("em"),
      projection.localDraftFinished
        ? "Week 1 setup, booking, and saving remain locked"
        : projection.minimumRosterViable
          ? "Finish Draft locally when ready"
          : "Sign at least 16 before finishing"
    );
  }

  function updatePostDraftRosterHub() {
    const projection = createPostDraftRosterHubProjection({
      selectedBrand: getSelectedBrandDisplay(),
      miniDraftProgress: uiState.miniDraftProgress,
    });

    renderPostDraftRosterProjection(projection, rosterHubTargets);
    updatePostDraftSetupCards();
  }

  function updateDraftRecapCommandSurface() {
    const projection = createPostDraftRosterHubProjection({
      selectedBrand: getSelectedBrandDisplay(),
      miniDraftProgress: uiState.miniDraftProgress,
    });

    renderPostDraftRosterProjection(projection, draftRecapCommandTargets);
    updatePostDraftSetupCards();
  }

  function renderPostDraftRosterProjection(projection, targets) {
    setText(targets.title, projection.displayLabels.titleLine);
    setText(targets.status, projection.displayLabels.statusLine);
    setText(targets.lock, projection.displayLabels.emptyRosterLine);
    setText(targets.signedCount, projection.displayLabels.signedCountLine);
    setText(targets.topSignings, projection.displayLabels.topSigningLine);
    setText(targets.minimumRoster, projection.displayLabels.minimumRosterLine);
    setText(targets.minimumStatus, projection.displayLabels.minimumRosterStatusLine);
    setText(targets.startingBudget, `Starting Budget: ${formatBudgetUnitsAsMoney(projection.summary.startingDraftBudget)}`);
    setText(targets.budgetSpent, `Budget Spent: ${formatBudgetUnitsAsMoney(projection.summary.budgetSpent)}`);
    setText(targets.remainingBudget, `Remaining Budget: ${formatBudgetUnitsAsMoney(projection.summary.remainingDraftBudget)}`);
    setText(targets.bookingReserve, `Booking Reserve Target: ${formatBudgetUnitsAsMoney(projection.summary.bookingReserveBudget)}`);
    setText(
      targets.bookingReserveStatus,
      projection.displayLabels.bookingReserveStatusLine
    );
    setText(targets.localOnly, projection.displayLabels.rivalPickLine);
    setText(targets.weekOneLocked, projection.displayLabels.weekOneLockedLine);

    targets.lock?.classList.toggle("hidden", !projection.locked);
    targets.list?.classList.toggle("locked", projection.locked);

    if (targets.list) {
      targets.list.replaceChildren(
        ...(projection.locked
          ? []
          : projection.signedTalent.map((talent) =>
              createPostDraftRosterCard(talent)
            ))
      );
    }
  }

  function updatePostDraftSetupCards() {
    const championshipProjection = createChampionshipSetupProjection({
      selectedBrand: getSelectedBrandDisplay(),
      miniDraftProgress: uiState.miniDraftProgress,
      setupState: uiState.localPostDraftSetup,
    });
    const rivalryProjection = createRivalrySetupProjection({
      selectedBrand: getSelectedBrandDisplay(),
      miniDraftProgress: uiState.miniDraftProgress,
      setupState: uiState.localPostDraftSetup,
    });
    const weekOneProjection = createWeekOneHqProjection({
      selectedBrand: getSelectedBrandDisplay(),
      miniDraftProgress: uiState.miniDraftProgress,
      setupState: uiState.localPostDraftSetup,
    });
    const championshipAvailable = championshipProjection.localDraftFinished;
    const rivalryAvailable = championshipProjection.complete;
    const weekOneAvailable = weekOneProjection.unlocked;

    setSetupCardState({
      card: postDraftSetupTargets.championshipCard,
      status: postDraftSetupTargets.championshipStatus,
      action: postDraftSetupTargets.championshipAction,
      active: championshipAvailable,
      complete: championshipProjection.complete,
      statusText: championshipProjection.complete
        ? "Setup Complete"
        : championshipAvailable
          ? "Setup Available"
          : "Locked",
      actionText: championshipProjection.complete
        ? "Review Champions"
        : "Assign Champions",
    });
    setSetupCardState({
      card: postDraftSetupTargets.rivalryCard,
      status: postDraftSetupTargets.rivalryStatus,
      action: postDraftSetupTargets.rivalryAction,
      active: rivalryAvailable,
      complete: rivalryProjection.complete,
      statusText: rivalryProjection.complete
        ? "Setup Complete"
        : rivalryAvailable
          ? "Setup Available"
          : "Locked",
      actionText: rivalryProjection.complete ? "Review Rivalries" : "Create Rivalries",
    });
    setSetupCardState({
      card: postDraftSetupTargets.weekOneCard,
      status: postDraftSetupTargets.weekOneStatus,
      action: postDraftSetupTargets.weekOneAction,
      active: weekOneAvailable,
      complete: weekOneProjection.unlocked,
      statusText: weekOneProjection.unlocked ? "Available" : "Locked",
      actionText: "Open Week 1 HQ",
    });
  }

  function setSetupCardState({
    card,
    status,
    action,
    active,
    complete,
    statusText,
    actionText,
  }) {
    card?.classList.toggle("setup-available", active && !complete);
    card?.classList.toggle("setup-complete", complete);
    card?.classList.toggle("setup-locked", !active);
    setText(status, statusText);

    if (action) {
      action.disabled = !active;
      action.textContent = actionText;
      action.classList.toggle("enabled", active);
      action.setAttribute("aria-disabled", String(!active));
    }
  }

  function updateChampionshipSetupSurface() {
    const projection = createChampionshipSetupProjection({
      selectedBrand: getSelectedBrandDisplay(),
      miniDraftProgress: uiState.miniDraftProgress,
      setupState: uiState.localPostDraftSetup,
    });

    setText(championshipSetupTargets.status, projection.displayLabels.statusLine);
    setText(championshipSetupTargets.message, projection.displayLabels.statusLine);
    projection.championCards.forEach((card) => {
      setText(championshipSetupTargets.titleLabels[card.slotId], card.label);
    });
    setText(
      championshipSetupTargets.mensTagTitle,
      projection.tagTitleCards.find((card) => card.slotId === "mensTagTeamChampionIds")?.label
    );
    setText(
      championshipSetupTargets.womensTagTitle,
      projection.tagTitleCards.find((card) => card.slotId === "womensTagTeamChampionIds")?.label
    );

    Object.entries(championshipSetupTargets.selects).forEach(([slotId, select]) => {
      renderRosterSelectOptions({
        select,
        rosterOptions: projection.rosterOptions,
        selectedId: projection.champions[slotId],
        placeholder: "Select signed wrestler",
      });
      if (select) {
        select.disabled = projection.locked;
      }
    });

    if (championshipSetupTargets.summaryList) {
      championshipSetupTargets.summaryList.replaceChildren(
        ...projection.championCards.map((card) =>
          createSetupSummaryItem({
            label: card.label,
            value: card.displayName || "Not Selected",
            status: card.selected ? "Champion Selected" : "Required",
          })
        )
      );
    }

    if (championshipSetupTargets.complete) {
      championshipSetupTargets.complete.disabled = !projection.canComplete;
      championshipSetupTargets.complete.textContent = projection.displayLabels.actionLabel;
      championshipSetupTargets.complete.classList.toggle("enabled", projection.canComplete);
      championshipSetupTargets.complete.setAttribute(
        "aria-disabled",
        String(!projection.canComplete)
      );
    }

    if (championshipSetupTargets.continue) {
      championshipSetupTargets.continue.disabled = !projection.complete;
      championshipSetupTargets.continue.classList.toggle("enabled", projection.complete);
      championshipSetupTargets.continue.setAttribute(
        "aria-disabled",
        String(!projection.complete)
      );
    }

    updatePostDraftSetupCards();
  }

  function updateRivalrySetupSurface() {
    const projection = createRivalrySetupProjection({
      selectedBrand: getSelectedBrandDisplay(),
      miniDraftProgress: uiState.miniDraftProgress,
      setupState: uiState.localPostDraftSetup,
    });

    setText(rivalrySetupTargets.status, projection.displayLabels.statusLine);
    setText(rivalrySetupTargets.message, projection.displayLabels.statusLine);

    rivalrySetupTargets.slots.forEach((slotTarget, index) => {
      const slot = projection.rivalrySlots[index];
      renderRosterSelectOptions({
        select: slotTarget.wrestlerA,
        rosterOptions: projection.rosterOptions,
        selectedId: slot?.wrestlerAId,
        placeholder: "Select Wrestler A",
      });
      renderRosterSelectOptions({
        select: slotTarget.wrestlerB,
        rosterOptions: projection.rosterOptions,
        selectedId: slot?.wrestlerBId,
        placeholder: "Select Wrestler B",
      });
      renderTextSelectOptions({
        select: slotTarget.type,
        options: LOCAL_RIVALRY_TYPES,
        selectedValue: slot?.rivalryType,
      });
      renderTextSelectOptions({
        select: slotTarget.intensity,
        options: LOCAL_RIVALRY_INTENSITIES,
        selectedValue: slot?.intensity,
      });

      [slotTarget.wrestlerA, slotTarget.wrestlerB, slotTarget.type, slotTarget.intensity]
        .filter(Boolean)
        .forEach((select) => {
          select.disabled = projection.locked;
        });
    });

    if (rivalrySetupTargets.summaryList) {
      rivalrySetupTargets.summaryList.replaceChildren(
        ...(projection.validRivalries.length
          ? projection.validRivalries.map((rivalry, index) =>
              createSetupSummaryItem({
                label: `Rivalry ${index + 1}`,
                value: `${findRosterOptionName(projection.rosterOptions, rivalry.wrestlerAId)} vs ${findRosterOptionName(projection.rosterOptions, rivalry.wrestlerBId)}`,
                status: `${rivalry.rivalryType} / ${rivalry.intensity}`,
              })
            )
          : [
              createSetupSummaryItem({
                label: "Starter Rivalry",
                value: "Not Selected",
                status: "Required",
              }),
            ])
      );
    }

    if (rivalrySetupTargets.complete) {
      rivalrySetupTargets.complete.disabled = !projection.canComplete;
      rivalrySetupTargets.complete.textContent = projection.displayLabels.actionLabel;
      rivalrySetupTargets.complete.classList.toggle("enabled", projection.canComplete);
      rivalrySetupTargets.complete.setAttribute(
        "aria-disabled",
        String(!projection.canComplete)
      );
    }

    if (rivalrySetupTargets.continue) {
      rivalrySetupTargets.continue.disabled = !projection.complete;
      rivalrySetupTargets.continue.classList.toggle("enabled", projection.complete);
      rivalrySetupTargets.continue.setAttribute(
        "aria-disabled",
        String(!projection.complete)
      );
    }

    updatePostDraftSetupCards();
  }

  function updateWeekOneHqSurface() {
    const projection = createWeeklyHqProjection({
      selectedBrand: getSelectedBrandDisplay(),
      miniDraftProgress: uiState.miniDraftProgress,
      setupState: uiState.localPostDraftSetup,
      weeklyState: uiState.localWeeklyLoop,
    });

    setText(weekOneHqTargets.title, `Welcome to ${getBrandWelcomeLabel(projection.brandLabel)}`);
    setText(
      weekOneHqTargets.note,
      projection.unlocked
        ? `${getSelectedGmDisplay().displayName} controls ${projection.brandLabel}. Book Week ${projection.weekNumber}.`
        : projection.displayLabels.statusLine
    );
    setText(weekOneHqTargets.rosterCount, `${projection.signedRosterCount} Signed`);
    setText(weekOneHqTargets.budget, `Remaining ${formatBudgetUnitsAsMoney(projection.remainingBudgetUnits)}`);
    setText(
      weekOneHqTargets.setupStatus,
      projection.unlocked ? "Setup Complete" : "Setup Locked"
    );
    setText(
      weekOneHqTargets.local,
      `${getDifficultyLabel()} / ${getCompetingBrandsForSetup().map((brand) => brand.brandLabel).join(", ")}`
    );
    setText(weekOneHqTargets.bookingAction, projection.displayLabels.bookingLine);
    setText(
      weekOneHqTargets.statusCard,
      projection.unlocked ? "Week 1 Command Center" : "Week 1 HQ Locked"
    );
    setText(weekOneHqTargets.rosterTile, `${projection.signedRosterCount} superstars signed`);
    setText(weekOneHqTargets.budgetTile, `${formatBudgetUnitsAsMoney(projection.remainingBudgetUnits)} remaining`);
    setText(weekOneHqTargets.financeObjectiveTile, projection.displayLabels.financeObjectiveLine);
    setText(
      weekOneHqTargets.championTile,
      projection.unlocked ? "Setup Complete" : "Locked"
    );
    setText(
      weekOneHqTargets.rivalryTile,
      projection.unlocked ? "Setup Complete" : "Locked"
    );
    setText(
      weekOneHqTargets.bookingTile,
      projection.displayLabels.bookingLine
    );
    setText(weekOneHqTargets.calendarTile, projection.displayLabels.calendarLine);
    setText(weekOneHqTargets.titleDefenseTile, projection.displayLabels.titleDefenseLine);
    setText(weekOneHqTargets.rivalryPayoffTile, projection.displayLabels.rivalryPayoffLine);
    setText(weekOneHqTargets.historyTile, projection.displayLabels.showHistoryLine);
    setText(weekOneHqTargets.rosterHistoryTile, projection.displayLabels.rosterHistoryLine);
    setText(
      weekOneHqTargets.bookingState,
      projection.unlocked ? "Available" : "Locked"
    );
    setText(
      weekOneHqTargets.bookingNote,
      projection.unlocked
        ? projection.displayLabels.lastShowLine
        : projection.displayLabels.bookingNoteLine
    );

    if (weekOneHqTargets.bookingAction) {
      weekOneHqTargets.bookingAction.disabled = !projection.unlocked;
      weekOneHqTargets.bookingAction.classList.toggle("enabled", projection.unlocked);
      weekOneHqTargets.bookingAction.setAttribute(
        "aria-disabled",
        String(!projection.unlocked)
      );
    }

    if (weekOneHqTargets.champions) {
      weekOneHqTargets.champions.replaceChildren(
        ...projection.champions.map((champion) => {
          const item = document.createElement("article");
          item.className = "alert-leak important";
          const severity = document.createElement("span");
          severity.className = "severity important";
          severity.textContent = champion.label;
          const title = document.createElement("strong");
          title.textContent = champion.displayName;
          const note = document.createElement("em");
          note.textContent = "Champion Selected";
          item.append(severity, title, note);
          return item;
        })
      );
    }

    if (weekOneHqTargets.rivalries) {
      weekOneHqTargets.rivalries.replaceChildren(
        ...(projection.rivalries.length
          ? projection.rivalries.map((rivalry) => {
              const item = document.createElement("span");
              item.textContent = `${rivalry.wrestlerALabel} vs ${rivalry.wrestlerBLabel} / ${rivalry.rivalryType} / ${rivalry.intensity}`;
              return item;
            })
          : [createTextSpan("Rivalries locked")])
      );
    }

    updatePostDraftSetupCards();
  }

  function getDifficultyLabel() {
    return {
      easy: "Easy",
      normal: "Normal",
      hard: "Hard",
    }[uiState.selectedDifficulty] || "Normal";
  }

  function getBrandWelcomeLabel(brandLabel) {
    if (brandLabel === "Raw") {
      return "Monday Night Raw";
    }

    return brandLabel;
  }

  function updateWeekOneBookingSurface(statusLine) {
    const projection = createWeekOneBookingProjection({
      selectedBrand: getSelectedBrandDisplay(),
      miniDraftProgress: uiState.miniDraftProgress,
      setupState: uiState.localPostDraftSetup,
      bookingState: uiState.localWeekOneBooking,
      weeklyState: uiState.localWeeklyLoop,
    });

    setText(bookingTargets.title, `${projection.brandLabel} ${projection.displayLabels.titleLine}`);
    setText(bookingTargets.status, projection.displayLabels.statusLine);
    setText(bookingTargets.message, statusLine || projection.displayLabels.statusLine);
    setText(bookingTargets.segmentCount, projection.displayLabels.segmentCountLine);
    setText(bookingTargets.mainEventStatus, projection.displayLabels.mainEventLine);
    setText(bookingTargets.readyStatus, projection.displayLabels.readyLine);
    setText(bookingTargets.summaryBrand, projection.brandLabel);
    setText(bookingTargets.summaryRoster, `${projection.signedRosterCount} Signed`);
    setText(bookingTargets.summaryBudget, `${formatBudgetUnitsAsMoney(projection.remainingBudgetUnits)} Remaining`);
    setText(bookingTargets.projectedCost, projection.displayLabels.projectedCostLine);
    setText(bookingTargets.afterCost, projection.displayLabels.afterCostLine);
    setText(bookingTargets.budgetWarning, projection.displayLabels.budgetWarningLine);

    renderBookingRosterControls(projection);
    renderBookingSummary(projection);
    renderShowCardSegments(projection);
    updateBookingSegmentControlVisibility();

    if (bookingTargets.addSegment) {
      bookingTargets.addSegment.disabled = projection.locked;
      bookingTargets.addSegment.classList.toggle("enabled", !projection.locked);
      bookingTargets.addSegment.setAttribute("aria-disabled", String(projection.locked));
    }

    [bookingTargets.runShow, bookingTargets.runShowFooter]
      .filter(Boolean)
      .forEach((button) => {
        button.disabled = !projection.status.readyToRun;
        button.textContent = projection.displayLabels.runShowLabel;
        button.classList.toggle("enabled", projection.status.readyToRun);
        button.setAttribute("aria-disabled", String(!projection.status.readyToRun));
      });
  }

  function updateShowRecapSurface(statusLine) {
    const recap = uiState.localWeeklyLoop.lastShowRecap;

    if (!recap) {
      setText(showRecapTargets.title, "Show Recap Locked");
      setText(showRecapTargets.status, statusLine || "Run a show to unlock the recap.");
      setText(showRecapTargets.grade, "Show Grade: --");
      setText(showRecapTargets.crowd, "Crowd Read: --");
      setText(showRecapTargets.best, "Best Segment: --");
      setText(showRecapTargets.weak, "Weak Segment: --");
      setText(showRecapTargets.champion, "Champion Spotlight: --");
      setText(showRecapTargets.rivalry, "Rivalry Spotlight: --");
      setText(showRecapTargets.momentum, "Momentum: --");
      setText(showRecapTargets.fan, "Fan Response: --");
      setText(showRecapTargets.social, "Social Buzz: --");
      setText(showRecapTargets.budget, "Budget: --");
      setText(showRecapTargets.financeStarting, "Starting Show Budget: --");
      setText(showRecapTargets.financeCosts, "Show Costs: --");
      setText(showRecapTargets.financeTickets, "Ticket Revenue: --");
      setText(showRecapTargets.financeMerch, "Merch Revenue: --");
      setText(showRecapTargets.financeNet, "Net: --");
      setText(showRecapTargets.financeUpdated, "Updated Budget: --");
      setText(showRecapTargets.local, "Local Session Only / Not Saved Yet");
      showRecapTargets.segments?.replaceChildren(createTextSpan("No show has been run yet."));
      if (showRecapTargets.advance) {
        showRecapTargets.advance.disabled = true;
        showRecapTargets.advance.setAttribute("aria-disabled", "true");
      }
      return;
    }

    setText(showRecapTargets.title, `${recap.brandLabel} ${recap.weekLabel} Show Recap`);
    setText(showRecapTargets.status, statusLine || "Show complete. Review the fallout before advancing.");
    setText(showRecapTargets.grade, `Show Grade: ${recap.showGrade}`);
    setText(showRecapTargets.crowd, `Crowd Read: ${recap.crowdRead}`);
    setText(showRecapTargets.best, `Best Segment: ${recap.bestSegmentLine}`);
    setText(showRecapTargets.weak, `Weak Segment: ${recap.weakSegmentLine}`);
    setText(showRecapTargets.champion, recap.championSpotlight);
    setText(showRecapTargets.rivalry, recap.rivalrySpotlight);
    setText(showRecapTargets.momentum, recap.momentumNote);
    setText(showRecapTargets.fan, recap.fanResponseNote);
    setText(showRecapTargets.social, recap.socialBuzzNote || "Social Buzz: Early chatter");
    setText(showRecapTargets.budget, recap.budgetNote);
    setText(showRecapTargets.financeStarting, recap.financeResult?.displayLabels?.startingBudgetLine);
    setText(showRecapTargets.financeCosts, recap.financeResult?.displayLabels?.showCostLine);
    setText(showRecapTargets.financeTickets, recap.financeResult?.displayLabels?.ticketRevenueLine);
    setText(showRecapTargets.financeMerch, recap.financeResult?.displayLabels?.merchRevenueLine);
    setText(showRecapTargets.financeNet, recap.financeResult?.displayLabels?.netLine);
    setText(showRecapTargets.financeUpdated, recap.financeResult?.displayLabels?.updatedBudgetLine);
    setText(showRecapTargets.local, recap.localOnlyLine);

    if (showRecapTargets.segments) {
      showRecapTargets.segments.replaceChildren(
        ...recap.segmentResults.map((segment) => createRecapSegment(segment))
      );
    }

    if (showRecapTargets.advance) {
      showRecapTargets.advance.disabled = false;
      showRecapTargets.advance.classList.add("enabled");
      showRecapTargets.advance.setAttribute("aria-disabled", "false");
      showRecapTargets.advance.textContent = `Advance to Week ${recap.weekNumber + 1}`;
    }
  }

  function createCurrentGameplayStateModel() {
    const selectedBrand = getSelectedBrandDisplay();
    const completedPicks = Array.isArray(uiState.miniDraftProgress.completedPickSummaries)
      ? uiState.miniDraftProgress.completedPickSummaries
      : [];
    const championshipProjection = createChampionshipSetupProjection({
      selectedBrand,
      miniDraftProgress: uiState.miniDraftProgress,
      setupState: uiState.localPostDraftSetup,
    });
    const rivalryProjection = createRivalrySetupProjection({
      selectedBrand,
      miniDraftProgress: uiState.miniDraftProgress,
      setupState: uiState.localPostDraftSetup,
    });
    const brandId = selectedBrand.brandId || "raw";
    const brandName = selectedBrand.brandLabel || "Raw";
    const currentWeek = Number.isFinite(uiState.localWeeklyLoop.currentWeekNumber)
      ? uiState.localWeeklyLoop.currentWeekNumber
      : 1;
    const currentSegments = Array.isArray(uiState.localWeekOneBooking.segments)
      ? uiState.localWeekOneBooking.segments
      : [];
    const completedRecaps = Array.isArray(uiState.localWeeklyLoop.completedShowRecaps)
      ? uiState.localWeeklyLoop.completedShowRecaps
      : [];
    const currentBudgetUnits = Number.isFinite(uiState.localWeeklyLoop.currentBudgetUnits)
      ? uiState.localWeeklyLoop.currentBudgetUnits
      : uiState.miniDraftProgress.remainingDraftBudget;

    return createPlayableNewGMModeGameplayStateModel({
      gameId: "playable-new-gm-mode-local-game",
      gameLabel: `${brandName} Local GM Session`,
      selectedBrandId: brandId,
      selectedBrandName: brandName,
      currentWeek,
      budget: {
        startingBudget: uiState.miniDraftProgress.startingDraftBudget,
        spentBudget: uiState.miniDraftProgress.spentDraftBudget,
        remainingBudget: currentBudgetUnits,
        bookingReserveTarget: uiState.miniDraftProgress.bookingReserveBudget,
      },
      signedRoster: completedPicks.map((pick, index) => ({
        wrestlerId: pick.candidateId || `signed-${index + 1}`,
        displayName: pick.candidateName || `Signed Superstar ${index + 1}`,
        signedBrandId: brandId,
        signedBrandName: brandName,
        draftedFrom: pick.sourceRosterPool || "Source Pool",
        sourcePool: pick.sourceRosterPool || "Source Pool",
        signingCost: pick.signingCost,
        signingTier: pick.signingTier,
      })),
      champions: championshipProjection.championCards.map((card) => ({
        titleSlotId: card.slotId,
        titleName: card.label,
        championWrestlerIds: card.candidateId ? [card.candidateId] : [],
      })),
      rivalries: rivalryProjection.validRivalries.map((rivalry, index) => ({
        rivalryId: `starter-rivalry-${index + 1}`,
        wrestlerAId: rivalry.wrestlerAId,
        wrestlerBId: rivalry.wrestlerBId,
        rivalryType: rivalry.rivalryType,
        intensity: rivalry.intensity,
        heatLabel: "Starter Rivalry",
      })),
      weeklyShowCards: [
        ...completedRecaps.map((recap) => ({
          weekNumber: recap.weekNumber,
          cardId: `week-${recap.weekNumber}-completed-card`,
          segments: recap.segmentResults,
        })),
        ...(currentSegments.length > 0
          ? [{
              weekNumber: currentWeek,
              cardId: `week-${currentWeek}-current-card`,
              segments: currentSegments,
            }]
          : []),
      ],
      showResults: completedRecaps.map((recap) => ({
        weekNumber: recap.weekNumber,
        resultId: recap.recapId,
        showGrade: recap.showGrade,
        bestSegmentLabel: recap.bestSegmentLine,
        crowdReadLabel: recap.crowdRead,
        weakSegmentLabel: recap.weakSegmentLine,
        championSpotlightLabel: recap.championSpotlight,
        rivalrySpotlightLabel: recap.rivalrySpotlight,
        momentumLabel: recap.momentumNote,
        fanResponseLabel: recap.fanResponseNote,
        socialBuzzLabel: recap.socialBuzzNote,
        budgetLabel: recap.budgetNote,
        financeResult: recap.financeResult,
        cardReadinessLabel: recap.cardReadinessLine,
        segmentResults: recap.segmentResults,
      })),
      superstarCurrentState: completedPicks.map((pick, index) => ({
        wrestlerId: pick.candidateId || `signed-${index + 1}`,
        momentum: "Local Preview",
        morale: "Steady",
        fatigue: "Fresh",
        injuryRisk: "Low",
        popularity: "Unsigned Baseline",
      })),
      championTitleState: championshipProjection.championCards.map((card) => ({
        titleSlotId: card.slotId,
        titleName: card.label,
        championWrestlerIds: card.candidateId ? [card.candidateId] : [],
        titleStatus: card.candidateId ? "Champion Selected" : "Not Selected",
      })),
      financeFanSummaries: completedRecaps.map((recap) => ({
        weekNumber: recap.weekNumber,
        financeLabel: recap.budgetNote,
        financeObjectiveLabel: recap.financeResult?.financeObjectiveLine,
        fanResponseLabel: recap.fanResponseNote,
      })),
      weekHistory: completedRecaps.map((recap) => ({
        weekNumber: recap.weekNumber,
        summaryLabel: `${recap.weekLabel}: ${recap.showGrade}`,
      })),
    });
  }

  async function saveCurrentGame() {
    updateSaveStatus("Saving current session...");

    try {
      const response = await fetch("/api/playable-new-gm-mode/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameplayStateModel: createCurrentGameplayStateModel(),
        }),
      });
      const result = await response.json();
      const statusLine = result.ok
        ? `Saved ${result.selectedBrandName} Week ${result.currentWeek}`
        : "Save failed";

      uiState.lastSaveStatusLine = statusLine;
      updateSaveStatus(statusLine);
    } catch {
      uiState.lastSaveStatusLine = "Save unavailable";
      updateSaveStatus(uiState.lastSaveStatusLine);
    }
  }

  async function continueLastSave() {
    updateSaveStatus("Checking local save slot...");

    try {
      const response = await fetch("/api/playable-new-gm-mode/save");
      const result = await response.json();
      const statusLine = response.ok && result.ok
        ? `Loaded ${result.selectedBrandName} Week ${result.currentWeek}`
        : "No local save found";

      uiState.lastSaveStatusLine = statusLine;
      updateSaveStatus(statusLine);
      if (response.ok && result.ok && result.gameplayStateModel) {
        applyContinuedGameplayStateModel(result.gameplayStateModel);
      }
    } catch {
      uiState.lastSaveStatusLine = "Continue unavailable";
      updateSaveStatus(uiState.lastSaveStatusLine);
    }
  }

  function updateSaveStatus(statusLine) {
    saveStatusTargets.forEach((target) => {
      target.textContent = statusLine;
    });
  }

  function applyContinuedGameplayStateModel(gameplayStateModel) {
    const selectedBrand = readGameplayRecord(gameplayStateModel?.selectedBrand);
    const brandId = normalizePlayableBrandId(selectedBrand?.brandId);

    if (brandId) {
      setBrand(brandId);
    }

    uiState.miniDraftProgress =
      createMiniDraftProgressFromGameplayStateModel(gameplayStateModel);
    uiState.localPostDraftSetup =
      createPostDraftSetupFromGameplayStateModel(gameplayStateModel);
    uiState.localWeeklyLoop =
      createWeeklyLoopStateFromGameplayStateModel(gameplayStateModel);
    uiState.localWeekOneBooking =
      createBookingStateFromGameplayStateModel(gameplayStateModel);

    updateDraftedCandidateRows();
    updateDraftBudgetPanel();
    updateMakePickControl();
    updatePostDraftRosterHub();
    updateChampionshipSetupSurface();
    updateRivalrySetupSurface();
    updateWeekOneHqSurface();
    updateWeekOneBookingSurface(uiState.lastSaveStatusLine);
    updateShowRecapSurface(uiState.lastSaveStatusLine);
    showSection("brand-dashboard");
  }

  function createMiniDraftProgressFromGameplayStateModel(gameplayStateModel) {
    const selectedBrand = readGameplayRecord(gameplayStateModel?.selectedBrand);
    const budget = readGameplayRecord(gameplayStateModel?.budget);
    const signedRoster = Array.isArray(gameplayStateModel?.signedRoster)
      ? gameplayStateModel.signedRoster
      : [];
    const brandId = normalizePlayableBrandId(selectedBrand?.brandId) || "raw";
    const brandLabel = readGameplayString(selectedBrand?.brandName) || brandLabels[brandId].label;
    const startingDraftBudget = readGameplayNumber(
      budget?.startingBudget,
      NEW_GM_MODE_DRAFT_FINANCE_STARTING_BUDGET_PLACEHOLDER
    );
    const fallbackSpentBudget = signedRoster.reduce(
      (total, talent) => total + readGameplayNumber(talent?.signingCost, 0),
      0
    );
    const budgetSpent = readGameplayNumber(budget?.spentBudget, fallbackSpentBudget);
    const remainingDraftBudget = readGameplayNumber(
      budget?.remainingBudget,
      Math.max(0, startingDraftBudget - budgetSpent)
    );
    const bookingReserveBudget = readGameplayNumber(
      budget?.bookingReserveTarget,
      NEW_GM_MODE_DRAFT_FINANCE_BOOKING_RESERVE_PLACEHOLDER
    );
    const completedPickSummaries = signedRoster.map((talent, index) => {
      const pickNumber = index + 1;
      const candidateId = readGameplayString(talent?.wrestlerId) || `loaded-${pickNumber}`;
      const candidateName = readGameplayString(talent?.displayName) || `Signed Superstar ${pickNumber}`;
      const signingCost = readGameplayNumber(talent?.signingCost, 0);
      const sourceRosterPool =
        readGameplayString(talent?.draftedFrom) ||
        readGameplayString(talent?.sourcePool) ||
        "Source Pool";

      return Object.freeze({
        summaryKind: "local-mini-draft-pick-summary",
        version: "0.1",
        localOnly: true,
        inMemoryOnly: false,
        persisted: true,
        completedInMemory: true,
        candidateId,
        candidateName,
        brandLabel,
        gmName: "Loaded GM",
        pickLabel: `Pick ${pickNumber}`,
        pickNumber,
        signingTier: readGameplayString(talent?.signingTier) || "Signed Talent",
        signingCost,
        sourceRosterPool,
        divisionCategory: "Division TBD",
        pickSource: "manual",
        budgetBeforeSigning: 0,
        budgetAfterSigning: 0,
        bookingReserveAfterSigning: remainingDraftBudget >= bookingReserveBudget,
        reserveWarningLine: remainingDraftBudget >= bookingReserveBudget
          ? "Booking reserve protected"
          : "Booking reserve dipped",
        affordabilityStatus: "loaded-save",
        displayLabel: `Pick ${pickNumber}: ${candidateName} (${brandLabel}, Cost ${signingCost})`,
        displayStatusLine: "Loaded from save",
      });
    });
    const signedTalentCount = completedPickSummaries.length;
    const minimumRosterTarget =
      NEW_GM_MODE_DRAFT_FINANCE_MINIMUM_ROSTER_TARGET_PLACEHOLDER;
    const minimumRosterViable = signedTalentCount >= minimumRosterTarget;
    const bookingReserveProtected = remainingDraftBudget >= bookingReserveBudget;

    return Object.freeze({
      ...createInitialMiniDraftProgress({
        selectedBrand: { brandId, brandLabel },
      }),
      inMemoryOnly: false,
      persisted: true,
      startingDraftBudget,
      remainingDraftBudget,
      budgetSpent,
      spentDraftBudget: budgetSpent,
      signedTalentCount,
      minimumViableRosterCount: minimumRosterTarget,
      minimumRosterTarget,
      bookingReserveBudget,
      minimumRosterViable,
      bookingReserveProtected,
      draftCanContinue: false,
      localDraftFinished: true,
      currentPickIndex: signedTalentCount,
      selectedBrandReference: Object.freeze({
        hasBrand: true,
        brandId,
        brandLabel,
        localOnly: false,
      }),
      currentDraftSlot: Object.freeze({
        roundNumber: 1,
        pickNumber: signedTalentCount + 1,
        roundLabel: "Round 1",
        pickLabel: `Pick ${signedTalentCount + 1}`,
        placeholderOnly: true,
      }),
      completedPickSummaries: Object.freeze(completedPickSummaries),
      draftedCandidateIds: Object.freeze(
        completedPickSummaries.map((summary) => summary.candidateId)
      ),
      miniDraftComplete: true,
      displayLabels: Object.freeze({
        progressLine: `Save loaded: ${signedTalentCount} signed`,
        statusLine: "Save Loaded",
        budgetLine: `Budget remaining: ${remainingDraftBudget}`,
        viabilityLine: minimumRosterViable
          ? `Minimum roster viable: ${signedTalentCount} of ${minimumRosterTarget}`
          : `Minimum roster not viable: ${signedTalentCount} of ${minimumRosterTarget}`,
        reserveLine: bookingReserveProtected
          ? "Booking reserve protected"
          : "Booking reserve dipped",
        noteLine: "Loaded from local save.",
      }),
    });
  }

  function createPostDraftSetupFromGameplayStateModel(gameplayStateModel) {
    const champions = Array.isArray(gameplayStateModel?.champions)
      ? gameplayStateModel.champions
      : [];
    const rivalries = Array.isArray(gameplayStateModel?.rivalries)
      ? gameplayStateModel.rivalries
      : [];
    const championState = {
      mensMainChampionId: "",
      mensMidcardChampionId: "",
      womensMainChampionId: "",
      womensMidcardChampionId: "",
    };

    champions.forEach((champion) => {
      const slotId = readGameplayString(champion?.titleSlotId);
      const championIds = Array.isArray(champion?.championWrestlerIds)
        ? champion.championWrestlerIds
        : [];

      if (slotId && Object.hasOwn(championState, slotId)) {
        championState[slotId] = readGameplayString(championIds[0]) || "";
      }
    });

    const rivalrySlots = rivalries.slice(0, 3).map((rivalry) =>
      Object.freeze({
        wrestlerAId: readGameplayString(rivalry?.wrestlerAId) || "",
        wrestlerBId: readGameplayString(rivalry?.wrestlerBId) || "",
        rivalryType: readGameplayString(rivalry?.rivalryType) || "Grudge",
        intensity: readGameplayString(rivalry?.intensity) || "Medium",
      })
    );

    while (rivalrySlots.length < 3) {
      rivalrySlots.push(Object.freeze({
        wrestlerAId: "",
        wrestlerBId: "",
        rivalryType: "Grudge",
        intensity: "Medium",
      }));
    }

    return Object.freeze({
      championshipSetupComplete: Object.values(championState).every(Boolean),
      champions: Object.freeze(championState),
      rivalrySetupComplete: rivalries.length > 0,
      rivalries: Object.freeze(rivalrySlots),
    });
  }

  function createWeeklyLoopStateFromGameplayStateModel(gameplayStateModel) {
    const currentWeekNumber = Math.max(
      1,
      Math.floor(readGameplayNumber(gameplayStateModel?.currentWeek, 1))
    );
    const showResults = Array.isArray(gameplayStateModel?.showResults)
      ? gameplayStateModel.showResults
      : [];
    const completedShowRecaps = showResults.map((showResult) => {
      const weekNumber = Math.max(
        1,
        Math.floor(readGameplayNumber(showResult?.weekNumber, 1))
      );
      const showGrade = readGameplayString(showResult?.showGrade) || "C";

      return Object.freeze({
        recapId: readGameplayString(showResult?.resultId) || `loaded-week-${weekNumber}-recap`,
        weekNumber,
        weekLabel: `Week ${weekNumber}`,
        brandLabel: readGameplayString(gameplayStateModel?.selectedBrand?.brandName) || getBrandLabel(),
        showGrade,
        crowdRead: readGameplayString(showResult?.crowdReadLabel) || "Loaded",
        bestSegmentLine: readGameplayString(showResult?.bestSegmentLabel) || "Saved show result",
        weakSegmentLine: readGameplayString(showResult?.weakSegmentLabel) || "Saved show result",
        championSpotlight:
          readGameplayString(showResult?.championSpotlightLabel) ||
          "Champion Spotlight: Saved show loaded",
        rivalrySpotlight:
          readGameplayString(showResult?.rivalrySpotlightLabel) ||
          "Rivalry Spotlight: Saved show loaded",
        momentumNote: readGameplayString(showResult?.momentumLabel) || "Momentum: Saved",
        fanResponseNote: readGameplayString(showResult?.fanResponseLabel) || "Fan Response: Saved",
        socialBuzzNote:
          readGameplayString(showResult?.socialBuzzLabel) || "Social Buzz: Saved",
        budgetNote: readGameplayString(showResult?.budgetLabel) || "Budget: Saved",
        financeResult: readGameplayRecord(showResult?.financeResult),
        localOnlyLine: "Loaded from local save",
        cardReadinessLine:
          readGameplayString(showResult?.cardReadinessLabel) || "Card Status: Loaded",
        simulationBacked: true,
        segmentResults: Object.freeze(
          Array.isArray(showResult?.segmentResults)
            ? showResult.segmentResults.map(createLoadedRecapSegment)
            : []
        ),
      });
    });
    const lastShowRecap = completedShowRecaps
      .slice()
      .sort((a, b) => b.weekNumber - a.weekNumber)[0];
    const budget = readGameplayRecord(gameplayStateModel?.budget);
    const currentBudgetUnits = readGameplayNumber(
      budget?.remainingBudget,
      uiState.miniDraftProgress.remainingDraftBudget
    );

    return Object.freeze({
      currentWeekNumber,
      currentBudgetUnits,
      lastShowRecap,
      completedShowRecaps: Object.freeze(completedShowRecaps),
      rosterHistorySnapshots: Object.freeze([]),
    });
  }

  function createBookingStateFromGameplayStateModel(gameplayStateModel) {
    const currentWeekNumber = Math.max(
      1,
      Math.floor(readGameplayNumber(gameplayStateModel?.currentWeek, 1))
    );
    const showResults = Array.isArray(gameplayStateModel?.showResults)
      ? gameplayStateModel.showResults
      : [];
    const hasCompletedCurrentWeek = showResults.some(
      (showResult) => readGameplayNumber(showResult?.weekNumber, 0) === currentWeekNumber
    );

    if (hasCompletedCurrentWeek) {
      return createInitialLocalWeekOneBookingState();
    }

    const weeklyShowCards = Array.isArray(gameplayStateModel?.weeklyShowCards)
      ? gameplayStateModel.weeklyShowCards
      : [];
    const currentCard = weeklyShowCards.find(
      (card) => readGameplayNumber(card?.weekNumber, 0) === currentWeekNumber
    );
    const segments = Array.isArray(currentCard?.segments)
      ? currentCard.segments
      : [];
    const restoredSegments = segments.map((segment, index) =>
      Object.freeze({
        segmentId: readGameplayString(segment?.segmentId) || `loaded-segment-${index + 1}`,
        segmentType: readGameplayString(segment?.segmentType) || "singles-match",
        wrestlerAId: readGameplayString(segment?.wrestlerAId) || "",
        wrestlerBId: readGameplayString(segment?.wrestlerBId) || "",
        featuredWrestlerId: readGameplayString(segment?.featuredWrestlerId) || "",
      })
    );

    return Object.freeze({
      nextSegmentIdNumber: restoredSegments.length + 1,
      segments: Object.freeze(restoredSegments),
    });
  }

  function createLoadedRecapSegment(segment, index) {
    return Object.freeze({
      segmentNumber: Math.max(
        1,
        Math.floor(readGameplayNumber(segment?.segmentNumber, index + 1))
      ),
      segmentType: readGameplayString(segment?.segmentType) || "singles-match",
      typeLabel: readGameplayString(segment?.typeLabel) || "Singles Match",
      talentLine: readGameplayString(segment?.talentLine) || "Signed Talent",
      mainEvent: Boolean(segment?.mainEvent),
      championInvolved: Boolean(segment?.championInvolved),
      rivalryInvolved: Boolean(segment?.rivalryInvolved),
      qualityBand: readGameplayString(segment?.qualityBand) || "Solid",
      resultLine: readGameplayString(segment?.resultLine) || "Solid segment.",
      matchRatingLabel:
        readGameplayString(segment?.matchRatingLabel) || "Match Rating: Solid",
      crowdResponseLine:
        readGameplayString(segment?.crowdResponseLine) || "Crowd Response: Solid",
      momentumSignalLine:
        readGameplayString(segment?.momentumSignalLine) || "Momentum Signal: Steady",
      businessImpactLine:
        readGameplayString(segment?.businessImpactLine) ||
        "Business: Steady quarter-hour",
      participantNames: Object.freeze(
        Array.isArray(segment?.participantNames)
          ? segment.participantNames.map((name) => readGameplayString(name) || "Signed Talent")
          : []
      ),
    });
  }

  function readGameplayRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value)
      ? value
      : undefined;
  }

  function readGameplayString(value) {
    return typeof value === "string" && value.trim().length > 0
      ? value.trim()
      : undefined;
  }

  function readGameplayNumber(value, fallback) {
    return typeof value === "number" && Number.isFinite(value)
      ? value
      : fallback;
  }

  function normalizePlayableBrandId(value) {
    const brandId = readGameplayString(value)?.toLowerCase();

    if (brandId === "smack-down") {
      return "smackdown";
    }

    return brandId && brandLabels[brandId] ? brandId : undefined;
  }

  function renderBookingRosterControls(projection) {
    renderRosterSelectOptions({
      select: bookingTargets.wrestlerA,
      rosterOptions: projection.rosterOptions,
      selectedId: bookingTargets.wrestlerA?.value,
      placeholder: "Choose Signed Talent",
    });
    renderRosterSelectOptions({
      select: bookingTargets.wrestlerB,
      rosterOptions: projection.rosterOptions,
      selectedId: bookingTargets.wrestlerB?.value,
      placeholder: "Choose Signed Talent",
    });
    renderRosterSelectOptions({
      select: bookingTargets.promoWrestler,
      rosterOptions: projection.rosterOptions,
      selectedId: bookingTargets.promoWrestler?.value,
      placeholder: "Choose Signed Talent",
    });
    renderTextSelectOptions({
      select: bookingTargets.segmentType,
      options: LOCAL_WEEK_ONE_SEGMENT_TYPES.map((type) => type.segmentType),
      selectedValue: bookingTargets.segmentType?.value,
    });

    Array.from(
      [
        bookingTargets.segmentType,
        bookingTargets.wrestlerA,
        bookingTargets.wrestlerB,
        bookingTargets.promoWrestler,
      ].filter(Boolean)
    ).forEach((select) => {
      select.disabled = projection.locked;
    });

    if (bookingTargets.segmentType) {
      Array.from(bookingTargets.segmentType.options).forEach((option) => {
        const segmentType = LOCAL_WEEK_ONE_SEGMENT_TYPES.find(
          (type) => type.segmentType === option.value
        );
        if (segmentType) {
          option.textContent = segmentType.label;
        }
      });
    }
  }

  function renderBookingSummary(projection) {
    if (bookingTargets.summaryChampions) {
      bookingTargets.summaryChampions.replaceChildren(
        ...projection.champions.map((champion) =>
          createBookingMiniLine(champion.label, champion.displayName)
        )
      );
    }

    if (bookingTargets.summaryRivalries) {
      bookingTargets.summaryRivalries.replaceChildren(
        ...(projection.rivalries.length
          ? projection.rivalries.map((rivalry) =>
              createBookingMiniLine(
                `${rivalry.rivalryType} / ${rivalry.intensity}`,
                `${rivalry.wrestlerALabel} vs ${rivalry.wrestlerBLabel}`
              )
            )
          : [createTextSpan("Rivalries locked")])
      );
    }
  }

  function renderShowCardSegments(projection) {
    if (!bookingTargets.showCardList) {
      return;
    }

    bookingTargets.showCardList.replaceChildren(
      ...(projection.segments.length
        ? projection.segments.map((segment) => createShowCardSegment(segment))
        : [createEmptyShowCardSegment()])
    );
  }

  function createShowCardSegment(segment) {
    const item = document.createElement("article");
    item.className = segment.mainEvent
      ? "show-card-segment main-event"
      : "show-card-segment";

    const number = document.createElement("span");
    number.textContent = String(segment.segmentNumber).padStart(2, "0");

    const content = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = segment.typeLabel;
    const talent = document.createElement("em");
    talent.textContent = segment.costLine
      ? `${segment.talentLine} / ${segment.costLine}`
      : segment.talentLine;
    content.append(title, talent);

    const badge = document.createElement("small");
    badge.textContent = segment.mainEvent ? "Main Event" : "Segment";

    const remove = document.createElement("button");
    remove.className = "ghost-button show-card-remove";
    remove.type = "button";
    remove.dataset.removeBookingSegment = segment.segmentId;
    remove.textContent = "Remove";

    item.append(number, content, badge, remove);
    return item;
  }

  function createEmptyShowCardSegment() {
    const item = document.createElement("article");
    item.className = "show-card-segment empty";
    const number = document.createElement("span");
    number.textContent = "01";
    const title = document.createElement("strong");
    title.textContent = "No segments booked";
    const note = document.createElement("em");
    note.textContent = "Add a match, promo, and main event from signed talent.";
    item.append(number, title, note);
    return item;
  }

  function createRecapSegment(segment) {
    const item = document.createElement("article");
    item.className = segment.mainEvent
      ? "show-card-segment main-event"
      : "show-card-segment";

    const number = document.createElement("span");
    number.textContent = String(segment.segmentNumber).padStart(2, "0");
    const content = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = segment.typeLabel;
    const talent = document.createElement("em");
    talent.textContent = segment.talentLine;
    const result = document.createElement("small");
    result.textContent = segment.resultLine;
    const matchRating = document.createElement("small");
    matchRating.textContent = segment.matchRatingLabel || segment.qualityBand;
    const crowdResponse = document.createElement("small");
    crowdResponse.textContent = segment.crowdResponseLine || "Crowd Response: Solid";
    const momentumSignal = document.createElement("small");
    momentumSignal.textContent = segment.momentumSignalLine || "Momentum Signal: Steady";
    const businessImpact = document.createElement("small");
    businessImpact.textContent = segment.businessImpactLine || "Business: Steady quarter-hour";
    content.append(
      title,
      talent,
      result,
      matchRating,
      crowdResponse,
      momentumSignal,
      businessImpact
    );
    const badge = document.createElement("small");
    badge.textContent = segment.mainEvent ? "Main Event" : segment.qualityBand;
    item.append(number, content, badge);
    return item;
  }

  function createBookingMiniLine(label, value) {
    const item = document.createElement("span");
    item.textContent = `${label}: ${value}`;
    return item;
  }

  function updateBookingSegmentControlVisibility() {
    const selectedType = bookingTargets.segmentType?.value || "singles-match";
    const isPromo = LOCAL_WEEK_ONE_SEGMENT_TYPES.find(
      (type) => type.segmentType === selectedType
    )?.inputKind === "promo";

    bookingTargets.matchFields.forEach((field) => {
      field.hidden = isPromo;
    });
    bookingTargets.promoFields.forEach((field) => {
      field.hidden = !isPromo;
    });
  }

  function renderRosterSelectOptions({
    select,
    rosterOptions,
    selectedId,
    placeholder,
  }) {
    if (!select) {
      return;
    }

    const placeholderOption = document.createElement("option");
    placeholderOption.value = "";
    placeholderOption.textContent = placeholder;
    select.replaceChildren(
      placeholderOption,
      ...rosterOptions.map((option) => {
        const node = document.createElement("option");
        node.value = option.candidateId;
        node.textContent = `${option.displayName} / ${option.signedToBrandLine} / ${option.draftedFromLine}`;
        return node;
      })
    );
    select.value = selectedId || "";
  }

  function renderTextSelectOptions({ select, options, selectedValue }) {
    if (!select) {
      return;
    }

    select.replaceChildren(
      ...options.map((option) => {
        const node = document.createElement("option");
        node.value = option;
        node.textContent = option;
        return node;
      })
    );
    select.value = selectedValue || options[0];
  }

  function createSetupSummaryItem({ label, value, status }) {
    const item = document.createElement("article");
    item.className = "setup-summary-item";

    const eyebrow = document.createElement("span");
    eyebrow.textContent = label;

    const title = document.createElement("strong");
    title.textContent = value;

    const note = document.createElement("em");
    note.textContent = status;

    item.append(eyebrow, title, note);
    return item;
  }

  function findRosterOptionName(rosterOptions, candidateId) {
    return (
      rosterOptions.find((option) => option.candidateId === candidateId)
        ?.displayName || "Signed Wrestler"
    );
  }

  function createTextSpan(value) {
    const span = document.createElement("span");
    span.textContent = value;
    return span;
  }

  function createPostDraftRosterCard(talent) {
    const card = document.createElement("article");
    card.className = "post-draft-roster-card";

    const portrait = document.createElement("span");
    portrait.className = "mini-portrait roster-card-portrait";
    portrait.textContent = createInitials(talent.displayName);

    const content = document.createElement("div");
    content.className = "roster-card-copy";

    const eyebrow = document.createElement("p");
    eyebrow.className = "kicker";
    eyebrow.textContent = `${talent.signedToBrandLine} / ${talent.pickSource}`;

    const title = document.createElement("h3");
    title.textContent = talent.displayName;

    const meta = document.createElement("div");
    meta.className = "roster-card-meta";

    [
      `Pick ${talent.pickNumber}`,
      talent.signingTier,
      `Cost ${formatBudgetUnitsAsMoney(talent.signingCost)}`,
      talent.divisionCategory,
      talent.draftedFromLine,
      talent.signedStatus,
    ].forEach((label) => {
      const chip = document.createElement("span");
      chip.textContent = label;
      meta.append(chip);
    });

    content.append(eyebrow, title, meta);
    card.append(portrait, content);
    return card;
  }

  function updateMiniDraftPickBadge() {
    if (miniDraftPickBadge) {
      miniDraftPickBadge.textContent = uiState.miniDraftProgress.localDraftFinished
        ? "Draft Finished Locally"
        : uiState.miniDraftProgress.displayLabels.progressLine;
    }
  }

  function updateDraftedCandidateRows() {
    talentRows.forEach((row) => {
      const drafted = uiState.miniDraftProgress.draftedCandidateIds.includes(row.dataset.candidateId);
      row.classList.toggle("drafted", drafted);
      row.classList.toggle("unavailable", drafted || row.dataset.availability === "Unavailable");
      row.disabled = drafted;
      if (drafted) {
        row.setAttribute("aria-disabled", "true");
      } else {
        row.removeAttribute("aria-disabled");
      }
      const meta = row.querySelector("small");
      if (meta && drafted) {
        meta.textContent = `${row.dataset.draftRank} | Drafted | ${createDraftedStatusLine(row.dataset.candidateId)}`;
      }
    });
    updateFinanceCandidateRows();
  }

  function updateMakePickControl() {
    if (!makePickControl) {
      return;
    }

    const readiness = createMakePickReadiness({
      selectedCandidate: getSelectedCandidateDisplay(),
      selectedBrand: getSelectedBrandDisplay(),
      draftSlot: uiState.miniDraftProgress.currentDraftSlot,
      miniDraftProgress: uiState.miniDraftProgress,
    });

    makePickControl.disabled = !readiness.canMakePick;
    makePickControl.textContent = readiness.displayLabels.buttonLabel;
    makePickControl.setAttribute("aria-disabled", String(!readiness.canMakePick));
    makePickControl.classList.toggle("enabled", readiness.canMakePick);
    setText(intentPreviewTargets.status, readiness.displayLabels.statusLine);
    setText(intentPreviewTargets.note, readiness.displayLabels.noteLine);
    setText(talentDetail.previewStatus, readiness.displayLabels.statusLine);
    updateMiniDraftPickBadge();
    updateDraftBudgetPanel();
    updateFinanceCandidateRows();
    updatePostDraftRosterHub();
    updateAutoFillControl();
    updateFinishDraftControl();
    updateRecapControl();
  }

  function updateAutoFillControl() {
    if (!autoFillControl) {
      return;
    }

    const readiness = createAutoFillMinimumRosterReadiness({
      selectedBrand: getSelectedBrandDisplay(),
      miniDraftProgress: uiState.miniDraftProgress,
    });

    autoFillControl.disabled = !readiness.canAutoFill;
    autoFillControl.textContent = readiness.displayLabels.buttonLabel;
    autoFillControl.setAttribute("aria-disabled", String(!readiness.canAutoFill));
    autoFillControl.classList.toggle("enabled", readiness.canAutoFill);
  }

  function updateFinishDraftControl() {
    if (!finishDraftControl) {
      return;
    }

    const readiness = createFinishDraftReadiness({
      selectedBrand: getSelectedBrandDisplay(),
      miniDraftProgress: uiState.miniDraftProgress,
    });

    finishDraftControl.disabled = !readiness.canFinishDraft;
    finishDraftControl.textContent = readiness.displayLabels.buttonLabel;
    finishDraftControl.setAttribute("aria-disabled", String(!readiness.canFinishDraft));
    finishDraftControl.classList.toggle("enabled", readiness.canFinishDraft);
  }

  function updateRecapControl() {
    if (!recapControl) {
      return;
    }

    recapControl.disabled = !uiState.miniDraftProgress.localDraftFinished;
    recapControl.textContent = uiState.miniDraftProgress.localDraftFinished
      ? "Open Draft Recap"
      : "Draft Recap Locked";
    recapControl.setAttribute(
      "aria-disabled",
      String(!uiState.miniDraftProgress.localDraftFinished)
    );
    recapControl.classList.toggle("enabled", uiState.miniDraftProgress.localDraftFinished);
  }

  function setText(target, value) {
    if (target) {
      target.textContent = value;
    }
  }

  function formatCandidateAffordabilityLine(candidateProjection) {
    if (!candidateProjection) {
      return undefined;
    }

    if (candidateProjection.affordabilityStatus === "not-affordable") {
      return `Not enough draft budget. Need ${formatBudgetUnitsAsMoney(
        candidateProjection.projectedSigningCost
      )}, you have ${formatBudgetUnitsAsMoney(
        uiState.miniDraftProgress.remainingDraftBudget
      )}.`;
    }

    if (candidateProjection.affordabilityStatus === "already-drafted-signed") {
      return "Already drafted";
    }

    if (candidateProjection.affordabilityStatus === "expensive-but-affordable") {
      return "Expensive but affordable";
    }

    return "Affordable";
  }

  function formatCandidateReserveLine(candidateProjection) {
    if (!candidateProjection) {
      return undefined;
    }

    const reserveBudget =
      uiState.miniDraftProgress.bookingReserveBudget ??
      NEW_GM_MODE_DRAFT_FINANCE_BOOKING_RESERVE_PLACEHOLDER;

    if (candidateProjection.budgetPreviewAfterSigning < reserveBudget) {
      return "This signing dips into your booking reserve.";
    }

    return "Booking reserve protected after signing";
  }

  function formatRowAffordability(candidateProjection) {
    if (candidateProjection.affordabilityStatus === "not-affordable") {
      return "Not Enough Budget";
    }

    if (candidateProjection.affordabilityStatus === "expensive-but-affordable") {
      return "Affordable";
    }

    if (candidateProjection.affordabilityStatus === "already-drafted-signed") {
      return "Already Drafted";
    }

    return "Affordable";
  }

  function formatDraftBudgetSummaryLine(summary) {
    if (!summary) {
      return "Budget: Not available";
    }

    return [
      `Remaining ${formatBudgetUnitsAsMoney(summary.remainingDraftBudget)}`,
      `Spent ${formatBudgetUnitsAsMoney(summary.budgetSpent)}`,
      `Reserve ${formatBudgetUnitsAsMoney(summary.bookingReserveBudget)}`,
    ].join(" / ");
  }

  function setMeter(target, value) {
    if (target) {
      target.style.setProperty("--rating", value || "0");
    }
  }

  function setSelectedCandidate(row) {
    if (row.disabled) {
      return;
    }

    uiState.selectedCandidateId = row.dataset.candidateId;
    uiState.selectedDraftIntentPreview = createDraftSelectionIntentPresentationPreview(row);
    const preview = uiState.selectedDraftIntentPreview;
    const isUnavailable = getCandidateDisplayFromRow(row).availability !== "Available";

    talentRows.forEach((item) => {
      const isSelected = item === row;
      item.classList.toggle("selected", isSelected);
      item.setAttribute("aria-pressed", String(isSelected));
    });

    if (talentDetail.initials) {
      talentDetail.initials.textContent = row.dataset.talentName
        .split(" ")
        .map((part) => part.charAt(0))
        .join("")
        .slice(0, 2);
    }
    setText(talentDetail.name, row.dataset.talentName);
    setText(talentDetail.role, row.dataset.talentRole);
    setText(talentDetail.availability, row.dataset.availability || "Available");
    talentDetail.availability?.classList.toggle("blocked", isUnavailable);
    setText(talentDetail.read, row.dataset.talentRead);
    setText(talentDetail.fit, row.dataset.talentFit);
    setText(talentDetail.previewStatus, preview.displayLabels.statusLine);
    setText(talentDetail.starPower, row.dataset.starPower || "--");
    setText(talentDetail.ringWork, row.dataset.ringWork || "--");
    setText(talentDetail.promo, row.dataset.promo || "--");
    setText(talentDetail.durability, row.dataset.durability || "--");
    setText(talentDetail.risk, row.dataset.risk || "Unknown");
    setText(talentDetail.confidence, row.dataset.confidence || "Unknown");
    setMeter(talentDetail.starMeter, row.dataset.starPowerValue);
    setMeter(talentDetail.ringMeter, row.dataset.ringWorkValue);
    setMeter(talentDetail.promoMeter, row.dataset.promoValue);
    setMeter(talentDetail.durabilityMeter, row.dataset.durabilityValue);
    setMeter(talentDetail.riskMeter, row.dataset.riskValue);
    setMeter(talentDetail.confidenceMeter, row.dataset.confidenceValue);
    talentDetail.panel?.classList.remove("empty-selection");

    updateIntentPreview(uiState.selectedDraftIntentPreview);
    updateFinancePreviewForCandidate(getCandidateDisplayFromRow(row));
    updateMakePickControl();
  }

  function clearSelectedCandidateAfterPick(result) {
    uiState.selectedCandidateId = undefined;
    uiState.selectedDraftIntentPreview = createDraftSelectionIntentPreview({
      selectedBrand: getSelectedBrandDisplay(),
      draftSlot: result.miniDraftProgress.currentDraftSlot,
    });

    talentRows.forEach((item) => {
      item.classList.remove("selected");
      item.setAttribute("aria-pressed", "false");
    });

    setText(talentDetail.initials, "--");
    setText(talentDetail.name, "Select next prospect");
    setText(talentDetail.role, "Finance-limited draft in progress");
    setText(talentDetail.availability, result.miniDraftProgress.displayLabels.progressLine);
    talentDetail.availability?.classList.remove("blocked");
    setText(talentDetail.read, result.miniDraftProgress.localDraftFinished
      ? "Draft finished. Review the recap."
      : "Choose another available wrestler to continue the draft.");
    setText(talentDetail.fit, "Not Saved Yet. Reload resets progress.");
    setText(talentDetail.previewStatus, result.miniDraftProgress.displayLabels.statusLine);
    talentDetail.panel?.classList.add("empty-selection");
    setText(talentDetail.starPower, "--");
    setText(talentDetail.ringWork, "--");
    setText(talentDetail.promo, "--");
    setText(talentDetail.durability, "--");
    setText(talentDetail.risk, "--");
    setText(talentDetail.confidence, "--");
    setMeter(talentDetail.starMeter, "0");
    setMeter(talentDetail.ringMeter, "0");
    setMeter(talentDetail.promoMeter, "0");
    setMeter(talentDetail.durabilityMeter, "0");
    setMeter(talentDetail.riskMeter, "0");
    setMeter(talentDetail.confidenceMeter, "0");

    updateIntentPreview(uiState.selectedDraftIntentPreview);
    updateFinancePreviewForCandidate();
  }

  function getCandidateDisplayFromRow(row) {
    const candidate = createCandidateDisplayFromDataset(row.dataset);

    if (uiState.miniDraftProgress.draftedCandidateIds.includes(candidate.candidateId)) {
      return {
        ...candidate,
        availability: "Drafted",
      };
    }

    return candidate;
  }

  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      showSection(item.dataset.navTarget, item.dataset.navSection, {
        navigationContext: "game-shell",
      });
      collapseDock();
    });
  });

  if (navDock) {
    navDock.addEventListener("pointerenter", releaseDockCollapse);
    navDock.addEventListener("pointerleave", scheduleDockCollapse);
    navDock.addEventListener("focusin", releaseDockCollapse);
  }

  document.addEventListener("click", (event) => {
    if (navDock && !navDock.contains(event.target)) {
      collapseDock();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      collapseDock();
    }
  });

  flowCards.forEach((card) => {
    card.addEventListener("click", () => {
      showSection(card.dataset.flowTarget);
    });
  });

  jumpControls.forEach((control) => {
    control.addEventListener("click", () => {
      if (!control.disabled) {
        showSection(control.dataset.goTo);
      }
    });
  });

  saveControls.forEach((button) => {
    button.addEventListener("click", () => {
      void saveCurrentGame();
    });
  });

  continueSaveControls.forEach((button) => {
    button.addEventListener("click", () => {
      void continueLastSave();
    });
  });

  Object.entries(championshipSetupTargets.selects).forEach(([slotId, select]) => {
    select?.addEventListener("change", () => {
      uiState.localPostDraftSetup = updateLocalChampionshipSelection({
        setupState: uiState.localPostDraftSetup,
        slotId,
        candidateId: select.value,
      });
      updateChampionshipSetupSurface();
    });
  });

  championshipSetupTargets.complete?.addEventListener("click", () => {
    const result = completeLocalChampionshipSetup({
      selectedBrand: getSelectedBrandDisplay(),
      miniDraftProgress: uiState.miniDraftProgress,
      setupState: uiState.localPostDraftSetup,
    });
    uiState.localPostDraftSetup = result.setupState;
    updateChampionshipSetupSurface();
    if (result.actionStatus === "championship-setup-complete") {
      showSection("rivalry-setup");
    }
  });

  rivalrySetupTargets.slots.forEach((slotTarget, slotIndex) => {
    [slotTarget.wrestlerA, slotTarget.wrestlerB, slotTarget.type, slotTarget.intensity]
      .filter(Boolean)
      .forEach((select) => {
        select.addEventListener("change", () => {
          uiState.localPostDraftSetup = updateLocalRivalrySlot({
            setupState: uiState.localPostDraftSetup,
            slotIndex,
            wrestlerAId: slotTarget.wrestlerA?.value,
            wrestlerBId: slotTarget.wrestlerB?.value,
            rivalryType: slotTarget.type?.value,
            intensity: slotTarget.intensity?.value,
          });
          updateRivalrySetupSurface();
        });
      });
  });

  rivalrySetupTargets.complete?.addEventListener("click", () => {
    const result = completeLocalRivalrySetup({
      selectedBrand: getSelectedBrandDisplay(),
      miniDraftProgress: uiState.miniDraftProgress,
      setupState: uiState.localPostDraftSetup,
    });
    uiState.localPostDraftSetup = result.setupState;
    updateRivalrySetupSurface();
  });

  bookingTargets.segmentType?.addEventListener("change", () => {
    updateBookingSegmentControlVisibility();
  });

  bookingTargets.addSegment?.addEventListener("click", () => {
    if (bookingTargets.addSegment.disabled) {
      return;
    }

    const segmentType = bookingTargets.segmentType?.value || "singles-match";
    const result = addLocalWeekOneBookingSegment({
      selectedBrand: getSelectedBrandDisplay(),
      miniDraftProgress: uiState.miniDraftProgress,
      setupState: uiState.localPostDraftSetup,
      bookingState: uiState.localWeekOneBooking,
      weeklyState: uiState.localWeeklyLoop,
      segmentInput: {
        segmentType,
        wrestlerAId: bookingTargets.wrestlerA?.value,
        wrestlerBId: bookingTargets.wrestlerB?.value,
        featuredWrestlerId: bookingTargets.promoWrestler?.value,
      },
    });
    uiState.localWeekOneBooking = result.bookingState;
    updateWeekOneBookingSurface(result.displayLabels.statusLine);
  });

  bookingTargets.showCardList?.addEventListener("click", (event) => {
    const removeButton = event.target?.closest?.("[data-remove-booking-segment]");

    if (!removeButton) {
      return;
    }

    uiState.localWeekOneBooking = removeLocalWeekOneBookingSegment({
      bookingState: uiState.localWeekOneBooking,
      segmentId: removeButton.dataset.removeBookingSegment,
    });
    updateWeekOneBookingSurface("Segment removed from the show card.");
  });

  [bookingTargets.runShow, bookingTargets.runShowFooter]
    .filter(Boolean)
    .forEach((button) => {
      button.addEventListener("click", () => {
        if (button.disabled) {
          return;
        }

        const result = runLocalWeeklyShow({
          selectedBrand: getSelectedBrandDisplay(),
          miniDraftProgress: uiState.miniDraftProgress,
          setupState: uiState.localPostDraftSetup,
          bookingState: uiState.localWeekOneBooking,
          weeklyState: uiState.localWeeklyLoop,
        });
        uiState.localWeeklyLoop = result.weeklyState;

        if (result.actionStatus === "local-weekly-show-ran") {
          showSection("show-recap");
        } else {
          updateWeekOneBookingSurface(result.displayLabels.statusLine);
        }
      });
    });

  showRecapTargets.advance?.addEventListener("click", () => {
    if (showRecapTargets.advance.disabled) {
      return;
    }

    const result = advanceLocalWeek({
      weeklyState: uiState.localWeeklyLoop,
    });
    uiState.localWeeklyLoop = result.weeklyState;

    if (result.actionStatus === "local-week-advanced") {
      uiState.localWeekOneBooking = createInitialLocalWeekOneBookingState();
      showSection("brand-dashboard");
    } else {
      updateShowRecapSurface(result.displayLabels.statusLine);
    }
  });

  previewControls.forEach((control) => {
    control.addEventListener("click", () => {
      if (!control.disabled) {
        uiState.mockDraftRecapPreview = createMockDraftRecapPreviewFromUiState();
        updateMockDraftRecapPreview(uiState.mockDraftRecapPreview);
        showSection(control.dataset.previewGoTo);
      }
    });
  });

  makePickControl?.addEventListener("click", () => {
    if (makePickControl.disabled) {
      return;
    }

    const result = executeInMemoryMakePick({
      selectedCandidate: getSelectedCandidateDisplay(),
      selectedBrand: getSelectedBrandDisplay(),
      selectedGm: getSelectedGmDisplay(),
      draftSlot: uiState.miniDraftProgress.currentDraftSlot,
      miniDraftProgress: uiState.miniDraftProgress,
    });

    if (result.miniDraftProgress) {
      uiState.miniDraftProgress = result.miniDraftProgress;
      updateDraftedCandidateRows();
      updateDraftBudgetPanel();
    }

    if (result.projection) {
      updateInMemoryDraftRecapProjection(result.projection);
    } else if (intentPreviewTargets.note) {
      intentPreviewTargets.note.textContent = result.displayLabels.noteLine;
    }

    if (result.actionStatus === "in-memory-make-pick-succeeded") {
      const rivalResult = executeRivalBrandDraftPicks({
        competingBrands: getCompetingBrandsForSetup(),
        miniDraftProgress: uiState.miniDraftProgress,
      });
      uiState.miniDraftProgress = rivalResult.miniDraftProgress;
      updateDraftedCandidateRows();
      updateDraftBudgetPanel();
      clearSelectedCandidateAfterPick(result);
    }

    updateMakePickControl();
    updatePostDraftRosterHub();

  });

  autoFillControl?.addEventListener("click", () => {
    if (autoFillControl.disabled) {
      return;
    }

    const result = executeAutoFillMinimumRoster({
      selectedBrand: getSelectedBrandDisplay(),
      selectedGm: getSelectedGmDisplay(),
      miniDraftProgress: uiState.miniDraftProgress,
    });

    if (result.miniDraftProgress) {
      uiState.miniDraftProgress = result.miniDraftProgress;
      updateDraftedCandidateRows();
      updateDraftBudgetPanel();
      clearSelectedCandidateAfterPick(result);
    }

    if (result.projection) {
      updateInMemoryDraftRecapProjection(result.projection);
    }

    setText(intentPreviewTargets.status, result.displayLabels?.statusLine);
    setText(intentPreviewTargets.note, result.displayLabels?.noteLine);
    updateMakePickControl();
    updatePostDraftRosterHub();
  });

  finishDraftControl?.addEventListener("click", () => {
    const result = executeLocalFinishDraft({
      selectedBrand: getSelectedBrandDisplay(),
      selectedGm: getSelectedGmDisplay(),
      miniDraftProgress: uiState.miniDraftProgress,
    });

    if (result.miniDraftProgress) {
      uiState.miniDraftProgress = result.miniDraftProgress;
      updateDraftedCandidateRows();
      updateDraftBudgetPanel();
    }

    if (result.projection) {
      updateInMemoryDraftRecapProjection(result.projection);
    }

    setText(intentPreviewTargets.status, result.displayLabels?.statusLine);
    setText(intentPreviewTargets.note, result.displayLabels?.noteLine);
    updateMakePickControl();
    updatePostDraftRosterHub();

    if (result.actionStatus === "local-draft-finished") {
      showSection("draft-recap");
    }
  });

  recapControl?.addEventListener("click", () => {
    if (!recapControl.disabled) {
      showSection("draft-recap");
    }
  });

  brandControls.forEach((control) => {
    control.addEventListener("click", () => {
      setBrand(control.dataset.brand);
      updateMakePickControl();
    });
  });

  difficultyControls.forEach((control) => {
    control.addEventListener("click", () => {
      setDifficulty(control.dataset.difficulty);
    });
  });

  activeBrandCountControls.forEach((control) => {
    control.addEventListener("click", () => {
      setActiveBrandCount(control.dataset.activeBrandCount);
    });
  });

  talentRows.forEach((row) => {
    row.addEventListener("click", () => {
      setSelectedCandidate(row);
    });
  });

  gmCards.forEach((card) => {
    card.addEventListener("click", () => {
      setSelectedGm(card);
    });

    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setSelectedGm(card);
      }
    });
  });

  setBrand("raw");
  const initialCandidate = talentRows.find((row) => row.dataset.candidateId === uiState.selectedCandidateId);
  if (initialCandidate) {
    setSelectedCandidate(initialCandidate);
  }
  updateMakePickControl();
  updateSetupBasicsSurface();
  showSection("game-landing");
})();

function renderPlayableRosterUniverse(talentList) {
  if (!talentList) {
    return;
  }

  const candidateObjectSet = createNewGMModeDraftPickCandidateObjects();
  const projection = createNewGMModeDraftFinanceProjection({
    candidateObjectSet,
  });
  const projectionByCandidateId = new Map(
    projection.candidateProjections.map((candidateProjection) => [
      candidateProjection.candidateObjectId,
      candidateProjection,
    ])
  );
  const eligibleCandidates = candidateObjectSet.candidates.filter(
    (candidate) => candidate.eligibilityStatus === "eligible"
  );

  talentList.replaceChildren(
    ...eligibleCandidates.map((candidate, index) =>
      createTalentRow({
        candidate,
        candidateProjection: projectionByCandidateId.get(candidate.candidateId),
        draftRank: index + 1,
      })
    )
  );
}

function createTalentRow({ candidate, candidateProjection, draftRank }) {
  const row = document.createElement("button");
  const displayName =
    candidateProjection?.displayName ||
    candidate.wrestlerIdentityReference.slug;
  const sourceRosterPool = candidateProjection?.sourceRosterPool || "Roster";
  const divisionCategory = candidateProjection?.divisionCategory || "men";
  const projectedSigningTier =
    candidateProjection?.projectedSigningTier || "Mid Card";
  const projectedSigningCost =
    candidateProjection?.projectedSigningCost ?? 5;
  const candidateId = createUiCandidateIdFromFixtureSlug(
    candidate.sourceFixtureReference.fixtureSlug
  );
  const rating = createDisplayRatings(projectedSigningTier);

  row.className = draftRank === 1 ? "talent-row selected" : "talent-row";
  row.type = "button";
  row.setAttribute("aria-pressed", draftRank === 1 ? "true" : "false");
  row.dataset.candidateId = candidateId;
  row.dataset.draftRank = String(draftRank).padStart(2, "0");
  row.dataset.availability = "Available";
  row.dataset.talentName = displayName;
  row.dataset.talentRole = `${projectedSigningTier} / ${formatDivisionCategory(
    divisionCategory
  )} / ${sourceRosterPool}`;
  row.dataset.talentStyle = `Source Pool: ${sourceRosterPool} | Cost ${formatBudgetUnitsAsMoney(projectedSigningCost)}`;
  row.dataset.talentRead =
    "Draft board report. Signing cost reflects your current draft budget.";
  row.dataset.talentFit = `${formatDivisionCategory(
    divisionCategory
  )}, ${sourceRosterPool} source pool.`;
  row.dataset.starPower = rating.starPower;
  row.dataset.starPowerValue = rating.starPowerValue;
  row.dataset.ringWork = rating.ringWork;
  row.dataset.ringWorkValue = rating.ringWorkValue;
  row.dataset.promo = rating.promo;
  row.dataset.promoValue = rating.promoValue;
  row.dataset.durability = rating.durability;
  row.dataset.durabilityValue = rating.durabilityValue;
  row.dataset.risk = rating.risk;
  row.dataset.riskValue = rating.riskValue;
  row.dataset.confidence = "Strong";
  row.dataset.confidenceValue = "74";

  const portrait = document.createElement("span");
  portrait.className = "mini-portrait";
  portrait.textContent = createInitials(displayName);

  const name = document.createElement("strong");
  name.textContent = displayName;

  const cost = document.createElement("span");
  cost.className = "talent-cost";
  cost.textContent = `Cost ${formatBudgetUnitsAsMoney(projectedSigningCost)}`;

  const tier = document.createElement("span");
  tier.className = "talent-tier";
  tier.textContent = projectedSigningTier;

  const division = document.createElement("span");
  division.className = "talent-division";
  division.textContent = formatDivisionCategory(divisionCategory);

  const meta = document.createElement("small");
  meta.textContent = [
    row.dataset.draftRank,
    sourceRosterPool,
    projectedSigningTier,
    `Cost ${formatBudgetUnitsAsMoney(projectedSigningCost)}`,
  ].join(" | ");

  row.append(portrait, name, cost, tier, division, meta);
  return row;
}

function formatBudgetUnitsAsMoney(value) {
  const budgetUnits = Number(value);
  const normalizedUnits =
    Number.isFinite(budgetUnits) && budgetUnits > 0
      ? Math.floor(budgetUnits)
      : 0;
  const amount = normalizedUnits * 100000;

  return `$${amount.toLocaleString("en-US")}`;
}

function createDisplayRatings(projectedSigningTier) {
  if (projectedSigningTier === "Franchise") {
    return {
      starPower: "Elite",
      starPowerValue: "94",
      ringWork: "Elite",
      ringWorkValue: "90",
      promo: "Elite",
      promoValue: "90",
      durability: "Durable",
      durabilityValue: "86",
      risk: "Low",
      riskValue: "26",
    };
  }

  if (projectedSigningTier === "Main Event") {
    return {
      starPower: "High",
      starPowerValue: "86",
      ringWork: "Strong",
      ringWorkValue: "84",
      promo: "Strong",
      promoValue: "82",
      durability: "Durable",
      durabilityValue: "82",
      risk: "Low",
      riskValue: "32",
    };
  }

  if (projectedSigningTier === "Upper Card") {
    return {
      starPower: "Strong",
      starPowerValue: "78",
      ringWork: "Solid",
      ringWorkValue: "78",
      promo: "Steady",
      promoValue: "74",
      durability: "Steady",
      durabilityValue: "76",
      risk: "Medium",
      riskValue: "42",
    };
  }

  if (projectedSigningTier === "Prospect") {
    return {
      starPower: "Developing",
      starPowerValue: "62",
      ringWork: "Developing",
      ringWorkValue: "66",
      promo: "Developing",
      promoValue: "60",
      durability: "Steady",
      durabilityValue: "70",
      risk: "Medium",
      riskValue: "48",
    };
  }

  return {
    starPower: "Steady",
    starPowerValue: "70",
    ringWork: "Solid",
    ringWorkValue: "72",
    promo: "Steady",
    promoValue: "68",
    durability: "Steady",
    durabilityValue: "74",
    risk: "Medium",
    riskValue: "40",
  };
}

function createUiCandidateIdFromFixtureSlug(fixtureSlug) {
  return `candidate-${fixtureSlug.replace(/^fixture-wrestler-\d+-/, "")}`;
}

function createInitials(displayName) {
  return displayName
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDivisionCategory(divisionCategory) {
  if (divisionCategory === "women") {
    return "Women's division";
  }

  if (divisionCategory === "tag") {
    return "Tag category";
  }

  return "Men's division";
}
