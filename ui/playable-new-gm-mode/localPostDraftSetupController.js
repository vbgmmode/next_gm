export const LOCAL_CHAMPIONSHIP_TITLE_SLOTS = Object.freeze([
  Object.freeze({ slotId: "worldChampionId", label: "World Champion" }),
  Object.freeze({ slotId: "womensChampionId", label: "Women's Champion" }),
  Object.freeze({ slotId: "midcardChampionId", label: "Midcard Champion" }),
]);

export const LOCAL_RIVALRY_TYPES = Object.freeze([
  "Grudge",
  "Championship",
  "Tag Team",
  "Rising Star",
  "Open Challenge",
]);

export const LOCAL_RIVALRY_INTENSITIES = Object.freeze([
  "Low",
  "Medium",
  "High",
]);

export function createInitialLocalPostDraftSetupState() {
  return freezeSetupState({
    championshipSetupComplete: false,
    champions: {
      worldChampionId: "",
      womensChampionId: "",
      midcardChampionId: "",
    },
    rivalrySetupComplete: false,
    rivalries: createEmptyRivalrySlots(),
  });
}

export function createLocalSetupRosterOptions(miniDraftProgress = {}) {
  const summaries = Array.isArray(miniDraftProgress.completedPickSummaries)
    ? miniDraftProgress.completedPickSummaries
    : [];

  return Object.freeze(
    summaries.map((summary, index) =>
      Object.freeze({
        candidateId: readString(summary?.candidateId) || `signed-${index + 1}`,
        displayName: readString(summary?.candidateName) || `Signed Superstar ${index + 1}`,
        sourceRosterPool: readString(summary?.sourceRosterPool) || "Roster",
        signingTier: readString(summary?.signingTier) || "Signed Talent",
        signingCost: readPositiveOrZeroNumber(summary?.signingCost, 0),
        divisionCategory: readString(summary?.divisionCategory) || "Division TBD",
        pickSource:
          readString(summary?.pickSource) === "auto-fill" ? "Auto-Filled" : "Manual",
        pickNumber: readPositiveNumber(summary?.pickNumber, index + 1),
      })
    )
  );
}

export function updateLocalChampionshipSelection({
  setupState,
  slotId,
  candidateId,
} = {}) {
  const currentState = normalizeSetupState(setupState);

  if (!LOCAL_CHAMPIONSHIP_TITLE_SLOTS.some((slot) => slot.slotId === slotId)) {
    return currentState;
  }

  return freezeSetupState({
    ...currentState,
    championshipSetupComplete: false,
    champions: {
      ...currentState.champions,
      [slotId]: readString(candidateId) || "",
    },
  });
}

export function createChampionshipSetupProjection({
  miniDraftProgress,
  setupState,
} = {}) {
  const currentState = normalizeSetupState(setupState);
  const rosterOptions = createLocalSetupRosterOptions(miniDraftProgress);
  const rosterIds = new Set(rosterOptions.map((option) => option.candidateId));
  const localDraftFinished = Boolean(miniDraftProgress?.localDraftFinished);
  const champions = normalizeChampionSelections(currentState.champions, rosterIds);
  const selectedIds = LOCAL_CHAMPIONSHIP_TITLE_SLOTS
    .map((slot) => champions[slot.slotId])
    .filter(Boolean);
  const missingSlots = LOCAL_CHAMPIONSHIP_TITLE_SLOTS.filter(
    (slot) => !champions[slot.slotId]
  );
  const hasDuplicateSingles = new Set(selectedIds).size !== selectedIds.length;
  const canComplete =
    localDraftFinished && missingSlots.length === 0 && !hasDuplicateSingles;
  const complete = Boolean(currentState.championshipSetupComplete && canComplete);

  return Object.freeze({
    locked: !localDraftFinished,
    localDraftFinished,
    rosterOptions,
    champions: Object.freeze(champions),
    missingSlots: Object.freeze(missingSlots.map((slot) => slot.slotId)),
    hasDuplicateSingles,
    canComplete,
    complete,
    championCards: Object.freeze(
      LOCAL_CHAMPIONSHIP_TITLE_SLOTS.map((slot) =>
        Object.freeze({
          slotId: slot.slotId,
          label: slot.label,
          candidateId: champions[slot.slotId],
          displayName: findRosterName(rosterOptions, champions[slot.slotId]),
          selected: Boolean(champions[slot.slotId]),
        })
      )
    ),
    displayLabels: Object.freeze({
      titleLine: "Assign Champions",
      statusLine: createChampionshipStatusLine({
        localDraftFinished,
        canComplete,
        complete,
        hasDuplicateSingles,
        missingSlots,
      }),
      actionLabel: complete ? "Championship Setup Complete" : "Complete Championship Setup",
      continueLabel: "Create Rivalries",
    }),
  });
}

export function completeLocalChampionshipSetup({
  miniDraftProgress,
  setupState,
} = {}) {
  const projection = createChampionshipSetupProjection({
    miniDraftProgress,
    setupState,
  });

  if (!projection.canComplete) {
    return Object.freeze({
      actionStatus: "championship-setup-blocked",
      setupState: normalizeSetupState(setupState),
      projection,
    });
  }

  const nextState = freezeSetupState({
    ...normalizeSetupState(setupState),
    champions: projection.champions,
    championshipSetupComplete: true,
  });

  return Object.freeze({
    actionStatus: "championship-setup-complete",
    setupState: nextState,
    projection: createChampionshipSetupProjection({
      miniDraftProgress,
      setupState: nextState,
    }),
  });
}

export function updateLocalRivalrySlot({
  setupState,
  slotIndex,
  wrestlerAId,
  wrestlerBId,
  rivalryType,
  intensity,
} = {}) {
  const currentState = normalizeSetupState(setupState);
  const nextSlots = currentState.rivalries.map((slot, index) => {
    if (index !== slotIndex) {
      return slot;
    }

    return Object.freeze({
      wrestlerAId: readString(wrestlerAId) || "",
      wrestlerBId: readString(wrestlerBId) || "",
      rivalryType: normalizeOption(rivalryType, LOCAL_RIVALRY_TYPES, "Grudge"),
      intensity: normalizeOption(intensity, LOCAL_RIVALRY_INTENSITIES, "Medium"),
    });
  });

  return freezeSetupState({
    ...currentState,
    rivalrySetupComplete: false,
    rivalries: nextSlots,
  });
}

export function createRivalrySetupProjection({
  miniDraftProgress,
  setupState,
} = {}) {
  const currentState = normalizeSetupState(setupState);
  const championshipProjection = createChampionshipSetupProjection({
    miniDraftProgress,
    setupState: currentState,
  });
  const rosterOptions = championshipProjection.rosterOptions;
  const rosterIds = new Set(rosterOptions.map((option) => option.candidateId));
  const normalizedSlots = currentState.rivalries.map((slot) =>
    normalizeRivalrySlot(slot, rosterIds)
  );
  const validRivalries = normalizedSlots.filter((slot) =>
    isValidRivalrySlot(slot, rosterIds)
  );
  const locked =
    !championshipProjection.localDraftFinished || !championshipProjection.complete;
  const canComplete = !locked && validRivalries.length >= 1;
  const complete = Boolean(currentState.rivalrySetupComplete && canComplete);

  return Object.freeze({
    locked,
    rosterOptions,
    rivalrySlots: Object.freeze(normalizedSlots),
    validRivalries: Object.freeze(validRivalries),
    canComplete,
    complete,
    displayLabels: Object.freeze({
      titleLine: "Create Rivalries",
      statusLine: createRivalryStatusLine({
        locked,
        canComplete,
        complete,
        validRivalryCount: validRivalries.length,
      }),
      actionLabel: complete ? "Rivalry Setup Complete" : "Complete Rivalry Setup",
      continueLabel: "Open Week 1 HQ",
    }),
  });
}

export function completeLocalRivalrySetup({
  miniDraftProgress,
  setupState,
} = {}) {
  const projection = createRivalrySetupProjection({
    miniDraftProgress,
    setupState,
  });

  if (!projection.canComplete) {
    return Object.freeze({
      actionStatus: "rivalry-setup-blocked",
      setupState: normalizeSetupState(setupState),
      projection,
    });
  }

  const nextState = freezeSetupState({
    ...normalizeSetupState(setupState),
    rivalries: projection.validRivalries,
    rivalrySetupComplete: true,
  });

  return Object.freeze({
    actionStatus: "rivalry-setup-complete",
    setupState: nextState,
    projection: createRivalrySetupProjection({
      miniDraftProgress,
      setupState: nextState,
    }),
  });
}

export function createWeekOneHqProjection({
  selectedBrand,
  miniDraftProgress,
  setupState,
} = {}) {
  const currentState = normalizeSetupState(setupState);
  const championshipProjection = createChampionshipSetupProjection({
    miniDraftProgress,
    setupState: currentState,
  });
  const rivalryProjection = createRivalrySetupProjection({
    miniDraftProgress,
    setupState: currentState,
  });
  const rosterOptions = championshipProjection.rosterOptions;
  const signedRosterCount = readPositiveOrZeroNumber(
    miniDraftProgress?.signedTalentCount,
    rosterOptions.length
  );
  const unlocked =
    Boolean(miniDraftProgress?.localDraftFinished) &&
    championshipProjection.complete &&
    rivalryProjection.complete;

  return Object.freeze({
    unlocked,
    brandLabel:
      readString(selectedBrand?.brandLabel) ||
      readString(miniDraftProgress?.selectedBrandReference?.brandLabel) ||
      "Selected Brand",
    signedRosterCount,
    remainingDraftBudget: readPositiveOrZeroNumber(
      miniDraftProgress?.remainingDraftBudget,
      0
    ),
    champions: Object.freeze(
      championshipProjection.championCards.map((card) =>
        Object.freeze({
          label: card.label,
          displayName: card.displayName || "Not Selected",
        })
      )
    ),
    rivalries: Object.freeze(
      rivalryProjection.validRivalries.map((rivalry) =>
        Object.freeze({
          wrestlerALabel: findRosterName(rosterOptions, rivalry.wrestlerAId),
          wrestlerBLabel: findRosterName(rosterOptions, rivalry.wrestlerBId),
          rivalryType: rivalry.rivalryType,
          intensity: rivalry.intensity,
        })
      )
    ),
    displayLabels: Object.freeze({
      titleLine: unlocked ? "Week 1 HQ" : "Week 1 HQ Locked",
      statusLine: unlocked
        ? "Week 1 HQ is open. Booking is coming next."
        : "Finish draft setup to unlock Week 1 HQ.",
      localOnlyLine: "Local Session Only / Not Saved Yet",
      bookingLine: "Book Week 1 Show - Coming Next",
    }),
  });
}

function createEmptyRivalrySlots() {
  return Object.freeze(
    Array.from({ length: 3 }, () =>
      Object.freeze({
        wrestlerAId: "",
        wrestlerBId: "",
        rivalryType: "Grudge",
        intensity: "Medium",
      })
    )
  );
}

function normalizeSetupState(setupState) {
  if (!setupState || typeof setupState !== "object") {
    return createInitialLocalPostDraftSetupState();
  }

  return freezeSetupState({
    championshipSetupComplete: Boolean(setupState.championshipSetupComplete),
    champions: {
      worldChampionId: readString(setupState.champions?.worldChampionId) || "",
      womensChampionId: readString(setupState.champions?.womensChampionId) || "",
      midcardChampionId: readString(setupState.champions?.midcardChampionId) || "",
    },
    rivalrySetupComplete: Boolean(setupState.rivalrySetupComplete),
    rivalries: normalizeRivalrySlots(setupState.rivalries),
  });
}

function freezeSetupState(state) {
  return Object.freeze({
    championshipSetupComplete: Boolean(state.championshipSetupComplete),
    champions: Object.freeze({ ...state.champions }),
    rivalrySetupComplete: Boolean(state.rivalrySetupComplete),
    rivalries: Object.freeze(state.rivalries.map((slot) => Object.freeze({ ...slot }))),
  });
}

function normalizeRivalrySlots(rivalries) {
  const slots = Array.isArray(rivalries) ? rivalries.slice(0, 3) : [];

  while (slots.length < 3) {
    slots.push({
      wrestlerAId: "",
      wrestlerBId: "",
      rivalryType: "Grudge",
      intensity: "Medium",
    });
  }

  return slots.map((slot) =>
    Object.freeze({
      wrestlerAId: readString(slot?.wrestlerAId) || "",
      wrestlerBId: readString(slot?.wrestlerBId) || "",
      rivalryType: normalizeOption(slot?.rivalryType, LOCAL_RIVALRY_TYPES, "Grudge"),
      intensity: normalizeOption(slot?.intensity, LOCAL_RIVALRY_INTENSITIES, "Medium"),
    })
  );
}

function normalizeChampionSelections(champions, rosterIds) {
  return {
    worldChampionId: normalizeRosterSelection(champions?.worldChampionId, rosterIds),
    womensChampionId: normalizeRosterSelection(champions?.womensChampionId, rosterIds),
    midcardChampionId: normalizeRosterSelection(champions?.midcardChampionId, rosterIds),
  };
}

function normalizeRivalrySlot(slot, rosterIds) {
  return Object.freeze({
    wrestlerAId: normalizeRosterSelection(slot?.wrestlerAId, rosterIds),
    wrestlerBId: normalizeRosterSelection(slot?.wrestlerBId, rosterIds),
    rivalryType: normalizeOption(slot?.rivalryType, LOCAL_RIVALRY_TYPES, "Grudge"),
    intensity: normalizeOption(slot?.intensity, LOCAL_RIVALRY_INTENSITIES, "Medium"),
  });
}

function normalizeRosterSelection(candidateId, rosterIds) {
  const value = readString(candidateId);
  return value && rosterIds.has(value) ? value : "";
}

function isValidRivalrySlot(slot, rosterIds) {
  return (
    rosterIds.has(slot.wrestlerAId) &&
    rosterIds.has(slot.wrestlerBId) &&
    slot.wrestlerAId !== slot.wrestlerBId
  );
}

function createChampionshipStatusLine({
  localDraftFinished,
  canComplete,
  complete,
  hasDuplicateSingles,
  missingSlots,
}) {
  if (!localDraftFinished) {
    return "Finish the draft before assigning champions.";
  }

  if (complete) {
    return "Championship Setup Complete";
  }

  if (hasDuplicateSingles) {
    return "Choose a different wrestler for each singles title.";
  }

  if (missingSlots.length > 0) {
    return "Assign all required champions to continue.";
  }

  return canComplete ? "Champions selected. Ready to complete setup." : "Setup Locked";
}

function createRivalryStatusLine({
  locked,
  canComplete,
  complete,
  validRivalryCount,
}) {
  if (locked) {
    return "Complete championship setup before creating rivalries.";
  }

  if (complete) {
    return "Rivalry Setup Complete";
  }

  if (validRivalryCount < 1) {
    return "Create at least one valid rivalry to continue.";
  }

  return canComplete ? "Rivalry card ready. Complete setup to open Week 1 HQ." : "Setup Locked";
}

function findRosterName(rosterOptions, candidateId) {
  return (
    rosterOptions.find((option) => option.candidateId === candidateId)?.displayName ||
    ""
  );
}

function normalizeOption(value, options, fallback) {
  const normalizedValue = readString(value);
  return normalizedValue && options.includes(normalizedValue)
    ? normalizedValue
    : fallback;
}

function readString(value) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

function readPositiveNumber(value, fallback) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : fallback;
}

function readPositiveOrZeroNumber(value, fallback) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : fallback;
}
