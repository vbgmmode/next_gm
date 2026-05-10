import type { PersistenceAdapterContractShell } from "./persistenceAdapterContract.ts";
import type { SaveDataShapeExpectationsShell } from "./saveDataShapeExpectations.ts";
import type { SaveProgressionContractShell } from "./saveProgressionContract.ts";
import type { SQLiteAdapterRefinementShell } from "./sqliteAdapterRefinement.ts";
import type { SQLiteMigrationExpectationsShell } from "./sqliteMigrationExpectations.ts";
import type { SQLiteSchemaExpectationsShell } from "./sqliteSchemaExpectations.ts";
import type {
  StorageAdapterInterfaceExpectationsShell
} from "./storageAdapterInterfaceExpectations.ts";

export type SQLitePersistenceReadiness =
  | "missing"
  | "structural-issues"
  | "structurally-ready";

export type OverallSQLitePersistenceReadiness =
  | "missing-persistence-pieces"
  | "structural-issues"
  | "structural-warnings"
  | "structurally-ready";

export type SQLitePersistencePiece =
  | "save-progression-contract"
  | "persistence-adapter-contract"
  | "storage-adapter-interface-expectations"
  | "save-data-shape-expectations"
  | "sqlite-schema-expectations"
  | "sqlite-migration-expectations"
  | "sqlite-adapter-refinement";

export type MissingSQLitePersistencePiece =
  `missing:${SQLitePersistencePiece}`;

export type SQLitePersistenceWarning =
  | SaveProgressionContractShell["readiness"]["issues"][number]
  | PersistenceAdapterContractShell["readiness"]["issues"][number]
  | StorageAdapterInterfaceExpectationsShell["readiness"]["issues"][number]
  | StorageAdapterInterfaceExpectationsShell["unsupportedOperationWarnings"][number]
  | StorageAdapterInterfaceExpectationsShell["missingCapabilityWarnings"][number]
  | SaveDataShapeExpectationsShell["readiness"]["issues"][number]
  | SaveDataShapeExpectationsShell["missingSectionWarnings"][number]
  | SaveDataShapeExpectationsShell["missingFieldWarnings"][number]
  | SQLiteSchemaExpectationsShell["readiness"]["issues"][number]
  | SQLiteSchemaExpectationsShell["missingTableWarnings"][number]
  | SQLiteSchemaExpectationsShell["missingKeyWarnings"][number]
  | SQLiteSchemaExpectationsShell["missingIndexWarnings"][number]
  | SQLiteMigrationExpectationsShell["readiness"]["issues"][number]
  | SQLiteMigrationExpectationsShell["missingMigrationStepWarnings"][number]
  | SQLiteMigrationExpectationsShell["missingRollbackWarnings"][number]
  | SQLiteAdapterRefinementShell["readiness"]["issues"][number]
  | SQLiteAdapterRefinementShell["adapterRefinementWarnings"][number];

export interface SQLitePersistenceWarningSummary {
  readonly status: "diagnostics-only";
  readonly saveContractWarnings: readonly SaveProgressionContractShell["readiness"]["issues"][number][];
  readonly adapterContractWarnings: readonly PersistenceAdapterContractShell["readiness"]["issues"][number][];
  readonly storageExpectationWarnings: readonly (
    | StorageAdapterInterfaceExpectationsShell["readiness"]["issues"][number]
    | StorageAdapterInterfaceExpectationsShell["unsupportedOperationWarnings"][number]
    | StorageAdapterInterfaceExpectationsShell["missingCapabilityWarnings"][number]
  )[];
  readonly saveShapeWarnings: readonly (
    | SaveDataShapeExpectationsShell["readiness"]["issues"][number]
    | SaveDataShapeExpectationsShell["missingSectionWarnings"][number]
    | SaveDataShapeExpectationsShell["missingFieldWarnings"][number]
  )[];
  readonly sqliteSchemaWarnings: readonly (
    | SQLiteSchemaExpectationsShell["readiness"]["issues"][number]
    | SQLiteSchemaExpectationsShell["missingTableWarnings"][number]
    | SQLiteSchemaExpectationsShell["missingKeyWarnings"][number]
    | SQLiteSchemaExpectationsShell["missingIndexWarnings"][number]
  )[];
  readonly sqliteMigrationWarnings: readonly (
    | SQLiteMigrationExpectationsShell["readiness"]["issues"][number]
    | SQLiteMigrationExpectationsShell["missingMigrationStepWarnings"][number]
    | SQLiteMigrationExpectationsShell["missingRollbackWarnings"][number]
  )[];
  readonly sqliteAdapterRefinementWarnings: readonly (
    | SQLiteAdapterRefinementShell["readiness"]["issues"][number]
    | SQLiteAdapterRefinementShell["adapterRefinementWarnings"][number]
  )[];
  readonly allWarnings: readonly SQLitePersistenceWarning[];
  readonly gameplayAffecting: false;
  readonly playerFacing: false;
}

export interface SQLitePersistenceReadinessSummaryShell {
  readonly status: "diagnostics-only";
  readonly saveContractReadiness: SQLitePersistenceReadiness;
  readonly adapterContractReadiness: SQLitePersistenceReadiness;
  readonly storageExpectationReadiness: SQLitePersistenceReadiness;
  readonly saveShapeReadiness: SQLitePersistenceReadiness;
  readonly sqliteSchemaReadiness: SQLitePersistenceReadiness;
  readonly sqliteMigrationReadiness: SQLitePersistenceReadiness;
  readonly sqliteAdapterRefinementReadiness: SQLitePersistenceReadiness;
  readonly missingPersistencePieces: readonly MissingSQLitePersistencePiece[];
  readonly warningSummary: SQLitePersistenceWarningSummary;
  readonly overallSQLitePersistenceReadiness: OverallSQLitePersistenceReadiness;
  readonly gameplayAffecting: false;
  readonly playerFacing: false;
}

export interface CreateSQLitePersistenceReadinessSummaryOptions {
  readonly saveProgressionContract?: SaveProgressionContractShell;
  readonly adapterContract?: PersistenceAdapterContractShell;
  readonly storageExpectations?: StorageAdapterInterfaceExpectationsShell;
  readonly saveShapeExpectations?: SaveDataShapeExpectationsShell;
  readonly sqliteSchemaExpectations?: SQLiteSchemaExpectationsShell;
  readonly sqliteMigrationExpectations?: SQLiteMigrationExpectationsShell;
  readonly sqliteAdapterRefinement?: SQLiteAdapterRefinementShell;
}

export function createSQLitePersistenceReadinessSummary(
  options: CreateSQLitePersistenceReadinessSummaryOptions
): SQLitePersistenceReadinessSummaryShell {
  const saveContractReadiness = summarizeStructurallyReady(
    options.saveProgressionContract?.readiness.structurallyReady
  );
  const adapterContractReadiness = summarizeStructurallyReady(
    options.adapterContract?.readiness.structurallyReady
  );
  const storageExpectationReadiness = summarizeStructurallyReady(
    options.storageExpectations?.readiness.structurallyReady
  );
  const saveShapeReadiness = options.saveShapeExpectations?.saveShapeReadiness ?? "missing";
  const sqliteSchemaReadiness = options.sqliteSchemaExpectations?.schemaReadiness ?? "missing";
  const sqliteMigrationReadiness = options.sqliteMigrationExpectations?.migrationReadiness ?? "missing";
  const sqliteAdapterRefinementReadiness =
    options.sqliteAdapterRefinement?.adapterRefinementReadiness ?? "missing";
  const missingPersistencePieces = createMissingPersistencePieces(options);
  const warningSummary = createWarningSummary(options);
  const overallSQLitePersistenceReadiness = summarizeOverallReadiness({
    missingPersistencePieces,
    warningSummary,
    readinessValues: [
      saveContractReadiness,
      adapterContractReadiness,
      storageExpectationReadiness,
      saveShapeReadiness,
      sqliteSchemaReadiness,
      sqliteMigrationReadiness,
      sqliteAdapterRefinementReadiness
    ]
  });

  return Object.freeze({
    status: "diagnostics-only",
    saveContractReadiness,
    adapterContractReadiness,
    storageExpectationReadiness,
    saveShapeReadiness,
    sqliteSchemaReadiness,
    sqliteMigrationReadiness,
    sqliteAdapterRefinementReadiness,
    missingPersistencePieces,
    warningSummary,
    overallSQLitePersistenceReadiness,
    gameplayAffecting: false,
    playerFacing: false
  });
}

function summarizeStructurallyReady(
  structurallyReady: boolean | undefined
): SQLitePersistenceReadiness {
  if (structurallyReady === undefined) {
    return "missing";
  }

  return structurallyReady ? "structurally-ready" : "structural-issues";
}

function createMissingPersistencePieces(
  options: CreateSQLitePersistenceReadinessSummaryOptions
): readonly MissingSQLitePersistencePiece[] {
  return Object.freeze([
    ...(options.saveProgressionContract ? [] : ["missing:save-progression-contract" as const]),
    ...(options.adapterContract ? [] : ["missing:persistence-adapter-contract" as const]),
    ...(options.storageExpectations ? [] : ["missing:storage-adapter-interface-expectations" as const]),
    ...(options.saveShapeExpectations ? [] : ["missing:save-data-shape-expectations" as const]),
    ...(options.sqliteSchemaExpectations ? [] : ["missing:sqlite-schema-expectations" as const]),
    ...(options.sqliteMigrationExpectations ? [] : ["missing:sqlite-migration-expectations" as const]),
    ...(options.sqliteAdapterRefinement ? [] : ["missing:sqlite-adapter-refinement" as const])
  ]);
}

function createWarningSummary(
  options: CreateSQLitePersistenceReadinessSummaryOptions
): SQLitePersistenceWarningSummary {
  const saveContractWarnings = Object.freeze([
    ...(options.saveProgressionContract?.readiness.issues ?? [])
  ]);
  const adapterContractWarnings = Object.freeze([
    ...(options.adapterContract?.readiness.issues ?? [])
  ]);
  const storageExpectationWarnings = Object.freeze([
    ...(options.storageExpectations?.readiness.issues ?? []),
    ...(options.storageExpectations?.unsupportedOperationWarnings ?? []),
    ...(options.storageExpectations?.missingCapabilityWarnings ?? [])
  ]);
  const saveShapeWarnings = Object.freeze([
    ...(options.saveShapeExpectations?.readiness.issues ?? []),
    ...(options.saveShapeExpectations?.missingSectionWarnings ?? []),
    ...(options.saveShapeExpectations?.missingFieldWarnings ?? [])
  ]);
  const sqliteSchemaWarnings = Object.freeze([
    ...(options.sqliteSchemaExpectations?.readiness.issues ?? []),
    ...(options.sqliteSchemaExpectations?.missingTableWarnings ?? []),
    ...(options.sqliteSchemaExpectations?.missingKeyWarnings ?? []),
    ...(options.sqliteSchemaExpectations?.missingIndexWarnings ?? [])
  ]);
  const sqliteMigrationWarnings = Object.freeze([
    ...(options.sqliteMigrationExpectations?.readiness.issues ?? []),
    ...(options.sqliteMigrationExpectations?.missingMigrationStepWarnings ?? []),
    ...(options.sqliteMigrationExpectations?.missingRollbackWarnings ?? [])
  ]);
  const sqliteAdapterRefinementWarnings = Object.freeze([
    ...(options.sqliteAdapterRefinement?.readiness.issues ?? []),
    ...(options.sqliteAdapterRefinement?.adapterRefinementWarnings ?? [])
  ]);
  const allWarnings = Object.freeze([
    ...saveContractWarnings,
    ...adapterContractWarnings,
    ...storageExpectationWarnings,
    ...saveShapeWarnings,
    ...sqliteSchemaWarnings,
    ...sqliteMigrationWarnings,
    ...sqliteAdapterRefinementWarnings
  ]);

  return Object.freeze({
    status: "diagnostics-only",
    saveContractWarnings,
    adapterContractWarnings,
    storageExpectationWarnings,
    saveShapeWarnings,
    sqliteSchemaWarnings,
    sqliteMigrationWarnings,
    sqliteAdapterRefinementWarnings,
    allWarnings,
    gameplayAffecting: false,
    playerFacing: false
  });
}

function summarizeOverallReadiness(options: {
  readonly missingPersistencePieces: readonly MissingSQLitePersistencePiece[];
  readonly warningSummary: SQLitePersistenceWarningSummary;
  readonly readinessValues: readonly SQLitePersistenceReadiness[];
}): OverallSQLitePersistenceReadiness {
  if (options.missingPersistencePieces.length > 0) {
    return "missing-persistence-pieces";
  }

  if (options.readinessValues.some((readiness) => readiness === "structural-issues")) {
    return "structural-issues";
  }

  if (options.warningSummary.allWarnings.length > 0) {
    return "structural-warnings";
  }

  return "structurally-ready";
}
