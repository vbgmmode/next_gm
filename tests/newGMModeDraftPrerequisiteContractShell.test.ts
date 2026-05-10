import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, it } from "node:test";

import {
  createNewGMModeDraftPrerequisiteContractShell
} from "../src/game/domain/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const UNTOUCHED_DRAFT_PREREQUISITE_DATABASE =
  "data/saves/__new-gm-mode-draft-prerequisite-contract-should-not-exist.sqlite";

describe("New GM Mode Draft Prerequisite Contract Shell v0.1", () => {
  it("reports diagnosticsOnly true and playerFacing false", () => {
    const contract = createNewGMModeDraftPrerequisiteContractShell();

    assert.equal(contract.status, "diagnostics-only");
    assert.equal(
      contract.draftPrerequisiteContractId,
      "new-gm-mode-draft-prerequisite-contract-v0.1"
    );
    assert.equal(contract.diagnosticsOnly, true);
    assert.equal(contract.playerFacing, false);
    assert.equal(contract.gameplayAffecting, false);
    assert.equal(contract.deterministicOrdering, true);
  });

  it("includes stable draft prerequisite IDs and deterministic order", () => {
    const contract = createNewGMModeDraftPrerequisiteContractShell();

    assert.deepEqual(
      contract.draftPrerequisites.map((prerequisite) => prerequisite.id),
      [
        "setup-readiness-handoff-prerequisite",
        "selected-promotion-brand-prerequisite",
        "manager-identity-prerequisite",
        "draft-mode-prerequisite",
        "eligible-talent-pool-prerequisite",
        "brand-roster-slot-requirements",
        "minimum-roster-size-requirement",
        "championship-division-assignment-prerequisite",
        "draft-completion-before-week-1-prerequisite",
        "draft-result-persistence-payload-prerequisite"
      ]
    );
    assert.deepEqual(contract.draftPrerequisiteSummary, {
      prerequisiteCount: 10,
      requiredBeforeWeekOne: true,
      contractOnly: true,
      draftExecutionReady: false,
      weekOneUnlockReady: false
    });
  });

  it("includes setup readiness handoff prerequisite", () => {
    const contract = createNewGMModeDraftPrerequisiteContractShell();

    assert.equal(contract.setupReadinessHandoffAvailable, true);
    assert.deepEqual(contract.draftPrerequisites[0], {
      id: "setup-readiness-handoff-prerequisite",
      label: "Setup readiness handoff prerequisite",
      blockedReason: "draft-prerequisite-contract-only"
    });
  });

  it("includes talent pool prerequisite", () => {
    const contract = createNewGMModeDraftPrerequisiteContractShell();

    assert.equal(contract.talentPoolAvailable, false);
    assert.equal(
      contract.draftPrerequisites[4].id,
      "eligible-talent-pool-prerequisite"
    );
    assert.equal(
      contract.draftPrerequisites[4].blockedReason,
      "talent-pool-not-implemented"
    );
  });

  it("includes roster size and slot prerequisites", () => {
    const contract = createNewGMModeDraftPrerequisiteContractShell();

    assert.equal(contract.rosterAssignmentAvailable, false);
    assert.equal(
      contract.draftPrerequisites[5].id,
      "brand-roster-slot-requirements"
    );
    assert.equal(
      contract.draftPrerequisites[6].id,
      "minimum-roster-size-requirement"
    );
  });

  it("includes championship and division prerequisite", () => {
    const contract = createNewGMModeDraftPrerequisiteContractShell();

    assert.equal(contract.championshipAssignmentAvailable, false);
    assert.equal(contract.divisionAssignmentAvailable, false);
    assert.deepEqual(contract.draftPrerequisites[7], {
      id: "championship-division-assignment-prerequisite",
      label: "Championship and division assignment prerequisite",
      blockedReason: "championship-assignment-not-implemented"
    });
  });

  it("includes draft completion prerequisite before Week 1", () => {
    const contract = createNewGMModeDraftPrerequisiteContractShell();

    assert.equal(contract.weekOneUnlockAvailable, false);
    assert.equal(contract.weekOneUnlocked, false);
    assert.deepEqual(contract.draftPrerequisites[8], {
      id: "draft-completion-before-week-1-prerequisite",
      label: "Draft completion prerequisite before Week 1",
      blockedReason: "week-one-unlock-not-implemented"
    });
  });

  it("reports available setup contracts and unavailable draft execution", () => {
    const contract = createNewGMModeDraftPrerequisiteContractShell();

    assert.equal(contract.setupContractAvailable, true);
    assert.equal(contract.setupOptionsCatalogAvailable, true);
    assert.equal(contract.setupSelectionValidatorAvailable, true);
    assert.equal(contract.setupReadinessHandoffAvailable, true);
    assert.equal(contract.draftPrerequisiteContractAvailable, true);
    assert.equal(contract.draftExecutionAvailable, false);
    assert.equal(contract.gameplayStartAvailable, false);
    assert.equal(contract.gameplayPayloadPersistenceAvailable, false);
    assert.equal(contract.uiWiringAvailable, false);
    assert.deepEqual(contract.blockedReasons, [
      "draft-prerequisite-contract-only",
      "draft-execution-not-implemented",
      "talent-pool-not-implemented",
      "roster-assignment-not-implemented",
      "brand-roster-balancing-not-implemented",
      "championship-assignment-not-implemented",
      "division-assignment-not-implemented",
      "week-one-unlock-not-implemented",
      "gameplay-start-not-implemented",
      "gameplay-payload-persistence-not-implemented",
      "ui-wiring-not-implemented"
    ]);
  });

  it("does not create a save or write to SQLite", () => {
    const contract = createNewGMModeDraftPrerequisiteContractShell();

    assert.equal(contract.saveCreated, false);
    assert.equal(contract.sqliteWritten, false);
    assert.equal(contract.sqliteDatabaseOpened, false);
    assert.equal(existsSync(UNTOUCHED_DRAFT_PREREQUISITE_DATABASE), false);
    assert.equal(Object.hasOwn(contract, "saveRepository"), false);
    assert.equal(Object.hasOwn(contract, "createSave"), false);
    assert.equal(Object.hasOwn(contract, "sqliteConnection"), false);
  });

  it("does not create draft or gameplay entities", () => {
    const contract = createNewGMModeDraftPrerequisiteContractShell();

    assert.equal(contract.gameplayStateCreated, false);
    assert.equal(contract.talentPoolsCreated, false);
    assert.equal(contract.rostersCreated, false);
    assert.equal(contract.championshipsCreated, false);
    assert.equal(contract.divisionsCreated, false);
    assert.equal(contract.matchesCreated, false);
    assert.equal(contract.showsCreated, false);
    assert.equal(contract.weeksCreated, false);
    assert.equal(Object.hasOwn(contract, "talentPool"), false);
    assert.equal(Object.hasOwn(contract, "rosterAssignment"), false);
    assert.equal(Object.hasOwn(contract, "championshipAssignment"), false);
    assert.equal(Object.hasOwn(contract, "divisionConstruction"), false);
    assert.equal(Object.hasOwn(contract, "matchSimulation"), false);
    assert.equal(Object.hasOwn(contract, "showBooking"), false);
    assert.equal(Object.hasOwn(contract, "weekState"), false);
  });

  it("does not execute draft logic or unlock Week 1", () => {
    const contract = createNewGMModeDraftPrerequisiteContractShell();

    assert.equal(contract.draftLogicExecuted, false);
    assert.equal(contract.brandRosterBalancingExecuted, false);
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
    const contract = createNewGMModeDraftPrerequisiteContractShell();

    assert.equal(contract.generatedTextCreated, false);
    assert.equal(contract.genAIUsed, false);
    assert.equal(Object.hasOwn(contract, "generatedText"), false);
    assert.equal(Object.hasOwn(contract, "genAIClient"), false);
    assert.equal(Object.hasOwn(contract, "prompt"), false);
    assert.equal(Object.hasOwn(contract, "narrative"), false);
  });

  it("stays deterministic across repeated calls", () => {
    const firstContract = createNewGMModeDraftPrerequisiteContractShell();
    const secondContract = createNewGMModeDraftPrerequisiteContractShell();

    assert.deepEqual(secondContract, firstContract);
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "new-gm-mode-draft-prerequisite-no-engine-change";
    const firstResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeDraftPrerequisiteContractShell();

    const secondResult = matchEngine.run(input, createSampleEngineContext(contextSeed, 7));
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });
});
