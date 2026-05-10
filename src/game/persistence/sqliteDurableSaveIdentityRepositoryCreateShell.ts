import {
  type SQLiteDurableSaveIdentityInitializationStatus
} from "./sqliteDurableSaveIdentityInitializationShell.ts";
import {
  type SQLiteDurableSaveIdentityInsertStatus
} from "./sqliteDurableSaveIdentityInsertShell.ts";
import {
  createSQLiteDurableSaveIdentityPathBoundaryShell,
  type SQLiteDurableSaveIdentityPathBoundaryShell
} from "./sqliteDurableSaveIdentityPathBoundaryShell.ts";
import {
  createSQLiteDurableSaveIdentityVerificationShell,
  type SQLiteDurableSaveIdentityVerificationStatus
} from "./sqliteDurableSaveIdentityVerificationShell.ts";
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

export type SQLiteDurableSaveIdentityRepositoryCreatePathBoundaryStatus =
  | "allowed"
  | "blocked";

export type SQLiteDurableSaveIdentityRepositoryCreateStatus =
  | "blocked"
  | "duplicate-save-identity"
  | "failed"
  | "created";

export type SQLiteDurableSaveIdentityRepositoryCreateIssue =
  | "durable-path-boundary-blocked"
  | "durable-initialization-not-ready"
  | "durable-save-identity-insert-not-ready"
  | "durable-save-identity-verification-not-ready"
  | `missing-save-identity-field:${SQLiteSaveIdentityColumnName}`
  | "duplicate-save-identity"
  | "durable-save-identity-create-failed";

export interface SQLiteDurableSaveIdentityRepositoryCreateShell {
  readonly status: "diagnostics-only";
  readonly createSaveAttempted: boolean;
  readonly databaseTarget: string;
  readonly pathBoundaryStatus: SQLiteDurableSaveIdentityRepositoryCreatePathBoundaryStatus;
  readonly initializationStatus: SQLiteDurableSaveIdentityInitializationStatus;
  readonly insertStatus: SQLiteDurableSaveIdentityInsertStatus;
  readonly verificationStatus: SQLiteDurableSaveIdentityVerificationStatus;
  readonly createdSaveId: string;
  readonly requestedSaveIdentity: SQLiteNormalizedSaveIdentityInsert;
  readonly durableStorageUsed: boolean;
  readonly repositoryCreateEnabled: boolean;
  readonly repositoryLoadEnabled: false;
  readonly repositoryListEnabled: false;
  readonly repositoryDeleteEnabled: false;
  readonly repositoryUpdateEnabled: false;
  readonly executionStatus: SQLiteDurableSaveIdentityRepositoryCreateStatus;
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly issues: readonly SQLiteDurableSaveIdentityRepositoryCreateIssue[];
  readonly insertedSaveRows: number | "not-checked";
  readonly insertedSaveMetadataRows: number | "not-checked";
  readonly schemaMigrationRows: number | "not-checked";
  readonly savesRowCount: number | "not-checked";
  readonly saveMetadataRowCount: number | "not-checked";
  readonly verificationIdentityMatchesRequest: boolean | "not-checked";
  readonly verificationMetadataMatchesRequest: boolean | "not-checked";
  readonly repositoryObjectAvailable: false;
  readonly repositoryMethodsAvailable: false;
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
}

export interface CreateSQLiteDurableSaveIdentityRepositoryCreateShellOptions {
  readonly durablePathBoundaryId?: string;
  readonly requestedDatabasePath?: string;
  readonly pathBoundary?: SQLiteDurableSaveIdentityPathBoundaryShell;
  readonly schemaMigration?: SQLiteSaveIdentitySchemaMigrationShell;
  readonly request?: SQLiteSaveIdentityInsertRequest;
}

export function createSQLiteDurableSaveIdentityRepositoryCreateShell(
  options: CreateSQLiteDurableSaveIdentityRepositoryCreateShellOptions
): SQLiteDurableSaveIdentityRepositoryCreateShell {
  const pathBoundary = options.pathBoundary
    ?? createSQLiteDurableSaveIdentityPathBoundaryShell({
      durablePathBoundaryId: options.durablePathBoundaryId,
      requestedDatabasePath: options.requestedDatabasePath
    });
  const requestedSaveIdentity = normalizeSaveIdentity(options.request ?? {});
  const preflightIssues = createPreflightIssues(
    pathBoundary,
    requestedSaveIdentity
  );

  if (preflightIssues.length > 0) {
    return createRepositoryCreateShell({
      createSaveAttempted: false,
      databaseTarget: pathBoundary.normalizedDatabaseTarget,
      pathBoundaryStatus: pathBoundary.allowedForDurableIdentityPersistence
        ? "allowed"
        : "blocked",
      initializationStatus: "blocked",
      insertStatus: "blocked",
      verificationStatus: "blocked",
      createdSaveId: "",
      requestedSaveIdentity,
      durableStorageUsed: false,
      repositoryCreateEnabled: false,
      executionStatus: "blocked",
      issues: preflightIssues,
      insertedSaveRows: "not-checked",
      insertedSaveMetadataRows: "not-checked",
      schemaMigrationRows: "not-checked",
      savesRowCount: "not-checked",
      saveMetadataRowCount: "not-checked",
      verificationIdentityMatchesRequest: "not-checked",
      verificationMetadataMatchesRequest: "not-checked"
    });
  }

  const verification = createSQLiteDurableSaveIdentityVerificationShell({
    pathBoundary,
    schemaMigration: options.schemaMigration,
    request: requestedSaveIdentity
  });

  return createRepositoryCreateShell({
    createSaveAttempted: true,
    databaseTarget: pathBoundary.normalizedDatabaseTarget,
    pathBoundaryStatus: "allowed",
    initializationStatus: verification.initializationStatus,
    insertStatus: verification.insertStatus,
    verificationStatus: verification.executionStatus,
    createdSaveId: verification.executionStatus === "verified"
      ? verification.verifiedSaveId
      : "",
    requestedSaveIdentity,
    durableStorageUsed: verification.durableStorageUsed,
    repositoryCreateEnabled: true,
    executionStatus: createExecutionStatus({
      insertStatus: verification.insertStatus,
      verificationStatus: verification.executionStatus
    }),
    issues: createVerificationIssues({
      insertStatus: verification.insertStatus,
      verificationStatus: verification.executionStatus
    }),
    insertedSaveRows: verification.executionStatus === "verified" ? 1 : 0,
    insertedSaveMetadataRows: verification.executionStatus === "verified" ? 1 : 0,
    schemaMigrationRows: verification.schemaMigrationRows,
    savesRowCount: verification.savesRowCount,
    saveMetadataRowCount: verification.saveMetadataRowCount,
    verificationIdentityMatchesRequest: verification.identityMatchesRequest,
    verificationMetadataMatchesRequest: verification.metadataMatchesRequest
  });
}

function createPreflightIssues(
  pathBoundary: SQLiteDurableSaveIdentityPathBoundaryShell,
  requestedSaveIdentity: SQLiteNormalizedSaveIdentityInsert
): readonly SQLiteDurableSaveIdentityRepositoryCreateIssue[] {
  return Object.freeze([
    ...(pathBoundary.allowedForDurableIdentityPersistence
      ? []
      : [
        "durable-path-boundary-blocked" as const,
        "durable-initialization-not-ready" as const,
        "durable-save-identity-insert-not-ready" as const,
        "durable-save-identity-verification-not-ready" as const
      ]),
    ...missingIdentityFieldPieces(requestedSaveIdentity)
  ]);
}

function createExecutionStatus(options: {
  readonly insertStatus: SQLiteDurableSaveIdentityInsertStatus;
  readonly verificationStatus: SQLiteDurableSaveIdentityVerificationStatus;
}): SQLiteDurableSaveIdentityRepositoryCreateStatus {
  if (options.verificationStatus === "verified") {
    return "created";
  }

  if (options.insertStatus === "duplicate-save-identity") {
    return "duplicate-save-identity";
  }

  return options.verificationStatus === "failed" ? "failed" : "blocked";
}

function createVerificationIssues(options: {
  readonly insertStatus: SQLiteDurableSaveIdentityInsertStatus;
  readonly verificationStatus: SQLiteDurableSaveIdentityVerificationStatus;
}): readonly SQLiteDurableSaveIdentityRepositoryCreateIssue[] {
  if (options.verificationStatus === "verified") {
    return Object.freeze([]);
  }

  if (options.insertStatus === "duplicate-save-identity") {
    return Object.freeze([
      "duplicate-save-identity",
      "durable-save-identity-verification-not-ready"
    ]);
  }

  return Object.freeze([
    "durable-save-identity-insert-not-ready",
    "durable-save-identity-verification-not-ready"
  ]);
}

function missingIdentityFieldPieces(
  requestedSaveIdentity: SQLiteNormalizedSaveIdentityInsert
): readonly SQLiteDurableSaveIdentityRepositoryCreateIssue[] {
  return SQLITE_SAVE_REPOSITORY_REQUIRED_IDENTITY_FIELDS
    .filter((fieldName) => !requestedSaveIdentity[fieldName])
    .map((fieldName) => `missing-save-identity-field:${fieldName}` as const);
}

function createRepositoryCreateShell(options: {
  readonly createSaveAttempted: boolean;
  readonly databaseTarget: string;
  readonly pathBoundaryStatus: SQLiteDurableSaveIdentityRepositoryCreatePathBoundaryStatus;
  readonly initializationStatus: SQLiteDurableSaveIdentityInitializationStatus;
  readonly insertStatus: SQLiteDurableSaveIdentityInsertStatus;
  readonly verificationStatus: SQLiteDurableSaveIdentityVerificationStatus;
  readonly createdSaveId: string;
  readonly requestedSaveIdentity: SQLiteNormalizedSaveIdentityInsert;
  readonly durableStorageUsed: boolean;
  readonly repositoryCreateEnabled: boolean;
  readonly executionStatus: SQLiteDurableSaveIdentityRepositoryCreateStatus;
  readonly issues: readonly SQLiteDurableSaveIdentityRepositoryCreateIssue[];
  readonly insertedSaveRows: number | "not-checked";
  readonly insertedSaveMetadataRows: number | "not-checked";
  readonly schemaMigrationRows: number | "not-checked";
  readonly savesRowCount: number | "not-checked";
  readonly saveMetadataRowCount: number | "not-checked";
  readonly verificationIdentityMatchesRequest: boolean | "not-checked";
  readonly verificationMetadataMatchesRequest: boolean | "not-checked";
}): SQLiteDurableSaveIdentityRepositoryCreateShell {
  return Object.freeze({
    status: "diagnostics-only",
    createSaveAttempted: options.createSaveAttempted,
    databaseTarget: options.databaseTarget,
    pathBoundaryStatus: options.pathBoundaryStatus,
    initializationStatus: options.initializationStatus,
    insertStatus: options.insertStatus,
    verificationStatus: options.verificationStatus,
    createdSaveId: options.createdSaveId,
    requestedSaveIdentity: options.requestedSaveIdentity,
    durableStorageUsed: options.durableStorageUsed,
    repositoryCreateEnabled: options.repositoryCreateEnabled,
    repositoryLoadEnabled: false,
    repositoryListEnabled: false,
    repositoryDeleteEnabled: false,
    repositoryUpdateEnabled: false,
    executionStatus: options.executionStatus,
    diagnosticsOnly: true,
    playerFacing: false,
    issues: Object.freeze([...options.issues]),
    insertedSaveRows: options.insertedSaveRows,
    insertedSaveMetadataRows: options.insertedSaveMetadataRows,
    schemaMigrationRows: options.schemaMigrationRows,
    savesRowCount: options.savesRowCount,
    saveMetadataRowCount: options.saveMetadataRowCount,
    verificationIdentityMatchesRequest: options.verificationIdentityMatchesRequest,
    verificationMetadataMatchesRequest: options.verificationMetadataMatchesRequest,
    repositoryObjectAvailable: false,
    repositoryMethodsAvailable: false,
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
