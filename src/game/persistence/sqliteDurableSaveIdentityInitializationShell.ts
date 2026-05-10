import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";

import {
  createSQLiteDurableSaveIdentityPathBoundaryShell,
  type SQLiteDurableSaveIdentityPathBoundaryShell
} from "./sqliteDurableSaveIdentityPathBoundaryShell.ts";
import {
  createSQLiteSaveIdentitySchemaMigrationShell,
  type SQLiteSaveIdentitySchemaMigrationShell,
  type SQLiteSaveIdentitySchemaTableName
} from "./sqliteSaveIdentitySchemaMigration.ts";

export type SQLiteDurableSaveIdentityPathBoundaryStatus =
  | "allowed"
  | "blocked";

export type SQLiteDurableSaveIdentityInitializationStatus =
  | "blocked"
  | "failed"
  | "initialized";

export type SQLiteDurableSaveIdentityInitializationStepStatus =
  | "blocked"
  | "executed"
  | "failed"
  | "inserted";

export type SQLiteDurableSaveIdentityInitializationIssue =
  | "durable-path-boundary-blocked"
  | "schema-migration-not-ready"
  | "schema-execution-failed"
  | "migration-tracking-insert-failed";

export interface SQLiteDurableSaveIdentityInitializationShell {
  readonly status: "diagnostics-only";
  readonly initializationAttempted: boolean;
  readonly databaseTarget: string;
  readonly pathBoundaryStatus: SQLiteDurableSaveIdentityPathBoundaryStatus;
  readonly schemaExecutionStatus: SQLiteDurableSaveIdentityInitializationStepStatus;
  readonly migrationTrackingStatus: SQLiteDurableSaveIdentityInitializationStepStatus;
  readonly createdTables: readonly SQLiteSaveIdentitySchemaTableName[];
  readonly schemaVersion: string;
  readonly durableStorageUsed: boolean;
  readonly repositoryBehaviorEnabled: false;
  readonly executionStatus: SQLiteDurableSaveIdentityInitializationStatus;
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly issues: readonly SQLiteDurableSaveIdentityInitializationIssue[];
  readonly insertedTrackingRows: number | "not-checked";
  readonly schemaMigrationRowCount: number | "not-checked";
  readonly savesRowCount: number | "not-checked";
  readonly saveMetadataRowCount: number | "not-checked";
  readonly databaseOpened: boolean;
  readonly databaseClosed: boolean;
  readonly saveIdentityRowsInserted: false;
  readonly saveMetadataRowsInserted: false;
  readonly repositoryMethodsAvailable: false;
  readonly createSaveBehaviorAvailable: false;
  readonly loadBehaviorAvailable: false;
  readonly listBehaviorAvailable: false;
  readonly deleteBehaviorAvailable: false;
  readonly metadataUpdateBehaviorAvailable: false;
  readonly draftStatePersisted: false;
  readonly rosterStatePersisted: false;
  readonly matchStatePersisted: false;
  readonly showStatePersisted: false;
  readonly businessStatePersisted: false;
  readonly fanSocialStatePersisted: false;
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
}

export interface CreateSQLiteDurableSaveIdentityInitializationShellOptions {
  readonly durablePathBoundaryId?: string;
  readonly requestedDatabasePath?: string;
  readonly pathBoundary?: SQLiteDurableSaveIdentityPathBoundaryShell;
  readonly schemaMigration?: SQLiteSaveIdentitySchemaMigrationShell;
}

const TRACKING_INSERTED_AT = "1970-01-01T00:00:00.000Z" as const;
const APPROVED_TABLE_NAMES: readonly SQLiteSaveIdentitySchemaTableName[] =
  Object.freeze(["saves", "save_metadata", "schema_migrations"]);

export function createSQLiteDurableSaveIdentityInitializationShell(
  options: CreateSQLiteDurableSaveIdentityInitializationShellOptions
): SQLiteDurableSaveIdentityInitializationShell {
  const pathBoundary = options.pathBoundary
    ?? createSQLiteDurableSaveIdentityPathBoundaryShell({
      durablePathBoundaryId: options.durablePathBoundaryId,
      requestedDatabasePath: options.requestedDatabasePath
    });
  const schemaMigration =
    options.schemaMigration ?? createSQLiteSaveIdentitySchemaMigrationShell();
  const preflightIssues = createPreflightIssues(pathBoundary, schemaMigration);

  if (preflightIssues.length > 0) {
    return createInitializationShell({
      initializationAttempted: false,
      databaseTarget: pathBoundary.normalizedDatabaseTarget,
      pathBoundaryStatus: pathBoundary.allowedForDurableIdentityPersistence
        ? "allowed"
        : "blocked",
      schemaExecutionStatus: "blocked",
      migrationTrackingStatus: "blocked",
      createdTables: [],
      schemaVersion: schemaMigration.migrationVersion,
      durableStorageUsed: false,
      executionStatus: "blocked",
      issues: preflightIssues,
      insertedTrackingRows: "not-checked",
      schemaMigrationRowCount: "not-checked",
      savesRowCount: "not-checked",
      saveMetadataRowCount: "not-checked",
      databaseOpened: false,
      databaseClosed: false
    });
  }

  return initializeDurableIdentityDatabase({
    databaseTarget: pathBoundary.normalizedDatabaseTarget,
    schemaMigration
  });
}

function initializeDurableIdentityDatabase(options: {
  readonly databaseTarget: string;
  readonly schemaMigration: SQLiteSaveIdentitySchemaMigrationShell;
}): SQLiteDurableSaveIdentityInitializationShell {
  let database: DatabaseSync | undefined;
  let databaseOpened = false;
  let databaseClosed = false;

  try {
    mkdirSync(dirname(options.databaseTarget), { recursive: true });
    database = new DatabaseSync(options.databaseTarget);
    databaseOpened = true;

    for (const statement of options.schemaMigration.sqlStatements) {
      database.exec(statement);
    }

    const insertResult = database.prepare(
      `INSERT OR IGNORE INTO schema_migrations (
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
    const createdTables = readCreatedTables(database);
    const savesRowCount = readRowCount(database, "saves");
    const saveMetadataRowCount = readRowCount(database, "save_metadata");
    const schemaMigrationRowCount = readRowCount(database, "schema_migrations");

    database.close();
    databaseClosed = true;

    return createInitializationShell({
      initializationAttempted: true,
      databaseTarget: options.databaseTarget,
      pathBoundaryStatus: "allowed",
      schemaExecutionStatus: "executed",
      migrationTrackingStatus: "inserted",
      createdTables,
      schemaVersion: options.schemaMigration.migrationVersion,
      durableStorageUsed: true,
      executionStatus: "initialized",
      issues: [],
      insertedTrackingRows: insertResult.changes,
      schemaMigrationRowCount,
      savesRowCount,
      saveMetadataRowCount,
      databaseOpened,
      databaseClosed
    });
  } catch {
    if (database && !databaseClosed) {
      database.close();
      databaseClosed = true;
    }

    return createInitializationShell({
      initializationAttempted: true,
      databaseTarget: options.databaseTarget,
      pathBoundaryStatus: "allowed",
      schemaExecutionStatus: databaseOpened ? "failed" : "blocked",
      migrationTrackingStatus: "failed",
      createdTables: [],
      schemaVersion: options.schemaMigration.migrationVersion,
      durableStorageUsed: databaseOpened,
      executionStatus: "failed",
      issues: databaseOpened
        ? ["schema-execution-failed", "migration-tracking-insert-failed"]
        : ["schema-execution-failed"],
      insertedTrackingRows: "not-checked",
      schemaMigrationRowCount: "not-checked",
      savesRowCount: "not-checked",
      saveMetadataRowCount: "not-checked",
      databaseOpened,
      databaseClosed
    });
  }
}

function createPreflightIssues(
  pathBoundary: SQLiteDurableSaveIdentityPathBoundaryShell,
  schemaMigration: SQLiteSaveIdentitySchemaMigrationShell
): readonly SQLiteDurableSaveIdentityInitializationIssue[] {
  return Object.freeze([
    ...(pathBoundary.allowedForDurableIdentityPersistence
      ? []
      : ["durable-path-boundary-blocked" as const]),
    ...(schemaMigration.migrationReadiness === "structurally-ready"
      ? []
      : ["schema-migration-not-ready" as const])
  ]);
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

function createInitializationShell(options: {
  readonly initializationAttempted: boolean;
  readonly databaseTarget: string;
  readonly pathBoundaryStatus: SQLiteDurableSaveIdentityPathBoundaryStatus;
  readonly schemaExecutionStatus: SQLiteDurableSaveIdentityInitializationStepStatus;
  readonly migrationTrackingStatus: SQLiteDurableSaveIdentityInitializationStepStatus;
  readonly createdTables: readonly SQLiteSaveIdentitySchemaTableName[];
  readonly schemaVersion: string;
  readonly durableStorageUsed: boolean;
  readonly executionStatus: SQLiteDurableSaveIdentityInitializationStatus;
  readonly issues: readonly SQLiteDurableSaveIdentityInitializationIssue[];
  readonly insertedTrackingRows: number | "not-checked";
  readonly schemaMigrationRowCount: number | "not-checked";
  readonly savesRowCount: number | "not-checked";
  readonly saveMetadataRowCount: number | "not-checked";
  readonly databaseOpened: boolean;
  readonly databaseClosed: boolean;
}): SQLiteDurableSaveIdentityInitializationShell {
  return Object.freeze({
    status: "diagnostics-only",
    initializationAttempted: options.initializationAttempted,
    databaseTarget: options.databaseTarget,
    pathBoundaryStatus: options.pathBoundaryStatus,
    schemaExecutionStatus: options.schemaExecutionStatus,
    migrationTrackingStatus: options.migrationTrackingStatus,
    createdTables: Object.freeze([...options.createdTables]),
    schemaVersion: options.schemaVersion,
    durableStorageUsed: options.durableStorageUsed,
    repositoryBehaviorEnabled: false,
    executionStatus: options.executionStatus,
    diagnosticsOnly: true,
    playerFacing: false,
    issues: Object.freeze([...options.issues]),
    insertedTrackingRows: options.insertedTrackingRows,
    schemaMigrationRowCount: options.schemaMigrationRowCount,
    savesRowCount: options.savesRowCount,
    saveMetadataRowCount: options.saveMetadataRowCount,
    databaseOpened: options.databaseOpened,
    databaseClosed: options.databaseClosed,
    saveIdentityRowsInserted: false,
    saveMetadataRowsInserted: false,
    repositoryMethodsAvailable: false,
    createSaveBehaviorAvailable: false,
    loadBehaviorAvailable: false,
    listBehaviorAvailable: false,
    deleteBehaviorAvailable: false,
    metadataUpdateBehaviorAvailable: false,
    draftStatePersisted: false,
    rosterStatePersisted: false,
    matchStatePersisted: false,
    showStatePersisted: false,
    businessStatePersisted: false,
    fanSocialStatePersisted: false,
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
    gameplayAffecting: false
  });
}
