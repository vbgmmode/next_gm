import type {
  PlayableNewGMModeSavePayloadContract
} from "./playableNewGMModeSavePayloadContract.ts";

export type PlayableNewGMModeSavePayloadSerializationIssue =
  | "missing-save-payload-contract"
  | "save-payload-contract-not-structurally-ready";

export type PlayableNewGMModeSavePayloadParseIssue =
  | "empty-serialized-payload"
  | "invalid-json"
  | "payload-not-object"
  | "unsupported-format-version"
  | "missing-gameplay-state-model";

export interface PlayableNewGMModeSavePayloadSerializationCapabilityFlags {
  readonly canCreateSerializedPayload: true;
  readonly canParseSerializedPayload: true;
  readonly canWriteDurableSave: false;
  readonly canReadDurableSave: false;
  readonly canUseBrowserStorage: false;
  readonly canUseNetwork: false;
  readonly canCallSimulationEngines: false;
  readonly canUseGeneratedText: false;
  readonly canUseGenAI: false;
}

export interface PlayableNewGMModeSavePayloadSerializedSnapshot {
  readonly status: "serialized-payload-only";
  readonly serializedPayload: string;
  readonly payloadFormatVersion: "0.1.0" | "missing";
  readonly structurallyReady: boolean;
  readonly issues: readonly PlayableNewGMModeSavePayloadSerializationIssue[];
  readonly capabilityFlags: PlayableNewGMModeSavePayloadSerializationCapabilityFlags;
}

export interface PlayableNewGMModeSavePayloadParseResult {
  readonly status: "parsed-payload-only";
  readonly structurallyReady: boolean;
  readonly issues: readonly PlayableNewGMModeSavePayloadParseIssue[];
  readonly payloadFormatVersion: string | "missing";
  readonly gameId?: string;
  readonly selectedBrandName?: string;
  readonly currentWeek?: number;
  readonly capabilityFlags: PlayableNewGMModeSavePayloadSerializationCapabilityFlags;
}

export const PLAYABLE_NEW_GM_MODE_SAVE_PAYLOAD_SERIALIZATION_CAPABILITY_FLAGS:
  PlayableNewGMModeSavePayloadSerializationCapabilityFlags = Object.freeze({
    canCreateSerializedPayload: true,
    canParseSerializedPayload: true,
    canWriteDurableSave: false,
    canReadDurableSave: false,
    canUseBrowserStorage: false,
    canUseNetwork: false,
    canCallSimulationEngines: false,
    canUseGeneratedText: false,
    canUseGenAI: false
  });

export function createPlayableNewGMModeSavePayloadSerializedSnapshot(
  contract: PlayableNewGMModeSavePayloadContract | undefined
): PlayableNewGMModeSavePayloadSerializedSnapshot {
  const issues: PlayableNewGMModeSavePayloadSerializationIssue[] = [
    ...(contract ? [] : ["missing-save-payload-contract" as const]),
    ...(contract && !contract.readiness.structurallyReady
      ? ["save-payload-contract-not-structurally-ready" as const]
      : [])
  ];
  const payloadFormatVersion = contract?.payloadFormatVersion ?? "missing";
  const serializedPayload = contract
    ? stableStringify(contract)
    : "";

  return deepFreeze({
    status: "serialized-payload-only",
    serializedPayload,
    payloadFormatVersion,
    structurallyReady: issues.length === 0,
    issues,
    capabilityFlags: PLAYABLE_NEW_GM_MODE_SAVE_PAYLOAD_SERIALIZATION_CAPABILITY_FLAGS
  });
}

export function parsePlayableNewGMModeSavePayloadSerializedSnapshot(
  serializedPayload: string | undefined
): PlayableNewGMModeSavePayloadParseResult {
  const trimmed = serializedPayload?.trim() ?? "";

  if (!trimmed) {
    return createParseResult({
      issues: ["empty-serialized-payload"],
      payloadFormatVersion: "missing"
    });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return createParseResult({
      issues: ["invalid-json"],
      payloadFormatVersion: "missing"
    });
  }

  if (!isRecord(parsed)) {
    return createParseResult({
      issues: ["payload-not-object"],
      payloadFormatVersion: "missing"
    });
  }

  const payloadFormatVersion = typeof parsed.payloadFormatVersion === "string"
    ? parsed.payloadFormatVersion
    : "missing";
  const gameplayStateModel = isRecord(parsed.gameplayStateModel)
    ? parsed.gameplayStateModel
    : undefined;
  const issues: PlayableNewGMModeSavePayloadParseIssue[] = [
    ...(payloadFormatVersion === "0.1.0"
      ? []
      : ["unsupported-format-version" as const]),
    ...(gameplayStateModel ? [] : ["missing-gameplay-state-model" as const])
  ];
  const gameIdentity = isRecord(gameplayStateModel?.gameIdentity)
    ? gameplayStateModel.gameIdentity
    : undefined;
  const selectedBrand = isRecord(gameplayStateModel?.selectedBrand)
    ? gameplayStateModel.selectedBrand
    : undefined;

  return createParseResult({
    issues,
    payloadFormatVersion,
    gameId: typeof gameIdentity?.gameId === "string"
      ? gameIdentity.gameId
      : undefined,
    selectedBrandName: typeof selectedBrand?.brandName === "string"
      ? selectedBrand.brandName
      : undefined,
    currentWeek: typeof gameplayStateModel?.currentWeek === "number"
      ? gameplayStateModel.currentWeek
      : undefined
  });
}

function createParseResult(options: {
  readonly issues: readonly PlayableNewGMModeSavePayloadParseIssue[];
  readonly payloadFormatVersion: string | "missing";
  readonly gameId?: string;
  readonly selectedBrandName?: string;
  readonly currentWeek?: number;
}): PlayableNewGMModeSavePayloadParseResult {
  return deepFreeze({
    status: "parsed-payload-only",
    structurallyReady: options.issues.length === 0,
    issues: [...options.issues],
    payloadFormatVersion: options.payloadFormatVersion,
    ...(options.gameId ? { gameId: options.gameId } : {}),
    ...(options.selectedBrandName ? { selectedBrandName: options.selectedBrandName } : {}),
    ...(Number.isInteger(options.currentWeek)
      ? { currentWeek: options.currentWeek }
      : {}),
    capabilityFlags: PLAYABLE_NEW_GM_MODE_SAVE_PAYLOAD_SERIALIZATION_CAPABILITY_FLAGS
  });
}

function stableStringify(value: unknown): string {
  return JSON.stringify(sortRecursively(value));
}

function sortRecursively(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sortRecursively(item));
  }

  if (!isRecord(value)) {
    return value;
  }

  return Object.keys(value)
    .sort()
    .reduce<Record<string, unknown>>((record, key) => {
      record[key] = sortRecursively(value[key]);
      return record;
    }, {});
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
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
