import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, it } from "node:test";

import {
  createNewGMModeChampionshipDivisionRequirementContractShell
} from "../src/game/domain/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const UNTOUCHED_CHAMPIONSHIP_DIVISION_REQUIREMENT_DATABASE =
  "data/saves/__new-gm-mode-championship-division-requirement-contract-should-not-exist.sqlite";

describe("New GM Mode Championship Division Requirement Contract Shell v0.1", () => {
  it("reports diagnosticsOnly true, playerFacing false, and gameplayAffecting false", () => {
    const contract =
      createNewGMModeChampionshipDivisionRequirementContractShell();

    assert.equal(contract.status, "diagnostics-only");
    assert.equal(
      contract.championshipDivisionRequirementContractId,
      "new-gm-mode-championship-division-requirement-contract-v0.1"
    );
    assert.equal(contract.diagnosticsOnly, true);
    assert.equal(contract.playerFacing, false);
    assert.equal(contract.gameplayAffecting, false);
    assert.equal(contract.deterministicOrdering, true);
  });

  it("includes stable championship and division requirement IDs and deterministic order", () => {
    const contract =
      createNewGMModeChampionshipDivisionRequirementContractShell();

    assert.deepEqual(
      contract.championshipDivisionRequirements.map(
        (requirement) => requirement.id
      ),
      [
        "setup-readiness-handoff-prerequisite",
        "draft-prerequisite-contract-prerequisite",
        "talent-pool-prerequisite-contract-prerequisite",
        "draft-board-prerequisite-contract-prerequisite",
        "roster-slot-requirement-contract-prerequisite",
        "selected-brand-context-prerequisite",
        "mens-world-title-division-requirement",
        "womens-title-division-requirement",
        "tag-team-title-division-requirement",
        "optional-midcard-title-division-requirement",
        "champion-assignment-prerequisite",
        "contender-pool-prerequisite",
        "division-eligibility-tagging-prerequisite",
        "roster-slot-compatibility-prerequisite",
        "draft-pick-validation-prerequisite",
        "championship-division-state-persistence-payload-prerequisite"
      ]
    );
    assert.deepEqual(contract.championshipDivisionRequirementSummary, {
      requirementCount: 16,
      requiredBeforeDraftCompletion: true,
      requiredBeforeWeekOne: true,
      contractOnly: true,
      championshipCreationReady: false,
      divisionCreationReady: false,
      championAssignmentReady: false,
      weekOneUnlockReady: false
    });
  });

  it("includes setup readiness handoff prerequisite", () => {
    const contract =
      createNewGMModeChampionshipDivisionRequirementContractShell();

    assert.equal(contract.setupReadinessHandoffAvailable, true);
    assert.deepEqual(contract.championshipDivisionRequirements[0], {
      id: "setup-readiness-handoff-prerequisite",
      label: "Setup readiness handoff prerequisite",
      blockedReason: "setup-readiness-handoff-required"
    });
  });

  it("includes draft prerequisite contract prerequisite", () => {
    const contract =
      createNewGMModeChampionshipDivisionRequirementContractShell();

    assert.equal(contract.draftPrerequisiteContractAvailable, true);
    assert.deepEqual(contract.championshipDivisionRequirements[1], {
      id: "draft-prerequisite-contract-prerequisite",
      label: "Draft prerequisite contract prerequisite",
      blockedReason: "draft-prerequisite-contract-required"
    });
  });

  it("includes talent pool prerequisite contract prerequisite", () => {
    const contract =
      createNewGMModeChampionshipDivisionRequirementContractShell();

    assert.equal(contract.talentPoolPrerequisiteContractAvailable, true);
    assert.deepEqual(contract.championshipDivisionRequirements[2], {
      id: "talent-pool-prerequisite-contract-prerequisite",
      label: "Talent pool prerequisite contract prerequisite",
      blockedReason: "talent-pool-prerequisite-contract-required"
    });
  });

  it("includes draft board prerequisite contract prerequisite", () => {
    const contract =
      createNewGMModeChampionshipDivisionRequirementContractShell();

    assert.equal(contract.draftBoardPrerequisiteContractAvailable, true);
    assert.deepEqual(contract.championshipDivisionRequirements[3], {
      id: "draft-board-prerequisite-contract-prerequisite",
      label: "Draft board prerequisite contract prerequisite",
      blockedReason: "draft-board-prerequisite-contract-required"
    });
  });

  it("includes roster slot requirement contract prerequisite", () => {
    const contract =
      createNewGMModeChampionshipDivisionRequirementContractShell();

    assert.equal(contract.rosterSlotRequirementContractAvailable, true);
    assert.deepEqual(contract.championshipDivisionRequirements[4], {
      id: "roster-slot-requirement-contract-prerequisite",
      label: "Roster slot requirement contract prerequisite",
      blockedReason: "roster-slot-requirement-contract-required"
    });
  });

  it("includes selected brand context prerequisite", () => {
    const contract =
      createNewGMModeChampionshipDivisionRequirementContractShell();

    assert.equal(contract.selectedBrandContextAvailable, false);
    assert.deepEqual(contract.championshipDivisionRequirements[5], {
      id: "selected-brand-context-prerequisite",
      label: "Selected brand context prerequisite",
      blockedReason: "selected-brand-context-required"
    });
  });

  it("includes men's title division requirement", () => {
    const contract =
      createNewGMModeChampionshipDivisionRequirementContractShell();

    assert.equal(contract.mensWorldTitleDivisionAvailable, false);
    assert.deepEqual(contract.championshipDivisionRequirements[6], {
      id: "mens-world-title-division-requirement",
      label: "Men's world title division requirement",
      blockedReason: "mens-world-title-division-not-implemented"
    });
  });

  it("includes women's title division requirement", () => {
    const contract =
      createNewGMModeChampionshipDivisionRequirementContractShell();

    assert.equal(contract.womensTitleDivisionAvailable, false);
    assert.deepEqual(contract.championshipDivisionRequirements[7], {
      id: "womens-title-division-requirement",
      label: "Women's title division requirement",
      blockedReason: "womens-title-division-not-implemented"
    });
  });

  it("includes tag team title division requirement", () => {
    const contract =
      createNewGMModeChampionshipDivisionRequirementContractShell();

    assert.equal(contract.tagTeamTitleDivisionAvailable, false);
    assert.deepEqual(contract.championshipDivisionRequirements[8], {
      id: "tag-team-title-division-requirement",
      label: "Tag team title division requirement",
      blockedReason: "tag-team-title-division-not-implemented"
    });
  });

  it("includes optional midcard title division requirement", () => {
    const contract =
      createNewGMModeChampionshipDivisionRequirementContractShell();

    assert.equal(contract.optionalMidcardTitleDivisionAvailable, false);
    assert.deepEqual(contract.championshipDivisionRequirements[9], {
      id: "optional-midcard-title-division-requirement",
      label: "Optional midcard title division requirement",
      blockedReason: "midcard-title-division-not-implemented"
    });
  });

  it("includes champion assignment prerequisite", () => {
    const contract =
      createNewGMModeChampionshipDivisionRequirementContractShell();

    assert.equal(contract.championAssignmentAvailable, false);
    assert.deepEqual(contract.championshipDivisionRequirements[10], {
      id: "champion-assignment-prerequisite",
      label: "Champion assignment prerequisite",
      blockedReason: "champion-assignment-not-implemented"
    });
  });

  it("includes contender pool prerequisite", () => {
    const contract =
      createNewGMModeChampionshipDivisionRequirementContractShell();

    assert.equal(contract.contenderPoolCreationAvailable, false);
    assert.equal(contract.contenderPoolAvailable, false);
    assert.deepEqual(contract.championshipDivisionRequirements[11], {
      id: "contender-pool-prerequisite",
      label: "Contender pool prerequisite",
      blockedReason: "contender-pool-creation-not-implemented"
    });
  });

  it("includes division eligibility and tagging prerequisite", () => {
    const contract =
      createNewGMModeChampionshipDivisionRequirementContractShell();

    assert.equal(contract.divisionEligibilityTaggingAvailable, false);
    assert.deepEqual(contract.championshipDivisionRequirements[12], {
      id: "division-eligibility-tagging-prerequisite",
      label: "Division eligibility and tagging prerequisite",
      blockedReason: "division-eligibility-tagging-not-implemented"
    });
  });

  it("reports championship, division, champion assignment, draft execution, and gameplay start unavailable", () => {
    const contract =
      createNewGMModeChampionshipDivisionRequirementContractShell();

    assert.equal(contract.setupReadinessHandoffAvailable, true);
    assert.equal(contract.draftPrerequisiteContractAvailable, true);
    assert.equal(contract.talentPoolPrerequisiteContractAvailable, true);
    assert.equal(contract.draftBoardPrerequisiteContractAvailable, true);
    assert.equal(contract.rosterSlotRequirementContractAvailable, true);
    assert.equal(contract.championshipDivisionRequirementContractAvailable, true);
    assert.equal(contract.championshipCreationAvailable, false);
    assert.equal(contract.championAssignmentAvailable, false);
    assert.equal(contract.championshipAssignmentAvailable, false);
    assert.equal(contract.divisionCreationAvailable, false);
    assert.equal(contract.divisionAssignmentAvailable, false);
    assert.equal(contract.contenderPoolCreationAvailable, false);
    assert.equal(contract.wrestlerAssignmentAvailable, false);
    assert.equal(contract.draftPickValidationAvailable, false);
    assert.equal(contract.draftExecutionAvailable, false);
    assert.equal(contract.weekOneUnlockAvailable, false);
    assert.equal(contract.gameplayStartAvailable, false);
    assert.equal(contract.gameplayPayloadPersistenceAvailable, false);
    assert.equal(contract.uiWiringAvailable, false);
    assert.deepEqual(contract.blockedReasons, [
      "championship-division-requirement-contract-only",
      "setup-readiness-handoff-required",
      "draft-prerequisite-contract-required",
      "talent-pool-prerequisite-contract-required",
      "draft-board-prerequisite-contract-required",
      "roster-slot-requirement-contract-required",
      "selected-brand-context-required",
      "mens-world-title-division-not-implemented",
      "womens-title-division-not-implemented",
      "tag-team-title-division-not-implemented",
      "midcard-title-division-not-implemented",
      "championship-creation-not-implemented",
      "division-creation-not-implemented",
      "champion-assignment-not-implemented",
      "contender-pool-creation-not-implemented",
      "division-eligibility-tagging-not-implemented",
      "roster-slot-compatibility-not-implemented",
      "draft-pick-validation-not-implemented",
      "gameplay-payload-persistence-not-implemented",
      "wrestler-assignment-not-implemented",
      "draft-execution-not-implemented",
      "week-one-unlock-not-implemented",
      "gameplay-start-not-implemented",
      "ui-wiring-not-implemented"
    ]);
  });

  it("does not create a save or write to SQLite", () => {
    const contract =
      createNewGMModeChampionshipDivisionRequirementContractShell();

    assert.equal(contract.saveCreated, false);
    assert.equal(contract.sqliteWritten, false);
    assert.equal(contract.sqliteDatabaseOpened, false);
    assert.equal(
      existsSync(UNTOUCHED_CHAMPIONSHIP_DIVISION_REQUIREMENT_DATABASE),
      false
    );
    assert.equal(Object.hasOwn(contract, "saveRepository"), false);
    assert.equal(Object.hasOwn(contract, "createSave"), false);
    assert.equal(Object.hasOwn(contract, "sqliteConnection"), false);
  });

  it("does not create wrestler data, pools, boards, rosters, championships, divisions, champions, contender pools, or gameplay entities", () => {
    const contract =
      createNewGMModeChampionshipDivisionRequirementContractShell();

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
    assert.equal(contract.wrestlerAssignmentsCreated, false);
    assert.equal(contract.championshipsCreated, false);
    assert.equal(contract.divisionsCreated, false);
    assert.equal(contract.championsCreated, false);
    assert.equal(contract.championAssignmentsCreated, false);
    assert.equal(contract.contenderPoolsCreated, false);
    assert.equal(contract.matchesCreated, false);
    assert.equal(contract.showsCreated, false);
    assert.equal(contract.weeksCreated, false);
    assert.equal(Object.hasOwn(contract, "wrestlers"), false);
    assert.equal(Object.hasOwn(contract, "wrestlerRecords"), false);
    assert.equal(Object.hasOwn(contract, "eligibleTalentPool"), false);
    assert.equal(Object.hasOwn(contract, "talentPool"), false);
    assert.equal(Object.hasOwn(contract, "draftBoard"), false);
    assert.equal(Object.hasOwn(contract, "draftPick"), false);
    assert.equal(Object.hasOwn(contract, "roster"), false);
    assert.equal(Object.hasOwn(contract, "championship"), false);
    assert.equal(Object.hasOwn(contract, "champion"), false);
    assert.equal(Object.hasOwn(contract, "division"), false);
    assert.equal(Object.hasOwn(contract, "contenderPool"), false);
    assert.equal(Object.hasOwn(contract, "championshipAssignment"), false);
    assert.equal(Object.hasOwn(contract, "divisionConstruction"), false);
    assert.equal(Object.hasOwn(contract, "matchSimulation"), false);
    assert.equal(Object.hasOwn(contract, "showBooking"), false);
    assert.equal(Object.hasOwn(contract, "weekState"), false);
  });

  it("does not execute draft logic or unlock Week 1", () => {
    const contract =
      createNewGMModeChampionshipDivisionRequirementContractShell();

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
    const contract =
      createNewGMModeChampionshipDivisionRequirementContractShell();

    assert.equal(contract.generatedTextCreated, false);
    assert.equal(contract.genAIUsed, false);
    assert.equal(Object.hasOwn(contract, "generatedText"), false);
    assert.equal(Object.hasOwn(contract, "genAIClient"), false);
    assert.equal(Object.hasOwn(contract, "prompt"), false);
    assert.equal(Object.hasOwn(contract, "narrative"), false);
  });

  it("stays deterministic across repeated calls", () => {
    const firstContract =
      createNewGMModeChampionshipDivisionRequirementContractShell();
    const secondContract =
      createNewGMModeChampionshipDivisionRequirementContractShell();

    assert.deepEqual(secondContract, firstContract);
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed =
      "new-gm-mode-championship-division-requirement-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeChampionshipDivisionRequirementContractShell();

    const secondResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });
});
