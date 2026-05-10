import type {
  SQLiteConnectionHealthReadiness,
  SQLiteConnectionHealthShell
} from "./sqliteConnectionHealth.ts";
import type {
  SQLiteMigrationRunnerReadiness,
  SQLiteMigrationRunnerShell
} from "./sqliteMigrationRunnerShell.ts";
import type {
  SQLiteSaveIdentityColumnName,
  SQLiteSaveIdentitySchemaMigrationReadiness,
  SQLiteSaveIdentitySchemaMigrationShell,
  SQLiteSaveIdentitySchemaTableName
} from "./sqliteSaveIdentitySchemaMigration.ts";

export type SQLiteSaveRepositoryOperation =
  | "createSave"
  | "loadSave"
  | "listSaves"
  | "deleteSave"
  | "updateSaveMetadata";

export type SQLiteSaveRepositoryReadiness =
  | "missing-pieces"
  | "structural-issues"
  | "structurally-ready";

export type SQLiteSaveRepositoryMissingPiece =
  | "missing-repository-contract-id"
  | `missing-operation:${SQLiteSaveRepositoryOperation}`
  | `missing-table:${SQLiteSaveIdentitySchemaTableName}`
  | `missing-identity-field:${SQLiteSaveIdentityColumnName}`
  | "missing-schema-migration"
  | "schema-migration-not-ready"
  | "missing-connection-health"
  | "connection-health-not-ready"
  | "migration-runner-not-ready";

export interface SQLiteSaveRepositoryContractShell {
  readonly status: "diagnostics-only";
  readonly repositoryContractId: string;
  readonly supportedOperations: readonly SQLiteSaveRepositoryOperation[];
  readonly requiredOperations: readonly SQLiteSaveRepositoryOperation[];
  readonly requiredTables: readonly SQLiteSaveIdentitySchemaTableName[];
  readonly requiredIdentityFields: readonly SQLiteSaveIdentityColumnName[];
  readonly schemaMigrationReadiness: SQLiteSaveIdentitySchemaMigrationReadiness | "missing";
  readonly connectionHealthReadiness: SQLiteConnectionHealthReadiness | "missing";
  readonly migrationRunnerReadiness: SQLiteMigrationRunnerReadiness | "missing";
  readonly missingRepositoryPieces: readonly SQLiteSaveRepositoryMissingPiece[];
  readonly overallRepositoryReadiness: SQLiteSaveRepositoryReadiness;
  readonly structurallyUsable: boolean;
  readonly repositoryMethodsAvailable: false;
  readonly sqlExecuted: false;
  readonly databaseOpened: false;
  readonly databaseRead: false;
  readonly databaseWritten: false;
  readonly tablesCreated: false;
  readonly tablesAltered: false;
  readonly saveBehaviorAvailable: false;
  readonly loadBehaviorAvailable: false;
  readonly listBehaviorAvailable: false;
  readonly deleteBehaviorAvailable: false;
  readonly metadataUpdateBehaviorAvailable: false;
  readonly gameplayAffecting: false;
  readonly playerFacing: false;
}

export interface CreateSQLiteSaveRepositoryContractShellOptions {
  readonly repositoryContractId?: string;
  readonly supportedOperations?: readonly SQLiteSaveRepositoryOperation[];
  readonly requiredOperations?: readonly SQLiteSaveRepositoryOperation[];
  readonly requiredTables?: readonly SQLiteSaveIdentitySchemaTableName[];
  readonly requiredIdentityFields?: readonly SQLiteSaveIdentityColumnName[];
  readonly schemaMigration?: SQLiteSaveIdentitySchemaMigrationShell;
  readonly connectionHealth?: SQLiteConnectionHealthShell;
  readonly migrationRunner?: SQLiteMigrationRunnerShell;
}

export const SQLITE_SAVE_REPOSITORY_OPERATIONS: readonly SQLiteSaveRepositoryOperation[] =
  Object.freeze([
    "createSave",
    "loadSave",
    "listSaves",
    "deleteSave",
    "updateSaveMetadata"
  ]);

export const SQLITE_SAVE_REPOSITORY_REQUIRED_TABLES:
readonly SQLiteSaveIdentitySchemaTableName[] = Object.freeze([
  "saves",
  "save_metadata",
  "schema_migrations"
]);

export const SQLITE_SAVE_REPOSITORY_REQUIRED_IDENTITY_FIELDS:
readonly SQLiteSaveIdentityColumnName[] = Object.freeze([
  "saveId",
  "saveSlotId",
  "setupId",
  "selectedBrandId",
  "playerManagerId",
  "seedLabel",
  "replayId",
  "createdAt",
  "updatedAt",
  "schemaVersion"
]);

export function createSQLiteSaveRepositoryContractShell(
  options: CreateSQLiteSaveRepositoryContractShellOptions
): SQLiteSaveRepositoryContractShell {
  const repositoryContractId = normalizeString(options.repositoryContractId);
  const supportedOperations = freezeUnique(options.supportedOperations ?? []);
  const requiredOperations = freezeUnique(
    options.requiredOperations ?? SQLITE_SAVE_REPOSITORY_OPERATIONS
  );
  const requiredTables = freezeUnique(
    options.requiredTables ?? SQLITE_SAVE_REPOSITORY_REQUIRED_TABLES
  );
  const requiredIdentityFields = freezeUnique(
    options.requiredIdentityFields ?? SQLITE_SAVE_REPOSITORY_REQUIRED_IDENTITY_FIELDS
  );
  const missingRepositoryPieces = createMissingRepositoryPieces({
    repositoryContractId,
    supportedOperations,
    requiredOperations,
    requiredTables,
    requiredIdentityFields,
    schemaMigration: options.schemaMigration,
    connectionHealth: options.connectionHealth,
    migrationRunner: options.migrationRunner
  });
  const overallRepositoryReadiness = createOverallReadiness(missingRepositoryPieces);

  return Object.freeze({
    status: "diagnostics-only",
    repositoryContractId,
    supportedOperations,
    requiredOperations,
    requiredTables,
    requiredIdentityFields,
    schemaMigrationReadiness: options.schemaMigration?.migrationReadiness ?? "missing",
    connectionHealthReadiness:
      options.connectionHealth?.connectionHealthReadiness ?? "missing",
    migrationRunnerReadiness:
      options.migrationRunner?.migrationRunnerReadiness
      ?? options.schemaMigration?.runnerSummary.migrationRunnerReadiness
      ?? "missing",
    missingRepositoryPieces,
    overallRepositoryReadiness,
    structurallyUsable: overallRepositoryReadiness === "structurally-ready",
    repositoryMethodsAvailable: false,
    sqlExecuted: false,
    databaseOpened: false,
    databaseRead: false,
    databaseWritten: false,
    tablesCreated: false,
    tablesAltered: false,
    saveBehaviorAvailable: false,
    loadBehaviorAvailable: false,
    listBehaviorAvailable: false,
    deleteBehaviorAvailable: false,
    metadataUpdateBehaviorAvailable: false,
    gameplayAffecting: false,
    playerFacing: false
  });
}

function createMissingRepositoryPieces(options: {
  readonly repositoryContractId: string;
  readonly supportedOperations: readonly SQLiteSaveRepositoryOperation[];
  readonly requiredOperations: readonly SQLiteSaveRepositoryOperation[];
  readonly requiredTables: readonly SQLiteSaveIdentitySchemaTableName[];
  readonly requiredIdentityFields: readonly SQLiteSaveIdentityColumnName[];
  readonly schemaMigration?: SQLiteSaveIdentitySchemaMigrationShell;
  readonly connectionHealth?: SQLiteConnectionHealthShell;
  readonly migrationRunner?: SQLiteMigrationRunnerShell;
}): readonly SQLiteSaveRepositoryMissingPiece[] {
  return Object.freeze([
    ...(options.repositoryContractId
      ? []
      : ["missing-repository-contract-id" as const]),
    ...missingOperationPieces(options.requiredOperations, options.supportedOperations),
    ...missingTablePieces(options.requiredTables, options.schemaMigration),
    ...missingIdentityFieldPieces(
      options.requiredIdentityFields,
      options.schemaMigration
    ),
    ...(options.schemaMigration ? [] : ["missing-schema-migration" as const]),
    ...(options.schemaMigration
      && options.schemaMigration.migrationReadiness !== "structurally-ready"
      ? ["schema-migration-not-ready" as const]
      : []),
    ...(options.connectionHealth ? [] : ["missing-connection-health" as const]),
    ...(options.connectionHealth
      && options.connectionHealth.connectionHealthReadiness !== "structurally-ready"
      ? ["connection-health-not-ready" as const]
      : []),
    ...(options.migrationRunner
      && options.migrationRunner.migrationRunnerReadiness !== "structurally-ready"
      ? ["migration-runner-not-ready" as const]
      : [])
  ]);
}

function missingOperationPieces(
  requiredOperations: readonly SQLiteSaveRepositoryOperation[],
  supportedOperations: readonly SQLiteSaveRepositoryOperation[]
): readonly SQLiteSaveRepositoryMissingPiece[] {
  return requiredOperations
    .filter((operation) => !supportedOperations.includes(operation))
    .map((operation) => `missing-operation:${operation}` as const);
}

function missingTablePieces(
  requiredTables: readonly SQLiteSaveIdentitySchemaTableName[],
  schemaMigration: SQLiteSaveIdentitySchemaMigrationShell | undefined
): readonly SQLiteSaveRepositoryMissingPiece[] {
  if (!schemaMigration) {
    return requiredTables.map((tableName) => `missing-table:${tableName}` as const);
  }

  return requiredTables
    .filter((tableName) => !schemaMigration.tableNames.includes(tableName))
    .map((tableName) => `missing-table:${tableName}` as const);
}

function missingIdentityFieldPieces(
  requiredIdentityFields: readonly SQLiteSaveIdentityColumnName[],
  schemaMigration: SQLiteSaveIdentitySchemaMigrationShell | undefined
): readonly SQLiteSaveRepositoryMissingPiece[] {
  if (!schemaMigration) {
    return requiredIdentityFields.map((fieldName) =>
      `missing-identity-field:${fieldName}` as const
    );
  }

  const availableFields = new Set([
    ...schemaMigration.identityColumns,
    ...schemaMigration.replayColumns,
    ...schemaMigration.progressionColumns,
    ...schemaMigration.metadataColumns
  ]);

  return requiredIdentityFields
    .filter((fieldName) => !availableFields.has(fieldName))
    .map((fieldName) => `missing-identity-field:${fieldName}` as const);
}

function createOverallReadiness(
  missingRepositoryPieces: readonly SQLiteSaveRepositoryMissingPiece[]
): SQLiteSaveRepositoryReadiness {
  if (missingRepositoryPieces.length === 0) {
    return "structurally-ready";
  }

  return missingRepositoryPieces.some((piece) => piece.startsWith("missing-"))
    ? "missing-pieces"
    : "structural-issues";
}

function freezeUnique<const T extends string>(values: readonly T[]): readonly T[] {
  return Object.freeze([...new Set(values.map((value) => value.trim() as T))]);
}

function normalizeString(value: string | undefined): string {
  return value?.trim() ?? "";
}
