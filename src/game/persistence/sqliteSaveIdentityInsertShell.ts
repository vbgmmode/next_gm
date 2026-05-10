import { DatabaseSync } from "node:sqlite";

import type {
  SQLiteConnectionHealthShell,
  SQLiteConnectionTarget
} from "./sqliteConnectionHealth.ts";
import {
  createSQLiteMigrationTrackingInsertShell,
  type SQLiteMigrationTrackingInsertStatus
} from "./sqliteMigrationTrackingInsertShell.ts";
import {
  createSQLiteSaveIdentitySchemaExecutionShell,
  type SQLiteSaveIdentitySchemaExecutionStatus
} from "./sqliteSaveIdentitySchemaExecutionShell.ts";
import {
  createSQLiteSaveIdentitySchemaMigrationShell,
  type SQLiteSaveIdentityColumnName,
  type SQLiteSaveIdentitySchemaMigrationShell
} from "./sqliteSaveIdentitySchemaMigration.ts";
import {
  SQLITE_SAVE_REPOSITORY_REQUIRED_IDENTITY_FIELDS
} from "./sqliteSaveRepositoryContractShell.ts";

export type SQLiteSaveIdentityInsertStatus =
  | "blocked"
  | "duplicate-save-identity"
  | "failed"
  | "inserted";

export type SQLiteSaveIdentityInsertIssue =
  | "unsupported-connection-target"
  | "schema-execution-not-ready"
  | "migration-tracking-not-ready"
  | `missing-save-identity-field:${SQLiteSaveIdentityColumnName}`
  | "duplicate-save-identity"
  | "save-identity-insert-failed";

export interface SQLiteSaveIdentityInsertRequest {
  readonly saveId?: string;
  readonly saveSlotId?: string;
  readonly setupId?: string;
  readonly selectedBrandId?: string;
  readonly playerManagerId?: string;
  readonly seedLabel?: string;
  readonly replayId?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  readonly schemaVersion?: string;
}

export interface SQLiteNormalizedSaveIdentityInsert {
  readonly saveId: string;
  readonly saveSlotId: string;
  readonly setupId: string;
  readonly selectedBrandId: string;
  readonly playerManagerId: string;
  readonly seedLabel: string;
  readonly replayId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly schemaVersion: string;
}

export interface SQLiteSaveIdentityInsertShell {
  readonly status: "diagnostics-only";
  readonly saveInsertAttempted: boolean;
  readonly insertedSaveRows: number | "not-checked";
  readonly insertedSaveMetadataRows: number | "not-checked";
  readonly schemaMigrationRows: number | "not-checked";
  readonly savesRowCount: number | "not-checked";
  readonly saveMetadataRowCount: number | "not-checked";
  readonly insertedSaveId: string;
  readonly requestedSaveIdentity: SQLiteNormalizedSaveIdentityInsert;
  readonly persisted: false | "test-safe-memory-only";
  readonly connectionTarget: SQLiteConnectionTarget | "";
  readonly schemaExecutionStatus: SQLiteSaveIdentitySchemaExecutionStatus;
  readonly migrationTrackingStatus: SQLiteMigrationTrackingInsertStatus;
  readonly executionStatus: SQLiteSaveIdentityInsertStatus;
  readonly issues: readonly SQLiteSaveIdentityInsertIssue[];
  readonly diagnosticsOnly: true;
  readonly databaseOpened: boolean;
  readonly databaseClosed: boolean;
  readonly duplicateSeedApplied: boolean;
  readonly durableDatabasePathAvailable: false;
  readonly fullRepositoryImplementationAvailable: false;
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
  readonly playerFacing: false;
}

export interface CreateSQLiteSaveIdentityInsertShellOptions {
  readonly connectionTarget?: string;
  readonly connectionHealth?: SQLiteConnectionHealthShell;
  readonly schemaMigration?: SQLiteSaveIdentitySchemaMigrationShell;
  readonly request?: SQLiteSaveIdentityInsertRequest;
  readonly seedDuplicateSaveIdentity?: boolean;
}

export function createSQLiteSaveIdentityInsertShell(
  options: CreateSQLiteSaveIdentityInsertShellOptions
): SQLiteSaveIdentityInsertShell {
  const connectionTarget = normalizeConnectionTarget(options.connectionTarget);
  const schemaMigration =
    options.schemaMigration ?? createSQLiteSaveIdentitySchemaMigrationShell();
  const requestedSaveIdentity = normalizeSaveIdentity(options.request ?? {});
  const schemaExecution = createSQLiteSaveIdentitySchemaExecutionShell({
    connectionTarget: options.connectionTarget,
    connectionHealth: options.connectionHealth,
    schemaMigration
  });
  const migrationTracking = createSQLiteMigrationTrackingInsertShell({
    connectionTarget: options.connectionTarget,
    connectionHealth: options.connectionHealth,
    schemaMigration
  });
  const preflightIssues = createPreflightIssues({
    connectionTarget,
    requestedSaveIdentity,
    schemaExecutionStatus: schemaExecution.executionStatus,
    migrationTrackingStatus: migrationTracking.executionStatus
  });

  if (preflightIssues.length > 0) {
    return createInsertShell({
      saveInsertAttempted: false,
      insertedSaveRows: "not-checked",
      insertedSaveMetadataRows: "not-checked",
      schemaMigrationRows: "not-checked",
      savesRowCount: "not-checked",
      saveMetadataRowCount: "not-checked",
      insertedSaveId: "",
      requestedSaveIdentity,
      persisted: false,
      connectionTarget,
      schemaExecutionStatus: schemaExecution.executionStatus,
      migrationTrackingStatus: migrationTracking.executionStatus,
      executionStatus: "blocked",
      issues: preflightIssues,
      databaseOpened: false,
      databaseClosed: false,
      duplicateSeedApplied: false
    });
  }

  return insertSaveIdentity({
    connectionTarget,
    schemaMigration,
    requestedSaveIdentity,
    schemaExecutionStatus: schemaExecution.executionStatus,
    migrationTrackingStatus: migrationTracking.executionStatus,
    seedDuplicateSaveIdentity: options.seedDuplicateSaveIdentity === true
  });
}

function insertSaveIdentity(options: {
  readonly connectionTarget: SQLiteConnectionTarget;
  readonly schemaMigration: SQLiteSaveIdentitySchemaMigrationShell;
  readonly requestedSaveIdentity: SQLiteNormalizedSaveIdentityInsert;
  readonly schemaExecutionStatus: SQLiteSaveIdentitySchemaExecutionStatus;
  readonly migrationTrackingStatus: SQLiteMigrationTrackingInsertStatus;
  readonly seedDuplicateSaveIdentity: boolean;
}): SQLiteSaveIdentityInsertShell {
  let database: DatabaseSync | undefined;
  let databaseOpened = false;
  let databaseClosed = false;

  try {
    database = new DatabaseSync(options.connectionTarget);
    databaseOpened = true;

    prepareTrackedSchema(database, options.schemaMigration);

    if (options.seedDuplicateSaveIdentity) {
      insertSaveRows(database, options.requestedSaveIdentity);
    }

    const insertResult = insertSaveRows(database, options.requestedSaveIdentity);
    const savesRowCount = readRowCount(database, "saves");
    const saveMetadataRowCount = readRowCount(database, "save_metadata");
    const schemaMigrationRows = readRowCount(database, "schema_migrations");

    database.close();
    databaseClosed = true;

    return createInsertShell({
      saveInsertAttempted: true,
      insertedSaveRows: insertResult.saveRows,
      insertedSaveMetadataRows: insertResult.saveMetadataRows,
      schemaMigrationRows,
      savesRowCount,
      saveMetadataRowCount,
      insertedSaveId: options.requestedSaveIdentity.saveId,
      requestedSaveIdentity: options.requestedSaveIdentity,
      persisted: "test-safe-memory-only",
      connectionTarget: options.connectionTarget,
      schemaExecutionStatus: options.schemaExecutionStatus,
      migrationTrackingStatus: options.migrationTrackingStatus,
      executionStatus: "inserted",
      issues: [],
      databaseOpened,
      databaseClosed,
      duplicateSeedApplied: options.seedDuplicateSaveIdentity
    });
  } catch {
    const duplicateResult = database
      ? readDuplicateResult(database, options.requestedSaveIdentity.saveId)
      : undefined;

    if (database && !databaseClosed) {
      database.close();
      databaseClosed = true;
    }

    return createInsertShell({
      saveInsertAttempted: true,
      insertedSaveRows: 0,
      insertedSaveMetadataRows: 0,
      schemaMigrationRows: duplicateResult?.schemaMigrationRows ?? "not-checked",
      savesRowCount: duplicateResult?.savesRowCount ?? "not-checked",
      saveMetadataRowCount: duplicateResult?.saveMetadataRowCount ?? "not-checked",
      insertedSaveId: "",
      requestedSaveIdentity: options.requestedSaveIdentity,
      persisted: false,
      connectionTarget: options.connectionTarget,
      schemaExecutionStatus: options.schemaExecutionStatus,
      migrationTrackingStatus: options.migrationTrackingStatus,
      executionStatus: duplicateResult?.duplicateDetected
        ? "duplicate-save-identity"
        : "failed",
      issues: duplicateResult?.duplicateDetected
        ? ["duplicate-save-identity"]
        : ["save-identity-insert-failed"],
      databaseOpened,
      databaseClosed,
      duplicateSeedApplied: options.seedDuplicateSaveIdentity
    });
  }
}

function prepareTrackedSchema(
  database: DatabaseSync,
  schemaMigration: SQLiteSaveIdentitySchemaMigrationShell
): void {
  for (const statement of schemaMigration.sqlStatements) {
    database.exec(statement);
  }

  database.prepare(
    `INSERT INTO schema_migrations (
  migrationId,
  migrationVersion,
  migrationName,
  createdAt
) VALUES (?, ?, ?, ?)`
  ).run(
    schemaMigration.migrationId,
    schemaMigration.migrationVersion,
    schemaMigration.migrationName,
    "1970-01-01T00:00:00.000Z"
  );
}

function insertSaveRows(
  database: DatabaseSync,
  saveIdentity: SQLiteNormalizedSaveIdentityInsert
): {
  readonly saveRows: number;
  readonly saveMetadataRows: number;
} {
  const saveInsert = database.prepare(
    `INSERT INTO saves (
  saveId,
  saveSlotId,
  setupId,
  selectedBrandId,
  playerManagerId,
  seedLabel,
  replayId,
  createdAt,
  updatedAt,
  schemaVersion
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    saveIdentity.saveId,
    saveIdentity.saveSlotId,
    saveIdentity.setupId,
    saveIdentity.selectedBrandId,
    saveIdentity.playerManagerId,
    saveIdentity.seedLabel,
    saveIdentity.replayId,
    saveIdentity.createdAt,
    saveIdentity.updatedAt,
    saveIdentity.schemaVersion
  ) as { readonly changes: number };
  const metadataInsert = database.prepare(
    `INSERT INTO save_metadata (
  saveId,
  schemaVersion,
  createdAt,
  updatedAt
) VALUES (?, ?, ?, ?)`
  ).run(
    saveIdentity.saveId,
    saveIdentity.schemaVersion,
    saveIdentity.createdAt,
    saveIdentity.updatedAt
  ) as { readonly changes: number };

  return Object.freeze({
    saveRows: saveInsert.changes,
    saveMetadataRows: metadataInsert.changes
  });
}

function createPreflightIssues(options: {
  readonly connectionTarget: SQLiteConnectionTarget | "";
  readonly requestedSaveIdentity: SQLiteNormalizedSaveIdentityInsert;
  readonly schemaExecutionStatus: SQLiteSaveIdentitySchemaExecutionStatus;
  readonly migrationTrackingStatus: SQLiteMigrationTrackingInsertStatus;
}): readonly SQLiteSaveIdentityInsertIssue[] {
  return Object.freeze([
    ...(options.connectionTarget === ":memory:"
      ? []
      : ["unsupported-connection-target" as const]),
    ...(options.schemaExecutionStatus === "executed"
      ? []
      : ["schema-execution-not-ready" as const]),
    ...(options.migrationTrackingStatus === "inserted"
      ? []
      : ["migration-tracking-not-ready" as const]),
    ...missingIdentityFieldPieces(options.requestedSaveIdentity)
  ]);
}

function missingIdentityFieldPieces(
  requestedSaveIdentity: SQLiteNormalizedSaveIdentityInsert
): readonly SQLiteSaveIdentityInsertIssue[] {
  return SQLITE_SAVE_REPOSITORY_REQUIRED_IDENTITY_FIELDS
    .filter((fieldName) => !requestedSaveIdentity[fieldName])
    .map((fieldName) => `missing-save-identity-field:${fieldName}` as const);
}

function readDuplicateResult(
  database: DatabaseSync,
  saveId: string
): {
  readonly duplicateDetected: boolean;
  readonly savesRowCount: number;
  readonly saveMetadataRowCount: number;
  readonly schemaMigrationRows: number;
} {
  return Object.freeze({
    duplicateDetected: readSaveIdCount(database, saveId) > 0,
    savesRowCount: readRowCount(database, "saves"),
    saveMetadataRowCount: readRowCount(database, "save_metadata"),
    schemaMigrationRows: readRowCount(database, "schema_migrations")
  });
}

function readSaveIdCount(database: DatabaseSync, saveId: string): number {
  const row = database.prepare(
    "SELECT COUNT(*) AS rowCount FROM saves WHERE saveId = ?"
  ).get(saveId) as { readonly rowCount: number };

  return row.rowCount;
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

function createInsertShell(options: {
  readonly saveInsertAttempted: boolean;
  readonly insertedSaveRows: number | "not-checked";
  readonly insertedSaveMetadataRows: number | "not-checked";
  readonly schemaMigrationRows: number | "not-checked";
  readonly savesRowCount: number | "not-checked";
  readonly saveMetadataRowCount: number | "not-checked";
  readonly insertedSaveId: string;
  readonly requestedSaveIdentity: SQLiteNormalizedSaveIdentityInsert;
  readonly persisted: false | "test-safe-memory-only";
  readonly connectionTarget: SQLiteConnectionTarget | "";
  readonly schemaExecutionStatus: SQLiteSaveIdentitySchemaExecutionStatus;
  readonly migrationTrackingStatus: SQLiteMigrationTrackingInsertStatus;
  readonly executionStatus: SQLiteSaveIdentityInsertStatus;
  readonly issues: readonly SQLiteSaveIdentityInsertIssue[];
  readonly databaseOpened: boolean;
  readonly databaseClosed: boolean;
  readonly duplicateSeedApplied: boolean;
}): SQLiteSaveIdentityInsertShell {
  return Object.freeze({
    status: "diagnostics-only",
    saveInsertAttempted: options.saveInsertAttempted,
    insertedSaveRows: options.insertedSaveRows,
    insertedSaveMetadataRows: options.insertedSaveMetadataRows,
    schemaMigrationRows: options.schemaMigrationRows,
    savesRowCount: options.savesRowCount,
    saveMetadataRowCount: options.saveMetadataRowCount,
    insertedSaveId: options.insertedSaveId,
    requestedSaveIdentity: options.requestedSaveIdentity,
    persisted: options.persisted,
    connectionTarget: options.connectionTarget,
    schemaExecutionStatus: options.schemaExecutionStatus,
    migrationTrackingStatus: options.migrationTrackingStatus,
    executionStatus: options.executionStatus,
    issues: Object.freeze([...options.issues]),
    diagnosticsOnly: true,
    databaseOpened: options.databaseOpened,
    databaseClosed: options.databaseClosed,
    duplicateSeedApplied: options.duplicateSeedApplied,
    durableDatabasePathAvailable: false,
    fullRepositoryImplementationAvailable: false,
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
    gameplayAffecting: false,
    playerFacing: false
  });
}

function normalizeSaveIdentity(
  request: SQLiteSaveIdentityInsertRequest
): SQLiteNormalizedSaveIdentityInsert {
  return Object.freeze({
    saveId: normalizeString(request.saveId),
    saveSlotId: normalizeString(request.saveSlotId),
    setupId: normalizeString(request.setupId),
    selectedBrandId: normalizeString(request.selectedBrandId),
    playerManagerId: normalizeString(request.playerManagerId),
    seedLabel: normalizeString(request.seedLabel),
    replayId: normalizeString(request.replayId),
    createdAt: normalizeString(request.createdAt),
    updatedAt: normalizeString(request.updatedAt),
    schemaVersion: normalizeString(request.schemaVersion)
  });
}

function normalizeConnectionTarget(
  connectionTarget: string | undefined
): SQLiteConnectionTarget | "" {
  const trimmedTarget = connectionTarget?.trim() ?? ":memory:";

  return trimmedTarget === ":memory:" ? ":memory:" : "";
}

function normalizeString(value: string | undefined): string {
  return value?.trim() ?? "";
}
