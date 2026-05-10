import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, it } from "node:test";

import {
  createNewGMModeTalentPoolEligibilityRuleContractShell
} from "../src/game/domain/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const UNTOUCHED_TALENT_POOL_RULE_CONTRACT_DATABASE =
  "data/saves/__new-gm-mode-talent-pool-rule-contract-should-not-exist.sqlite";

describe("New GM Mode Talent Pool Eligibility Rule Contract Shell v0.1", () => {
  it("reports diagnosticsOnly true, playerFacing false, and gameplayAffecting false", () => {
    const contract = createNewGMModeTalentPoolEligibilityRuleContractShell();

    assert.equal(contract.status, "diagnostics-only");
    assert.equal(
      contract.talentPoolEligibilityRuleContractId,
      "new-gm-mode-talent-pool-eligibility-rule-contract-v0.1"
    );
    assert.equal(contract.diagnosticsOnly, true);
    assert.equal(contract.playerFacing, false);
    assert.equal(contract.gameplayAffecting, false);
    assert.equal(contract.deterministicOrdering, true);
  });

  it("includes stable eligibility rule IDs and deterministic order", () => {
    const contract = createNewGMModeTalentPoolEligibilityRuleContractShell();

    assert.deepEqual(
      contract.eligibilityRules.map((rule) => rule.id),
      [
        "static-wrestler-fixture-catalog-prerequisite",
        "static-wrestler-fixture-validator-prerequisite",
        "static-wrestler-fixture-validation-summary-prerequisite",
        "wrestler-data-shape-contract-prerequisite",
        "selected-brand-context-prerequisite",
        "draft-eligibility-requirement",
        "availability-status-requirement",
        "brand-eligibility-requirement",
        "gender-division-eligibility-requirement",
        "championship-division-eligibility-requirement",
        "role-category-tag-requirement",
        "minimum-eligible-talent-count-requirement",
        "future-roster-slot-compatibility-prerequisite",
        "future-draft-board-compatibility-prerequisite",
        "future-persistence-payload-compatibility-prerequisite"
      ]
    );
    assert.deepEqual(
      contract.eligibilityRules.map((rule) => rule.slug),
      contract.eligibilityRules.map((rule) => rule.id)
    );
  });

  it("includes all requested future eligibility requirements", () => {
    const contract = createNewGMModeTalentPoolEligibilityRuleContractShell();
    const ruleIds = contract.eligibilityRules.map((rule) => rule.id);

    assert.ok(ruleIds.includes("draft-eligibility-requirement"));
    assert.ok(ruleIds.includes("availability-status-requirement"));
    assert.ok(ruleIds.includes("brand-eligibility-requirement"));
    assert.ok(ruleIds.includes("gender-division-eligibility-requirement"));
    assert.ok(ruleIds.includes("role-category-tag-requirement"));
    assert.ok(ruleIds.includes("championship-division-eligibility-requirement"));
    assert.ok(ruleIds.includes("minimum-eligible-talent-count-requirement"));
    assert.ok(ruleIds.includes("future-roster-slot-compatibility-prerequisite"));
    assert.ok(ruleIds.includes("future-draft-board-compatibility-prerequisite"));
    assert.ok(ruleIds.includes("future-persistence-payload-compatibility-prerequisite"));
    assert.equal(contract.minimumEligibleTalentCount, 8);
    assert.deepEqual(contract.ruleContractSummary, {
      ruleCount: 15,
      eligibilityValidationOnly: true,
      actualTalentPoolCreationReady: false,
      draftBoardCreationReady: false,
      draftExecutionReady: false,
      gameplayStartReady: false
    });
  });

  it("reports eligibility validation capabilities while keeping actual pool creation unavailable", () => {
    const contract = createNewGMModeTalentPoolEligibilityRuleContractShell();

    assert.deepEqual(contract.capabilityFlags, {
      staticWrestlerFixtureCatalogAvailable: true,
      staticWrestlerFixtureValidatorAvailable: true,
      staticWrestlerFixtureValidationSummaryAvailable: true,
      wrestlerDataShapeContractAvailable: true,
      talentPoolEligibilityRuleContractAvailable: true,
      talentPoolFixtureEligibilityValidatorAvailable: true,
      talentPoolFixtureEligibilitySummaryAvailable: true,
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
    assert.equal(contract.talentPoolCreationAvailable, false);
    assert.equal(contract.draftBoardCreationAvailable, false);
    assert.equal(contract.draftExecutionAvailable, false);
  });

  it("does not create saves, SQLite writes, pool state, draft state, gameplay, or generated text", () => {
    const contract = createNewGMModeTalentPoolEligibilityRuleContractShell();

    assert.equal(contract.saveCreated, false);
    assert.equal(contract.sqliteWritten, false);
    assert.equal(contract.sqliteDatabaseOpened, false);
    assert.equal(existsSync(UNTOUCHED_TALENT_POOL_RULE_CONTRACT_DATABASE), false);
    assert.equal(contract.wrestlerRecordsCreated, false);
    assert.equal(contract.rosterStateCreated, false);
    assert.equal(contract.talentPoolStateCreated, false);
    assert.equal(contract.eligibleTalentPoolStateCreated, false);
    assert.equal(contract.draftBoardStateCreated, false);
    assert.equal(contract.talentPoolsCreated, false);
    assert.equal(contract.draftBoardsCreated, false);
    assert.equal(contract.draftPicksCreated, false);
    assert.equal(contract.draftPickValidationExecuted, false);
    assert.equal(contract.rostersCreated, false);
    assert.equal(contract.championshipsCreated, false);
    assert.equal(contract.divisionsCreated, false);
    assert.equal(contract.matchesCreated, false);
    assert.equal(contract.showsCreated, false);
    assert.equal(contract.weeksCreated, false);
    assert.equal(contract.draftLogicExecuted, false);
    assert.equal(contract.draftExecutionExecuted, false);
    assert.equal(contract.weekOneUnlocked, false);
    assert.equal(contract.generatedTextCreated, false);
    assert.equal(contract.genAIUsed, false);
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "new-gm-mode-talent-pool-rule-contract-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeTalentPoolEligibilityRuleContractShell();

    const secondResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });
});
