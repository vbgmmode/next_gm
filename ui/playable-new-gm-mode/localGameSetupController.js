import {
  NEW_GM_MODE_DRAFT_FINANCE_STARTING_BUDGET_PLACEHOLDER,
} from "../../src/game/domain/index.ts";

export const LOCAL_GAME_SETUP_DIFFICULTIES = Object.freeze([
  Object.freeze({
    difficultyId: "easy",
    label: "Easy",
    pressureLabel: "Relaxed owner pressure",
  }),
  Object.freeze({
    difficultyId: "normal",
    label: "Normal",
    pressureLabel: "Balanced owner pressure",
  }),
  Object.freeze({
    difficultyId: "hard",
    label: "Hard",
    pressureLabel: "Tight owner pressure",
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
  selectedGm,
} = {}) {
  const difficulty = findDifficulty(selectedDifficulty);
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
      activeBrandsLine: `${activeBrands.length} brands`,
      startingBudgetLine: formatBudgetUnitsAsMoney(
        NEW_GM_MODE_DRAFT_FINANCE_STARTING_BUDGET_PLACEHOLDER
      ),
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

function findDifficulty(selectedDifficulty) {
  return (
    LOCAL_GAME_SETUP_DIFFICULTIES.find(
      (difficulty) => difficulty.difficultyId === selectedDifficulty
    ) || LOCAL_GAME_SETUP_DIFFICULTIES[1]
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
