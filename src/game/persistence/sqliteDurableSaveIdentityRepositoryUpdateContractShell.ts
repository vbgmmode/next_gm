import {
  createSQLiteDurableSaveIdentityPathBoundaryShell,
  type SQLiteDurableSaveIdentityPathBoundaryShell
} from "./sqliteDurableSaveIdentityPathBoundaryShell.ts";
import {
  createSQLiteDurableSaveIdentityRepositoryCreateShell
} from "./sqliteDurableSaveIdentityRepositoryCreateShell.ts";
import {
  createSQLiteDurableSaveIdentityRepositoryDeleteContractShell
} from "./sqliteDurableSaveIdentityRepositoryDeleteContractShell.ts";
import {
  createSQLiteDurableSaveIdentityRepositoryListShell
} from "./sqliteDurableSaveIdentityRepositoryListShell.ts";
import {
  createSQLiteDurableSaveIdentityRepositoryReadShell
} from "./sqliteDurableSaveIdentityRepositoryReadShell.ts";

export type SQLiteDurableSaveIdentityRepositoryUpdateContractPathBoundaryStatus =
  | "allowed"
  | "blocked";

export type SQLiteDurableSaveIdentityRepositoryUpdateContractStatus =
  | "blocked"
  | "update-not-implemented";

export type SQLiteDurableSaveIdentityRepositoryUpdateContractIssue =
  | "durable-path-boundary-blocked"
  | "delete-save-identity-not-implemented"
  | "update-save-identity-not-implemented"
  | "update-transaction-boundary-not-approved"
  | "update-field-allowlist-not-approved"
  | "save-metadata-update-not-approved"
  | "schema-migrations-mutation-not-approved";

export interface SQLiteDurableSaveIdentityRepositoryUpdateContractShell {
  readonly status: "diagnostics-only";
  readonly updateContractEvaluated: boolean;
  readonly databaseTarget: string;
  readonly pathBoundaryStatus: SQLiteDurableSaveIdentityRepositoryUpdateContractPathBoundaryStatus;
  readonly durableStorageUsed: false;
  readonly createIdentityShellAvailable: boolean;
  readonly readIdentityShellAvailable: boolean;
  readonly listIdentityShellAvailable: boolean;
  readonly deleteContractShellAvailable: boolean;
  readonly deleteIdentityBehaviorImplemented: false;
  readonly updateIdentityBehaviorImplemented: false;
  readonly repositoryCreateEnabled: boolean;
  readonly repositoryReadEnabled: boolean;
  readonly repositoryListEnabled: boolean;
  readonly repositoryDeleteEnabled: false;
  readonly repositoryUpdateEnabled: false;
  readonly executionStatus: SQLiteDurableSaveIdentityRepositoryUpdateContractStatus;
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly issues: readonly SQLiteDurableSaveIdentityRepositoryUpdateContractIssue[];
  readonly updateBlockedReasons: readonly SQLiteDurableSaveIdentityRepositoryUpdateContractIssue[];
  readonly databaseOpened: false;
  readonly databaseClosed: false;
  readonly sqlExecuted: false;
  readonly updateSqlExecuted: false;
  readonly saveRowsUpdated: false;
  readonly saveMetadataRowsUpdated: false;
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

export interface CreateSQLiteDurableSaveIdentityRepositoryUpdateContractShellOptions {
  readonly durablePathBoundaryId?: string;
  readonly requestedDatabasePath?: string;
  readonly pathBoundary?: SQLiteDurableSaveIdentityPathBoundaryShell;
}

const UPDATE_BLOCKED_REASONS: readonly SQLiteDurableSaveIdentityRepositoryUpdateContractIssue[] =
  Object.freeze([
    "update-save-identity-not-implemented",
    "update-transaction-boundary-not-approved",
    "update-field-allowlist-not-approved",
    "save-metadata-update-not-approved",
    "schema-migrations-mutation-not-approved"
  ]);

export function createSQLiteDurableSaveIdentityRepositoryUpdateContractShell(
  options: CreateSQLiteDurableSaveIdentityRepositoryUpdateContractShellOptions
): SQLiteDurableSaveIdentityRepositoryUpdateContractShell {
  const pathBoundary = options.pathBoundary
    ?? createSQLiteDurableSaveIdentityPathBoundaryShell({
      durablePathBoundaryId: options.durablePathBoundaryId,
      requestedDatabasePath: options.requestedDatabasePath
    });
  const pathAllowed = pathBoundary.allowedForDurableIdentityPersistence;

  return createUpdateContractShell({
    updateContractEvaluated: pathAllowed,
    databaseTarget: pathBoundary.normalizedDatabaseTarget,
    pathBoundaryStatus: pathAllowed ? "allowed" : "blocked",
    repositoryCreateEnabled: pathAllowed,
    repositoryReadEnabled: pathAllowed,
    repositoryListEnabled: pathAllowed,
    executionStatus: pathAllowed ? "update-not-implemented" : "blocked",
    issues: pathAllowed
      ? [
        ...UPDATE_BLOCKED_REASONS,
        "delete-save-identity-not-implemented"
      ]
      : ["durable-path-boundary-blocked"]
  });
}

function createUpdateContractShell(options: {
  readonly updateContractEvaluated: boolean;
  readonly databaseTarget: string;
  readonly pathBoundaryStatus: SQLiteDurableSaveIdentityRepositoryUpdateContractPathBoundaryStatus;
  readonly repositoryCreateEnabled: boolean;
  readonly repositoryReadEnabled: boolean;
  readonly repositoryListEnabled: boolean;
  readonly executionStatus: SQLiteDurableSaveIdentityRepositoryUpdateContractStatus;
  readonly issues: readonly SQLiteDurableSaveIdentityRepositoryUpdateContractIssue[];
}): SQLiteDurableSaveIdentityRepositoryUpdateContractShell {
  return Object.freeze({
    status: "diagnostics-only",
    updateContractEvaluated: options.updateContractEvaluated,
    databaseTarget: options.databaseTarget,
    pathBoundaryStatus: options.pathBoundaryStatus,
    durableStorageUsed: false,
    createIdentityShellAvailable:
      typeof createSQLiteDurableSaveIdentityRepositoryCreateShell === "function",
    readIdentityShellAvailable:
      typeof createSQLiteDurableSaveIdentityRepositoryReadShell === "function",
    listIdentityShellAvailable:
      typeof createSQLiteDurableSaveIdentityRepositoryListShell === "function",
    deleteContractShellAvailable:
      typeof createSQLiteDurableSaveIdentityRepositoryDeleteContractShell === "function",
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
    updateBlockedReasons: Object.freeze([...UPDATE_BLOCKED_REASONS]),
    databaseOpened: false,
    databaseClosed: false,
    sqlExecuted: false,
    updateSqlExecuted: false,
    saveRowsUpdated: false,
    saveMetadataRowsUpdated: false,
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
