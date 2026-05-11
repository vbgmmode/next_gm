import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import {
  createPlayableNewGMModeGameplayStateModel,
  createPlayableNewGMModeSavePayloadContract,
  createPlayableNewGMModeSavePayloadSerializedSnapshot,
  parsePlayableNewGMModeSavePayloadSerializedSnapshot,
  PLAYABLE_NEW_GM_MODE_SAVE_PAYLOAD_SERIALIZATION_CAPABILITY_FLAGS
} from "../src/game/domain/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const SERIALIZATION_SOURCE =
  "src/game/domain/playableNewGMModeSavePayloadSerialization.ts";

describe("Playable New GM Mode Save Payload Serialization v0.1", () => {
  it("creates deterministic serialized snapshots from a structurally ready payload contract", () => {
    const contract = createCompleteContract();
    const firstSnapshot = createPlayableNewGMModeSavePayloadSerializedSnapshot(contract);
    const secondSnapshot = createPlayableNewGMModeSavePayloadSerializedSnapshot(contract);

    assert.equal(firstSnapshot.status, "serialized-payload-only");
    assert.equal(firstSnapshot.payloadFormatVersion, "0.1.0");
    assert.equal(firstSnapshot.structurallyReady, true);
    assert.deepEqual(firstSnapshot.issues, []);
    assert.equal(firstSnapshot.serializedPayload, secondSnapshot.serializedPayload);
    assert.match(firstSnapshot.serializedPayload, /"payloadFormatVersion":"0.1.0"/);
    assert.match(firstSnapshot.serializedPayload, /"gameId":"game-raw-local-001"/);
    assert.deepEqual(
      firstSnapshot.capabilityFlags,
      PLAYABLE_NEW_GM_MODE_SAVE_PAYLOAD_SERIALIZATION_CAPABILITY_FLAGS
    );
  });

  it("parses a serialized payload into compatibility summary fields", () => {
    const snapshot = createPlayableNewGMModeSavePayloadSerializedSnapshot(
      createCompleteContract()
    );
    const parsed = parsePlayableNewGMModeSavePayloadSerializedSnapshot(
      snapshot.serializedPayload
    );

    assert.equal(parsed.status, "parsed-payload-only");
    assert.equal(parsed.structurallyReady, true);
    assert.deepEqual(parsed.issues, []);
    assert.equal(parsed.payloadFormatVersion, "0.1.0");
    assert.equal(parsed.gameId, "game-raw-local-001");
    assert.equal(parsed.selectedBrandName, "Raw");
    assert.equal(parsed.currentWeek, 2);
    assert.equal(parsed.gameplayStateModel?.selectedBrand.brandName, "Raw");
    assert.equal(parsed.gameplayStateModel?.signedRoster[0]?.displayName, "Cody Rhodes");
    assert.equal(parsed.gameplayStateModel?.showResults[0]?.cardReadinessLabel, "Card Status: Processed");
    assert.equal(parsed.gameplayStateModel?.showResults[0]?.socialBuzzLabel, "Social Buzz: IWC discourse rising");
    assert.equal(
      parsed.gameplayStateModel?.showResults[0]?.segmentResults?.[0]?.crowdResponseLine,
      "Crowd Response: Engaged"
    );
    assert.deepEqual(
      parsed.capabilityFlags,
      PLAYABLE_NEW_GM_MODE_SAVE_PAYLOAD_SERIALIZATION_CAPABILITY_FLAGS
    );
  });

  it("reports invalid serialization prerequisites without writing anything", () => {
    const missingSnapshot = createPlayableNewGMModeSavePayloadSerializedSnapshot(undefined);
    const invalidSnapshot = createPlayableNewGMModeSavePayloadSerializedSnapshot(
      createPlayableNewGMModeSavePayloadContract({
        savePayloadContractId: " ",
        gameplayStateModel: createPlayableNewGMModeGameplayStateModel({
          gameId: " ",
          selectedBrandId: "raw",
          selectedBrandName: "Raw"
        })
      })
    );

    assert.deepEqual(missingSnapshot, {
      status: "serialized-payload-only",
      serializedPayload: "",
      payloadFormatVersion: "missing",
      structurallyReady: false,
      issues: ["missing-save-payload-contract"],
      capabilityFlags: PLAYABLE_NEW_GM_MODE_SAVE_PAYLOAD_SERIALIZATION_CAPABILITY_FLAGS
    });
    assert.equal(invalidSnapshot.structurallyReady, false);
    assert.deepEqual(invalidSnapshot.issues, [
      "save-payload-contract-not-structurally-ready"
    ]);
  });

  it("reports parse and compatibility issues deterministically", () => {
    assert.deepEqual(
      parsePlayableNewGMModeSavePayloadSerializedSnapshot(" "),
      {
        status: "parsed-payload-only",
        structurallyReady: false,
        issues: ["empty-serialized-payload"],
        payloadFormatVersion: "missing",
        capabilityFlags: PLAYABLE_NEW_GM_MODE_SAVE_PAYLOAD_SERIALIZATION_CAPABILITY_FLAGS
      }
    );
    assert.deepEqual(
      parsePlayableNewGMModeSavePayloadSerializedSnapshot("{not-json"),
      {
        status: "parsed-payload-only",
        structurallyReady: false,
        issues: ["invalid-json"],
        payloadFormatVersion: "missing",
        capabilityFlags: PLAYABLE_NEW_GM_MODE_SAVE_PAYLOAD_SERIALIZATION_CAPABILITY_FLAGS
      }
    );
    assert.deepEqual(
      parsePlayableNewGMModeSavePayloadSerializedSnapshot("[]"),
      {
        status: "parsed-payload-only",
        structurallyReady: false,
        issues: ["payload-not-object"],
        payloadFormatVersion: "missing",
        capabilityFlags: PLAYABLE_NEW_GM_MODE_SAVE_PAYLOAD_SERIALIZATION_CAPABILITY_FLAGS
      }
    );
    assert.deepEqual(
      parsePlayableNewGMModeSavePayloadSerializedSnapshot(
        JSON.stringify({
          payloadFormatVersion: "9.9.9"
        })
      ),
      {
        status: "parsed-payload-only",
        structurallyReady: false,
        issues: [
          "unsupported-format-version",
          "missing-gameplay-state-model"
        ],
        payloadFormatVersion: "9.9.9",
        capabilityFlags: PLAYABLE_NEW_GM_MODE_SAVE_PAYLOAD_SERIALIZATION_CAPABILITY_FLAGS
      }
    );
  });

  it("freezes serialized and parsed outputs", () => {
    const snapshot = createPlayableNewGMModeSavePayloadSerializedSnapshot(
      createCompleteContract()
    );
    const parsed = parsePlayableNewGMModeSavePayloadSerializedSnapshot(
      snapshot.serializedPayload
    );

    assert.equal(Object.isFrozen(snapshot), true);
    assert.equal(Object.isFrozen(snapshot.issues), true);
    assert.equal(Object.isFrozen(parsed), true);
    assert.equal(Object.isFrozen(parsed.issues), true);
  });

  it("exports serializer and parser from the domain barrel", () => {
    assert.equal(
      typeof createPlayableNewGMModeSavePayloadSerializedSnapshot,
      "function"
    );
    assert.equal(
      typeof parsePlayableNewGMModeSavePayloadSerializedSnapshot,
      "function"
    );
  });

  it("does not add storage, network, direct entropy, database writes, or engine calls", () => {
    const source = readFileSync(SERIALIZATION_SOURCE, "utf8");
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
    const contextSeed = "playable-new-gm-mode-save-serialization-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 17)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createPlayableNewGMModeSavePayloadSerializedSnapshot(createCompleteContract());

    const secondResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 17)
    );
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });
});

function createCompleteContract() {
  return createPlayableNewGMModeSavePayloadContract({
    savePayloadContractId: "save-payload-raw-local-001",
    gameplayStateModel: createPlayableNewGMModeGameplayStateModel({
      gameId: "game-raw-local-001",
      gameLabel: "Raw Local Preview",
      selectedBrandId: "raw",
      selectedBrandName: "Raw",
      currentWeek: 2,
      budget: {
        startingBudget: 120,
        spentBudget: 96,
        remainingBudget: 24,
        bookingReserveTarget: 20
      },
      signedRoster: [
        {
          wrestlerId: "cody-rhodes",
          displayName: "Cody Rhodes",
          signedBrandId: "raw",
          signedBrandName: "Raw",
          draftedFrom: "SmackDown"
        }
      ],
      weekHistory: [
        {
          weekNumber: 1,
          summaryLabel: "Raw Week 1 produced a B show grade"
        }
      ],
      showResults: [
        {
          weekNumber: 1,
          resultId: "raw-week-1-result",
          showGrade: "B",
          bestSegmentLabel: "Main Event Singles Match",
          crowdReadLabel: "Strong",
          weakSegmentLabel: "Promo",
          championSpotlightLabel: "Champion Spotlight: Cody Rhodes appeared",
          rivalrySpotlightLabel: "Rivalry Spotlight: Cody Rhodes vs Fallon Henley gained heat",
          momentumLabel: "Momentum: Up",
          fanResponseLabel: "Fan Response: Strong",
          socialBuzzLabel: "Social Buzz: IWC discourse rising",
          budgetLabel: "Budget: No major change in this local session",
          cardReadinessLabel: "Card Status: Processed",
          segmentResults: [
            {
              segmentNumber: 1,
              typeLabel: "Main Event Singles Match",
              matchRatingLabel: "Match Rating: Standout",
              crowdResponseLine: "Crowd Response: Engaged",
              momentumSignalLine: "Momentum Signal: Shift"
            }
          ]
        }
      ]
    }),
    createdAtLabel: "local-session-week-2"
  });
}
