import type {
  SQLiteConnectionHealthReadiness,
  SQLiteConnectionHealthShell
} from "./sqliteConnectionHealth.ts";
import type {
  SQLiteSaveIdentityColumnName,
  SQLiteSaveIdentitySchemaMigrationReadiness,
  SQLiteSaveIdentitySchemaMigrationShell
} from "./sqliteSaveIdentitySchemaMigration.ts";
import {
  SQLITE_SAVE_REPOSITORY_REQUIRED_IDENTITY_FIELDS,
  type SQLiteSaveRepositoryContractShell,
  type SQLiteSaveRepositoryReadiness
} from "./sqliteSaveRepositoryContractShell.ts";

export type SQLiteGatedSaveCreationReadiness =
  | "blocked"
  | "structurally-ready";

export type SQLiteGatedSaveCreationMissingPiece =
  | "missing-save-creation-gate-id"
  | `missing-save-identity-field:${SQLiteSaveIdentityColumnName}`
  | "missing-repository-contract"
  | "repository-contract-not-ready"
  | "missing-schema-migration"
  | "schema-migration-not-ready"
  | "missing-connection-health"
  | "connection-health-not-ready";

export interface SQLiteSaveIdentityCreationRequest {
  readonly saveId?: string;
  readonly saveSlotId?: string;
  readonly setupId?: string;
  readonly selectedBrandId?: string;
  readonly playerManagerId?: string;
  readonly seedLabel?: string;
  readonly replayId?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  readonly schemaVersion?: string;
}

export interface SQLiteNormalizedSaveIdentity {
  readonly saveId: string;
  readonly saveSlotId: string;
  readonly setupId: string;
  readonly selectedBrandId: string;
  readonly playerManagerId: string;
  readonly seedLabel: string;
  readonly replayId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly schemaVersion: string;
}

export interface SQLiteGatedSaveIdentityResult {
  readonly status: "non-gameplay-save-identity";
  readonly saveIdentity: SQLiteNormalizedSaveIdentity;
  readonly persisted: false;
  readonly gameplayAffecting: false;
  readonly playerFacing: false;
}

export interface SQLiteGatedSaveCreationShell {
  readonly status: "diagnostics-only";
  readonly saveCreationGateId: string;
  readonly requestedSaveIdentity: SQLiteNormalizedSaveIdentity;
  readonly requiredIdentityFields: readonly SQLiteSaveIdentityColumnName[];
  readonly repositoryContractReadiness: SQLiteSaveRepositoryReadiness | "missing";
  readonly schemaMigrationReadiness: SQLiteSaveIdentitySchemaMigrationReadiness | "missing";
  readonly connectionHealthReadiness: SQLiteConnectionHealthReadiness | "missing";
  readonly missingSaveCreationPieces: readonly SQLiteGatedSaveCreationMissingPiece[];
  readonly overallSaveCreationReadiness: SQLiteGatedSaveCreationReadiness;
  readonly saveIdentityResult: SQLiteGatedSaveIdentityResult | "unavailable";
  readonly saveCreationGated: true;
  readonly saveIdentityOnly: true;
  readonly sqlExecuted: false;
  readonly databaseOpened: false;
  readonly databaseRead: false;
  readonly databaseWritten: false;
  readonly tablesCreated: false;
  readonly tablesAltered: false;
  readonly fullRepositoryImplementationAvailable: false;
  readonly savePersisted: false;
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
  readonly gameplayAffecting: false;
  readonly playerFacing: false;
}

export interface CreateSQLiteGatedSaveCreationShellOptions {
  readonly saveCreationGateId?: string;
  readonly request?: SQLiteSaveIdentityCreationRequest;
  readonly repositoryContract?: SQLiteSaveRepositoryContractShell;
  readonly schemaMigration?: SQLiteSaveIdentitySchemaMigrationShell;
  readonly connectionHealth?: SQLiteConnectionHealthShell;
}

export function createSQLiteGatedSaveCreationShell(
  options: CreateSQLiteGatedSaveCreationShellOptions
): SQLiteGatedSaveCreationShell {
  const saveCreationGateId = normalizeString(options.saveCreationGateId);
  const requestedSaveIdentity = normalizeSaveIdentity(options.request ?? {});
  const missingSaveCreationPieces = createMissingSaveCreationPieces({
    saveCreationGateId,
    requestedSaveIdentity,
    repositoryContract: options.repositoryContract,
    schemaMigration: options.schemaMigration,
    connectionHealth: options.connectionHealth
  });
  const overallSaveCreationReadiness = missingSaveCreationPieces.length === 0
    ? "structurally-ready"
    : "blocked";
  const saveIdentityResult = overallSaveCreationReadiness === "structurally-ready"
    ? createSaveIdentityResult(requestedSaveIdentity)
    : "unavailable";

  return Object.freeze({
    status: "diagnostics-only",
    saveCreationGateId,
    requestedSaveIdentity,
    requiredIdentityFields: SQLITE_SAVE_REPOSITORY_REQUIRED_IDENTITY_FIELDS,
    repositoryContractReadiness:
      options.repositoryContract?.overallRepositoryReadiness ?? "missing",
    schemaMigrationReadiness: options.schemaMigration?.migrationReadiness ?? "missing",
    connectionHealthReadiness:
      options.connectionHealth?.connectionHealthReadiness ?? "missing",
    missingSaveCreationPieces,
    overallSaveCreationReadiness,
    saveIdentityResult,
    saveCreationGated: true,
    saveIdentityOnly: true,
    sqlExecuted: false,
    databaseOpened: false,
    databaseRead: false,
    databaseWritten: false,
    tablesCreated: false,
    tablesAltered: false,
    fullRepositoryImplementationAvailable: false,
    savePersisted: false,
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
    gameplayAffecting: false,
    playerFacing: false
  });
}

function createMissingSaveCreationPieces(options: {
  readonly saveCreationGateId: string;
  readonly requestedSaveIdentity: SQLiteNormalizedSaveIdentity;
  readonly repositoryContract?: SQLiteSaveRepositoryContractShell;
  readonly schemaMigration?: SQLiteSaveIdentitySchemaMigrationShell;
  readonly connectionHealth?: SQLiteConnectionHealthShell;
}): readonly SQLiteGatedSaveCreationMissingPiece[] {
  return Object.freeze([
    ...(options.saveCreationGateId
      ? []
      : ["missing-save-creation-gate-id" as const]),
    ...missingIdentityFieldPieces(options.requestedSaveIdentity),
    ...(options.repositoryContract ? [] : ["missing-repository-contract" as const]),
    ...(options.repositoryContract
      && options.repositoryContract.overallRepositoryReadiness !== "structurally-ready"
      ? ["repository-contract-not-ready" as const]
      : []),
    ...(options.schemaMigration ? [] : ["missing-schema-migration" as const]),
    ...(options.schemaMigration
      && options.schemaMigration.migrationReadiness !== "structurally-ready"
      ? ["schema-migration-not-ready" as const]
      : []),
    ...(options.connectionHealth ? [] : ["missing-connection-health" as const]),
    ...(options.connectionHealth
      && options.connectionHealth.connectionHealthReadiness !== "structurally-ready"
      ? ["connection-health-not-ready" as const]
      : [])
  ]);
}

function missingIdentityFieldPieces(
  requestedSaveIdentity: SQLiteNormalizedSaveIdentity
): readonly SQLiteGatedSaveCreationMissingPiece[] {
  return SQLITE_SAVE_REPOSITORY_REQUIRED_IDENTITY_FIELDS
    .filter((fieldName) => !requestedSaveIdentity[fieldName])
    .map((fieldName) => `missing-save-identity-field:${fieldName}` as const);
}

function createSaveIdentityResult(
  saveIdentity: SQLiteNormalizedSaveIdentity
): SQLiteGatedSaveIdentityResult {
  return Object.freeze({
    status: "non-gameplay-save-identity",
    saveIdentity,
    persisted: false,
    gameplayAffecting: false,
    playerFacing: false
  });
}

function normalizeSaveIdentity(
  request: SQLiteSaveIdentityCreationRequest
): SQLiteNormalizedSaveIdentity {
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
