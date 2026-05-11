import { DatabaseSync } from "node:sqlite";

import {
  parsePlayableNewGMModeSavePayloadSerializedSnapshot,
  type PlayableNewGMModeSavePayloadSerializedSnapshot
} from "../domain/playableNewGMModeSavePayloadSerialization.ts";
import {
  createSQLiteDurableSaveIdentityPathBoundaryShell,
  type SQLiteDurableSaveIdentityPathBoundaryShell
} from "./sqliteDurableSaveIdentityPathBoundaryShell.ts";
import {
  createSQLiteDurableSaveIdentityRepositoryCreateShell,
  type SQLiteDurableSaveIdentityRepositoryCreateStatus
} from "./sqliteDurableSaveIdentityRepositoryCreateShell.ts";
import type {
  SQLiteSaveIdentityInsertRequest
} from "./sqliteSaveIdentityInsertShell.ts";
import type {
  SQLiteSaveIdentitySchemaMigrationShell
} from "./sqliteSaveIdentitySchemaMigration.ts";

export type SQLiteDurableSavePayloadRepositoryWriteStatus =
  | "blocked"
  | "failed"
  | "written";

export type SQLiteDurableSavePayloadRepositoryReadStatus =
  | "blocked"
  | "failed"
  | "payload-not-found"
  | "read";

export type SQLiteDurableSavePayloadRepositoryWriteIssue =
  | "durable-path-boundary-blocked"
  | "missing-save-id"
  | "serialized-payload-not-ready"
  | "durable-save-identity-create-not-ready"
  | "durable-save-payload-write-failed";

export type SQLiteDurableSavePayloadRepositoryReadIssue =
  | "durable-path-boundary-blocked"
  | "missing-save-id"
  | "durable-save-payload-not-found"
  | "durable-save-payload-parse-not-ready"
  | "durable-save-payload-read-failed";

export interface SQLiteDurableSavePayloadRepositoryWriteShell {
  readonly status: "gameplay-payload-persistence";
  readonly writeAttempted: boolean;
  readonly databaseTarget: string;
  readonly requestedSaveId: string;
  readonly createStatus: SQLiteDurableSaveIdentityRepositoryCreateStatus | "not-attempted";
  readonly executionStatus: SQLiteDurableSavePayloadRepositoryWriteStatus;
  readonly payloadFormatVersion: string;
  readonly serializedPayloadLength: number;
  readonly payloadRowsWritten: number | "not-checked";
  readonly payloadRowCount: number | "not-checked";
  readonly durableStorageUsed: boolean;
  readonly repositoryWriteEnabled: boolean;
  readonly repositoryReadEnabled: false;
  readonly repositoryListEnabled: false;
  readonly repositoryDeleteEnabled: false;
  readonly browserStorageUsed: false;
  readonly networkUsed: false;
  readonly generatedTextCreated: false;
  readonly genAIUsed: false;
  readonly simulationEnginesCalled: false;
  readonly gameplayStatePersisted: boolean;
  readonly databaseOpened: boolean;
  readonly databaseClosed: boolean;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly issues: readonly SQLiteDurableSavePayloadRepositoryWriteIssue[];
}

export interface SQLiteDurableSavePayloadRepositoryReadShell {
  readonly status: "gameplay-payload-persistence";
  readonly readAttempted: boolean;
  readonly databaseTarget: string;
  readonly requestedSaveId: string;
  readonly executionStatus: SQLiteDurableSavePayloadRepositoryReadStatus;
  readonly payloadFound: boolean | "not-checked";
  readonly payloadFormatVersion: string | "missing";
  readonly serializedPayloadLength: number | "not-checked";
  readonly parsedPayloadReady: boolean | "not-checked";
  readonly gameId: string;
  readonly selectedBrandName: string;
  readonly currentWeek: number | "not-checked";
  readonly durableStorageUsed: boolean;
  readonly repositoryReadEnabled: boolean;
  readonly repositoryWriteEnabled: false;
  readonly repositoryListEnabled: false;
  readonly repositoryDeleteEnabled: false;
  readonly browserStorageUsed: false;
  readonly networkUsed: false;
  readonly generatedTextCreated: false;
  readonly genAIUsed: false;
  readonly simulationEnginesCalled: false;
  readonly gameplayStateLoaded: boolean;
  readonly databaseOpened: boolean;
  readonly databaseClosed: boolean;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly issues: readonly SQLiteDurableSavePayloadRepositoryReadIssue[];
}

export interface CreateSQLiteDurableSavePayloadRepositoryWriteShellOptions {
  readonly durablePathBoundaryId?: string;
  readonly requestedDatabasePath?: string;
  readonly pathBoundary?: SQLiteDurableSaveIdentityPathBoundaryShell;
  readonly schemaMigration?: SQLiteSaveIdentitySchemaMigrationShell;
  readonly request?: SQLiteSaveIdentityInsertRequest;
  readonly serializedSnapshot?: PlayableNewGMModeSavePayloadSerializedSnapshot;
}

export interface CreateSQLiteDurableSavePayloadRepositoryReadShellOptions {
  readonly durablePathBoundaryId?: string;
  readonly requestedDatabasePath?: string;
  readonly pathBoundary?: SQLiteDurableSaveIdentityPathBoundaryShell;
  readonly requestedSaveId?: string;
}

export function createSQLiteDurableSavePayloadRepositoryWriteShell(
  options: CreateSQLiteDurableSavePayloadRepositoryWriteShellOptions
): SQLiteDurableSavePayloadRepositoryWriteShell {
  const pathBoundary = options.pathBoundary
    ?? createSQLiteDurableSaveIdentityPathBoundaryShell({
      durablePathBoundaryId: options.durablePathBoundaryId,
      requestedDatabasePath: options.requestedDatabasePath
    });
  const requestedSaveId = normalizeString(options.request?.saveId);
  const snapshot = options.serializedSnapshot;
  const preflightIssues = createWritePreflightIssues({
    pathBoundary,
    requestedSaveId,
    snapshot
  });

  if (preflightIssues.length > 0) {
    return createWriteShell({
      writeAttempted: false,
      databaseTarget: pathBoundary.normalizedDatabaseTarget,
      requestedSaveId,
      createStatus: "not-attempted",
      executionStatus: "blocked",
      payloadFormatVersion: snapshot?.payloadFormatVersion ?? "missing",
      serializedPayloadLength: snapshot?.serializedPayload.length ?? 0,
      payloadRowsWritten: "not-checked",
      payloadRowCount: "not-checked",
      durableStorageUsed: false,
      repositoryWriteEnabled: false,
      gameplayStatePersisted: false,
      databaseOpened: false,
      databaseClosed: false,
      issues: preflightIssues
    });
  }

  const createResult = createSQLiteDurableSaveIdentityRepositoryCreateShell({
    pathBoundary,
    schemaMigration: options.schemaMigration,
    request: options.request
  });
  const createReady = createResult.executionStatus === "created"
    || createResult.executionStatus === "duplicate-save-identity";

  if (!createReady) {
    return createWriteShell({
      writeAttempted: false,
      databaseTarget: pathBoundary.normalizedDatabaseTarget,
      requestedSaveId,
      createStatus: createResult.executionStatus,
      executionStatus: "blocked",
      payloadFormatVersion: snapshot!.payloadFormatVersion,
      serializedPayloadLength: snapshot!.serializedPayload.length,
      payloadRowsWritten: "not-checked",
      payloadRowCount: "not-checked",
      durableStorageUsed: createResult.durableStorageUsed,
      repositoryWriteEnabled: false,
      gameplayStatePersisted: false,
      databaseOpened: false,
      databaseClosed: false,
      issues: ["durable-save-identity-create-not-ready"]
    });
  }

  return writeDurablePayload({
    databaseTarget: pathBoundary.normalizedDatabaseTarget,
    requestedSaveId,
    createStatus: createResult.executionStatus,
    snapshot: snapshot!,
    createdAt: normalizeString(options.request?.createdAt),
    updatedAt: normalizeString(options.request?.updatedAt)
  });
}

export function createSQLiteDurableSavePayloadRepositoryReadShell(
  options: CreateSQLiteDurableSavePayloadRepositoryReadShellOptions
): SQLiteDurableSavePayloadRepositoryReadShell {
  const pathBoundary = options.pathBoundary
    ?? createSQLiteDurableSaveIdentityPathBoundaryShell({
      durablePathBoundaryId: options.durablePathBoundaryId,
      requestedDatabasePath: options.requestedDatabasePath
    });
  const requestedSaveId = normalizeString(options.requestedSaveId);
  const preflightIssues = createReadPreflightIssues(pathBoundary, requestedSaveId);

  if (preflightIssues.length > 0) {
    return createReadShell({
      readAttempted: false,
      databaseTarget: pathBoundary.normalizedDatabaseTarget,
      requestedSaveId,
      executionStatus: "blocked",
      payloadFound: "not-checked",
      payloadFormatVersion: "missing",
      serializedPayloadLength: "not-checked",
      parsedPayloadReady: "not-checked",
      gameId: "",
      selectedBrandName: "",
      currentWeek: "not-checked",
      durableStorageUsed: false,
      repositoryReadEnabled: false,
      gameplayStateLoaded: false,
      databaseOpened: false,
      databaseClosed: false,
      issues: preflightIssues
    });
  }

  return readDurablePayload({
    databaseTarget: pathBoundary.normalizedDatabaseTarget,
    requestedSaveId
  });
}

function writeDurablePayload(options: {
  readonly databaseTarget: string;
  readonly requestedSaveId: string;
  readonly createStatus: SQLiteDurableSaveIdentityRepositoryCreateStatus;
  readonly snapshot: PlayableNewGMModeSavePayloadSerializedSnapshot;
  readonly createdAt: string;
  readonly updatedAt: string;
}): SQLiteDurableSavePayloadRepositoryWriteShell {
  let database: DatabaseSync | undefined;
  let databaseOpened = false;
  let databaseClosed = false;

  try {
    database = new DatabaseSync(options.databaseTarget);
    databaseOpened = true;
    ensurePayloadTable(database);

    const payloadRowsWritten = writePayloadRow(database, options);
    const payloadRowCount = readPayloadRowCount(database);

    database.close();
    databaseClosed = true;

    return createWriteShell({
      writeAttempted: true,
      databaseTarget: options.databaseTarget,
      requestedSaveId: options.requestedSaveId,
      createStatus: options.createStatus,
      executionStatus: "written",
      payloadFormatVersion: options.snapshot.payloadFormatVersion,
      serializedPayloadLength: options.snapshot.serializedPayload.length,
      payloadRowsWritten,
      payloadRowCount,
      durableStorageUsed: true,
      repositoryWriteEnabled: true,
      gameplayStatePersisted: true,
      databaseOpened,
      databaseClosed,
      issues: []
    });
  } catch {
    if (database && !databaseClosed) {
      database.close();
      databaseClosed = true;
    }

    return createWriteShell({
      writeAttempted: true,
      databaseTarget: options.databaseTarget,
      requestedSaveId: options.requestedSaveId,
      createStatus: options.createStatus,
      executionStatus: "failed",
      payloadFormatVersion: options.snapshot.payloadFormatVersion,
      serializedPayloadLength: options.snapshot.serializedPayload.length,
      payloadRowsWritten: "not-checked",
      payloadRowCount: "not-checked",
      durableStorageUsed: databaseOpened,
      repositoryWriteEnabled: true,
      gameplayStatePersisted: false,
      databaseOpened,
      databaseClosed,
      issues: ["durable-save-payload-write-failed"]
    });
  }
}

function readDurablePayload(options: {
  readonly databaseTarget: string;
  readonly requestedSaveId: string;
}): SQLiteDurableSavePayloadRepositoryReadShell {
  let database: DatabaseSync | undefined;
  let databaseOpened = false;
  let databaseClosed = false;

  try {
    database = new DatabaseSync(options.databaseTarget, { readOnly: true });
    databaseOpened = true;

    const payloadRow = readPayloadRow(database, options.requestedSaveId);

    database.close();
    databaseClosed = true;

    if (!payloadRow) {
      return createReadShell({
        readAttempted: true,
        databaseTarget: options.databaseTarget,
        requestedSaveId: options.requestedSaveId,
        executionStatus: "payload-not-found",
        payloadFound: false,
        payloadFormatVersion: "missing",
        serializedPayloadLength: "not-checked",
        parsedPayloadReady: "not-checked",
        gameId: "",
        selectedBrandName: "",
        currentWeek: "not-checked",
        durableStorageUsed: true,
        repositoryReadEnabled: true,
        gameplayStateLoaded: false,
        databaseOpened,
        databaseClosed,
        issues: ["durable-save-payload-not-found"]
      });
    }

    const parsedPayload = parsePlayableNewGMModeSavePayloadSerializedSnapshot(
      payloadRow.serializedPayload
    );
    const parseIssues: SQLiteDurableSavePayloadRepositoryReadIssue[] =
      parsedPayload.structurallyReady
        ? []
        : ["durable-save-payload-parse-not-ready"];

    return createReadShell({
      readAttempted: true,
      databaseTarget: options.databaseTarget,
      requestedSaveId: options.requestedSaveId,
      executionStatus: parseIssues.length === 0 ? "read" : "failed",
      payloadFound: true,
      payloadFormatVersion: payloadRow.payloadFormatVersion,
      serializedPayloadLength: payloadRow.serializedPayload.length,
      parsedPayloadReady: parsedPayload.structurallyReady,
      gameId: parsedPayload.gameId ?? "",
      selectedBrandName: parsedPayload.selectedBrandName ?? "",
      currentWeek: parsedPayload.currentWeek ?? "not-checked",
      durableStorageUsed: true,
      repositoryReadEnabled: true,
      gameplayStateLoaded: parseIssues.length === 0,
      databaseOpened,
      databaseClosed,
      issues: parseIssues
    });
  } catch {
    if (database && !databaseClosed) {
      database.close();
      databaseClosed = true;
    }

    return createReadShell({
      readAttempted: true,
      databaseTarget: options.databaseTarget,
      requestedSaveId: options.requestedSaveId,
      executionStatus: "failed",
      payloadFound: "not-checked",
      payloadFormatVersion: "missing",
      serializedPayloadLength: "not-checked",
      parsedPayloadReady: "not-checked",
      gameId: "",
      selectedBrandName: "",
      currentWeek: "not-checked",
      durableStorageUsed: databaseOpened,
      repositoryReadEnabled: true,
      gameplayStateLoaded: false,
      databaseOpened,
      databaseClosed,
      issues: ["durable-save-payload-read-failed"]
    });
  }
}

function createWritePreflightIssues(options: {
  readonly pathBoundary: SQLiteDurableSaveIdentityPathBoundaryShell;
  readonly requestedSaveId: string;
  readonly snapshot?: PlayableNewGMModeSavePayloadSerializedSnapshot;
}): readonly SQLiteDurableSavePayloadRepositoryWriteIssue[] {
  return Object.freeze([
    ...(options.pathBoundary.allowedForDurableIdentityPersistence
      ? []
      : ["durable-path-boundary-blocked" as const]),
    ...(options.requestedSaveId ? [] : ["missing-save-id" as const]),
    ...(options.snapshot?.structurallyReady
      ? []
      : ["serialized-payload-not-ready" as const])
  ]);
}

function createReadPreflightIssues(
  pathBoundary: SQLiteDurableSaveIdentityPathBoundaryShell,
  requestedSaveId: string
): readonly SQLiteDurableSavePayloadRepositoryReadIssue[] {
  return Object.freeze([
    ...(pathBoundary.allowedForDurableIdentityPersistence
      ? []
      : ["durable-path-boundary-blocked" as const]),
    ...(requestedSaveId ? [] : ["missing-save-id" as const])
  ]);
}

function ensurePayloadTable(database: DatabaseSync): void {
  database.exec(`CREATE TABLE IF NOT EXISTS save_gameplay_payloads (
  saveId TEXT PRIMARY KEY,
  payloadFormatVersion TEXT NOT NULL,
  serializedPayload TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (saveId) REFERENCES saves(saveId)
)`);
}

function writePayloadRow(
  database: DatabaseSync,
  options: {
    readonly requestedSaveId: string;
    readonly snapshot: PlayableNewGMModeSavePayloadSerializedSnapshot;
    readonly createdAt: string;
    readonly updatedAt: string;
  }
): number {
  const result = database.prepare(
    `INSERT INTO save_gameplay_payloads (
  saveId,
  payloadFormatVersion,
  serializedPayload,
  createdAt,
  updatedAt
) VALUES (?, ?, ?, ?, ?)
ON CONFLICT(saveId) DO UPDATE SET
  payloadFormatVersion = excluded.payloadFormatVersion,
  serializedPayload = excluded.serializedPayload,
  updatedAt = excluded.updatedAt`
  ).run(
    options.requestedSaveId,
    options.snapshot.payloadFormatVersion,
    options.snapshot.serializedPayload,
    options.createdAt,
    options.updatedAt
  ) as { readonly changes: number };

  return result.changes;
}

function readPayloadRow(
  database: DatabaseSync,
  saveId: string
): {
  readonly payloadFormatVersion: string;
  readonly serializedPayload: string;
} | undefined {
  return database.prepare(
    `SELECT payloadFormatVersion, serializedPayload
FROM save_gameplay_payloads
WHERE saveId = ?`
  ).get(saveId) as
    | {
      readonly payloadFormatVersion: string;
      readonly serializedPayload: string;
    }
    | undefined;
}

function readPayloadRowCount(database: DatabaseSync): number {
  const row = database.prepare(
    "SELECT COUNT(*) AS rowCount FROM save_gameplay_payloads"
  ).get() as { readonly rowCount: number };

  return row.rowCount;
}

function createWriteShell(
  options: Omit<
    SQLiteDurableSavePayloadRepositoryWriteShell,
    | "status"
    | "repositoryReadEnabled"
    | "repositoryListEnabled"
    | "repositoryDeleteEnabled"
    | "browserStorageUsed"
    | "networkUsed"
    | "generatedTextCreated"
    | "genAIUsed"
    | "simulationEnginesCalled"
    | "playerFacing"
    | "gameplayAffecting"
  >
): SQLiteDurableSavePayloadRepositoryWriteShell {
  return Object.freeze({
    status: "gameplay-payload-persistence",
    ...options,
    repositoryReadEnabled: false,
    repositoryListEnabled: false,
    repositoryDeleteEnabled: false,
    browserStorageUsed: false,
    networkUsed: false,
    generatedTextCreated: false,
    genAIUsed: false,
    simulationEnginesCalled: false,
    playerFacing: false,
    gameplayAffecting: false
  });
}

function createReadShell(
  options: Omit<
    SQLiteDurableSavePayloadRepositoryReadShell,
    | "status"
    | "repositoryWriteEnabled"
    | "repositoryListEnabled"
    | "repositoryDeleteEnabled"
    | "browserStorageUsed"
    | "networkUsed"
    | "generatedTextCreated"
    | "genAIUsed"
    | "simulationEnginesCalled"
    | "playerFacing"
    | "gameplayAffecting"
  >
): SQLiteDurableSavePayloadRepositoryReadShell {
  return Object.freeze({
    status: "gameplay-payload-persistence",
    ...options,
    repositoryWriteEnabled: false,
    repositoryListEnabled: false,
    repositoryDeleteEnabled: false,
    browserStorageUsed: false,
    networkUsed: false,
    generatedTextCreated: false,
    genAIUsed: false,
    simulationEnginesCalled: false,
    playerFacing: false,
    gameplayAffecting: false
  });
}

function normalizeString(value: string | undefined): string {
  return value?.trim() ?? "";
}
