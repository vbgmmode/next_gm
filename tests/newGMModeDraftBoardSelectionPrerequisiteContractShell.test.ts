import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createNewGMModeDraftBoardSelectionPrerequisiteContractShell
} from "../src/game/domain/index.ts";

describe("New GM Mode Draft Board Selection Prerequisite Contract Shell v0.1", () => {
  it("reports stable shell ID, version, and diagnostics boundaries", () => {
    const contract = createNewGMModeDraftBoardSelectionPrerequisiteContractShell();

    assert.equal(
      contract.draftBoardSelectionPrerequisiteContractId,
      "new-gm-mode-draft-board-selection-prerequisite-contract-v0.1"
    );
    assert.equal(contract.version, "0.1");
    assert.equal(contract.status, "diagnostics-only");
    assert.equal(contract.diagnosticsOnly, true);
    assert.equal(contract.playerFacing, false);
    assert.equal(contract.gameplayAffecting, false);
    assert.equal(contract.deterministicOrdering, true);
  });

  it("includes stable ordered selection prerequisite IDs", () => {
    const contract = createNewGMModeDraftBoardSelectionPrerequisiteContractShell();

    assert.deepEqual(
      contract.orderedPrerequisites.map((prerequisite) => prerequisite.id),
      [
        "draft-board-display-readiness-summary-availability",
        "draft-board-ordering-summary-availability",
        "draft-board-eligibility-input-summary-availability",
        "talent-pool-readiness-availability",
        "display-ready-eligible-entries-availability",
        "selected-wrestler-identity-requirement",
        "selected-wrestler-display-ready-requirement",
        "selected-wrestler-draft-eligible-requirement",
        "selected-wrestler-available-requirement",
        "selected-wrestler-not-excluded-ineligible-requirement",
        "brand-eligibility-context-requirement",
        "roster-slot-context-requirement",
        "championship-division-compatibility-context-requirement",
        "future-draft-pick-validation-dependency",
        "blocked-actual-draft-pick-validation",
        "blocked-actual-draft-pick-execution"
      ]
    );
    assert.deepEqual(
      contract.orderedPrerequisites.map((prerequisite) => prerequisite.slug),
      contract.orderedPrerequisites.map((prerequisite) => prerequisite.id)
    );
  });

  it("keeps actual selection, pick validation, and pick execution blocked", () => {
    const contract = createNewGMModeDraftBoardSelectionPrerequisiteContractShell();

    assert.deepEqual(contract.blockedReasons, [
      "draft-board-selection-prerequisite-contract-only",
      "draft-board-display-readiness-summary-required",
      "draft-board-ordering-summary-required",
      "draft-board-eligibility-input-summary-required",
      "talent-pool-readiness-required",
      "display-ready-eligible-entries-required",
      "selected-wrestler-identity-not-implemented",
      "selected-wrestler-display-ready-check-not-implemented",
      "selected-wrestler-draft-eligible-check-not-implemented",
      "selected-wrestler-availability-check-not-implemented",
      "excluded-ineligible-wrestler-selection-check-not-implemented",
      "brand-eligibility-context-not-implemented",
      "roster-slot-context-not-implemented",
      "championship-division-compatibility-context-not-implemented",
      "actual-draft-pick-validation-not-implemented",
      "actual-draft-pick-execution-not-implemented",
      "draft-board-creation-not-implemented",
      "draft-board-ui-rendering-not-implemented",
      "roster-assignment-not-implemented",
      "championship-division-assignment-not-implemented",
      "gameplay-start-not-implemented",
      "gameplay-payload-persistence-not-implemented",
      "ui-wiring-not-implemented"
    ]);
    assert.equal(
      contract.capabilityFlags.draftBoardSelectionPrerequisiteContractAvailable,
      true
    );
    assert.equal(
      contract.capabilityFlags.draftBoardSelectionPrerequisiteSummaryAvailable,
      true
    );
    assert.equal(contract.capabilityFlags.selectedWrestlerIdentitySelectionAvailable, false);
    assert.equal(contract.capabilityFlags.actualDraftPickValidationAvailable, false);
    assert.equal(contract.capabilityFlags.actualDraftPickExecutionAvailable, false);
    assert.equal(contract.selectedWrestlerChosen, false);
    assert.equal(contract.draftPickValidationAvailable, false);
    assert.equal(contract.draftExecutionAvailable, false);
  });

  it("does not expose UI, generated text, or GenAI behavior", () => {
    const contract = createNewGMModeDraftBoardSelectionPrerequisiteContractShell();

    assert.equal(contract.draftBoardUiRenderingAvailable, false);
    assert.equal(contract.playerFacingDraftBoardAvailable, false);
    assert.equal(contract.uiWiringAvailable, false);
    assert.equal(contract.generatedTextCreated, false);
    assert.equal(contract.genAIUsed, false);
  });
});
