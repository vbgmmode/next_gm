import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, it } from "node:test";

import {
  createNewGMModeDraftBoardEligibilityInputContractShell
} from "../src/game/domain/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const UNTOUCHED_DRAFT_BOARD_INPUT_CONTRACT_DATABASE =
  "data/saves/__new-gm-mode-draft-board-input-contract-should-not-exist.sqlite";

describe("New GM Mode Draft Board Eligibility Input Contract Shell v0.1", () => {
  it("reports stable shell ID, version, and diagnostics boundaries", () => {
    const contract = createNewGMModeDraftBoardEligibilityInputContractShell();

    assert.equal(
      contract.draftBoardEligibilityInputContractId,
      "new-gm-mode-draft-board-eligibility-input-contract-v0.1"
    );
    assert.equal(contract.version, "0.1");
    assert.equal(contract.status, "diagnostics-only");
    assert.equal(contract.diagnosticsOnly, true);
    assert.equal(contract.playerFacing, false);
    assert.equal(contract.gameplayAffecting, false);
    assert.equal(contract.deterministicOrdering, true);
  });

  it("includes stable ordered input requirement IDs", () => {
    const contract = createNewGMModeDraftBoardEligibilityInputContractShell();

    assert.deepEqual(
      contract.inputRequirements.map((requirement) => requirement.id),
      [
        "talent-pool-readiness-aggregator-availability",
        "structurally-ready-talent-pool-signal",
        "eligible-wrestler-identity-list",
        "stable-eligible-wrestler-ordering",
        "wrestler-display-identity",
        "brand-eligibility-visibility",
        "draft-eligibility-visibility",
        "availability-status-visibility",
        "gender-division-eligibility-visibility",
        "role-category-tag-visibility",
        "championship-division-eligibility-visibility",
        "minimum-eligible-wrestler-count",
        "future-draft-board-persistence-compatibility-marker",
        "blocked-actual-draft-board-creation"
      ]
    );
    assert.deepEqual(
      contract.inputRequirements.map((requirement) => requirement.slug),
      contract.inputRequirements.map((requirement) => requirement.id)
    );
  });

  it("reports the contract summary and keeps actual draft board creation unavailable", () => {
    const contract = createNewGMModeDraftBoardEligibilityInputContractShell();

    assert.deepEqual(contract.inputRequirementSummary, {
      requirementCount: 14,
      inputContractOnly: true,
      futureDraftBoardInputsDefined: true,
      actualDraftBoardCreationReady: false,
      draftPickValidationReady: false,
      draftExecutionReady: false
    });
    assert.equal(contract.talentPoolReadinessAggregatorAvailable, true);
    assert.equal(contract.draftBoardEligibilityInputContractAvailable, true);
    assert.equal(contract.actualDraftBoardCreationAvailable, false);
    assert.equal(contract.draftPickValidationAvailable, false);
    assert.equal(contract.draftExecutionAvailable, false);
  });

  it("includes deterministic blocked reasons and capability flags", () => {
    const contract = createNewGMModeDraftBoardEligibilityInputContractShell();

    assert.deepEqual(contract.blockedReasons, [
      "draft-board-eligibility-input-contract-only",
      "talent-pool-readiness-required",
      "eligible-wrestler-list-not-persisted",
      "actual-draft-board-creation-not-implemented",
      "draft-pick-validation-not-implemented",
      "draft-execution-not-implemented",
      "roster-assignment-not-implemented",
      "championship-division-assignment-not-implemented",
      "gameplay-start-not-implemented",
      "gameplay-payload-persistence-not-implemented",
      "ui-wiring-not-implemented"
    ]);
    assert.equal(contract.capabilityFlags.talentPoolCreationAvailable, false);
    assert.equal(contract.capabilityFlags.draftBoardCreationAvailable, false);
    assert.equal(contract.capabilityFlags.actualDraftBoardCreationAvailable, false);
    assert.equal(contract.capabilityFlags.draftPickValidationAvailable, false);
  });

  it("does not create saves, SQLite writes, draft state, roster state, gameplay, UI, or GenAI", () => {
    const contract = createNewGMModeDraftBoardEligibilityInputContractShell();

    assert.equal(contract.saveCreated, false);
    assert.equal(contract.sqliteWritten, false);
    assert.equal(contract.sqliteDatabaseOpened, false);
    assert.equal(existsSync(UNTOUCHED_DRAFT_BOARD_INPUT_CONTRACT_DATABASE), false);
    assert.equal(contract.talentPoolStateCreated, false);
    assert.equal(contract.draftBoardStateCreated, false);
    assert.equal(contract.draftBoardsCreated, false);
    assert.equal(contract.draftPicksCreated, false);
    assert.equal(contract.draftPickValidationExecuted, false);
    assert.equal(contract.draftExecutionExecuted, false);
    assert.equal(contract.rosterAssignmentsCreated, false);
    assert.equal(contract.championshipAssignmentsCreated, false);
    assert.equal(contract.divisionAssignmentsCreated, false);
    assert.equal(contract.matchesCreated, false);
    assert.equal(contract.showsCreated, false);
    assert.equal(contract.weeksCreated, false);
    assert.equal(contract.weekOneUnlocked, false);
    assert.equal(contract.generatedTextCreated, false);
    assert.equal(contract.genAIUsed, false);
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "new-gm-mode-draft-board-input-contract-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeDraftBoardEligibilityInputContractShell();

    const secondResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });
});
