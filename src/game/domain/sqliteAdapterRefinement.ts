import type { EntityId } from "./common.ts";
import type {
  PersistenceAdapterContractIssue,
  PersistenceAdapterContractShell,
  PersistenceAdapterKindPlaceholder,
  PersistenceAdapterOperationPlaceholder,
  PersistenceStorageTargetPlaceholder
} from "./persistenceAdapterContract.ts";
import type {
  SQLiteMigrationExpectationsIssue,
  SQLiteMigrationExpectationsShell,
  SQLiteMigrationReadiness,
  SQLiteMigrationSchemaVersionReadiness,
  SQLiteMissingMigrationStepWarning,
  SQLiteMissingRollbackWarning
} from "./sqliteMigrationExpectations.ts";
import type {
  SQLiteMissingIndexWarning,
  SQLiteMissingKeyWarning,
  SQLiteMissingTableWarning,
  SQLiteSchemaExpectationsIssue,
  SQLiteSchemaExpectationsShell,
  SQLiteSchemaReadiness
} from "./sqliteSchemaExpectations.ts";
import type {
  StorageAdapterExpectationReadiness,
  StorageAdapterInterfaceExpectationsIssue,
  StorageAdapterInterfaceExpectationsShell,
  StorageAdapterMissingCapabilityWarning,
  StorageAdapterUnsupportedOperationWarning
} from "./storageAdapterInterfaceExpectations.ts";

export type SQLiteAdapterRefinementReadiness =
  | "structural-issues"
  | "structurally-ready";

export type SQLiteAdapterRefinementIssue =
  | "missing-sqlite-adapter-refinement-id";

export type SQLiteAdapterCapabilityPlaceholder =
  | "sqlite-adapter-kind"
  | "sqlite-storage-target"
  | "schema-reference"
  | "migration-reference"
  | "operation-contract";

export type SQLiteAdapterSchemaSupportPlaceholder =
  | "schema-expectations-id"
  | "expected-tables"
  | "primary-keys"
  | "indexes";

export type SQLiteAdapterMigrationSupportPlaceholder =
  | "migration-expectations-id"
  | "migration-version"
  | "migration-steps"
  | "rollback-support";

export type SQLiteAdapterRefinementWarning =
  | `adapter-kind-mismatch:${PersistenceAdapterKindPlaceholder}`
  | `missing-sqlite-capability:${SQLiteAdapterCapabilityPlaceholder}`
  | `missing-schema-support:${SQLiteAdapterSchemaSupportPlaceholder}`
  | `missing-migration-support:${SQLiteAdapterMigrationSupportPlaceholder}`
  | `missing-operation-support:${PersistenceAdapterOperationPlaceholder}`;

export interface SQLiteAdapterRefinementAdapterReferenceSummary {
  readonly status: "diagnostics-only";
  readonly referenceStatus: "missing" | "provided";
  readonly adapterContractId?: EntityId;
  readonly adapterKind?: PersistenceAdapterKindPlaceholder;
  readonly adapterReadiness: StorageAdapterExpectationReadiness;
  readonly supportedOperations: readonly PersistenceAdapterOperationPlaceholder[];
  readonly storageTarget?: PersistenceStorageTargetPlaceholder;
  readonly adapterIssues: readonly PersistenceAdapterContractIssue[];
  readonly gameplayAffecting: false;
  readonly playerFacing: false;
}

export interface SQLiteAdapterRefinementStorageExpectationReferenceSummary {
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

export interface SQLiteAdapterRefinementSchemaReferenceSummary {
  readonly status: "diagnostics-only";
  readonly referenceStatus: "missing" | "provided";
  readonly sqliteSchemaExpectationsId?: EntityId;
  readonly schemaReadiness: SQLiteSchemaReadiness | "missing";
  readonly missingTableWarnings: readonly SQLiteMissingTableWarning[];
  readonly missingKeyWarnings: readonly SQLiteMissingKeyWarning[];
  readonly missingIndexWarnings: readonly SQLiteMissingIndexWarning[];
  readonly schemaIssues: readonly SQLiteSchemaExpectationsIssue[];
  readonly gameplayAffecting: false;
  readonly playerFacing: false;
}

export interface SQLiteAdapterRefinementMigrationReferenceSummary {
  readonly status: "diagnostics-only";
  readonly referenceStatus: "missing" | "provided";
  readonly migrationExpectationsId?: EntityId;
  readonly sqliteSchemaExpectationsId?: EntityId;
  readonly schemaVersionReadiness: SQLiteMigrationSchemaVersionReadiness | "missing";
  readonly migrationReadiness: SQLiteMigrationReadiness | "missing";
  readonly missingMigrationStepWarnings: readonly SQLiteMissingMigrationStepWarning[];
  readonly missingRollbackWarnings: readonly SQLiteMissingRollbackWarning[];
  readonly migrationIssues: readonly SQLiteMigrationExpectationsIssue[];
  readonly gameplayAffecting: false;
  readonly playerFacing: false;
}

export interface SQLiteAdapterRefinementReadinessSummary {
  readonly status: "diagnostics-only";
  readonly structurallyReady: boolean;
  readonly issues: readonly SQLiteAdapterRefinementIssue[];
  readonly adapterRefinementWarnings: readonly SQLiteAdapterRefinementWarning[];
  readonly adapterRefinementReadiness: SQLiteAdapterRefinementReadiness;
  readonly gameplayAffecting: false;
  readonly playerFacing: false;
}

export interface SQLiteAdapterRefinementShell {
  readonly status: "diagnostics-only";
  readonly sqliteAdapterRefinementId: EntityId;
  readonly adapterContractId?: EntityId;
  readonly expectedAdapterKind: PersistenceAdapterKindPlaceholder;
  readonly requiredSQLiteCapabilities: readonly SQLiteAdapterCapabilityPlaceholder[];
  readonly requiredSchemaSupport: readonly SQLiteAdapterSchemaSupportPlaceholder[];
  readonly requiredMigrationSupport: readonly SQLiteAdapterMigrationSupportPlaceholder[];
  readonly requiredOperationSupport: readonly PersistenceAdapterOperationPlaceholder[];
  readonly adapterRefinementWarnings: readonly SQLiteAdapterRefinementWarning[];
  readonly adapterRefinementReadiness: SQLiteAdapterRefinementReadiness;
  readonly adapterReference: SQLiteAdapterRefinementAdapterReferenceSummary;
  readonly storageExpectationReference: SQLiteAdapterRefinementStorageExpectationReferenceSummary;
  readonly schemaReference: SQLiteAdapterRefinementSchemaReferenceSummary;
  readonly migrationReference: SQLiteAdapterRefinementMigrationReferenceSummary;
  readonly readiness: SQLiteAdapterRefinementReadinessSummary;
  readonly gameplayAffecting: false;
  readonly playerFacing: false;
}

export interface CreateSQLiteAdapterRefinementShellOptions {
  readonly sqliteAdapterRefinementId?: EntityId;
  readonly adapterContract?: PersistenceAdapterContractShell;
  readonly storageExpectations?: StorageAdapterInterfaceExpectationsShell;
  readonly sqliteSchemaExpectations?: SQLiteSchemaExpectationsShell;
  readonly sqliteMigrationExpectations?: SQLiteMigrationExpectationsShell;
  readonly expectedAdapterKind?: PersistenceAdapterKindPlaceholder;
  readonly requiredSQLiteCapabilities?: readonly SQLiteAdapterCapabilityPlaceholder[];
  readonly providedSQLiteCapabilities?: readonly SQLiteAdapterCapabilityPlaceholder[];
  readonly requiredSchemaSupport?: readonly SQLiteAdapterSchemaSupportPlaceholder[];
  readonly providedSchemaSupport?: readonly SQLiteAdapterSchemaSupportPlaceholder[];
  readonly requiredMigrationSupport?: readonly SQLiteAdapterMigrationSupportPlaceholder[];
  readonly providedMigrationSupport?: readonly SQLiteAdapterMigrationSupportPlaceholder[];
  readonly requiredOperationSupport?: readonly PersistenceAdapterOperationPlaceholder[];
}

export function createSQLiteAdapterRefinementShell(
  options: CreateSQLiteAdapterRefinementShellOptions
): SQLiteAdapterRefinementShell {
  const sqliteAdapterRefinementId = options.sqliteAdapterRefinementId?.trim() ?? "";
  const expectedAdapterKind = options.expectedAdapterKind ?? "sqlite-placeholder";
  const requiredSQLiteCapabilities = Object.freeze([
    ...(options.requiredSQLiteCapabilities ?? [])
  ]);
  const requiredSchemaSupport = Object.freeze([...(options.requiredSchemaSupport ?? [])]);
  const requiredMigrationSupport = Object.freeze([
    ...(options.requiredMigrationSupport ?? [])
  ]);
  const requiredOperationSupport = Object.freeze([
    ...(options.requiredOperationSupport ?? [])
  ]);
  const adapterContractId = trimOptionalId(
    options.adapterContract?.adapterContractId
      ?? options.storageExpectations?.adapterContractId
      ?? options.sqliteSchemaExpectations?.adapterContractId
  );
  const adapterRefinementWarnings = createAdapterRefinementWarnings({
    expectedAdapterKind,
    requiredSQLiteCapabilities,
    providedSQLiteCapabilities: options.providedSQLiteCapabilities,
    requiredSchemaSupport,
    providedSchemaSupport: options.providedSchemaSupport,
    requiredMigrationSupport,
    providedMigrationSupport: options.providedMigrationSupport,
    requiredOperationSupport,
    adapterContract: options.adapterContract
  });
  const readiness = createReadinessSummary({
    sqliteAdapterRefinementId,
    adapterRefinementWarnings
  });

  return Object.freeze({
    status: "diagnostics-only",
    sqliteAdapterRefinementId,
    ...(adapterContractId ? { adapterContractId } : {}),
    expectedAdapterKind,
    requiredSQLiteCapabilities,
    requiredSchemaSupport,
    requiredMigrationSupport,
    requiredOperationSupport,
    adapterRefinementWarnings,
    adapterRefinementReadiness: readiness.adapterRefinementReadiness,
    adapterReference: createAdapterReferenceSummary(options.adapterContract),
    storageExpectationReference: createStorageExpectationReferenceSummary(
      options.storageExpectations
    ),
    schemaReference: createSchemaReferenceSummary(options.sqliteSchemaExpectations),
    migrationReference: createMigrationReferenceSummary(
      options.sqliteMigrationExpectations
    ),
    readiness,
    gameplayAffecting: false,
    playerFacing: false
  });
}

function createReadinessSummary(options: {
  readonly sqliteAdapterRefinementId: EntityId;
  readonly adapterRefinementWarnings: readonly SQLiteAdapterRefinementWarning[];
}): SQLiteAdapterRefinementReadinessSummary {
  const issues: SQLiteAdapterRefinementIssue[] = [
    ...(options.sqliteAdapterRefinementId ? [] : ["missing-sqlite-adapter-refinement-id" as const])
  ];
  const adapterRefinementReadiness: SQLiteAdapterRefinementReadiness = issues.length === 0
    ? "structurally-ready"
    : "structural-issues";

  return Object.freeze({
    status: "diagnostics-only",
    structurallyReady: issues.length === 0,
    issues: Object.freeze(issues),
    adapterRefinementWarnings: options.adapterRefinementWarnings,
    adapterRefinementReadiness,
    gameplayAffecting: false,
    playerFacing: false
  });
}

function createAdapterRefinementWarnings(options: {
  readonly expectedAdapterKind: PersistenceAdapterKindPlaceholder;
  readonly requiredSQLiteCapabilities: readonly SQLiteAdapterCapabilityPlaceholder[];
  readonly providedSQLiteCapabilities?: readonly SQLiteAdapterCapabilityPlaceholder[];
  readonly requiredSchemaSupport: readonly SQLiteAdapterSchemaSupportPlaceholder[];
  readonly providedSchemaSupport?: readonly SQLiteAdapterSchemaSupportPlaceholder[];
  readonly requiredMigrationSupport: readonly SQLiteAdapterMigrationSupportPlaceholder[];
  readonly providedMigrationSupport?: readonly SQLiteAdapterMigrationSupportPlaceholder[];
  readonly requiredOperationSupport: readonly PersistenceAdapterOperationPlaceholder[];
  readonly adapterContract?: PersistenceAdapterContractShell;
}): readonly SQLiteAdapterRefinementWarning[] {
  const kindWarnings = options.adapterContract && options.adapterContract.adapterKind !== options.expectedAdapterKind
    ? [`adapter-kind-mismatch:${options.adapterContract.adapterKind}` as SQLiteAdapterRefinementWarning]
    : [];
  const capabilityWarnings = missingPlaceholderWarnings(
    options.requiredSQLiteCapabilities,
    options.providedSQLiteCapabilities ?? [],
    "missing-sqlite-capability"
  );
  const schemaWarnings = missingPlaceholderWarnings(
    options.requiredSchemaSupport,
    options.providedSchemaSupport ?? [],
    "missing-schema-support"
  );
  const migrationWarnings = missingPlaceholderWarnings(
    options.requiredMigrationSupport,
    options.providedMigrationSupport ?? [],
    "missing-migration-support"
  );
  const operationWarnings = createMissingOperationWarnings(
    options.requiredOperationSupport,
    options.adapterContract?.supportedOperations ?? []
  );

  return Object.freeze([
    ...kindWarnings,
    ...capabilityWarnings,
    ...schemaWarnings,
    ...migrationWarnings,
    ...operationWarnings
  ]);
}

function missingPlaceholderWarnings<
  T extends SQLiteAdapterCapabilityPlaceholder
    | SQLiteAdapterSchemaSupportPlaceholder
    | SQLiteAdapterMigrationSupportPlaceholder
>(
  required: readonly T[],
  provided: readonly T[],
  prefix: "missing-sqlite-capability" | "missing-schema-support" | "missing-migration-support"
): readonly SQLiteAdapterRefinementWarning[] {
  const present = new Set(provided);

  return required
    .filter((item) => !present.has(item))
    .map((item) => `${prefix}:${item}` as SQLiteAdapterRefinementWarning);
}

function createMissingOperationWarnings(
  requiredOperationSupport: readonly PersistenceAdapterOperationPlaceholder[],
  supportedOperations: readonly PersistenceAdapterOperationPlaceholder[]
): readonly SQLiteAdapterRefinementWarning[] {
  const supported = new Set(supportedOperations);

  return requiredOperationSupport
    .filter((operation) => !supported.has(operation))
    .map((operation) => `missing-operation-support:${operation}` as const);
}

function createAdapterReferenceSummary(
  adapterContract: PersistenceAdapterContractShell | undefined
): SQLiteAdapterRefinementAdapterReferenceSummary {
  return Object.freeze({
    status: "diagnostics-only",
    referenceStatus: adapterContract ? "provided" : "missing",
    ...(adapterContract?.adapterContractId
      ? { adapterContractId: adapterContract.adapterContractId }
      : {}),
    ...(adapterContract ? { adapterKind: adapterContract.adapterKind } : {}),
    adapterReadiness: summarizeAdapterReadiness(adapterContract),
    supportedOperations: Object.freeze([...(adapterContract?.supportedOperations ?? [])]),
    ...(adapterContract ? { storageTarget: adapterContract.storageTarget } : {}),
    adapterIssues: Object.freeze([...(adapterContract?.readiness.issues ?? [])]),
    gameplayAffecting: false,
    playerFacing: false
  });
}

function createStorageExpectationReferenceSummary(
  storageExpectations: StorageAdapterInterfaceExpectationsShell | undefined
): SQLiteAdapterRefinementStorageExpectationReferenceSummary {
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

function createSchemaReferenceSummary(
  sqliteSchemaExpectations: SQLiteSchemaExpectationsShell | undefined
): SQLiteAdapterRefinementSchemaReferenceSummary {
  return Object.freeze({
    status: "diagnostics-only",
    referenceStatus: sqliteSchemaExpectations ? "provided" : "missing",
    ...(sqliteSchemaExpectations?.sqliteSchemaExpectationsId
      ? { sqliteSchemaExpectationsId: sqliteSchemaExpectations.sqliteSchemaExpectationsId }
      : {}),
    schemaReadiness: sqliteSchemaExpectations?.schemaReadiness ?? "missing",
    missingTableWarnings: Object.freeze([
      ...(sqliteSchemaExpectations?.missingTableWarnings ?? [])
    ]),
    missingKeyWarnings: Object.freeze([
      ...(sqliteSchemaExpectations?.missingKeyWarnings ?? [])
    ]),
    missingIndexWarnings: Object.freeze([
      ...(sqliteSchemaExpectations?.missingIndexWarnings ?? [])
    ]),
    schemaIssues: Object.freeze([...(sqliteSchemaExpectations?.readiness.issues ?? [])]),
    gameplayAffecting: false,
    playerFacing: false
  });
}

function createMigrationReferenceSummary(
  sqliteMigrationExpectations: SQLiteMigrationExpectationsShell | undefined
): SQLiteAdapterRefinementMigrationReferenceSummary {
  return Object.freeze({
    status: "diagnostics-only",
    referenceStatus: sqliteMigrationExpectations ? "provided" : "missing",
    ...(sqliteMigrationExpectations?.migrationExpectationsId
      ? { migrationExpectationsId: sqliteMigrationExpectations.migrationExpectationsId }
      : {}),
    ...(sqliteMigrationExpectations?.sqliteSchemaExpectationsId
      ? { sqliteSchemaExpectationsId: sqliteMigrationExpectations.sqliteSchemaExpectationsId }
      : {}),
    schemaVersionReadiness: sqliteMigrationExpectations?.schemaVersionReadiness ?? "missing",
    migrationReadiness: sqliteMigrationExpectations?.migrationReadiness ?? "missing",
    missingMigrationStepWarnings: Object.freeze([
      ...(sqliteMigrationExpectations?.missingMigrationStepWarnings ?? [])
    ]),
    missingRollbackWarnings: Object.freeze([
      ...(sqliteMigrationExpectations?.missingRollbackWarnings ?? [])
    ]),
    migrationIssues: Object.freeze([...(sqliteMigrationExpectations?.readiness.issues ?? [])]),
    gameplayAffecting: false,
    playerFacing: false
  });
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
