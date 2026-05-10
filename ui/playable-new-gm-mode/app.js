(() => {
  const sections = Array.from(document.querySelectorAll("[data-screen-title]"));
  const navItems = Array.from(document.querySelectorAll("[data-nav-target]"));
  const flowSteps = Array.from(document.querySelectorAll("[data-flow-target]"));
  const jumpControls = Array.from(document.querySelectorAll("[data-go-to]"));
  const activeLabel = document.getElementById("active-screen-label");

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

  const initialTarget = window.location.hash ? window.location.hash.slice(1) : "dashboard";
  showSection(getSection(initialTarget) ? initialTarget : "dashboard");
})();
