import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createAutoFillMinimumRosterReadiness,
  createInitialMiniDraftProgress,
  executeAutoFillMinimumRoster,
} from "../ui/playable-new-gm-mode/inMemoryDraftActionController.js";

const selectedBrand = Object.freeze({
  brandId: "raw",
  brandLabel: "Raw",
});
const selectedGm = Object.freeze({
  gmId: "maren-vale",
  displayName: "Maren Vale",
});

describe("Playable New GM Mode Auto-Fill Minimum Roster", () => {
  it("auto-fills deterministically by lowest cost first and stops before 16 when fixtures run out", () => {
    const result = executeAutoFillMinimumRoster({
      selectedBrand,
      selectedGm,
      miniDraftProgress: createInitialMiniDraftProgress({ selectedBrand }),
    });
    const signedNames = result.autoFilledPickSummaries.map(
      (summary) => summary.candidateName
    );
    const signedCosts = result.autoFilledPickSummaries.map(
      (summary) => summary.signingCost
    );

    assert.equal(result.actionStatus, "auto-fill-stopped-minimum-not-reached");
    assert.equal(result.autoFilledCount, 9);
    assert.deepEqual(signedNames, [
      "Cassian Ryde",
      "Gia Stone",
      "Jules Kade",
      "Dante Cross",
      "Hana Reyes",
      "Bruno Vale",
      "Fiona Hale",
      "Elena Voss",
      "Ace Mercer",
    ]);
    assert.deepEqual(signedCosts, [3, 3, 3, 4, 5, 8, 8, 12, 18]);
    assert.equal(result.miniDraftProgress.signedTalentCount, 9);
    assert.equal(result.miniDraftProgress.minimumRosterViable, false);
    assert.equal(result.miniDraftProgress.remainingDraftBudget, 56);
    assert.equal(result.miniDraftProgress.bookingReserveProtected, true);
    assert.deepEqual(result.blockedReasonIds, [
      "minimum-roster-not-reached-with-reserve-protected",
    ]);
    assert.equal(
      result.displayLabels.noteLine,
      "Auto-Fill stopped rather than dipping into booking reserve or signing unavailable talent."
    );
  });

  it("stops auto-fill at exactly 16 in v0.1 instead of filling beyond minimum viability", () => {
    const almostViable = createSyntheticProgress({
      signedTalentCount: 15,
      remainingDraftBudget: 40,
      budgetSpent: 80,
    });
    const result = executeAutoFillMinimumRoster({
      selectedBrand,
      selectedGm,
      miniDraftProgress: almostViable,
    });

    assert.equal(result.actionStatus, "auto-fill-minimum-roster-succeeded");
    assert.equal(result.autoFilledCount, 1);
    assert.equal(result.miniDraftProgress.signedTalentCount, 16);
    assert.equal(result.miniDraftProgress.minimumRosterViable, true);
    assert.equal(result.miniDraftProgress.localDraftFinished, false);
    assert.equal(result.miniDraftProgress.remainingDraftBudget, 37);
  });

  it("blocks auto-fill once minimum roster is already viable but leaves manual draft open", () => {
    const viableProgress = createSyntheticProgress({
      signedTalentCount: 16,
      remainingDraftBudget: 40,
      budgetSpent: 80,
    });
    const readiness = createAutoFillMinimumRosterReadiness({
      selectedBrand,
      miniDraftProgress: viableProgress,
    });

    assert.equal(readiness.canAutoFill, false);
    assert.equal(readiness.actionStatus, "blocked-auto-fill-minimum-roster-viable");
    assert.match(readiness.displayLabels.noteLine, /keep signing manually/);
  });

  it("preserves booking reserve and reports a blocked state when reserve-safe completion is impossible", () => {
    const reserveEdge = createSyntheticProgress({
      signedTalentCount: 15,
      remainingDraftBudget: 22,
      budgetSpent: 98,
    });
    const readiness = createAutoFillMinimumRosterReadiness({
      selectedBrand,
      miniDraftProgress: reserveEdge,
    });
    const result = executeAutoFillMinimumRoster({
      selectedBrand,
      selectedGm,
      miniDraftProgress: reserveEdge,
    });

    assert.equal(readiness.canAutoFill, false);
    assert.equal(readiness.actionStatus, "blocked-auto-fill-no-reserve-safe-candidates");
    assert.equal(result.actionStatus, "blocked-auto-fill-no-reserve-safe-candidates");
    assert.equal(result.miniDraftProgress.remainingDraftBudget, 22);
    assert.equal(result.miniDraftProgress.signedTalentCount, 15);
  });
});

function createSyntheticProgress({
  signedTalentCount,
  remainingDraftBudget,
  budgetSpent,
}: {
  signedTalentCount: number;
  remainingDraftBudget: number;
  budgetSpent: number;
}) {
  const summaries = Array.from({ length: signedTalentCount }, (_, index) => ({
    candidateId: `synthetic-signed-${index + 1}`,
    candidateName: `Signed ${index + 1}`,
    displayLabel: `Round 1 / Pick ${index + 1}: Signed ${index + 1} (Raw, Mid Card, Cost 5)`,
    signingCost: 5,
  }));

  return {
    ...createInitialMiniDraftProgress({ selectedBrand }),
    completedPickSummaries: summaries,
    draftedCandidateIds: [],
    currentPickIndex: signedTalentCount,
    signedTalentCount,
    remainingDraftBudget,
    budgetSpent,
    minimumRosterViable: signedTalentCount >= 16,
    localDraftFinished: false,
    miniDraftComplete: false,
  };
}
