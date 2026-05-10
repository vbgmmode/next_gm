import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, it } from "node:test";

import {
  createNewGMModeTalentPoolPrerequisiteContractShell
} from "../src/game/domain/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const UNTOUCHED_TALENT_POOL_PREREQUISITE_DATABASE =
  "data/saves/__new-gm-mode-talent-pool-prerequisite-contract-should-not-exist.sqlite";

describe("New GM Mode Talent Pool Prerequisite Contract Shell v0.1", () => {
  it("reports diagnosticsOnly true and playerFacing false", () => {
    const contract = createNewGMModeTalentPoolPrerequisiteContractShell();

    assert.equal(contract.status, "diagnostics-only");
    assert.equal(
      contract.talentPoolPrerequisiteContractId,
      "new-gm-mode-talent-pool-prerequisite-contract-v0.1"
    );
    assert.equal(contract.diagnosticsOnly, true);
    assert.equal(contract.playerFacing, false);
    assert.equal(contract.gameplayAffecting, false);
    assert.equal(contract.deterministicOrdering, true);
  });

  it("includes stable talent pool prerequisite IDs and deterministic order", () => {
    const contract = createNewGMModeTalentPoolPrerequisiteContractShell();

    assert.deepEqual(
      contract.talentPoolPrerequisites.map((prerequisite) => prerequisite.id),
      [
        "setup-readiness-handoff-prerequisite",
        "draft-prerequisite-contract-prerequisite",
        "selected-promotion-brand-context-prerequisite",
        "eligible-wrestler-data-source-prerequisite",
        "wrestler-identity-prerequisite",
        "wrestler-availability-free-agent-eligibility-prerequisite",
        "brand-eligibility-prerequisite",
        "minimum-draftable-talent-count-prerequisite",
        "division-eligibility-tagging-prerequisite",
        "role-category-tagging-prerequisite",
        "roster-slot-compatibility-prerequisite",
        "draft-talent-state-persistence-payload-prerequisite"
      ]
    );
    assert.deepEqual(contract.talentPoolPrerequisiteSummary, {
      prerequisiteCount: 12,
      requiredBeforeDraftExecution: true,
      contractOnly: true,
      talentPoolCreationReady: false,
      draftBoardReady: false,
      draftExecutionReady: false
    });
  });

  it("includes setup readiness handoff prerequisite", () => {
    const contract = createNewGMModeTalentPoolPrerequisiteContractShell();

    assert.equal(contract.setupReadinessHandoffAvailable, true);
    assert.deepEqual(contract.talentPoolPrerequisites[0], {
      id: "setup-readiness-handoff-prerequisite",
      label: "Setup readiness handoff prerequisite",
      blockedReason: "setup-readiness-handoff-required"
    });
  });

  it("includes draft prerequisite contract prerequisite", () => {
    const contract = createNewGMModeTalentPoolPrerequisiteContractShell();

    assert.equal(contract.draftPrerequisiteContractAvailable, true);
    assert.deepEqual(contract.talentPoolPrerequisites[1], {
      id: "draft-prerequisite-contract-prerequisite",
      label: "Draft prerequisite contract prerequisite",
      blockedReason: "draft-prerequisite-contract-required"
    });
  });

  it("includes selected promotion or brand context prerequisite", () => {
    const contract = createNewGMModeTalentPoolPrerequisiteContractShell();

    assert.equal(contract.setupContractAvailable, true);
    assert.equal(contract.setupOptionsCatalogAvailable, true);
    assert.equal(contract.setupSelectionValidatorAvailable, true);
    assert.deepEqual(contract.talentPoolPrerequisites[2], {
      id: "selected-promotion-brand-context-prerequisite",
      label: "Selected promotion or brand context prerequisite",
      blockedReason: "promotion-brand-context-required"
    });
  });

  it("includes wrestler data source prerequisite", () => {
    const contract = createNewGMModeTalentPoolPrerequisiteContractShell();

    assert.equal(contract.wrestlerDataLoadingAvailable, false);
    assert.deepEqual(contract.talentPoolPrerequisites[3], {
      id: "eligible-wrestler-data-source-prerequisite",
      label: "Eligible wrestler data source prerequisite",
      blockedReason: "wrestler-data-source-not-implemented"
    });
  });

  it("includes wrestler identity prerequisite", () => {
    const contract = createNewGMModeTalentPoolPrerequisiteContractShell();

    assert.equal(contract.wrestlerIdentityRecordsAvailable, false);
    assert.deepEqual(contract.talentPoolPrerequisites[4], {
      id: "wrestler-identity-prerequisite",
      label: "Wrestler identity prerequisite",
      blockedReason: "wrestler-identity-records-not-implemented"
    });
  });

  it("includes eligibility and availability prerequisites", () => {
    const contract = createNewGMModeTalentPoolPrerequisiteContractShell();

    assert.equal(contract.freeAgentEligibilityAvailable, false);
    assert.equal(contract.brandEligibilityAvailable, false);
    assert.deepEqual(contract.talentPoolPrerequisites[5], {
      id: "wrestler-availability-free-agent-eligibility-prerequisite",
      label: "Wrestler availability and free-agent eligibility prerequisite",
      blockedReason: "free-agent-eligibility-not-implemented"
    });
    assert.deepEqual(contract.talentPoolPrerequisites[6], {
      id: "brand-eligibility-prerequisite",
      label: "Brand eligibility prerequisite",
      blockedReason: "brand-eligibility-not-implemented"
    });
  });

  it("includes minimum draftable talent count prerequisite", () => {
    const contract = createNewGMModeTalentPoolPrerequisiteContractShell();

    assert.equal(contract.minimumDraftableTalentCountAvailable, false);
    assert.deepEqual(contract.talentPoolPrerequisites[7], {
      id: "minimum-draftable-talent-count-prerequisite",
      label: "Minimum draftable talent count prerequisite",
      blockedReason: "minimum-draftable-talent-count-not-implemented"
    });
  });

  it("includes division and role tagging prerequisites", () => {
    const contract = createNewGMModeTalentPoolPrerequisiteContractShell();

    assert.equal(contract.divisionEligibilityTaggingAvailable, false);
    assert.equal(contract.roleCategoryTaggingAvailable, false);
    assert.deepEqual(contract.talentPoolPrerequisites[8], {
      id: "division-eligibility-tagging-prerequisite",
      label: "Division eligibility tagging prerequisite",
      blockedReason: "division-eligibility-tagging-not-implemented"
    });
    assert.deepEqual(contract.talentPoolPrerequisites[9], {
      id: "role-category-tagging-prerequisite",
      label: "Role and category tagging prerequisite",
      blockedReason: "role-category-tagging-not-implemented"
    });
  });

  it("reports talent pool creation, draft execution, and gameplay start unavailable", () => {
    const contract = createNewGMModeTalentPoolPrerequisiteContractShell();

    assert.equal(contract.talentPoolPrerequisiteContractAvailable, true);
    assert.equal(contract.talentPoolCreationAvailable, false);
    assert.equal(contract.draftBoardAvailable, false);
    assert.equal(contract.draftExecutionAvailable, false);
    assert.equal(contract.rosterAssignmentAvailable, false);
    assert.equal(contract.championshipAssignmentAvailable, false);
    assert.equal(contract.divisionAssignmentAvailable, false);
    assert.equal(contract.weekOneUnlockAvailable, false);
    assert.equal(contract.gameplayStartAvailable, false);
    assert.equal(contract.gameplayPayloadPersistenceAvailable, false);
    assert.equal(contract.uiWiringAvailable, false);
    assert.deepEqual(contract.blockedReasons, [
      "talent-pool-prerequisite-contract-only",
      "setup-readiness-handoff-required",
      "draft-prerequisite-contract-required",
      "promotion-brand-context-required",
      "wrestler-data-source-not-implemented",
      "wrestler-identity-records-not-implemented",
      "free-agent-eligibility-not-implemented",
      "brand-eligibility-not-implemented",
      "minimum-draftable-talent-count-not-implemented",
      "division-eligibility-tagging-not-implemented",
      "role-category-tagging-not-implemented",
      "roster-slot-compatibility-not-implemented",
      "gameplay-payload-persistence-not-implemented",
      "talent-pool-creation-not-implemented",
      "draft-board-not-implemented",
      "draft-execution-not-implemented",
      "week-one-unlock-not-implemented",
      "gameplay-start-not-implemented",
      "ui-wiring-not-implemented"
    ]);
  });

  it("does not create a save or write to SQLite", () => {
    const contract = createNewGMModeTalentPoolPrerequisiteContractShell();

    assert.equal(contract.saveCreated, false);
    assert.equal(contract.sqliteWritten, false);
    assert.equal(contract.sqliteDatabaseOpened, false);
    assert.equal(existsSync(UNTOUCHED_TALENT_POOL_PREREQUISITE_DATABASE), false);
    assert.equal(Object.hasOwn(contract, "saveRepository"), false);
    assert.equal(Object.hasOwn(contract, "createSave"), false);
    assert.equal(Object.hasOwn(contract, "sqliteConnection"), false);
  });

  it("does not create wrestler data, talent pools, draft boards, or gameplay entities", () => {
    const contract = createNewGMModeTalentPoolPrerequisiteContractShell();

    assert.equal(contract.gameplayStateCreated, false);
    assert.equal(contract.wrestlerDataCreated, false);
    assert.equal(contract.talentPoolsCreated, false);
    assert.equal(contract.freeAgentPoolCreated, false);
    assert.equal(contract.draftBoardsCreated, false);
    assert.equal(contract.draftPicksCreated, false);
    assert.equal(contract.rostersCreated, false);
    assert.equal(contract.championshipsCreated, false);
    assert.equal(contract.divisionsCreated, false);
    assert.equal(contract.matchesCreated, false);
    assert.equal(contract.showsCreated, false);
    assert.equal(contract.weeksCreated, false);
    assert.equal(Object.hasOwn(contract, "wrestlers"), false);
    assert.equal(Object.hasOwn(contract, "talentPool"), false);
    assert.equal(Object.hasOwn(contract, "freeAgentPool"), false);
    assert.equal(Object.hasOwn(contract, "draftBoard"), false);
    assert.equal(Object.hasOwn(contract, "draftPick"), false);
    assert.equal(Object.hasOwn(contract, "rosterAssignment"), false);
    assert.equal(Object.hasOwn(contract, "championshipAssignment"), false);
    assert.equal(Object.hasOwn(contract, "divisionConstruction"), false);
    assert.equal(Object.hasOwn(contract, "matchSimulation"), false);
    assert.equal(Object.hasOwn(contract, "showBooking"), false);
    assert.equal(Object.hasOwn(contract, "weekState"), false);
  });

  it("does not execute draft logic or unlock Week 1", () => {
    const contract = createNewGMModeTalentPoolPrerequisiteContractShell();

    assert.equal(contract.draftLogicExecuted, false);
    assert.equal(contract.rosterAssignmentExecuted, false);
    assert.equal(contract.championshipAssignmentExecuted, false);
    assert.equal(contract.divisionAssignmentExecuted, false);
    assert.equal(contract.weekOneUnlockAvailable, false);
    assert.equal(contract.weekOneUnlocked, false);
    assert.equal(contract.gameplayStartAvailable, false);
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
    const contract = createNewGMModeTalentPoolPrerequisiteContractShell();

    assert.equal(contract.generatedTextCreated, false);
    assert.equal(contract.genAIUsed, false);
    assert.equal(Object.hasOwn(contract, "generatedText"), false);
    assert.equal(Object.hasOwn(contract, "genAIClient"), false);
    assert.equal(Object.hasOwn(contract, "prompt"), false);
    assert.equal(Object.hasOwn(contract, "narrative"), false);
  });

  it("stays deterministic across repeated calls", () => {
    const firstContract = createNewGMModeTalentPoolPrerequisiteContractShell();
    const secondContract = createNewGMModeTalentPoolPrerequisiteContractShell();

    assert.deepEqual(secondContract, firstContract);
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "new-gm-mode-talent-pool-prerequisite-no-engine-change";
    const firstResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeTalentPoolPrerequisiteContractShell();

    const secondResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });
});
