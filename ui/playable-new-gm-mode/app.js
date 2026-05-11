import {
  createCandidateDisplayFromDataset,
  createDraftSelectionIntentPreview,
} from "./draftSelectionIntentAdapter.js";
import { createMockDraftRecapPreviewState } from "./draftRecapPreviewState.js";
import {
  createInitialMiniDraftProgress,
  createMakePickReadiness,
  executeInMemoryMakePick,
} from "./inMemoryDraftActionController.js";
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
  const talentRows = Array.from(document.querySelectorAll("[data-talent-name]"));
  const gmCards = Array.from(document.querySelectorAll("[data-gm-id]"));
  const brandControls = Array.from(document.querySelectorAll("[data-brand]"));
  const activeLabel = document.getElementById("active-screen-label");
  const railActiveLabel = document.getElementById("rail-active-label");
  const brandBug = document.getElementById("brand-bug");
  const phaseLabel = document.getElementById("phase-label");
  const miniDraftPickBadge = document.getElementById("mini-draft-pick-badge");
  const brandNameTargets = Array.from(document.querySelectorAll(".js-brand-name"));
  const intentPreviewTargets = {
    candidate: document.getElementById("intent-preview-candidate"),
    brand: document.getElementById("intent-preview-brand"),
    pick: document.getElementById("intent-preview-pick"),
    status: document.getElementById("intent-preview-status"),
    note: document.getElementById("intent-preview-note"),
  };
  const draftRecapTargets = {
    badge: document.getElementById("draft-recap-badge"),
    path: document.getElementById("draft-recap-path-label"),
    title: document.getElementById("draft-recap-title"),
    copy: document.getElementById("draft-recap-copy"),
    gm: document.getElementById("draft-recap-gm"),
    brand: document.getElementById("draft-recap-brand"),
    candidate: document.getElementById("draft-recap-candidate"),
    pick: document.getElementById("draft-recap-pick"),
    status: document.getElementById("draft-recap-result-status"),
    rosterStatus: document.getElementById("draft-recap-roster-status"),
    roster: document.getElementById("draft-recap-roster"),
    note: document.getElementById("draft-recap-note"),
    dashboard: document.getElementById("dashboard-preview-note"),
    dashboardMiniDraftState: document.getElementById("dashboard-mini-draft-state"),
  };
  const talentDetail = {
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
    "brand-dashboard",
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
    "brand-dashboard": "dashboard",
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
    selectedCandidateId: "candidate-ace-mercer",
    selectedDraftIntentPreview: undefined,
    mockDraftRecapPreview: undefined,
    miniDraftProgress: createInitialMiniDraftProgress(),
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
    const target = getSection(targetId);

    if (!target) {
      return;
    }

    uiState.currentScreenId = targetId;
    const navigationContext = options.navigationContext;
    const dockVisible = shouldShowDock(targetId, { navigationContext });
    const activeNavSection = resolveActiveDockSection({
      screenId: targetId,
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

    updateFlow(targetId);
    document.body.classList.toggle("is-landing", targetId === "game-landing");
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

  function createMockDraftRecapPreviewFromUiState() {
    return createMockDraftRecapPreviewState({
      selectedGm: getSelectedGmDisplay(),
      selectedBrand: getSelectedBrandDisplay(),
      selectedCandidate: getSelectedCandidateDisplay(),
    });
  }

  function updateMockDraftRecapPreview(preview) {
    setText(draftRecapTargets.badge, preview.displayLabels.recapStatusLine);
    setText(draftRecapTargets.path, "QA Preview Path");
    setText(draftRecapTargets.title, `${getBrandLabel()} mock draft recap`);
    setText(
      draftRecapTargets.copy,
      "This screen is available for shell QA. It does not mean a pick, roster, or draft completion occurred."
    );
    setText(draftRecapTargets.gm, preview.displayLabels.gmLine);
    setText(draftRecapTargets.brand, preview.displayLabels.brandLine);
    setText(draftRecapTargets.candidate, preview.displayLabels.candidateLine);
    setText(draftRecapTargets.pick, "Mock continuation only");
    setText(draftRecapTargets.status, "No real draft result");
    setText(draftRecapTargets.rosterStatus, "No roster assignment");
    setText(draftRecapTargets.roster, preview.displayLabels.rosterLine);
    setText(draftRecapTargets.note, preview.displayLabels.noteLine);
    setText(draftRecapTargets.dashboard, preview.displayLabels.dashboardLine);
  }

  function updateInMemoryDraftRecapProjection(projection) {
    setText(draftRecapTargets.badge, projection.displayLabels.recapStatusLine);
    setText(draftRecapTargets.path, projection.displayLabels.pathLine);
    setText(draftRecapTargets.title, projection.displayLabels.titleLine);
    setText(draftRecapTargets.copy, projection.displayLabels.copyLine);
    setText(draftRecapTargets.gm, projection.displayLabels.gmLine);
    setText(draftRecapTargets.brand, projection.displayLabels.brandLine);
    setText(draftRecapTargets.candidate, projection.displayLabels.candidateLine);
    setText(draftRecapTargets.pick, projection.displayLabels.pickLine);
    setText(draftRecapTargets.status, projection.displayLabels.draftResultStatusLine);
    setText(draftRecapTargets.rosterStatus, projection.displayLabels.rosterStatusLine);
    setText(draftRecapTargets.roster, projection.displayLabels.rosterLine);
    setText(draftRecapTargets.note, projection.displayLabels.noteLine);
    setText(draftRecapTargets.dashboard, projection.displayLabels.dashboardLine);
    updateDashboardMiniDraftState(projection);
  }

  function updateDashboardMiniDraftState(projection) {
    const stateCard = draftRecapTargets.dashboardMiniDraftState;

    if (!stateCard) {
      return;
    }

    setText(stateCard.querySelector("span"), "Mini Draft");
    setText(
      stateCard.querySelector("strong"),
      projection.miniDraftComplete ? "Local Preview Complete" : "Local Preview In Progress"
    );
    setText(
      stateCard.querySelector("em"),
      projection.miniDraftComplete
        ? "Full draft, roster setup, Week 1, and booking remain locked"
        : "Finish three manual local picks before reviewing the recap"
    );
  }

  function updateMiniDraftPickBadge() {
    if (miniDraftPickBadge) {
      miniDraftPickBadge.textContent = uiState.miniDraftProgress.miniDraftComplete
        ? "Mini Draft Complete"
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
        meta.textContent = `${row.dataset.draftRank} | Drafted | Local pick`;
      }
    });
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
    updateMiniDraftPickBadge();
  }

  function setText(target, value) {
    if (target) {
      target.textContent = value;
    }
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

    updateIntentPreview(uiState.selectedDraftIntentPreview);
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
    setText(talentDetail.role, "Mini draft in progress");
    setText(talentDetail.availability, result.miniDraftProgress.displayLabels.progressLine);
    talentDetail.availability?.classList.remove("blocked");
    setText(talentDetail.read, result.miniDraftProgress.miniDraftComplete
      ? "Mini Draft Complete. Review the local recap."
      : "Choose another available candidate to continue the local mini draft.");
    setText(talentDetail.fit, "Local-only draft preview. Reload resets progress.");
    setText(talentDetail.previewStatus, result.miniDraftProgress.displayLabels.statusLine);
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
    }

    if (result.projection) {
      updateInMemoryDraftRecapProjection(result.projection);
    } else if (intentPreviewTargets.note) {
      intentPreviewTargets.note.textContent = result.displayLabels.noteLine;
    }

    if (result.actionStatus === "in-memory-make-pick-succeeded") {
      clearSelectedCandidateAfterPick(result);
    }

    updateMakePickControl();

    if (
      result.actionStatus === "in-memory-make-pick-succeeded" &&
      result.miniDraftProgress.miniDraftComplete
    ) {
      showSection("draft-recap");
    }
  });

  brandControls.forEach((control) => {
    control.addEventListener("click", () => {
      setBrand(control.dataset.brand);
      updateMakePickControl();
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
  showSection("game-landing");
})();
