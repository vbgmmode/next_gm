import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createInitialMiniDraftProgress,
  createMakePickReadiness,
  executeInMemoryMakePick,
} from "../ui/playable-new-gm-mode/inMemoryDraftActionController.js";
import {
  createNewGMModeDraftPickCandidateObjects,
  createNewGMModeDraftSelectionIntentObject,
  createNewGMModeInMemoryDraftFlow,
} from "../src/game/domain/index.ts";

const selectedBrand = Object.freeze({
  brandId: "raw",
  brandLabel: "Raw",
});
const selectedGm = Object.freeze({
  gmId: "maren-vale",
  displayName: "Maren Vale",
});
const aceMercer = Object.freeze({
  candidateId: "candidate-ace-mercer",
  name: "Ace Mercer",
  availability: "Available",
});
const brunoVale = Object.freeze({
  candidateId: "candidate-bruno-vale",
  name: "Bruno Vale",
  availability: "Available",
});
const cassianRyde = Object.freeze({
  candidateId: "candidate-cassian-ryde",
  name: "Cassian Ryde",
  availability: "Available",
});

describe("Playable New GM Mode local draft budget spend", () => {
  it("initializes local-only budget state without storage-backed progress", () => {
    const progress = createInitialMiniDraftProgress();

    assert.equal(progress.startingDraftBudget, 100);
    assert.equal(progress.remainingDraftBudget, 100);
    assert.equal(progress.budgetSpent, 0);
    assert.equal(progress.signedTalentCount, 0);
    assert.equal(progress.minimumRosterTarget, 16);
    assert.equal(progress.localOnly, true);
    assert.equal(progress.inMemoryOnly, true);
    assert.equal(progress.persisted, false);
  });

  it("blocks unaffordable candidates before the canonical draft flow is called", () => {
    let flowCallCount = 0;
    const lowBudgetProgress = {
      ...createInitialMiniDraftProgress(),
      remainingDraftBudget: 12,
    };
    const services = {
      createCandidateObjectSet: createNewGMModeDraftPickCandidateObjects,
      createSelectionIntentObject: createNewGMModeDraftSelectionIntentObject,
      runInMemoryDraftFlow(input: Parameters<typeof createNewGMModeInMemoryDraftFlow>[0]) {
        flowCallCount += 1;
        return createNewGMModeInMemoryDraftFlow(input);
      },
    };
    const readiness = createMakePickReadiness({
      selectedCandidate: aceMercer,
      selectedBrand,
      miniDraftProgress: lowBudgetProgress,
      draftSlot: lowBudgetProgress.currentDraftSlot,
    });
    const result = executeInMemoryMakePick(
      {
        selectedCandidate: aceMercer,
        selectedBrand,
        selectedGm,
        miniDraftProgress: lowBudgetProgress,
      },
      services
    );

    assert.equal(readiness.canMakePick, false);
    assert.equal(readiness.actionStatus, "blocked-candidate-unaffordable");
    assert.equal(
      readiness.displayLabels.noteLine,
      "Not enough draft budget. Need 18 budget, you have 12."
    );
    assert.equal(result.actionStatus, "blocked-candidate-unaffordable");
    assert.equal(flowCallCount, 0);
  });

  it("does not deduct budget when the canonical draft flow blocks the pick", () => {
    const services = {
      createCandidateObjectSet: createNewGMModeDraftPickCandidateObjects,
      createSelectionIntentObject: createNewGMModeDraftSelectionIntentObject,
      runInMemoryDraftFlow() {
        return {
          draftCompletionSummary: {
            draftCompletionPhase: "draft-completion-blocked",
          },
          capabilityFlags: {
            canStartGameplay: false,
            canInitializeWeekOne: false,
            canPersistGameplayPayload: false,
          },
        };
      },
    };
    const result = executeInMemoryMakePick(
      {
        selectedCandidate: aceMercer,
        selectedBrand,
        selectedGm,
        miniDraftProgress: createInitialMiniDraftProgress(),
      },
      services
    );

    assert.equal(result.actionStatus, "in-memory-make-pick-domain-blocked");
    assert.equal(result.currentPickSummary.completedInMemory, false);
    assert.equal(result.miniDraftProgress.remainingDraftBudget, 100);
    assert.equal(result.miniDraftProgress.budgetSpent, 0);
    assert.equal(result.miniDraftProgress.signedTalentCount, 0);
    assert.deepEqual(result.miniDraftProgress.draftedCandidateIds, []);
  });

  it("deducts each successful signing cost and preserves the three-pick cap", () => {
    const firstPick = executeInMemoryMakePick({
      selectedCandidate: aceMercer,
      selectedBrand,
      selectedGm,
      miniDraftProgress: createInitialMiniDraftProgress(),
    });
    const secondPick = executeInMemoryMakePick({
      selectedCandidate: brunoVale,
      selectedBrand,
      selectedGm,
      miniDraftProgress: firstPick.miniDraftProgress,
    });
    const thirdPick = executeInMemoryMakePick({
      selectedCandidate: cassianRyde,
      selectedBrand,
      selectedGm,
      miniDraftProgress: secondPick.miniDraftProgress,
    });
    const fourthPick = executeInMemoryMakePick({
      selectedCandidate: brunoVale,
      selectedBrand,
      selectedGm,
      miniDraftProgress: thirdPick.miniDraftProgress,
    });

    assert.equal(firstPick.miniDraftProgress.remainingDraftBudget, 82);
    assert.equal(secondPick.miniDraftProgress.remainingDraftBudget, 74);
    assert.equal(thirdPick.miniDraftProgress.remainingDraftBudget, 71);
    assert.equal(thirdPick.miniDraftProgress.budgetSpent, 29);
    assert.equal(thirdPick.miniDraftProgress.signedTalentCount, 3);
    assert.equal(thirdPick.miniDraftProgress.miniDraftComplete, true);
    assert.equal(fourthPick.actionStatus, "blocked-mini-draft-complete");
  });

  it("passes signing tier, cost, and budget summary into Draft Recap output", () => {
    const result = executeInMemoryMakePick({
      selectedCandidate: aceMercer,
      selectedBrand,
      selectedGm,
      miniDraftProgress: createInitialMiniDraftProgress(),
    });
    const budgetAndSigningLabels = [
      result.projection.displayLabels.candidateLine,
      result.projection.displayLabels.budgetLine,
    ].join("\n");

    assert.equal(result.currentPickSummary.signingTier, "Franchise");
    assert.equal(result.currentPickSummary.signingCost, 18);
    assert.equal(result.projection.budgetSummary.startingDraftBudget, 100);
    assert.equal(result.projection.budgetSummary.budgetSpent, 18);
    assert.equal(result.projection.budgetSummary.remainingDraftBudget, 82);
    assert.equal(result.projection.budgetSummary.signedTalentCount, 1);
    assert.match(result.projection.displayLabels.candidateLine, /Franchise, Cost 18/);
    assert.match(result.projection.displayLabels.budgetLine, /82 remaining \/ 18 spent/);
    for (const forbiddenSnippet of ["formula", "diagnostic"]) {
      assert.equal(
        budgetAndSigningLabels.toLowerCase().includes(forbiddenSnippet),
        false
      );
    }
  });

  it("resets the local draft budget when a new page-lifetime progress object is created", () => {
    const spentProgress = executeInMemoryMakePick({
      selectedCandidate: aceMercer,
      selectedBrand,
      selectedGm,
      miniDraftProgress: createInitialMiniDraftProgress(),
    }).miniDraftProgress;
    const resetProgress = createInitialMiniDraftProgress();

    assert.equal(spentProgress.remainingDraftBudget, 82);
    assert.equal(resetProgress.remainingDraftBudget, 100);
    assert.equal(resetProgress.budgetSpent, 0);
    assert.equal(resetProgress.signedTalentCount, 0);
    assert.deepEqual(resetProgress.draftedCandidateIds, []);
  });
});
