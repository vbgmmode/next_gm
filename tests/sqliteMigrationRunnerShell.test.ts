import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createSQLiteConnectionHealthShell,
  createSQLiteMigrationRunnerShell
} from "../src/game/persistence/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

describe("SQLite Migration Runner Shell v0.1", () => {
  it("creates a structurally-ready migration runner shell from complete metadata", () => {
    const connectionHealth = createSQLiteConnectionHealthShell({
      connectionTarget: ":memory:"
    });
    const runner = createSQLiteMigrationRunnerShell({
      migrationId: "sqlite-migration-runner-v0",
      migrationVersion: "sqlite-save-schema-v0-placeholder",
      migrationName: "SQLite save schema bootstrap placeholder",
      requiredSteps: [
        "open-controlled-connection",
        "inspect-migration-metadata",
        "report-readiness"
      ],
      rollbackSupported: true,
      connectionHealth
    });

    assert.deepEqual(runner, {
      status: "diagnostics-only",
      migrationId: "sqlite-migration-runner-v0",
      migrationVersion: "sqlite-save-schema-v0-placeholder",
      migrationName: "SQLite save schema bootstrap placeholder",
      requiredSteps: [
        "open-controlled-connection",
        "inspect-migration-metadata",
        "report-readiness"
      ],
      rollbackSupported: true,
      connectionHealthReference: {
        status: "diagnostics-only",
        referenceStatus: "provided",
        connectionHealthReadiness: "structurally-ready",
        connectionAvailable: true,
        connectionIssues: [],
        openedForHealthCheck: true,
        closedAfterHealthCheck: true,
        gameplayAffecting: false,
        playerFacing: false
      },
      migrationRunnerReadiness: "structurally-ready",
      structurallyUsable: true,
      issues: [],
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
  });

  it("reports missing migration metadata deterministically", () => {
    const firstRunner = createSQLiteMigrationRunnerShell({});
    const secondRunner = createSQLiteMigrationRunnerShell({
      migrationId: " ",
      migrationVersion: " ",
      migrationName: " ",
      requiredSteps: [" ", ""]
    });

    assert.deepEqual(secondRunner, firstRunner);
    assert.deepEqual(firstRunner.issues, [
      "missing-migration-id",
      "missing-migration-version",
      "missing-migration-name",
      "missing-required-steps",
      "missing-rollback-support"
    ]);
    assert.equal(firstRunner.migrationId, "");
    assert.equal(firstRunner.migrationVersion, "");
    assert.equal(firstRunner.migrationName, "");
    assert.deepEqual(firstRunner.requiredSteps, []);
    assert.equal(firstRunner.rollbackSupported, "missing");
    assert.equal(firstRunner.connectionHealthReference.referenceStatus, "missing");
    assert.equal(firstRunner.migrationRunnerReadiness, "structural-issues");
    assert.equal(firstRunner.structurallyUsable, false);
  });

  it("summarizes connection health readiness without executing migrations", () => {
    const connectionHealth = createSQLiteConnectionHealthShell({
      connectionTarget: "file:future-save.sqlite"
    });
    const runner = createSQLiteMigrationRunnerShell({
      migrationId: "sqlite-migration-runner-connection-warning",
      migrationVersion: "sqlite-save-schema-v0-placeholder",
      migrationName: "SQLite connection warning metadata",
      requiredSteps: ["inspect-migration-metadata"],
      rollbackSupported: false,
      connectionHealth
    });

    assert.deepEqual(runner.connectionHealthReference, {
      status: "diagnostics-only",
      referenceStatus: "provided",
      connectionHealthReadiness: "structural-issues",
      connectionAvailable: false,
      connectionIssues: ["unsupported-connection-target"],
      openedForHealthCheck: false,
      closedAfterHealthCheck: false,
      gameplayAffecting: false,
      playerFacing: false
    });
    assert.deepEqual(runner.issues, ["connection-health-not-ready"]);
    assert.equal(runner.migrationRunnerReadiness, "structural-issues");
    assert.equal(runner.migrationsExecuted, false);
    assert.equal(runner.schemaCreated, false);
    assert.equal(runner.tablesCreated, false);
    assert.equal(runner.tablesAltered, false);
    assert.equal(runner.databaseWritten, false);
  });

  it("keeps output diagnostics-only and not player-facing", () => {
    const runner = createSQLiteMigrationRunnerShell({
      migrationId: "sqlite-migration-runner-boundary",
      migrationVersion: "sqlite-save-schema-v0-placeholder",
      migrationName: "Boundary metadata",
      requiredSteps: ["inspect-migration-metadata"],
      rollbackSupported: true,
      connectionHealth: createSQLiteConnectionHealthShell({ connectionTarget: ":memory:" })
    });

    assert.equal(runner.status, "diagnostics-only");
    assert.equal(runner.gameplayAffecting, false);
    assert.equal(runner.playerFacing, false);
    assert.equal(runner.connectionHealthReference.playerFacing, false);
    assert.equal(runner.migrationsExecuted, false);
    assert.equal(runner.schemaCreated, false);
    assert.equal(runner.tablesCreated, false);
    assert.equal(runner.tablesAltered, false);
    assert.equal(runner.databaseWritten, false);
    assert.equal(runner.saveBehaviorAvailable, false);
    assert.equal(runner.loadBehaviorAvailable, false);
    assert.equal(runner.listBehaviorAvailable, false);
    assert.equal(runner.deleteBehaviorAvailable, false);
    assert.equal(Object.hasOwn(runner, "execute"), false);
    assert.equal(Object.hasOwn(runner, "run"), false);
    assert.equal(Object.hasOwn(runner, "createTable"), false);
    assert.equal(Object.hasOwn(runner, "alterTable"), false);
    assert.equal(Object.hasOwn(runner, "save"), false);
    assert.equal(Object.hasOwn(runner, "load"), false);
    assert.equal(Object.hasOwn(runner, "list"), false);
    assert.equal(Object.hasOwn(runner, "delete"), false);
    assert.equal(Object.hasOwn(runner, "advanceWeek"), false);
    assert.equal(Object.hasOwn(runner, "generatedText"), false);
  });

  it("keeps existing engine behavior and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "sqlite-migration-runner-no-engine-change";
    const firstResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createSQLiteMigrationRunnerShell({
      migrationId: "sqlite-migration-runner-engine-check",
      migrationVersion: "sqlite-save-schema-v0-placeholder",
      migrationName: "Engine boundary metadata",
      requiredSteps: ["inspect-migration-metadata"],
      rollbackSupported: true,
      connectionHealth: createSQLiteConnectionHealthShell({ connectionTarget: ":memory:" })
    });

    const secondResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });
});
