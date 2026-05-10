import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, it } from "node:test";

import {
  createNewGMModeRosterSlotRequirementContractShell
} from "../src/game/domain/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const UNTOUCHED_ROSTER_SLOT_REQUIREMENT_DATABASE =
  "data/saves/__new-gm-mode-roster-slot-requirement-contract-should-not-exist.sqlite";

describe("New GM Mode Roster Slot Requirement Contract Shell v0.1", () => {
  it("reports diagnosticsOnly true, playerFacing false, and gameplayAffecting false", () => {
    const contract = createNewGMModeRosterSlotRequirementContractShell();

    assert.equal(contract.status, "diagnostics-only");
    assert.equal(
      contract.rosterSlotRequirementContractId,
      "new-gm-mode-roster-slot-requirement-contract-v0.1"
    );
    assert.equal(contract.diagnosticsOnly, true);
    assert.equal(contract.playerFacing, false);
    assert.equal(contract.gameplayAffecting, false);
    assert.equal(contract.deterministicOrdering, true);
  });

  it("includes stable roster slot requirement IDs and deterministic order", () => {
    const contract = createNewGMModeRosterSlotRequirementContractShell();

    assert.deepEqual(
      contract.rosterSlotRequirements.map((requirement) => requirement.id),
      [
        "setup-readiness-handoff-prerequisite",
        "draft-prerequisite-contract-prerequisite",
        "talent-pool-prerequisite-contract-prerequisite",
        "draft-board-prerequisite-contract-prerequisite",
        "selected-brand-context-prerequisite",
        "minimum-total-roster-size-requirement",
        "maximum-total-roster-size-guideline",
        "mens-division-roster-slot-requirement",
        "womens-division-roster-slot-requirement",
        "tag-team-division-roster-slot-requirement",
        "main-event-top-contender-depth-requirement",
        "championship-division-compatibility-prerequisite",
        "draft-pick-validation-prerequisite",
        "roster-state-persistence-payload-prerequisite"
      ]
    );
    assert.deepEqual(contract.rosterSlotRequirementSummary, {
      requirementCount: 14,
      requiredBeforeDraftCompletion: true,
      requiredBeforeWeekOne: true,
      contractOnly: true,
      rosterCreationReady: false,
      draftPickValidationReady: false,
      weekOneUnlockReady: false
    });
  });

  it("includes setup readiness handoff prerequisite", () => {
    const contract = createNewGMModeRosterSlotRequirementContractShell();

    assert.equal(contract.setupReadinessHandoffAvailable, true);
    assert.deepEqual(contract.rosterSlotRequirements[0], {
      id: "setup-readiness-handoff-prerequisite",
      label: "Setup readiness handoff prerequisite",
      blockedReason: "setup-readiness-handoff-required"
    });
  });

  it("includes draft prerequisite contract prerequisite", () => {
    const contract = createNewGMModeRosterSlotRequirementContractShell();

    assert.equal(contract.draftPrerequisiteContractAvailable, true);
    assert.deepEqual(contract.rosterSlotRequirements[1], {
      id: "draft-prerequisite-contract-prerequisite",
      label: "Draft prerequisite contract prerequisite",
      blockedReason: "draft-prerequisite-contract-required"
    });
  });

  it("includes talent pool prerequisite contract prerequisite", () => {
    const contract = createNewGMModeRosterSlotRequirementContractShell();

    assert.equal(contract.talentPoolPrerequisiteContractAvailable, true);
    assert.deepEqual(contract.rosterSlotRequirements[2], {
      id: "talent-pool-prerequisite-contract-prerequisite",
      label: "Talent pool prerequisite contract prerequisite",
      blockedReason: "talent-pool-prerequisite-contract-required"
    });
  });

  it("includes draft board prerequisite contract prerequisite", () => {
    const contract = createNewGMModeRosterSlotRequirementContractShell();

    assert.equal(contract.draftBoardPrerequisiteContractAvailable, true);
    assert.deepEqual(contract.rosterSlotRequirements[3], {
      id: "draft-board-prerequisite-contract-prerequisite",
      label: "Draft board prerequisite contract prerequisite",
      blockedReason: "draft-board-prerequisite-contract-required"
    });
  });

  it("includes selected brand context prerequisite", () => {
    const contract = createNewGMModeRosterSlotRequirementContractShell();

    assert.equal(contract.selectedBrandContextAvailable, false);
    assert.deepEqual(contract.rosterSlotRequirements[4], {
      id: "selected-brand-context-prerequisite",
      label: "Selected brand context prerequisite",
      blockedReason: "selected-brand-context-required"
    });
  });

  it("includes minimum roster size requirement", () => {
    const contract = createNewGMModeRosterSlotRequirementContractShell();

    assert.equal(contract.minimumTotalRosterSizeAvailable, false);
    assert.deepEqual(contract.rosterSlotRequirements[5], {
      id: "minimum-total-roster-size-requirement",
      label: "Minimum total roster size requirement",
      blockedReason: "minimum-roster-size-not-implemented"
    });
  });

  it("includes maximum roster size guideline", () => {
    const contract = createNewGMModeRosterSlotRequirementContractShell();

    assert.equal(contract.maximumTotalRosterSizeGuidelineAvailable, false);
    assert.deepEqual(contract.rosterSlotRequirements[6], {
      id: "maximum-total-roster-size-guideline",
      label: "Maximum total roster size guideline",
      blockedReason: "maximum-roster-size-guideline-not-implemented"
    });
  });

  it("includes men's division roster slot requirement", () => {
    const contract = createNewGMModeRosterSlotRequirementContractShell();

    assert.equal(contract.mensDivisionRosterSlotsAvailable, false);
    assert.deepEqual(contract.rosterSlotRequirements[7], {
      id: "mens-division-roster-slot-requirement",
      label: "Men's division roster slot requirement",
      blockedReason: "mens-division-slots-not-implemented"
    });
  });

  it("includes women's division roster slot requirement", () => {
    const contract = createNewGMModeRosterSlotRequirementContractShell();

    assert.equal(contract.womensDivisionRosterSlotsAvailable, false);
    assert.deepEqual(contract.rosterSlotRequirements[8], {
      id: "womens-division-roster-slot-requirement",
      label: "Women's division roster slot requirement",
      blockedReason: "womens-division-slots-not-implemented"
    });
  });

  it("includes tag team division roster slot requirement", () => {
    const contract = createNewGMModeRosterSlotRequirementContractShell();

    assert.equal(contract.tagTeamDivisionRosterSlotsAvailable, false);
    assert.deepEqual(contract.rosterSlotRequirements[9], {
      id: "tag-team-division-roster-slot-requirement",
      label: "Tag team division roster slot requirement",
      blockedReason: "tag-team-division-slots-not-implemented"
    });
  });

  it("includes main event and top contender depth requirement", () => {
    const contract = createNewGMModeRosterSlotRequirementContractShell();

    assert.equal(contract.mainEventTopContenderDepthAvailable, false);
    assert.deepEqual(contract.rosterSlotRequirements[10], {
      id: "main-event-top-contender-depth-requirement",
      label: "Main event and top contender depth requirement",
      blockedReason: "main-event-depth-not-implemented"
    });
  });

  it("includes future championship and division compatibility prerequisite", () => {
    const contract = createNewGMModeRosterSlotRequirementContractShell();

    assert.equal(contract.championshipDivisionCompatibilityAvailable, false);
    assert.deepEqual(contract.rosterSlotRequirements[11], {
      id: "championship-division-compatibility-prerequisite",
      label: "Future championship and division compatibility prerequisite",
      blockedReason: "championship-division-compatibility-not-implemented"
    });
  });

  it("includes future draft pick validation prerequisite", () => {
    const contract = createNewGMModeRosterSlotRequirementContractShell();

    assert.equal(contract.draftPickValidationAvailable, false);
    assert.deepEqual(contract.rosterSlotRequirements[12], {
      id: "draft-pick-validation-prerequisite",
      label: "Future draft pick validation prerequisite",
      blockedReason: "draft-pick-validation-not-implemented"
    });
  });

  it("reports roster creation, draft execution, and gameplay start unavailable", () => {
    const contract = createNewGMModeRosterSlotRequirementContractShell();

    assert.equal(contract.setupReadinessHandoffAvailable, true);
    assert.equal(contract.draftPrerequisiteContractAvailable, true);
    assert.equal(contract.talentPoolPrerequisiteContractAvailable, true);
    assert.equal(contract.draftBoardPrerequisiteContractAvailable, true);
    assert.equal(contract.rosterSlotRequirementContractAvailable, true);
    assert.equal(contract.rosterCreationAvailable, false);
    assert.equal(contract.wrestlerAssignmentAvailable, false);
    assert.equal(contract.draftPickValidationAvailable, false);
    assert.equal(contract.draftExecutionAvailable, false);
    assert.equal(contract.championshipAssignmentAvailable, false);
    assert.equal(contract.divisionAssignmentAvailable, false);
    assert.equal(contract.weekOneUnlockAvailable, false);
    assert.equal(contract.gameplayStartAvailable, false);
    assert.equal(contract.gameplayPayloadPersistenceAvailable, false);
    assert.equal(contract.uiWiringAvailable, false);
    assert.deepEqual(contract.blockedReasons, [
      "roster-slot-requirement-contract-only",
      "setup-readiness-handoff-required",
      "draft-prerequisite-contract-required",
      "talent-pool-prerequisite-contract-required",
      "draft-board-prerequisite-contract-required",
      "selected-brand-context-required",
      "minimum-roster-size-not-implemented",
      "maximum-roster-size-guideline-not-implemented",
      "mens-division-slots-not-implemented",
      "womens-division-slots-not-implemented",
      "tag-team-division-slots-not-implemented",
      "main-event-depth-not-implemented",
      "championship-division-compatibility-not-implemented",
      "draft-pick-validation-not-implemented",
      "gameplay-payload-persistence-not-implemented",
      "roster-creation-not-implemented",
      "wrestler-assignment-not-implemented",
      "draft-execution-not-implemented",
      "championship-assignment-not-implemented",
      "division-assignment-not-implemented",
      "week-one-unlock-not-implemented",
      "gameplay-start-not-implemented",
      "ui-wiring-not-implemented"
    ]);
  });

  it("does not create a save or write to SQLite", () => {
    const contract = createNewGMModeRosterSlotRequirementContractShell();

    assert.equal(contract.saveCreated, false);
    assert.equal(contract.sqliteWritten, false);
    assert.equal(contract.sqliteDatabaseOpened, false);
    assert.equal(existsSync(UNTOUCHED_ROSTER_SLOT_REQUIREMENT_DATABASE), false);
    assert.equal(Object.hasOwn(contract, "saveRepository"), false);
    assert.equal(Object.hasOwn(contract, "createSave"), false);
    assert.equal(Object.hasOwn(contract, "sqliteConnection"), false);
  });

  it("does not create wrestler data, talent pools, draft boards, rosters, or gameplay entities", () => {
    const contract = createNewGMModeRosterSlotRequirementContractShell();

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
    assert.equal(Object.hasOwn(contract, "rosterAssignment"), false);
    assert.equal(Object.hasOwn(contract, "championshipAssignment"), false);
    assert.equal(Object.hasOwn(contract, "divisionConstruction"), false);
    assert.equal(Object.hasOwn(contract, "matchSimulation"), false);
    assert.equal(Object.hasOwn(contract, "showBooking"), false);
    assert.equal(Object.hasOwn(contract, "weekState"), false);
  });

  it("does not execute draft logic or unlock Week 1", () => {
    const contract = createNewGMModeRosterSlotRequirementContractShell();

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
    const contract = createNewGMModeRosterSlotRequirementContractShell();

    assert.equal(contract.generatedTextCreated, false);
    assert.equal(contract.genAIUsed, false);
    assert.equal(Object.hasOwn(contract, "generatedText"), false);
    assert.equal(Object.hasOwn(contract, "genAIClient"), false);
    assert.equal(Object.hasOwn(contract, "prompt"), false);
    assert.equal(Object.hasOwn(contract, "narrative"), false);
  });

  it("stays deterministic across repeated calls", () => {
    const firstContract = createNewGMModeRosterSlotRequirementContractShell();
    const secondContract = createNewGMModeRosterSlotRequirementContractShell();

    assert.deepEqual(secondContract, firstContract);
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "new-gm-mode-roster-slot-requirement-no-engine-change";
    const firstResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeRosterSlotRequirementContractShell();

    const secondResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });
});
