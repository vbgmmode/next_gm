import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, it } from "node:test";

import {
  createNewGMModeRosterMutationBoundaryContractShell
} from "../src/game/domain/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const UNTOUCHED_MUTATION_BOUNDARY_DATABASE =
  "data/saves/__new-gm-mode-roster-mutation-boundary-should-not-exist.sqlite";
const mutationBoundaryContract =
  createNewGMModeRosterMutationBoundaryContractShell();

describe("New GM Mode Roster Mutation Boundary Contract Shell v0.1", () => {
  it("reports stable shell ID, version, and diagnostics boundaries", () => {
    const contract = mutationBoundaryContract;

    assert.equal(
      contract.rosterMutationBoundaryContractId,
      "new-gm-mode-roster-mutation-boundary-contract-v0.1"
    );
    assert.equal(contract.version, "0.1");
    assert.equal(contract.status, "diagnostics-only");
    assert.equal(contract.diagnosticsOnly, true);
    assert.equal(contract.playerFacing, false);
    assert.equal(contract.gameplayAffecting, false);
    assert.equal(contract.deterministicOrdering, true);
  });

  it("includes stable ordered mutation-boundary requirement IDs", () => {
    const contract = mutationBoundaryContract;

    assert.deepEqual(
      contract.orderedMutationBoundaryRequirements.map(
        (requirement) => requirement.id
      ),
      [
        "roster-assignment-handoff-availability",
        "assignment-result-shape-readiness-availability",
        "rule-evaluation-readiness-availability",
        "executed-draft-pick-reference-prerequisite",
        "selected-wrestler-identity-prerequisite",
        "target-brand-roster-context-prerequisite",
        "roster-state-read-prerequisite",
        "duplicate-roster-membership-guard",
        "roster-slot-capacity-guard",
        "gender-division-compatibility-guard",
        "championship-division-compatibility-guard",
        "transaction-atomicity-requirement",
        "rollback-error-result-requirement",
        "future-save-payload-compatibility-marker",
        "blocked-actual-roster-mutation"
      ]
    );
    assert.equal(contract.mutationBoundaryRequirementCount, 15);
    assert.deepEqual(
      contract.orderedMutationBoundaryRequirements.map(
        (requirement) => requirement.slug
      ),
      contract.orderedMutationBoundaryRequirements.map(
        (requirement) => requirement.id
      )
    );
  });

  it("surfaces upstream readiness and fixture counts while mutation remains blocked", () => {
    const contract = mutationBoundaryContract;

    assert.equal(contract.rosterAssignmentHandoffAvailable, true);
    assert.equal(contract.rosterAssignmentHandoffStructurallyReady, true);
    assert.equal(contract.assignmentResultShapeReadinessAvailable, true);
    assert.equal(
      contract.assignmentResultShapeReadinessStructurallySatisfied,
      true
    );
    assert.equal(contract.ruleEvaluationReadinessAvailable, true);
    assert.equal(contract.ruleEvaluationReadinessStructurallySatisfied, true);
    assert.equal(contract.assignmentInputReadinessAvailable, true);
    assert.equal(contract.assignmentInputReadinessStructurallySatisfied, true);
    assert.equal(contract.draftPickExecutionPrerequisiteAvailable, true);
    assert.equal(
      contract.draftPickExecutionPrerequisiteStructurallySatisfied,
      true
    );
    assert.equal(contract.rosterSlotRequirementAvailable, true);
    assert.equal(contract.championshipDivisionRequirementAvailable, true);
    assert.equal(contract.futureRosterMutationBoundaryAvailable, false);
    assert.deepEqual(contract.fixtureHandoffCounts, {
      totalFixtureCount: 245,
      eligibleDisplayReadyCount: 235,
      excludedIneligibleCount: 10,
      expectedFixtureCount: 245,
      expectedEligibleDisplayReadyCount: 235,
      expectedExcludedIneligibleCount: 10
    });
  });

  it("keeps mutation, roster state creation, assignment result creation, and persistence unavailable", () => {
    const contract = mutationBoundaryContract;

    assert.equal(contract.capabilityFlags.rosterMutationBoundaryContractAvailable, true);
    assert.equal(contract.capabilityFlags.rosterAssignmentHandoffSummaryAvailable, true);
    assert.equal(contract.capabilityFlags.rosterMutationTransactionAvailable, false);
    assert.equal(contract.capabilityFlags.rosterStateReadAvailable, false);
    assert.equal(contract.capabilityFlags.rosterStateCreationAvailable, false);
    assert.equal(contract.capabilityFlags.assignmentResultObjectCreationAvailable, false);
    assert.equal(
      contract.capabilityFlags.actualRosterAssignmentResultCreationAvailable,
      false
    );
    assert.equal(contract.capabilityFlags.actualRosterMutationAvailable, false);
    assert.equal(contract.capabilityFlags.futureSavePayloadCompatibilityAvailable, false);
    assert.equal(contract.assignmentResultObjectCreated, false);
    assert.equal(contract.assignmentResultObjectAvailable, false);
    assert.equal(contract.actualRosterAssignmentResultCreationAvailable, false);
    assert.equal(contract.rosterStateReadAvailable, false);
    assert.equal(contract.rosterStateMutationAvailable, false);
    assert.equal(contract.actualRosterMutationAvailable, false);
    assert.equal(contract.rosterMutationTransactionAvailable, false);
    assert.equal(contract.rosterStateAvailable, false);
    assert.equal(contract.rosterStateCreated, false);
    assert.equal(contract.futureSavePayloadCompatibilityAvailable, false);
    assert.equal(contract.persistencePayloadsCreated, false);
  });

  it("does not handle selected wrestlers, create picks, assign rosters, mutate state, persist, add UI, or generate text", () => {
    const contract = mutationBoundaryContract;

    assert.equal(contract.selectedWrestlerChosen, false);
    assert.equal(contract.selectedWrestlerId, null);
    assert.equal(contract.selectedWrestlerIdentityAvailable, false);
    assert.equal(contract.selectedWrestlerHandled, false);
    assert.equal(contract.concreteSelectedWrestlerEvaluated, false);
    assert.equal(contract.concreteDraftPickValidated, false);
    assert.equal(contract.validatedPickAvailable, false);
    assert.equal(contract.draftPickCreated, false);
    assert.equal(contract.draftPickExecuted, false);
    assert.equal(contract.executedPickAvailable, false);
    assert.equal(contract.actualRuleEvaluationAvailable, false);
    assert.equal(contract.actualRosterAssignmentRuleEvaluationAvailable, false);
    assert.equal(contract.rosterAssignmentAvailable, false);
    assert.equal(contract.actualRosterAssignmentAvailable, false);
    assert.equal(contract.championshipDivisionAssignmentAvailable, false);
    assert.equal(contract.saveCreated, false);
    assert.equal(contract.sqliteWritten, false);
    assert.equal(contract.sqliteDatabaseOpened, false);
    assert.equal(existsSync(UNTOUCHED_MUTATION_BOUNDARY_DATABASE), false);
    assert.equal(contract.gameplayStateCreated, false);
    assert.equal(contract.draftPicksCreated, false);
    assert.equal(contract.draftPickValidationExecuted, false);
    assert.equal(contract.draftExecutionExecuted, false);
    assert.equal(contract.rosterAssignmentsCreated, false);
    assert.equal(contract.championshipAssignmentsCreated, false);
    assert.equal(contract.divisionAssignmentsCreated, false);
    assert.equal(contract.matchesCreated, false);
    assert.equal(contract.showsCreated, false);
    assert.equal(contract.weeksCreated, false);
    assert.equal(contract.weekOneUnlocked, false);
    assert.equal(contract.generatedTextCreated, false);
    assert.equal(contract.genAIUsed, false);
    assert.equal(Object.hasOwn(contract, "assignmentResult"), false);
    assert.equal(Object.hasOwn(contract, "selectedWrestler"), false);
    assert.equal(Object.hasOwn(contract, "draftPick"), false);
    assert.equal(Object.hasOwn(contract, "roster"), false);
    assert.equal(Object.hasOwn(contract, "rosterAssignment"), false);
    assert.equal(Object.hasOwn(contract, "championshipAssignment"), false);
    assert.equal(Object.hasOwn(contract, "divisionAssignment"), false);
    assert.equal(Object.hasOwn(contract, "matchState"), false);
    assert.equal(Object.hasOwn(contract, "showState"), false);
    assert.equal(Object.hasOwn(contract, "weekState"), false);
    assert.equal(Object.hasOwn(contract, "persistencePayload"), false);
    assert.equal(Object.hasOwn(contract, "generatedText"), false);
    assert.equal(Object.hasOwn(contract, "genAIClient"), false);
  });

  it("includes deterministic blocked reasons", () => {
    const contract = mutationBoundaryContract;

    assert.deepEqual(contract.blockedReasons, [
      "roster-mutation-boundary-contract-only",
      "roster-assignment-handoff-required",
      "assignment-result-shape-readiness-required",
      "rule-evaluation-readiness-required",
      "executed-draft-pick-reference-not-implemented",
      "selected-wrestler-identity-not-implemented",
      "target-brand-roster-context-not-implemented",
      "roster-state-read-not-implemented",
      "duplicate-roster-membership-guard-not-implemented",
      "roster-slot-capacity-guard-not-implemented",
      "gender-division-compatibility-guard-not-implemented",
      "championship-division-compatibility-guard-not-implemented",
      "transaction-atomicity-not-implemented",
      "rollback-error-result-not-implemented",
      "future-save-payload-compatibility-not-implemented",
      "actual-roster-mutation-not-implemented",
      "assignment-result-object-creation-not-implemented",
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

  it("exports the mutation boundary shell from the domain index", () => {
    assert.equal(
      typeof createNewGMModeRosterMutationBoundaryContractShell,
      "function"
    );
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed =
      "new-gm-mode-roster-mutation-boundary-contract-no-engine-change";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createNewGMModeRosterMutationBoundaryContractShell();

    const secondResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });
});
