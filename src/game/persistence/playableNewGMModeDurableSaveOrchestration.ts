import {
  createPlayableNewGMModeSavePayloadContract
} from "../domain/playableNewGMModeSavePayloadContract.ts";
import {
  createPlayableNewGMModeSavePayloadSerializedSnapshot
} from "../domain/playableNewGMModeSavePayloadSerialization.ts";
import type {
  PlayableNewGMModeGameplayStateModel
} from "../domain/playableNewGMModeGameplayStateModel.ts";
import {
  createSQLiteDurableSavePayloadRepositoryReadShell,
  createSQLiteDurableSavePayloadRepositoryWriteShell,
  type SQLiteDurableSavePayloadRepositoryReadStatus,
  type SQLiteDurableSavePayloadRepositoryWriteStatus
} from "./sqliteDurableSavePayloadRepositoryShell.ts";
import type {
  SQLiteSaveIdentityInsertRequest
} from "./sqliteSaveIdentityInsertShell.ts";

export type PlayableNewGMModeDurableNewSaveSlotStatus =
  | "blocked"
  | "failed"
  | "saved";

export type PlayableNewGMModeContinueSaveStatus =
  | "blocked"
  | "failed"
  | "loaded"
  | "not-found";

export type PlayableNewGMModeDurableNewSaveSlotIssue =
  | "missing-gameplay-state-model"
  | "gameplay-state-model-not-ready"
  | "save-payload-contract-not-ready"
  | "save-payload-serialization-not-ready"
  | "durable-payload-write-not-ready";

export type PlayableNewGMModeContinueSaveIssue =
  | "missing-save-id"
  | "durable-payload-read-not-ready"
  | "durable-payload-not-found";

export interface PlayableNewGMModeDurableNewSaveSlotShell {
  readonly status: "playable-save-orchestration";
  readonly newSaveSlotAttempted: boolean;
  readonly requestedSaveId: string;
  readonly selectedBrandName: string;
  readonly currentWeek: number | "not-checked";
  readonly payloadContractReady: boolean | "not-checked";
  readonly payloadSerialized: boolean | "not-checked";
  readonly durableWriteStatus: SQLiteDurableSavePayloadRepositoryWriteStatus | "not-attempted";
  readonly executionStatus: PlayableNewGMModeDurableNewSaveSlotStatus;
  readonly durableSaveAvailable: boolean;
  readonly browserStorageUsed: false;
  readonly networkUsed: false;
  readonly generatedTextCreated: false;
  readonly genAIUsed: false;
  readonly simulationEnginesCalled: false;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly issues: readonly PlayableNewGMModeDurableNewSaveSlotIssue[];
}

export interface PlayableNewGMModeContinueSaveShell {
  readonly status: "playable-save-orchestration";
  readonly continueSaveAttempted: boolean;
  readonly requestedSaveId: string;
  readonly gameId: string;
  readonly selectedBrandName: string;
  readonly currentWeek: number | "not-checked";
  readonly durableReadStatus: SQLiteDurableSavePayloadRepositoryReadStatus | "not-attempted";
  readonly executionStatus: PlayableNewGMModeContinueSaveStatus;
  readonly durableSaveLoaded: boolean;
  readonly browserStorageUsed: false;
  readonly networkUsed: false;
  readonly generatedTextCreated: false;
  readonly genAIUsed: false;
  readonly simulationEnginesCalled: false;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly issues: readonly PlayableNewGMModeContinueSaveIssue[];
}

export interface CreatePlayableNewGMModeDurableNewSaveSlotShellOptions {
  readonly requestedDatabasePath?: string;
  readonly request?: SQLiteSaveIdentityInsertRequest;
  readonly gameplayStateModel?: PlayableNewGMModeGameplayStateModel;
}

export interface CreatePlayableNewGMModeContinueSaveShellOptions {
  readonly requestedDatabasePath?: string;
  readonly requestedSaveId?: string;
}

export function createPlayableNewGMModeDurableNewSaveSlotShell(
  options: CreatePlayableNewGMModeDurableNewSaveSlotShellOptions
): PlayableNewGMModeDurableNewSaveSlotShell {
  const requestedSaveId = normalizeString(options.request?.saveId);
  const gameplayStateModel = options.gameplayStateModel;
  const preflightIssues = createNewSavePreflightIssues(gameplayStateModel);

  if (preflightIssues.length > 0) {
    return createNewSaveShell({
      newSaveSlotAttempted: false,
      requestedSaveId,
      selectedBrandName: gameplayStateModel?.selectedBrand.brandName ?? "",
      currentWeek: gameplayStateModel?.currentWeek ?? "not-checked",
      payloadContractReady: "not-checked",
      payloadSerialized: "not-checked",
      durableWriteStatus: "not-attempted",
      executionStatus: "blocked",
      durableSaveAvailable: false,
      issues: preflightIssues
    });
  }

  const payloadContract = createPlayableNewGMModeSavePayloadContract({
    savePayloadContractId: `${requestedSaveId}:payload-contract`,
    gameplayStateModel,
    createdAtLabel: options.request?.createdAt
  });
  const serializedSnapshot =
    createPlayableNewGMModeSavePayloadSerializedSnapshot(payloadContract);
  const contractIssues: PlayableNewGMModeDurableNewSaveSlotIssue[] = [
    ...(payloadContract.readiness.structurallyReady
      ? []
      : ["save-payload-contract-not-ready" as const]),
    ...(serializedSnapshot.structurallyReady
      ? []
      : ["save-payload-serialization-not-ready" as const])
  ];

  if (contractIssues.length > 0) {
    return createNewSaveShell({
      newSaveSlotAttempted: false,
      requestedSaveId,
      selectedBrandName: gameplayStateModel!.selectedBrand.brandName,
      currentWeek: gameplayStateModel!.currentWeek,
      payloadContractReady: payloadContract.readiness.structurallyReady,
      payloadSerialized: serializedSnapshot.structurallyReady,
      durableWriteStatus: "not-attempted",
      executionStatus: "blocked",
      durableSaveAvailable: false,
      issues: contractIssues
    });
  }

  const writeResult = createSQLiteDurableSavePayloadRepositoryWriteShell({
    requestedDatabasePath: options.requestedDatabasePath,
    request: options.request,
    serializedSnapshot
  });
  const writeReady = writeResult.executionStatus === "written";

  return createNewSaveShell({
    newSaveSlotAttempted: true,
    requestedSaveId,
    selectedBrandName: gameplayStateModel!.selectedBrand.brandName,
    currentWeek: gameplayStateModel!.currentWeek,
    payloadContractReady: payloadContract.readiness.structurallyReady,
    payloadSerialized: serializedSnapshot.structurallyReady,
    durableWriteStatus: writeResult.executionStatus,
    executionStatus: writeReady ? "saved" : "failed",
    durableSaveAvailable: writeReady,
    issues: writeReady ? [] : ["durable-payload-write-not-ready"]
  });
}

export function createPlayableNewGMModeContinueSaveShell(
  options: CreatePlayableNewGMModeContinueSaveShellOptions
): PlayableNewGMModeContinueSaveShell {
  const requestedSaveId = normalizeString(options.requestedSaveId);

  if (!requestedSaveId) {
    return createContinueSaveShell({
      continueSaveAttempted: false,
      requestedSaveId,
      gameId: "",
      selectedBrandName: "",
      currentWeek: "not-checked",
      durableReadStatus: "not-attempted",
      executionStatus: "blocked",
      durableSaveLoaded: false,
      issues: ["missing-save-id"]
    });
  }

  const readResult = createSQLiteDurableSavePayloadRepositoryReadShell({
    requestedDatabasePath: options.requestedDatabasePath,
    requestedSaveId
  });
  const issues = createContinueSaveIssues(readResult.executionStatus);

  return createContinueSaveShell({
    continueSaveAttempted: true,
    requestedSaveId,
    gameId: readResult.gameId,
    selectedBrandName: readResult.selectedBrandName,
    currentWeek: readResult.currentWeek,
    durableReadStatus: readResult.executionStatus,
    executionStatus: createContinueSaveStatus(readResult.executionStatus),
    durableSaveLoaded: readResult.executionStatus === "read",
    issues
  });
}

function createNewSavePreflightIssues(
  gameplayStateModel: PlayableNewGMModeGameplayStateModel | undefined
): readonly PlayableNewGMModeDurableNewSaveSlotIssue[] {
  return Object.freeze([
    ...(gameplayStateModel ? [] : ["missing-gameplay-state-model" as const]),
    ...(gameplayStateModel?.readiness.structurallyReady === false
      ? ["gameplay-state-model-not-ready" as const]
      : [])
  ]);
}

function createContinueSaveIssues(
  readStatus: SQLiteDurableSavePayloadRepositoryReadStatus
): readonly PlayableNewGMModeContinueSaveIssue[] {
  if (readStatus === "read") {
    return Object.freeze([]);
  }

  if (readStatus === "payload-not-found") {
    return Object.freeze(["durable-payload-not-found"]);
  }

  return Object.freeze(["durable-payload-read-not-ready"]);
}

function createContinueSaveStatus(
  readStatus: SQLiteDurableSavePayloadRepositoryReadStatus
): PlayableNewGMModeContinueSaveStatus {
  if (readStatus === "read") {
    return "loaded";
  }

  if (readStatus === "payload-not-found") {
    return "not-found";
  }

  return readStatus === "blocked" ? "blocked" : "failed";
}

function createNewSaveShell(
  options: Omit<
    PlayableNewGMModeDurableNewSaveSlotShell,
    | "status"
    | "browserStorageUsed"
    | "networkUsed"
    | "generatedTextCreated"
    | "genAIUsed"
    | "simulationEnginesCalled"
    | "playerFacing"
    | "gameplayAffecting"
  >
): PlayableNewGMModeDurableNewSaveSlotShell {
  return Object.freeze({
    status: "playable-save-orchestration",
    ...options,
    browserStorageUsed: false,
    networkUsed: false,
    generatedTextCreated: false,
    genAIUsed: false,
    simulationEnginesCalled: false,
    playerFacing: false,
    gameplayAffecting: false
  });
}

function createContinueSaveShell(
  options: Omit<
    PlayableNewGMModeContinueSaveShell,
    | "status"
    | "browserStorageUsed"
    | "networkUsed"
    | "generatedTextCreated"
    | "genAIUsed"
    | "simulationEnginesCalled"
    | "playerFacing"
    | "gameplayAffecting"
  >
): PlayableNewGMModeContinueSaveShell {
  return Object.freeze({
    status: "playable-save-orchestration",
    ...options,
    browserStorageUsed: false,
    networkUsed: false,
    generatedTextCreated: false,
    genAIUsed: false,
    simulationEnginesCalled: false,
    playerFacing: false,
    gameplayAffecting: false
  });
}

function normalizeString(value: string | undefined): string {
  return value?.trim() ?? "";
}
