import type { EntityId } from "./common.ts";
import type {
  PersistenceAdapterContractIssue,
  PersistenceAdapterContractShell,
  PersistenceStorageTargetPlaceholder
} from "./persistenceAdapterContract.ts";
import type {
  SaveDataShapeExpectationsIssue,
  SaveDataShapeExpectationsShell,
  SaveDataShapeMissingFieldWarning,
  SaveDataShapeMissingSectionWarning,
  SaveDataShapeReadiness
} from "./saveDataShapeExpectations.ts";
import type {
  StorageAdapterExpectationReadiness,
  StorageAdapterInterfaceExpectationsIssue,
  StorageAdapterInterfaceExpectationsShell,
  StorageAdapterMissingCapabilityWarning,
  StorageAdapterUnsupportedOperationWarning
} from "./storageAdapterInterfaceExpectations.ts";

export type SQLiteSchemaReadiness =
  | "structural-issues"
  | "structurally-ready";

export type SQLiteSchemaExpectationsIssue =
  | "missing-sqlite-schema-expectations-id";

export type SQLiteSchemaTablePlaceholder =
  | "save_slots"
  | "save_identity"
  | "save_replay"
  | "save_progression"
  | "save_metadata"
  | "adapter_metadata";

export type SQLiteSchemaPrimaryKeyPlaceholder =
  | "save_slots.id"
  | "save_identity.save_contract_id"
  | "save_replay.save_contract_id"
  | "save_progression.save_contract_id"
  | "save_metadata.save_contract_id"
  | "adapter_metadata.adapter_contract_id";

export type SQLiteSchemaIndexPlaceholder =
  | "save_slots.requested_save_slot_id"
  | "save_identity.setup_id"
  | "save_identity.selected_brand_id"
  | "save_identity.player_manager_id"
  | "save_replay.replay_id"
  | "save_replay.seed_label"
  | "save_progression.progression_status"
  | "save_progression.persistence_status"
  | "adapter_metadata.adapter_contract_id";

export type SQLiteSchemaReplayColumnPlaceholder =
  | "save_replay.replay_id"
  | "save_replay.seed_label";

export type SQLiteSchemaProgressionColumnPlaceholder =
  | "save_progression.progression_status"
  | "save_progression.persistence_status";

export type SQLiteMissingTableWarning =
  `missing-table:${SQLiteSchemaTablePlaceholder}`;

export type SQLiteMissingKeyWarning =
  `missing-primary-key:${SQLiteSchemaPrimaryKeyPlaceholder}`;

export type SQLiteMissingIndexWarning =
  `missing-index:${SQLiteSchemaIndexPlaceholder}`;

export interface SQLiteSchemaSaveShapeReferenceSummary {
  readonly status: "diagnostics-only";
  readonly referenceStatus: "missing" | "provided";
  readonly saveShapeExpectationsId?: EntityId;
  readonly saveContractId?: EntityId;
  readonly adapterContractId?: EntityId;
  readonly saveShapeReadiness: SaveDataShapeReadiness | "missing";
  readonly missingSectionWarnings: readonly SaveDataShapeMissingSectionWarning[];
  readonly missingFieldWarnings: readonly SaveDataShapeMissingFieldWarning[];
  readonly saveShapeIssues: readonly SaveDataShapeExpectationsIssue[];
  readonly gameplayAffecting: false;
  readonly playerFacing: false;
}

export interface SQLiteSchemaAdapterReferenceSummary {
  readonly status: "diagnostics-only";
  readonly referenceStatus: "missing" | "provided";
  readonly adapterContractId?: EntityId;
  readonly adapterReadiness: StorageAdapterExpectationReadiness;
  readonly storageTarget?: PersistenceStorageTargetPlaceholder;
  readonly adapterIssues: readonly PersistenceAdapterContractIssue[];
  readonly gameplayAffecting: false;
  readonly playerFacing: false;
}

export interface SQLiteSchemaStorageExpectationReferenceSummary {
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

export interface SQLiteSchemaExpectationsReadiness {
  readonly status: "diagnostics-only";
  readonly structurallyReady: boolean;
  readonly issues: readonly SQLiteSchemaExpectationsIssue[];
  readonly schemaReadiness: SQLiteSchemaReadiness;
  readonly missingTableWarnings: readonly SQLiteMissingTableWarning[];
  readonly missingKeyWarnings: readonly SQLiteMissingKeyWarning[];
  readonly missingIndexWarnings: readonly SQLiteMissingIndexWarning[];
  readonly gameplayAffecting: false;
  readonly playerFacing: false;
}

export interface SQLiteSchemaExpectationsShell {
  readonly status: "diagnostics-only";
  readonly sqliteSchemaExpectationsId: EntityId;
  readonly adapterContractId?: EntityId;
  readonly saveShapeExpectationsId?: EntityId;
  readonly expectedTables: readonly SQLiteSchemaTablePlaceholder[];
  readonly requiredPrimaryKeys: readonly SQLiteSchemaPrimaryKeyPlaceholder[];
  readonly requiredIndexes: readonly SQLiteSchemaIndexPlaceholder[];
  readonly requiredReplayColumns: readonly SQLiteSchemaReplayColumnPlaceholder[];
  readonly requiredProgressionColumns: readonly SQLiteSchemaProgressionColumnPlaceholder[];
  readonly missingTableWarnings: readonly SQLiteMissingTableWarning[];
  readonly missingKeyWarnings: readonly SQLiteMissingKeyWarning[];
  readonly missingIndexWarnings: readonly SQLiteMissingIndexWarning[];
  readonly schemaReadiness: SQLiteSchemaReadiness;
  readonly saveShapeReference: SQLiteSchemaSaveShapeReferenceSummary;
  readonly adapterReference: SQLiteSchemaAdapterReferenceSummary;
  readonly storageExpectationReference: SQLiteSchemaStorageExpectationReferenceSummary;
  readonly readiness: SQLiteSchemaExpectationsReadiness;
  readonly gameplayAffecting: false;
  readonly playerFacing: false;
}

export interface CreateSQLiteSchemaExpectationsShellOptions {
  readonly sqliteSchemaExpectationsId?: EntityId;
  readonly saveShapeExpectations?: SaveDataShapeExpectationsShell;
  readonly adapterContract?: PersistenceAdapterContractShell;
  readonly storageExpectations?: StorageAdapterInterfaceExpectationsShell;
  readonly expectedTables?: readonly SQLiteSchemaTablePlaceholder[];
  readonly requiredPrimaryKeys?: readonly SQLiteSchemaPrimaryKeyPlaceholder[];
  readonly requiredIndexes?: readonly SQLiteSchemaIndexPlaceholder[];
  readonly requiredReplayColumns?: readonly SQLiteSchemaReplayColumnPlaceholder[];
  readonly requiredProgressionColumns?: readonly SQLiteSchemaProgressionColumnPlaceholder[];
  readonly presentTables?: readonly SQLiteSchemaTablePlaceholder[];
  readonly presentPrimaryKeys?: readonly SQLiteSchemaPrimaryKeyPlaceholder[];
  readonly presentIndexes?: readonly SQLiteSchemaIndexPlaceholder[];
}

export function createSQLiteSchemaExpectationsShell(
  options: CreateSQLiteSchemaExpectationsShellOptions
): SQLiteSchemaExpectationsShell {
  const sqliteSchemaExpectationsId = options.sqliteSchemaExpectationsId?.trim() ?? "";
  const expectedTables = Object.freeze([...(options.expectedTables ?? [])]);
  const requiredPrimaryKeys = Object.freeze([...(options.requiredPrimaryKeys ?? [])]);
  const requiredIndexes = Object.freeze([...(options.requiredIndexes ?? [])]);
  const requiredReplayColumns = Object.freeze([...(options.requiredReplayColumns ?? [])]);
  const requiredProgressionColumns = Object.freeze([
    ...(options.requiredProgressionColumns ?? [])
  ]);
  const missingTableWarnings = createMissingTableWarnings(
    expectedTables,
    options.presentTables
  );
  const missingKeyWarnings = createMissingKeyWarnings(
    requiredPrimaryKeys,
    options.presentPrimaryKeys
  );
  const missingIndexWarnings = createMissingIndexWarnings(
    requiredIndexes,
    options.presentIndexes
  );
  const adapterContractId = trimOptionalId(
    options.adapterContract?.adapterContractId
      ?? options.storageExpectations?.adapterContractId
      ?? options.saveShapeExpectations?.adapterContractId
  );
  const saveShapeExpectationsId = trimOptionalId(
    options.saveShapeExpectations?.saveShapeExpectationsId
  );
  const readiness = createSQLiteSchemaReadiness({
    sqliteSchemaExpectationsId,
    missingTableWarnings,
    missingKeyWarnings,
    missingIndexWarnings
  });

  return Object.freeze({
    status: "diagnostics-only",
    sqliteSchemaExpectationsId,
    ...(adapterContractId ? { adapterContractId } : {}),
    ...(saveShapeExpectationsId ? { saveShapeExpectationsId } : {}),
    expectedTables,
    requiredPrimaryKeys,
    requiredIndexes,
    requiredReplayColumns,
    requiredProgressionColumns,
    missingTableWarnings,
    missingKeyWarnings,
    missingIndexWarnings,
    schemaReadiness: readiness.schemaReadiness,
    saveShapeReference: createSaveShapeReferenceSummary(options.saveShapeExpectations),
    adapterReference: createAdapterReferenceSummary(options.adapterContract),
    storageExpectationReference: createStorageExpectationReferenceSummary(
      options.storageExpectations
    ),
    readiness,
    gameplayAffecting: false,
    playerFacing: false
  });
}

function createSQLiteSchemaReadiness(options: {
  readonly sqliteSchemaExpectationsId: EntityId;
  readonly missingTableWarnings: readonly SQLiteMissingTableWarning[];
  readonly missingKeyWarnings: readonly SQLiteMissingKeyWarning[];
  readonly missingIndexWarnings: readonly SQLiteMissingIndexWarning[];
}): SQLiteSchemaExpectationsReadiness {
  const issues: SQLiteSchemaExpectationsIssue[] = [
    ...(options.sqliteSchemaExpectationsId ? [] : ["missing-sqlite-schema-expectations-id" as const])
  ];
  const schemaReadiness: SQLiteSchemaReadiness = issues.length === 0
    ? "structurally-ready"
    : "structural-issues";

  return Object.freeze({
    status: "diagnostics-only",
    structurallyReady: issues.length === 0,
    issues: Object.freeze(issues),
    schemaReadiness,
    missingTableWarnings: options.missingTableWarnings,
    missingKeyWarnings: options.missingKeyWarnings,
    missingIndexWarnings: options.missingIndexWarnings,
    gameplayAffecting: false,
    playerFacing: false
  });
}

function createSaveShapeReferenceSummary(
  saveShapeExpectations: SaveDataShapeExpectationsShell | undefined
): SQLiteSchemaSaveShapeReferenceSummary {
  return Object.freeze({
    status: "diagnostics-only",
    referenceStatus: saveShapeExpectations ? "provided" : "missing",
    ...(saveShapeExpectations?.saveShapeExpectationsId
      ? { saveShapeExpectationsId: saveShapeExpectations.saveShapeExpectationsId }
      : {}),
    ...(saveShapeExpectations?.saveContractId
      ? { saveContractId: saveShapeExpectations.saveContractId }
      : {}),
    ...(saveShapeExpectations?.adapterContractId
      ? { adapterContractId: saveShapeExpectations.adapterContractId }
      : {}),
    saveShapeReadiness: saveShapeExpectations?.saveShapeReadiness ?? "missing",
    missingSectionWarnings: Object.freeze([
      ...(saveShapeExpectations?.missingSectionWarnings ?? [])
    ]),
    missingFieldWarnings: Object.freeze([
      ...(saveShapeExpectations?.missingFieldWarnings ?? [])
    ]),
    saveShapeIssues: Object.freeze([...(saveShapeExpectations?.readiness.issues ?? [])]),
    gameplayAffecting: false,
    playerFacing: false
  });
}

function createAdapterReferenceSummary(
  adapterContract: PersistenceAdapterContractShell | undefined
): SQLiteSchemaAdapterReferenceSummary {
  return Object.freeze({
    status: "diagnostics-only",
    referenceStatus: adapterContract ? "provided" : "missing",
    ...(adapterContract?.adapterContractId
      ? { adapterContractId: adapterContract.adapterContractId }
      : {}),
    adapterReadiness: summarizeAdapterReadiness(adapterContract),
    ...(adapterContract ? { storageTarget: adapterContract.storageTarget } : {}),
    adapterIssues: Object.freeze([...(adapterContract?.readiness.issues ?? [])]),
    gameplayAffecting: false,
    playerFacing: false
  });
}

function createStorageExpectationReferenceSummary(
  storageExpectations: StorageAdapterInterfaceExpectationsShell | undefined
): SQLiteSchemaStorageExpectationReferenceSummary {
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

function createMissingTableWarnings(
  expectedTables: readonly SQLiteSchemaTablePlaceholder[],
  presentTables: readonly SQLiteSchemaTablePlaceholder[] = []
): readonly SQLiteMissingTableWarning[] {
  const present = new Set(presentTables);

  return Object.freeze(
    expectedTables
      .filter((table) => !present.has(table))
      .map((table) => `missing-table:${table}` as const)
  );
}

function createMissingKeyWarnings(
  requiredPrimaryKeys: readonly SQLiteSchemaPrimaryKeyPlaceholder[],
  presentPrimaryKeys: readonly SQLiteSchemaPrimaryKeyPlaceholder[] = []
): readonly SQLiteMissingKeyWarning[] {
  const present = new Set(presentPrimaryKeys);

  return Object.freeze(
    requiredPrimaryKeys
      .filter((key) => !present.has(key))
      .map((key) => `missing-primary-key:${key}` as const)
  );
}

function createMissingIndexWarnings(
  requiredIndexes: readonly SQLiteSchemaIndexPlaceholder[],
  presentIndexes: readonly SQLiteSchemaIndexPlaceholder[] = []
): readonly SQLiteMissingIndexWarning[] {
  const present = new Set(presentIndexes);

  return Object.freeze(
    requiredIndexes
      .filter((index) => !present.has(index))
      .map((index) => `missing-index:${index}` as const)
  );
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
