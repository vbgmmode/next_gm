(() => {
  const sections = Array.from(document.querySelectorAll("[data-screen-title]"));
  const navItems = Array.from(document.querySelectorAll("[data-nav-target]"));
  const flowSteps = Array.from(document.querySelectorAll("[data-flow-target]"));
  const jumpControls = Array.from(document.querySelectorAll("[data-go-to]"));
  const talentCards = Array.from(document.querySelectorAll("[data-talent-name]"));
  const activeLabel = document.getElementById("active-screen-label");
  const talentDetail = {
    name: document.getElementById("talent-detail-name"),
    role: document.getElementById("talent-detail-role"),
    style: document.getElementById("talent-detail-style"),
    read: document.getElementById("talent-detail-read"),
    fit: document.getElementById("talent-detail-fit"),
  };

  const flowOrder = ["save-selection", "new-gm-setup", "setup-review", "draft-room"];

  function getSection(targetId) {
    return sections.find((section) => section.id === targetId);
  }

  function updateFlow(targetId) {
    const activeIndex = flowOrder.indexOf(targetId);

    flowSteps.forEach((step) => {
      const stepId = step.dataset.flowTarget;
      const stepIndex = flowOrder.indexOf(stepId);

      step.classList.toggle("flow-current", stepId === targetId);
      step.classList.toggle("flow-complete", activeIndex > -1 && stepIndex > -1 && stepIndex < activeIndex);
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
      section.classList.toggle("active-section", isActive);
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
      activeLabel.textContent = `Viewing ${target.dataset.screenTitle} - static demo shell`;
    }

    if (window.location.hash !== `#${targetId}`) {
      window.history.replaceState(null, "", `#${targetId}`);
    }
  }

  navItems.forEach((item) => {
    item.addEventListener("click", (event) => {
      event.preventDefault();
      showSection(item.dataset.navTarget);
    });
  });

  flowSteps.forEach((step) => {
    step.addEventListener("click", () => {
      showSection(step.dataset.flowTarget);
    });
  });

  jumpControls.forEach((control) => {
    control.addEventListener("click", () => {
      showSection(control.dataset.goTo);
    });
  });

  talentCards.forEach((card) => {
    card.addEventListener("click", () => {
      talentCards.forEach((item) => {
        const isSelected = item === card;
        item.classList.toggle("selected", isSelected);
        item.setAttribute("aria-pressed", String(isSelected));
      });

      if (talentDetail.name) {
        talentDetail.name.textContent = card.dataset.talentName;
      }
      if (talentDetail.role) {
        talentDetail.role.textContent = card.dataset.talentRole;
      }
      if (talentDetail.style) {
        talentDetail.style.textContent = card.dataset.talentStyle;
      }
      if (talentDetail.read) {
        talentDetail.read.textContent = card.dataset.talentRead;
      }
      if (talentDetail.fit) {
        talentDetail.fit.textContent = card.dataset.talentFit;
      }
    });
  });

  const initialTarget = window.location.hash ? window.location.hash.slice(1) : "dashboard";
  showSection(getSection(initialTarget) ? initialTarget : "dashboard");
})();
