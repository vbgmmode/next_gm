import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  NEW_GM_MODE_DRAFT_FINANCE_BOOKING_RESERVE_PLACEHOLDER,
  NEW_GM_MODE_DRAFT_FINANCE_MINIMUM_ROSTER_TARGET_PLACEHOLDER,
  NEW_GM_MODE_DRAFT_FINANCE_PLACEHOLDER_TIER_COSTS,
  NEW_GM_MODE_DRAFT_FINANCE_STARTING_BUDGET_PLACEHOLDER,
  createNewGMModeDraftPickCandidateObjects,
  createNewGMModeDraftFinanceProjection
} from "../src/game/domain/index.ts";

describe("New GM Mode Draft Finance Projection v0.1", () => {
  it("keeps the placeholder starting budget and minimum roster target stable", () => {
    const projection = createNewGMModeDraftFinanceProjection();

    assert.equal(NEW_GM_MODE_DRAFT_FINANCE_STARTING_BUDGET_PLACEHOLDER, 120);
    assert.equal(NEW_GM_MODE_DRAFT_FINANCE_MINIMUM_ROSTER_TARGET_PLACEHOLDER, 16);
    assert.equal(NEW_GM_MODE_DRAFT_FINANCE_BOOKING_RESERVE_PLACEHOLDER, 20);
    assert.equal(projection.placeholderTuning.startingDraftBudget, 120);
    assert.equal(projection.placeholderTuning.minimumViableRosterCount, 16);
    assert.equal(projection.placeholderTuning.bookingReserveBudget, 20);
    assert.equal(projection.displayLabels.startingBudgetLine, "Starting Budget: 120");
    assert.equal(projection.displayLabels.remainingBudgetLine, "Remaining Budget Preview: 120");
    assert.equal(projection.displayLabels.bookingReserveLine, "Booking Reserve Target: 20");
  });

  it("keeps placeholder tier costs stable and ordered for draft projection", () => {
    assert.deepEqual(NEW_GM_MODE_DRAFT_FINANCE_PLACEHOLDER_TIER_COSTS, {
      Franchise: 18,
      "Main Event": 12,
      "Upper Card": 8,
      "Mid Card": 5,
      Prospect: 3,
      Specialist: 4
    });
    assert.equal(
      NEW_GM_MODE_DRAFT_FINANCE_PLACEHOLDER_TIER_COSTS.Franchise >
        NEW_GM_MODE_DRAFT_FINANCE_PLACEHOLDER_TIER_COSTS["Main Event"],
      true
    );
    assert.equal(
      NEW_GM_MODE_DRAFT_FINANCE_PLACEHOLDER_TIER_COSTS["Main Event"] >
        NEW_GM_MODE_DRAFT_FINANCE_PLACEHOLDER_TIER_COSTS["Upper Card"],
      true
    );
    assert.equal(
      NEW_GM_MODE_DRAFT_FINANCE_PLACEHOLDER_TIER_COSTS["Upper Card"] >
        NEW_GM_MODE_DRAFT_FINANCE_PLACEHOLDER_TIER_COSTS["Mid Card"],
      true
    );
    assert.equal(
      NEW_GM_MODE_DRAFT_FINANCE_PLACEHOLDER_TIER_COSTS["Mid Card"] >
        NEW_GM_MODE_DRAFT_FINANCE_PLACEHOLDER_TIER_COSTS.Specialist,
      true
    );
    assert.equal(
      NEW_GM_MODE_DRAFT_FINANCE_PLACEHOLDER_TIER_COSTS.Specialist >
        NEW_GM_MODE_DRAFT_FINANCE_PLACEHOLDER_TIER_COSTS.Prospect,
      true
    );
  });

  it("projects selected candidate tier, cost, affordability, and budget preview", () => {
    const projection = createNewGMModeDraftFinanceProjection({
      selectedCandidateId: "candidate-roman-reigns"
    });
    const candidate = projection.selectedCandidateProjection;

    assert.ok(candidate);
    assert.equal(candidate.displayName, "Roman Reigns");
    assert.equal(candidate.sourceRosterPool, "SmackDown");
    assert.equal(candidate.projectedSigningTier, "Franchise");
    assert.equal(candidate.projectedSigningCost, 18);
    assert.equal(candidate.remainingDraftBudgetPreview, 120);
    assert.equal(candidate.budgetPreviewAfterSigning, 102);
    assert.equal(candidate.affordabilityStatus, "expensive-but-affordable");
    assert.equal(candidate.displayLabels.tierLine, "Projected Cost Tier: Franchise");
    assert.equal(candidate.displayLabels.costLine, "Projected Signing Cost: 18");
    assert.equal(
      candidate.displayLabels.afterSigningLine,
      "Budget Preview After Signing: 102"
    );
  });

  it("returns a clear unaffordable status when remaining preview budget is below cost", () => {
    const projection = createNewGMModeDraftFinanceProjection({
      selectedCandidateId: "candidate-roman-reigns",
      remainingDraftBudgetPreview: 2
    });
    const candidate = projection.selectedCandidateProjection;

    assert.ok(candidate);
    assert.equal(candidate.affordabilityStatus, "not-affordable");
    assert.equal(candidate.budgetPreviewAfterSigning, -16);
    assert.equal(candidate.displayLabels.affordabilityLine, "Not affordable in preview");
  });

  it("marks locally drafted candidates without mutating budget or input", () => {
    const alreadyDraftedCandidateIds = ["candidate-roman-reigns"];
    const projection = createNewGMModeDraftFinanceProjection({
      selectedCandidateId: "candidate-roman-reigns",
      alreadyDraftedCandidateIds
    });
    const candidate = projection.selectedCandidateProjection;

    assert.deepEqual(alreadyDraftedCandidateIds, ["candidate-roman-reigns"]);
    assert.ok(candidate);
    assert.equal(candidate.affordabilityStatus, "already-drafted-signed");
    assert.equal(candidate.remainingDraftBudgetPreview, 120);
    assert.equal(candidate.budgetPreviewAfterSigning, 102);
    assert.equal(candidate.budgetMutated, false);
    assert.equal(candidate.persisted, false);
  });

  it("represents the 16-superstar affordability principle without final economy balance", () => {
    const projection = createNewGMModeDraftFinanceProjection();

    assert.equal(projection.rosterAffordabilityPrinciple.minimumViableRosterCount, 16);
    assert.equal(projection.rosterAffordabilityPrinciple.startingDraftBudget, 120);
    assert.equal(projection.rosterAffordabilityPrinciple.bookingReserveBudget, 20);
    assert.equal(projection.rosterAffordabilityPrinciple.baselineViableTier, "Mid Card");
    assert.equal(projection.rosterAffordabilityPrinciple.baselineRosterCostPreview, 80);
    assert.equal(projection.rosterAffordabilityPrinciple.baselineRemainingBudgetPreview, 40);
    assert.equal(
      projection.rosterAffordabilityPrinciple.baselineRosterCostPreview <=
        projection.rosterAffordabilityPrinciple.startingDraftBudget,
      true
    );
    assert.equal(
      projection.rosterAffordabilityPrinciple.baselineRemainingBudgetPreview >=
        projection.rosterAffordabilityPrinciple.bookingReserveBudget,
      true
    );
    assert.equal(
      projection.rosterAffordabilityPrinciple.canMeetMinimumRosterTargetWithMixedLowerMidTiers,
      true
    );
    assert.equal(projection.placeholderTuning.finalEconomyBalance, false);
  });

  it("keeps finance projection read-only and free of player-facing hidden internals", () => {
    const projection = createNewGMModeDraftFinanceProjection({
      selectedCandidateId: "candidate-austin-theory"
    });
    const candidate = projection.selectedCandidateProjection;
    const displayText = [
      projection.displayLabels.startingBudgetLine,
      projection.displayLabels.remainingBudgetLine,
      projection.displayLabels.financePreviewOnlyLine,
      candidate?.displayLabels.tierLine,
      candidate?.displayLabels.costLine,
      candidate?.displayLabels.afterSigningLine,
      candidate?.displayLabels.affordabilityLine,
      candidate?.displayLabels.noteLine
    ].join("\n");

    assert.equal(projection.readOnly, true);
    assert.equal(projection.persisted, false);
    assert.equal(projection.gameplayAffecting, false);
    assert.equal(projection.playerFacing, false);
    assert.equal(projection.capabilityFlags.canMutateBudget, false);
    assert.equal(projection.capabilityFlags.canDeductBudget, false);
    assert.ok(candidate);
    assert.equal(candidate.playerFacingSafeDisplay, true);
    assert.equal(candidate.hiddenFormulaExposedToPlayer, false);
    assert.equal(candidate.rawEngineValuesExposedToPlayer, false);
    assert.equal(candidate.backendDiagnosticsExposedToPlayer, false);

    for (const forbiddenSnippet of ["formula", "raw", "engine", "diagnostic"]) {
      assert.equal(displayText.toLowerCase().includes(forbiddenSnippet), false);
    }
  });

  it("covers every eligible candidate with a signing tier and cost", () => {
    const candidateSet = createNewGMModeDraftPickCandidateObjects();
    const projection = createNewGMModeDraftFinanceProjection({ candidateObjectSet: candidateSet });
    const eligibleCandidates = candidateSet.candidates.filter(
      (candidate) => candidate.eligibilityStatus === "eligible"
    );
    const projectionByCandidateId = new Map(
      projection.candidateProjections.map((candidate) => [
        candidate.candidateObjectId,
        candidate
      ])
    );

    assert.equal(eligibleCandidates.length, 235);
    for (const candidate of eligibleCandidates) {
      const finance = projectionByCandidateId.get(candidate.candidateId);

      assert.ok(finance, candidate.candidateId);
      assert.ok(finance.projectedSigningTier, candidate.candidateId);
      assert.equal(typeof finance.projectedSigningCost, "number");
      assert.equal(finance.projectedSigningCost > 0, true);
    }
  });

  it("keeps marquee talent more expensive than lower-card examples", () => {
    const projection = createNewGMModeDraftFinanceProjection();
    const roman = requireProjection(projection, "Roman Reigns");
    const grayson = requireProjection(projection, "Grayson Waller");
    const moxley = requireProjection(projection, "Jon Moxley");
    const maxxine = requireProjection(projection, "Maxxine Dupri");

    assert.equal(roman.projectedSigningTier, "Franchise");
    assert.equal(grayson.projectedSigningTier, "Mid Card");
    assert.equal(moxley.projectedSigningTier, "Franchise");
    assert.equal(maxxine.projectedSigningTier, "Prospect");
    assert.equal(roman.projectedSigningCost > grayson.projectedSigningCost, true);
    assert.equal(moxley.projectedSigningCost > maxxine.projectedSigningCost, true);
  });
});

function requireProjection(
  projection: ReturnType<typeof createNewGMModeDraftFinanceProjection>,
  displayName: string
) {
  const candidate = projection.candidateProjections.find(
    (projectionCandidate) => projectionCandidate.displayName === displayName
  );

  assert.ok(candidate, displayName);
  return candidate;
}
