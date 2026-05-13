export const LOCAL_GAME_SETUP_DIFFICULTIES = Object.freeze([
  Object.freeze({
    difficultyId: "easy",
    label: "Easy",
    pressureLabel: "Relaxed owner pressure",
    startingBudgetUnits: 150,
    gameplaySupported: true,
  }),
  Object.freeze({
    difficultyId: "normal",
    label: "Normal",
    pressureLabel: "Balanced owner pressure",
    startingBudgetUnits: 120,
    gameplaySupported: true,
  }),
  Object.freeze({
    difficultyId: "hard",
    label: "Hard",
    pressureLabel: "Tight owner pressure",
    startingBudgetUnits: 100,
    gameplaySupported: true,
  }),
  Object.freeze({
    difficultyId: "extreme",
    label: "Extreme",
    pressureLabel: "Preview-only owner pressure label",
    startingBudgetUnits: undefined,
    gameplaySupported: false,
  }),
  Object.freeze({
    difficultyId: "immortal",
    label: "Immortal",
    pressureLabel: "Preview-only owner pressure label",
    startingBudgetUnits: undefined,
    gameplaySupported: false,
  }),
]);

export const LOCAL_GAME_SETUP_STARTING_BUDGET_UNITS = 120;

export const LOCAL_GAME_SETUP_STARTING_BUDGET_OPTIONS = Object.freeze([
  Object.freeze({
    budgetId: "tight",
    label: "$10M",
    detailLabel: "Tight but viable",
    startingBudgetUnits: 100,
  }),
  Object.freeze({
    budgetId: "standard",
    label: "$12M",
    detailLabel: "Standard draft budget",
    startingBudgetUnits: 120,
  }),
  Object.freeze({
    budgetId: "premium",
    label: "$15M",
    detailLabel: "Premium opening budget",
    startingBudgetUnits: 150,
  }),
]);

export const LOCAL_GAME_SETUP_WIN_CONDITIONS = Object.freeze([
  Object.freeze({
    winConditionId: "total-fans",
    label: "Total Fans",
    effectLabel: "Preview Only - no scoring effect in this slice",
  }),
  Object.freeze({
    winConditionId: "hall-of-fame-trophies",
    label: "Hall of Fame Trophies",
    effectLabel: "Preview Only - no season trophy logic in this slice",
  }),
]);

export const LOCAL_GAME_SETUP_DRAFT_POOLS = Object.freeze([
  Object.freeze({
    draftPoolId: "default",
    label: "Default",
    effectLabel: "Active static roster snapshot",
  }),
  Object.freeze({
    draftPoolId: "custom",
    label: "Custom",
    effectLabel: "Setup Preview Only - candidate pool unchanged",
  }),
  Object.freeze({
    draftPoolId: "randomized",
    label: "Randomized",
    effectLabel: "Setup Preview Only - no randomness called",
  }),
]);

export const LOCAL_GAME_SETUP_ROSTER_SCARCITY_OPTIONS = Object.freeze([
  Object.freeze({
    rosterScarcityId: "standard",
    label: "Standard",
    effectLabel: "Current draft minimums unchanged",
  }),
  Object.freeze({
    rosterScarcityId: "lean",
    label: "Lean Pool",
    effectLabel: "Preview Only - candidate counts unchanged",
  }),
  Object.freeze({
    rosterScarcityId: "scarce",
    label: "Scarce Market",
    effectLabel: "Preview Only - draft completion unchanged",
  }),
]);

export const LOCAL_GAME_SETUP_BRANDS = Object.freeze([
  Object.freeze({
    brandId: "raw",
    brandLabel: "Raw",
    rivalGmLabel: "Jett Monroe",
  }),
  Object.freeze({
    brandId: "smackdown",
    brandLabel: "SmackDown",
    rivalGmLabel: "Talia Quinn",
  }),
  Object.freeze({
    brandId: "nxt",
    brandLabel: "NXT",
    rivalGmLabel: "Soren Drake",
  }),
  Object.freeze({
    brandId: "aew",
    brandLabel: "AEW",
    rivalGmLabel: "Maya Blaze",
  }),
]);

export function createLocalGameSetupProjection({
  selectedDifficulty = "normal",
  activeBrandCount = 4,
  selectedBrandId = "raw",
  selectedStartingBudgetId,
  selectedWinConditionId = "total-fans",
  selectedDraftPoolId = "default",
  selectedRosterScarcityId = "standard",
  selectedGm,
} = {}) {
  const difficulty = findDifficulty(selectedDifficulty);
  const startingBudget = findStartingBudget(
    selectedStartingBudgetId,
    difficulty
  );
  const winCondition = findWinCondition(selectedWinConditionId);
  const draftPool = findDraftPool(selectedDraftPoolId);
  const rosterScarcity = findRosterScarcity(selectedRosterScarcityId);
  const normalizedActiveBrandCount = normalizeActiveBrandCount(activeBrandCount);
  const selectedBrand = findBrand(selectedBrandId);
  const activeBrands = createActiveBrands({
    activeBrandCount: normalizedActiveBrandCount,
    selectedBrand,
    selectedGm,
  });
  const competingBrands = activeBrands.filter(
    (brand) => brand.brandId !== selectedBrand.brandId
  );

  return Object.freeze({
    projectionKind: "playable-new-gm-mode-local-game-setup-projection",
    version: "0.1",
    localOnly: true,
    persisted: false,
    selectedDifficulty: difficulty.difficultyId,
    selectedStartingBudgetId: startingBudget.budgetId,
    selectedWinConditionId: winCondition.winConditionId,
    selectedDraftPoolId: draftPool.draftPoolId,
    selectedRosterScarcityId: rosterScarcity.rosterScarcityId,
    startingBudgetUnits: startingBudget.startingBudgetUnits,
    activeBrandCount: activeBrands.length,
    selectedBrandId: selectedBrand.brandId,
    activeBrands: Object.freeze(activeBrands),
    competingBrands: Object.freeze(competingBrands),
    capabilityFlags: Object.freeze({
      canRunCpuDraft: false,
      canSimulateOtherBrands: false,
      canPersistSetup: false,
      usesBrowserStorage: false,
    }),
    displayLabels: Object.freeze({
      difficultyLine: difficulty.label,
      difficultyEffectLine: difficulty.gameplaySupported
        ? difficulty.pressureLabel
        : `${difficulty.pressureLabel} - gameplay unchanged`,
      activeBrandsLine: `${activeBrands.length} brands`,
      startingBudgetLine: formatBudgetUnitsAsMoney(
        startingBudget.startingBudgetUnits
      ),
      startingBudgetChoiceLine: `${startingBudget.label} - ${startingBudget.detailLabel}`,
      winConditionLine: winCondition.label,
      winConditionEffectLine: winCondition.effectLabel,
      draftPoolLine: draftPool.label,
      draftPoolEffectLine: draftPool.effectLabel,
      rosterScarcityLine: rosterScarcity.label,
      rosterScarcityEffectLine: rosterScarcity.effectLabel,
      activeBrandLine: activeBrands
        .map((brand) => `${brand.brandLabel}: ${brand.gmLabel}`)
        .join(" | "),
      competingGmLine:
        competingBrands.length > 0
          ? competingBrands
              .map((brand) => `${brand.brandLabel}: ${brand.gmLabel}`)
              .join(" | ")
          : "No rival GM selected",
      setupBoundaryLine:
        "Other brands visible. CPU drafting and other-brand simulation are not active yet.",
    }),
  });
}

export function readLocalGameSetupStartingBudgetUnits(
  selectedDifficulty,
  selectedStartingBudgetId
) {
  return findStartingBudget(
    selectedStartingBudgetId,
    findDifficulty(selectedDifficulty)
  ).startingBudgetUnits;
}

export function createLocalDraftOrderPreviewProjection({
  selectedDifficulty = "normal",
  activeBrandCount = 4,
  selectedBrandId = "raw",
  selectedGm,
  rounds = 2,
} = {}) {
  const setupProjection = createLocalGameSetupProjection({
    selectedDifficulty,
    activeBrandCount,
    selectedBrandId,
    selectedGm,
  });
  const orderedBrands = [
    ...setupProjection.activeBrands.filter((brand) => brand.playerControlled),
    ...setupProjection.activeBrands.filter((brand) => !brand.playerControlled),
  ];
  const roundCount = readPositiveInteger(rounds, 2);
  const rows = [];

  for (let roundIndex = 0; roundIndex < roundCount; roundIndex += 1) {
    orderedBrands.forEach((brand) => {
      const pickNumber = rows.length + 1;
      rows.push(
        Object.freeze({
          pickNumber,
          roundNumber: roundIndex + 1,
          brandId: brand.brandId,
          brandLabel: brand.brandLabel,
          gmLabel: brand.gmLabel,
          playerControlled: brand.playerControlled,
          statusLabel:
            pickNumber === 1
              ? "On Clock"
              : brand.playerControlled
                ? "Next Turn"
                : "Rival Pick Preview",
        })
      );
    });
  }

  return Object.freeze({
    projectionKind: "playable-new-gm-mode-local-draft-order-preview-projection",
    version: "0.1",
    localOnly: true,
    persisted: false,
    setupProjection,
    rows: Object.freeze(rows),
    capabilityFlags: Object.freeze({
      canExecuteRivalPicks: true,
      canRunCpuDraft: false,
      canPersistDraftOrder: false,
    }),
    displayLabels: Object.freeze({
      titleLine: `${setupProjection.activeBrandCount}-brand draft order`,
      noteLine:
        "Rival turns use deterministic draft-night picks without deep CPU strategy.",
    }),
  });
}

function findDifficulty(selectedDifficulty) {
  return (
    LOCAL_GAME_SETUP_DIFFICULTIES.find(
      (difficulty) => difficulty.difficultyId === selectedDifficulty
    ) || LOCAL_GAME_SETUP_DIFFICULTIES[1]
  );
}

function findStartingBudget(selectedStartingBudgetId, difficulty) {
  const explicitBudget = LOCAL_GAME_SETUP_STARTING_BUDGET_OPTIONS.find(
    (budget) => budget.budgetId === selectedStartingBudgetId
  );

  if (explicitBudget) {
    return explicitBudget;
  }

  const supportedDifficultyBudget = LOCAL_GAME_SETUP_STARTING_BUDGET_OPTIONS.find(
    (budget) => budget.startingBudgetUnits === difficulty?.startingBudgetUnits
  );

  return supportedDifficultyBudget || LOCAL_GAME_SETUP_STARTING_BUDGET_OPTIONS[1];
}

function findWinCondition(selectedWinConditionId) {
  return (
    LOCAL_GAME_SETUP_WIN_CONDITIONS.find(
      (winCondition) =>
        winCondition.winConditionId === selectedWinConditionId
    ) || LOCAL_GAME_SETUP_WIN_CONDITIONS[0]
  );
}

function findDraftPool(selectedDraftPoolId) {
  return (
    LOCAL_GAME_SETUP_DRAFT_POOLS.find(
      (draftPool) => draftPool.draftPoolId === selectedDraftPoolId
    ) || LOCAL_GAME_SETUP_DRAFT_POOLS[0]
  );
}

function findRosterScarcity(selectedRosterScarcityId) {
  return (
    LOCAL_GAME_SETUP_ROSTER_SCARCITY_OPTIONS.find(
      (rosterScarcity) =>
        rosterScarcity.rosterScarcityId === selectedRosterScarcityId
    ) || LOCAL_GAME_SETUP_ROSTER_SCARCITY_OPTIONS[0]
  );
}

function findBrand(selectedBrandId) {
  return (
    LOCAL_GAME_SETUP_BRANDS.find((brand) => brand.brandId === selectedBrandId) ||
    LOCAL_GAME_SETUP_BRANDS[0]
  );
}

function normalizeActiveBrandCount(activeBrandCount) {
  const count = Number(activeBrandCount);

  if ([2, 3, 4].includes(count)) {
    return count;
  }

  return 4;
}

function createActiveBrands({ activeBrandCount, selectedBrand, selectedGm }) {
  const initialBrands = LOCAL_GAME_SETUP_BRANDS.slice(0, activeBrandCount);
  const includesSelectedBrand = initialBrands.some(
    (brand) => brand.brandId === selectedBrand.brandId
  );
  const activeBrands = includesSelectedBrand
    ? initialBrands
    : [...initialBrands.slice(0, activeBrandCount - 1), selectedBrand];
  const selectedGmName =
    readString(selectedGm?.displayName) || "Player GM";

  return Object.freeze(
    activeBrands.map((brand) =>
      Object.freeze({
        brandId: brand.brandId,
        brandLabel: brand.brandLabel,
        gmLabel:
          brand.brandId === selectedBrand.brandId
            ? selectedGmName
            : brand.rivalGmLabel,
        playerControlled: brand.brandId === selectedBrand.brandId,
      })
    )
  );
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

function readString(value) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

function readPositiveInteger(value, fallback) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? Math.floor(value)
    : fallback;
}
