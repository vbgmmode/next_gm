import {
  createSQLiteConnectionHealthShell,
  type SQLiteConnectionHealthShell
} from "./sqliteConnectionHealth.ts";
import {
  createSQLiteMigrationTrackingInsertShell,
  type SQLiteMigrationTrackingInsertStatus
} from "./sqliteMigrationTrackingInsertShell.ts";
import {
  createSQLiteSaveIdentityInsertShell,
  type SQLiteSaveIdentityInsertRequest,
  type SQLiteSaveIdentityInsertStatus
} from "./sqliteSaveIdentityInsertShell.ts";
import {
  createSQLiteSaveIdentitySchemaExecutionShell,
  type SQLiteSaveIdentitySchemaExecutionStatus
} from "./sqliteSaveIdentitySchemaExecutionShell.ts";
import {
  createSQLiteSaveIdentitySchemaMigrationShell,
  type SQLiteSaveIdentitySchemaMigrationShell
} from "./sqliteSaveIdentitySchemaMigration.ts";
import {
  createSQLiteSaveIdentityVerificationShell,
  type SQLiteSaveIdentityVerificationStatus
} from "./sqliteSaveIdentityVerificationShell.ts";
import {
  createSQLiteSaveRepositoryContractShell,
  SQLITE_SAVE_REPOSITORY_OPERATIONS,
  type SQLiteSaveRepositoryContractShell,
  type SQLiteSaveRepositoryReadiness
} from "./sqliteSaveRepositoryContractShell.ts";

export type SQLiteSaveRepositoryOrchestrationStatus =
  | "blocked"
  | "failed"
  | "mismatch"
  | "orchestrated";

export type SQLiteSaveRepositoryOrchestrationIssue =
  | "repository-contract-not-ready"
  | "schema-execution-not-ready"
  | "migration-tracking-not-ready"
  | "save-identity-insert-not-ready"
  | "save-identity-verification-not-ready";

export interface SQLiteSaveRepositoryOrchestrationShell {
  readonly status: "diagnostics-only";
  readonly orchestrationAttempted: boolean;
  readonly repositoryContractReadiness: SQLiteSaveRepositoryReadiness;
  readonly schemaExecutionStatus: SQLiteSaveIdentitySchemaExecutionStatus;
  readonly migrationTrackingStatus: SQLiteMigrationTrackingInsertStatus;
  readonly saveIdentityInsertStatus: SQLiteSaveIdentityInsertStatus;
  readonly saveIdentityVerificationStatus: SQLiteSaveIdentityVerificationStatus;
  readonly verifiedSaveId: string;
  readonly persisted: false | "test-safe-memory-only";
  readonly durableStorageUsed: false;
  readonly fullRepositoryBehaviorEnabled: false;
  readonly executionStatus: SQLiteSaveRepositoryOrchestrationStatus;
  readonly issues: readonly SQLiteSaveRepositoryOrchestrationIssue[];
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly repositoryMethodsAvailable: false;
  readonly durableDatabasePathAvailable: false;
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

export interface CreateSQLiteSaveRepositoryOrchestrationShellOptions {
  readonly connectionTarget?: string;
  readonly connectionHealth?: SQLiteConnectionHealthShell;
  readonly schemaMigration?: SQLiteSaveIdentitySchemaMigrationShell;
  readonly repositoryContract?: SQLiteSaveRepositoryContractShell;
  readonly request?: SQLiteSaveIdentityInsertRequest;
  readonly seedMismatchedSaveIdentity?: boolean;
}

const REPOSITORY_CONTRACT_ID =
  "sqlite-save-repository-orchestration-contract-v0-1";

export function createSQLiteSaveRepositoryOrchestrationShell(
  options: CreateSQLiteSaveRepositoryOrchestrationShellOptions
): SQLiteSaveRepositoryOrchestrationShell {
  const connectionTarget = options.connectionTarget ?? ":memory:";
  const connectionHealth = options.connectionHealth
    ?? createSQLiteConnectionHealthShell({ connectionTarget });
  const schemaMigration =
    options.schemaMigration ?? createSQLiteSaveIdentitySchemaMigrationShell();
  const repositoryContract = options.repositoryContract
    ?? createSQLiteSaveRepositoryContractShell({
      repositoryContractId: REPOSITORY_CONTRACT_ID,
      supportedOperations: SQLITE_SAVE_REPOSITORY_OPERATIONS,
      schemaMigration,
      connectionHealth,
      migrationRunner: schemaMigration.runnerSummary
    });
  const schemaExecution = createSQLiteSaveIdentitySchemaExecutionShell({
    connectionTarget,
    connectionHealth,
    schemaMigration
  });
  const migrationTracking = createSQLiteMigrationTrackingInsertShell({
    connectionTarget,
    connectionHealth,
    schemaMigration
  });
  const saveIdentityInsert = createSQLiteSaveIdentityInsertShell({
    connectionTarget,
    connectionHealth,
    schemaMigration,
    request: options.request
  });
  const saveIdentityVerification = createSQLiteSaveIdentityVerificationShell({
    connectionTarget,
    connectionHealth,
    schemaMigration,
    request: options.request,
    seedMismatchedSaveIdentity: options.seedMismatchedSaveIdentity
  });
  const issues = createOrchestrationIssues({
    repositoryContractReadiness: repositoryContract.overallRepositoryReadiness,
    schemaExecutionStatus: schemaExecution.executionStatus,
    migrationTrackingStatus: migrationTracking.executionStatus,
    saveIdentityInsertStatus: saveIdentityInsert.executionStatus,
    saveIdentityVerificationStatus: saveIdentityVerification.executionStatus
  });

  return createOrchestrationShell({
    repositoryContractReadiness: repositoryContract.overallRepositoryReadiness,
    schemaExecutionStatus: schemaExecution.executionStatus,
    migrationTrackingStatus: migrationTracking.executionStatus,
    saveIdentityInsertStatus: saveIdentityInsert.executionStatus,
    saveIdentityVerificationStatus: saveIdentityVerification.executionStatus,
    verifiedSaveId: saveIdentityVerification.verifiedSaveId,
    persisted: saveIdentityVerification.persisted,
    executionStatus: createExecutionStatus({
      issues,
      schemaExecutionStatus: schemaExecution.executionStatus,
      migrationTrackingStatus: migrationTracking.executionStatus,
      saveIdentityInsertStatus: saveIdentityInsert.executionStatus,
      saveIdentityVerificationStatus: saveIdentityVerification.executionStatus
    }),
    issues
  });
}

function createOrchestrationIssues(options: {
  readonly repositoryContractReadiness: SQLiteSaveRepositoryReadiness;
  readonly schemaExecutionStatus: SQLiteSaveIdentitySchemaExecutionStatus;
  readonly migrationTrackingStatus: SQLiteMigrationTrackingInsertStatus;
  readonly saveIdentityInsertStatus: SQLiteSaveIdentityInsertStatus;
  readonly saveIdentityVerificationStatus: SQLiteSaveIdentityVerificationStatus;
}): readonly SQLiteSaveRepositoryOrchestrationIssue[] {
  return Object.freeze([
    ...(options.repositoryContractReadiness === "structurally-ready"
      ? []
      : ["repository-contract-not-ready" as const]),
    ...(options.schemaExecutionStatus === "executed"
      ? []
      : ["schema-execution-not-ready" as const]),
    ...(options.migrationTrackingStatus === "inserted"
      ? []
      : ["migration-tracking-not-ready" as const]),
    ...(options.saveIdentityInsertStatus === "inserted"
      ? []
      : ["save-identity-insert-not-ready" as const]),
    ...(options.saveIdentityVerificationStatus === "verified"
      ? []
      : ["save-identity-verification-not-ready" as const])
  ]);
}

function createExecutionStatus(options: {
  readonly issues: readonly SQLiteSaveRepositoryOrchestrationIssue[];
  readonly schemaExecutionStatus: SQLiteSaveIdentitySchemaExecutionStatus;
  readonly migrationTrackingStatus: SQLiteMigrationTrackingInsertStatus;
  readonly saveIdentityInsertStatus: SQLiteSaveIdentityInsertStatus;
  readonly saveIdentityVerificationStatus: SQLiteSaveIdentityVerificationStatus;
}): SQLiteSaveRepositoryOrchestrationStatus {
  if (options.issues.length === 0) {
    return "orchestrated";
  }

  if (
    options.schemaExecutionStatus === "failed"
    || options.migrationTrackingStatus === "failed"
    || options.saveIdentityInsertStatus === "failed"
    || options.saveIdentityVerificationStatus === "failed"
  ) {
    return "failed";
  }

  return options.saveIdentityVerificationStatus === "mismatch"
    ? "mismatch"
    : "blocked";
}

function createOrchestrationShell(options: {
  readonly repositoryContractReadiness: SQLiteSaveRepositoryReadiness;
  readonly schemaExecutionStatus: SQLiteSaveIdentitySchemaExecutionStatus;
  readonly migrationTrackingStatus: SQLiteMigrationTrackingInsertStatus;
  readonly saveIdentityInsertStatus: SQLiteSaveIdentityInsertStatus;
  readonly saveIdentityVerificationStatus: SQLiteSaveIdentityVerificationStatus;
  readonly verifiedSaveId: string;
  readonly persisted: false | "test-safe-memory-only";
  readonly executionStatus: SQLiteSaveRepositoryOrchestrationStatus;
  readonly issues: readonly SQLiteSaveRepositoryOrchestrationIssue[];
}): SQLiteSaveRepositoryOrchestrationShell {
  return Object.freeze({
    status: "diagnostics-only",
    orchestrationAttempted: true,
    repositoryContractReadiness: options.repositoryContractReadiness,
    schemaExecutionStatus: options.schemaExecutionStatus,
    migrationTrackingStatus: options.migrationTrackingStatus,
    saveIdentityInsertStatus: options.saveIdentityInsertStatus,
    saveIdentityVerificationStatus: options.saveIdentityVerificationStatus,
    verifiedSaveId: options.verifiedSaveId,
    persisted: options.persisted,
    durableStorageUsed: false,
    fullRepositoryBehaviorEnabled: false,
    executionStatus: options.executionStatus,
    issues: Object.freeze([...options.issues]),
    diagnosticsOnly: true,
    playerFacing: false,
    repositoryMethodsAvailable: false,
    durableDatabasePathAvailable: false,
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
