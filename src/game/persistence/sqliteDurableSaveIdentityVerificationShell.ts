import { DatabaseSync } from "node:sqlite";

import {
  type SQLiteDurableSaveIdentityInitializationStatus
} from "./sqliteDurableSaveIdentityInitializationShell.ts";
import {
  createSQLiteDurableSaveIdentityInsertShell,
  type SQLiteDurableSaveIdentityInsertStatus
} from "./sqliteDurableSaveIdentityInsertShell.ts";
import {
  createSQLiteDurableSaveIdentityPathBoundaryShell,
  type SQLiteDurableSaveIdentityPathBoundaryShell
} from "./sqliteDurableSaveIdentityPathBoundaryShell.ts";
import {
  type SQLiteNormalizedSaveIdentityInsert,
  type SQLiteSaveIdentityInsertRequest
} from "./sqliteSaveIdentityInsertShell.ts";
import {
  type SQLiteSaveIdentityColumnName,
  type SQLiteSaveIdentitySchemaMigrationShell
} from "./sqliteSaveIdentitySchemaMigration.ts";
import {
  SQLITE_SAVE_REPOSITORY_REQUIRED_IDENTITY_FIELDS
} from "./sqliteSaveRepositoryContractShell.ts";

export type SQLiteDurableSaveIdentityVerificationPathBoundaryStatus =
  | "allowed"
  | "blocked";

export type SQLiteDurableSaveIdentityVerificationStatus =
  | "blocked"
  | "failed"
  | "mismatch"
  | "verified";

export type SQLiteDurableSaveIdentityVerificationIssue =
  | "durable-path-boundary-blocked"
  | "durable-initialization-not-ready"
  | "durable-save-identity-insert-not-ready"
  | `missing-save-identity-field:${SQLiteSaveIdentityColumnName}`
  | "save-identity-not-found"
  | "save-row-count-mismatch"
  | "save-metadata-row-count-mismatch"
  | "schema-migration-row-count-mismatch"
  | "save-identity-mismatch"
  | "save-metadata-mismatch"
  | "durable-save-identity-verification-failed";

export interface SQLiteDurableSaveIdentityVerificationShell {
  readonly status: "diagnostics-only";
  readonly verificationAttempted: boolean;
  readonly databaseTarget: string;
  readonly pathBoundaryStatus: SQLiteDurableSaveIdentityVerificationPathBoundaryStatus;
  readonly initializationStatus: SQLiteDurableSaveIdentityInitializationStatus;
  readonly insertStatus: SQLiteDurableSaveIdentityInsertStatus;
  readonly verifiedSaveId: string;
  readonly requestedSaveIdentity: SQLiteNormalizedSaveIdentityInsert;
  readonly savesRowCount: number | "not-checked";
  readonly saveMetadataRowCount: number | "not-checked";
  readonly schemaMigrationRows: number | "not-checked";
  readonly identityMatchesRequest: boolean | "not-checked";
  readonly metadataMatchesRequest: boolean | "not-checked";
  readonly durableStorageUsed: boolean;
  readonly repositoryBehaviorEnabled: false;
  readonly executionStatus: SQLiteDurableSaveIdentityVerificationStatus;
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly issues: readonly SQLiteDurableSaveIdentityVerificationIssue[];
  readonly databaseOpened: boolean;
  readonly databaseClosed: boolean;
  readonly mismatchSeedApplied: boolean;
  readonly repositoryMethodsAvailable: false;
  readonly fullRepositoryImplementationAvailable: false;
  readonly createSaveBehaviorAvailable: false;
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
}

export interface CreateSQLiteDurableSaveIdentityVerificationShellOptions {
  readonly durablePathBoundaryId?: string;
  readonly requestedDatabasePath?: string;
  readonly pathBoundary?: SQLiteDurableSaveIdentityPathBoundaryShell;
  readonly schemaMigration?: SQLiteSaveIdentitySchemaMigrationShell;
  readonly request?: SQLiteSaveIdentityInsertRequest;
  readonly seedMismatchedSaveIdentity?: boolean;
}

export function createSQLiteDurableSaveIdentityVerificationShell(
  options: CreateSQLiteDurableSaveIdentityVerificationShellOptions
): SQLiteDurableSaveIdentityVerificationShell {
  const pathBoundary = options.pathBoundary
    ?? createSQLiteDurableSaveIdentityPathBoundaryShell({
      durablePathBoundaryId: options.durablePathBoundaryId,
      requestedDatabasePath: options.requestedDatabasePath
    });
  const requestedSaveIdentity = normalizeSaveIdentity(options.request ?? {});
  const earlyIssues = createEarlyIssues(pathBoundary, requestedSaveIdentity);

  if (earlyIssues.length > 0) {
    return createVerificationShell({
      verificationAttempted: false,
      databaseTarget: pathBoundary.normalizedDatabaseTarget,
      pathBoundaryStatus: pathBoundary.allowedForDurableIdentityPersistence
        ? "allowed"
        : "blocked",
      initializationStatus: "blocked",
      insertStatus: "blocked",
      verifiedSaveId: "",
      requestedSaveIdentity,
      savesRowCount: "not-checked",
      saveMetadataRowCount: "not-checked",
      schemaMigrationRows: "not-checked",
      identityMatchesRequest: "not-checked",
      metadataMatchesRequest: "not-checked",
      durableStorageUsed: false,
      executionStatus: "blocked",
      issues: earlyIssues,
      databaseOpened: false,
      databaseClosed: false,
      mismatchSeedApplied: false
    });
  }

  const seededSaveIdentity = options.seedMismatchedSaveIdentity === true
    ? createMismatchedSaveIdentity(requestedSaveIdentity)
    : requestedSaveIdentity;
  const insert = createSQLiteDurableSaveIdentityInsertShell({
    pathBoundary,
    schemaMigration: options.schemaMigration,
    request: seededSaveIdentity
  });
  const insertIssues = createInsertReadinessIssues({
    initializationStatus: insert.initializationStatus,
    insertStatus: insert.executionStatus
  });

  if (insertIssues.length > 0) {
    return createVerificationShell({
      verificationAttempted: false,
      databaseTarget: pathBoundary.normalizedDatabaseTarget,
      pathBoundaryStatus: "allowed",
      initializationStatus: insert.initializationStatus,
      insertStatus: insert.executionStatus,
      verifiedSaveId: "",
      requestedSaveIdentity,
      savesRowCount: insert.savesRowCount,
      saveMetadataRowCount: insert.saveMetadataRowCount,
      schemaMigrationRows: insert.schemaMigrationRows,
      identityMatchesRequest: "not-checked",
      metadataMatchesRequest: "not-checked",
      durableStorageUsed: insert.durableStorageUsed,
      executionStatus: "blocked",
      issues: insertIssues,
      databaseOpened: false,
      databaseClosed: false,
      mismatchSeedApplied: options.seedMismatchedSaveIdentity === true
    });
  }

  return verifyDurableSaveIdentity({
    databaseTarget: pathBoundary.normalizedDatabaseTarget,
    initializationStatus: insert.initializationStatus,
    insertStatus: insert.executionStatus,
    requestedSaveIdentity,
    mismatchSeedApplied: options.seedMismatchedSaveIdentity === true
  });
}

function verifyDurableSaveIdentity(options: {
  readonly databaseTarget: string;
  readonly initializationStatus: SQLiteDurableSaveIdentityInitializationStatus;
  readonly insertStatus: SQLiteDurableSaveIdentityInsertStatus;
  readonly requestedSaveIdentity: SQLiteNormalizedSaveIdentityInsert;
  readonly mismatchSeedApplied: boolean;
}): SQLiteDurableSaveIdentityVerificationShell {
  let database: DatabaseSync | undefined;
  let databaseOpened = false;
  let databaseClosed = false;

  try {
    database = new DatabaseSync(options.databaseTarget, { readOnly: true });
    databaseOpened = true;

    const saveRow = readSaveRow(database, options.requestedSaveIdentity.saveId);
    const metadataRow = readSaveMetadataRow(
      database,
      options.requestedSaveIdentity.saveId
    );
    const savesRowCount = readRowCount(database, "saves");
    const saveMetadataRowCount = readRowCount(database, "save_metadata");
    const schemaMigrationRows = readRowCount(database, "schema_migrations");
    const identityMatchesRequest = saveRow !== undefined
      && saveIdentityMatches(saveRow, options.requestedSaveIdentity);
    const metadataMatchesRequest = metadataRow !== undefined
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
      databaseTarget: options.databaseTarget,
      pathBoundaryStatus: "allowed",
      initializationStatus: options.initializationStatus,
      insertStatus: options.insertStatus,
      verifiedSaveId: saveRow?.saveId ?? "",
      requestedSaveIdentity: options.requestedSaveIdentity,
      savesRowCount,
      saveMetadataRowCount,
      schemaMigrationRows,
      identityMatchesRequest,
      metadataMatchesRequest,
      durableStorageUsed: true,
      executionStatus: issues.length === 0 ? "verified" : "mismatch",
      issues,
      databaseOpened,
      databaseClosed,
      mismatchSeedApplied: options.mismatchSeedApplied
    });
  } catch {
    if (database && !databaseClosed) {
      database.close();
      databaseClosed = true;
    }

    return createVerificationShell({
      verificationAttempted: true,
      databaseTarget: options.databaseTarget,
      pathBoundaryStatus: "allowed",
      initializationStatus: options.initializationStatus,
      insertStatus: options.insertStatus,
      verifiedSaveId: "",
      requestedSaveIdentity: options.requestedSaveIdentity,
      savesRowCount: "not-checked",
      saveMetadataRowCount: "not-checked",
      schemaMigrationRows: "not-checked",
      identityMatchesRequest: "not-checked",
      metadataMatchesRequest: "not-checked",
      durableStorageUsed: databaseOpened,
      executionStatus: "failed",
      issues: ["durable-save-identity-verification-failed"],
      databaseOpened,
      databaseClosed,
      mismatchSeedApplied: options.mismatchSeedApplied
    });
  }
}

function createEarlyIssues(
  pathBoundary: SQLiteDurableSaveIdentityPathBoundaryShell,
  requestedSaveIdentity: SQLiteNormalizedSaveIdentityInsert
): readonly SQLiteDurableSaveIdentityVerificationIssue[] {
  return Object.freeze([
    ...(pathBoundary.allowedForDurableIdentityPersistence
      ? []
      : [
        "durable-path-boundary-blocked" as const,
        "durable-initialization-not-ready" as const,
        "durable-save-identity-insert-not-ready" as const
      ]),
    ...missingIdentityFieldPieces(requestedSaveIdentity)
  ]);
}

function createInsertReadinessIssues(options: {
  readonly initializationStatus: SQLiteDurableSaveIdentityInitializationStatus;
  readonly insertStatus: SQLiteDurableSaveIdentityInsertStatus;
}): readonly SQLiteDurableSaveIdentityVerificationIssue[] {
  return Object.freeze([
    ...(options.initializationStatus === "initialized"
      ? []
      : ["durable-initialization-not-ready" as const]),
    ...(options.insertStatus === "inserted"
      ? []
      : ["durable-save-identity-insert-not-ready" as const])
  ]);
}

function missingIdentityFieldPieces(
  requestedSaveIdentity: SQLiteNormalizedSaveIdentityInsert
): readonly SQLiteDurableSaveIdentityVerificationIssue[] {
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
}): readonly SQLiteDurableSaveIdentityVerificationIssue[] {
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
  readonly databaseTarget: string;
  readonly pathBoundaryStatus: SQLiteDurableSaveIdentityVerificationPathBoundaryStatus;
  readonly initializationStatus: SQLiteDurableSaveIdentityInitializationStatus;
  readonly insertStatus: SQLiteDurableSaveIdentityInsertStatus;
  readonly verifiedSaveId: string;
  readonly requestedSaveIdentity: SQLiteNormalizedSaveIdentityInsert;
  readonly savesRowCount: number | "not-checked";
  readonly saveMetadataRowCount: number | "not-checked";
  readonly schemaMigrationRows: number | "not-checked";
  readonly identityMatchesRequest: boolean | "not-checked";
  readonly metadataMatchesRequest: boolean | "not-checked";
  readonly durableStorageUsed: boolean;
  readonly executionStatus: SQLiteDurableSaveIdentityVerificationStatus;
  readonly issues: readonly SQLiteDurableSaveIdentityVerificationIssue[];
  readonly databaseOpened: boolean;
  readonly databaseClosed: boolean;
  readonly mismatchSeedApplied: boolean;
}): SQLiteDurableSaveIdentityVerificationShell {
  return Object.freeze({
    status: "diagnostics-only",
    verificationAttempted: options.verificationAttempted,
    databaseTarget: options.databaseTarget,
    pathBoundaryStatus: options.pathBoundaryStatus,
    initializationStatus: options.initializationStatus,
    insertStatus: options.insertStatus,
    verifiedSaveId: options.verifiedSaveId,
    requestedSaveIdentity: options.requestedSaveIdentity,
    savesRowCount: options.savesRowCount,
    saveMetadataRowCount: options.saveMetadataRowCount,
    schemaMigrationRows: options.schemaMigrationRows,
    identityMatchesRequest: options.identityMatchesRequest,
    metadataMatchesRequest: options.metadataMatchesRequest,
    durableStorageUsed: options.durableStorageUsed,
    repositoryBehaviorEnabled: false,
    executionStatus: options.executionStatus,
    diagnosticsOnly: true,
    playerFacing: false,
    issues: Object.freeze([...options.issues]),
    databaseOpened: options.databaseOpened,
    databaseClosed: options.databaseClosed,
    mismatchSeedApplied: options.mismatchSeedApplied,
    repositoryMethodsAvailable: false,
    fullRepositoryImplementationAvailable: false,
    createSaveBehaviorAvailable: false,
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

interface SaveMetadataRow {
  readonly saveId: string;
  readonly schemaVersion: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
