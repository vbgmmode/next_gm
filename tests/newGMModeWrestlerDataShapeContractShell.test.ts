import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, it } from "node:test";

import {
  createNewGMModeWrestlerDataShapeContractShell
} from "../src/game/domain/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const UNTOUCHED_WRESTLER_DATA_SHAPE_DATABASE =
  "data/saves/__new-gm-mode-wrestler-data-shape-contract-should-not-exist.sqlite";

describe("New GM Mode Wrestler Data Shape Contract Shell v0.1", () => {
  it("reports diagnosticsOnly true, playerFacing false, and gameplayAffecting false", () => {
    const contract = createNewGMModeWrestlerDataShapeContractShell();

    assert.equal(contract.status, "diagnostics-only");
    assert.equal(
      contract.wrestlerDataShapeContractId,
      "new-gm-mode-wrestler-data-shape-contract-v0.1"
    );
    assert.equal(contract.diagnosticsOnly, true);
    assert.equal(contract.playerFacing, false);
    assert.equal(contract.gameplayAffecting, false);
    assert.equal(contract.deterministicOrdering, true);
  });

  it("includes stable wrestler field IDs and deterministic order", () => {
    const contract = createNewGMModeWrestlerDataShapeContractShell();

    assert.deepEqual(
      contract.wrestlerDataShapeFields.map((field) => field.id),
      [
        "wrestler-id",
        "display-name",
        "gender-division-eligibility",
        "role-category-tags",
        "brand-eligibility",
        "availability-status",
        "popularity-star-power-placeholder",
        "in-ring-ability-placeholder",
        "stamina-durability-placeholder",
        "promo-charisma-placeholder",
        "tag-team-compatibility-placeholder",
        "championship-division-eligibility",
        "draft-eligibility",
        "future-persistence-payload-compatibility"
      ]
    );
    assert.deepEqual(
      contract.wrestlerDataShapeFields.map((field) => field.slug),
      contract.wrestlerDataShapeFields.map((field) => field.id)
    );
    assert.deepEqual(contract.wrestlerDataShapeSummary, {
      fieldCount: 14,
      requiredBeforeTalentPoolCreation: true,
      requiredBeforeDraftBoardCreation: true,
      contractOnly: true,
      wrestlerDataLoadingReady: false,
      wrestlerRecordCreationReady: false,
      talentPoolCreationReady: false,
      draftBoardCreationReady: false,
      draftExecutionReady: false
    });
  });

  it("includes wrestler identity and display fields", () => {
    const contract = createNewGMModeWrestlerDataShapeContractShell();

    assert.deepEqual(contract.wrestlerDataShapeFields.slice(0, 2), [
      {
        id: "wrestler-id",
        slug: "wrestler-id",
        label: "Wrestler ID",
        category: "identity",
        requiredForFutureTalentPools: true,
        blockedReason: "wrestler-record-creation-not-implemented"
      },
      {
        id: "display-name",
        slug: "display-name",
        label: "Display name",
        category: "identity",
        requiredForFutureTalentPools: true,
        blockedReason: "wrestler-data-loading-not-implemented"
      }
    ]);
  });

  it("includes gender and division eligibility fields", () => {
    const contract = createNewGMModeWrestlerDataShapeContractShell();

    assert.deepEqual(
      contract.wrestlerDataShapeFields
        .filter((field) =>
          [
            "gender-division-eligibility",
            "championship-division-eligibility"
          ].includes(field.id)
        )
        .map((field) => ({
          id: field.id,
          category: field.category,
          requiredForFutureTalentPools: field.requiredForFutureTalentPools
        })),
      [
        {
          id: "gender-division-eligibility",
          category: "eligibility",
          requiredForFutureTalentPools: true
        },
        {
          id: "championship-division-eligibility",
          category: "eligibility",
          requiredForFutureTalentPools: true
        }
      ]
    );
  });

  it("includes role and category tagging fields", () => {
    const contract = createNewGMModeWrestlerDataShapeContractShell();
    const roleTags = contract.wrestlerDataShapeFields.find(
      (field) => field.id === "role-category-tags"
    );

    assert.deepEqual(roleTags, {
      id: "role-category-tags",
      slug: "role-category-tags",
      label: "Role and category tags",
      category: "tagging",
      requiredForFutureTalentPools: true,
      blockedReason: "wrestler-data-loading-not-implemented"
    });
  });

  it("includes brand eligibility fields", () => {
    const contract = createNewGMModeWrestlerDataShapeContractShell();
    const brandEligibility = contract.wrestlerDataShapeFields.find(
      (field) => field.id === "brand-eligibility"
    );

    assert.deepEqual(brandEligibility, {
      id: "brand-eligibility",
      slug: "brand-eligibility",
      label: "Brand eligibility",
      category: "eligibility",
      requiredForFutureTalentPools: true,
      blockedReason: "wrestler-data-loading-not-implemented"
    });
  });

  it("includes availability and draft eligibility fields", () => {
    const contract = createNewGMModeWrestlerDataShapeContractShell();

    assert.deepEqual(
      contract.wrestlerDataShapeFields
        .filter((field) =>
          ["availability-status", "draft-eligibility"].includes(field.id)
        )
        .map((field) => [field.id, field.category, field.blockedReason]),
      [
        [
          "availability-status",
          "availability",
          "wrestler-data-loading-not-implemented"
        ],
        [
          "draft-eligibility",
          "eligibility",
          "draft-pick-validation-not-implemented"
        ]
      ]
    );
  });

  it("includes placeholder rating and attribute fields", () => {
    const contract = createNewGMModeWrestlerDataShapeContractShell();

    assert.deepEqual(
      contract.wrestlerDataShapeFields
        .filter((field) => field.category === "attribute-placeholder")
        .map((field) => field.id),
      [
        "popularity-star-power-placeholder",
        "in-ring-ability-placeholder",
        "stamina-durability-placeholder",
        "promo-charisma-placeholder",
        "tag-team-compatibility-placeholder"
      ]
    );
  });

  it("includes championship division eligibility fields", () => {
    const contract = createNewGMModeWrestlerDataShapeContractShell();
    const championshipDivisionEligibility =
      contract.wrestlerDataShapeFields.find(
        (field) => field.id === "championship-division-eligibility"
      );

    assert.deepEqual(championshipDivisionEligibility, {
      id: "championship-division-eligibility",
      slug: "championship-division-eligibility",
      label: "Championship division eligibility",
      category: "eligibility",
      requiredForFutureTalentPools: true,
      blockedReason: "championship-division-assignment-not-implemented"
    });
  });

  it("includes future persistence payload compatibility without writing payloads", () => {
    const contract = createNewGMModeWrestlerDataShapeContractShell();
    const persistenceCompatibility = contract.wrestlerDataShapeFields.find(
      (field) => field.id === "future-persistence-payload-compatibility"
    );

    assert.deepEqual(persistenceCompatibility, {
      id: "future-persistence-payload-compatibility",
      slug: "future-persistence-payload-compatibility",
      label: "Future persistence payload compatibility",
      category: "future-persistence",
      requiredForFutureTalentPools: true,
      blockedReason: "gameplay-payload-persistence-not-implemented"
    });
    assert.equal(contract.gameplayPayloadPersistenceAvailable, false);
  });

  it("reports currently available contract dependencies", () => {
    const contract = createNewGMModeWrestlerDataShapeContractShell();

    assert.deepEqual(contract.availableNow, {
      draftReadinessAggregatorAvailable: true,
      talentPoolPrerequisiteContractAvailable: true,
      draftBoardPrerequisiteContractAvailable: true,
      wrestlerDataShapeContractAvailable: true
    });
    assert.equal(contract.draftReadinessAggregatorAvailable, true);
    assert.equal(contract.talentPoolPrerequisiteContractAvailable, true);
    assert.equal(contract.draftBoardPrerequisiteContractAvailable, true);
    assert.equal(contract.wrestlerDataShapeContractAvailable, true);
  });

  it("reports wrestler data loading, records, pools, boards, draft, and gameplay as unavailable", () => {
    const contract = createNewGMModeWrestlerDataShapeContractShell();

    assert.deepEqual(contract.capabilityFlags, {
      draftReadinessAggregatorAvailable: true,
      wrestlerDataShapeContractAvailable: true,
      wrestlerDataLoadingAvailable: false,
      wrestlerRecordCreationAvailable: false,
      talentPoolCreationAvailable: false,
      draftBoardCreationAvailable: false,
      draftPickValidationAvailable: false,
      draftExecutionAvailable: false,
      rosterAssignmentAvailable: false,
      championshipDivisionAssignmentAvailable: false,
      gameplayStartAvailable: false,
      gameplayPayloadPersistenceAvailable: false,
      uiWiringAvailable: false
    });
    assert.equal(contract.wrestlerDataLoadingAvailable, false);
    assert.equal(contract.wrestlerRecordCreationAvailable, false);
    assert.equal(contract.realRosterIngestionAvailable, false);
    assert.equal(contract.talentPoolCreationAvailable, false);
    assert.equal(contract.draftBoardCreationAvailable, false);
    assert.equal(contract.draftPickValidationAvailable, false);
    assert.equal(contract.draftExecutionAvailable, false);
    assert.equal(contract.rosterAssignmentAvailable, false);
    assert.equal(contract.championshipDivisionAssignmentAvailable, false);
    assert.equal(contract.gameplayStartAvailable, false);
    assert.equal(contract.uiWiringAvailable, false);
  });

  it("includes clear blocked reasons for why wrestler data loading remains unavailable", () => {
    const contract = createNewGMModeWrestlerDataShapeContractShell();

    assert.deepEqual(contract.blockedReasons, [
      "wrestler-data-shape-contract-only",
      "draft-readiness-aggregator-available",
      "talent-pool-prerequisite-contract-available",
      "draft-board-prerequisite-contract-available",
      "wrestler-data-loading-not-implemented",
      "wrestler-record-creation-not-implemented",
      "real-roster-ingestion-not-implemented",
      "talent-pool-creation-not-implemented",
      "draft-board-creation-not-implemented",
      "draft-pick-validation-not-implemented",
      "draft-execution-not-implemented",
      "roster-assignment-not-implemented",
      "championship-division-assignment-not-implemented",
      "gameplay-start-not-implemented",
      "gameplay-payload-persistence-not-implemented",
      "ui-wiring-not-implemented"
    ]);
    assert.deepEqual(contract.notImplemented, [
      "wrestler-data-loading-not-implemented",
      "wrestler-record-creation-not-implemented",
      "real-roster-ingestion-not-implemented",
      "talent-pool-creation-not-implemented",
      "draft-board-creation-not-implemented",
      "draft-pick-validation-not-implemented",
      "draft-execution-not-implemented",
      "roster-assignment-not-implemented",
      "championship-division-assignment-not-implemented",
      "gameplay-start-not-implemented",
      "gameplay-payload-persistence-not-implemented",
      "ui-wiring-not-implemented"
    ]);
  });

  it("does not create a save or write to SQLite", () => {
    const contract = createNewGMModeWrestlerDataShapeContractShell();

    assert.equal(contract.saveCreated, false);
    assert.equal(contract.sqliteWritten, false);
    assert.equal(contract.sqliteDatabaseOpened, false);
    assert.equal(existsSync(UNTOUCHED_WRESTLER_DATA_SHAPE_DATABASE), false);
    assert.equal(Object.hasOwn(contract, "saveRepository"), false);
    assert.equal(Object.hasOwn(contract, "createSave"), false);
    assert.equal(Object.hasOwn(contract, "sqliteConnection"), false);
    assert.equal(Object.hasOwn(contract, "persistencePayload"), false);
  });

  it("does not create wrestler records, pools, boards, picks, rosters, championships, divisions, matches, shows, or weeks", () => {
    const contract = createNewGMModeWrestlerDataShapeContractShell();

    assert.equal(contract.gameplayStateCreated, false);
    assert.equal(contract.wrestlerDataLoaded, false);
    assert.equal(contract.wrestlerDataCreated, false);
    assert.equal(contract.wrestlerRecordsCreated, false);
    assert.equal(contract.realRosterIngested, false);
    assert.equal(contract.talentPoolsCreated, false);
    assert.equal(contract.eligibleTalentPoolsCreated, false);
    assert.equal(contract.draftBoardsCreated, false);
    assert.equal(contract.draftOrderingGenerated, false);
    assert.equal(contract.draftPicksCreated, false);
    assert.equal(contract.rostersCreated, false);
    assert.equal(contract.rosterAssignmentsCreated, false);
    assert.equal(contract.championshipsCreated, false);
    assert.equal(contract.championshipAssignmentsCreated, false);
    assert.equal(contract.divisionsCreated, false);
    assert.equal(contract.divisionAssignmentsCreated, false);
    assert.equal(contract.matchesCreated, false);
    assert.equal(contract.showsCreated, false);
    assert.equal(contract.weeksCreated, false);
    assert.equal(Object.hasOwn(contract, "wrestlers"), false);
    assert.equal(Object.hasOwn(contract, "wrestlerRecords"), false);
    assert.equal(Object.hasOwn(contract, "talentPool"), false);
    assert.equal(Object.hasOwn(contract, "draftBoard"), false);
    assert.equal(Object.hasOwn(contract, "draftPick"), false);
    assert.equal(Object.hasOwn(contract, "roster"), false);
    assert.equal(Object.hasOwn(contract, "championship"), false);
    assert.equal(Object.hasOwn(contract, "division"), false);
    assert.equal(Object.hasOwn(contract, "match"), false);
    assert.equal(Object.hasOwn(contract, "show"), false);
    assert.equal(Object.hasOwn(contract, "weekState"), false);
  });

  it("does not execute draft logic or unlock Week 1", () => {
    const contract = createNewGMModeWrestlerDataShapeContractShell();

    assert.equal(contract.draftPickValidationExecuted, false);
    assert.equal(contract.draftLogicExecuted, false);
    assert.equal(contract.draftExecutionExecuted, false);
    assert.equal(contract.rosterAssignmentExecuted, false);
    assert.equal(contract.championshipAssignmentExecuted, false);
    assert.equal(contract.divisionAssignmentExecuted, false);
    assert.equal(contract.weekOneUnlocked, false);
    assert.equal(contract.matchSimulationExecuted, false);
    assert.equal(contract.showBookingCreated, false);
    assert.equal(contract.businessSystemsRun, false);
    assert.equal(contract.fanSocialOutputCreated, false);
    assert.equal(Object.hasOwn(contract, "draftExecution"), false);
    assert.equal(Object.hasOwn(contract, "weekOneUnlock"), false);
    assert.equal(Object.hasOwn(contract, "gameplayStart"), false);
    assert.equal(Object.hasOwn(contract, "advanceWeek"), false);
  });

  it("does not expose generated text or GenAI behavior", () => {
    const contract = createNewGMModeWrestlerDataShapeContractShell();

    assert.equal(contract.generatedTextCreated, false);
    assert.equal(contract.genAIUsed, false);
    assert.equal(Object.hasOwn(contract, "generatedText"), false);
    assert.equal(Object.hasOwn(contract, "genAIClient"), false);
    assert.equal(Object.hasOwn(contract, "prompt"), false);
    assert.equal(Object.hasOwn(contract, "narrative"), false);
  });

  it("stays deterministic across repeated calls", () => {
    const firstContract = createNewGMModeWrestlerDataShapeContractShell();
    const secondContract = createNewGMModeWrestlerDataShapeContractShell();

    assert.deepEqual(secondContract, firstContract);
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "new-gm-mode-wrestler-data-shape-no-engine-change";
    const firstResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeWrestlerDataShapeContractShell();

    const secondResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });
});
