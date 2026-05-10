import {
  createSQLiteMigrationRunnerShell,
  type SQLiteMigrationRunnerShell
} from "./sqliteMigrationRunnerShell.ts";

export type SQLiteSaveIdentitySchemaMigrationReadiness =
  | "structural-issues"
  | "structurally-ready";

export type SQLiteSaveIdentitySchemaMigrationIssue =
  | "missing-sql-statements"
  | "missing-expected-table"
  | "missing-expected-column";

export type SQLiteSaveIdentitySchemaTableName =
  | "saves"
  | "save_metadata"
  | "schema_migrations";

export type SQLiteSaveIdentityColumnName =
  | "saveId"
  | "saveSlotId"
  | "setupId"
  | "selectedBrandId"
  | "playerManagerId"
  | "seedLabel"
  | "replayId"
  | "createdAt"
  | "updatedAt"
  | "schemaVersion";

export interface SQLiteSaveIdentitySchemaMigrationShell {
  readonly status: "diagnostics-only";
  readonly migrationId: "sqlite-save-identity-schema-v0-1";
  readonly migrationVersion: "sqlite-save-schema-v0.1";
  readonly migrationName: "Create local SQLite save identity schema";
  readonly tableNames: readonly SQLiteSaveIdentitySchemaTableName[];
  readonly identityColumns: readonly SQLiteSaveIdentityColumnName[];
  readonly replayColumns: readonly SQLiteSaveIdentityColumnName[];
  readonly progressionColumns: readonly SQLiteSaveIdentityColumnName[];
  readonly metadataColumns: readonly SQLiteSaveIdentityColumnName[];
  readonly sqlStatements: readonly string[];
  readonly sqlStatementCount: number;
  readonly requiredSteps: readonly string[];
  readonly rollbackSupported: false;
  readonly runnerSummary: SQLiteMigrationRunnerShell;
  readonly migrationReadiness: SQLiteSaveIdentitySchemaMigrationReadiness;
  readonly structurallyUsable: boolean;
  readonly issues: readonly SQLiteSaveIdentitySchemaMigrationIssue[];
  readonly migrationExecuted: false;
  readonly databaseOpened: false;
  readonly databaseWritten: false;
  readonly schemaCreated: false;
  readonly tablesCreated: false;
  readonly tablesAltered: false;
  readonly saveBehaviorAvailable: false;
  readonly loadBehaviorAvailable: false;
  readonly listBehaviorAvailable: false;
  readonly deleteBehaviorAvailable: false;
  readonly gameplayAffecting: false;
  readonly playerFacing: false;
}

const MIGRATION_ID = "sqlite-save-identity-schema-v0-1" as const;
const MIGRATION_VERSION = "sqlite-save-schema-v0.1" as const;
const MIGRATION_NAME = "Create local SQLite save identity schema" as const;

const TABLE_NAMES: readonly SQLiteSaveIdentitySchemaTableName[] = Object.freeze([
  "saves",
  "save_metadata",
  "schema_migrations"
]);

const IDENTITY_COLUMNS: readonly SQLiteSaveIdentityColumnName[] = Object.freeze([
  "saveId",
  "saveSlotId",
  "setupId",
  "selectedBrandId",
  "playerManagerId"
]);

const REPLAY_COLUMNS: readonly SQLiteSaveIdentityColumnName[] = Object.freeze([
  "seedLabel",
  "replayId"
]);

const PROGRESSION_COLUMNS: readonly SQLiteSaveIdentityColumnName[] = Object.freeze([
  "schemaVersion",
  "createdAt",
  "updatedAt"
]);

const METADATA_COLUMNS: readonly SQLiteSaveIdentityColumnName[] = Object.freeze([
  "saveId",
  "schemaVersion",
  "createdAt",
  "updatedAt"
]);

const SQL_STATEMENTS: readonly string[] = Object.freeze([
  `CREATE TABLE IF NOT EXISTS saves (
  saveId TEXT PRIMARY KEY,
  saveSlotId TEXT NOT NULL,
  setupId TEXT NOT NULL,
  selectedBrandId TEXT NOT NULL,
  playerManagerId TEXT NOT NULL,
  seedLabel TEXT NOT NULL,
  replayId TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  schemaVersion TEXT NOT NULL
)`,
  `CREATE TABLE IF NOT EXISTS save_metadata (
  saveId TEXT PRIMARY KEY,
  schemaVersion TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (saveId) REFERENCES saves(saveId)
)`,
  `CREATE TABLE IF NOT EXISTS schema_migrations (
  migrationId TEXT PRIMARY KEY,
  migrationVersion TEXT NOT NULL,
  migrationName TEXT NOT NULL,
  createdAt TEXT NOT NULL
)`
]);

const REQUIRED_STEPS: readonly string[] = Object.freeze([
  "define-saves-table-sql",
  "define-save-metadata-table-sql",
  "define-schema-migrations-table-sql"
]);

export function createSQLiteSaveIdentitySchemaMigrationShell(): SQLiteSaveIdentitySchemaMigrationShell {
  const runnerSummary = createSQLiteMigrationRunnerShell({
    migrationId: MIGRATION_ID,
    migrationVersion: MIGRATION_VERSION,
    migrationName: MIGRATION_NAME,
    requiredSteps: REQUIRED_STEPS,
    rollbackSupported: false
  });
  const issues = createSchemaMigrationIssues();

  return Object.freeze({
    status: "diagnostics-only",
    migrationId: MIGRATION_ID,
    migrationVersion: MIGRATION_VERSION,
    migrationName: MIGRATION_NAME,
    tableNames: TABLE_NAMES,
    identityColumns: IDENTITY_COLUMNS,
    replayColumns: REPLAY_COLUMNS,
    progressionColumns: PROGRESSION_COLUMNS,
    metadataColumns: METADATA_COLUMNS,
    sqlStatements: SQL_STATEMENTS,
    sqlStatementCount: SQL_STATEMENTS.length,
    requiredSteps: REQUIRED_STEPS,
    rollbackSupported: false,
    runnerSummary,
    migrationReadiness: issues.length === 0
      ? "structurally-ready"
      : "structural-issues",
    structurallyUsable: issues.length === 0,
    issues,
    migrationExecuted: false,
    databaseOpened: false,
    databaseWritten: false,
    schemaCreated: false,
    tablesCreated: false,
    tablesAltered: false,
    saveBehaviorAvailable: false,
    loadBehaviorAvailable: false,
    listBehaviorAvailable: false,
    deleteBehaviorAvailable: false,
    gameplayAffecting: false,
    playerFacing: false
  });
}

function createSchemaMigrationIssues(): readonly SQLiteSaveIdentitySchemaMigrationIssue[] {
  return Object.freeze([
    ...(SQL_STATEMENTS.length > 0 ? [] : ["missing-sql-statements" as const]),
    ...missingExpectedTableIssues(),
    ...missingExpectedColumnIssues()
  ]);
}

function missingExpectedTableIssues(): readonly SQLiteSaveIdentitySchemaMigrationIssue[] {
  return TABLE_NAMES.every((tableName) =>
    SQL_STATEMENTS.some((statement) => statement.includes(tableName))
  )
    ? []
    : ["missing-expected-table"];
}

function missingExpectedColumnIssues(): readonly SQLiteSaveIdentitySchemaMigrationIssue[] {
  const expectedColumns = new Set([
    ...IDENTITY_COLUMNS,
    ...REPLAY_COLUMNS,
    ...PROGRESSION_COLUMNS
  ]);

  return [...expectedColumns].every((columnName) =>
    SQL_STATEMENTS.some((statement) => statement.includes(columnName))
  )
    ? []
    : ["missing-expected-column"];
}
