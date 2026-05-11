import {
  DEFAULT_LOCAL_DRAFT_SLOT,
  createCandidateDisplayFromDataset,
  createDraftSelectionIntentPreview,
} from "./draftSelectionIntentAdapter.js";
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
  const talentRows = Array.from(document.querySelectorAll("[data-talent-name]"));
  const gmCards = Array.from(document.querySelectorAll("[data-gm-id]"));
  const brandControls = Array.from(document.querySelectorAll("[data-brand]"));
  const activeLabel = document.getElementById("active-screen-label");
  const railActiveLabel = document.getElementById("rail-active-label");
  const brandBug = document.getElementById("brand-bug");
  const phaseLabel = document.getElementById("phase-label");
  const brandNameTargets = Array.from(document.querySelectorAll(".js-brand-name"));
  const intentPreviewTargets = {
    candidate: document.getElementById("intent-preview-candidate"),
    brand: document.getElementById("intent-preview-brand"),
    pick: document.getElementById("intent-preview-pick"),
    status: document.getElementById("intent-preview-status"),
    note: document.getElementById("intent-preview-note"),
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

  function createDraftSelectionIntentPresentationPreview(row) {
    return createDraftSelectionIntentPreview({
      selectedCandidate: createCandidateDisplayFromDataset(row.dataset),
      selectedBrand: {
        brandId: uiState.selectedBrandId,
        brandLabel: getBrandLabel(),
      },
      draftSlot: DEFAULT_LOCAL_DRAFT_SLOT,
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
    uiState.selectedCandidateId = row.dataset.candidateId;
    uiState.selectedDraftIntentPreview = createDraftSelectionIntentPresentationPreview(row);
    const preview = uiState.selectedDraftIntentPreview;
    const isUnavailable = row.dataset.availability !== "Available";

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

  brandControls.forEach((control) => {
    control.addEventListener("click", () => {
      setBrand(control.dataset.brand);
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
  showSection("game-landing");
})();
