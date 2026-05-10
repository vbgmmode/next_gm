import { DatabaseSync } from "node:sqlite";

import type {
  SQLiteConnectionHealthShell,
  SQLiteConnectionTarget
} from "./sqliteConnectionHealth.ts";
import {
  createSQLiteSaveIdentitySchemaExecutionShell,
  type SQLiteSaveIdentitySchemaExecutionStatus
} from "./sqliteSaveIdentitySchemaExecutionShell.ts";
import {
  createSQLiteSaveIdentitySchemaMigrationShell,
  type SQLiteSaveIdentitySchemaMigrationShell
} from "./sqliteSaveIdentitySchemaMigration.ts";

export type SQLiteMigrationTrackingInsertStatus =
  | "blocked"
  | "failed"
  | "inserted";

export type SQLiteMigrationTrackingInsertIssue =
  | "unsupported-connection-target"
  | "schema-execution-not-ready"
  | "migration-tracking-insert-failed";

export interface SQLiteMigrationTrackingInsertShell {
  readonly status: "diagnostics-only";
  readonly trackingInsertAttempted: boolean;
  readonly trackedMigrationId: string;
  readonly schemaVersion: string;
  readonly insertedTrackingRows: number | "not-checked";
  readonly savesRowCount: number | "not-checked";
  readonly saveMetadataRowCount: number | "not-checked";
  readonly schemaMigrationRowCount: number | "not-checked";
  readonly connectionTarget: SQLiteConnectionTarget | "";
  readonly schemaExecutionStatus: SQLiteSaveIdentitySchemaExecutionStatus;
  readonly executionStatus: SQLiteMigrationTrackingInsertStatus;
  readonly issues: readonly SQLiteMigrationTrackingInsertIssue[];
  readonly diagnosticsOnly: true;
  readonly databaseOpened: boolean;
  readonly databaseClosed: boolean;
  readonly trackingInsertedAt: "1970-01-01T00:00:00.000Z";
  readonly saveRowsInserted: false;
  readonly saveMetadataRowsInserted: false;
  readonly saveBehaviorAvailable: false;
  readonly loadBehaviorAvailable: false;
  readonly listBehaviorAvailable: false;
  readonly deleteBehaviorAvailable: false;
  readonly metadataUpdateBehaviorAvailable: false;
  readonly durableDatabasePathAvailable: false;
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

export interface CreateSQLiteMigrationTrackingInsertShellOptions {
  readonly connectionTarget?: string;
  readonly connectionHealth?: SQLiteConnectionHealthShell;
  readonly schemaMigration?: SQLiteSaveIdentitySchemaMigrationShell;
}

const TRACKING_INSERTED_AT = "1970-01-01T00:00:00.000Z" as const;

export function createSQLiteMigrationTrackingInsertShell(
  options: CreateSQLiteMigrationTrackingInsertShellOptions
): SQLiteMigrationTrackingInsertShell {
  const connectionTarget = normalizeConnectionTarget(options.connectionTarget);
  const schemaMigration =
    options.schemaMigration ?? createSQLiteSaveIdentitySchemaMigrationShell();
  const schemaExecution = createSQLiteSaveIdentitySchemaExecutionShell({
    connectionTarget: options.connectionTarget,
    connectionHealth: options.connectionHealth,
    schemaMigration
  });

  if (connectionTarget !== ":memory:" || schemaExecution.executionStatus !== "executed") {
    return createTrackingShell({
      trackingInsertAttempted: false,
      trackedMigrationId: "",
      schemaVersion: schemaMigration.migrationVersion,
      insertedTrackingRows: "not-checked",
      savesRowCount: "not-checked",
      saveMetadataRowCount: "not-checked",
      schemaMigrationRowCount: "not-checked",
      connectionTarget,
      schemaExecutionStatus: schemaExecution.executionStatus,
      executionStatus: "blocked",
      issues: createBlockedIssues(connectionTarget, schemaExecution.executionStatus),
      databaseOpened: false,
      databaseClosed: false
    });
  }

  return insertMigrationTrackingRow({
    connectionTarget,
    schemaMigration,
    schemaExecutionStatus: schemaExecution.executionStatus
  });
}

function insertMigrationTrackingRow(options: {
  readonly connectionTarget: SQLiteConnectionTarget;
  readonly schemaMigration: SQLiteSaveIdentitySchemaMigrationShell;
  readonly schemaExecutionStatus: SQLiteSaveIdentitySchemaExecutionStatus;
}): SQLiteMigrationTrackingInsertShell {
  let database: DatabaseSync | undefined;
  let databaseOpened = false;
  let databaseClosed = false;

  try {
    database = new DatabaseSync(options.connectionTarget);
    databaseOpened = true;

    for (const statement of options.schemaMigration.sqlStatements) {
      database.exec(statement);
    }

    const insertResult = database.prepare(
      `INSERT INTO schema_migrations (
  migrationId,
  migrationVersion,
  migrationName,
  createdAt
) VALUES (?, ?, ?, ?)`
    ).run(
      options.schemaMigration.migrationId,
      options.schemaMigration.migrationVersion,
      options.schemaMigration.migrationName,
      TRACKING_INSERTED_AT
    ) as { readonly changes: number };
    const savesRowCount = readRowCount(database, "saves");
    const saveMetadataRowCount = readRowCount(database, "save_metadata");
    const schemaMigrationRowCount = readRowCount(database, "schema_migrations");

    database.close();
    databaseClosed = true;

    return createTrackingShell({
      trackingInsertAttempted: true,
      trackedMigrationId: options.schemaMigration.migrationId,
      schemaVersion: options.schemaMigration.migrationVersion,
      insertedTrackingRows: insertResult.changes,
      savesRowCount,
      saveMetadataRowCount,
      schemaMigrationRowCount,
      connectionTarget: options.connectionTarget,
      schemaExecutionStatus: options.schemaExecutionStatus,
      executionStatus: "inserted",
      issues: [],
      databaseOpened,
      databaseClosed
    });
  } catch {
    if (database && !databaseClosed) {
      database.close();
      databaseClosed = true;
    }

    return createTrackingShell({
      trackingInsertAttempted: true,
      trackedMigrationId: "",
      schemaVersion: options.schemaMigration.migrationVersion,
      insertedTrackingRows: "not-checked",
      savesRowCount: "not-checked",
      saveMetadataRowCount: "not-checked",
      schemaMigrationRowCount: "not-checked",
      connectionTarget: options.connectionTarget,
      schemaExecutionStatus: options.schemaExecutionStatus,
      executionStatus: "failed",
      issues: ["migration-tracking-insert-failed"],
      databaseOpened,
      databaseClosed
    });
  }
}

function createBlockedIssues(
  connectionTarget: SQLiteConnectionTarget | "",
  schemaExecutionStatus: SQLiteSaveIdentitySchemaExecutionStatus
): readonly SQLiteMigrationTrackingInsertIssue[] {
  return Object.freeze([
    ...(connectionTarget === ":memory:" ? [] : ["unsupported-connection-target" as const]),
    ...(schemaExecutionStatus === "executed"
      ? []
      : ["schema-execution-not-ready" as const])
  ]);
}

function readRowCount(
  database: DatabaseSync,
  tableName: "saves" | "save_metadata" | "schema_migrations"
): number {
  const row = database.prepare(
    `SELECT COUNT(*) AS rowCount FROM ${tableName}`
  ).get() as { readonly rowCount: number };

  return row.rowCount;
}

function createTrackingShell(options: {
  readonly trackingInsertAttempted: boolean;
  readonly trackedMigrationId: string;
  readonly schemaVersion: string;
  readonly insertedTrackingRows: number | "not-checked";
  readonly savesRowCount: number | "not-checked";
  readonly saveMetadataRowCount: number | "not-checked";
  readonly schemaMigrationRowCount: number | "not-checked";
  readonly connectionTarget: SQLiteConnectionTarget | "";
  readonly schemaExecutionStatus: SQLiteSaveIdentitySchemaExecutionStatus;
  readonly executionStatus: SQLiteMigrationTrackingInsertStatus;
  readonly issues: readonly SQLiteMigrationTrackingInsertIssue[];
  readonly databaseOpened: boolean;
  readonly databaseClosed: boolean;
}): SQLiteMigrationTrackingInsertShell {
  return Object.freeze({
    status: "diagnostics-only",
    trackingInsertAttempted: options.trackingInsertAttempted,
    trackedMigrationId: options.trackedMigrationId,
    schemaVersion: options.schemaVersion,
    insertedTrackingRows: options.insertedTrackingRows,
    savesRowCount: options.savesRowCount,
    saveMetadataRowCount: options.saveMetadataRowCount,
    schemaMigrationRowCount: options.schemaMigrationRowCount,
    connectionTarget: options.connectionTarget,
    schemaExecutionStatus: options.schemaExecutionStatus,
    executionStatus: options.executionStatus,
    issues: Object.freeze([...options.issues]),
    diagnosticsOnly: true,
    databaseOpened: options.databaseOpened,
    databaseClosed: options.databaseClosed,
    trackingInsertedAt: TRACKING_INSERTED_AT,
    saveRowsInserted: false,
    saveMetadataRowsInserted: false,
    saveBehaviorAvailable: false,
    loadBehaviorAvailable: false,
    listBehaviorAvailable: false,
    deleteBehaviorAvailable: false,
    metadataUpdateBehaviorAvailable: false,
    durableDatabasePathAvailable: false,
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
