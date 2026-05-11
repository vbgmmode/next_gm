import type { EntityId } from "./common.ts";

export type PlayableNewGMModeGameplayStateModelSection =
  | "gameIdentity"
  | "selectedBrand"
  | "currentWeek"
  | "budget"
  | "signedRoster"
  | "champions"
  | "rivalries"
  | "weeklyShowCards"
  | "showResults"
  | "superstarCurrentState"
  | "rosterMomentum"
  | "morale"
  | "fatigue"
  | "injuryRisk"
  | "popularity"
  | "rivalryHeat"
  | "championTitleState"
  | "financeFanSummaries"
  | "weekHistory";

export type PlayableNewGMModeGameplayStateModelIssue =
  | "missing-game-id"
  | "missing-selected-brand-id"
  | "missing-selected-brand-name"
  | "invalid-current-week";

export interface PlayableNewGMModeGameplayStateModelIdentity {
  readonly gameId: EntityId;
  readonly gameLabel?: string;
}

export interface PlayableNewGMModeGameplayStateModelBrand {
  readonly brandId: EntityId;
  readonly brandName: string;
}

export interface PlayableNewGMModeGameplayStateModelBudget {
  readonly startingBudget: number;
  readonly spentBudget: number;
  readonly remainingBudget: number;
  readonly bookingReserveTarget: number;
}

export interface PlayableNewGMModeGameplayStateModelSignedTalent {
  readonly wrestlerId: EntityId;
  readonly displayName: string;
  readonly signedBrandId: EntityId;
  readonly signedBrandName: string;
  readonly draftedFrom?: string;
  readonly sourcePool?: string;
  readonly signingCost?: number;
  readonly signingTier?: string;
}

export interface PlayableNewGMModeGameplayStateModelChampion {
  readonly titleSlotId: EntityId;
  readonly titleName: string;
  readonly championWrestlerIds: readonly EntityId[];
}

export interface PlayableNewGMModeGameplayStateModelRivalry {
  readonly rivalryId: EntityId;
  readonly wrestlerAId: EntityId;
  readonly wrestlerBId: EntityId;
  readonly rivalryType: string;
  readonly intensity: string;
  readonly heatLabel?: string;
}

export interface PlayableNewGMModeGameplayStateModelWeeklyShowCard {
  readonly weekNumber: number;
  readonly cardId: EntityId;
  readonly segments: readonly Record<string, unknown>[];
}

export interface PlayableNewGMModeGameplayStateModelShowResult {
  readonly weekNumber: number;
  readonly resultId: EntityId;
  readonly showGrade: string;
  readonly bestSegmentLabel?: string;
  readonly crowdReadLabel?: string;
  readonly weakSegmentLabel?: string;
  readonly championSpotlightLabel?: string;
  readonly rivalrySpotlightLabel?: string;
  readonly momentumLabel?: string;
  readonly fanResponseLabel?: string;
  readonly socialBuzzLabel?: string;
  readonly budgetLabel?: string;
  readonly cardReadinessLabel?: string;
  readonly segmentResults?: readonly Record<string, unknown>[];
}

export interface PlayableNewGMModeGameplayStateModelSuperstarState {
  readonly wrestlerId: EntityId;
  readonly momentum: string;
  readonly morale: string;
  readonly fatigue: string;
  readonly injuryRisk: string;
  readonly popularity: string;
}

export interface PlayableNewGMModeGameplayStateModelChampionTitleState {
  readonly titleSlotId: EntityId;
  readonly titleName: string;
  readonly championWrestlerIds: readonly EntityId[];
  readonly titleStatus: string;
}

export interface PlayableNewGMModeGameplayStateModelFinanceFanSummary {
  readonly weekNumber: number;
  readonly financeLabel: string;
  readonly fanResponseLabel: string;
}

export interface PlayableNewGMModeGameplayStateModelWeekHistoryEntry {
  readonly weekNumber: number;
  readonly summaryLabel: string;
}

export interface PlayableNewGMModeGameplayStateModelCapabilityFlags {
  readonly canPersistGameplayState: false;
  readonly canWriteDurableStorage: false;
  readonly canUseBrowserStorage: false;
  readonly canUseNetwork: false;
  readonly canUseGeneratedText: false;
  readonly canUseGenAI: false;
  readonly canCallSimulationEngines: false;
}

export interface PlayableNewGMModeGameplayStateModelReadiness {
  readonly status: "state-model-only";
  readonly structurallyReady: boolean;
  readonly issues: readonly PlayableNewGMModeGameplayStateModelIssue[];
  readonly modeledSections: readonly PlayableNewGMModeGameplayStateModelSection[];
  readonly missingSections: readonly PlayableNewGMModeGameplayStateModelSection[];
}

export interface PlayableNewGMModeGameplayStateModel {
  readonly modelId: "playable-new-gm-mode-gameplay-state-model-v0.1";
  readonly modelVersion: "0.1.0";
  readonly status: "state-model-only";
  readonly localOnly: true;
  readonly reloadResetExpected: true;
  readonly gameIdentity: PlayableNewGMModeGameplayStateModelIdentity;
  readonly selectedBrand: PlayableNewGMModeGameplayStateModelBrand;
  readonly currentWeek: number;
  readonly budget: PlayableNewGMModeGameplayStateModelBudget;
  readonly signedRoster: readonly PlayableNewGMModeGameplayStateModelSignedTalent[];
  readonly champions: readonly PlayableNewGMModeGameplayStateModelChampion[];
  readonly rivalries: readonly PlayableNewGMModeGameplayStateModelRivalry[];
  readonly weeklyShowCards: readonly PlayableNewGMModeGameplayStateModelWeeklyShowCard[];
  readonly showResults: readonly PlayableNewGMModeGameplayStateModelShowResult[];
  readonly superstarCurrentState: readonly PlayableNewGMModeGameplayStateModelSuperstarState[];
  readonly rosterMomentum: readonly Record<string, unknown>[];
  readonly morale: readonly Record<string, unknown>[];
  readonly fatigue: readonly Record<string, unknown>[];
  readonly injuryRisk: readonly Record<string, unknown>[];
  readonly popularity: readonly Record<string, unknown>[];
  readonly rivalryHeat: readonly Record<string, unknown>[];
  readonly championTitleState: readonly PlayableNewGMModeGameplayStateModelChampionTitleState[];
  readonly financeFanSummaries: readonly PlayableNewGMModeGameplayStateModelFinanceFanSummary[];
  readonly weekHistory: readonly PlayableNewGMModeGameplayStateModelWeekHistoryEntry[];
  readonly capabilityFlags: PlayableNewGMModeGameplayStateModelCapabilityFlags;
  readonly readiness: PlayableNewGMModeGameplayStateModelReadiness;
}

export interface CreatePlayableNewGMModeGameplayStateModelOptions {
  readonly gameId?: EntityId;
  readonly gameLabel?: string;
  readonly selectedBrandId?: EntityId;
  readonly selectedBrandName?: string;
  readonly currentWeek?: number;
  readonly budget?: Partial<PlayableNewGMModeGameplayStateModelBudget>;
  readonly signedRoster?: readonly PlayableNewGMModeGameplayStateModelSignedTalent[];
  readonly champions?: readonly PlayableNewGMModeGameplayStateModelChampion[];
  readonly rivalries?: readonly PlayableNewGMModeGameplayStateModelRivalry[];
  readonly weeklyShowCards?: readonly PlayableNewGMModeGameplayStateModelWeeklyShowCard[];
  readonly showResults?: readonly PlayableNewGMModeGameplayStateModelShowResult[];
  readonly superstarCurrentState?: readonly PlayableNewGMModeGameplayStateModelSuperstarState[];
  readonly rosterMomentum?: readonly Record<string, unknown>[];
  readonly morale?: readonly Record<string, unknown>[];
  readonly fatigue?: readonly Record<string, unknown>[];
  readonly injuryRisk?: readonly Record<string, unknown>[];
  readonly popularity?: readonly Record<string, unknown>[];
  readonly rivalryHeat?: readonly Record<string, unknown>[];
  readonly championTitleState?: readonly PlayableNewGMModeGameplayStateModelChampionTitleState[];
  readonly financeFanSummaries?: readonly PlayableNewGMModeGameplayStateModelFinanceFanSummary[];
  readonly weekHistory?: readonly PlayableNewGMModeGameplayStateModelWeekHistoryEntry[];
}

const MODELED_SECTIONS: readonly PlayableNewGMModeGameplayStateModelSection[] =
  Object.freeze([
    "gameIdentity",
    "selectedBrand",
    "currentWeek",
    "budget",
    "signedRoster",
    "champions",
    "rivalries",
    "weeklyShowCards",
    "showResults",
    "superstarCurrentState",
    "rosterMomentum",
    "morale",
    "fatigue",
    "injuryRisk",
    "popularity",
    "rivalryHeat",
    "championTitleState",
    "financeFanSummaries",
    "weekHistory"
  ]);

export const PLAYABLE_NEW_GM_MODE_GAMEPLAY_STATE_MODEL_CAPABILITY_FLAGS:
  PlayableNewGMModeGameplayStateModelCapabilityFlags = Object.freeze({
    canPersistGameplayState: false,
    canWriteDurableStorage: false,
    canUseBrowserStorage: false,
    canUseNetwork: false,
    canUseGeneratedText: false,
    canUseGenAI: false,
    canCallSimulationEngines: false
  });

export function createPlayableNewGMModeGameplayStateModel(
  options: CreatePlayableNewGMModeGameplayStateModelOptions = {}
): PlayableNewGMModeGameplayStateModel {
  const gameId = trimOptional(options.gameId) ?? "";
  const selectedBrandId = trimOptional(options.selectedBrandId) ?? "";
  const selectedBrandName = trimOptional(options.selectedBrandName) ?? "";
  const currentWeek = Number.isInteger(options.currentWeek)
    ? Number(options.currentWeek)
    : 1;
  const budget = createBudget(options.budget);
  const readiness = createReadiness({
    gameId,
    selectedBrandId,
    selectedBrandName,
    currentWeek
  });

  return deepFreeze({
    modelId: "playable-new-gm-mode-gameplay-state-model-v0.1",
    modelVersion: "0.1.0",
    status: "state-model-only",
    localOnly: true,
    reloadResetExpected: true,
    gameIdentity: {
      gameId,
      ...(trimOptional(options.gameLabel)
        ? { gameLabel: trimOptional(options.gameLabel) }
        : {})
    },
    selectedBrand: {
      brandId: selectedBrandId,
      brandName: selectedBrandName
    },
    currentWeek,
    budget,
    signedRoster: normalizeSignedRoster(
      options.signedRoster,
      selectedBrandId,
      selectedBrandName
    ),
    champions: normalizeRecords(options.champions),
    rivalries: normalizeRecords(options.rivalries),
    weeklyShowCards: normalizeRecords(options.weeklyShowCards),
    showResults: normalizeRecords(options.showResults),
    superstarCurrentState: normalizeRecords(options.superstarCurrentState),
    rosterMomentum: normalizeRecords(options.rosterMomentum),
    morale: normalizeRecords(options.morale),
    fatigue: normalizeRecords(options.fatigue),
    injuryRisk: normalizeRecords(options.injuryRisk),
    popularity: normalizeRecords(options.popularity),
    rivalryHeat: normalizeRecords(options.rivalryHeat),
    championTitleState: normalizeRecords(options.championTitleState),
    financeFanSummaries: normalizeRecords(options.financeFanSummaries),
    weekHistory: normalizeRecords(options.weekHistory),
    capabilityFlags: PLAYABLE_NEW_GM_MODE_GAMEPLAY_STATE_MODEL_CAPABILITY_FLAGS,
    readiness
  });
}

function createBudget(
  budget: Partial<PlayableNewGMModeGameplayStateModelBudget> | undefined
): PlayableNewGMModeGameplayStateModelBudget {
  return {
    startingBudget: normalizeNumber(budget?.startingBudget),
    spentBudget: normalizeNumber(budget?.spentBudget),
    remainingBudget: normalizeNumber(budget?.remainingBudget),
    bookingReserveTarget: normalizeNumber(budget?.bookingReserveTarget)
  };
}

function normalizeSignedRoster(
  signedRoster: readonly PlayableNewGMModeGameplayStateModelSignedTalent[] | undefined,
  selectedBrandId: EntityId,
  selectedBrandName: string
): readonly PlayableNewGMModeGameplayStateModelSignedTalent[] {
  return normalizeRecords(signedRoster).map((talent) => ({
    ...talent,
    signedBrandId: selectedBrandId || trimOptional(talent.signedBrandId) || "",
    signedBrandName: selectedBrandName || trimOptional(talent.signedBrandName) || ""
  }));
}

function createReadiness(options: {
  readonly gameId: EntityId;
  readonly selectedBrandId: EntityId;
  readonly selectedBrandName: string;
  readonly currentWeek: number;
}): PlayableNewGMModeGameplayStateModelReadiness {
  const issues: PlayableNewGMModeGameplayStateModelIssue[] = [
    ...(options.gameId ? [] : ["missing-game-id" as const]),
    ...(options.selectedBrandId ? [] : ["missing-selected-brand-id" as const]),
    ...(options.selectedBrandName ? [] : ["missing-selected-brand-name" as const]),
    ...(options.currentWeek >= 1 ? [] : ["invalid-current-week" as const])
  ];

  return {
    status: "state-model-only",
    structurallyReady: issues.length === 0,
    issues,
    modeledSections: MODELED_SECTIONS,
    missingSections: []
  };
}

function normalizeRecords<T extends Record<string, unknown>>(
  records: readonly T[] | undefined
): readonly T[] {
  return (records ?? []).map((record) => ({ ...record }));
}

function normalizeNumber(value: number | undefined): number {
  return Number.isFinite(value) ? Number(value) : 0;
}

function trimOptional(value: string | undefined): string | undefined {
  const trimmed = value?.trim();

  return trimmed ? trimmed : undefined;
}

function deepFreeze<T>(value: T): T {
  if (!value || typeof value !== "object") {
    return value;
  }

  for (const propertyValue of Object.values(value)) {
    deepFreeze(propertyValue);
  }

  return Object.freeze(value);
}
