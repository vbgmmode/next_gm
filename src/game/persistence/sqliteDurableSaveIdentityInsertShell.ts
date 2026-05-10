import { DatabaseSync } from "node:sqlite";

import {
  createSQLiteDurableSaveIdentityInitializationShell,
  type SQLiteDurableSaveIdentityInitializationStatus
} from "./sqliteDurableSaveIdentityInitializationShell.ts";
import {
  createSQLiteDurableSaveIdentityPathBoundaryShell,
  type SQLiteDurableSaveIdentityPathBoundaryShell
} from "./sqliteDurableSaveIdentityPathBoundaryShell.ts";
import {
  type SQLiteNormalizedSaveIdentityInsert,
  type SQLiteSaveIdentityInsertRequest
} from "./sqliteSaveIdentityInsertShell.ts";
import {
  createSQLiteSaveIdentitySchemaMigrationShell,
  type SQLiteSaveIdentityColumnName,
  type SQLiteSaveIdentitySchemaMigrationShell
} from "./sqliteSaveIdentitySchemaMigration.ts";
import {
  SQLITE_SAVE_REPOSITORY_REQUIRED_IDENTITY_FIELDS
} from "./sqliteSaveRepositoryContractShell.ts";

export type SQLiteDurableSaveIdentityInsertPathBoundaryStatus =
  | "allowed"
  | "blocked";

export type SQLiteDurableSaveIdentityInsertStatus =
  | "blocked"
  | "duplicate-save-identity"
  | "failed"
  | "inserted";

export type SQLiteDurableSaveIdentityInsertIssue =
  | "durable-path-boundary-blocked"
  | "durable-initialization-not-ready"
  | `missing-save-identity-field:${SQLiteSaveIdentityColumnName}`
  | "duplicate-save-identity"
  | "durable-save-identity-insert-failed";

export interface SQLiteDurableSaveIdentityInsertShell {
  readonly status: "diagnostics-only";
  readonly saveInsertAttempted: boolean;
  readonly databaseTarget: string;
  readonly pathBoundaryStatus: SQLiteDurableSaveIdentityInsertPathBoundaryStatus;
  readonly initializationStatus: SQLiteDurableSaveIdentityInitializationStatus;
  readonly insertedSaveRows: number | "not-checked";
  readonly insertedSaveMetadataRows: number | "not-checked";
  readonly schemaMigrationRows: number | "not-checked";
  readonly savesRowCount: number | "not-checked";
  readonly saveMetadataRowCount: number | "not-checked";
  readonly insertedSaveId: string;
  readonly requestedSaveIdentity: SQLiteNormalizedSaveIdentityInsert;
  readonly durableStorageUsed: boolean;
  readonly repositoryBehaviorEnabled: false;
  readonly executionStatus: SQLiteDurableSaveIdentityInsertStatus;
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly issues: readonly SQLiteDurableSaveIdentityInsertIssue[];
  readonly databaseOpened: boolean;
  readonly databaseClosed: boolean;
  readonly repositoryMethodsAvailable: false;
  readonly fullRepositoryImplementationAvailable: false;
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

export interface CreateSQLiteDurableSaveIdentityInsertShellOptions {
  readonly durablePathBoundaryId?: string;
  readonly requestedDatabasePath?: string;
  readonly pathBoundary?: SQLiteDurableSaveIdentityPathBoundaryShell;
  readonly schemaMigration?: SQLiteSaveIdentitySchemaMigrationShell;
  readonly request?: SQLiteSaveIdentityInsertRequest;
}

export function createSQLiteDurableSaveIdentityInsertShell(
  options: CreateSQLiteDurableSaveIdentityInsertShellOptions
): SQLiteDurableSaveIdentityInsertShell {
  const pathBoundary = options.pathBoundary
    ?? createSQLiteDurableSaveIdentityPathBoundaryShell({
      durablePathBoundaryId: options.durablePathBoundaryId,
      requestedDatabasePath: options.requestedDatabasePath
    });
  const schemaMigration =
    options.schemaMigration ?? createSQLiteSaveIdentitySchemaMigrationShell();
  const requestedSaveIdentity = normalizeSaveIdentity(options.request ?? {});
  const initialization = createSQLiteDurableSaveIdentityInitializationShell({
    pathBoundary,
    schemaMigration
  });
  const preflightIssues = createPreflightIssues({
    pathBoundary,
    initializationStatus: initialization.executionStatus,
    requestedSaveIdentity
  });

  if (preflightIssues.length > 0) {
    return createInsertShell({
      saveInsertAttempted: false,
      databaseTarget: pathBoundary.normalizedDatabaseTarget,
      pathBoundaryStatus: pathBoundary.allowedForDurableIdentityPersistence
        ? "allowed"
        : "blocked",
      initializationStatus: initialization.executionStatus,
      insertedSaveRows: "not-checked",
      insertedSaveMetadataRows: "not-checked",
      schemaMigrationRows: "not-checked",
      savesRowCount: "not-checked",
      saveMetadataRowCount: "not-checked",
      insertedSaveId: "",
      requestedSaveIdentity,
      durableStorageUsed: initialization.durableStorageUsed,
      executionStatus: "blocked",
      issues: preflightIssues,
      databaseOpened: false,
      databaseClosed: false
    });
  }

  return insertDurableSaveIdentity({
    databaseTarget: pathBoundary.normalizedDatabaseTarget,
    requestedSaveIdentity,
    initializationStatus: initialization.executionStatus
  });
}

function insertDurableSaveIdentity(options: {
  readonly databaseTarget: string;
  readonly requestedSaveIdentity: SQLiteNormalizedSaveIdentityInsert;
  readonly initializationStatus: SQLiteDurableSaveIdentityInitializationStatus;
}): SQLiteDurableSaveIdentityInsertShell {
  let database: DatabaseSync | undefined;
  let databaseOpened = false;
  let databaseClosed = false;

  try {
    database = new DatabaseSync(options.databaseTarget);
    databaseOpened = true;

    const insertResult = insertSaveRows(database, options.requestedSaveIdentity);
    const savesRowCount = readRowCount(database, "saves");
    const saveMetadataRowCount = readRowCount(database, "save_metadata");
    const schemaMigrationRows = readRowCount(database, "schema_migrations");

    database.close();
    databaseClosed = true;

    return createInsertShell({
      saveInsertAttempted: true,
      databaseTarget: options.databaseTarget,
      pathBoundaryStatus: "allowed",
      initializationStatus: options.initializationStatus,
      insertedSaveRows: insertResult.saveRows,
      insertedSaveMetadataRows: insertResult.saveMetadataRows,
      schemaMigrationRows,
      savesRowCount,
      saveMetadataRowCount,
      insertedSaveId: options.requestedSaveIdentity.saveId,
      requestedSaveIdentity: options.requestedSaveIdentity,
      durableStorageUsed: true,
      executionStatus: "inserted",
      issues: [],
      databaseOpened,
      databaseClosed
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
      databaseTarget: options.databaseTarget,
      pathBoundaryStatus: "allowed",
      initializationStatus: options.initializationStatus,
      insertedSaveRows: 0,
      insertedSaveMetadataRows: 0,
      schemaMigrationRows: duplicateResult?.schemaMigrationRows ?? "not-checked",
      savesRowCount: duplicateResult?.savesRowCount ?? "not-checked",
      saveMetadataRowCount: duplicateResult?.saveMetadataRowCount ?? "not-checked",
      insertedSaveId: "",
      requestedSaveIdentity: options.requestedSaveIdentity,
      durableStorageUsed: databaseOpened,
      executionStatus: duplicateResult?.duplicateDetected
        ? "duplicate-save-identity"
        : "failed",
      issues: duplicateResult?.duplicateDetected
        ? ["duplicate-save-identity"]
        : ["durable-save-identity-insert-failed"],
      databaseOpened,
      databaseClosed
    });
  }
}

function insertSaveRows(
  database: DatabaseSync,
  saveIdentity: SQLiteNormalizedSaveIdentityInsert
): {
  readonly saveRows: number;
  readonly saveMetadataRows: number;
} {
  database.exec("BEGIN");

  try {
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

    database.exec("COMMIT");

    return Object.freeze({
      saveRows: saveInsert.changes,
      saveMetadataRows: metadataInsert.changes
    });
  } catch (error) {
    database.exec("ROLLBACK");

    throw error;
  }
}

function createPreflightIssues(options: {
  readonly pathBoundary: SQLiteDurableSaveIdentityPathBoundaryShell;
  readonly initializationStatus: SQLiteDurableSaveIdentityInitializationStatus;
  readonly requestedSaveIdentity: SQLiteNormalizedSaveIdentityInsert;
}): readonly SQLiteDurableSaveIdentityInsertIssue[] {
  return Object.freeze([
    ...(options.pathBoundary.allowedForDurableIdentityPersistence
      ? []
      : ["durable-path-boundary-blocked" as const]),
    ...(options.initializationStatus === "initialized"
      ? []
      : ["durable-initialization-not-ready" as const]),
    ...missingIdentityFieldPieces(options.requestedSaveIdentity)
  ]);
}

function missingIdentityFieldPieces(
  requestedSaveIdentity: SQLiteNormalizedSaveIdentityInsert
): readonly SQLiteDurableSaveIdentityInsertIssue[] {
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
  readonly databaseTarget: string;
  readonly pathBoundaryStatus: SQLiteDurableSaveIdentityInsertPathBoundaryStatus;
  readonly initializationStatus: SQLiteDurableSaveIdentityInitializationStatus;
  readonly insertedSaveRows: number | "not-checked";
  readonly insertedSaveMetadataRows: number | "not-checked";
  readonly schemaMigrationRows: number | "not-checked";
  readonly savesRowCount: number | "not-checked";
  readonly saveMetadataRowCount: number | "not-checked";
  readonly insertedSaveId: string;
  readonly requestedSaveIdentity: SQLiteNormalizedSaveIdentityInsert;
  readonly durableStorageUsed: boolean;
  readonly executionStatus: SQLiteDurableSaveIdentityInsertStatus;
  readonly issues: readonly SQLiteDurableSaveIdentityInsertIssue[];
  readonly databaseOpened: boolean;
  readonly databaseClosed: boolean;
}): SQLiteDurableSaveIdentityInsertShell {
  return Object.freeze({
    status: "diagnostics-only",
    saveInsertAttempted: options.saveInsertAttempted,
    databaseTarget: options.databaseTarget,
    pathBoundaryStatus: options.pathBoundaryStatus,
    initializationStatus: options.initializationStatus,
    insertedSaveRows: options.insertedSaveRows,
    insertedSaveMetadataRows: options.insertedSaveMetadataRows,
    schemaMigrationRows: options.schemaMigrationRows,
    savesRowCount: options.savesRowCount,
    saveMetadataRowCount: options.saveMetadataRowCount,
    insertedSaveId: options.insertedSaveId,
    requestedSaveIdentity: options.requestedSaveIdentity,
    durableStorageUsed: options.durableStorageUsed,
    repositoryBehaviorEnabled: false,
    executionStatus: options.executionStatus,
    diagnosticsOnly: true,
    playerFacing: false,
    issues: Object.freeze([...options.issues]),
    databaseOpened: options.databaseOpened,
    databaseClosed: options.databaseClosed,
    repositoryMethodsAvailable: false,
    fullRepositoryImplementationAvailable: false,
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

function normalizeString(value: string | undefined): string {
  return value?.trim() ?? "";
}
