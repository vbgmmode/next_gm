import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createNewGMModeDraftBoardOrderingContractShell
} from "../src/game/domain/index.ts";

describe("New GM Mode Draft Board Ordering Contract Shell v0.1", () => {
  it("reports stable shell ID, version, and diagnostics boundaries", () => {
    const contract = createNewGMModeDraftBoardOrderingContractShell();

    assert.equal(
      contract.draftBoardOrderingContractId,
      "new-gm-mode-draft-board-ordering-contract-v0.1"
    );
    assert.equal(contract.version, "0.1");
    assert.equal(contract.status, "diagnostics-only");
    assert.equal(contract.diagnosticsOnly, true);
    assert.equal(contract.playerFacing, false);
    assert.equal(contract.gameplayAffecting, false);
    assert.equal(contract.deterministicOrdering, true);
  });

  it("includes stable ordered draft board ordering requirement IDs", () => {
    const contract = createNewGMModeDraftBoardOrderingContractShell();

    assert.deepEqual(
      contract.orderedRequirements.map((requirement) => requirement.id),
      [
        "draft-board-eligibility-input-summary-availability",
        "talent-pool-readiness-availability",
        "eligible-wrestler-list-availability",
        "stable-eligible-wrestler-ordering",
        "deterministic-ordering-key-availability",
        "wrestler-display-identity-availability",
        "brand-eligibility-visibility",
        "draft-eligibility-visibility",
        "availability-status-visibility",
        "gender-division-eligibility-visibility",
        "role-category-tag-visibility",
        "championship-division-eligibility-visibility",
        "tie-breaker-stability-requirement",
        "no-random-ordering-requirement",
        "future-draft-board-persistence-compatibility-marker",
        "blocked-actual-draft-board-creation"
      ]
    );
    assert.deepEqual(
      contract.orderedRequirements.map((requirement) => requirement.slug),
      contract.orderedRequirements.map((requirement) => requirement.id)
    );
  });

  it("keeps actual draft board creation blocked through reasons and capabilities", () => {
    const contract = createNewGMModeDraftBoardOrderingContractShell();

    assert.deepEqual(contract.blockedReasons, [
      "draft-board-ordering-contract-only",
      "draft-board-eligibility-input-summary-required",
      "talent-pool-readiness-required",
      "eligible-wrestler-list-not-persisted",
      "actual-draft-board-creation-not-implemented",
      "draft-pick-validation-not-implemented",
      "draft-execution-not-implemented",
      "roster-assignment-not-implemented",
      "championship-division-assignment-not-implemented",
      "gameplay-start-not-implemented",
      "gameplay-payload-persistence-not-implemented",
      "ui-wiring-not-implemented"
    ]);
    assert.equal(contract.capabilityFlags.draftBoardOrderingContractAvailable, true);
    assert.equal(contract.capabilityFlags.draftBoardOrderingValidatorAvailable, true);
    assert.equal(contract.capabilityFlags.draftBoardOrderingSummaryAvailable, true);
    assert.equal(contract.capabilityFlags.draftBoardCreationAvailable, false);
    assert.equal(contract.capabilityFlags.actualDraftBoardCreationAvailable, false);
    assert.equal(contract.capabilityFlags.draftPickValidationAvailable, false);
    assert.equal(contract.capabilityFlags.draftExecutionAvailable, false);
    assert.equal(contract.capabilityFlags.randomOrderingAvailable, false);
    assert.equal(contract.randomOrderingUsed, false);
  });

  it("does not expose generated text or GenAI behavior", () => {
    const contract = createNewGMModeDraftBoardOrderingContractShell();

    assert.equal(contract.generatedTextCreated, false);
    assert.equal(contract.genAIUsed, false);
    assert.equal(contract.actualDraftBoardCreationAvailable, false);
    assert.equal(contract.uiWiringAvailable, false);
  });
});
