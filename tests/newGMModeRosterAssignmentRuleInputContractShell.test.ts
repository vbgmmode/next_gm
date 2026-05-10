import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createNewGMModeRosterAssignmentRuleInputContractShell
} from "../src/game/domain/index.ts";

describe("New GM Mode Roster Assignment Rule Input Contract Shell v0.1", () => {
  it("reports stable shell ID, version, and diagnostics boundaries", () => {
    const contract = createNewGMModeRosterAssignmentRuleInputContractShell();

    assert.equal(
      contract.rosterAssignmentRuleInputContractId,
      "new-gm-mode-roster-assignment-rule-input-contract-v0.1"
    );
    assert.equal(contract.version, "0.1");
    assert.equal(contract.status, "diagnostics-only");
    assert.equal(contract.diagnosticsOnly, true);
    assert.equal(contract.playerFacing, false);
    assert.equal(contract.gameplayAffecting, false);
    assert.equal(contract.deterministicOrdering, true);
  });

  it("includes stable ordered rule input requirement IDs", () => {
    const contract = createNewGMModeRosterAssignmentRuleInputContractShell();

    assert.deepEqual(
      contract.orderedRuleInputRequirements.map((requirement) => requirement.id),
      [
        "roster-assignment-prerequisite-summary-availability",
        "draft-pick-execution-prerequisite-summary-availability",
        "draft-pick-validation-readiness-summary-availability",
        "selected-wrestler-identity-dependency",
        "executed-pick-dependency",
        "brand-assignment-context-dependency",
        "roster-slot-requirement-context",
        "roster-size-limit-context",
        "mens-division-slot-context",
        "womens-division-slot-context",
        "tag-division-slot-context",
        "role-category-compatibility-context",
        "championship-division-compatibility-context",
        "duplicate-roster-member-prevention-context",
        "future-roster-state-mutation-dependency",
        "future-roster-persistence-payload-dependency",
        "blocked-actual-roster-assignment"
      ]
    );
    assert.deepEqual(
      contract.orderedRuleInputRequirements.map((requirement) => requirement.slug),
      contract.orderedRuleInputRequirements.map((requirement) => requirement.id)
    );
  });

  it("keeps assignment rule inputs available only as a contract and blocks actual assignment", () => {
    const contract = createNewGMModeRosterAssignmentRuleInputContractShell();

    assert.equal(
      contract.capabilityFlags.rosterAssignmentRuleInputContractAvailable,
      true
    );
    assert.equal(
      contract.capabilityFlags.rosterAssignmentRuleInputReadinessValidatorAvailable,
      true
    );
    assert.equal(
      contract.capabilityFlags.rosterAssignmentRuleInputReadinessSummaryAvailable,
      true
    );
    assert.equal(
      contract.capabilityFlags.rosterAssignmentPrerequisiteSummaryAvailable,
      true
    );
    assert.equal(
      contract.capabilityFlags.selectedWrestlerIdentityDependencyAvailable,
      false
    );
    assert.equal(contract.capabilityFlags.executedPickDependencyAvailable, false);
    assert.equal(
      contract.capabilityFlags.brandAssignmentContextDependencyAvailable,
      false
    );
    assert.equal(
      contract.capabilityFlags.rosterSlotRequirementContextAvailable,
      false
    );
    assert.equal(contract.capabilityFlags.rosterSizeLimitContextAvailable, false);
    assert.equal(contract.capabilityFlags.mensDivisionSlotContextAvailable, false);
    assert.equal(contract.capabilityFlags.womensDivisionSlotContextAvailable, false);
    assert.equal(contract.capabilityFlags.tagDivisionSlotContextAvailable, false);
    assert.equal(
      contract.capabilityFlags.roleCategoryCompatibilityContextAvailable,
      false
    );
    assert.equal(
      contract.capabilityFlags.championshipDivisionCompatibilityContextAvailable,
      false
    );
    assert.equal(
      contract.capabilityFlags.duplicateRosterMemberPreventionContextAvailable,
      false
    );
    assert.equal(contract.capabilityFlags.futureRosterStateMutationAvailable, false);
    assert.equal(
      contract.capabilityFlags.futureRosterPersistencePayloadDependencyAvailable,
      false
    );
    assert.equal(contract.capabilityFlags.actualRosterAssignmentAvailable, false);
  });

  it("does not select, validate, execute, assign, create state, persist, or generate text", () => {
    const contract = createNewGMModeRosterAssignmentRuleInputContractShell();

    assert.equal(contract.selectedWrestlerChosen, false);
    assert.equal(contract.selectedWrestlerId, null);
    assert.equal(contract.selectedWrestlerIdentityAvailable, false);
    assert.equal(contract.concreteDraftPickValidated, false);
    assert.equal(contract.validatedPickAvailable, false);
    assert.equal(contract.draftPickCreated, false);
    assert.equal(contract.draftPickExecuted, false);
    assert.equal(contract.executedPickAvailable, false);
    assert.equal(contract.actualDraftBoardCreationAvailable, false);
    assert.equal(contract.draftBoardCreationAvailable, false);
    assert.equal(contract.draftBoardUiRenderingAvailable, false);
    assert.equal(contract.concreteDraftPickValidationAvailable, false);
    assert.equal(contract.actualDraftPickExecutionAvailable, false);
    assert.equal(contract.rosterAssignmentAvailable, false);
    assert.equal(contract.actualRosterAssignmentAvailable, false);
    assert.equal(contract.rosterStateAvailable, false);
    assert.equal(contract.rosterStateCreated, false);
    assert.equal(contract.championshipDivisionAssignmentAvailable, false);
    assert.equal(contract.gameplayPayloadPersistenceAvailable, false);
    assert.equal(contract.persistencePayloadsCreated, false);
    assert.equal(contract.generatedTextCreated, false);
    assert.equal(contract.genAIUsed, false);
  });

  it("includes deterministic blocked reasons", () => {
    const contract = createNewGMModeRosterAssignmentRuleInputContractShell();

    assert.deepEqual(contract.blockedReasons, [
      "roster-assignment-rule-input-contract-only",
      "roster-assignment-prerequisite-summary-required",
      "draft-pick-execution-prerequisite-summary-required",
      "draft-pick-validation-readiness-summary-required",
      "selected-wrestler-identity-not-implemented",
      "executed-pick-not-available",
      "brand-assignment-context-not-implemented",
      "roster-slot-requirement-context-not-implemented",
      "roster-size-limit-context-not-implemented",
      "mens-division-slot-context-not-implemented",
      "womens-division-slot-context-not-implemented",
      "tag-division-slot-context-not-implemented",
      "role-category-compatibility-context-not-implemented",
      "championship-division-compatibility-context-not-implemented",
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
