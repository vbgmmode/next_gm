import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import {
  createPlayableNewGMModeGameplayStateModel,
  createPlayableNewGMModeSavePayloadContract,
  PLAYABLE_NEW_GM_MODE_SAVE_PAYLOAD_CONTRACT_CAPABILITY_FLAGS
} from "../src/game/domain/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const SAVE_PAYLOAD_CONTRACT_SOURCE =
  "src/game/domain/playableNewGMModeSavePayloadContract.ts";

describe("Playable New GM Mode Save Payload Contract v0.1", () => {
  it("wraps the gameplay state model in a payload contract without persisting it", () => {
    const gameplayStateModel = createPlayableNewGMModeGameplayStateModel({
      gameId: "game-raw-local-001",
      selectedBrandId: "raw",
      selectedBrandName: "Raw",
      currentWeek: 2,
      budget: {
        startingBudget: 120,
        spentBudget: 96,
        remainingBudget: 24,
        bookingReserveTarget: 20
      }
    });
    const contract = createPlayableNewGMModeSavePayloadContract({
      savePayloadContractId: "save-payload-raw-local-001",
      gameplayStateModel,
      createdAtLabel: "local-session-week-2"
    });

    assert.equal(contract.status, "payload-contract-only");
    assert.equal(contract.savePayloadContractId, "save-payload-raw-local-001");
    assert.equal(contract.payloadFormatVersion, "0.1.0");
    assert.equal(contract.localOnly, true);
    assert.equal(contract.persisted, false);
    assert.deepEqual(contract.payloadMetadata, {
      createdAtLabel: "local-session-week-2",
      source: "playable-new-gm-mode-local-session"
    });
    assert.deepEqual(contract.compatibility, {
      formatVersion: "0.1.0",
      minimumSupportedFormatVersion: "0.1.0",
      gameplayStateModelVersion: "0.1.0"
    });
    assert.equal(contract.gameplayStateModel, gameplayStateModel);
    assert.equal(contract.readiness.structurallyReady, true);
    assert.deepEqual(contract.readiness.issues, []);
    assert.deepEqual(contract.capabilityFlags, {
      canDescribeSavePayload: true,
      canSerializeForDurableSave: false,
      canWriteDurableSave: false,
      canReadDurableSave: false,
      canListDurableSaves: false,
      canDeleteDurableSaves: false,
      canUseBrowserStorage: false,
      canUseNetwork: false,
      canUseGeneratedText: false,
      canUseGenAI: false,
      canCallSimulationEngines: false
    });
  });

  it("includes all gameplay state model sections in the modeled payload", () => {
    const contract = createPlayableNewGMModeSavePayloadContract({
      savePayloadContractId: "save-payload-raw-local-001",
      gameplayStateModel: createPlayableNewGMModeGameplayStateModel({
        gameId: "game-raw-local-001",
        selectedBrandId: "raw",
        selectedBrandName: "Raw"
      })
    });

    assert.deepEqual(contract.readiness.modeledPayloadSections, [
      "payloadMetadata",
      "compatibility",
      "gameIdentity",
      "selectedBrand",
      "currentWeek",
      "budget",
      "signedRoster",
      "champions",
      "rivalries",
      "weeklyShowCards",
      "showResults",
      "superstarCurrentState",
      "rosterMomentum",
      "morale",
      "fatigue",
      "injuryRisk",
      "popularity",
      "rivalryHeat",
      "championTitleState",
      "financeFanSummaries",
      "weekHistory"
    ]);
  });

  it("reports missing and invalid payload contract prerequisites", () => {
    const contract = createPlayableNewGMModeSavePayloadContract({
      savePayloadContractId: " ",
      gameplayStateModel: createPlayableNewGMModeGameplayStateModel({
        gameId: " ",
        selectedBrandId: "raw",
        selectedBrandName: "Raw"
      })
    });
    const missingStateModelContract = createPlayableNewGMModeSavePayloadContract({
      savePayloadContractId: "save-payload-missing-model"
    });

    assert.equal(contract.readiness.structurallyReady, false);
    assert.deepEqual(contract.readiness.issues, [
      "missing-save-payload-contract-id",
      "gameplay-state-model-not-structurally-ready"
    ]);
    assert.deepEqual(missingStateModelContract.readiness.issues, [
      "missing-gameplay-state-model"
    ]);
    assert.equal(missingStateModelContract.compatibility.gameplayStateModelVersion, "missing");
  });

  it("freezes the contract and nested metadata", () => {
    const contract = createPlayableNewGMModeSavePayloadContract({
      savePayloadContractId: "save-payload-raw-local-001",
      gameplayStateModel: createPlayableNewGMModeGameplayStateModel({
        gameId: "game-raw-local-001",
        selectedBrandId: "raw",
        selectedBrandName: "Raw"
      })
    });

    assert.equal(Object.isFrozen(contract), true);
    assert.equal(Object.isFrozen(contract.payloadMetadata), true);
    assert.equal(Object.isFrozen(contract.compatibility), true);
    assert.equal(Object.isFrozen(contract.readiness), true);
    assert.equal(Object.isFrozen(contract.readiness.modeledPayloadSections), true);
  });

  it("exports the payload contract factory from the domain barrel", () => {
    assert.equal(typeof createPlayableNewGMModeSavePayloadContract, "function");
    assert.deepEqual(
      PLAYABLE_NEW_GM_MODE_SAVE_PAYLOAD_CONTRACT_CAPABILITY_FLAGS,
      createPlayableNewGMModeSavePayloadContract().capabilityFlags
    );
  });

  it("does not add storage, network, direct entropy, or engine-call behavior", () => {
    const source = readFileSync(SAVE_PAYLOAD_CONTRACT_SOURCE, "utf8");
    const forbiddenSnippets = [
      ["local", "Storage"].join(""),
      ["session", "Storage"].join(""),
      "indexedDB",
      "fetch(",
      "XMLHttpRequest",
      "OpenAI",
      ["Math", "random"].join("."),
      "matchEngine.run",
      "showEngine.run",
      "fanReactionEngine.run",
      "socialDiscourseEngine.run",
      "INSERT INTO",
      "UPDATE ",
      "DELETE "
    ];

    for (const snippet of forbiddenSnippets) {
      assert.equal(source.includes(snippet), false, snippet);
    }
  });

  it("keeps existing engine behavior, IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "playable-new-gm-mode-save-payload-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 13)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createPlayableNewGMModeSavePayloadContract({
      savePayloadContractId: "save-payload-engine-stability",
      gameplayStateModel: createPlayableNewGMModeGameplayStateModel({
        gameId: "game-raw-local-001",
        selectedBrandId: "raw",
        selectedBrandName: "Raw"
      })
    });

    const secondResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 13)
    );
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });
});
