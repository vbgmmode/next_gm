import type { EntityId } from "./common.ts";
import type {
  PersistenceAdapterContractIssue,
  PersistenceAdapterContractShell,
  PersistenceStorageTargetPlaceholder
} from "./persistenceAdapterContract.ts";
import type {
  SavePersistenceStatusPlaceholder,
  SaveProgressionContractIssue,
  SaveProgressionContractShell,
  SaveProgressionStartRequestReferenceStatus,
  SaveProgressionStatusPlaceholder
} from "./saveProgressionContract.ts";
import type {
  StorageAdapterExpectationReadiness,
  StorageAdapterInterfaceExpectationsIssue,
  StorageAdapterInterfaceExpectationsShell,
  StorageAdapterMissingCapabilityWarning,
  StorageAdapterUnsupportedOperationWarning
} from "./storageAdapterInterfaceExpectations.ts";

export type SaveDataShapeReadiness =
  | "structural-issues"
  | "structurally-ready";

export type SaveDataShapeExpectationsIssue =
  | "missing-save-shape-expectations-id";

export type SaveDataShapeSectionPlaceholder =
  | "identity"
  | "replay"
  | "progression"
  | "setup"
  | "adapter"
  | "metadata";

export type SaveDataShapeIdentityFieldPlaceholder =
  | "saveContractId"
  | "saveSlotId"
  | "setupId"
  | "selectedBrandId"
  | "playerManagerId"
  | "adapterContractId";

export type SaveDataShapeReplayFieldPlaceholder =
  | "replayId"
  | "seedLabel";

export type SaveDataShapeProgressionFieldPlaceholder =
  | "progressionStatus"
  | "persistenceStatus"
  | "gateReadiness"
  | "startRequestReferenceStatus";

export type SaveDataShapeMissingSectionWarning =
  `missing-section:${SaveDataShapeSectionPlaceholder}`;

export type SaveDataShapeMissingFieldWarning =
  | `missing-identity-field:${SaveDataShapeIdentityFieldPlaceholder}`
  | `missing-replay-field:${SaveDataShapeReplayFieldPlaceholder}`
  | `missing-progression-field:${SaveDataShapeProgressionFieldPlaceholder}`;

export interface SaveDataShapeSaveProgressionReferenceSummary {
  readonly status: "diagnostics-only";
  readonly referenceStatus: "missing" | "provided";
  readonly saveContractId?: EntityId;
  readonly requestedSaveSlotId?: EntityId;
  readonly setupId?: EntityId;
  readonly selectedBrandId?: EntityId;
  readonly playerManagerId?: EntityId;
  readonly replayId?: string;
  readonly seedLabel?: string;
  readonly progressionStatus?: SaveProgressionStatusPlaceholder;
  readonly persistenceStatus?: SavePersistenceStatusPlaceholder;
  readonly gateReadiness?: string;
  readonly startRequestReferenceStatus?: SaveProgressionStartRequestReferenceStatus;
  readonly saveContractStructurallyReady?: boolean;
  readonly saveContractIssues: readonly SaveProgressionContractIssue[];
  readonly gameplayAffecting: false;
  readonly playerFacing: false;
}

export interface SaveDataShapeAdapterReferenceSummary {
  readonly status: "diagnostics-only";
  readonly referenceStatus: "missing" | "provided";
  readonly adapterContractId?: EntityId;
  readonly adapterReadiness: StorageAdapterExpectationReadiness;
  readonly saveSlotId?: EntityId;
  readonly storageTarget?: PersistenceStorageTargetPlaceholder;
  readonly adapterIssues: readonly PersistenceAdapterContractIssue[];
  readonly gameplayAffecting: false;
  readonly playerFacing: false;
}

export interface SaveDataShapeStorageExpectationReferenceSummary {
  readonly status: "diagnostics-only";
  readonly referenceStatus: "missing" | "provided";
  readonly expectationsId?: EntityId;
  readonly adapterContractId?: EntityId;
  readonly adapterReadiness?: StorageAdapterExpectationReadiness;
  readonly unsupportedOperationWarnings: readonly StorageAdapterUnsupportedOperationWarning[];
  readonly missingCapabilityWarnings: readonly StorageAdapterMissingCapabilityWarning[];
  readonly expectationIssues: readonly StorageAdapterInterfaceExpectationsIssue[];
  readonly gameplayAffecting: false;
  readonly playerFacing: false;
}

export interface SaveDataShapeExpectationsReadiness {
  readonly status: "diagnostics-only";
  readonly structurallyReady: boolean;
  readonly issues: readonly SaveDataShapeExpectationsIssue[];
  readonly saveShapeReadiness: SaveDataShapeReadiness;
  readonly missingSectionWarnings: readonly SaveDataShapeMissingSectionWarning[];
  readonly missingFieldWarnings: readonly SaveDataShapeMissingFieldWarning[];
  readonly gameplayAffecting: false;
  readonly playerFacing: false;
}

export interface SaveDataShapeExpectationsShell {
  readonly status: "diagnostics-only";
  readonly saveShapeExpectationsId: EntityId;
  readonly saveContractId?: EntityId;
  readonly adapterContractId?: EntityId;
  readonly expectedSaveSections: readonly SaveDataShapeSectionPlaceholder[];
  readonly requiredIdentityFields: readonly SaveDataShapeIdentityFieldPlaceholder[];
  readonly requiredReplayFields: readonly SaveDataShapeReplayFieldPlaceholder[];
  readonly requiredProgressionFields: readonly SaveDataShapeProgressionFieldPlaceholder[];
  readonly missingSectionWarnings: readonly SaveDataShapeMissingSectionWarning[];
  readonly missingFieldWarnings: readonly SaveDataShapeMissingFieldWarning[];
  readonly saveShapeReadiness: SaveDataShapeReadiness;
  readonly saveProgressionReference: SaveDataShapeSaveProgressionReferenceSummary;
  readonly adapterReference: SaveDataShapeAdapterReferenceSummary;
  readonly storageExpectationReference: SaveDataShapeStorageExpectationReferenceSummary;
  readonly readiness: SaveDataShapeExpectationsReadiness;
  readonly gameplayAffecting: false;
  readonly playerFacing: false;
}

export interface CreateSaveDataShapeExpectationsShellOptions {
  readonly saveShapeExpectationsId?: EntityId;
  readonly saveProgressionContract?: SaveProgressionContractShell;
  readonly adapterContract?: PersistenceAdapterContractShell;
  readonly storageExpectations?: StorageAdapterInterfaceExpectationsShell;
  readonly expectedSaveSections?: readonly SaveDataShapeSectionPlaceholder[];
  readonly requiredIdentityFields?: readonly SaveDataShapeIdentityFieldPlaceholder[];
  readonly requiredReplayFields?: readonly SaveDataShapeReplayFieldPlaceholder[];
  readonly requiredProgressionFields?: readonly SaveDataShapeProgressionFieldPlaceholder[];
}

export function createSaveDataShapeExpectationsShell(
  options: CreateSaveDataShapeExpectationsShellOptions
): SaveDataShapeExpectationsShell {
  const saveShapeExpectationsId = options.saveShapeExpectationsId?.trim() ?? "";
  const expectedSaveSections = Object.freeze([...(options.expectedSaveSections ?? [])]);
  const requiredIdentityFields = Object.freeze([...(options.requiredIdentityFields ?? [])]);
  const requiredReplayFields = Object.freeze([...(options.requiredReplayFields ?? [])]);
  const requiredProgressionFields = Object.freeze([...(options.requiredProgressionFields ?? [])]);
  const saveContractId = trimOptionalId(options.saveProgressionContract?.saveContractId);
  const adapterContractId = trimOptionalId(
    options.adapterContract?.adapterContractId ?? options.storageExpectations?.adapterContractId
  );
  const missingSectionWarnings = createMissingSectionWarnings(
    expectedSaveSections,
    options
  );
  const missingFieldWarnings = createMissingFieldWarnings({
    requiredIdentityFields,
    requiredReplayFields,
    requiredProgressionFields,
    saveProgressionContract: options.saveProgressionContract,
    adapterContract: options.adapterContract,
    storageExpectations: options.storageExpectations
  });
  const readiness = createSaveShapeReadiness({
    saveShapeExpectationsId,
    missingSectionWarnings,
    missingFieldWarnings
  });

  return Object.freeze({
    status: "diagnostics-only",
    saveShapeExpectationsId,
    ...(saveContractId ? { saveContractId } : {}),
    ...(adapterContractId ? { adapterContractId } : {}),
    expectedSaveSections,
    requiredIdentityFields,
    requiredReplayFields,
    requiredProgressionFields,
    missingSectionWarnings,
    missingFieldWarnings,
    saveShapeReadiness: readiness.saveShapeReadiness,
    saveProgressionReference: createSaveProgressionReferenceSummary(
      options.saveProgressionContract
    ),
    adapterReference: createAdapterReferenceSummary(options.adapterContract),
    storageExpectationReference: createStorageExpectationReferenceSummary(
      options.storageExpectations
    ),
    readiness,
    gameplayAffecting: false,
    playerFacing: false
  });
}

function createSaveShapeReadiness(options: {
  readonly saveShapeExpectationsId: EntityId;
  readonly missingSectionWarnings: readonly SaveDataShapeMissingSectionWarning[];
  readonly missingFieldWarnings: readonly SaveDataShapeMissingFieldWarning[];
}): SaveDataShapeExpectationsReadiness {
  const issues: SaveDataShapeExpectationsIssue[] = [
    ...(options.saveShapeExpectationsId ? [] : ["missing-save-shape-expectations-id" as const])
  ];
  const saveShapeReadiness: SaveDataShapeReadiness = issues.length === 0
    ? "structurally-ready"
    : "structural-issues";

  return Object.freeze({
    status: "diagnostics-only",
    structurallyReady: issues.length === 0,
    issues: Object.freeze(issues),
    saveShapeReadiness,
    missingSectionWarnings: options.missingSectionWarnings,
    missingFieldWarnings: options.missingFieldWarnings,
    gameplayAffecting: false,
    playerFacing: false
  });
}

function createSaveProgressionReferenceSummary(
  saveProgressionContract: SaveProgressionContractShell | undefined
): SaveDataShapeSaveProgressionReferenceSummary {
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
    ...(saveProgressionContract?.selectedBrandId
      ? { selectedBrandId: saveProgressionContract.selectedBrandId }
      : {}),
    ...(saveProgressionContract?.playerManagerId
      ? { playerManagerId: saveProgressionContract.playerManagerId }
      : {}),
    ...(saveProgressionContract?.replayId ? { replayId: saveProgressionContract.replayId } : {}),
    ...(saveProgressionContract?.seedLabel ? { seedLabel: saveProgressionContract.seedLabel } : {}),
    ...(saveProgressionContract
      ? {
          progressionStatus: saveProgressionContract.progressionStatus,
          persistenceStatus: saveProgressionContract.persistenceStatus,
          gateReadiness: saveProgressionContract.readiness.gateReadiness,
          startRequestReferenceStatus: saveProgressionContract.readiness.startRequestReferenceStatus,
          saveContractStructurallyReady: saveProgressionContract.readiness.structurallyReady
        }
      : {}),
    saveContractIssues: Object.freeze([...(saveProgressionContract?.readiness.issues ?? [])]),
    gameplayAffecting: false,
    playerFacing: false
  });
}

function createAdapterReferenceSummary(
  adapterContract: PersistenceAdapterContractShell | undefined
): SaveDataShapeAdapterReferenceSummary {
  return Object.freeze({
    status: "diagnostics-only",
    referenceStatus: adapterContract ? "provided" : "missing",
    ...(adapterContract?.adapterContractId
      ? { adapterContractId: adapterContract.adapterContractId }
      : {}),
    adapterReadiness: summarizeAdapterReadiness(adapterContract),
    ...(adapterContract?.saveSlotId ? { saveSlotId: adapterContract.saveSlotId } : {}),
    ...(adapterContract ? { storageTarget: adapterContract.storageTarget } : {}),
    adapterIssues: Object.freeze([...(adapterContract?.readiness.issues ?? [])]),
    gameplayAffecting: false,
    playerFacing: false
  });
}

function createStorageExpectationReferenceSummary(
  storageExpectations: StorageAdapterInterfaceExpectationsShell | undefined
): SaveDataShapeStorageExpectationReferenceSummary {
  return Object.freeze({
    status: "diagnostics-only",
    referenceStatus: storageExpectations ? "provided" : "missing",
    ...(storageExpectations?.expectationsId
      ? { expectationsId: storageExpectations.expectationsId }
      : {}),
    ...(storageExpectations?.adapterContractId
      ? { adapterContractId: storageExpectations.adapterContractId }
      : {}),
    ...(storageExpectations ? { adapterReadiness: storageExpectations.adapterReadiness } : {}),
    unsupportedOperationWarnings: Object.freeze([
      ...(storageExpectations?.unsupportedOperationWarnings ?? [])
    ]),
    missingCapabilityWarnings: Object.freeze([
      ...(storageExpectations?.missingCapabilityWarnings ?? [])
    ]),
    expectationIssues: Object.freeze([...(storageExpectations?.readiness.issues ?? [])]),
    gameplayAffecting: false,
    playerFacing: false
  });
}

function createMissingSectionWarnings(
  expectedSaveSections: readonly SaveDataShapeSectionPlaceholder[],
  options: CreateSaveDataShapeExpectationsShellOptions
): readonly SaveDataShapeMissingSectionWarning[] {
  return Object.freeze(
    expectedSaveSections
      .filter((section) => !hasSection(section, options))
      .map((section) => `missing-section:${section}` as const)
  );
}

function hasSection(
  section: SaveDataShapeSectionPlaceholder,
  options: CreateSaveDataShapeExpectationsShellOptions
): boolean {
  switch (section) {
    case "identity":
      return Boolean(
        options.saveProgressionContract?.saveContractId
          ?? options.saveProgressionContract?.requestedSaveSlotId
          ?? options.saveProgressionContract?.setupId
          ?? options.saveProgressionContract?.selectedBrandId
          ?? options.saveProgressionContract?.playerManagerId
          ?? options.adapterContract?.adapterContractId
          ?? options.storageExpectations?.adapterContractId
      );
    case "replay":
      return Boolean(
        options.saveProgressionContract?.replayId
          ?? options.saveProgressionContract?.seedLabel
          ?? options.adapterContract?.replayId
          ?? options.adapterContract?.seedLabel
      );
    case "progression":
      return Boolean(options.saveProgressionContract);
    case "setup":
      return Boolean(options.saveProgressionContract?.setupId);
    case "adapter":
      return Boolean(options.adapterContract ?? options.storageExpectations);
    case "metadata":
      return Boolean(options.storageExpectations?.expectationsId);
  }
}

function createMissingFieldWarnings(options: {
  readonly requiredIdentityFields: readonly SaveDataShapeIdentityFieldPlaceholder[];
  readonly requiredReplayFields: readonly SaveDataShapeReplayFieldPlaceholder[];
  readonly requiredProgressionFields: readonly SaveDataShapeProgressionFieldPlaceholder[];
  readonly saveProgressionContract?: SaveProgressionContractShell;
  readonly adapterContract?: PersistenceAdapterContractShell;
  readonly storageExpectations?: StorageAdapterInterfaceExpectationsShell;
}): readonly SaveDataShapeMissingFieldWarning[] {
  const identityWarnings = options.requiredIdentityFields
    .filter((field) => !hasIdentityField(field, options))
    .map((field) => `missing-identity-field:${field}` as SaveDataShapeMissingFieldWarning);
  const replayWarnings = options.requiredReplayFields
    .filter((field) => !hasReplayField(field, options))
    .map((field) => `missing-replay-field:${field}` as SaveDataShapeMissingFieldWarning);
  const progressionWarnings = options.requiredProgressionFields
    .filter((field) => !hasProgressionField(field, options.saveProgressionContract))
    .map((field) => `missing-progression-field:${field}` as SaveDataShapeMissingFieldWarning);

  return Object.freeze([
    ...identityWarnings,
    ...replayWarnings,
    ...progressionWarnings
  ]);
}

function hasIdentityField(
  field: SaveDataShapeIdentityFieldPlaceholder,
  options: {
    readonly saveProgressionContract?: SaveProgressionContractShell;
    readonly adapterContract?: PersistenceAdapterContractShell;
    readonly storageExpectations?: StorageAdapterInterfaceExpectationsShell;
  }
): boolean {
  switch (field) {
    case "saveContractId":
      return Boolean(options.saveProgressionContract?.saveContractId);
    case "saveSlotId":
      return Boolean(
        options.saveProgressionContract?.requestedSaveSlotId ?? options.adapterContract?.saveSlotId
      );
    case "setupId":
      return Boolean(options.saveProgressionContract?.setupId);
    case "selectedBrandId":
      return Boolean(options.saveProgressionContract?.selectedBrandId);
    case "playerManagerId":
      return Boolean(options.saveProgressionContract?.playerManagerId);
    case "adapterContractId":
      return Boolean(options.adapterContract?.adapterContractId ?? options.storageExpectations?.adapterContractId);
  }
}

function hasReplayField(
  field: SaveDataShapeReplayFieldPlaceholder,
  options: {
    readonly saveProgressionContract?: SaveProgressionContractShell;
    readonly adapterContract?: PersistenceAdapterContractShell;
  }
): boolean {
  switch (field) {
    case "replayId":
      return Boolean(options.saveProgressionContract?.replayId ?? options.adapterContract?.replayId);
    case "seedLabel":
      return Boolean(options.saveProgressionContract?.seedLabel ?? options.adapterContract?.seedLabel);
  }
}

function hasProgressionField(
  field: SaveDataShapeProgressionFieldPlaceholder,
  saveProgressionContract: SaveProgressionContractShell | undefined
): boolean {
  switch (field) {
    case "progressionStatus":
      return Boolean(saveProgressionContract?.progressionStatus);
    case "persistenceStatus":
      return Boolean(saveProgressionContract?.persistenceStatus);
    case "gateReadiness":
      return Boolean(
        saveProgressionContract
          && saveProgressionContract.readiness.gateReadiness !== "missing"
      );
    case "startRequestReferenceStatus":
      return saveProgressionContract?.readiness.startRequestReferenceStatus === "provided";
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

function trimOptionalId(id: EntityId | undefined): EntityId | undefined {
  const trimmed = id?.trim();

  return trimmed ? trimmed : undefined;
}
