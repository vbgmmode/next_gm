import type { EntityId } from "./common.ts";
import type {
  PlayableNewGMModeGameplayStateModel,
  PlayableNewGMModeGameplayStateModelSection
} from "./playableNewGMModeGameplayStateModel.ts";

export type PlayableNewGMModeSavePayloadContractIssue =
  | "missing-save-payload-contract-id"
  | "missing-gameplay-state-model"
  | "gameplay-state-model-not-structurally-ready";

export type PlayableNewGMModeSavePayloadSection =
  | "payloadMetadata"
  | "compatibility"
  | PlayableNewGMModeGameplayStateModelSection;

export interface PlayableNewGMModeSavePayloadCompatibility {
  readonly formatVersion: "0.1.0";
  readonly minimumSupportedFormatVersion: "0.1.0";
  readonly gameplayStateModelVersion: "0.1.0" | "missing";
}

export interface PlayableNewGMModeSavePayloadContractCapabilityFlags {
  readonly canDescribeSavePayload: true;
  readonly canSerializeForDurableSave: false;
  readonly canWriteDurableSave: false;
  readonly canReadDurableSave: false;
  readonly canListDurableSaves: false;
  readonly canDeleteDurableSaves: false;
  readonly canUseBrowserStorage: false;
  readonly canUseNetwork: false;
  readonly canUseGeneratedText: false;
  readonly canUseGenAI: false;
  readonly canCallSimulationEngines: false;
}

export interface PlayableNewGMModeSavePayloadContractReadiness {
  readonly status: "payload-contract-only";
  readonly structurallyReady: boolean;
  readonly issues: readonly PlayableNewGMModeSavePayloadContractIssue[];
  readonly modeledPayloadSections: readonly PlayableNewGMModeSavePayloadSection[];
}

export interface PlayableNewGMModeSavePayloadContract {
  readonly status: "payload-contract-only";
  readonly savePayloadContractId: EntityId;
  readonly payloadFormatVersion: "0.1.0";
  readonly localOnly: true;
  readonly persisted: false;
  readonly payloadMetadata: {
    readonly createdAtLabel: string;
    readonly source: "playable-new-gm-mode-local-session";
  };
  readonly compatibility: PlayableNewGMModeSavePayloadCompatibility;
  readonly gameplayStateModel?: PlayableNewGMModeGameplayStateModel;
  readonly readiness: PlayableNewGMModeSavePayloadContractReadiness;
  readonly capabilityFlags: PlayableNewGMModeSavePayloadContractCapabilityFlags;
}

export interface CreatePlayableNewGMModeSavePayloadContractOptions {
  readonly savePayloadContractId?: EntityId;
  readonly gameplayStateModel?: PlayableNewGMModeGameplayStateModel;
  readonly createdAtLabel?: string;
}

const MODELED_PAYLOAD_SECTIONS: readonly PlayableNewGMModeSavePayloadSection[] =
  Object.freeze([
    "payloadMetadata",
    "compatibility",
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

export const PLAYABLE_NEW_GM_MODE_SAVE_PAYLOAD_CONTRACT_CAPABILITY_FLAGS:
  PlayableNewGMModeSavePayloadContractCapabilityFlags = Object.freeze({
    canDescribeSavePayload: true,
    canSerializeForDurableSave: false,
    canWriteDurableSave: false,
    canReadDurableSave: false,
    canListDurableSaves: false,
    canDeleteDurableSaves: false,
    canUseBrowserStorage: false,
    canUseNetwork: false,
    canUseGeneratedText: false,
    canUseGenAI: false,
    canCallSimulationEngines: false
  });

export function createPlayableNewGMModeSavePayloadContract(
  options: CreatePlayableNewGMModeSavePayloadContractOptions = {}
): PlayableNewGMModeSavePayloadContract {
  const savePayloadContractId = trimOptional(options.savePayloadContractId) ?? "";
  const gameplayStateModel = options.gameplayStateModel;
  const readiness = createReadiness({
    savePayloadContractId,
    gameplayStateModel
  });

  return deepFreeze({
    status: "payload-contract-only",
    savePayloadContractId,
    payloadFormatVersion: "0.1.0",
    localOnly: true,
    persisted: false,
    payloadMetadata: {
      createdAtLabel: trimOptional(options.createdAtLabel) ?? "not-persisted",
      source: "playable-new-gm-mode-local-session"
    },
    compatibility: {
      formatVersion: "0.1.0",
      minimumSupportedFormatVersion: "0.1.0",
      gameplayStateModelVersion: gameplayStateModel?.modelVersion ?? "missing"
    },
    ...(gameplayStateModel ? { gameplayStateModel } : {}),
    readiness,
    capabilityFlags: PLAYABLE_NEW_GM_MODE_SAVE_PAYLOAD_CONTRACT_CAPABILITY_FLAGS
  });
}

function createReadiness(options: {
  readonly savePayloadContractId: EntityId;
  readonly gameplayStateModel?: PlayableNewGMModeGameplayStateModel;
}): PlayableNewGMModeSavePayloadContractReadiness {
  const issues: PlayableNewGMModeSavePayloadContractIssue[] = [
    ...(options.savePayloadContractId
      ? []
      : ["missing-save-payload-contract-id" as const]),
    ...(options.gameplayStateModel
      ? []
      : ["missing-gameplay-state-model" as const]),
    ...(options.gameplayStateModel?.readiness.structurallyReady === false
      ? ["gameplay-state-model-not-structurally-ready" as const]
      : [])
  ];

  return {
    status: "payload-contract-only",
    structurallyReady: issues.length === 0,
    issues,
    modeledPayloadSections: MODELED_PAYLOAD_SECTIONS
  };
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
