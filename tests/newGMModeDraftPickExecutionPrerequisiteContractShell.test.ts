import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createNewGMModeDraftPickExecutionPrerequisiteContractShell
} from "../src/game/domain/index.ts";

describe("New GM Mode Draft Pick Execution Prerequisite Contract Shell v0.1", () => {
  it("reports stable shell ID, version, and diagnostics boundaries", () => {
    const contract = createNewGMModeDraftPickExecutionPrerequisiteContractShell();

    assert.equal(
      contract.draftPickExecutionPrerequisiteContractId,
      "new-gm-mode-draft-pick-execution-prerequisite-contract-v0.1"
    );
    assert.equal(contract.version, "0.1");
    assert.equal(contract.status, "diagnostics-only");
    assert.equal(contract.diagnosticsOnly, true);
    assert.equal(contract.playerFacing, false);
    assert.equal(contract.gameplayAffecting, false);
    assert.equal(contract.deterministicOrdering, true);
  });

  it("includes stable ordered execution prerequisite IDs", () => {
    const contract = createNewGMModeDraftPickExecutionPrerequisiteContractShell();

    assert.deepEqual(
      contract.orderedExecutionPrerequisites.map((prerequisite) => prerequisite.id),
      [
        "draft-pick-validation-readiness-summary-availability",
        "draft-board-selection-prerequisite-summary-availability",
        "draft-board-display-readiness-summary-availability",
        "draft-board-ordering-summary-availability",
        "draft-board-input-readiness-availability",
        "talent-pool-readiness-availability",
        "validated-pick-dependency",
        "selected-wrestler-identity-dependency",
        "selected-wrestler-draft-eligibility-dependency",
        "selected-wrestler-availability-dependency",
        "duplicate-pick-prevention-dependency",
        "draft-turn-context-dependency",
        "brand-assignment-context-dependency",
        "roster-slot-context-dependency",
        "championship-division-compatibility-context-dependency",
        "future-roster-assignment-dependency",
        "future-draft-state-mutation-dependency",
        "future-persistence-payload-dependency",
        "blocked-actual-pick-execution"
      ]
    );
    assert.deepEqual(
      contract.orderedExecutionPrerequisites.map(
        (prerequisite) => prerequisite.slug
      ),
      contract.orderedExecutionPrerequisites.map((prerequisite) => prerequisite.id)
    );
  });

  it("keeps pick execution and every required execution dependency blocked", () => {
    const contract = createNewGMModeDraftPickExecutionPrerequisiteContractShell();

    assert.equal(
      contract.capabilityFlags.draftPickExecutionPrerequisiteContractAvailable,
      true
    );
    assert.equal(
      contract.capabilityFlags.draftPickExecutionPrerequisiteSummaryAvailable,
      true
    );
    assert.equal(contract.capabilityFlags.validatedPickDependencyAvailable, false);
    assert.equal(
      contract.capabilityFlags.selectedWrestlerIdentityDependencyAvailable,
      false
    );
    assert.equal(
      contract.capabilityFlags.duplicatePickPreventionDependencyAvailable,
      false
    );
    assert.equal(contract.capabilityFlags.draftTurnContextDependencyAvailable, false);
    assert.equal(contract.capabilityFlags.brandAssignmentContextAvailable, false);
    assert.equal(
      contract.capabilityFlags.futureRosterAssignmentDependencyAvailable,
      false
    );
    assert.equal(contract.capabilityFlags.draftStateMutationAvailable, false);
    assert.equal(
      contract.capabilityFlags.futurePersistencePayloadDependencyAvailable,
      false
    );
    assert.equal(contract.capabilityFlags.actualDraftPickExecutionAvailable, false);
    assert.equal(contract.selectedWrestlerChosen, false);
    assert.equal(contract.selectedWrestlerId, null);
    assert.equal(contract.concreteDraftPickValidated, false);
    assert.equal(contract.validatedPickAvailable, false);
    assert.equal(contract.draftPickCreated, false);
    assert.equal(contract.draftPickExecuted, false);
  });

  it("includes deterministic blocked reasons", () => {
    const contract = createNewGMModeDraftPickExecutionPrerequisiteContractShell();

    assert.deepEqual(contract.blockedReasons, [
      "draft-pick-execution-prerequisite-contract-only",
      "draft-pick-validation-readiness-summary-required",
      "draft-board-selection-prerequisite-summary-required",
      "draft-board-display-readiness-summary-required",
      "draft-board-ordering-summary-required",
      "draft-board-input-readiness-required",
      "talent-pool-readiness-required",
      "validated-pick-not-available",
      "selected-wrestler-identity-not-implemented",
      "selected-wrestler-draft-eligible-check-not-implemented",
      "selected-wrestler-availability-check-not-implemented",
      "duplicate-pick-prevention-not-implemented",
      "draft-turn-context-not-implemented",
      "brand-assignment-context-not-implemented",
      "roster-slot-context-not-implemented",
      "championship-division-compatibility-context-not-implemented",
      "future-roster-assignment-not-implemented",
      "draft-state-mutation-not-implemented",
      "gameplay-payload-persistence-not-implemented",
      "actual-draft-pick-execution-not-implemented",
      "draft-pick-creation-not-implemented",
      "draft-board-creation-not-implemented",
      "draft-board-ui-rendering-not-implemented",
      "roster-assignment-not-implemented",
      "championship-division-assignment-not-implemented",
      "gameplay-start-not-implemented",
      "ui-wiring-not-implemented"
    ]);
  });
});
