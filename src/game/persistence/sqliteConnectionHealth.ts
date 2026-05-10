import { DatabaseSync } from "node:sqlite";

export type SQLiteConnectionHealthReadiness =
  | "structural-issues"
  | "structurally-ready";

export type SQLiteConnectionHealthIssue =
  | "missing-connection-target"
  | "unsupported-connection-target"
  | "connection-open-failed";

export type SQLiteConnectionTarget = ":memory:";

export interface SQLiteConnectionHealthShell {
  readonly status: "diagnostics-only";
  readonly connectionTarget: SQLiteConnectionTarget | "";
  readonly connectionAvailable: boolean;
  readonly connectionHealthReadiness: SQLiteConnectionHealthReadiness;
  readonly issues: readonly SQLiteConnectionHealthIssue[];
  readonly sqliteRuntime: "node:sqlite";
  readonly openedForHealthCheck: boolean;
  readonly closedAfterHealthCheck: boolean;
  readonly migrationsCreated: false;
  readonly tablesCreated: false;
  readonly saveBehaviorAvailable: false;
  readonly loadBehaviorAvailable: false;
  readonly listBehaviorAvailable: false;
  readonly deleteBehaviorAvailable: false;
  readonly gameplayAffecting: false;
  readonly playerFacing: false;
}

export interface CreateSQLiteConnectionHealthShellOptions {
  readonly connectionTarget?: string;
}

export function createSQLiteConnectionHealthShell(
  options: CreateSQLiteConnectionHealthShellOptions
): SQLiteConnectionHealthShell {
  const connectionTarget = normalizeConnectionTarget(options.connectionTarget);
  const configIssues = createConnectionConfigIssues(options.connectionTarget);

  if (configIssues.length > 0) {
    return createHealthShell({
      connectionTarget,
      connectionAvailable: false,
      openedForHealthCheck: false,
      closedAfterHealthCheck: false,
      issues: configIssues
    });
  }

  const probeResult = probeSQLiteConnection(connectionTarget);

  return createHealthShell({
    connectionTarget,
    connectionAvailable: probeResult.connectionAvailable,
    openedForHealthCheck: probeResult.openedForHealthCheck,
    closedAfterHealthCheck: probeResult.closedAfterHealthCheck,
    issues: probeResult.connectionAvailable ? [] : ["connection-open-failed"]
  });
}

function probeSQLiteConnection(connectionTarget: SQLiteConnectionTarget): {
  readonly connectionAvailable: boolean;
  readonly openedForHealthCheck: boolean;
  readonly closedAfterHealthCheck: boolean;
} {
  let database: DatabaseSync | undefined;
  let openedForHealthCheck = false;
  let closedAfterHealthCheck = false;

  try {
    database = new DatabaseSync(connectionTarget);
    openedForHealthCheck = true;
  } catch {
    return {
      connectionAvailable: false,
      openedForHealthCheck,
      closedAfterHealthCheck
    };
  } finally {
    if (database) {
      database.close();
      closedAfterHealthCheck = true;
    }
  }

  return {
    connectionAvailable: true,
    openedForHealthCheck,
    closedAfterHealthCheck
  };
}

function createConnectionConfigIssues(
  connectionTarget: string | undefined
): readonly SQLiteConnectionHealthIssue[] {
  const trimmedTarget = connectionTarget?.trim() ?? "";

  if (!trimmedTarget) {
    return Object.freeze(["missing-connection-target"]);
  }

  if (trimmedTarget !== ":memory:") {
    return Object.freeze(["unsupported-connection-target"]);
  }

  return Object.freeze([]);
}

function normalizeConnectionTarget(
  connectionTarget: string | undefined
): SQLiteConnectionTarget | "" {
  const trimmedTarget = connectionTarget?.trim() ?? "";

  return trimmedTarget === ":memory:" ? ":memory:" : "";
}

function createHealthShell(options: {
  readonly connectionTarget: SQLiteConnectionTarget | "";
  readonly connectionAvailable: boolean;
  readonly openedForHealthCheck: boolean;
  readonly closedAfterHealthCheck: boolean;
  readonly issues: readonly SQLiteConnectionHealthIssue[];
}): SQLiteConnectionHealthShell {
  return Object.freeze({
    status: "diagnostics-only",
    connectionTarget: options.connectionTarget,
    connectionAvailable: options.connectionAvailable,
    connectionHealthReadiness: options.issues.length === 0
      ? "structurally-ready"
      : "structural-issues",
    issues: Object.freeze([...options.issues]),
    sqliteRuntime: "node:sqlite",
    openedForHealthCheck: options.openedForHealthCheck,
    closedAfterHealthCheck: options.closedAfterHealthCheck,
    migrationsCreated: false,
    tablesCreated: false,
    saveBehaviorAvailable: false,
    loadBehaviorAvailable: false,
    listBehaviorAvailable: false,
    deleteBehaviorAvailable: false,
    gameplayAffecting: false,
    playerFacing: false
  });
}
