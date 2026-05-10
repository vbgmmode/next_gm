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
  createSQLiteSaveIdentityInsertShell,
  type SQLiteNormalizedSaveIdentityInsert,
  type SQLiteSaveIdentityInsertRequest,
  type SQLiteSaveIdentityInsertStatus
} from "./sqliteSaveIdentityInsertShell.ts";
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

export type SQLiteSaveIdentityVerificationStatus =
  | "blocked"
  | "failed"
  | "mismatch"
  | "verified";

export type SQLiteSaveIdentityVerificationIssue =
  | "unsupported-connection-target"
  | "schema-execution-not-ready"
  | "migration-tracking-not-ready"
  | "save-identity-insert-not-ready"
  | `missing-save-identity-field:${SQLiteSaveIdentityColumnName}`
  | "save-identity-not-found"
  | "save-row-count-mismatch"
  | "save-metadata-row-count-mismatch"
  | "schema-migration-row-count-mismatch"
  | "save-identity-mismatch"
  | "save-metadata-mismatch"
  | "save-identity-verification-failed";

export interface SQLiteSaveIdentityVerificationShell {
  readonly status: "diagnostics-only";
  readonly verificationAttempted: boolean;
  readonly verifiedSaveId: string;
  readonly requestedSaveIdentity: SQLiteNormalizedSaveIdentityInsert;
  readonly savesRowCount: number | "not-checked";
  readonly saveMetadataRowCount: number | "not-checked";
  readonly schemaMigrationRows: number | "not-checked";
  readonly identityMatchesRequest: boolean | "not-checked";
  readonly metadataMatchesRequest: boolean | "not-checked";
  readonly persisted: false | "test-safe-memory-only";
  readonly connectionTarget: SQLiteConnectionTarget | "";
  readonly schemaExecutionStatus: SQLiteSaveIdentitySchemaExecutionStatus;
  readonly migrationTrackingStatus: SQLiteMigrationTrackingInsertStatus;
  readonly saveIdentityInsertStatus: SQLiteSaveIdentityInsertStatus;
  readonly executionStatus: SQLiteSaveIdentityVerificationStatus;
  readonly issues: readonly SQLiteSaveIdentityVerificationIssue[];
  readonly diagnosticsOnly: true;
  readonly databaseOpened: boolean;
  readonly databaseClosed: boolean;
  readonly mismatchSeedApplied: boolean;
  readonly durableDatabasePathAvailable: false;
  readonly fullRepositoryImplementationAvailable: false;
  readonly loadBehaviorAvailable: false;
  readonly listBehaviorAvailable: false;
  readonly deleteBehaviorAvailable: false;
  readonly metadataUpdateBehaviorAvailable: false;
  readonly draftStateVerified: false;
  readonly rosterStateVerified: false;
  readonly matchStateVerified: false;
  readonly showStateVerified: false;
  readonly businessStateVerified: false;
  readonly fanSocialStateVerified: false;
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

export interface CreateSQLiteSaveIdentityVerificationShellOptions {
  readonly connectionTarget?: string;
  readonly connectionHealth?: SQLiteConnectionHealthShell;
  readonly schemaMigration?: SQLiteSaveIdentitySchemaMigrationShell;
  readonly request?: SQLiteSaveIdentityInsertRequest;
  readonly seedMismatchedSaveIdentity?: boolean;
}

const TRACKING_INSERTED_AT = "1970-01-01T00:00:00.000Z" as const;

export function createSQLiteSaveIdentityVerificationShell(
  options: CreateSQLiteSaveIdentityVerificationShellOptions
): SQLiteSaveIdentityVerificationShell {
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
  const saveIdentityInsert = createSQLiteSaveIdentityInsertShell({
    connectionTarget: options.connectionTarget,
    connectionHealth: options.connectionHealth,
    schemaMigration,
    request: options.request
  });
  const preflightIssues = createPreflightIssues({
    connectionTarget,
    requestedSaveIdentity,
    schemaExecutionStatus: schemaExecution.executionStatus,
    migrationTrackingStatus: migrationTracking.executionStatus,
    saveIdentityInsertStatus: saveIdentityInsert.executionStatus
  });

  if (preflightIssues.length > 0) {
    return createVerificationShell({
      verificationAttempted: false,
      verifiedSaveId: "",
      requestedSaveIdentity,
      savesRowCount: "not-checked",
      saveMetadataRowCount: "not-checked",
      schemaMigrationRows: "not-checked",
      identityMatchesRequest: "not-checked",
      metadataMatchesRequest: "not-checked",
      persisted: false,
      connectionTarget,
      schemaExecutionStatus: schemaExecution.executionStatus,
      migrationTrackingStatus: migrationTracking.executionStatus,
      saveIdentityInsertStatus: saveIdentityInsert.executionStatus,
      executionStatus: "blocked",
      issues: preflightIssues,
      databaseOpened: false,
      databaseClosed: false,
      mismatchSeedApplied: false
    });
  }

  return verifySaveIdentity({
    connectionTarget,
    schemaMigration,
    requestedSaveIdentity,
    schemaExecutionStatus: schemaExecution.executionStatus,
    migrationTrackingStatus: migrationTracking.executionStatus,
    saveIdentityInsertStatus: saveIdentityInsert.executionStatus,
    seedMismatchedSaveIdentity: options.seedMismatchedSaveIdentity === true
  });
}

function verifySaveIdentity(options: {
  readonly connectionTarget: SQLiteConnectionTarget;
  readonly schemaMigration: SQLiteSaveIdentitySchemaMigrationShell;
  readonly requestedSaveIdentity: SQLiteNormalizedSaveIdentityInsert;
  readonly schemaExecutionStatus: SQLiteSaveIdentitySchemaExecutionStatus;
  readonly migrationTrackingStatus: SQLiteMigrationTrackingInsertStatus;
  readonly saveIdentityInsertStatus: SQLiteSaveIdentityInsertStatus;
  readonly seedMismatchedSaveIdentity: boolean;
}): SQLiteSaveIdentityVerificationShell {
  let database: DatabaseSync | undefined;
  let databaseOpened = false;
  let databaseClosed = false;

  try {
    database = new DatabaseSync(options.connectionTarget);
    databaseOpened = true;

    prepareTrackedSchema(database, options.schemaMigration);
    insertSaveRows(
      database,
      options.seedMismatchedSaveIdentity
        ? createMismatchedSaveIdentity(options.requestedSaveIdentity)
        : options.requestedSaveIdentity
    );

    const saveRow = readSaveRow(database, options.requestedSaveIdentity.saveId);
    const metadataRow = readSaveMetadataRow(
      database,
      options.requestedSaveIdentity.saveId
    );
    const savesRowCount = readRowCount(database, "saves");
    const saveMetadataRowCount = readRowCount(database, "save_metadata");
    const schemaMigrationRows = readRowCount(database, "schema_migrations");
    const identityMatchesRequest =
      saveRow !== undefined
        && saveIdentityMatches(saveRow, options.requestedSaveIdentity);
    const metadataMatchesRequest =
      metadataRow !== undefined
        && saveMetadataMatches(metadataRow, options.requestedSaveIdentity);
    const issues = createVerificationIssues({
      saveRowExists: saveRow !== undefined,
      savesRowCount,
      saveMetadataRowCount,
      schemaMigrationRows,
      identityMatchesRequest,
      metadataMatchesRequest
    });

    database.close();
    databaseClosed = true;

    return createVerificationShell({
      verificationAttempted: true,
      verifiedSaveId: saveRow?.saveId ?? "",
      requestedSaveIdentity: options.requestedSaveIdentity,
      savesRowCount,
      saveMetadataRowCount,
      schemaMigrationRows,
      identityMatchesRequest,
      metadataMatchesRequest,
      persisted: issues.length === 0 ? "test-safe-memory-only" : false,
      connectionTarget: options.connectionTarget,
      schemaExecutionStatus: options.schemaExecutionStatus,
      migrationTrackingStatus: options.migrationTrackingStatus,
      saveIdentityInsertStatus: options.saveIdentityInsertStatus,
      executionStatus: issues.length === 0 ? "verified" : "mismatch",
      issues,
      databaseOpened,
      databaseClosed,
      mismatchSeedApplied: options.seedMismatchedSaveIdentity
    });
  } catch {
    if (database && !databaseClosed) {
      database.close();
      databaseClosed = true;
    }

    return createVerificationShell({
      verificationAttempted: true,
      verifiedSaveId: "",
      requestedSaveIdentity: options.requestedSaveIdentity,
      savesRowCount: "not-checked",
      saveMetadataRowCount: "not-checked",
      schemaMigrationRows: "not-checked",
      identityMatchesRequest: "not-checked",
      metadataMatchesRequest: "not-checked",
      persisted: false,
      connectionTarget: options.connectionTarget,
      schemaExecutionStatus: options.schemaExecutionStatus,
      migrationTrackingStatus: options.migrationTrackingStatus,
      saveIdentityInsertStatus: options.saveIdentityInsertStatus,
      executionStatus: "failed",
      issues: ["save-identity-verification-failed"],
      databaseOpened,
      databaseClosed,
      mismatchSeedApplied: options.seedMismatchedSaveIdentity
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
    TRACKING_INSERTED_AT
  );
}

function insertSaveRows(
  database: DatabaseSync,
  saveIdentity: SQLiteNormalizedSaveIdentityInsert
): void {
  database.prepare(
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
  );

  database.prepare(
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
  );
}

function createPreflightIssues(options: {
  readonly connectionTarget: SQLiteConnectionTarget | "";
  readonly requestedSaveIdentity: SQLiteNormalizedSaveIdentityInsert;
  readonly schemaExecutionStatus: SQLiteSaveIdentitySchemaExecutionStatus;
  readonly migrationTrackingStatus: SQLiteMigrationTrackingInsertStatus;
  readonly saveIdentityInsertStatus: SQLiteSaveIdentityInsertStatus;
}): readonly SQLiteSaveIdentityVerificationIssue[] {
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
    ...(options.saveIdentityInsertStatus === "inserted"
      ? []
      : ["save-identity-insert-not-ready" as const]),
    ...missingIdentityFieldPieces(options.requestedSaveIdentity)
  ]);
}

function missingIdentityFieldPieces(
  requestedSaveIdentity: SQLiteNormalizedSaveIdentityInsert
): readonly SQLiteSaveIdentityVerificationIssue[] {
  return SQLITE_SAVE_REPOSITORY_REQUIRED_IDENTITY_FIELDS
    .filter((fieldName) => !requestedSaveIdentity[fieldName])
    .map((fieldName) => `missing-save-identity-field:${fieldName}` as const);
}

function createVerificationIssues(options: {
  readonly saveRowExists: boolean;
  readonly savesRowCount: number;
  readonly saveMetadataRowCount: number;
  readonly schemaMigrationRows: number;
  readonly identityMatchesRequest: boolean;
  readonly metadataMatchesRequest: boolean;
}): readonly SQLiteSaveIdentityVerificationIssue[] {
  return Object.freeze([
    ...(options.saveRowExists ? [] : ["save-identity-not-found" as const]),
    ...(options.savesRowCount === 1
      ? []
      : ["save-row-count-mismatch" as const]),
    ...(options.saveMetadataRowCount === 1
      ? []
      : ["save-metadata-row-count-mismatch" as const]),
    ...(options.schemaMigrationRows === 1
      ? []
      : ["schema-migration-row-count-mismatch" as const]),
    ...(options.identityMatchesRequest
      ? []
      : ["save-identity-mismatch" as const]),
    ...(options.metadataMatchesRequest
      ? []
      : ["save-metadata-mismatch" as const])
  ]);
}

function readSaveRow(
  database: DatabaseSync,
  saveId: string
): SQLiteNormalizedSaveIdentityInsert | undefined {
  return database.prepare(
    `SELECT
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
FROM saves
WHERE saveId = ?`
  ).get(saveId) as SQLiteNormalizedSaveIdentityInsert | undefined;
}

function readSaveMetadataRow(
  database: DatabaseSync,
  saveId: string
): SaveMetadataRow | undefined {
  return database.prepare(
    `SELECT
  saveId,
  schemaVersion,
  createdAt,
  updatedAt
FROM save_metadata
WHERE saveId = ?`
  ).get(saveId) as SaveMetadataRow | undefined;
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

function saveIdentityMatches(
  saveRow: SQLiteNormalizedSaveIdentityInsert,
  requestedSaveIdentity: SQLiteNormalizedSaveIdentityInsert
): boolean {
  return SQLITE_SAVE_REPOSITORY_REQUIRED_IDENTITY_FIELDS.every(
    (fieldName) => saveRow[fieldName] === requestedSaveIdentity[fieldName]
  );
}

function saveMetadataMatches(
  metadataRow: SaveMetadataRow,
  requestedSaveIdentity: SQLiteNormalizedSaveIdentityInsert
): boolean {
  return metadataRow.saveId === requestedSaveIdentity.saveId
    && metadataRow.schemaVersion === requestedSaveIdentity.schemaVersion
    && metadataRow.createdAt === requestedSaveIdentity.createdAt
    && metadataRow.updatedAt === requestedSaveIdentity.updatedAt;
}

function createMismatchedSaveIdentity(
  requestedSaveIdentity: SQLiteNormalizedSaveIdentityInsert
): SQLiteNormalizedSaveIdentityInsert {
  return Object.freeze({
    ...requestedSaveIdentity,
    saveSlotId: `${requestedSaveIdentity.saveSlotId}-mismatch`
  });
}

function createVerificationShell(options: {
  readonly verificationAttempted: boolean;
  readonly verifiedSaveId: string;
  readonly requestedSaveIdentity: SQLiteNormalizedSaveIdentityInsert;
  readonly savesRowCount: number | "not-checked";
  readonly saveMetadataRowCount: number | "not-checked";
  readonly schemaMigrationRows: number | "not-checked";
  readonly identityMatchesRequest: boolean | "not-checked";
  readonly metadataMatchesRequest: boolean | "not-checked";
  readonly persisted: false | "test-safe-memory-only";
  readonly connectionTarget: SQLiteConnectionTarget | "";
  readonly schemaExecutionStatus: SQLiteSaveIdentitySchemaExecutionStatus;
  readonly migrationTrackingStatus: SQLiteMigrationTrackingInsertStatus;
  readonly saveIdentityInsertStatus: SQLiteSaveIdentityInsertStatus;
  readonly executionStatus: SQLiteSaveIdentityVerificationStatus;
  readonly issues: readonly SQLiteSaveIdentityVerificationIssue[];
  readonly databaseOpened: boolean;
  readonly databaseClosed: boolean;
  readonly mismatchSeedApplied: boolean;
}): SQLiteSaveIdentityVerificationShell {
  return Object.freeze({
    status: "diagnostics-only",
    verificationAttempted: options.verificationAttempted,
    verifiedSaveId: options.verifiedSaveId,
    requestedSaveIdentity: options.requestedSaveIdentity,
    savesRowCount: options.savesRowCount,
    saveMetadataRowCount: options.saveMetadataRowCount,
    schemaMigrationRows: options.schemaMigrationRows,
    identityMatchesRequest: options.identityMatchesRequest,
    metadataMatchesRequest: options.metadataMatchesRequest,
    persisted: options.persisted,
    connectionTarget: options.connectionTarget,
    schemaExecutionStatus: options.schemaExecutionStatus,
    migrationTrackingStatus: options.migrationTrackingStatus,
    saveIdentityInsertStatus: options.saveIdentityInsertStatus,
    executionStatus: options.executionStatus,
    issues: Object.freeze([...options.issues]),
    diagnosticsOnly: true,
    databaseOpened: options.databaseOpened,
    databaseClosed: options.databaseClosed,
    mismatchSeedApplied: options.mismatchSeedApplied,
    durableDatabasePathAvailable: false,
    fullRepositoryImplementationAvailable: false,
    loadBehaviorAvailable: false,
    listBehaviorAvailable: false,
    deleteBehaviorAvailable: false,
    metadataUpdateBehaviorAvailable: false,
    draftStateVerified: false,
    rosterStateVerified: false,
    matchStateVerified: false,
    showStateVerified: false,
    businessStateVerified: false,
    fanSocialStateVerified: false,
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

interface SaveMetadataRow {
  readonly saveId: string;
  readonly schemaVersion: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
