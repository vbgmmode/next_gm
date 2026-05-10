import type { EntityId } from "./common.ts";
import type {
  PersistenceAdapterContractIssue,
  PersistenceAdapterContractShell,
  PersistenceStorageTargetPlaceholder
} from "./persistenceAdapterContract.ts";
import type {
  SaveDataShapeExpectationsIssue,
  SaveDataShapeExpectationsShell,
  SaveDataShapeReadiness
} from "./saveDataShapeExpectations.ts";
import type {
  SQLiteMissingIndexWarning,
  SQLiteMissingKeyWarning,
  SQLiteMissingTableWarning,
  SQLiteSchemaExpectationsIssue,
  SQLiteSchemaExpectationsShell,
  SQLiteSchemaReadiness
} from "./sqliteSchemaExpectations.ts";
import type {
  StorageAdapterExpectationReadiness
} from "./storageAdapterInterfaceExpectations.ts";

export type SQLiteMigrationReadiness =
  | "structural-issues"
  | "structurally-ready";

export type SQLiteMigrationSchemaVersionReadiness =
  | "missing-version"
  | "missing-schema-reference"
  | "structurally-ready";

export type SQLiteMigrationExpectationsIssue =
  | "missing-migration-expectations-id";

export type SQLiteMigrationVersionPlaceholder =
  | "sqlite-save-schema-v0-placeholder"
  | "sqlite-save-schema-v1-placeholder";

export type SQLiteMigrationStepPlaceholder =
  | "create-save-slots-table"
  | "create-save-identity-table"
  | "create-save-replay-table"
  | "create-save-progression-table"
  | "create-save-metadata-table"
  | "create-adapter-metadata-table"
  | "add-save-replay-indexes"
  | "add-save-progression-indexes";

export type SQLiteMigrationRollbackSupportPlaceholder =
  | "not-required-placeholder"
  | "required-placeholder";

export type SQLiteMissingMigrationStepWarning =
  `missing-migration-step:${SQLiteMigrationStepPlaceholder}`;

export type SQLiteMissingRollbackWarning =
  | "missing-rollback-support";

export interface SQLiteMigrationSchemaReferenceSummary {
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

export interface SQLiteMigrationSaveShapeReferenceSummary {
  readonly status: "diagnostics-only";
  readonly referenceStatus: "missing" | "provided";
  readonly saveShapeExpectationsId?: EntityId;
  readonly saveContractId?: EntityId;
  readonly adapterContractId?: EntityId;
  readonly saveShapeReadiness: SaveDataShapeReadiness | "missing";
  readonly saveShapeIssues: readonly SaveDataShapeExpectationsIssue[];
  readonly gameplayAffecting: false;
  readonly playerFacing: false;
}

export interface SQLiteMigrationAdapterReferenceSummary {
  readonly status: "diagnostics-only";
  readonly referenceStatus: "missing" | "provided";
  readonly adapterContractId?: EntityId;
  readonly adapterReadiness: StorageAdapterExpectationReadiness;
  readonly storageTarget?: PersistenceStorageTargetPlaceholder;
  readonly adapterIssues: readonly PersistenceAdapterContractIssue[];
  readonly gameplayAffecting: false;
  readonly playerFacing: false;
}

export interface SQLiteMigrationExpectationsReadiness {
  readonly status: "diagnostics-only";
  readonly structurallyReady: boolean;
  readonly issues: readonly SQLiteMigrationExpectationsIssue[];
  readonly schemaVersionReadiness: SQLiteMigrationSchemaVersionReadiness;
  readonly migrationReadiness: SQLiteMigrationReadiness;
  readonly missingMigrationStepWarnings: readonly SQLiteMissingMigrationStepWarning[];
  readonly missingRollbackWarnings: readonly SQLiteMissingRollbackWarning[];
  readonly gameplayAffecting: false;
  readonly playerFacing: false;
}

export interface SQLiteMigrationExpectationsShell {
  readonly status: "diagnostics-only";
  readonly migrationExpectationsId: EntityId;
  readonly sqliteSchemaExpectationsId?: EntityId;
  readonly expectedMigrationVersion: SQLiteMigrationVersionPlaceholder | "";
  readonly requiredMigrationSteps: readonly SQLiteMigrationStepPlaceholder[];
  readonly requiredRollbackSupport: SQLiteMigrationRollbackSupportPlaceholder;
  readonly schemaVersionReadiness: SQLiteMigrationSchemaVersionReadiness;
  readonly missingMigrationStepWarnings: readonly SQLiteMissingMigrationStepWarning[];
  readonly missingRollbackWarnings: readonly SQLiteMissingRollbackWarning[];
  readonly migrationReadiness: SQLiteMigrationReadiness;
  readonly schemaReference: SQLiteMigrationSchemaReferenceSummary;
  readonly saveShapeReference: SQLiteMigrationSaveShapeReferenceSummary;
  readonly adapterReference: SQLiteMigrationAdapterReferenceSummary;
  readonly readiness: SQLiteMigrationExpectationsReadiness;
  readonly gameplayAffecting: false;
  readonly playerFacing: false;
}

export interface CreateSQLiteMigrationExpectationsShellOptions {
  readonly migrationExpectationsId?: EntityId;
  readonly sqliteSchemaExpectations?: SQLiteSchemaExpectationsShell;
  readonly saveShapeExpectations?: SaveDataShapeExpectationsShell;
  readonly adapterContract?: PersistenceAdapterContractShell;
  readonly expectedMigrationVersion?: SQLiteMigrationVersionPlaceholder;
  readonly requiredMigrationSteps?: readonly SQLiteMigrationStepPlaceholder[];
  readonly completedMigrationSteps?: readonly SQLiteMigrationStepPlaceholder[];
  readonly requiredRollbackSupport?: SQLiteMigrationRollbackSupportPlaceholder;
  readonly rollbackSupportProvided?: boolean;
}

export function createSQLiteMigrationExpectationsShell(
  options: CreateSQLiteMigrationExpectationsShellOptions
): SQLiteMigrationExpectationsShell {
  const migrationExpectationsId = options.migrationExpectationsId?.trim() ?? "";
  const sqliteSchemaExpectationsId = trimOptionalId(
    options.sqliteSchemaExpectations?.sqliteSchemaExpectationsId
  );
  const expectedMigrationVersion = options.expectedMigrationVersion ?? "";
  const requiredMigrationSteps = Object.freeze([...(options.requiredMigrationSteps ?? [])]);
  const requiredRollbackSupport = options.requiredRollbackSupport ?? "not-required-placeholder";
  const missingMigrationStepWarnings = createMissingMigrationStepWarnings(
    requiredMigrationSteps,
    options.completedMigrationSteps
  );
  const missingRollbackWarnings = createMissingRollbackWarnings({
    requiredRollbackSupport,
    rollbackSupportProvided: options.rollbackSupportProvided
  });
  const schemaVersionReadiness = summarizeSchemaVersionReadiness({
    expectedMigrationVersion,
    sqliteSchemaExpectations: options.sqliteSchemaExpectations
  });
  const readiness = createMigrationReadiness({
    migrationExpectationsId,
    schemaVersionReadiness,
    missingMigrationStepWarnings,
    missingRollbackWarnings
  });

  return Object.freeze({
    status: "diagnostics-only",
    migrationExpectationsId,
    ...(sqliteSchemaExpectationsId ? { sqliteSchemaExpectationsId } : {}),
    expectedMigrationVersion,
    requiredMigrationSteps,
    requiredRollbackSupport,
    schemaVersionReadiness,
    missingMigrationStepWarnings,
    missingRollbackWarnings,
    migrationReadiness: readiness.migrationReadiness,
    schemaReference: createSchemaReferenceSummary(options.sqliteSchemaExpectations),
    saveShapeReference: createSaveShapeReferenceSummary(options.saveShapeExpectations),
    adapterReference: createAdapterReferenceSummary(options.adapterContract),
    readiness,
    gameplayAffecting: false,
    playerFacing: false
  });
}

function createMigrationReadiness(options: {
  readonly migrationExpectationsId: EntityId;
  readonly schemaVersionReadiness: SQLiteMigrationSchemaVersionReadiness;
  readonly missingMigrationStepWarnings: readonly SQLiteMissingMigrationStepWarning[];
  readonly missingRollbackWarnings: readonly SQLiteMissingRollbackWarning[];
}): SQLiteMigrationExpectationsReadiness {
  const issues: SQLiteMigrationExpectationsIssue[] = [
    ...(options.migrationExpectationsId ? [] : ["missing-migration-expectations-id" as const])
  ];
  const migrationReadiness: SQLiteMigrationReadiness = issues.length === 0
    ? "structurally-ready"
    : "structural-issues";

  return Object.freeze({
    status: "diagnostics-only",
    structurallyReady: issues.length === 0,
    issues: Object.freeze(issues),
    schemaVersionReadiness: options.schemaVersionReadiness,
    migrationReadiness,
    missingMigrationStepWarnings: options.missingMigrationStepWarnings,
    missingRollbackWarnings: options.missingRollbackWarnings,
    gameplayAffecting: false,
    playerFacing: false
  });
}

function createSchemaReferenceSummary(
  sqliteSchemaExpectations: SQLiteSchemaExpectationsShell | undefined
): SQLiteMigrationSchemaReferenceSummary {
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

function createSaveShapeReferenceSummary(
  saveShapeExpectations: SaveDataShapeExpectationsShell | undefined
): SQLiteMigrationSaveShapeReferenceSummary {
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
    saveShapeIssues: Object.freeze([...(saveShapeExpectations?.readiness.issues ?? [])]),
    gameplayAffecting: false,
    playerFacing: false
  });
}

function createAdapterReferenceSummary(
  adapterContract: PersistenceAdapterContractShell | undefined
): SQLiteMigrationAdapterReferenceSummary {
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

function createMissingMigrationStepWarnings(
  requiredMigrationSteps: readonly SQLiteMigrationStepPlaceholder[],
  completedMigrationSteps: readonly SQLiteMigrationStepPlaceholder[] = []
): readonly SQLiteMissingMigrationStepWarning[] {
  const completed = new Set(completedMigrationSteps);

  return Object.freeze(
    requiredMigrationSteps
      .filter((step) => !completed.has(step))
      .map((step) => `missing-migration-step:${step}` as const)
  );
}

function createMissingRollbackWarnings(options: {
  readonly requiredRollbackSupport: SQLiteMigrationRollbackSupportPlaceholder;
  readonly rollbackSupportProvided?: boolean;
}): readonly SQLiteMissingRollbackWarning[] {
  if (
    options.requiredRollbackSupport === "required-placeholder"
    && options.rollbackSupportProvided !== true
  ) {
    return Object.freeze(["missing-rollback-support"]);
  }

  return Object.freeze([]);
}

function summarizeSchemaVersionReadiness(options: {
  readonly expectedMigrationVersion: SQLiteMigrationVersionPlaceholder | "";
  readonly sqliteSchemaExpectations?: SQLiteSchemaExpectationsShell;
}): SQLiteMigrationSchemaVersionReadiness {
  if (!options.expectedMigrationVersion) {
    return "missing-version";
  }

  if (!options.sqliteSchemaExpectations) {
    return "missing-schema-reference";
  }

  return "structurally-ready";
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
