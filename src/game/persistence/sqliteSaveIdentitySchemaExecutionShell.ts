import { DatabaseSync } from "node:sqlite";

import type {
  SQLiteConnectionHealthReadiness,
  SQLiteConnectionHealthShell,
  SQLiteConnectionTarget
} from "./sqliteConnectionHealth.ts";
import type {
  SQLiteMigrationRunnerReadiness
} from "./sqliteMigrationRunnerShell.ts";
import {
  createSQLiteSaveIdentitySchemaMigrationShell,
  type SQLiteSaveIdentitySchemaMigrationShell,
  type SQLiteSaveIdentitySchemaTableName
} from "./sqliteSaveIdentitySchemaMigration.ts";

export type SQLiteSaveIdentitySchemaExecutionStatus =
  | "blocked"
  | "executed"
  | "failed";

export type SQLiteSaveIdentitySchemaExecutionIssue =
  | "unsupported-connection-target"
  | "missing-connection-health"
  | "connection-health-not-ready"
  | "schema-migration-not-ready"
  | "migration-runner-not-ready"
  | "unapproved-migration"
  | "schema-execution-failed";

export interface SQLiteSaveIdentitySchemaExecutionShell {
  readonly status: "diagnostics-only";
  readonly executionAttempted: boolean;
  readonly executedMigrationId: string;
  readonly createdTables: readonly SQLiteSaveIdentitySchemaTableName[];
  readonly schemaVersion: string;
  readonly connectionTarget: SQLiteConnectionTarget | "";
  readonly connectionHealthReadiness: SQLiteConnectionHealthReadiness | "missing";
  readonly migrationRunnerReadiness: SQLiteMigrationRunnerReadiness;
  readonly executionStatus: SQLiteSaveIdentitySchemaExecutionStatus;
  readonly issues: readonly SQLiteSaveIdentitySchemaExecutionIssue[];
  readonly diagnosticsOnly: true;
  readonly databaseOpened: boolean;
  readonly databaseClosed: boolean;
  readonly sqlStatementCount: number;
  readonly approvedTableNames: readonly SQLiteSaveIdentitySchemaTableName[];
  readonly saveRowCount: number | "not-checked";
  readonly saveMetadataRowCount: number | "not-checked";
  readonly schemaMigrationRowCount: number | "not-checked";
  readonly saveRowsInserted: false;
  readonly saveMetadataRowsInserted: false;
  readonly schemaMigrationRowsInserted: false;
  readonly saveBehaviorAvailable: false;
  readonly loadBehaviorAvailable: false;
  readonly listBehaviorAvailable: false;
  readonly deleteBehaviorAvailable: false;
  readonly metadataUpdateBehaviorAvailable: false;
  readonly gameplayStarted: false;
  readonly weekAdvanced: false;
  readonly draftExecuted: false;
  readonly rosterAssigned: false;
  readonly matchOutcomesCreated: false;
  readonly showOutcomesCreated: false;
  readonly businessSystemsRun: false;
  readonly fanSocialOutputCreated: false;
  readonly generatedTextCreated: false;
  readonly genAIUsed: false;
  readonly gameplayAffecting: false;
  readonly playerFacing: false;
}

export interface CreateSQLiteSaveIdentitySchemaExecutionShellOptions {
  readonly connectionTarget?: string;
  readonly connectionHealth?: SQLiteConnectionHealthShell;
  readonly schemaMigration?: SQLiteSaveIdentitySchemaMigrationShell;
}

const APPROVED_TABLE_NAMES: readonly SQLiteSaveIdentitySchemaTableName[] =
  Object.freeze(["saves", "save_metadata", "schema_migrations"]);
const APPROVED_MIGRATION_ID = "sqlite-save-identity-schema-v0-1";

export function createSQLiteSaveIdentitySchemaExecutionShell(
  options: CreateSQLiteSaveIdentitySchemaExecutionShellOptions
): SQLiteSaveIdentitySchemaExecutionShell {
  const connectionTarget = normalizeConnectionTarget(options.connectionTarget);
  const schemaMigration =
    options.schemaMigration ?? createSQLiteSaveIdentitySchemaMigrationShell();
  const preflightIssues = createPreflightIssues({
    connectionTarget,
    connectionHealth: options.connectionHealth,
    schemaMigration
  });

  if (preflightIssues.length > 0) {
    return createExecutionShell({
      executionAttempted: false,
      executedMigrationId: "",
      createdTables: [],
      schemaVersion: schemaMigration.migrationVersion,
      connectionTarget,
      connectionHealthReadiness:
        options.connectionHealth?.connectionHealthReadiness ?? "missing",
      migrationRunnerReadiness: schemaMigration.runnerSummary.migrationRunnerReadiness,
      executionStatus: "blocked",
      issues: preflightIssues,
      databaseOpened: false,
      databaseClosed: false,
      sqlStatementCount: schemaMigration.sqlStatementCount,
      saveRowCount: "not-checked",
      saveMetadataRowCount: "not-checked",
      schemaMigrationRowCount: "not-checked"
    });
  }

  return executeApprovedSchema({
    connectionTarget,
    connectionHealthReadiness: options.connectionHealth!.connectionHealthReadiness,
    schemaMigration
  });
}

function executeApprovedSchema(options: {
  readonly connectionTarget: SQLiteConnectionTarget;
  readonly connectionHealthReadiness: SQLiteConnectionHealthReadiness;
  readonly schemaMigration: SQLiteSaveIdentitySchemaMigrationShell;
}): SQLiteSaveIdentitySchemaExecutionShell {
  let database: DatabaseSync | undefined;
  let databaseOpened = false;
  let databaseClosed = false;

  try {
    database = new DatabaseSync(options.connectionTarget);
    databaseOpened = true;

    for (const statement of options.schemaMigration.sqlStatements) {
      database.exec(statement);
    }

    const createdTables = readCreatedTables(database);
    const saveRowCount = readRowCount(database, "saves");
    const saveMetadataRowCount = readRowCount(database, "save_metadata");
    const schemaMigrationRowCount = readRowCount(database, "schema_migrations");

    database.close();
    databaseClosed = true;

    return createExecutionShell({
      executionAttempted: true,
      executedMigrationId: options.schemaMigration.migrationId,
      createdTables,
      schemaVersion: options.schemaMigration.migrationVersion,
      connectionTarget: options.connectionTarget,
      connectionHealthReadiness: options.connectionHealthReadiness,
      migrationRunnerReadiness:
        options.schemaMigration.runnerSummary.migrationRunnerReadiness,
      executionStatus: "executed",
      issues: [],
      databaseOpened,
      databaseClosed,
      sqlStatementCount: options.schemaMigration.sqlStatementCount,
      saveRowCount,
      saveMetadataRowCount,
      schemaMigrationRowCount
    });
  } catch {
    if (database && !databaseClosed) {
      database.close();
      databaseClosed = true;
    }

    return createExecutionShell({
      executionAttempted: true,
      executedMigrationId: "",
      createdTables: [],
      schemaVersion: options.schemaMigration.migrationVersion,
      connectionTarget: options.connectionTarget,
      connectionHealthReadiness: options.connectionHealthReadiness,
      migrationRunnerReadiness:
        options.schemaMigration.runnerSummary.migrationRunnerReadiness,
      executionStatus: "failed",
      issues: ["schema-execution-failed"],
      databaseOpened,
      databaseClosed,
      sqlStatementCount: options.schemaMigration.sqlStatementCount,
      saveRowCount: "not-checked",
      saveMetadataRowCount: "not-checked",
      schemaMigrationRowCount: "not-checked"
    });
  }
}

function createPreflightIssues(options: {
  readonly connectionTarget: SQLiteConnectionTarget | "";
  readonly connectionHealth?: SQLiteConnectionHealthShell;
  readonly schemaMigration: SQLiteSaveIdentitySchemaMigrationShell;
}): readonly SQLiteSaveIdentitySchemaExecutionIssue[] {
  return Object.freeze([
    ...(options.connectionTarget === ":memory:"
      ? []
      : ["unsupported-connection-target" as const]),
    ...(options.connectionHealth ? [] : ["missing-connection-health" as const]),
    ...(options.connectionHealth
      && options.connectionHealth.connectionHealthReadiness !== "structurally-ready"
      ? ["connection-health-not-ready" as const]
      : []),
    ...(options.schemaMigration.migrationReadiness === "structurally-ready"
      ? []
      : ["schema-migration-not-ready" as const]),
    ...(options.schemaMigration.runnerSummary.migrationRunnerReadiness === "structurally-ready"
      ? []
      : ["migration-runner-not-ready" as const]),
    ...(isApprovedMigration(options.schemaMigration)
      ? []
      : ["unapproved-migration" as const])
  ]);
}

function isApprovedMigration(
  schemaMigration: SQLiteSaveIdentitySchemaMigrationShell
): boolean {
  return schemaMigration.migrationId === APPROVED_MIGRATION_ID
    && APPROVED_TABLE_NAMES.every((tableName) =>
      schemaMigration.tableNames.includes(tableName)
    )
    && schemaMigration.tableNames.every((tableName) =>
      APPROVED_TABLE_NAMES.includes(tableName)
    );
}

function readCreatedTables(
  database: DatabaseSync
): readonly SQLiteSaveIdentitySchemaTableName[] {
  const tableRows = database.prepare(
    "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name"
  ).all() as readonly { readonly name: string }[];
  const tableNames = new Set(tableRows.map((row) => row.name));

  return Object.freeze(
    APPROVED_TABLE_NAMES.filter((tableName) => tableNames.has(tableName))
  );
}

function readRowCount(
  database: DatabaseSync,
  tableName: SQLiteSaveIdentitySchemaTableName
): number {
  const row = database.prepare(
    `SELECT COUNT(*) AS rowCount FROM ${tableName}`
  ).get() as { readonly rowCount: number };

  return row.rowCount;
}

function createExecutionShell(options: {
  readonly executionAttempted: boolean;
  readonly executedMigrationId: string;
  readonly createdTables: readonly SQLiteSaveIdentitySchemaTableName[];
  readonly schemaVersion: string;
  readonly connectionTarget: SQLiteConnectionTarget | "";
  readonly connectionHealthReadiness: SQLiteConnectionHealthReadiness | "missing";
  readonly migrationRunnerReadiness: SQLiteMigrationRunnerReadiness;
  readonly executionStatus: SQLiteSaveIdentitySchemaExecutionStatus;
  readonly issues: readonly SQLiteSaveIdentitySchemaExecutionIssue[];
  readonly databaseOpened: boolean;
  readonly databaseClosed: boolean;
  readonly sqlStatementCount: number;
  readonly saveRowCount: number | "not-checked";
  readonly saveMetadataRowCount: number | "not-checked";
  readonly schemaMigrationRowCount: number | "not-checked";
}): SQLiteSaveIdentitySchemaExecutionShell {
  return Object.freeze({
    status: "diagnostics-only",
    executionAttempted: options.executionAttempted,
    executedMigrationId: options.executedMigrationId,
    createdTables: Object.freeze([...options.createdTables]),
    schemaVersion: options.schemaVersion,
    connectionTarget: options.connectionTarget,
    connectionHealthReadiness: options.connectionHealthReadiness,
    migrationRunnerReadiness: options.migrationRunnerReadiness,
    executionStatus: options.executionStatus,
    issues: Object.freeze([...options.issues]),
    diagnosticsOnly: true,
    databaseOpened: options.databaseOpened,
    databaseClosed: options.databaseClosed,
    sqlStatementCount: options.sqlStatementCount,
    approvedTableNames: APPROVED_TABLE_NAMES,
    saveRowCount: options.saveRowCount,
    saveMetadataRowCount: options.saveMetadataRowCount,
    schemaMigrationRowCount: options.schemaMigrationRowCount,
    saveRowsInserted: false,
    saveMetadataRowsInserted: false,
    schemaMigrationRowsInserted: false,
    saveBehaviorAvailable: false,
    loadBehaviorAvailable: false,
    listBehaviorAvailable: false,
    deleteBehaviorAvailable: false,
    metadataUpdateBehaviorAvailable: false,
    gameplayStarted: false,
    weekAdvanced: false,
    draftExecuted: false,
    rosterAssigned: false,
    matchOutcomesCreated: false,
    showOutcomesCreated: false,
    businessSystemsRun: false,
    fanSocialOutputCreated: false,
    generatedTextCreated: false,
    genAIUsed: false,
    gameplayAffecting: false,
    playerFacing: false
  });
}

function normalizeConnectionTarget(
  connectionTarget: string | undefined
): SQLiteConnectionTarget | "" {
  const trimmedTarget = connectionTarget?.trim() ?? ":memory:";

  return trimmedTarget === ":memory:" ? ":memory:" : "";
}
