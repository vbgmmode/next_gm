import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createNewGMModeRosterAssignmentRuleEvaluationContractShell
} from "../src/game/domain/index.ts";

describe("New GM Mode Roster Assignment Rule Evaluation Contract Shell v0.1", () => {
  it("reports stable shell ID, version, and diagnostics boundaries", () => {
    const contract =
      createNewGMModeRosterAssignmentRuleEvaluationContractShell();

    assert.equal(
      contract.rosterAssignmentRuleEvaluationContractId,
      "new-gm-mode-roster-assignment-rule-evaluation-contract-v0.1"
    );
    assert.equal(contract.version, "0.1");
    assert.equal(contract.status, "diagnostics-only");
    assert.equal(contract.diagnosticsOnly, true);
    assert.equal(contract.playerFacing, false);
    assert.equal(contract.gameplayAffecting, false);
    assert.equal(contract.deterministicOrdering, true);
  });

  it("includes stable ordered evaluation rule IDs", () => {
    const contract =
      createNewGMModeRosterAssignmentRuleEvaluationContractShell();

    assert.deepEqual(
      contract.orderedEvaluationRules.map((rule) => rule.id),
      [
        "roster-assignment-rule-input-readiness-availability",
        "executed-draft-pick-prerequisite",
        "selected-wrestler-identity-prerequisite",
        "target-brand-roster-context-prerequisite",
        "roster-slot-availability-check",
        "duplicate-roster-membership-prevention",
        "gender-division-compatibility-check",
        "role-category-compatibility-check",
        "championship-division-compatibility-check",
        "tag-division-team-compatibility-placeholder",
        "minimum-maximum-roster-size-guard",
        "future-roster-mutation-transaction-boundary",
        "future-save-payload-compatibility-marker",
        "blocked-actual-roster-assignment-evaluation",
        "blocked-roster-state-mutation"
      ]
    );
    assert.equal(contract.evaluationRuleCount, 15);
    assert.deepEqual(
      contract.orderedEvaluationRules.map((rule) => rule.slug),
      contract.orderedEvaluationRules.map((rule) => rule.id)
    );
  });

  it("exposes availability flags while actual rule evaluation and roster mutation remain unavailable", () => {
    const contract =
      createNewGMModeRosterAssignmentRuleEvaluationContractShell();

    assert.equal(
      contract.capabilityFlags.rosterAssignmentRuleEvaluationContractAvailable,
      true
    );
    assert.equal(
      contract.capabilityFlags.rosterAssignmentRuleEvaluationReadinessValidatorAvailable,
      true
    );
    assert.equal(
      contract.capabilityFlags.rosterAssignmentRuleEvaluationSummaryAvailable,
      true
    );
    assert.equal(
      contract.capabilityFlags.rosterAssignmentRuleInputReadinessAvailable,
      true
    );
    assert.equal(
      contract.capabilityFlags.actualRosterAssignmentRuleEvaluationAvailable,
      false
    );
    assert.equal(contract.capabilityFlags.rosterStateMutationAvailable, false);
    assert.equal(
      contract.capabilityFlags.futureRosterMutationTransactionBoundaryAvailable,
      false
    );
    assert.equal(
      contract.capabilityFlags.futureSavePayloadCompatibilityMarkerAvailable,
      false
    );
  });

  it("does not evaluate a selected wrestler, execute a pick, assign roster state, persist, or generate text", () => {
    const contract =
      createNewGMModeRosterAssignmentRuleEvaluationContractShell();

    assert.equal(contract.selectedWrestlerChosen, false);
    assert.equal(contract.selectedWrestlerId, null);
    assert.equal(contract.selectedWrestlerIdentityAvailable, false);
    assert.equal(contract.concreteSelectedWrestlerEvaluated, false);
    assert.equal(contract.concreteDraftPickValidated, false);
    assert.equal(contract.draftPickCreated, false);
    assert.equal(contract.draftPickExecuted, false);
    assert.equal(contract.executedPickAvailable, false);
    assert.equal(contract.actualRuleEvaluationAvailable, false);
    assert.equal(contract.actualRosterAssignmentRuleEvaluationAvailable, false);
    assert.equal(contract.rosterAssignmentAvailable, false);
    assert.equal(contract.actualRosterAssignmentAvailable, false);
    assert.equal(contract.rosterStateMutationAvailable, false);
    assert.equal(contract.rosterStateAvailable, false);
    assert.equal(contract.rosterStateCreated, false);
    assert.equal(contract.championshipDivisionAssignmentAvailable, false);
    assert.equal(contract.saveCreated, false);
    assert.equal(contract.sqliteWritten, false);
    assert.equal(contract.persistencePayloadsCreated, false);
    assert.equal(contract.generatedTextCreated, false);
    assert.equal(contract.genAIUsed, false);
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
    const contract =
      createNewGMModeRosterAssignmentRuleEvaluationContractShell();

    assert.deepEqual(contract.blockedReasons, [
      "roster-assignment-rule-evaluation-contract-only",
      "roster-assignment-rule-input-readiness-required",
      "executed-draft-pick-prerequisite-required",
      "selected-wrestler-identity-not-implemented",
      "target-brand-roster-context-not-implemented",
      "roster-slot-availability-check-not-implemented",
      "duplicate-roster-membership-prevention-not-implemented",
      "gender-division-compatibility-check-not-implemented",
      "role-category-compatibility-check-not-implemented",
      "championship-division-compatibility-check-not-implemented",
      "tag-division-team-compatibility-not-implemented",
      "minimum-maximum-roster-size-guard-not-implemented",
      "future-roster-mutation-transaction-boundary-not-implemented",
      "future-save-payload-compatibility-not-implemented",
      "actual-roster-assignment-evaluation-not-implemented",
      "roster-state-mutation-not-implemented",
      "draft-pick-creation-not-implemented",
      "draft-pick-validation-not-implemented",
      "draft-pick-execution-not-implemented",
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
