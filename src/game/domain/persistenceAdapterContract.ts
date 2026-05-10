import type { SimulationContext } from "../simulation/simulationContext.ts";
import type { EntityId } from "./common.ts";
import type {
  SavePersistenceStatusPlaceholder,
  SaveProgressionContractIssue,
  SaveProgressionContractShell,
  SaveProgressionStatusPlaceholder
} from "./saveProgressionContract.ts";

export type PersistenceAdapterKindPlaceholder =
  | "unassigned"
  | "local-file-placeholder"
  | "indexeddb-placeholder"
  | "sqlite-placeholder"
  | "memory-placeholder";

export type PersistenceAdapterOperationPlaceholder =
  | "save"
  | "load"
  | "list"
  | "delete";

export type PersistenceAdapterReadinessPlaceholder =
  | "not-wired-placeholder"
  | "contract-ready-placeholder"
  | "blocked-placeholder";

export type PersistenceStorageTargetPlaceholder =
  | "unassigned"
  | "local-profile-placeholder"
  | "user-data-placeholder"
  | "test-harness-placeholder";

export type PersistenceAdapterContractIssue =
  | "missing-adapter-contract-id";

export type PersistenceAdapterSaveProgressionReferenceStatus =
  | "missing"
  | "provided";

export interface PersistenceAdapterSaveProgressionReferenceSummary {
  readonly status: "diagnostics-only";
  readonly referenceStatus: PersistenceAdapterSaveProgressionReferenceStatus;
  readonly saveContractId?: EntityId;
  readonly requestedSaveSlotId?: EntityId;
  readonly setupId?: EntityId;
  readonly replayId?: string;
  readonly seedLabel?: string;
  readonly progressionStatus?: SaveProgressionStatusPlaceholder;
  readonly persistenceStatus?: SavePersistenceStatusPlaceholder;
  readonly saveContractStructurallyReady?: boolean;
  readonly saveContractIssues: readonly SaveProgressionContractIssue[];
  readonly gameplayAffecting: false;
  readonly playerFacing: false;
}

export interface PersistenceAdapterContractReadiness {
  readonly status: "diagnostics-only";
  readonly structurallyReady: boolean;
  readonly issues: readonly PersistenceAdapterContractIssue[];
  readonly adapterKind: PersistenceAdapterKindPlaceholder;
  readonly supportedOperations: readonly PersistenceAdapterOperationPlaceholder[];
  readonly persistenceReadiness: PersistenceAdapterReadinessPlaceholder;
  readonly storageTarget: PersistenceStorageTargetPlaceholder;
  readonly saveProgressionReferenceStatus: PersistenceAdapterSaveProgressionReferenceStatus;
  readonly gameplayAffecting: false;
  readonly playerFacing: false;
}

export interface PersistenceAdapterContractShell {
  readonly status: "diagnostics-only";
  readonly adapterContractId: EntityId;
  readonly adapterKind: PersistenceAdapterKindPlaceholder;
  readonly saveSlotId?: EntityId;
  readonly supportedOperations: readonly PersistenceAdapterOperationPlaceholder[];
  readonly persistenceReadiness: PersistenceAdapterReadinessPlaceholder;
  readonly storageTarget: PersistenceStorageTargetPlaceholder;
  readonly replayId?: string;
  readonly seedLabel?: string;
  readonly saveProgressionReference: PersistenceAdapterSaveProgressionReferenceSummary;
  readonly readiness: PersistenceAdapterContractReadiness;
  readonly gameplayAffecting: false;
  readonly playerFacing: false;
}

export interface CreatePersistenceAdapterContractShellOptions {
  readonly adapterContractId?: EntityId;
  readonly adapterKind?: PersistenceAdapterKindPlaceholder;
  readonly saveSlotId?: EntityId;
  readonly supportedOperations?: readonly PersistenceAdapterOperationPlaceholder[];
  readonly persistenceReadiness?: PersistenceAdapterReadinessPlaceholder;
  readonly storageTarget?: PersistenceStorageTargetPlaceholder;
  readonly replayId?: string;
  readonly seedLabel?: string;
  readonly saveProgressionContract?: SaveProgressionContractShell;
  readonly simulationContext?: SimulationContext;
}

export function createPersistenceAdapterContractShell(
  options: CreatePersistenceAdapterContractShellOptions
): PersistenceAdapterContractShell {
  const adapterContractId = options.adapterContractId?.trim() ?? "";
  const adapterKind = options.adapterKind ?? "unassigned";
  const saveSlotId = trimOptionalId(
    options.saveSlotId ?? options.saveProgressionContract?.requestedSaveSlotId
  );
  const supportedOperations = freezeSupportedOperations(options.supportedOperations);
  const persistenceReadiness = options.persistenceReadiness ?? "not-wired-placeholder";
  const storageTarget = options.storageTarget ?? "unassigned";
  const replayId = trimOptionalString(
    options.replayId
      ?? options.simulationContext?.replay.replayId
      ?? options.saveProgressionContract?.replayId
  );
  const seedLabel = trimOptionalString(
    options.seedLabel
      ?? options.simulationContext?.seedLabel
      ?? options.saveProgressionContract?.seedLabel
  );

  return Object.freeze({
    status: "diagnostics-only",
    adapterContractId,
    adapterKind,
    ...(saveSlotId ? { saveSlotId } : {}),
    supportedOperations,
    persistenceReadiness,
    storageTarget,
    ...(replayId ? { replayId } : {}),
    ...(seedLabel ? { seedLabel } : {}),
    saveProgressionReference: createSaveProgressionReferenceSummary(
      options.saveProgressionContract
    ),
    readiness: createPersistenceAdapterContractReadiness({
      adapterContractId,
      adapterKind,
      supportedOperations,
      persistenceReadiness,
      storageTarget,
      saveProgressionContract: options.saveProgressionContract
    }),
    gameplayAffecting: false,
    playerFacing: false
  });
}

function createPersistenceAdapterContractReadiness(options: {
  readonly adapterContractId: EntityId;
  readonly adapterKind: PersistenceAdapterKindPlaceholder;
  readonly supportedOperations: readonly PersistenceAdapterOperationPlaceholder[];
  readonly persistenceReadiness: PersistenceAdapterReadinessPlaceholder;
  readonly storageTarget: PersistenceStorageTargetPlaceholder;
  readonly saveProgressionContract?: SaveProgressionContractShell;
}): PersistenceAdapterContractReadiness {
  const issues: PersistenceAdapterContractIssue[] = [
    ...(options.adapterContractId ? [] : ["missing-adapter-contract-id" as const])
  ];

  return Object.freeze({
    status: "diagnostics-only",
    structurallyReady: issues.length === 0,
    issues: Object.freeze(issues),
    adapterKind: options.adapterKind,
    supportedOperations: options.supportedOperations,
    persistenceReadiness: options.persistenceReadiness,
    storageTarget: options.storageTarget,
    saveProgressionReferenceStatus: options.saveProgressionContract ? "provided" : "missing",
    gameplayAffecting: false,
    playerFacing: false
  });
}

function createSaveProgressionReferenceSummary(
  saveProgressionContract: SaveProgressionContractShell | undefined
): PersistenceAdapterSaveProgressionReferenceSummary {
  return Object.freeze({
    status: "diagnostics-only",
    referenceStatus: saveProgressionContract ? "provided" : "missing",
    ...(saveProgressionContract?.saveContractId
      ? { saveContractId: saveProgressionContract.saveContractId }
      : {}),
    ...(saveProgressionContract?.requestedSaveSlotId
      ? { requestedSaveSlotId: saveProgressionContract.requestedSaveSlotId }
      : {}),
    ...(saveProgressionContract?.setupId ? { setupId: saveProgressionContract.setupId } : {}),
    ...(saveProgressionContract?.replayId ? { replayId: saveProgressionContract.replayId } : {}),
    ...(saveProgressionContract?.seedLabel ? { seedLabel: saveProgressionContract.seedLabel } : {}),
    ...(saveProgressionContract
      ? {
          progressionStatus: saveProgressionContract.progressionStatus,
          persistenceStatus: saveProgressionContract.persistenceStatus,
          saveContractStructurallyReady: saveProgressionContract.readiness.structurallyReady
        }
      : {}),
    saveContractIssues: Object.freeze([...(saveProgressionContract?.readiness.issues ?? [])]),
    gameplayAffecting: false,
    playerFacing: false
  });
}

function freezeSupportedOperations(
  operations: readonly PersistenceAdapterOperationPlaceholder[] = []
): readonly PersistenceAdapterOperationPlaceholder[] {
  return Object.freeze([...operations]);
}

function trimOptionalId(id: EntityId | undefined): EntityId | undefined {
  const trimmed = id?.trim();

  return trimmed ? trimmed : undefined;
}

function trimOptionalString(value: string | undefined): string | undefined {
  const trimmed = value?.trim();

  return trimmed ? trimmed : undefined;
}
