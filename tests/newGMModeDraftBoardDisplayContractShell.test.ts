import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createNewGMModeDraftBoardDisplayContractShell
} from "../src/game/domain/index.ts";

describe("New GM Mode Draft Board Display Contract Shell v0.1", () => {
  it("reports stable shell ID, version, and diagnostics boundaries", () => {
    const contract = createNewGMModeDraftBoardDisplayContractShell();

    assert.equal(
      contract.draftBoardDisplayContractId,
      "new-gm-mode-draft-board-display-contract-v0.1"
    );
    assert.equal(contract.version, "0.1");
    assert.equal(contract.status, "diagnostics-only");
    assert.equal(contract.diagnosticsOnly, true);
    assert.equal(contract.playerFacing, false);
    assert.equal(contract.gameplayAffecting, false);
    assert.equal(contract.deterministicOrdering, true);
  });

  it("includes stable ordered display requirement IDs", () => {
    const contract = createNewGMModeDraftBoardDisplayContractShell();

    assert.deepEqual(
      contract.orderedDisplayRequirements.map((requirement) => requirement.id),
      [
        "draft-board-ordering-summary-availability",
        "draft-board-eligibility-input-summary-availability",
        "talent-pool-readiness-availability",
        "eligible-ordered-wrestler-entries-availability",
        "wrestler-display-name-visibility",
        "wrestler-brand-eligibility-visibility",
        "wrestler-draft-eligibility-visibility",
        "wrestler-availability-status-visibility",
        "wrestler-gender-division-eligibility-visibility",
        "wrestler-role-category-tag-visibility",
        "wrestler-championship-division-eligibility-visibility",
        "placeholder-attributes-visibility",
        "deterministic-display-ordering-requirement",
        "no-player-facing-ui-rendering-requirement",
        "future-draft-board-display-compatibility-marker",
        "blocked-actual-draft-board-creation"
      ]
    );
    assert.deepEqual(
      contract.orderedDisplayRequirements.map((requirement) => requirement.slug),
      contract.orderedDisplayRequirements.map((requirement) => requirement.id)
    );
  });

  it("keeps actual draft board display and UI creation blocked", () => {
    const contract = createNewGMModeDraftBoardDisplayContractShell();

    assert.deepEqual(contract.blockedReasons, [
      "draft-board-display-contract-only",
      "draft-board-ordering-summary-required",
      "draft-board-eligibility-input-summary-required",
      "talent-pool-readiness-required",
      "eligible-ordered-wrestler-entries-not-persisted",
      "actual-draft-board-creation-not-implemented",
      "draft-board-ui-rendering-not-implemented",
      "player-facing-draft-board-not-implemented",
      "draft-pick-validation-not-implemented",
      "draft-execution-not-implemented",
      "roster-assignment-not-implemented",
      "championship-division-assignment-not-implemented",
      "gameplay-start-not-implemented",
      "gameplay-payload-persistence-not-implemented",
      "ui-wiring-not-implemented"
    ]);
    assert.equal(contract.capabilityFlags.draftBoardDisplayContractAvailable, true);
    assert.equal(
      contract.capabilityFlags.draftBoardDisplayReadinessValidatorAvailable,
      true
    );
    assert.equal(
      contract.capabilityFlags.draftBoardDisplayReadinessSummaryAvailable,
      true
    );
    assert.equal(contract.capabilityFlags.actualDraftBoardCreationAvailable, false);
    assert.equal(contract.capabilityFlags.actualDraftBoardDisplayAvailable, false);
    assert.equal(contract.capabilityFlags.draftBoardUiRenderingAvailable, false);
    assert.equal(contract.capabilityFlags.playerFacingDraftBoardAvailable, false);
    assert.equal(contract.draftBoardUiRenderingAvailable, false);
    assert.equal(contract.playerFacingDraftBoardAvailable, false);
  });

  it("does not expose generated text or GenAI behavior", () => {
    const contract = createNewGMModeDraftBoardDisplayContractShell();

    assert.equal(contract.generatedTextCreated, false);
    assert.equal(contract.genAIUsed, false);
    assert.equal(contract.uiWiringAvailable, false);
  });
});
