import type { EntityId } from "./common.ts";
import type {
  PersistenceAdapterContractIssue,
  PersistenceAdapterContractShell,
  PersistenceAdapterOperationPlaceholder
} from "./persistenceAdapterContract.ts";
import type {
  SaveProgressionContractIssue,
  SaveProgressionContractShell
} from "./saveProgressionContract.ts";

export type StorageAdapterExpectationReadiness =
  | "missing"
  | "structural-issues"
  | "structurally-ready";

export type StorageAdapterInterfaceExpectationsIssue =
  | "missing-expectations-id";

export type StorageAdapterRequiredCapabilityPlaceholder =
  | "adapter-contract-id"
  | "save-slot-reference"
  | "storage-target"
  | "save-progression-reference"
  | "replay-reference"
  | "seed-reference";

export type StorageAdapterUnsupportedOperationWarning =
  `unsupported-operation:${PersistenceAdapterOperationPlaceholder}`;

export type StorageAdapterMissingCapabilityWarning =
  `missing-capability:${StorageAdapterRequiredCapabilityPlaceholder}`;

export interface StorageAdapterContractReferenceSummary {
  readonly status: "diagnostics-only";
  readonly referenceStatus: "missing" | "provided";
  readonly adapterContractId?: EntityId;
  readonly adapterReadiness: StorageAdapterExpectationReadiness;
  readonly supportedOperations: readonly PersistenceAdapterOperationPlaceholder[];
  readonly adapterIssues: readonly PersistenceAdapterContractIssue[];
  readonly gameplayAffecting: false;
  readonly playerFacing: false;
}

export interface StorageAdapterSaveProgressionReferenceSummary {
  readonly status: "diagnostics-only";
  readonly referenceStatus: "missing" | "provided";
  readonly saveContractId?: EntityId;
  readonly requestedSaveSlotId?: EntityId;
  readonly saveContractStructurallyReady?: boolean;
  readonly saveContractIssues: readonly SaveProgressionContractIssue[];
  readonly gameplayAffecting: false;
  readonly playerFacing: false;
}

export interface StorageAdapterInterfaceExpectationsReadiness {
  readonly status: "diagnostics-only";
  readonly structurallyReady: boolean;
  readonly issues: readonly StorageAdapterInterfaceExpectationsIssue[];
  readonly adapterReadiness: StorageAdapterExpectationReadiness;
  readonly unsupportedOperationWarnings: readonly StorageAdapterUnsupportedOperationWarning[];
  readonly missingCapabilityWarnings: readonly StorageAdapterMissingCapabilityWarning[];
  readonly gameplayAffecting: false;
  readonly playerFacing: false;
}

export interface StorageAdapterInterfaceExpectationsShell {
  readonly status: "diagnostics-only";
  readonly expectationsId: EntityId;
  readonly adapterContractId?: EntityId;
  readonly expectedOperations: readonly PersistenceAdapterOperationPlaceholder[];
  readonly requiredCapabilities: readonly StorageAdapterRequiredCapabilityPlaceholder[];
  readonly unsupportedOperationWarnings: readonly StorageAdapterUnsupportedOperationWarning[];
  readonly missingCapabilityWarnings: readonly StorageAdapterMissingCapabilityWarning[];
  readonly adapterReadiness: StorageAdapterExpectationReadiness;
  readonly adapterReference: StorageAdapterContractReferenceSummary;
  readonly saveProgressionReference: StorageAdapterSaveProgressionReferenceSummary;
  readonly readiness: StorageAdapterInterfaceExpectationsReadiness;
  readonly gameplayAffecting: false;
  readonly playerFacing: false;
}

export interface CreateStorageAdapterInterfaceExpectationsShellOptions {
  readonly expectationsId?: EntityId;
  readonly adapterContract?: PersistenceAdapterContractShell;
  readonly saveProgressionContract?: SaveProgressionContractShell;
  readonly expectedOperations?: readonly PersistenceAdapterOperationPlaceholder[];
  readonly requiredCapabilities?: readonly StorageAdapterRequiredCapabilityPlaceholder[];
}

export function createStorageAdapterInterfaceExpectationsShell(
  options: CreateStorageAdapterInterfaceExpectationsShellOptions
): StorageAdapterInterfaceExpectationsShell {
  const expectationsId = options.expectationsId?.trim() ?? "";
  const expectedOperations = Object.freeze([...(options.expectedOperations ?? [])]);
  const requiredCapabilities = Object.freeze([...(options.requiredCapabilities ?? [])]);
  const unsupportedOperationWarnings = createUnsupportedOperationWarnings(
    expectedOperations,
    options.adapterContract
  );
  const missingCapabilityWarnings = createMissingCapabilityWarnings(
    requiredCapabilities,
    options.adapterContract,
    options.saveProgressionContract
  );
  const adapterReadiness = summarizeAdapterReadiness(options.adapterContract);

  return Object.freeze({
    status: "diagnostics-only",
    expectationsId,
    ...(options.adapterContract?.adapterContractId
      ? { adapterContractId: options.adapterContract.adapterContractId }
      : {}),
    expectedOperations,
    requiredCapabilities,
    unsupportedOperationWarnings,
    missingCapabilityWarnings,
    adapterReadiness,
    adapterReference: createAdapterReferenceSummary(options.adapterContract),
    saveProgressionReference: createSaveProgressionReferenceSummary(
      options.saveProgressionContract
    ),
    readiness: createExpectationsReadiness({
      expectationsId,
      adapterReadiness,
      unsupportedOperationWarnings,
      missingCapabilityWarnings
    }),
    gameplayAffecting: false,
    playerFacing: false
  });
}

function createExpectationsReadiness(options: {
  readonly expectationsId: EntityId;
  readonly adapterReadiness: StorageAdapterExpectationReadiness;
  readonly unsupportedOperationWarnings: readonly StorageAdapterUnsupportedOperationWarning[];
  readonly missingCapabilityWarnings: readonly StorageAdapterMissingCapabilityWarning[];
}): StorageAdapterInterfaceExpectationsReadiness {
  const issues: StorageAdapterInterfaceExpectationsIssue[] = [
    ...(options.expectationsId ? [] : ["missing-expectations-id" as const])
  ];

  return Object.freeze({
    status: "diagnostics-only",
    structurallyReady: issues.length === 0,
    issues: Object.freeze(issues),
    adapterReadiness: options.adapterReadiness,
    unsupportedOperationWarnings: options.unsupportedOperationWarnings,
    missingCapabilityWarnings: options.missingCapabilityWarnings,
    gameplayAffecting: false,
    playerFacing: false
  });
}

function createAdapterReferenceSummary(
  adapterContract: PersistenceAdapterContractShell | undefined
): StorageAdapterContractReferenceSummary {
  return Object.freeze({
    status: "diagnostics-only",
    referenceStatus: adapterContract ? "provided" : "missing",
    ...(adapterContract?.adapterContractId
      ? { adapterContractId: adapterContract.adapterContractId }
      : {}),
    adapterReadiness: summarizeAdapterReadiness(adapterContract),
    supportedOperations: Object.freeze([...(adapterContract?.supportedOperations ?? [])]),
    adapterIssues: Object.freeze([...(adapterContract?.readiness.issues ?? [])]),
    gameplayAffecting: false,
    playerFacing: false
  });
}

function createSaveProgressionReferenceSummary(
  saveProgressionContract: SaveProgressionContractShell | undefined
): StorageAdapterSaveProgressionReferenceSummary {
  return Object.freeze({
    status: "diagnostics-only",
    referenceStatus: saveProgressionContract ? "provided" : "missing",
    ...(saveProgressionContract?.saveContractId
      ? { saveContractId: saveProgressionContract.saveContractId }
      : {}),
    ...(saveProgressionContract?.requestedSaveSlotId
      ? { requestedSaveSlotId: saveProgressionContract.requestedSaveSlotId }
      : {}),
    ...(saveProgressionContract
      ? { saveContractStructurallyReady: saveProgressionContract.readiness.structurallyReady }
      : {}),
    saveContractIssues: Object.freeze([...(saveProgressionContract?.readiness.issues ?? [])]),
    gameplayAffecting: false,
    playerFacing: false
  });
}

function createUnsupportedOperationWarnings(
  expectedOperations: readonly PersistenceAdapterOperationPlaceholder[],
  adapterContract: PersistenceAdapterContractShell | undefined
): readonly StorageAdapterUnsupportedOperationWarning[] {
  const supportedOperations = new Set(adapterContract?.supportedOperations ?? []);

  return Object.freeze(
    expectedOperations
      .filter((operation) => !supportedOperations.has(operation))
      .map((operation) => `unsupported-operation:${operation}` as const)
  );
}

function createMissingCapabilityWarnings(
  requiredCapabilities: readonly StorageAdapterRequiredCapabilityPlaceholder[],
  adapterContract: PersistenceAdapterContractShell | undefined,
  saveProgressionContract: SaveProgressionContractShell | undefined
): readonly StorageAdapterMissingCapabilityWarning[] {
  return Object.freeze(
    requiredCapabilities
      .filter((capability) => !hasCapability(capability, adapterContract, saveProgressionContract))
      .map((capability) => `missing-capability:${capability}` as const)
  );
}

function hasCapability(
  capability: StorageAdapterRequiredCapabilityPlaceholder,
  adapterContract: PersistenceAdapterContractShell | undefined,
  saveProgressionContract: SaveProgressionContractShell | undefined
): boolean {
  switch (capability) {
    case "adapter-contract-id":
      return Boolean(adapterContract?.adapterContractId);
    case "save-slot-reference":
      return Boolean(adapterContract?.saveSlotId ?? saveProgressionContract?.requestedSaveSlotId);
    case "storage-target":
      return Boolean(adapterContract && adapterContract.storageTarget !== "unassigned");
    case "save-progression-reference":
      return Boolean(saveProgressionContract ?? adapterContract?.saveProgressionReference.referenceStatus === "provided");
    case "replay-reference":
      return Boolean(adapterContract?.replayId ?? saveProgressionContract?.replayId);
    case "seed-reference":
      return Boolean(adapterContract?.seedLabel ?? saveProgressionContract?.seedLabel);
  }
}

function summarizeAdapterReadiness(
  adapterContract: PersistenceAdapterContractShell | undefined
): StorageAdapterExpectationReadiness {
  if (!adapterContract) {
    return "missing";
  }

  return adapterContract.readiness.structurallyReady
    ? "structurally-ready"
    : "structural-issues";
}
