import type {
  SQLiteConnectionHealthIssue,
  SQLiteConnectionHealthReadiness,
  SQLiteConnectionHealthShell
} from "./sqliteConnectionHealth.ts";

export type SQLiteMigrationRunnerReadiness =
  | "structural-issues"
  | "structurally-ready";

export type SQLiteMigrationRunnerIssue =
  | "missing-migration-id"
  | "missing-migration-version"
  | "missing-migration-name"
  | "missing-required-steps"
  | "missing-rollback-support"
  | "connection-health-not-ready";

export interface SQLiteMigrationConnectionHealthReference {
  readonly status: "diagnostics-only";
  readonly referenceStatus: "missing" | "provided";
  readonly connectionHealthReadiness: SQLiteConnectionHealthReadiness | "missing";
  readonly connectionAvailable?: boolean;
  readonly connectionIssues: readonly SQLiteConnectionHealthIssue[];
  readonly openedForHealthCheck?: boolean;
  readonly closedAfterHealthCheck?: boolean;
  readonly gameplayAffecting: false;
  readonly playerFacing: false;
}

export interface SQLiteMigrationRunnerShell {
  readonly status: "diagnostics-only";
  readonly migrationId: string;
  readonly migrationVersion: string;
  readonly migrationName: string;
  readonly requiredSteps: readonly string[];
  readonly rollbackSupported: boolean | "missing";
  readonly connectionHealthReference: SQLiteMigrationConnectionHealthReference;
  readonly migrationRunnerReadiness: SQLiteMigrationRunnerReadiness;
  readonly structurallyUsable: boolean;
  readonly issues: readonly SQLiteMigrationRunnerIssue[];
  readonly migrationsExecuted: false;
  readonly schemaCreated: false;
  readonly tablesCreated: false;
  readonly tablesAltered: false;
  readonly databaseWritten: false;
  readonly saveBehaviorAvailable: false;
  readonly loadBehaviorAvailable: false;
  readonly listBehaviorAvailable: false;
  readonly deleteBehaviorAvailable: false;
  readonly gameplayAffecting: false;
  readonly playerFacing: false;
}

export interface CreateSQLiteMigrationRunnerShellOptions {
  readonly migrationId?: string;
  readonly migrationVersion?: string;
  readonly migrationName?: string;
  readonly requiredSteps?: readonly string[];
  readonly rollbackSupported?: boolean;
  readonly connectionHealth?: SQLiteConnectionHealthShell;
}

export function createSQLiteMigrationRunnerShell(
  options: CreateSQLiteMigrationRunnerShellOptions
): SQLiteMigrationRunnerShell {
  const migrationId = normalizeString(options.migrationId);
  const migrationVersion = normalizeString(options.migrationVersion);
  const migrationName = normalizeString(options.migrationName);
  const requiredSteps = Object.freeze([
    ...(options.requiredSteps ?? []).map((step) => step.trim()).filter(Boolean)
  ]);
  const rollbackSupported = options.rollbackSupported ?? "missing";
  const connectionHealthReference = createConnectionHealthReference(
    options.connectionHealth
  );
  const issues = createMigrationRunnerIssues({
    migrationId,
    migrationVersion,
    migrationName,
    requiredSteps,
    rollbackSupported,
    connectionHealth: options.connectionHealth
  });

  return Object.freeze({
    status: "diagnostics-only",
    migrationId,
    migrationVersion,
    migrationName,
    requiredSteps,
    rollbackSupported,
    connectionHealthReference,
    migrationRunnerReadiness: issues.length === 0
      ? "structurally-ready"
      : "structural-issues",
    structurallyUsable: issues.length === 0,
    issues,
    migrationsExecuted: false,
    schemaCreated: false,
    tablesCreated: false,
    tablesAltered: false,
    databaseWritten: false,
    saveBehaviorAvailable: false,
    loadBehaviorAvailable: false,
    listBehaviorAvailable: false,
    deleteBehaviorAvailable: false,
    gameplayAffecting: false,
    playerFacing: false
  });
}

function createMigrationRunnerIssues(options: {
  readonly migrationId: string;
  readonly migrationVersion: string;
  readonly migrationName: string;
  readonly requiredSteps: readonly string[];
  readonly rollbackSupported: boolean | "missing";
  readonly connectionHealth?: SQLiteConnectionHealthShell;
}): readonly SQLiteMigrationRunnerIssue[] {
  return Object.freeze([
    ...(options.migrationId ? [] : ["missing-migration-id" as const]),
    ...(options.migrationVersion ? [] : ["missing-migration-version" as const]),
    ...(options.migrationName ? [] : ["missing-migration-name" as const]),
    ...(options.requiredSteps.length > 0 ? [] : ["missing-required-steps" as const]),
    ...(options.rollbackSupported === "missing"
      ? ["missing-rollback-support" as const]
      : []),
    ...(options.connectionHealth
      && options.connectionHealth.connectionHealthReadiness !== "structurally-ready"
      ? ["connection-health-not-ready" as const]
      : [])
  ]);
}

function createConnectionHealthReference(
  connectionHealth: SQLiteConnectionHealthShell | undefined
): SQLiteMigrationConnectionHealthReference {
  return Object.freeze({
    status: "diagnostics-only",
    referenceStatus: connectionHealth ? "provided" : "missing",
    connectionHealthReadiness: connectionHealth?.connectionHealthReadiness ?? "missing",
    ...(connectionHealth ? { connectionAvailable: connectionHealth.connectionAvailable } : {}),
    connectionIssues: Object.freeze([...(connectionHealth?.issues ?? [])]),
    ...(connectionHealth
      ? { openedForHealthCheck: connectionHealth.openedForHealthCheck }
      : {}),
    ...(connectionHealth
      ? { closedAfterHealthCheck: connectionHealth.closedAfterHealthCheck }
      : {}),
    gameplayAffecting: false,
    playerFacing: false
  });
}

function normalizeString(value: string | undefined): string {
  return value?.trim() ?? "";
}
