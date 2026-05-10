export type SQLiteDurableSaveIdentityPathTargetKind =
  | "controlled-local-file"
  | "memory"
  | "missing"
  | "unsupported";

export type SQLiteDurableSaveIdentityPathUnsafeReason =
  | "missing-database-path"
  | "memory-target-not-durable"
  | "absolute-path-not-allowed"
  | "uri-target-not-allowed"
  | "path-traversal-not-allowed"
  | "outside-controlled-save-directory"
  | "missing-database-file-name"
  | "unsupported-database-extension"
  | "invalid-path-character";

export interface SQLiteDurableSaveIdentityPathBoundaryShell {
  readonly status: "diagnostics-only";
  readonly durablePathBoundaryId: string;
  readonly requestedDatabasePath: string;
  readonly normalizedDatabaseTarget: string;
  readonly targetKind: SQLiteDurableSaveIdentityPathTargetKind;
  readonly allowedForDurableIdentityPersistence: boolean;
  readonly unsafePathReasons: readonly SQLiteDurableSaveIdentityPathUnsafeReason[];
  readonly durableStoragePlanned: boolean;
  readonly durableStorageUsed: false;
  readonly repositoryBehaviorEnabled: false;
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly databaseOpened: false;
  readonly databaseFileCreated: false;
  readonly sqlExecuted: false;
  readonly repositoryMethodsAvailable: false;
  readonly createSaveBehaviorAvailable: false;
  readonly loadBehaviorAvailable: false;
  readonly listBehaviorAvailable: false;
  readonly deleteBehaviorAvailable: false;
  readonly metadataUpdateBehaviorAvailable: false;
  readonly gameplayStatePersisted: false;
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

export interface CreateSQLiteDurableSaveIdentityPathBoundaryShellOptions {
  readonly durablePathBoundaryId?: string;
  readonly requestedDatabasePath?: string;
}

const CONTROLLED_SAVE_DIRECTORY = "data/saves/";
const SUPPORTED_SQLITE_EXTENSIONS = Object.freeze([".sqlite", ".sqlite3", ".db"]);

export function createSQLiteDurableSaveIdentityPathBoundaryShell(
  options: CreateSQLiteDurableSaveIdentityPathBoundaryShellOptions
): SQLiteDurableSaveIdentityPathBoundaryShell {
  const durablePathBoundaryId = normalizeString(options.durablePathBoundaryId);
  const requestedDatabasePath = normalizeString(options.requestedDatabasePath);
  const normalizedDatabaseTarget = normalizeDatabaseTarget(requestedDatabasePath);
  const unsafePathReasons = createUnsafePathReasons(
    requestedDatabasePath,
    normalizedDatabaseTarget
  );
  const allowedForDurableIdentityPersistence = unsafePathReasons.length === 0;

  return Object.freeze({
    status: "diagnostics-only",
    durablePathBoundaryId,
    requestedDatabasePath,
    normalizedDatabaseTarget,
    targetKind: createTargetKind(
      requestedDatabasePath,
      normalizedDatabaseTarget,
      unsafePathReasons
    ),
    allowedForDurableIdentityPersistence,
    unsafePathReasons,
    durableStoragePlanned: allowedForDurableIdentityPersistence,
    durableStorageUsed: false,
    repositoryBehaviorEnabled: false,
    diagnosticsOnly: true,
    playerFacing: false,
    databaseOpened: false,
    databaseFileCreated: false,
    sqlExecuted: false,
    repositoryMethodsAvailable: false,
    createSaveBehaviorAvailable: false,
    loadBehaviorAvailable: false,
    listBehaviorAvailable: false,
    deleteBehaviorAvailable: false,
    metadataUpdateBehaviorAvailable: false,
    gameplayStatePersisted: false,
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

function createUnsafePathReasons(
  requestedDatabasePath: string,
  normalizedDatabaseTarget: string
): readonly SQLiteDurableSaveIdentityPathUnsafeReason[] {
  if (!requestedDatabasePath) {
    return Object.freeze(["missing-database-path"]);
  }

  if (requestedDatabasePath === ":memory:") {
    return Object.freeze(["memory-target-not-durable"]);
  }

  return Object.freeze([
    ...(isAbsolutePath(requestedDatabasePath)
      ? ["absolute-path-not-allowed" as const]
      : []),
    ...(isUriTarget(requestedDatabasePath)
      ? ["uri-target-not-allowed" as const]
      : []),
    ...(hasPathTraversal(normalizedDatabaseTarget)
      ? ["path-traversal-not-allowed" as const]
      : []),
    ...(hasInvalidPathCharacter(requestedDatabasePath)
      ? ["invalid-path-character" as const]
      : []),
    ...(normalizedDatabaseTarget
      && !normalizedDatabaseTarget.startsWith(CONTROLLED_SAVE_DIRECTORY)
      ? ["outside-controlled-save-directory" as const]
      : []),
    ...(normalizedDatabaseTarget
      && isMissingDatabaseFileName(requestedDatabasePath, normalizedDatabaseTarget)
      ? ["missing-database-file-name" as const]
      : []),
    ...(normalizedDatabaseTarget && !hasSupportedSQLiteExtension(normalizedDatabaseTarget)
      ? ["unsupported-database-extension" as const]
      : [])
  ]);
}

function createTargetKind(
  requestedDatabasePath: string,
  normalizedDatabaseTarget: string,
  unsafePathReasons: readonly SQLiteDurableSaveIdentityPathUnsafeReason[]
): SQLiteDurableSaveIdentityPathTargetKind {
  if (!requestedDatabasePath) {
    return "missing";
  }

  if (requestedDatabasePath === ":memory:") {
    return "memory";
  }

  return unsafePathReasons.length === 0
    && normalizedDatabaseTarget.startsWith(CONTROLLED_SAVE_DIRECTORY)
    ? "controlled-local-file"
    : "unsupported";
}

function normalizeDatabaseTarget(requestedDatabasePath: string): string {
  return requestedDatabasePath
    .replaceAll("\\", "/")
    .split("/")
    .filter((segment) => segment.length > 0 && segment !== ".")
    .join("/");
}

function isAbsolutePath(requestedDatabasePath: string): boolean {
  return requestedDatabasePath.startsWith("/")
    || requestedDatabasePath.startsWith("\\")
    || /^[A-Za-z]:[\\/]/.test(requestedDatabasePath);
}

function isUriTarget(requestedDatabasePath: string): boolean {
  return /^[A-Za-z][A-Za-z0-9+.-]*:/.test(requestedDatabasePath)
    && !/^[A-Za-z]:[\\/]/.test(requestedDatabasePath);
}

function hasPathTraversal(normalizedDatabaseTarget: string): boolean {
  return normalizedDatabaseTarget
    .split("/")
    .some((segment) => segment === "..");
}

function hasInvalidPathCharacter(requestedDatabasePath: string): boolean {
  return requestedDatabasePath.includes("\0");
}

function isMissingDatabaseFileName(
  requestedDatabasePath: string,
  normalizedDatabaseTarget: string
): boolean {
  if (requestedDatabasePath.endsWith("/") || requestedDatabasePath.endsWith("\\")) {
    return true;
  }

  const fileName = normalizedDatabaseTarget.split("/").at(-1) ?? "";

  return !fileName || fileName.startsWith(".");
}

function hasSupportedSQLiteExtension(normalizedDatabaseTarget: string): boolean {
  return SUPPORTED_SQLITE_EXTENSIONS.some((extension) =>
    normalizedDatabaseTarget.endsWith(extension)
  );
}

function normalizeString(value: string | undefined): string {
  return value?.trim() ?? "";
}
