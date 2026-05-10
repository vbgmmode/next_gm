import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createNewGMModeDraftPickRosterAssignmentPrerequisiteContractShell
} from "../src/game/domain/index.ts";

describe("New GM Mode Draft Pick Roster Assignment Prerequisite Contract Shell v0.1", () => {
  it("reports stable shell ID, version, and diagnostics boundaries", () => {
    const contract =
      createNewGMModeDraftPickRosterAssignmentPrerequisiteContractShell();

    assert.equal(
      contract.draftPickRosterAssignmentPrerequisiteContractId,
      "new-gm-mode-draft-pick-roster-assignment-prerequisite-contract-v0.1"
    );
    assert.equal(contract.version, "0.1");
    assert.equal(contract.status, "diagnostics-only");
    assert.equal(contract.diagnosticsOnly, true);
    assert.equal(contract.playerFacing, false);
    assert.equal(contract.gameplayAffecting, false);
    assert.equal(contract.deterministicOrdering, true);
  });

  it("includes stable ordered roster assignment prerequisite IDs", () => {
    const contract =
      createNewGMModeDraftPickRosterAssignmentPrerequisiteContractShell();

    assert.deepEqual(
      contract.orderedRosterAssignmentPrerequisites.map(
        (prerequisite) => prerequisite.id
      ),
      [
        "draft-pick-execution-prerequisite-summary-availability",
        "draft-pick-validation-readiness-summary-availability",
        "draft-board-selection-prerequisite-summary-availability",
        "validated-pick-dependency",
        "executed-pick-dependency",
        "selected-wrestler-identity-dependency",
        "brand-assignment-context-dependency",
        "roster-slot-requirement-dependency",
        "roster-size-limit-dependency",
        "gender-division-compatibility-dependency",
        "role-category-compatibility-dependency",
        "championship-division-compatibility-dependency",
        "duplicate-roster-member-prevention-dependency",
        "future-roster-state-mutation-dependency",
        "future-roster-persistence-payload-dependency",
        "blocked-actual-roster-assignment"
      ]
    );
    assert.deepEqual(
      contract.orderedRosterAssignmentPrerequisites.map(
        (prerequisite) => prerequisite.slug
      ),
      contract.orderedRosterAssignmentPrerequisites.map(
        (prerequisite) => prerequisite.id
      )
    );
  });

  it("keeps roster assignment and every required assignment dependency blocked", () => {
    const contract =
      createNewGMModeDraftPickRosterAssignmentPrerequisiteContractShell();

    assert.equal(
      contract.capabilityFlags.draftPickRosterAssignmentPrerequisiteContractAvailable,
      true
    );
    assert.equal(
      contract.capabilityFlags.draftPickRosterAssignmentPrerequisiteSummaryAvailable,
      true
    );
    assert.equal(
      contract.capabilityFlags.draftPickExecutionPrerequisiteSummaryAvailable,
      true
    );
    assert.equal(contract.capabilityFlags.validatedPickDependencyAvailable, false);
    assert.equal(contract.capabilityFlags.executedPickDependencyAvailable, false);
    assert.equal(
      contract.capabilityFlags.selectedWrestlerIdentityDependencyAvailable,
      false
    );
    assert.equal(
      contract.capabilityFlags.brandAssignmentContextDependencyAvailable,
      false
    );
    assert.equal(
      contract.capabilityFlags.rosterSlotRequirementDependencyAvailable,
      false
    );
    assert.equal(
      contract.capabilityFlags.championshipDivisionCompatibilityDependencyAvailable,
      false
    );
    assert.equal(
      contract.capabilityFlags.duplicateRosterMemberPreventionDependencyAvailable,
      false
    );
    assert.equal(contract.capabilityFlags.futureRosterStateMutationAvailable, false);
    assert.equal(
      contract.capabilityFlags.futureRosterPersistencePayloadDependencyAvailable,
      false
    );
    assert.equal(contract.capabilityFlags.actualRosterAssignmentAvailable, false);
  });

  it("does not choose, validate, execute, assign, create state, persist, or generate text", () => {
    const contract =
      createNewGMModeDraftPickRosterAssignmentPrerequisiteContractShell();

    assert.equal(contract.selectedWrestlerChosen, false);
    assert.equal(contract.selectedWrestlerId, null);
    assert.equal(contract.concreteDraftPickValidated, false);
    assert.equal(contract.validatedPickAvailable, false);
    assert.equal(contract.draftPickCreated, false);
    assert.equal(contract.draftPickExecuted, false);
    assert.equal(contract.executedPickAvailable, false);
    assert.equal(contract.actualDraftBoardCreationAvailable, false);
    assert.equal(contract.draftBoardCreationAvailable, false);
    assert.equal(contract.draftBoardUiRenderingAvailable, false);
    assert.equal(contract.playerFacingDraftBoardAvailable, false);
    assert.equal(contract.concreteDraftPickValidationAvailable, false);
    assert.equal(contract.actualDraftPickExecutionAvailable, false);
    assert.equal(contract.draftPickValidationAvailable, false);
    assert.equal(contract.draftExecutionAvailable, false);
    assert.equal(contract.rosterAssignmentAvailable, false);
    assert.equal(contract.actualRosterAssignmentAvailable, false);
    assert.equal(contract.rosterStateMutationAvailable, false);
    assert.equal(contract.rosterStateCreated, false);
    assert.equal(contract.duplicateRosterMemberPreventionAvailable, false);
    assert.equal(contract.championshipDivisionAssignmentAvailable, false);
    assert.equal(contract.gameplayStartAvailable, false);
    assert.equal(contract.gameplayPayloadPersistenceAvailable, false);
    assert.equal(contract.uiWiringAvailable, false);
    assert.equal(contract.persistencePayloadsCreated, false);
    assert.equal(contract.generatedTextCreated, false);
    assert.equal(contract.genAIUsed, false);
  });

  it("includes deterministic blocked reasons", () => {
    const contract =
      createNewGMModeDraftPickRosterAssignmentPrerequisiteContractShell();

    assert.deepEqual(contract.blockedReasons, [
      "draft-pick-roster-assignment-prerequisite-contract-only",
      "draft-pick-execution-prerequisite-summary-required",
      "draft-pick-validation-readiness-summary-required",
      "draft-board-selection-prerequisite-summary-required",
      "validated-pick-not-available",
      "executed-pick-not-available",
      "selected-wrestler-identity-not-implemented",
      "brand-assignment-context-not-implemented",
      "roster-slot-requirement-not-implemented",
      "roster-size-limit-not-implemented",
      "gender-division-compatibility-not-implemented",
      "role-category-compatibility-not-implemented",
      "championship-division-compatibility-not-implemented",
      "duplicate-roster-member-prevention-not-implemented",
      "future-roster-state-mutation-not-implemented",
      "gameplay-payload-persistence-not-implemented",
      "actual-roster-assignment-not-implemented",
      "roster-state-creation-not-implemented",
      "draft-pick-creation-not-implemented",
      "draft-pick-validation-not-implemented",
      "draft-pick-execution-not-implemented",
      "draft-board-creation-not-implemented",
      "draft-board-ui-rendering-not-implemented",
      "championship-division-assignment-not-implemented",
      "match-show-week-state-not-implemented",
      "save-creation-not-implemented",
      "sqlite-write-not-implemented",
      "generated-text-not-implemented",
      "genai-not-implemented"
    ]);
  });
});
