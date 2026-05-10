import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createNewGMModeDraftPickValidationContractShell
} from "../src/game/domain/index.ts";

describe("New GM Mode Draft Pick Validation Contract Shell v0.1", () => {
  it("reports stable shell ID, version, and diagnostics boundaries", () => {
    const contract = createNewGMModeDraftPickValidationContractShell();

    assert.equal(
      contract.draftPickValidationContractId,
      "new-gm-mode-draft-pick-validation-contract-v0.1"
    );
    assert.equal(contract.version, "0.1");
    assert.equal(contract.status, "diagnostics-only");
    assert.equal(contract.diagnosticsOnly, true);
    assert.equal(contract.playerFacing, false);
    assert.equal(contract.gameplayAffecting, false);
    assert.equal(contract.deterministicOrdering, true);
  });

  it("includes stable ordered validation requirement IDs", () => {
    const contract = createNewGMModeDraftPickValidationContractShell();

    assert.deepEqual(
      contract.orderedValidationRequirements.map((requirement) => requirement.id),
      [
        "draft-board-selection-prerequisite-summary-availability",
        "draft-board-display-readiness-availability",
        "draft-board-ordering-readiness-availability",
        "draft-board-input-readiness-availability",
        "talent-pool-readiness-availability",
        "selected-wrestler-identity-requirement",
        "selected-wrestler-display-ready-requirement",
        "selected-wrestler-draft-eligible-requirement",
        "selected-wrestler-availability-requirement",
        "selected-wrestler-not-excluded-requirement",
        "brand-eligibility-context-requirement",
        "roster-slot-context-requirement",
        "championship-division-compatibility-context-requirement",
        "draft-turn-context-requirement",
        "duplicate-pick-prevention-requirement",
        "future-draft-pick-execution-dependency",
        "blocked-concrete-pick-validation",
        "blocked-actual-draft-pick-execution"
      ]
    );
    assert.deepEqual(
      contract.orderedValidationRequirements.map((requirement) => requirement.slug),
      contract.orderedValidationRequirements.map((requirement) => requirement.id)
    );
  });

  it("keeps concrete pick validation and execution blocked", () => {
    const contract = createNewGMModeDraftPickValidationContractShell();

    assert.equal(contract.capabilityFlags.draftPickValidationContractAvailable, true);
    assert.equal(
      contract.capabilityFlags.draftPickValidationReadinessValidatorAvailable,
      true
    );
    assert.equal(
      contract.capabilityFlags.draftPickValidationReadinessSummaryAvailable,
      true
    );
    assert.equal(contract.capabilityFlags.concreteDraftPickValidationAvailable, false);
    assert.equal(contract.capabilityFlags.actualDraftPickExecutionAvailable, false);
    assert.equal(contract.capabilityFlags.draftTurnContextAvailable, false);
    assert.equal(contract.capabilityFlags.duplicatePickPreventionAvailable, false);
    assert.equal(contract.capabilityFlags.draftPickCreationAvailable, false);
    assert.equal(contract.selectedWrestlerChosen, false);
    assert.equal(contract.concreteDraftPickValidated, false);
    assert.equal(contract.draftPickCreated, false);
  });

  it("includes deterministic blocked reasons", () => {
    const contract = createNewGMModeDraftPickValidationContractShell();

    assert.deepEqual(contract.blockedReasons, [
      "draft-pick-validation-contract-only",
      "draft-board-selection-prerequisite-summary-required",
      "draft-board-display-readiness-required",
      "draft-board-ordering-readiness-required",
      "draft-board-input-readiness-required",
      "talent-pool-readiness-required",
      "selected-wrestler-identity-not-implemented",
      "selected-wrestler-display-ready-check-not-implemented",
      "selected-wrestler-draft-eligible-check-not-implemented",
      "selected-wrestler-availability-check-not-implemented",
      "selected-wrestler-exclusion-check-not-implemented",
      "brand-eligibility-context-not-implemented",
      "roster-slot-context-not-implemented",
      "championship-division-compatibility-context-not-implemented",
      "draft-turn-context-not-implemented",
      "duplicate-pick-prevention-not-implemented",
      "concrete-draft-pick-validation-not-implemented",
      "actual-draft-pick-execution-not-implemented",
      "draft-pick-creation-not-implemented",
      "draft-board-creation-not-implemented",
      "draft-board-ui-rendering-not-implemented",
      "roster-assignment-not-implemented",
      "championship-division-assignment-not-implemented",
      "gameplay-start-not-implemented",
      "gameplay-payload-persistence-not-implemented",
      "ui-wiring-not-implemented"
    ]);
  });
});
