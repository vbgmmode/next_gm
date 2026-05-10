import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, it } from "node:test";

import {
  createNewGMModeDraftBoardPrerequisiteContractShell
} from "../src/game/domain/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const UNTOUCHED_DRAFT_BOARD_PREREQUISITE_DATABASE =
  "data/saves/__new-gm-mode-draft-board-prerequisite-contract-should-not-exist.sqlite";

describe("New GM Mode Draft Board Prerequisite Contract Shell v0.1", () => {
  it("reports diagnosticsOnly true, playerFacing false, and gameplayAffecting false", () => {
    const contract = createNewGMModeDraftBoardPrerequisiteContractShell();

    assert.equal(contract.status, "diagnostics-only");
    assert.equal(
      contract.draftBoardPrerequisiteContractId,
      "new-gm-mode-draft-board-prerequisite-contract-v0.1"
    );
    assert.equal(contract.diagnosticsOnly, true);
    assert.equal(contract.playerFacing, false);
    assert.equal(contract.gameplayAffecting, false);
    assert.equal(contract.deterministicOrdering, true);
  });

  it("includes stable draft board prerequisite IDs and deterministic order", () => {
    const contract = createNewGMModeDraftBoardPrerequisiteContractShell();

    assert.deepEqual(
      contract.draftBoardPrerequisites.map((prerequisite) => prerequisite.id),
      [
        "setup-readiness-handoff-prerequisite",
        "draft-prerequisite-contract-prerequisite",
        "talent-pool-prerequisite-contract-prerequisite",
        "eligible-talent-pool-prerequisite",
        "draft-board-ordering-prerequisite",
        "wrestler-display-identity-prerequisite",
        "brand-eligibility-visibility-prerequisite",
        "role-division-visibility-prerequisite",
        "availability-status-prerequisite",
        "draft-pick-validation-prerequisite",
        "roster-slot-compatibility-prerequisite",
        "draft-board-state-persistence-payload-prerequisite"
      ]
    );
    assert.deepEqual(contract.draftBoardPrerequisiteSummary, {
      prerequisiteCount: 12,
      requiredBeforeDraftExecution: true,
      contractOnly: true,
      draftBoardCreationReady: false,
      draftPickValidationReady: false,
      draftExecutionReady: false
    });
  });

  it("includes setup readiness handoff prerequisite", () => {
    const contract = createNewGMModeDraftBoardPrerequisiteContractShell();

    assert.equal(contract.setupReadinessHandoffAvailable, true);
    assert.deepEqual(contract.draftBoardPrerequisites[0], {
      id: "setup-readiness-handoff-prerequisite",
      label: "Setup readiness handoff prerequisite",
      blockedReason: "setup-readiness-handoff-required"
    });
  });

  it("includes draft prerequisite contract prerequisite", () => {
    const contract = createNewGMModeDraftBoardPrerequisiteContractShell();

    assert.equal(contract.draftPrerequisiteContractAvailable, true);
    assert.deepEqual(contract.draftBoardPrerequisites[1], {
      id: "draft-prerequisite-contract-prerequisite",
      label: "Draft prerequisite contract prerequisite",
      blockedReason: "draft-prerequisite-contract-required"
    });
  });

  it("includes talent pool prerequisite contract prerequisite", () => {
    const contract = createNewGMModeDraftBoardPrerequisiteContractShell();

    assert.equal(contract.talentPoolPrerequisiteContractAvailable, true);
    assert.deepEqual(contract.draftBoardPrerequisites[2], {
      id: "talent-pool-prerequisite-contract-prerequisite",
      label: "Talent pool prerequisite contract prerequisite",
      blockedReason: "talent-pool-prerequisite-contract-required"
    });
  });

  it("includes eligible talent pool prerequisite", () => {
    const contract = createNewGMModeDraftBoardPrerequisiteContractShell();

    assert.equal(contract.eligibleTalentPoolCreationAvailable, false);
    assert.deepEqual(contract.draftBoardPrerequisites[3], {
      id: "eligible-talent-pool-prerequisite",
      label: "Eligible talent pool prerequisite",
      blockedReason: "eligible-talent-pool-not-implemented"
    });
  });

  it("includes draft board ordering prerequisite", () => {
    const contract = createNewGMModeDraftBoardPrerequisiteContractShell();

    assert.equal(contract.draftOrderingAvailable, false);
    assert.deepEqual(contract.draftBoardPrerequisites[4], {
      id: "draft-board-ordering-prerequisite",
      label: "Draft board ordering prerequisite",
      blockedReason: "draft-ordering-not-implemented"
    });
  });

  it("includes wrestler display identity prerequisite", () => {
    const contract = createNewGMModeDraftBoardPrerequisiteContractShell();

    assert.equal(contract.wrestlerDataLoadingAvailable, false);
    assert.equal(contract.wrestlerDisplayIdentityAvailable, false);
    assert.deepEqual(contract.draftBoardPrerequisites[5], {
      id: "wrestler-display-identity-prerequisite",
      label: "Wrestler display identity prerequisite",
      blockedReason: "wrestler-display-identity-not-implemented"
    });
  });

  it("includes brand eligibility visibility prerequisite", () => {
    const contract = createNewGMModeDraftBoardPrerequisiteContractShell();

    assert.equal(contract.brandEligibilityVisibilityAvailable, false);
    assert.deepEqual(contract.draftBoardPrerequisites[6], {
      id: "brand-eligibility-visibility-prerequisite",
      label: "Brand eligibility visibility prerequisite",
      blockedReason: "brand-eligibility-visibility-not-implemented"
    });
  });

  it("includes role and division visibility prerequisite", () => {
    const contract = createNewGMModeDraftBoardPrerequisiteContractShell();

    assert.equal(contract.roleDivisionVisibilityAvailable, false);
    assert.deepEqual(contract.draftBoardPrerequisites[7], {
      id: "role-division-visibility-prerequisite",
      label: "Role and division visibility prerequisite",
      blockedReason: "role-division-visibility-not-implemented"
    });
  });

  it("includes availability status prerequisite", () => {
    const contract = createNewGMModeDraftBoardPrerequisiteContractShell();

    assert.equal(contract.availabilityStatusAvailable, false);
    assert.deepEqual(contract.draftBoardPrerequisites[8], {
      id: "availability-status-prerequisite",
      label: "Availability status prerequisite",
      blockedReason: "availability-status-not-implemented"
    });
  });

  it("includes future draft pick validation prerequisite", () => {
    const contract = createNewGMModeDraftBoardPrerequisiteContractShell();

    assert.equal(contract.draftPickValidationAvailable, false);
    assert.deepEqual(contract.draftBoardPrerequisites[9], {
      id: "draft-pick-validation-prerequisite",
      label: "Future draft pick validation prerequisite",
      blockedReason: "draft-pick-validation-not-implemented"
    });
  });

  it("reports draft board creation, draft execution, and gameplay start unavailable", () => {
    const contract = createNewGMModeDraftBoardPrerequisiteContractShell();

    assert.equal(contract.setupContractAvailable, true);
    assert.equal(contract.setupOptionsCatalogAvailable, true);
    assert.equal(contract.setupSelectionValidatorAvailable, true);
    assert.equal(contract.setupReadinessHandoffAvailable, true);
    assert.equal(contract.draftPrerequisiteContractAvailable, true);
    assert.equal(contract.talentPoolPrerequisiteContractAvailable, true);
    assert.equal(contract.draftBoardPrerequisiteContractAvailable, true);
    assert.equal(contract.draftBoardCreationAvailable, false);
    assert.equal(contract.wrestlerDataLoadingAvailable, false);
    assert.equal(contract.eligibleTalentPoolCreationAvailable, false);
    assert.equal(contract.draftOrderingAvailable, false);
    assert.equal(contract.draftPickValidationAvailable, false);
    assert.equal(contract.draftExecutionAvailable, false);
    assert.equal(contract.rosterAssignmentAvailable, false);
    assert.equal(contract.championshipAssignmentAvailable, false);
    assert.equal(contract.divisionAssignmentAvailable, false);
    assert.equal(contract.weekOneUnlockAvailable, false);
    assert.equal(contract.gameplayStartAvailable, false);
    assert.equal(contract.gameplayPayloadPersistenceAvailable, false);
    assert.equal(contract.uiWiringAvailable, false);
    assert.deepEqual(contract.blockedReasons, [
      "draft-board-prerequisite-contract-only",
      "setup-readiness-handoff-required",
      "draft-prerequisite-contract-required",
      "talent-pool-prerequisite-contract-required",
      "eligible-talent-pool-not-implemented",
      "draft-board-creation-not-implemented",
      "draft-ordering-not-implemented",
      "wrestler-data-loading-not-implemented",
      "wrestler-display-identity-not-implemented",
      "brand-eligibility-visibility-not-implemented",
      "role-division-visibility-not-implemented",
      "availability-status-not-implemented",
      "draft-pick-validation-not-implemented",
      "roster-slot-compatibility-not-implemented",
      "gameplay-payload-persistence-not-implemented",
      "draft-execution-not-implemented",
      "roster-assignment-not-implemented",
      "championship-assignment-not-implemented",
      "division-assignment-not-implemented",
      "week-one-unlock-not-implemented",
      "gameplay-start-not-implemented",
      "ui-wiring-not-implemented"
    ]);
  });

  it("does not create a save or write to SQLite", () => {
    const contract = createNewGMModeDraftBoardPrerequisiteContractShell();

    assert.equal(contract.saveCreated, false);
    assert.equal(contract.sqliteWritten, false);
    assert.equal(contract.sqliteDatabaseOpened, false);
    assert.equal(existsSync(UNTOUCHED_DRAFT_BOARD_PREREQUISITE_DATABASE), false);
    assert.equal(Object.hasOwn(contract, "saveRepository"), false);
    assert.equal(Object.hasOwn(contract, "createSave"), false);
    assert.equal(Object.hasOwn(contract, "sqliteConnection"), false);
  });

  it("does not create wrestler data, talent pools, draft boards, or gameplay entities", () => {
    const contract = createNewGMModeDraftBoardPrerequisiteContractShell();

    assert.equal(contract.gameplayStateCreated, false);
    assert.equal(contract.wrestlerDataCreated, false);
    assert.equal(contract.wrestlerIdentityRecordsCreated, false);
    assert.equal(contract.eligibleTalentPoolsCreated, false);
    assert.equal(contract.talentPoolsCreated, false);
    assert.equal(contract.draftBoardsCreated, false);
    assert.equal(contract.draftOrderingGenerated, false);
    assert.equal(contract.draftPicksCreated, false);
    assert.equal(contract.draftPickValidationExecuted, false);
    assert.equal(contract.rostersCreated, false);
    assert.equal(contract.championshipsCreated, false);
    assert.equal(contract.divisionsCreated, false);
    assert.equal(contract.matchesCreated, false);
    assert.equal(contract.showsCreated, false);
    assert.equal(contract.weeksCreated, false);
    assert.equal(Object.hasOwn(contract, "wrestlers"), false);
    assert.equal(Object.hasOwn(contract, "wrestlerRecords"), false);
    assert.equal(Object.hasOwn(contract, "eligibleTalentPool"), false);
    assert.equal(Object.hasOwn(contract, "talentPool"), false);
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
    const contract = createNewGMModeDraftBoardPrerequisiteContractShell();

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
    const contract = createNewGMModeDraftBoardPrerequisiteContractShell();

    assert.equal(contract.generatedTextCreated, false);
    assert.equal(contract.genAIUsed, false);
    assert.equal(Object.hasOwn(contract, "generatedText"), false);
    assert.equal(Object.hasOwn(contract, "genAIClient"), false);
    assert.equal(Object.hasOwn(contract, "prompt"), false);
    assert.equal(Object.hasOwn(contract, "narrative"), false);
  });

  it("stays deterministic across repeated calls", () => {
    const firstContract = createNewGMModeDraftBoardPrerequisiteContractShell();
    const secondContract = createNewGMModeDraftBoardPrerequisiteContractShell();

    assert.deepEqual(secondContract, firstContract);
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "new-gm-mode-draft-board-prerequisite-no-engine-change";
    const firstResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeDraftBoardPrerequisiteContractShell();

    const secondResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });
});
