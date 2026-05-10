import {
  createSQLiteDurableSaveIdentityPathBoundaryShell,
  type SQLiteDurableSaveIdentityPathBoundaryShell
} from "./sqliteDurableSaveIdentityPathBoundaryShell.ts";
import {
  createSQLiteDurableSaveIdentityRepositoryCreateShell
} from "./sqliteDurableSaveIdentityRepositoryCreateShell.ts";
import {
  createSQLiteDurableSaveIdentityRepositoryListShell
} from "./sqliteDurableSaveIdentityRepositoryListShell.ts";
import {
  createSQLiteDurableSaveIdentityRepositoryReadShell
} from "./sqliteDurableSaveIdentityRepositoryReadShell.ts";

export type SQLiteDurableSaveIdentityRepositoryDeleteContractPathBoundaryStatus =
  | "allowed"
  | "blocked";

export type SQLiteDurableSaveIdentityRepositoryDeleteContractStatus =
  | "blocked"
  | "delete-not-implemented";

export type SQLiteDurableSaveIdentityRepositoryDeleteContractIssue =
  | "durable-path-boundary-blocked"
  | "delete-save-identity-not-implemented"
  | "update-save-identity-not-implemented"
  | "delete-transaction-boundary-not-approved"
  | "delete-save-metadata-cascade-not-approved"
  | "schema-migrations-mutation-not-approved";

export interface SQLiteDurableSaveIdentityRepositoryDeleteContractShell {
  readonly status: "diagnostics-only";
  readonly deleteContractEvaluated: boolean;
  readonly databaseTarget: string;
  readonly pathBoundaryStatus: SQLiteDurableSaveIdentityRepositoryDeleteContractPathBoundaryStatus;
  readonly durableStorageUsed: false;
  readonly createIdentityShellAvailable: boolean;
  readonly readIdentityShellAvailable: boolean;
  readonly listIdentityShellAvailable: boolean;
  readonly deleteIdentityBehaviorImplemented: false;
  readonly updateIdentityBehaviorImplemented: false;
  readonly repositoryCreateEnabled: boolean;
  readonly repositoryReadEnabled: boolean;
  readonly repositoryListEnabled: boolean;
  readonly repositoryDeleteEnabled: false;
  readonly repositoryUpdateEnabled: false;
  readonly executionStatus: SQLiteDurableSaveIdentityRepositoryDeleteContractStatus;
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly issues: readonly SQLiteDurableSaveIdentityRepositoryDeleteContractIssue[];
  readonly deleteBlockedReasons: readonly SQLiteDurableSaveIdentityRepositoryDeleteContractIssue[];
  readonly databaseOpened: false;
  readonly databaseClosed: false;
  readonly sqlExecuted: false;
  readonly deleteSqlExecuted: false;
  readonly saveRowsDeleted: false;
  readonly saveMetadataRowsDeleted: false;
  readonly schemaMigrationsMutated: false;
  readonly repositoryObjectAvailable: false;
  readonly repositoryMethodsAvailable: false;
  readonly fullRepositoryImplementationAvailable: false;
  readonly createSaveBehaviorAvailable: true;
  readonly readSaveIdentityBehaviorAvailable: true;
  readonly listSaveIdentityBehaviorAvailable: true;
  readonly deleteBehaviorAvailable: false;
  readonly metadataUpdateBehaviorAvailable: false;
  readonly gameplayPayloadBehaviorAvailable: false;
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

export interface CreateSQLiteDurableSaveIdentityRepositoryDeleteContractShellOptions {
  readonly durablePathBoundaryId?: string;
  readonly requestedDatabasePath?: string;
  readonly pathBoundary?: SQLiteDurableSaveIdentityPathBoundaryShell;
}

const DELETE_BLOCKED_REASONS: readonly SQLiteDurableSaveIdentityRepositoryDeleteContractIssue[] =
  Object.freeze([
    "delete-save-identity-not-implemented",
    "delete-transaction-boundary-not-approved",
    "delete-save-metadata-cascade-not-approved",
    "schema-migrations-mutation-not-approved"
  ]);

export function createSQLiteDurableSaveIdentityRepositoryDeleteContractShell(
  options: CreateSQLiteDurableSaveIdentityRepositoryDeleteContractShellOptions
): SQLiteDurableSaveIdentityRepositoryDeleteContractShell {
  const pathBoundary = options.pathBoundary
    ?? createSQLiteDurableSaveIdentityPathBoundaryShell({
      durablePathBoundaryId: options.durablePathBoundaryId,
      requestedDatabasePath: options.requestedDatabasePath
    });
  const pathAllowed = pathBoundary.allowedForDurableIdentityPersistence;

  return createDeleteContractShell({
    deleteContractEvaluated: pathAllowed,
    databaseTarget: pathBoundary.normalizedDatabaseTarget,
    pathBoundaryStatus: pathAllowed ? "allowed" : "blocked",
    repositoryCreateEnabled: pathAllowed,
    repositoryReadEnabled: pathAllowed,
    repositoryListEnabled: pathAllowed,
    executionStatus: pathAllowed ? "delete-not-implemented" : "blocked",
    issues: pathAllowed
      ? [
        ...DELETE_BLOCKED_REASONS,
        "update-save-identity-not-implemented"
      ]
      : ["durable-path-boundary-blocked"]
  });
}

function createDeleteContractShell(options: {
  readonly deleteContractEvaluated: boolean;
  readonly databaseTarget: string;
  readonly pathBoundaryStatus: SQLiteDurableSaveIdentityRepositoryDeleteContractPathBoundaryStatus;
  readonly repositoryCreateEnabled: boolean;
  readonly repositoryReadEnabled: boolean;
  readonly repositoryListEnabled: boolean;
  readonly executionStatus: SQLiteDurableSaveIdentityRepositoryDeleteContractStatus;
  readonly issues: readonly SQLiteDurableSaveIdentityRepositoryDeleteContractIssue[];
}): SQLiteDurableSaveIdentityRepositoryDeleteContractShell {
  return Object.freeze({
    status: "diagnostics-only",
    deleteContractEvaluated: options.deleteContractEvaluated,
    databaseTarget: options.databaseTarget,
    pathBoundaryStatus: options.pathBoundaryStatus,
    durableStorageUsed: false,
    createIdentityShellAvailable:
      typeof createSQLiteDurableSaveIdentityRepositoryCreateShell === "function",
    readIdentityShellAvailable:
      typeof createSQLiteDurableSaveIdentityRepositoryReadShell === "function",
    listIdentityShellAvailable:
      typeof createSQLiteDurableSaveIdentityRepositoryListShell === "function",
    deleteIdentityBehaviorImplemented: false,
    updateIdentityBehaviorImplemented: false,
    repositoryCreateEnabled: options.repositoryCreateEnabled,
    repositoryReadEnabled: options.repositoryReadEnabled,
    repositoryListEnabled: options.repositoryListEnabled,
    repositoryDeleteEnabled: false,
    repositoryUpdateEnabled: false,
    executionStatus: options.executionStatus,
    diagnosticsOnly: true,
    playerFacing: false,
    issues: Object.freeze([...options.issues]),
    deleteBlockedReasons: Object.freeze([...DELETE_BLOCKED_REASONS]),
    databaseOpened: false,
    databaseClosed: false,
    sqlExecuted: false,
    deleteSqlExecuted: false,
    saveRowsDeleted: false,
    saveMetadataRowsDeleted: false,
    schemaMigrationsMutated: false,
    repositoryObjectAvailable: false,
    repositoryMethodsAvailable: false,
    fullRepositoryImplementationAvailable: false,
    createSaveBehaviorAvailable: true,
    readSaveIdentityBehaviorAvailable: true,
    listSaveIdentityBehaviorAvailable: true,
    deleteBehaviorAvailable: false,
    metadataUpdateBehaviorAvailable: false,
    gameplayPayloadBehaviorAvailable: false,
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
