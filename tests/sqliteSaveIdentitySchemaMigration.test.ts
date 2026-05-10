import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createSQLiteSaveIdentitySchemaMigrationShell } from "../src/game/persistence/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

describe("SQLite Save Identity Schema Migration Shell v0.1", () => {
  it("includes expected table names in inert migration SQL", () => {
    const migration = createSQLiteSaveIdentitySchemaMigrationShell();
    const allSql = migration.sqlStatements.join("\n");

    assert.deepEqual(migration.tableNames, [
      "saves",
      "save_metadata",
      "schema_migrations"
    ]);
    assert.equal(allSql.includes("CREATE TABLE IF NOT EXISTS saves"), true);
    assert.equal(allSql.includes("CREATE TABLE IF NOT EXISTS save_metadata"), true);
    assert.equal(allSql.includes("CREATE TABLE IF NOT EXISTS schema_migrations"), true);
    assert.equal(migration.sqlStatementCount, 3);
  });

  it("includes expected identity, replay, and progression columns", () => {
    const migration = createSQLiteSaveIdentitySchemaMigrationShell();
    const allSql = migration.sqlStatements.join("\n");

    assert.deepEqual(migration.identityColumns, [
      "saveId",
      "saveSlotId",
      "setupId",
      "selectedBrandId",
      "playerManagerId"
    ]);
    assert.deepEqual(migration.replayColumns, ["seedLabel", "replayId"]);
    assert.deepEqual(migration.progressionColumns, [
      "schemaVersion",
      "createdAt",
      "updatedAt"
    ]);

    for (const columnName of [
      ...migration.identityColumns,
      ...migration.replayColumns,
      ...migration.progressionColumns
    ]) {
      assert.equal(allSql.includes(columnName), true);
    }
  });

  it("keeps migration metadata deterministic and runner-readable", () => {
    const firstMigration = createSQLiteSaveIdentitySchemaMigrationShell();
    const secondMigration = createSQLiteSaveIdentitySchemaMigrationShell();

    assert.deepEqual(secondMigration, firstMigration);
    assert.equal(firstMigration.migrationId, "sqlite-save-identity-schema-v0-1");
    assert.equal(firstMigration.migrationVersion, "sqlite-save-schema-v0.1");
    assert.equal(
      firstMigration.migrationName,
      "Create local SQLite save identity schema"
    );
    assert.deepEqual(firstMigration.requiredSteps, [
      "define-saves-table-sql",
      "define-save-metadata-table-sql",
      "define-schema-migrations-table-sql"
    ]);
    assert.equal(firstMigration.runnerSummary.migrationRunnerReadiness, "structurally-ready");
    assert.equal(firstMigration.runnerSummary.migrationsExecuted, false);
    assert.equal(firstMigration.runnerSummary.schemaCreated, false);
    assert.equal(firstMigration.runnerSummary.tablesCreated, false);
    assert.equal(firstMigration.runnerSummary.databaseWritten, false);
  });

  it("does not execute the migration or perform database work", () => {
    const migration = createSQLiteSaveIdentitySchemaMigrationShell();

    assert.equal(migration.migrationExecuted, false);
    assert.equal(migration.databaseOpened, false);
    assert.equal(migration.databaseWritten, false);
    assert.equal(migration.schemaCreated, false);
    assert.equal(migration.tablesCreated, false);
    assert.equal(migration.tablesAltered, false);
    assert.equal(migration.saveBehaviorAvailable, false);
    assert.equal(migration.loadBehaviorAvailable, false);
    assert.equal(migration.listBehaviorAvailable, false);
    assert.equal(migration.deleteBehaviorAvailable, false);
    assert.equal(Object.hasOwn(migration, "execute"), false);
    assert.equal(Object.hasOwn(migration, "run"), false);
    assert.equal(Object.hasOwn(migration, "openDatabase"), false);
    assert.equal(Object.hasOwn(migration, "writeDatabase"), false);
    assert.equal(Object.hasOwn(migration, "createTable"), false);
    assert.equal(Object.hasOwn(migration, "alterTable"), false);
    assert.equal(Object.hasOwn(migration, "save"), false);
    assert.equal(Object.hasOwn(migration, "load"), false);
    assert.equal(Object.hasOwn(migration, "list"), false);
    assert.equal(Object.hasOwn(migration, "delete"), false);
  });

  it("keeps output diagnostics-only and not player-facing", () => {
    const migration = createSQLiteSaveIdentitySchemaMigrationShell();

    assert.equal(migration.status, "diagnostics-only");
    assert.equal(migration.migrationReadiness, "structurally-ready");
    assert.equal(migration.structurallyUsable, true);
    assert.deepEqual(migration.issues, []);
    assert.equal(migration.gameplayAffecting, false);
    assert.equal(migration.playerFacing, false);
    assert.equal(migration.runnerSummary.status, "diagnostics-only");
    assert.equal(migration.runnerSummary.playerFacing, false);
  });

  it("keeps existing engine behavior and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "sqlite-save-identity-schema-no-engine-change";
    const firstResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createSQLiteSaveIdentitySchemaMigrationShell();

    const secondResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });
});
