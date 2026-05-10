import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createNewGMModeRosterAssignmentResultShapeContractShell
} from "../src/game/domain/index.ts";

describe("New GM Mode Roster Assignment Result Shape Contract Shell v0.1", () => {
  it("reports stable shell ID, version, and diagnostics boundaries", () => {
    const contract = createNewGMModeRosterAssignmentResultShapeContractShell();

    assert.equal(
      contract.rosterAssignmentResultShapeContractId,
      "new-gm-mode-roster-assignment-result-shape-contract-v0.1"
    );
    assert.equal(contract.version, "0.1");
    assert.equal(contract.status, "diagnostics-only");
    assert.equal(contract.diagnosticsOnly, true);
    assert.equal(contract.playerFacing, false);
    assert.equal(contract.gameplayAffecting, false);
    assert.equal(contract.deterministicOrdering, true);
  });

  it("includes stable ordered result-shape requirement IDs", () => {
    const contract = createNewGMModeRosterAssignmentResultShapeContractShell();

    assert.deepEqual(
      contract.orderedResultShapeRequirements.map((requirement) => requirement.id),
      [
        "roster-assignment-rule-evaluation-readiness-availability",
        "executed-draft-pick-reference",
        "selected-wrestler-identity-reference",
        "target-brand-reference",
        "assignment-decision-status",
        "assignment-blocked-reason-list",
        "roster-slot-assignment-preview",
        "gender-division-assignment-preview",
        "role-category-assignment-preview",
        "championship-division-compatibility-preview",
        "duplicate-roster-membership-prevention-result",
        "roster-size-guard-result",
        "future-roster-mutation-transaction-marker",
        "future-save-payload-compatibility-marker",
        "blocked-actual-roster-mutation"
      ]
    );
    assert.equal(contract.resultShapeRequirementCount, 15);
    assert.deepEqual(
      contract.orderedResultShapeRequirements.map((requirement) => requirement.slug),
      contract.orderedResultShapeRequirements.map((requirement) => requirement.id)
    );
  });

  it("exposes contract capability flags while result creation and roster mutation remain unavailable", () => {
    const contract = createNewGMModeRosterAssignmentResultShapeContractShell();

    assert.equal(
      contract.capabilityFlags.rosterAssignmentResultShapeContractAvailable,
      true
    );
    assert.equal(
      contract.capabilityFlags.rosterAssignmentResultShapeReadinessValidatorAvailable,
      true
    );
    assert.equal(
      contract.capabilityFlags.rosterAssignmentResultShapeSummaryAvailable,
      true
    );
    assert.equal(
      contract.capabilityFlags.rosterAssignmentRuleEvaluationReadinessAvailable,
      true
    );
    assert.equal(contract.capabilityFlags.assignmentResultObjectCreationAvailable, false);
    assert.equal(
      contract.capabilityFlags.actualRosterAssignmentResultCreationAvailable,
      false
    );
    assert.equal(contract.capabilityFlags.actualRosterMutationAvailable, false);
    assert.equal(contract.capabilityFlags.rosterStateMutationAvailable, false);
  });

  it("does not create an assignment result, handle a wrestler, execute a pick, mutate roster state, persist, or generate text", () => {
    const contract = createNewGMModeRosterAssignmentResultShapeContractShell();

    assert.equal(contract.assignmentResultObjectCreated, false);
    assert.equal(contract.assignmentResultObjectAvailable, false);
    assert.equal(contract.actualRosterAssignmentResultCreationAvailable, false);
    assert.equal(contract.selectedWrestlerChosen, false);
    assert.equal(contract.selectedWrestlerId, null);
    assert.equal(contract.selectedWrestlerIdentityAvailable, false);
    assert.equal(contract.selectedWrestlerHandled, false);
    assert.equal(contract.concreteDraftPickValidated, false);
    assert.equal(contract.draftPickCreated, false);
    assert.equal(contract.draftPickExecuted, false);
    assert.equal(contract.executedPickAvailable, false);
    assert.equal(contract.rosterAssignmentAvailable, false);
    assert.equal(contract.actualRosterAssignmentAvailable, false);
    assert.equal(contract.rosterStateMutationAvailable, false);
    assert.equal(contract.actualRosterMutationAvailable, false);
    assert.equal(contract.rosterStateAvailable, false);
    assert.equal(contract.rosterStateCreated, false);
    assert.equal(contract.championshipDivisionAssignmentAvailable, false);
    assert.equal(contract.saveCreated, false);
    assert.equal(contract.sqliteWritten, false);
    assert.equal(contract.persistencePayloadsCreated, false);
    assert.equal(contract.generatedTextCreated, false);
    assert.equal(contract.genAIUsed, false);
    assert.equal(Object.hasOwn(contract, "assignmentResult"), false);
    assert.equal(Object.hasOwn(contract, "selectedWrestler"), false);
    assert.equal(Object.hasOwn(contract, "draftPick"), false);
    assert.equal(Object.hasOwn(contract, "roster"), false);
    assert.equal(Object.hasOwn(contract, "rosterAssignment"), false);
    assert.equal(Object.hasOwn(contract, "championshipAssignment"), false);
    assert.equal(Object.hasOwn(contract, "divisionAssignment"), false);
    assert.equal(Object.hasOwn(contract, "persistencePayload"), false);
    assert.equal(Object.hasOwn(contract, "generatedText"), false);
    assert.equal(Object.hasOwn(contract, "genAIClient"), false);
  });

  it("includes deterministic blocked reasons", () => {
    const contract = createNewGMModeRosterAssignmentResultShapeContractShell();

    assert.deepEqual(contract.blockedReasons, [
      "roster-assignment-result-shape-contract-only",
      "roster-assignment-rule-evaluation-readiness-required",
      "executed-draft-pick-reference-not-implemented",
      "selected-wrestler-identity-reference-not-implemented",
      "target-brand-reference-not-implemented",
      "assignment-decision-status-not-implemented",
      "assignment-blocked-reason-list-not-implemented",
      "roster-slot-assignment-preview-not-implemented",
      "gender-division-assignment-preview-not-implemented",
      "role-category-assignment-preview-not-implemented",
      "championship-division-compatibility-preview-not-implemented",
      "duplicate-roster-membership-prevention-result-not-implemented",
      "roster-size-guard-result-not-implemented",
      "future-roster-mutation-transaction-marker-not-implemented",
      "future-save-payload-compatibility-marker-not-implemented",
      "actual-assignment-result-creation-not-implemented",
      "actual-roster-mutation-not-implemented",
      "draft-pick-creation-not-implemented",
      "draft-pick-validation-not-implemented",
      "draft-pick-execution-not-implemented",
      "roster-assignment-not-implemented",
      "roster-state-creation-not-implemented",
      "championship-division-assignment-not-implemented",
      "match-show-week-state-not-implemented",
      "save-creation-not-implemented",
      "sqlite-write-not-implemented",
      "generated-text-not-implemented",
      "genai-not-implemented"
    ]);
  });
});
