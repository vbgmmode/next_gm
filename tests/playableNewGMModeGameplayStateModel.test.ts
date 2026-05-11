import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import {
  createPlayableNewGMModeGameplayStateModel,
  PLAYABLE_NEW_GM_MODE_GAMEPLAY_STATE_MODEL_CAPABILITY_FLAGS
} from "../src/game/domain/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const STATE_MODEL_SOURCE =
  "src/game/domain/playableNewGMModeGameplayStateModel.ts";

describe("Playable New GM Mode Gameplay State Model v0.1", () => {
  it("creates the full local gameplay state shape for a future durable session", () => {
    const stateModel = createCompleteStateModel();

    assert.equal(stateModel.modelId, "playable-new-gm-mode-gameplay-state-model-v0.1");
    assert.equal(stateModel.modelVersion, "0.1.0");
    assert.equal(stateModel.status, "state-model-only");
    assert.equal(stateModel.localOnly, true);
    assert.equal(stateModel.reloadResetExpected, true);
    assert.deepEqual(stateModel.gameIdentity, {
      gameId: "game-raw-local-001",
      gameLabel: "Raw Local Preview"
    });
    assert.deepEqual(stateModel.selectedBrand, {
      brandId: "raw",
      brandName: "Raw"
    });
    assert.equal(stateModel.currentWeek, 2);
    assert.deepEqual(stateModel.budget, {
      startingBudget: 120,
      spentBudget: 96,
      remainingBudget: 24,
      bookingReserveTarget: 20
    });
    assert.equal(stateModel.signedRoster.length, 2);
    assert.equal(stateModel.champions.length, 1);
    assert.equal(stateModel.rivalries.length, 1);
    assert.equal(stateModel.weeklyShowCards.length, 1);
    assert.equal(stateModel.showResults.length, 1);
    assert.equal(stateModel.showResults[0]?.crowdReadLabel, "Strong");
    assert.equal(stateModel.showResults[0]?.segmentResults?.length, 1);
    assert.equal(stateModel.superstarCurrentState.length, 2);
    assert.equal(stateModel.rosterMomentum.length, 1);
    assert.equal(stateModel.morale.length, 1);
    assert.equal(stateModel.fatigue.length, 1);
    assert.equal(stateModel.injuryRisk.length, 1);
    assert.equal(stateModel.popularity.length, 1);
    assert.equal(stateModel.rivalryHeat.length, 1);
    assert.equal(stateModel.championTitleState.length, 1);
    assert.equal(stateModel.financeFanSummaries.length, 1);
    assert.equal(stateModel.weekHistory.length, 1);
    assert.deepEqual(stateModel.readiness.missingSections, []);
  });

  it("keeps drafted talent signed to the selected player brand while preserving source metadata", () => {
    const stateModel = createPlayableNewGMModeGameplayStateModel({
      gameId: "game-raw",
      selectedBrandId: "raw",
      selectedBrandName: "Raw",
      signedRoster: [
        {
          wrestlerId: "fallon-henley",
          displayName: "Fallon Henley",
          signedBrandId: "nxt",
          signedBrandName: "NXT",
          draftedFrom: "NXT",
          sourcePool: "NXT"
        }
      ]
    });

    assert.deepEqual(stateModel.signedRoster[0], {
      wrestlerId: "fallon-henley",
      displayName: "Fallon Henley",
      signedBrandId: "raw",
      signedBrandName: "Raw",
      draftedFrom: "NXT",
      sourcePool: "NXT"
    });
    assert.equal(stateModel.selectedBrand.brandName, "Raw");
  });

  it("fills missing signed-brand references from the selected brand context", () => {
    const stateModel = createPlayableNewGMModeGameplayStateModel({
      gameId: "game-raw",
      selectedBrandId: "raw",
      selectedBrandName: "Raw",
      signedRoster: [
        {
          wrestlerId: "fallon-henley",
          displayName: "Fallon Henley",
          signedBrandId: "",
          signedBrandName: "",
          draftedFrom: "NXT"
        }
      ]
    });

    assert.equal(stateModel.signedRoster[0].signedBrandId, "raw");
    assert.equal(stateModel.signedRoster[0].signedBrandName, "Raw");
    assert.equal(stateModel.signedRoster[0].draftedFrom, "NXT");
  });

  it("reports structural issues without starting persistence or gameplay systems", () => {
    const stateModel = createPlayableNewGMModeGameplayStateModel({
      gameId: " ",
      selectedBrandId: " ",
      selectedBrandName: " ",
      currentWeek: 0
    });

    assert.equal(stateModel.readiness.structurallyReady, false);
    assert.deepEqual(stateModel.readiness.issues, [
      "missing-game-id",
      "missing-selected-brand-id",
      "missing-selected-brand-name",
      "invalid-current-week"
    ]);
    assert.deepEqual(
      stateModel.capabilityFlags,
      PLAYABLE_NEW_GM_MODE_GAMEPLAY_STATE_MODEL_CAPABILITY_FLAGS
    );
  });

  it("freezes nested state so callers cannot mutate the model contract", () => {
    const stateModel = createCompleteStateModel();

    assert.equal(Object.isFrozen(stateModel), true);
    assert.equal(Object.isFrozen(stateModel.gameIdentity), true);
    assert.equal(Object.isFrozen(stateModel.signedRoster), true);
    assert.equal(Object.isFrozen(stateModel.signedRoster[0]), true);
    assert.equal(Object.isFrozen(stateModel.champions[0]), true);
    assert.equal(Object.isFrozen(stateModel.champions[0].championWrestlerIds), true);
    assert.equal(Object.isFrozen(stateModel.readiness.modeledSections), true);
  });

  it("exports the state model factory from the domain barrel", () => {
    assert.equal(typeof createPlayableNewGMModeGameplayStateModel, "function");
  });

  it("does not add storage, network, generated-text, direct entropy, or engine-call behavior", () => {
    const source = readFileSync(STATE_MODEL_SOURCE, "utf8");
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
      "socialDiscourseEngine.run"
    ];

    for (const snippet of forbiddenSnippets) {
      assert.equal(source.includes(snippet), false, snippet);
    }
  });

  it("keeps existing engine behavior, IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "playable-new-gm-mode-state-model-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 11)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createCompleteStateModel();

    const secondResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 11)
    );
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });
});

function createCompleteStateModel() {
  return createPlayableNewGMModeGameplayStateModel({
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
        draftedFrom: "SmackDown",
        signingCost: 8,
        signingTier: "Main Event"
      },
      {
        wrestlerId: "fallon-henley",
        displayName: "Fallon Henley",
        signedBrandId: "raw",
        signedBrandName: "Raw",
        draftedFrom: "NXT",
        signingCost: 5,
        signingTier: "Rising Star"
      }
    ],
    champions: [
      {
        titleSlotId: "raw-mens-main",
        titleName: "World Heavyweight Championship",
        championWrestlerIds: ["cody-rhodes"]
      }
    ],
    rivalries: [
      {
        rivalryId: "rivalry-001",
        wrestlerAId: "cody-rhodes",
        wrestlerBId: "fallon-henley",
        rivalryType: "Open Challenge",
        intensity: "Medium",
        heatLabel: "Building"
      }
    ],
    weeklyShowCards: [
      {
        weekNumber: 1,
        cardId: "raw-week-1",
        segments: [{ segmentType: "Main Event Singles Match" }]
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
    ],
    superstarCurrentState: [
      {
        wrestlerId: "cody-rhodes",
        momentum: "Up",
        morale: "Steady",
        fatigue: "Low",
        injuryRisk: "Low",
        popularity: "High"
      },
      {
        wrestlerId: "fallon-henley",
        momentum: "Rising",
        morale: "Steady",
        fatigue: "Low",
        injuryRisk: "Low",
        popularity: "Growing"
      }
    ],
    rosterMomentum: [{ label: "Roster gained momentum heading into Week 2" }],
    morale: [{ label: "Locker room is steady" }],
    fatigue: [{ label: "No major fatigue concerns" }],
    injuryRisk: [{ label: "No major injury risk changes" }],
    popularity: [{ label: "Main eventers remain hot" }],
    rivalryHeat: [{ rivalryId: "rivalry-001", heatLabel: "Building" }],
    championTitleState: [
      {
        titleSlotId: "raw-mens-main",
        titleName: "World Heavyweight Championship",
        championWrestlerIds: ["cody-rhodes"],
        titleStatus: "Active"
      }
    ],
    financeFanSummaries: [
      {
        weekNumber: 1,
        financeLabel: "Budget held steady",
        fanResponseLabel: "Strong"
      }
    ],
    weekHistory: [
      {
        weekNumber: 1,
        summaryLabel: "Raw Week 1 produced a B show grade"
      }
    ]
  });
}
