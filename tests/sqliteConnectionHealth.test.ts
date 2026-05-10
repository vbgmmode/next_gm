import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createSQLiteConnectionHealthShell } from "../src/game/persistence/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

describe("SQLite Connection Health Shell v0.1", () => {
  it("reports structurally-ready when in-memory connection setup is available", () => {
    const health = createSQLiteConnectionHealthShell({
      connectionTarget: ":memory:"
    });

    assert.deepEqual(health, {
      status: "diagnostics-only",
      connectionTarget: ":memory:",
      connectionAvailable: true,
      connectionHealthReadiness: "structurally-ready",
      issues: [],
      sqliteRuntime: "node:sqlite",
      openedForHealthCheck: true,
      closedAfterHealthCheck: true,
      migrationsCreated: false,
      tablesCreated: false,
      saveBehaviorAvailable: false,
      loadBehaviorAvailable: false,
      listBehaviorAvailable: false,
      deleteBehaviorAvailable: false,
      gameplayAffecting: false,
      playerFacing: false
    });
  });

  it("reports missing connection config deterministically", () => {
    const firstHealth = createSQLiteConnectionHealthShell({});
    const secondHealth = createSQLiteConnectionHealthShell({ connectionTarget: " " });

    assert.deepEqual(firstHealth, secondHealth);
    assert.deepEqual(firstHealth.issues, ["missing-connection-target"]);
    assert.equal(firstHealth.connectionTarget, "");
    assert.equal(firstHealth.connectionAvailable, false);
    assert.equal(firstHealth.openedForHealthCheck, false);
    assert.equal(firstHealth.closedAfterHealthCheck, false);
    assert.equal(firstHealth.connectionHealthReadiness, "structural-issues");
  });

  it("reports unsupported connection config deterministically", () => {
    const firstHealth = createSQLiteConnectionHealthShell({
      connectionTarget: "file:next-gm.sqlite"
    });
    const secondHealth = createSQLiteConnectionHealthShell({
      connectionTarget: "file:next-gm.sqlite"
    });

    assert.deepEqual(secondHealth, firstHealth);
    assert.deepEqual(firstHealth.issues, ["unsupported-connection-target"]);
    assert.equal(firstHealth.connectionTarget, "");
    assert.equal(firstHealth.connectionAvailable, false);
    assert.equal(firstHealth.openedForHealthCheck, false);
    assert.equal(firstHealth.closedAfterHealthCheck, false);
    assert.equal(firstHealth.connectionHealthReadiness, "structural-issues");
  });

  it("keeps output diagnostics-only and not player-facing", () => {
    const health = createSQLiteConnectionHealthShell({
      connectionTarget: ":memory:"
    });

    assert.equal(health.status, "diagnostics-only");
    assert.equal(health.gameplayAffecting, false);
    assert.equal(health.playerFacing, false);
    assert.equal(health.migrationsCreated, false);
    assert.equal(health.tablesCreated, false);
    assert.equal(health.saveBehaviorAvailable, false);
    assert.equal(health.loadBehaviorAvailable, false);
    assert.equal(health.listBehaviorAvailable, false);
    assert.equal(health.deleteBehaviorAvailable, false);
    assert.equal(Object.hasOwn(health, "migrationRunner"), false);
    assert.equal(Object.hasOwn(health, "createTable"), false);
    assert.equal(Object.hasOwn(health, "alterTable"), false);
    assert.equal(Object.hasOwn(health, "save"), false);
    assert.equal(Object.hasOwn(health, "load"), false);
    assert.equal(Object.hasOwn(health, "list"), false);
    assert.equal(Object.hasOwn(health, "delete"), false);
    assert.equal(Object.hasOwn(health, "advanceWeek"), false);
    assert.equal(Object.hasOwn(health, "generatedText"), false);
  });

  it("keeps existing engine behavior and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "sqlite-connection-health-no-engine-change";
    const firstResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createSQLiteConnectionHealthShell({ connectionTarget: ":memory:" });

    const secondResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });
});
