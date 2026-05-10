import { DatabaseSync } from "node:sqlite";

import {
  createSQLiteDurableSaveIdentityInitializationShell,
  type SQLiteDurableSaveIdentityInitializationStatus
} from "./sqliteDurableSaveIdentityInitializationShell.ts";
import {
  createSQLiteDurableSaveIdentityPathBoundaryShell,
  type SQLiteDurableSaveIdentityPathBoundaryShell
} from "./sqliteDurableSaveIdentityPathBoundaryShell.ts";
import {
  createSQLiteDurableSaveIdentityInsertShell,
  type SQLiteDurableSaveIdentityInsertStatus
} from "./sqliteDurableSaveIdentityInsertShell.ts";
import {
  createSQLiteDurableSaveIdentityRepositoryCreateShell,
  type SQLiteDurableSaveIdentityRepositoryCreateStatus
} from "./sqliteDurableSaveIdentityRepositoryCreateShell.ts";
import {
  type SQLiteSaveIdentityInsertRequest
} from "./sqliteSaveIdentityInsertShell.ts";
import {
  type SQLiteSaveIdentitySchemaMigrationShell
} from "./sqliteSaveIdentitySchemaMigration.ts";
import {
  SQLITE_SAVE_REPOSITORY_REQUIRED_IDENTITY_FIELDS
} from "./sqliteSaveRepositoryContractShell.ts";

export type SQLiteDurableSaveIdentityRepositoryListPathBoundaryStatus =
  | "allowed"
  | "blocked";

export type SQLiteDurableSaveIdentityRepositoryListStatus =
  | "blocked"
  | "failed"
  | "listed"
  | "mismatch";

export type SQLiteDurableSaveIdentityRepositoryListIssue =
  | "durable-path-boundary-blocked"
  | "durable-initialization-not-ready"
  | "durable-save-identity-create-not-ready"
  | "schema-migration-row-count-mismatch"
  | "save-metadata-row-count-mismatch"
  | "save-identity-field-missing"
  | "save-metadata-field-missing"
  | "durable-save-identity-list-failed";

export interface SQLiteDurableSaveIdentityRepositoryListIdentity {
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
  readonly saveMetadataPresent: boolean;
  readonly metadataSchemaVersion: string;
  readonly metadataCreatedAt: string;
  readonly metadataUpdatedAt: string;
}

export interface SQLiteDurableSaveIdentityRepositoryListShell {
  readonly status: "diagnostics-only";
  readonly listSaveIdentitiesAttempted: boolean;
  readonly databaseTarget: string;
  readonly pathBoundaryStatus: SQLiteDurableSaveIdentityRepositoryListPathBoundaryStatus;
  readonly initializationStatus: SQLiteDurableSaveIdentityInitializationStatus;
  readonly createStatuses: readonly SQLiteDurableSaveIdentityRepositoryCreateStatus[];
  readonly requestedCreateCount: number;
  readonly listedSaveIdentities: readonly SQLiteDurableSaveIdentityRepositoryListIdentity[];
  readonly listedSaveCount: number | "not-checked";
  readonly saveMetadataRowCount: number | "not-checked";
  readonly schemaMigrationRows: number | "not-checked";
  readonly identityFieldsPresent: boolean | "not-checked";
  readonly metadataFieldsPresent: boolean | "not-checked";
  readonly saveMetadataMatchesSaves: boolean | "not-checked";
  readonly ordering: "createdAt-asc-saveId-asc";
  readonly repositoryCreateEnabled: boolean;
  readonly repositoryReadEnabled: boolean;
  readonly repositoryListEnabled: boolean;
  readonly repositoryDeleteEnabled: false;
  readonly repositoryUpdateEnabled: false;
  readonly durableStorageUsed: boolean;
  readonly executionStatus: SQLiteDurableSaveIdentityRepositoryListStatus;
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly issues: readonly SQLiteDurableSaveIdentityRepositoryListIssue[];
  readonly databaseOpened: boolean;
  readonly databaseClosed: boolean;
  readonly repositoryObjectAvailable: false;
  readonly repositoryMethodsAvailable: false;
  readonly fullRepositoryImplementationAvailable: false;
  readonly loadBehaviorAvailable: false;
  readonly listBehaviorAvailable: boolean;
  readonly deleteBehaviorAvailable: false;
  readonly metadataUpdateBehaviorAvailable: false;
  readonly draftStateRead: false;
  readonly rosterStateRead: false;
  readonly matchStateRead: false;
  readonly showStateRead: false;
  readonly businessStateRead: false;
  readonly fanSocialStateRead: false;
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

export interface CreateSQLiteDurableSaveIdentityRepositoryListShellOptions {
  readonly durablePathBoundaryId?: string;
  readonly requestedDatabasePath?: string;
  readonly pathBoundary?: SQLiteDurableSaveIdentityPathBoundaryShell;
  readonly schemaMigration?: SQLiteSaveIdentitySchemaMigrationShell;
  readonly requests?: readonly SQLiteSaveIdentityInsertRequest[];
}

export function createSQLiteDurableSaveIdentityRepositoryListShell(
  options: CreateSQLiteDurableSaveIdentityRepositoryListShellOptions
): SQLiteDurableSaveIdentityRepositoryListShell {
  const pathBoundary = options.pathBoundary
    ?? createSQLiteDurableSaveIdentityPathBoundaryShell({
      durablePathBoundaryId: options.durablePathBoundaryId,
      requestedDatabasePath: options.requestedDatabasePath
    });

  if (!pathBoundary.allowedForDurableIdentityPersistence) {
    return createListShell({
      listSaveIdentitiesAttempted: false,
      databaseTarget: pathBoundary.normalizedDatabaseTarget,
      pathBoundaryStatus: "blocked",
      initializationStatus: "blocked",
      createStatuses: [],
      requestedCreateCount: options.requests?.length ?? 0,
      listedSaveIdentities: [],
      listedSaveCount: "not-checked",
      saveMetadataRowCount: "not-checked",
      schemaMigrationRows: "not-checked",
      identityFieldsPresent: "not-checked",
      metadataFieldsPresent: "not-checked",
      saveMetadataMatchesSaves: "not-checked",
      repositoryCreateEnabled: false,
      repositoryReadEnabled: false,
      repositoryListEnabled: false,
      durableStorageUsed: false,
      executionStatus: "blocked",
      issues: ["durable-path-boundary-blocked"],
      databaseOpened: false,
      databaseClosed: false,
      listBehaviorAvailable: false
    });
  }

  const initialization = createSQLiteDurableSaveIdentityInitializationShell({
    pathBoundary,
    schemaMigration: options.schemaMigration
  });

  if (initialization.executionStatus !== "initialized") {
    return createListShell({
      listSaveIdentitiesAttempted: false,
      databaseTarget: pathBoundary.normalizedDatabaseTarget,
      pathBoundaryStatus: "allowed",
      initializationStatus: initialization.executionStatus,
      createStatuses: [],
      requestedCreateCount: options.requests?.length ?? 0,
      listedSaveIdentities: [],
      listedSaveCount: "not-checked",
      saveMetadataRowCount: "not-checked",
      schemaMigrationRows: initialization.schemaMigrationRowCount,
      identityFieldsPresent: "not-checked",
      metadataFieldsPresent: "not-checked",
      saveMetadataMatchesSaves: "not-checked",
      repositoryCreateEnabled: false,
      repositoryReadEnabled: false,
      repositoryListEnabled: false,
      durableStorageUsed: initialization.durableStorageUsed,
      executionStatus: "blocked",
      issues: ["durable-initialization-not-ready"],
      databaseOpened: false,
      databaseClosed: false,
      listBehaviorAvailable: false
    });
  }

  const createStatuses = createRequestedSaveIdentities({
    pathBoundary,
    schemaMigration: options.schemaMigration,
    requests: options.requests ?? []
  });

  if (!createStatuses.every(isListableCreateStatus)) {
    return createListShell({
      listSaveIdentitiesAttempted: false,
      databaseTarget: pathBoundary.normalizedDatabaseTarget,
      pathBoundaryStatus: "allowed",
      initializationStatus: initialization.executionStatus,
      createStatuses,
      requestedCreateCount: options.requests?.length ?? 0,
      listedSaveIdentities: [],
      listedSaveCount: "not-checked",
      saveMetadataRowCount: "not-checked",
      schemaMigrationRows: initialization.schemaMigrationRowCount,
      identityFieldsPresent: "not-checked",
      metadataFieldsPresent: "not-checked",
      saveMetadataMatchesSaves: "not-checked",
      repositoryCreateEnabled: true,
      repositoryReadEnabled: true,
      repositoryListEnabled: false,
      durableStorageUsed: true,
      executionStatus: "blocked",
      issues: ["durable-save-identity-create-not-ready"],
      databaseOpened: false,
      databaseClosed: false,
      listBehaviorAvailable: false
    });
  }

  return listDurableSaveIdentities({
    databaseTarget: pathBoundary.normalizedDatabaseTarget,
    initializationStatus: initialization.executionStatus,
    createStatuses,
    requestedCreateCount: options.requests?.length ?? 0
  });
}

function createRequestedSaveIdentities(options: {
  readonly pathBoundary: SQLiteDurableSaveIdentityPathBoundaryShell;
  readonly schemaMigration: SQLiteSaveIdentitySchemaMigrationShell | undefined;
  readonly requests: readonly SQLiteSaveIdentityInsertRequest[];
}): readonly SQLiteDurableSaveIdentityRepositoryCreateStatus[] {
  if (options.requests.length === 1) {
    return Object.freeze([
      createSQLiteDurableSaveIdentityRepositoryCreateShell({
        pathBoundary: options.pathBoundary,
        schemaMigration: options.schemaMigration,
        request: options.requests[0]
      }).executionStatus
    ]);
  }

  return Object.freeze(
    options.requests.map((request) => mapInsertStatusToCreateStatus(
      createSQLiteDurableSaveIdentityInsertShell({
        pathBoundary: options.pathBoundary,
        schemaMigration: options.schemaMigration,
        request
      }).executionStatus
    ))
  );
}

function mapInsertStatusToCreateStatus(
  insertStatus: SQLiteDurableSaveIdentityInsertStatus
): SQLiteDurableSaveIdentityRepositoryCreateStatus {
  if (insertStatus === "inserted") {
    return "created";
  }

  return insertStatus;
}

function isListableCreateStatus(
  createStatus: SQLiteDurableSaveIdentityRepositoryCreateStatus
): boolean {
  return createStatus === "created"
    || createStatus === "duplicate-save-identity";
}

function listDurableSaveIdentities(options: {
  readonly databaseTarget: string;
  readonly initializationStatus: SQLiteDurableSaveIdentityInitializationStatus;
  readonly createStatuses: readonly SQLiteDurableSaveIdentityRepositoryCreateStatus[];
  readonly requestedCreateCount: number;
}): SQLiteDurableSaveIdentityRepositoryListShell {
  let database: DatabaseSync | undefined;
  let databaseOpened = false;
  let databaseClosed = false;

  try {
    database = new DatabaseSync(options.databaseTarget, { readOnly: true });
    databaseOpened = true;

    const listedSaveIdentities = readListedSaveIdentities(database);
    const listedSaveCount = readRowCount(database, "saves");
    const saveMetadataRowCount = readRowCount(database, "save_metadata");
    const schemaMigrationRows = readRowCount(database, "schema_migrations");
    const identityFieldsPresent = listedSaveIdentities.every(
      saveIdentityFieldsPresent
    );
    const metadataFieldsPresent = listedSaveIdentities.every(
      saveMetadataFieldsPresent
    );
    const saveMetadataMatchesSaves =
      listedSaveCount === saveMetadataRowCount
      && listedSaveIdentities.every((identity) => identity.saveMetadataPresent);
    const issues = createListIssues({
      schemaMigrationRows,
      saveMetadataMatchesSaves,
      identityFieldsPresent,
      metadataFieldsPresent
    });

    database.close();
    databaseClosed = true;

    return createListShell({
      listSaveIdentitiesAttempted: true,
      databaseTarget: options.databaseTarget,
      pathBoundaryStatus: "allowed",
      initializationStatus: options.initializationStatus,
      createStatuses: options.createStatuses,
      requestedCreateCount: options.requestedCreateCount,
      listedSaveIdentities,
      listedSaveCount,
      saveMetadataRowCount,
      schemaMigrationRows,
      identityFieldsPresent,
      metadataFieldsPresent,
      saveMetadataMatchesSaves,
      repositoryCreateEnabled: true,
      repositoryReadEnabled: true,
      repositoryListEnabled: true,
      durableStorageUsed: true,
      executionStatus: issues.length === 0 ? "listed" : "mismatch",
      issues,
      databaseOpened,
      databaseClosed,
      listBehaviorAvailable: true
    });
  } catch {
    if (database && !databaseClosed) {
      database.close();
      databaseClosed = true;
    }

    return createListShell({
      listSaveIdentitiesAttempted: true,
      databaseTarget: options.databaseTarget,
      pathBoundaryStatus: "allowed",
      initializationStatus: options.initializationStatus,
      createStatuses: options.createStatuses,
      requestedCreateCount: options.requestedCreateCount,
      listedSaveIdentities: [],
      listedSaveCount: "not-checked",
      saveMetadataRowCount: "not-checked",
      schemaMigrationRows: "not-checked",
      identityFieldsPresent: "not-checked",
      metadataFieldsPresent: "not-checked",
      saveMetadataMatchesSaves: "not-checked",
      repositoryCreateEnabled: true,
      repositoryReadEnabled: true,
      repositoryListEnabled: true,
      durableStorageUsed: databaseOpened,
      executionStatus: "failed",
      issues: ["durable-save-identity-list-failed"],
      databaseOpened,
      databaseClosed,
      listBehaviorAvailable: true
    });
  }
}

function readListedSaveIdentities(
  database: DatabaseSync
): readonly SQLiteDurableSaveIdentityRepositoryListIdentity[] {
  const rows = database.prepare(
    `SELECT
  saves.saveId AS saveId,
  saves.saveSlotId AS saveSlotId,
  saves.setupId AS setupId,
  saves.selectedBrandId AS selectedBrandId,
  saves.playerManagerId AS playerManagerId,
  saves.seedLabel AS seedLabel,
  saves.replayId AS replayId,
  saves.createdAt AS createdAt,
  saves.updatedAt AS updatedAt,
  saves.schemaVersion AS schemaVersion,
  save_metadata.schemaVersion AS metadataSchemaVersion,
  save_metadata.createdAt AS metadataCreatedAt,
  save_metadata.updatedAt AS metadataUpdatedAt
FROM saves
LEFT JOIN save_metadata ON save_metadata.saveId = saves.saveId
ORDER BY saves.createdAt ASC, saves.saveId ASC`
  ).all() as readonly ListedSaveIdentityRow[];

  return Object.freeze(rows.map(normalizeListedSaveIdentity));
}

function normalizeListedSaveIdentity(
  row: ListedSaveIdentityRow
): SQLiteDurableSaveIdentityRepositoryListIdentity {
  return Object.freeze({
    saveId: row.saveId,
    saveSlotId: row.saveSlotId,
    setupId: row.setupId,
    selectedBrandId: row.selectedBrandId,
    playerManagerId: row.playerManagerId,
    seedLabel: row.seedLabel,
    replayId: row.replayId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    schemaVersion: row.schemaVersion,
    saveMetadataPresent: row.metadataSchemaVersion !== null
      && row.metadataCreatedAt !== null
      && row.metadataUpdatedAt !== null,
    metadataSchemaVersion: row.metadataSchemaVersion ?? "",
    metadataCreatedAt: row.metadataCreatedAt ?? "",
    metadataUpdatedAt: row.metadataUpdatedAt ?? ""
  });
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

function saveIdentityFieldsPresent(
  identity: SQLiteDurableSaveIdentityRepositoryListIdentity
): boolean {
  return SQLITE_SAVE_REPOSITORY_REQUIRED_IDENTITY_FIELDS.every(
    (fieldName) => identity[fieldName].length > 0
  );
}

function saveMetadataFieldsPresent(
  identity: SQLiteDurableSaveIdentityRepositoryListIdentity
): boolean {
  return identity.saveMetadataPresent
    && identity.metadataSchemaVersion.length > 0
    && identity.metadataCreatedAt.length > 0
    && identity.metadataUpdatedAt.length > 0;
}

function createListIssues(options: {
  readonly schemaMigrationRows: number;
  readonly saveMetadataMatchesSaves: boolean;
  readonly identityFieldsPresent: boolean;
  readonly metadataFieldsPresent: boolean;
}): readonly SQLiteDurableSaveIdentityRepositoryListIssue[] {
  return Object.freeze([
    ...(options.schemaMigrationRows === 1
      ? []
      : ["schema-migration-row-count-mismatch" as const]),
    ...(options.saveMetadataMatchesSaves
      ? []
      : ["save-metadata-row-count-mismatch" as const]),
    ...(options.identityFieldsPresent
      ? []
      : ["save-identity-field-missing" as const]),
    ...(options.metadataFieldsPresent
      ? []
      : ["save-metadata-field-missing" as const])
  ]);
}

function createListShell(options: {
  readonly listSaveIdentitiesAttempted: boolean;
  readonly databaseTarget: string;
  readonly pathBoundaryStatus: SQLiteDurableSaveIdentityRepositoryListPathBoundaryStatus;
  readonly initializationStatus: SQLiteDurableSaveIdentityInitializationStatus;
  readonly createStatuses: readonly SQLiteDurableSaveIdentityRepositoryCreateStatus[];
  readonly requestedCreateCount: number;
  readonly listedSaveIdentities: readonly SQLiteDurableSaveIdentityRepositoryListIdentity[];
  readonly listedSaveCount: number | "not-checked";
  readonly saveMetadataRowCount: number | "not-checked";
  readonly schemaMigrationRows: number | "not-checked";
  readonly identityFieldsPresent: boolean | "not-checked";
  readonly metadataFieldsPresent: boolean | "not-checked";
  readonly saveMetadataMatchesSaves: boolean | "not-checked";
  readonly repositoryCreateEnabled: boolean;
  readonly repositoryReadEnabled: boolean;
  readonly repositoryListEnabled: boolean;
  readonly durableStorageUsed: boolean;
  readonly executionStatus: SQLiteDurableSaveIdentityRepositoryListStatus;
  readonly issues: readonly SQLiteDurableSaveIdentityRepositoryListIssue[];
  readonly databaseOpened: boolean;
  readonly databaseClosed: boolean;
  readonly listBehaviorAvailable: boolean;
}): SQLiteDurableSaveIdentityRepositoryListShell {
  return Object.freeze({
    status: "diagnostics-only",
    listSaveIdentitiesAttempted: options.listSaveIdentitiesAttempted,
    databaseTarget: options.databaseTarget,
    pathBoundaryStatus: options.pathBoundaryStatus,
    initializationStatus: options.initializationStatus,
    createStatuses: Object.freeze([...options.createStatuses]),
    requestedCreateCount: options.requestedCreateCount,
    listedSaveIdentities: Object.freeze([...options.listedSaveIdentities]),
    listedSaveCount: options.listedSaveCount,
    saveMetadataRowCount: options.saveMetadataRowCount,
    schemaMigrationRows: options.schemaMigrationRows,
    identityFieldsPresent: options.identityFieldsPresent,
    metadataFieldsPresent: options.metadataFieldsPresent,
    saveMetadataMatchesSaves: options.saveMetadataMatchesSaves,
    ordering: "createdAt-asc-saveId-asc",
    repositoryCreateEnabled: options.repositoryCreateEnabled,
    repositoryReadEnabled: options.repositoryReadEnabled,
    repositoryListEnabled: options.repositoryListEnabled,
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
    loadBehaviorAvailable: false,
    listBehaviorAvailable: options.listBehaviorAvailable,
    deleteBehaviorAvailable: false,
    metadataUpdateBehaviorAvailable: false,
    draftStateRead: false,
    rosterStateRead: false,
    matchStateRead: false,
    showStateRead: false,
    businessStateRead: false,
    fanSocialStateRead: false,
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

interface ListedSaveIdentityRow {
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
  readonly metadataSchemaVersion: string | null;
  readonly metadataCreatedAt: string | null;
  readonly metadataUpdatedAt: string | null;
}
