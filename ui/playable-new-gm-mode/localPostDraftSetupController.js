export const LOCAL_BRAND_TITLE_SETS = Object.freeze({
  raw: Object.freeze({
    brandLabel: "Raw",
    mensMain: "World Heavyweight Championship",
    mensMidcard: "Intercontinental Championship",
    womensMain: "Women's World Championship",
    womensMidcard: "Women's Intercontinental Championship",
    mensTag: "World Tag Team Championship",
    womensTag: "Women's Tag Team Championship",
  }),
  smackdown: Object.freeze({
    brandLabel: "SmackDown",
    mensMain: "WWE Championship",
    mensMidcard: "United States Championship",
    womensMain: "WWE Women's Championship",
    womensMidcard: "Women's United States Championship",
    mensTag: "WWE Tag Team Championship",
    womensTag: "Women's Tag Team Championship",
  }),
  nxt: Object.freeze({
    brandLabel: "NXT",
    mensMain: "NXT Championship",
    mensMidcard: "NXT North American Championship",
    womensMain: "NXT Women's Championship",
    womensMidcard: "NXT Women's North American Championship",
    mensTag: "NXT Tag Team Championship",
    womensTag: "NXT Women's Tag Team Championship",
  }),
  aew: Object.freeze({
    brandLabel: "AEW",
    mensMain: "AEW World Championship",
    mensMidcard: "AEW TNT Championship",
    womensMain: "AEW Women's World Championship",
    womensMidcard: "AEW TBS Championship",
    mensTag: "AEW World Tag Team Championship",
    womensTag: "AEW Women's Tag Team Championship",
  }),
});

export const LOCAL_CHAMPIONSHIP_TITLE_SLOTS = Object.freeze([
  Object.freeze({
    slotId: "mensMainChampionId",
    titleKey: "mensMain",
    divisionLabel: "Men's Main",
    requiredDivisionCategory: "men",
  }),
  Object.freeze({
    slotId: "mensMidcardChampionId",
    titleKey: "mensMidcard",
    divisionLabel: "Men's Midcard",
    requiredDivisionCategory: "men",
  }),
  Object.freeze({
    slotId: "womensMainChampionId",
    titleKey: "womensMain",
    divisionLabel: "Women's Main",
    requiredDivisionCategory: "women",
  }),
  Object.freeze({
    slotId: "womensMidcardChampionId",
    titleKey: "womensMidcard",
    divisionLabel: "Women's Midcard",
    requiredDivisionCategory: "women",
  }),
]);

export const LOCAL_TAG_TITLE_SLOTS = Object.freeze([
  Object.freeze({
    slotId: "mensTagTeamChampionIds",
    titleKey: "mensTag",
    divisionLabel: "Men's Tag Team",
  }),
  Object.freeze({
    slotId: "womensTagTeamChampionIds",
    titleKey: "womensTag",
    divisionLabel: "Women's Tag Team",
  }),
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
      mensMainChampionId: "",
      mensMidcardChampionId: "",
      womensMainChampionId: "",
      womensMidcardChampionId: "",
    },
    rivalrySetupComplete: false,
    rivalries: createEmptyRivalrySlots(),
  });
}

export function createLocalSetupRosterOptions(
  miniDraftProgress = {},
  { selectedBrand } = {}
) {
  const summaries = Array.isArray(miniDraftProgress.completedPickSummaries)
    ? miniDraftProgress.completedPickSummaries
    : [];
  const brandLabel = resolveBrandTitleSet(selectedBrand, miniDraftProgress).brandLabel;

  return Object.freeze(
    summaries.map((summary, index) =>
      {
        const sourceRosterPool = readString(summary?.sourceRosterPool) || "Roster";
        return Object.freeze({
        candidateId: readString(summary?.candidateId) || `signed-${index + 1}`,
        displayName: readString(summary?.candidateName) || `Signed Superstar ${index + 1}`,
        activeBrandLabel: brandLabel,
        sourceRosterPool,
        signedToBrandLine: `Signed to ${brandLabel}`,
        draftedFromLine: `Drafted From ${sourceRosterPool}`,
        signingTier: readString(summary?.signingTier) || "Signed Talent",
        signingCost: readPositiveOrZeroNumber(summary?.signingCost, 0),
        divisionCategory: readString(summary?.divisionCategory) || "Division TBD",
        pickSource:
          readString(summary?.pickSource) === "auto-fill" ? "Auto-Filled" : "Manual",
        pickNumber: readPositiveNumber(summary?.pickNumber, index + 1),
        });
      }
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
  selectedBrand,
  miniDraftProgress,
  setupState,
} = {}) {
  const currentState = normalizeSetupState(setupState);
  const titleSet = resolveBrandTitleSet(selectedBrand, miniDraftProgress);
  const rosterOptions = createLocalSetupRosterOptions(miniDraftProgress, {
    selectedBrand,
  });
  const rosterIds = new Set(rosterOptions.map((option) => option.candidateId));
  const localDraftFinished = Boolean(miniDraftProgress?.localDraftFinished);
  const champions = normalizeChampionSelections(currentState.champions, rosterOptions);
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
    brandLabel: titleSet.brandLabel,
    titleSet,
    rosterOptions,
    champions: Object.freeze(champions),
    missingSlots: Object.freeze(missingSlots.map((slot) => slot.slotId)),
    hasDuplicateSingles,
    canComplete,
    complete,
    championCards: Object.freeze(
      LOCAL_CHAMPIONSHIP_TITLE_SLOTS.map((slot) =>
        {
          const eligibleRosterOptions = findChampionEligibleRosterOptions(
            rosterOptions,
            slot
          );

          return Object.freeze({
          slotId: slot.slotId,
          label: titleSet[slot.titleKey],
          divisionLabel: slot.divisionLabel,
          requiredDivisionCategory: slot.requiredDivisionCategory,
          eligibleRosterOptions,
          candidateId: champions[slot.slotId],
          displayName: findRosterName(rosterOptions, champions[slot.slotId]),
          selected: Boolean(champions[slot.slotId]),
          });
        }
      )
    ),
    tagTitleCards: Object.freeze(
      LOCAL_TAG_TITLE_SLOTS.map((slot) =>
        Object.freeze({
          slotId: slot.slotId,
          label: titleSet[slot.titleKey],
          divisionLabel: slot.divisionLabel,
          status: "Coming Later",
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
  selectedBrand,
  miniDraftProgress,
  setupState,
} = {}) {
  const projection = createChampionshipSetupProjection({
    selectedBrand,
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
      selectedBrand,
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
  selectedBrand,
  miniDraftProgress,
  setupState,
} = {}) {
  const currentState = normalizeSetupState(setupState);
  const championshipProjection = createChampionshipSetupProjection({
    selectedBrand,
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
  selectedBrand,
  miniDraftProgress,
  setupState,
} = {}) {
  const projection = createRivalrySetupProjection({
    selectedBrand,
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
      selectedBrand,
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
    selectedBrand,
    miniDraftProgress,
    setupState: currentState,
  });
  const rivalryProjection = createRivalrySetupProjection({
    selectedBrand,
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
      bookingLine: unlocked ? "Book Week 1 Show" : "Booking Locked",
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
      mensMainChampionId:
        readString(setupState.champions?.mensMainChampionId) ||
        readString(setupState.champions?.worldChampionId) ||
        "",
      mensMidcardChampionId:
        readString(setupState.champions?.mensMidcardChampionId) ||
        readString(setupState.champions?.midcardChampionId) ||
        "",
      womensMainChampionId:
        readString(setupState.champions?.womensMainChampionId) ||
        readString(setupState.champions?.womensChampionId) ||
        "",
      womensMidcardChampionId:
        readString(setupState.champions?.womensMidcardChampionId) || "",
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
  const rosterOptions = Array.isArray(rosterIds) ? rosterIds : [];

  return {
    mensMainChampionId: normalizeRosterSelection(
      champions?.mensMainChampionId,
      new Set(findChampionEligibleRosterOptions(
        rosterOptions,
        LOCAL_CHAMPIONSHIP_TITLE_SLOTS[0]
      ).map((option) => option.candidateId))
    ),
    mensMidcardChampionId: normalizeRosterSelection(
      champions?.mensMidcardChampionId,
      new Set(findChampionEligibleRosterOptions(
        rosterOptions,
        LOCAL_CHAMPIONSHIP_TITLE_SLOTS[1]
      ).map((option) => option.candidateId))
    ),
    womensMainChampionId: normalizeRosterSelection(
      champions?.womensMainChampionId,
      new Set(findChampionEligibleRosterOptions(
        rosterOptions,
        LOCAL_CHAMPIONSHIP_TITLE_SLOTS[2]
      ).map((option) => option.candidateId))
    ),
    womensMidcardChampionId: normalizeRosterSelection(
      champions?.womensMidcardChampionId,
      new Set(findChampionEligibleRosterOptions(
        rosterOptions,
        LOCAL_CHAMPIONSHIP_TITLE_SLOTS[3]
      ).map((option) => option.candidateId))
    ),
  };
}

function findChampionEligibleRosterOptions(rosterOptions, slot) {
  const requiredDivision = slot?.requiredDivisionCategory;

  return Object.freeze(
    rosterOptions.filter((option) => {
      const divisionCategory = readString(option?.divisionCategory)?.toLowerCase();

      if (requiredDivision === "women") {
        return divisionCategory === "women";
      }

      if (requiredDivision === "men") {
        return divisionCategory !== "women" && divisionCategory !== "tag";
      }

      return true;
    })
  );
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
    return "Assign all required singles champions to continue.";
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

function resolveBrandTitleSet(selectedBrand, miniDraftProgress) {
  const brandId =
    normalizeBrandId(selectedBrand?.brandId) ||
    normalizeBrandId(miniDraftProgress?.selectedBrandReference?.brandId) ||
    normalizeBrandId(miniDraftProgress?.selectedBrand?.brandId) ||
    "raw";

  return LOCAL_BRAND_TITLE_SETS[brandId] || LOCAL_BRAND_TITLE_SETS.raw;
}

function normalizeBrandId(value) {
  const brandId = readString(value)?.toLowerCase();

  if (!brandId) {
    return undefined;
  }

  if (brandId === "smackdown" || brandId === "smack-down") {
    return "smackdown";
  }

  if (brandId === "raw" || brandId === "nxt" || brandId === "aew") {
    return brandId;
  }

  return undefined;
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
