import { DatabaseSync } from "node:sqlite";

import {
  createSQLiteDurableSaveIdentityPathBoundaryShell,
  type SQLiteDurableSaveIdentityPathBoundaryShell
} from "./sqliteDurableSaveIdentityPathBoundaryShell.ts";
import {
  createSQLiteDurableSaveIdentityRepositoryCreateShell,
  type SQLiteDurableSaveIdentityRepositoryCreateStatus
} from "./sqliteDurableSaveIdentityRepositoryCreateShell.ts";
import {
  type SQLiteNormalizedSaveIdentityInsert,
  type SQLiteSaveIdentityInsertRequest
} from "./sqliteSaveIdentityInsertShell.ts";
import {
  type SQLiteSaveIdentitySchemaMigrationShell
} from "./sqliteSaveIdentitySchemaMigration.ts";
import {
  SQLITE_SAVE_REPOSITORY_REQUIRED_IDENTITY_FIELDS
} from "./sqliteSaveRepositoryContractShell.ts";

export type SQLiteDurableSaveIdentityRepositoryReadPathBoundaryStatus =
  | "allowed"
  | "blocked";

export type SQLiteDurableSaveIdentityRepositoryReadStatus =
  | "blocked"
  | "failed"
  | "mismatch"
  | "read";

export type SQLiteDurableSaveIdentityRepositoryReadIssue =
  | "durable-path-boundary-blocked"
  | "missing-requested-save-id"
  | "durable-save-identity-create-not-ready"
  | "save-identity-not-found"
  | "save-metadata-not-found"
  | "schema-migration-row-count-mismatch"
  | "save-identity-field-missing"
  | "save-metadata-field-missing"
  | "save-id-mismatch"
  | "durable-save-identity-read-failed";

export interface SQLiteDurableSaveIdentityRepositoryReadShell {
  readonly status: "diagnostics-only";
  readonly readSaveAttempted: boolean;
  readonly databaseTarget: string;
  readonly pathBoundaryStatus: SQLiteDurableSaveIdentityRepositoryReadPathBoundaryStatus;
  readonly createStatus: SQLiteDurableSaveIdentityRepositoryCreateStatus;
  readonly requestedSaveId: string;
  readonly foundSaveId: string;
  readonly saveFound: boolean | "not-checked";
  readonly saveMetadataFound: boolean | "not-checked";
  readonly schemaMigrationRows: number | "not-checked";
  readonly identityMatchesRequest: boolean | "not-checked";
  readonly identityFieldsPresent: boolean | "not-checked";
  readonly metadataFieldsPresent: boolean | "not-checked";
  readonly repositoryReadEnabled: boolean;
  readonly repositoryCreateEnabled: boolean;
  readonly repositoryListEnabled: false;
  readonly repositoryDeleteEnabled: false;
  readonly repositoryUpdateEnabled: false;
  readonly durableStorageUsed: boolean;
  readonly executionStatus: SQLiteDurableSaveIdentityRepositoryReadStatus;
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly issues: readonly SQLiteDurableSaveIdentityRepositoryReadIssue[];
  readonly databaseOpened: boolean;
  readonly databaseClosed: boolean;
  readonly repositoryObjectAvailable: false;
  readonly repositoryMethodsAvailable: false;
  readonly fullRepositoryImplementationAvailable: false;
  readonly listBehaviorAvailable: false;
  readonly deleteBehaviorAvailable: false;
  readonly metadataUpdateBehaviorAvailable: false;
  readonly draftStateRead: false;
  readonly rosterStateRead: false;
  readonly matchStateRead: false;
  readonly showStateRead: false;
  readonly businessStateRead: false;
  readonly fanSocialStateRead: false;
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

export interface CreateSQLiteDurableSaveIdentityRepositoryReadShellOptions {
  readonly durablePathBoundaryId?: string;
  readonly requestedDatabasePath?: string;
  readonly pathBoundary?: SQLiteDurableSaveIdentityPathBoundaryShell;
  readonly schemaMigration?: SQLiteSaveIdentitySchemaMigrationShell;
  readonly request?: SQLiteSaveIdentityInsertRequest;
  readonly requestedSaveId?: string;
}

export function createSQLiteDurableSaveIdentityRepositoryReadShell(
  options: CreateSQLiteDurableSaveIdentityRepositoryReadShellOptions
): SQLiteDurableSaveIdentityRepositoryReadShell {
  const pathBoundary = options.pathBoundary
    ?? createSQLiteDurableSaveIdentityPathBoundaryShell({
      durablePathBoundaryId: options.durablePathBoundaryId,
      requestedDatabasePath: options.requestedDatabasePath
    });
  const requestedSaveId = normalizeString(
    options.requestedSaveId ?? options.request?.saveId
  );
  const earlyIssues = createEarlyIssues(pathBoundary, requestedSaveId);

  if (earlyIssues.length > 0) {
    return createReadShell({
      readSaveAttempted: false,
      databaseTarget: pathBoundary.normalizedDatabaseTarget,
      pathBoundaryStatus: pathBoundary.allowedForDurableIdentityPersistence
        ? "allowed"
        : "blocked",
      createStatus: "blocked",
      requestedSaveId,
      foundSaveId: "",
      saveFound: "not-checked",
      saveMetadataFound: "not-checked",
      schemaMigrationRows: "not-checked",
      identityMatchesRequest: "not-checked",
      identityFieldsPresent: "not-checked",
      metadataFieldsPresent: "not-checked",
      repositoryReadEnabled: false,
      repositoryCreateEnabled: false,
      durableStorageUsed: false,
      executionStatus: "blocked",
      issues: earlyIssues,
      databaseOpened: false,
      databaseClosed: false
    });
  }

  const createResult = createSQLiteDurableSaveIdentityRepositoryCreateShell({
    pathBoundary,
    schemaMigration: options.schemaMigration,
    request: options.request
  });

  if (!isReadableCreateStatus(createResult.executionStatus)) {
    return createReadShell({
      readSaveAttempted: false,
      databaseTarget: pathBoundary.normalizedDatabaseTarget,
      pathBoundaryStatus: "allowed",
      createStatus: createResult.executionStatus,
      requestedSaveId,
      foundSaveId: "",
      saveFound: "not-checked",
      saveMetadataFound: "not-checked",
      schemaMigrationRows: createResult.schemaMigrationRows,
      identityMatchesRequest: "not-checked",
      identityFieldsPresent: "not-checked",
      metadataFieldsPresent: "not-checked",
      repositoryReadEnabled: false,
      repositoryCreateEnabled: createResult.repositoryCreateEnabled,
      durableStorageUsed: createResult.durableStorageUsed,
      executionStatus: "blocked",
      issues: ["durable-save-identity-create-not-ready"],
      databaseOpened: false,
      databaseClosed: false
    });
  }

  return readDurableSaveIdentity({
    databaseTarget: pathBoundary.normalizedDatabaseTarget,
    createStatus: createResult.executionStatus,
    requestedSaveId,
    createDurableStorageUsed: createResult.durableStorageUsed,
    repositoryCreateEnabled: createResult.repositoryCreateEnabled
  });
}

function readDurableSaveIdentity(options: {
  readonly databaseTarget: string;
  readonly createStatus: SQLiteDurableSaveIdentityRepositoryCreateStatus;
  readonly requestedSaveId: string;
  readonly createDurableStorageUsed: boolean;
  readonly repositoryCreateEnabled: boolean;
}): SQLiteDurableSaveIdentityRepositoryReadShell {
  let database: DatabaseSync | undefined;
  let databaseOpened = false;
  let databaseClosed = false;

  try {
    database = new DatabaseSync(options.databaseTarget, { readOnly: true });
    databaseOpened = true;

    const saveRow = readSaveRow(database, options.requestedSaveId);
    const metadataRow = readSaveMetadataRow(database, options.requestedSaveId);
    const schemaMigrationRows = readRowCount(database, "schema_migrations");
    const saveFound = saveRow !== undefined;
    const saveMetadataFound = metadataRow !== undefined;
    const foundSaveId = saveRow?.saveId ?? "";
    const identityMatchesRequest =
      saveFound && saveRow.saveId === options.requestedSaveId;
    const identityFieldsPresent = saveFound
      && saveIdentityFieldsPresent(saveRow);
    const metadataFieldsPresent = saveMetadataFound
      && saveMetadataFieldsPresent(metadataRow);
    const issues = createReadIssues({
      saveFound,
      saveMetadataFound,
      schemaMigrationRows,
      identityMatchesRequest,
      identityFieldsPresent,
      metadataFieldsPresent
    });

    database.close();
    databaseClosed = true;

    return createReadShell({
      readSaveAttempted: true,
      databaseTarget: options.databaseTarget,
      pathBoundaryStatus: "allowed",
      createStatus: options.createStatus,
      requestedSaveId: options.requestedSaveId,
      foundSaveId,
      saveFound,
      saveMetadataFound,
      schemaMigrationRows,
      identityMatchesRequest,
      identityFieldsPresent,
      metadataFieldsPresent,
      repositoryReadEnabled: true,
      repositoryCreateEnabled: options.repositoryCreateEnabled,
      durableStorageUsed: true,
      executionStatus: issues.length === 0 ? "read" : "mismatch",
      issues,
      databaseOpened,
      databaseClosed
    });
  } catch {
    if (database && !databaseClosed) {
      database.close();
      databaseClosed = true;
    }

    return createReadShell({
      readSaveAttempted: true,
      databaseTarget: options.databaseTarget,
      pathBoundaryStatus: "allowed",
      createStatus: options.createStatus,
      requestedSaveId: options.requestedSaveId,
      foundSaveId: "",
      saveFound: "not-checked",
      saveMetadataFound: "not-checked",
      schemaMigrationRows: "not-checked",
      identityMatchesRequest: "not-checked",
      identityFieldsPresent: "not-checked",
      metadataFieldsPresent: "not-checked",
      repositoryReadEnabled: true,
      repositoryCreateEnabled: options.repositoryCreateEnabled,
      durableStorageUsed: options.createDurableStorageUsed || databaseOpened,
      executionStatus: "failed",
      issues: ["durable-save-identity-read-failed"],
      databaseOpened,
      databaseClosed
    });
  }
}

function createEarlyIssues(
  pathBoundary: SQLiteDurableSaveIdentityPathBoundaryShell,
  requestedSaveId: string
): readonly SQLiteDurableSaveIdentityRepositoryReadIssue[] {
  return Object.freeze([
    ...(pathBoundary.allowedForDurableIdentityPersistence
      ? []
      : ["durable-path-boundary-blocked" as const]),
    ...(requestedSaveId ? [] : ["missing-requested-save-id" as const])
  ]);
}

function isReadableCreateStatus(
  createStatus: SQLiteDurableSaveIdentityRepositoryCreateStatus
): boolean {
  return createStatus === "created"
    || createStatus === "duplicate-save-identity";
}

function createReadIssues(options: {
  readonly saveFound: boolean;
  readonly saveMetadataFound: boolean;
  readonly schemaMigrationRows: number;
  readonly identityMatchesRequest: boolean;
  readonly identityFieldsPresent: boolean;
  readonly metadataFieldsPresent: boolean;
}): readonly SQLiteDurableSaveIdentityRepositoryReadIssue[] {
  return Object.freeze([
    ...(options.saveFound ? [] : ["save-identity-not-found" as const]),
    ...(options.saveMetadataFound ? [] : ["save-metadata-not-found" as const]),
    ...(options.schemaMigrationRows === 1
      ? []
      : ["schema-migration-row-count-mismatch" as const]),
    ...(options.identityFieldsPresent
      ? []
      : ["save-identity-field-missing" as const]),
    ...(options.metadataFieldsPresent
      ? []
      : ["save-metadata-field-missing" as const]),
    ...(options.identityMatchesRequest ? [] : ["save-id-mismatch" as const])
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
  tableName: "schema_migrations"
): number {
  const row = database.prepare(
    `SELECT COUNT(*) AS rowCount FROM ${tableName}`
  ).get() as { readonly rowCount: number };

  return row.rowCount;
}

function saveIdentityFieldsPresent(
  saveRow: SQLiteNormalizedSaveIdentityInsert
): boolean {
  return SQLITE_SAVE_REPOSITORY_REQUIRED_IDENTITY_FIELDS.every(
    (fieldName) => saveRow[fieldName].length > 0
  );
}

function saveMetadataFieldsPresent(metadataRow: SaveMetadataRow): boolean {
  return metadataRow.saveId.length > 0
    && metadataRow.schemaVersion.length > 0
    && metadataRow.createdAt.length > 0
    && metadataRow.updatedAt.length > 0;
}

function createReadShell(options: {
  readonly readSaveAttempted: boolean;
  readonly databaseTarget: string;
  readonly pathBoundaryStatus: SQLiteDurableSaveIdentityRepositoryReadPathBoundaryStatus;
  readonly createStatus: SQLiteDurableSaveIdentityRepositoryCreateStatus;
  readonly requestedSaveId: string;
  readonly foundSaveId: string;
  readonly saveFound: boolean | "not-checked";
  readonly saveMetadataFound: boolean | "not-checked";
  readonly schemaMigrationRows: number | "not-checked";
  readonly identityMatchesRequest: boolean | "not-checked";
  readonly identityFieldsPresent: boolean | "not-checked";
  readonly metadataFieldsPresent: boolean | "not-checked";
  readonly repositoryReadEnabled: boolean;
  readonly repositoryCreateEnabled: boolean;
  readonly durableStorageUsed: boolean;
  readonly executionStatus: SQLiteDurableSaveIdentityRepositoryReadStatus;
  readonly issues: readonly SQLiteDurableSaveIdentityRepositoryReadIssue[];
  readonly databaseOpened: boolean;
  readonly databaseClosed: boolean;
}): SQLiteDurableSaveIdentityRepositoryReadShell {
  return Object.freeze({
    status: "diagnostics-only",
    readSaveAttempted: options.readSaveAttempted,
    databaseTarget: options.databaseTarget,
    pathBoundaryStatus: options.pathBoundaryStatus,
    createStatus: options.createStatus,
    requestedSaveId: options.requestedSaveId,
    foundSaveId: options.foundSaveId,
    saveFound: options.saveFound,
    saveMetadataFound: options.saveMetadataFound,
    schemaMigrationRows: options.schemaMigrationRows,
    identityMatchesRequest: options.identityMatchesRequest,
    identityFieldsPresent: options.identityFieldsPresent,
    metadataFieldsPresent: options.metadataFieldsPresent,
    repositoryReadEnabled: options.repositoryReadEnabled,
    repositoryCreateEnabled: options.repositoryCreateEnabled,
    repositoryListEnabled: false,
    repositoryDeleteEnabled: false,
    repositoryUpdateEnabled: false,
    durableStorageUsed: options.durableStorageUsed,
    executionStatus: options.executionStatus,
    diagnosticsOnly: true,
    playerFacing: false,
    issues: Object.freeze([...options.issues]),
    databaseOpened: options.databaseOpened,
    databaseClosed: options.databaseClosed,
    repositoryObjectAvailable: false,
    repositoryMethodsAvailable: false,
    fullRepositoryImplementationAvailable: false,
    listBehaviorAvailable: false,
    deleteBehaviorAvailable: false,
    metadataUpdateBehaviorAvailable: false,
    draftStateRead: false,
    rosterStateRead: false,
    matchStateRead: false,
    showStateRead: false,
    businessStateRead: false,
    fanSocialStateRead: false,
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

function normalizeString(value: string | undefined): string {
  return value?.trim() ?? "";
}

interface SaveMetadataRow {
  readonly saveId: string;
  readonly schemaVersion: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
