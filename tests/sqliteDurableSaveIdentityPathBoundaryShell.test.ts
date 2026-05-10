import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, it } from "node:test";

import {
  createSQLiteDurableSaveIdentityPathBoundaryShell
} from "../src/game/persistence/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

describe("SQLite Durable Save Identity Path Boundary Shell v0.1", () => {
  it("summarizes safe local database paths deterministically", () => {
    const firstBoundary = createSQLiteDurableSaveIdentityPathBoundaryShell({
      durablePathBoundaryId: " durable-save-identity-boundary-v0-1 ",
      requestedDatabasePath: " data\\saves\\save-identity.sqlite "
    });
    const secondBoundary = createSQLiteDurableSaveIdentityPathBoundaryShell({
      durablePathBoundaryId: "durable-save-identity-boundary-v0-1",
      requestedDatabasePath: "data\\saves\\save-identity.sqlite"
    });
    const slashBoundary = createSQLiteDurableSaveIdentityPathBoundaryShell({
      durablePathBoundaryId: "durable-save-identity-boundary-v0-1",
      requestedDatabasePath: "data/saves/save-identity.sqlite"
    });

    assert.deepEqual(secondBoundary, firstBoundary);
    assert.equal(
      slashBoundary.normalizedDatabaseTarget,
      firstBoundary.normalizedDatabaseTarget
    );
    assert.deepEqual(firstBoundary, {
      status: "diagnostics-only",
      durablePathBoundaryId: "durable-save-identity-boundary-v0-1",
      requestedDatabasePath: "data\\saves\\save-identity.sqlite",
      normalizedDatabaseTarget: "data/saves/save-identity.sqlite",
      targetKind: "controlled-local-file",
      allowedForDurableIdentityPersistence: true,
      unsafePathReasons: [],
      durableStoragePlanned: true,
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
  });

  it("blocks unsafe paths deterministically", () => {
    const missingBoundary = createSQLiteDurableSaveIdentityPathBoundaryShell({
      durablePathBoundaryId: "durable-save-identity-boundary-missing",
      requestedDatabasePath: " "
    });
    const memoryBoundary = createSQLiteDurableSaveIdentityPathBoundaryShell({
      durablePathBoundaryId: "durable-save-identity-boundary-memory",
      requestedDatabasePath: ":memory:"
    });
    const traversalBoundary = createSQLiteDurableSaveIdentityPathBoundaryShell({
      durablePathBoundaryId: "durable-save-identity-boundary-traversal",
      requestedDatabasePath: "data/saves/../save-identity.sqlite"
    });
    const absoluteBoundary = createSQLiteDurableSaveIdentityPathBoundaryShell({
      durablePathBoundaryId: "durable-save-identity-boundary-absolute",
      requestedDatabasePath: "C:\\next-gm\\save-identity.sqlite"
    });
    const uriBoundary = createSQLiteDurableSaveIdentityPathBoundaryShell({
      durablePathBoundaryId: "durable-save-identity-boundary-uri",
      requestedDatabasePath: "file:data/saves/save-identity.sqlite"
    });
    const extensionBoundary = createSQLiteDurableSaveIdentityPathBoundaryShell({
      durablePathBoundaryId: "durable-save-identity-boundary-extension",
      requestedDatabasePath: "data/saves/save-identity.txt"
    });

    assert.deepEqual(missingBoundary.unsafePathReasons, [
      "missing-database-path"
    ]);
    assert.equal(missingBoundary.targetKind, "missing");
    assert.deepEqual(memoryBoundary.unsafePathReasons, [
      "memory-target-not-durable"
    ]);
    assert.equal(memoryBoundary.targetKind, "memory");
    assert.deepEqual(traversalBoundary.unsafePathReasons, [
      "path-traversal-not-allowed"
    ]);
    assert.deepEqual(absoluteBoundary.unsafePathReasons, [
      "absolute-path-not-allowed",
      "outside-controlled-save-directory"
    ]);
    assert.deepEqual(uriBoundary.unsafePathReasons, [
      "uri-target-not-allowed",
      "outside-controlled-save-directory"
    ]);
    assert.deepEqual(extensionBoundary.unsafePathReasons, [
      "unsupported-database-extension"
    ]);
    assert.equal(traversalBoundary.allowedForDurableIdentityPersistence, false);
    assert.equal(absoluteBoundary.allowedForDurableIdentityPersistence, false);
    assert.equal(uriBoundary.allowedForDurableIdentityPersistence, false);
    assert.equal(extensionBoundary.allowedForDurableIdentityPersistence, false);
  });

  it("keeps durable planning separate from repository behavior", () => {
    const boundary = createSQLiteDurableSaveIdentityPathBoundaryShell({
      durablePathBoundaryId: "durable-save-identity-boundary-planned",
      requestedDatabasePath: "data/saves/planned-save-identity.sqlite3"
    });

    assert.equal(boundary.allowedForDurableIdentityPersistence, true);
    assert.equal(boundary.durableStoragePlanned, true);
    assert.equal(boundary.durableStorageUsed, false);
    assert.equal(boundary.repositoryBehaviorEnabled, false);
    assert.equal(boundary.repositoryMethodsAvailable, false);
    assert.equal(boundary.databaseOpened, false);
    assert.equal(boundary.sqlExecuted, false);
  });

  it("does not create a database file", () => {
    const databasePath = "data/saves/__boundary-test-never-created.sqlite";

    assert.equal(existsSync(databasePath), false);

    const boundary = createSQLiteDurableSaveIdentityPathBoundaryShell({
      durablePathBoundaryId: "durable-save-identity-boundary-file-check",
      requestedDatabasePath: databasePath
    });

    assert.equal(boundary.allowedForDurableIdentityPersistence, true);
    assert.equal(boundary.databaseFileCreated, false);
    assert.equal(existsSync(databasePath), false);
  });

  it("does not expose repository, load, list, delete, or update behavior", () => {
    const boundary = createSQLiteDurableSaveIdentityPathBoundaryShell({
      durablePathBoundaryId: "durable-save-identity-boundary-no-surface",
      requestedDatabasePath: "data/saves/no-surface-save-identity.db"
    });

    assert.equal(boundary.status, "diagnostics-only");
    assert.equal(boundary.diagnosticsOnly, true);
    assert.equal(boundary.playerFacing, false);
    assert.equal(boundary.repositoryBehaviorEnabled, false);
    assert.equal(boundary.createSaveBehaviorAvailable, false);
    assert.equal(boundary.loadBehaviorAvailable, false);
    assert.equal(boundary.listBehaviorAvailable, false);
    assert.equal(boundary.deleteBehaviorAvailable, false);
    assert.equal(boundary.metadataUpdateBehaviorAvailable, false);
    assert.equal(boundary.gameplayStatePersisted, false);
    assert.equal(boundary.gameplayStarted, false);
    assert.equal(boundary.weekAdvanced, false);
    assert.equal(boundary.draftExecuted, false);
    assert.equal(boundary.rosterAssigned, false);
    assert.equal(Object.hasOwn(boundary, "createSave"), false);
    assert.equal(Object.hasOwn(boundary, "loadSave"), false);
    assert.equal(Object.hasOwn(boundary, "listSaves"), false);
    assert.equal(Object.hasOwn(boundary, "deleteSave"), false);
    assert.equal(Object.hasOwn(boundary, "updateSaveMetadata"), false);
    assert.equal(Object.hasOwn(boundary, "openDatabase"), false);
    assert.equal(Object.hasOwn(boundary, "executeSql"), false);
    assert.equal(Object.hasOwn(boundary, "advanceWeek"), false);
    assert.equal(Object.hasOwn(boundary, "generatedText"), false);
  });

  it("keeps existing engine behavior and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "sqlite-durable-save-identity-boundary-no-engine-change";
    const firstResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createSQLiteDurableSaveIdentityPathBoundaryShell({
      durablePathBoundaryId: "durable-save-identity-boundary-engine-check",
      requestedDatabasePath: "data/saves/engine-check-save-identity.sqlite"
    });

    const secondResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });
});
