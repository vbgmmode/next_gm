import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createFinishDraftReadiness,
  createInitialMiniDraftProgress,
  createMakePickReadiness,
  executeInMemoryMakePick,
  executeLocalFinishDraft,
} from "../ui/playable-new-gm-mode/inMemoryDraftActionController.js";

const selectedBrand = Object.freeze({
  brandId: "raw",
  brandLabel: "Raw",
});
const selectedGm = Object.freeze({
  gmId: "maren-vale",
  displayName: "Maren Vale",
});
const aceMercer = Object.freeze({
  candidateId: "candidate-roman-reigns",
  name: "Roman Reigns",
  availability: "Available",
});
const cassianRyde = Object.freeze({
  candidateId: "candidate-je-von-evans",
  name: "Je'Von Evans",
  availability: "Available",
});

describe("Playable New GM Mode finance-limited draft", () => {
  it("uses 16 as minimum roster viability rather than a hard completion cap", () => {
    const viableProgress = createSyntheticProgress({
      signedTalentCount: 16,
      remainingDraftBudget: 40,
      budgetSpent: 80,
      draftedCandidateIds: ["candidate-austin-theory"],
    });
    const readiness = createMakePickReadiness({
      selectedCandidate: aceMercer,
      selectedBrand,
      miniDraftProgress: viableProgress,
      draftSlot: viableProgress.currentDraftSlot,
    });
    const result = executeInMemoryMakePick({
      selectedCandidate: aceMercer,
      selectedBrand,
      selectedGm,
      miniDraftProgress: viableProgress,
    });

    assert.equal(viableProgress.minimumViableRosterCount, 16);
    assert.equal(viableProgress.minimumRosterViable, true);
    assert.equal(viableProgress.localDraftFinished, false);
    assert.equal(readiness.canMakePick, true);
    assert.equal(result.actionStatus, "in-memory-make-pick-succeeded");
    assert.equal(result.miniDraftProgress.signedTalentCount, 17);
    assert.equal(result.miniDraftProgress.minimumRosterViable, true);
    assert.equal(result.miniDraftProgress.localDraftFinished, false);
  });

  it("blocks Finish Draft before 16 and only finishes local draft after viability", () => {
    const earlyProgress = createInitialMiniDraftProgress({ selectedBrand });
    const blocked = createFinishDraftReadiness({
      selectedBrand,
      miniDraftProgress: earlyProgress,
    });
    const blockedResult = executeLocalFinishDraft({
      selectedBrand,
      selectedGm,
      miniDraftProgress: earlyProgress,
    });
    const viableProgress = createSyntheticProgress({
      signedTalentCount: 16,
      remainingDraftBudget: 40,
      budgetSpent: 80,
    });
    const ready = createFinishDraftReadiness({
      selectedBrand,
      miniDraftProgress: viableProgress,
    });
    const finished = executeLocalFinishDraft({
      selectedBrand,
      selectedGm,
      miniDraftProgress: viableProgress,
    });
    const postFinishPick = executeInMemoryMakePick({
      selectedCandidate: aceMercer,
      selectedBrand,
      selectedGm,
      miniDraftProgress: finished.miniDraftProgress,
    });

    assert.equal(blocked.canFinishDraft, false);
    assert.equal(blocked.actionStatus, "blocked-finish-draft-minimum-not-viable");
    assert.equal(blockedResult.actionStatus, "blocked-finish-draft-minimum-not-viable");
    assert.equal(ready.canFinishDraft, true);
    assert.equal(finished.actionStatus, "local-draft-finished");
    assert.equal(finished.miniDraftProgress.localDraftFinished, true);
    assert.equal(finished.projection.displayLabels.recapStatusLine, "Draft Finished");
    assert.equal(postFinishPick.actionStatus, "blocked-local-draft-finished");
  });

  it("warns when a manual signing dips into booking reserve but does not hard-block it", () => {
    const reserveEdgeProgress = createSyntheticProgress({
      signedTalentCount: 10,
      remainingDraftBudget: 22,
      budgetSpent: 98,
    });
    const readiness = createMakePickReadiness({
      selectedCandidate: cassianRyde,
      selectedBrand,
      miniDraftProgress: reserveEdgeProgress,
      draftSlot: reserveEdgeProgress.currentDraftSlot,
    });
    const result = executeInMemoryMakePick({
      selectedCandidate: cassianRyde,
      selectedBrand,
      selectedGm,
      miniDraftProgress: reserveEdgeProgress,
    });

    assert.equal(readiness.canMakePick, true);
    assert.match(readiness.displayLabels.noteLine, /dips into your booking reserve/);
    assert.equal(result.actionStatus, "in-memory-make-pick-succeeded");
    assert.equal(result.currentPickSummary.reserveWarningLine, "This signing dips into your booking reserve");
    assert.equal(result.miniDraftProgress.remainingDraftBudget, 19);
    assert.equal(result.miniDraftProgress.bookingReserveProtected, false);
  });

  it("blocks unaffordable manual signing without spending budget", () => {
    const lowBudgetProgress = createSyntheticProgress({
      signedTalentCount: 8,
      remainingDraftBudget: 12,
      budgetSpent: 108,
    });
    const result = executeInMemoryMakePick({
      selectedCandidate: aceMercer,
      selectedBrand,
      selectedGm,
      miniDraftProgress: lowBudgetProgress,
    });

    assert.equal(result.actionStatus, "blocked-candidate-unaffordable");
    assert.equal(result.displayLabels.noteLine, "Not enough draft budget. Need 18 budget, you have 12.");
    assert.equal(result.miniDraftProgress, undefined);
  });

  it("resets draft and budget from the initial page-lifetime state", () => {
    const spent = executeInMemoryMakePick({
      selectedCandidate: aceMercer,
      selectedBrand,
      selectedGm,
      miniDraftProgress: createInitialMiniDraftProgress({ selectedBrand }),
    }).miniDraftProgress;
    const reset = createInitialMiniDraftProgress({ selectedBrand });

    assert.equal(spent.remainingDraftBudget, 102);
    assert.equal(reset.remainingDraftBudget, 120);
    assert.equal(reset.budgetSpent, 0);
    assert.equal(reset.signedTalentCount, 0);
    assert.equal(reset.localDraftFinished, false);
    assert.deepEqual(reset.draftedCandidateIds, []);
  });
});

function createSyntheticProgress({
  signedTalentCount,
  remainingDraftBudget,
  budgetSpent,
  draftedCandidateIds = [],
}: {
  signedTalentCount: number;
  remainingDraftBudget: number;
  budgetSpent: number;
  draftedCandidateIds?: readonly string[];
}) {
  const summaries = Array.from({ length: signedTalentCount }, (_, index) => ({
    candidateId: `synthetic-signed-${index + 1}`,
    candidateName: `Signed ${index + 1}`,
    displayLabel: `Round 1 / Pick ${index + 1}: Signed ${index + 1} (Raw, Mid Card, Cost 5)`,
    signingCost: 5,
  }));

  return {
    ...createInitialMiniDraftProgress({
      selectedBrand,
    }),
    completedPickSummaries: summaries,
    draftedCandidateIds,
    currentPickIndex: signedTalentCount,
    signedTalentCount,
    remainingDraftBudget,
    budgetSpent,
    minimumRosterViable: signedTalentCount >= 16,
    localDraftFinished: false,
    miniDraftComplete: false,
  };
}
