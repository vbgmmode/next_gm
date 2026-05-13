import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import {
  LOCAL_GAME_SETUP_DRAFT_POOLS,
  LOCAL_GAME_SETUP_ROSTER_SCARCITY_OPTIONS,
  LOCAL_GAME_SETUP_WIN_CONDITIONS,
  createLocalGameSetupProjection,
  readLocalGameSetupStartingBudgetUnits,
} from "../ui/playable-new-gm-mode/localGameSetupController.js";
import {
  createInitialMiniDraftProgress,
  executeInMemoryMakePick,
  executeRivalBrandDraftPicks,
} from "../ui/playable-new-gm-mode/inMemoryDraftActionController.js";

const selectedGm = Object.freeze({
  gmId: "maren-vale",
  displayName: "Maren Vale",
});
const selectedBrand = Object.freeze({
  brandId: "raw",
  brandLabel: "Raw",
});
const romanReigns = Object.freeze({
  candidateId: "candidate-roman-reigns",
  name: "Roman Reigns",
  availability: "Available",
});

describe("Playable New GM Mode first-session product lock", () => {
  it("models difficulty, active brands, competing brands, and budget metadata", () => {
    const setup = createLocalGameSetupProjection({
      selectedDifficulty: "hard",
      activeBrandCount: 4,
      selectedBrandId: "raw",
      selectedGm,
    });

    assert.equal(setup.selectedDifficulty, "hard");
    assert.equal(setup.startingBudgetUnits, 100);
    assert.equal(readLocalGameSetupStartingBudgetUnits("easy"), 150);
    assert.equal(readLocalGameSetupStartingBudgetUnits("normal"), 120);
    assert.equal(readLocalGameSetupStartingBudgetUnits("hard"), 100);
    assert.deepEqual(
      setup.competingBrands.map((brand) => brand.brandLabel),
      ["SmackDown", "NXT", "AEW"]
    );
    assert.equal(setup.displayLabels.startingBudgetLine, "$10,000,000");
  });

  it("keeps display-only setup options honest and local-only", () => {
    const setup = createLocalGameSetupProjection({
      selectedDifficulty: "immortal",
      selectedStartingBudgetId: "premium",
      selectedWinConditionId: "hall-of-fame-trophies",
      selectedDraftPoolId: "randomized",
      selectedRosterScarcityId: "scarce",
      activeBrandCount: 4,
      selectedBrandId: "raw",
      selectedGm,
    });

    assert.equal(setup.selectedDifficulty, "immortal");
    assert.equal(setup.startingBudgetUnits, 150);
    assert.equal(setup.displayLabels.difficultyEffectLine.includes("gameplay unchanged"), true);
    assert.equal(setup.displayLabels.winConditionLine, "Hall of Fame Trophies");
    assert.equal(setup.displayLabels.winConditionEffectLine.includes("Preview Only"), true);
    assert.equal(setup.displayLabels.draftPoolLine, "Randomized");
    assert.equal(setup.displayLabels.draftPoolEffectLine.includes("no randomness"), true);
    assert.equal(setup.displayLabels.rosterScarcityLine, "Scarce Market");
    assert.equal(setup.displayLabels.rosterScarcityEffectLine.includes("draft completion unchanged"), true);
    assert.equal(LOCAL_GAME_SETUP_WIN_CONDITIONS.length, 2);
    assert.equal(LOCAL_GAME_SETUP_DRAFT_POOLS.length, 3);
    assert.equal(LOCAL_GAME_SETUP_ROSTER_SCARCITY_OPTIONS.length, 3);
  });

  it("keeps the selected player brand out of competing brands when active count changes", () => {
    const setup = createLocalGameSetupProjection({
      selectedDifficulty: "normal",
      activeBrandCount: 2,
      selectedBrandId: "aew",
      selectedGm,
    });

    assert.equal(setup.selectedBrandId, "aew");
    assert.deepEqual(
      setup.activeBrands.map((brand) => brand.brandLabel),
      ["Raw", "AEW"]
    );
    assert.deepEqual(
      setup.competingBrands.map((brand) => brand.brandLabel),
      ["Raw"]
    );
  });

  it("uses money-style finance labels and first-session Brand HQ copy in markup", () => {
    const html = readPlayableUiFile("index.html");

    assert.match(html, /Starting Budget: \$12,000,000/);
    assert.match(html, /General Settings/);
    assert.match(html, /Contract Review \/ Start Draft/);
    assert.match(html, /Random GM/);
    assert.match(html, /Setup Preview Only/);
    assert.match(html, /Preview-only labels do not change scoring/);
    assert.match(html, /Remaining Budget: \$12,000,000/);
    assert.match(html, /Signing Cost: \$1,800,000/);
    assert.match(html, /Booking Reserve/);
    assert.match(html, /Contract Cost|Signing Cost/);
    assert.match(html, /On The Clock/);
    assert.match(html, /Recent Picks/);
    assert.match(html, /Welcome to Monday Night Raw/);
    assert.match(html, /Competing brands: SmackDown, NXT, AEW/);
    assert.match(html, /Assign Champions/);
    assert.doesNotMatch(html.toLowerCase(), /token/);
  });

  it("records deterministic rival picks after a player pick without inflating the player roster", () => {
    const initialProgress = createInitialMiniDraftProgress({
      selectedBrand,
      startingDraftBudget: 120,
    });
    const playerPick = executeInMemoryMakePick({
      selectedCandidate: romanReigns,
      selectedBrand,
      selectedGm,
      miniDraftProgress: initialProgress,
    });
    const setup = createLocalGameSetupProjection({
      selectedDifficulty: "normal",
      activeBrandCount: 4,
      selectedBrandId: "raw",
      selectedGm,
    });
    const rivalPicks = executeRivalBrandDraftPicks({
      competingBrands: setup.competingBrands,
      miniDraftProgress: playerPick.miniDraftProgress,
    });

    assert.equal(playerPick.actionStatus, "in-memory-make-pick-succeeded");
    assert.equal(rivalPicks.actionStatus, "rival-brand-picks-recorded");
    assert.equal(rivalPicks.rivalPickSummaries.length, 3);
    assert.equal(rivalPicks.miniDraftProgress.signedTalentCount, 1);
    assert.equal(rivalPicks.miniDraftProgress.completedPickSummaries.length, 1);
    assert.equal(rivalPicks.miniDraftProgress.rivalPickSummaries.length, 3);
    assert.equal(
      rivalPicks.miniDraftProgress.draftedCandidateIds.includes(
        rivalPicks.rivalPickSummaries[0].candidateId
      ),
      true
    );
    assert.equal(
      rivalPicks.rivalPickSummaries[0].displayStatusLine.startsWith("Signed to "),
      true
    );
  });

  it("keeps product-lock copy free of forbidden player-facing terms in added surfaces", () => {
    const source = [
      readPlayableUiFile("index.html"),
      readPlayableUiFile("app.js"),
      readPlayableUiFile("inMemoryDraftActionController.js"),
      readPlayableUiFile("localGameSetupController.js"),
    ].join("\n");

    for (const forbidden of [
      ["Math", "random"].join("."),
      ["Open", "AI"].join(""),
      ["api", "key"].join(" "),
      ["Auto", "Draft", "Service"].join(""),
      ["create", "Auto", "Draft"].join(""),
    ]) {
      assert.equal(source.includes(forbidden), false, forbidden);
    }
  });
});

function readPlayableUiFile(fileName: string): string {
  return readFileSync(`ui/playable-new-gm-mode/${fileName}`, "utf8");
}
