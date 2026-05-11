(() => {
  const sections = Array.from(document.querySelectorAll("[data-screen-title]"));
  const navItems = Array.from(document.querySelectorAll("[data-nav-target]"));
  const flowCards = Array.from(document.querySelectorAll("[data-flow-target]"));
  const jumpControls = Array.from(document.querySelectorAll("[data-go-to]"));
  const talentRows = Array.from(document.querySelectorAll("[data-talent-name]"));
  const activeLabel = document.getElementById("active-screen-label");
  const phaseLabel = document.getElementById("phase-label");
  const talentDetail = {
    initials: document.getElementById("talent-detail-initials"),
    name: document.getElementById("talent-detail-name"),
    role: document.getElementById("talent-detail-role"),
    style: document.getElementById("talent-detail-style"),
    read: document.getElementById("talent-detail-read"),
    fit: document.getElementById("talent-detail-fit"),
  };

  const flowOrder = ["save-selection", "new-gm-setup", "setup-review", "draft-room", "brand-hq"];

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

  function showSection(targetId) {
    const target = getSection(targetId);

    if (!target) {
      return;
    }

    sections.forEach((section) => {
      const isActive = section === target;
      section.hidden = !isActive;
      section.classList.toggle("active-screen", isActive);
    });

    navItems.forEach((item) => {
      const isActive = item.dataset.navTarget === targetId;
      item.classList.toggle("active", isActive);
      if (isActive) {
        item.setAttribute("aria-current", "page");
      } else {
        item.removeAttribute("aria-current");
      }
    });

    updateFlow(targetId);

    if (activeLabel) {
      activeLabel.textContent = target.dataset.screenTitle;
    }

    if (phaseLabel) {
      phaseLabel.textContent = target.dataset.flowPhase || "Preview";
    }

    if (window.location.hash !== `#${targetId}`) {
      window.history.replaceState(null, "", `#${targetId}`);
    }
  }

  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      showSection(item.dataset.navTarget);
    });
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

  talentRows.forEach((row) => {
    row.addEventListener("click", () => {
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
      if (talentDetail.name) {
        talentDetail.name.textContent = row.dataset.talentName;
      }
      if (talentDetail.role) {
        talentDetail.role.textContent = row.dataset.talentRole;
      }
      if (talentDetail.style) {
        talentDetail.style.textContent = row.dataset.talentStyle;
      }
      if (talentDetail.read) {
        talentDetail.read.textContent = row.dataset.talentRead;
      }
      if (talentDetail.fit) {
        talentDetail.fit.textContent = row.dataset.talentFit;
      }
    });
  });

  const initialTarget = window.location.hash ? window.location.hash.slice(1) : "save-selection";
  showSection(getSection(initialTarget) ? initialTarget : "save-selection");
})();
