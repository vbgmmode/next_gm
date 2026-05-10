import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, it } from "node:test";

import {
  createNewGMModeSetupContractShell
} from "../src/game/domain/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const UNTOUCHED_SETUP_DATABASE =
  "data/saves/__new-gm-mode-setup-contract-should-not-exist.sqlite";

describe("New GM Mode Setup Contract Shell v0.1", () => {
  it("reports diagnosticsOnly true and playerFacing false", () => {
    const contract = createNewGMModeSetupContractShell();

    assert.equal(contract.status, "diagnostics-only");
    assert.equal(contract.diagnosticsOnly, true);
    assert.equal(contract.playerFacing, false);
    assert.equal(contract.gameplayAffecting, false);
    assert.equal(contract.setupContractId, "new-gm-mode-setup-contract-v0.1");
  });

  it("includes required future setup inputs", () => {
    const contract = createNewGMModeSetupContractShell();

    assert.deepEqual(contract.requiredFutureSetupInputs, [
      "selected-promotion-or-brand",
      "selected-manager-identity",
      "difficulty-mode",
      "draft-requirement",
      "starting-calendar-week-state",
      "roster-setup-requirement",
      "championship-division-setup-requirement",
      "save-identity-prerequisite"
    ]);
    assert.deepEqual(contract.setupReadinessSummary, {
      requiredInputCount: 8,
      describedOnly: true,
      playableStartReady: false
    });
    assert.equal(contract.setupReadiness, "requirements-described-only");
    assert.equal(contract.durableSaveIdentityPrerequisiteDescribed, true);
  });

  it("reports save identity create, read, and list as available", () => {
    const contract = createNewGMModeSetupContractShell();

    assert.equal(contract.saveIdentityCreateAvailable, true);
    assert.equal(contract.saveIdentityReadAvailable, true);
    assert.equal(contract.saveIdentityListAvailable, true);
    assert.equal(contract.saveIdentityDeleteAvailable, false);
    assert.equal(contract.saveIdentityUpdateAvailable, false);
    assert.equal(contract.setupRequirementDescriptionAvailable, true);
  });

  it("reports gameplay start, draft execution, weekly loop, payload persistence, and UI as unavailable", () => {
    const contract = createNewGMModeSetupContractShell();

    assert.equal(contract.gameplayStartAvailable, false);
    assert.equal(contract.draftExecutionAvailable, false);
    assert.equal(contract.weeklyLoopAvailable, false);
    assert.equal(contract.gameplayPayloadPersistenceAvailable, false);
    assert.equal(contract.uiWiringAvailable, false);
    assert.deepEqual(contract.blockedReasons, [
      "setup-contract-describes-requirements-only",
      "gameplay-start-not-implemented",
      "draft-execution-not-implemented",
      "roster-assignment-not-implemented",
      "championship-assignment-not-implemented",
      "division-construction-not-implemented",
      "calendar-advancement-not-implemented",
      "weekly-loop-not-implemented",
      "match-simulation-not-connected-to-setup",
      "business-fan-social-systems-not-connected-to-setup",
      "gameplay-payload-persistence-not-implemented",
      "ui-wiring-not-implemented"
    ]);
  });

  it("does not create a save or write to SQLite", () => {
    const contract = createNewGMModeSetupContractShell();

    assert.equal(contract.saveCreated, false);
    assert.equal(contract.sqliteWritten, false);
    assert.equal(contract.sqliteDatabaseOpened, false);
    assert.equal(existsSync(UNTOUCHED_SETUP_DATABASE), false);
    assert.equal(Object.hasOwn(contract, "saveRepository"), false);
    assert.equal(Object.hasOwn(contract, "createSave"), false);
    assert.equal(Object.hasOwn(contract, "sqliteConnection"), false);
  });

  it("does not execute draft logic or create rosters, championships, divisions, or match cards", () => {
    const contract = createNewGMModeSetupContractShell();

    assert.equal(contract.draftLogicExecuted, false);
    assert.equal(contract.rostersCreated, false);
    assert.equal(contract.championshipsCreated, false);
    assert.equal(contract.divisionsCreated, false);
    assert.equal(contract.matchCardsCreated, false);
    assert.equal(Object.hasOwn(contract, "draftExecution"), false);
    assert.equal(Object.hasOwn(contract, "rosterAssignment"), false);
    assert.equal(Object.hasOwn(contract, "championshipAssignment"), false);
    assert.equal(Object.hasOwn(contract, "divisionConstruction"), false);
    assert.equal(Object.hasOwn(contract, "matchCardBuilder"), false);
  });

  it("does not expose generated text or GenAI behavior", () => {
    const contract = createNewGMModeSetupContractShell();

    assert.equal(contract.generatedTextCreated, false);
    assert.equal(contract.genAIUsed, false);
    assert.equal(Object.hasOwn(contract, "generatedText"), false);
    assert.equal(Object.hasOwn(contract, "genAIClient"), false);
    assert.equal(Object.hasOwn(contract, "prompt"), false);
    assert.equal(Object.hasOwn(contract, "narrative"), false);
  });

  it("stays deterministic across repeated calls", () => {
    const firstContract = createNewGMModeSetupContractShell();
    const secondContract = createNewGMModeSetupContractShell();

    assert.deepEqual(secondContract, firstContract);
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "new-gm-mode-setup-contract-no-engine-change";
    const firstResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeSetupContractShell();

    const secondResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });
});
