import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  createInitialMiniDraftProgress,
  createMakePickReadiness,
  executeLocalFinishDraft,
  executeInMemoryMakePick,
} from "../ui/playable-new-gm-mode/inMemoryDraftActionController.js";
import { DEFAULT_LOCAL_DRAFT_SLOT } from "../ui/playable-new-gm-mode/draftSelectionIntentAdapter.js";
import { shouldShowDock } from "../ui/playable-new-gm-mode/screenShellState.js";
import {
  createNewGMModeDraftPickCandidateObjects,
  createNewGMModeDraftFinanceProjection,
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
const validCandidate = Object.freeze({
  candidateId: "candidate-roman-reigns",
  name: "Roman Reigns",
  availability: "Available",
});
const secondValidCandidate = Object.freeze({
  candidateId: "candidate-austin-theory",
  name: "Austin Theory",
  availability: "Available",
});
const thirdValidCandidate = Object.freeze({
  candidateId: "candidate-je-von-evans",
  name: "Je'Von Evans",
  availability: "Available",
});
const fourthValidCandidate = Object.freeze({
  candidateId: "candidate-akira-tozawa",
  name: "Akira Tozawa",
  availability: "Available",
});
const unavailableCandidate = Object.freeze({
  candidateId: "candidate-ivan-north",
  name: "Ivan North",
  availability: "Unavailable",
});

describe("Playable New GM Mode in-memory Make Pick action", () => {
  it("keeps Make Pick disabled with no candidate", () => {
    const readiness = createMakePickReadiness({
      selectedBrand,
      draftSlot: DEFAULT_LOCAL_DRAFT_SLOT,
    });

    assert.equal(readiness.canMakePick, false);
    assert.equal(readiness.actionStatus, "blocked-missing-candidate");
    assert.deepEqual(readiness.blockedReasonIds, ["candidate-selection-missing"]);
  });

  it("keeps Make Pick disabled with an unavailable candidate", () => {
    const readiness = createMakePickReadiness({
      selectedCandidate: unavailableCandidate,
      selectedBrand,
      draftSlot: DEFAULT_LOCAL_DRAFT_SLOT,
    });

    assert.equal(readiness.canMakePick, false);
    assert.equal(readiness.actionStatus, "blocked-unavailable-candidate");
    assert.deepEqual(readiness.blockedReasonIds, ["candidate-unavailable"]);
  });

  it("keeps Make Pick disabled with a missing brand", () => {
    const readiness = createMakePickReadiness({
      selectedCandidate: validCandidate,
      draftSlot: DEFAULT_LOCAL_DRAFT_SLOT,
    });

    assert.equal(readiness.canMakePick, false);
    assert.equal(readiness.actionStatus, "blocked-missing-brand");
    assert.deepEqual(readiness.blockedReasonIds, ["brand-selection-missing"]);
  });

  it("enables Make Pick with a valid selected candidate, brand, and draft slot", () => {
    const readiness = createMakePickReadiness({
      selectedCandidate: validCandidate,
      selectedBrand,
      draftSlot: DEFAULT_LOCAL_DRAFT_SLOT,
      miniDraftProgress: createInitialMiniDraftProgress(),
    });

    assert.equal(readiness.canMakePick, true);
    assert.equal(readiness.actionStatus, "ready-for-in-memory-make-pick");
    assert.equal(readiness.displayLabels.buttonLabel, "Make Pick");
  });

  it("calls the existing one-shot in-memory draft flow boundary for each manual pick", () => {
    let flowCallCount = 0;
    const services = {
      createCandidateObjectSet: createNewGMModeDraftPickCandidateObjects,
      createSelectionIntentObject: createNewGMModeDraftSelectionIntentObject,
      runInMemoryDraftFlow(input: Parameters<typeof createNewGMModeInMemoryDraftFlow>[0]) {
        flowCallCount += 1;
        return createNewGMModeInMemoryDraftFlow(input);
      },
    };
    const result = executeInMemoryMakePick({
      selectedCandidate: validCandidate,
      selectedBrand,
      selectedGm,
      miniDraftProgress: createInitialMiniDraftProgress(),
    }, services);

    assert.equal(flowCallCount, 1);
    assert.equal(result.actionStatus, "in-memory-make-pick-succeeded");
    assert.equal(
      result.flowResult.inMemoryDraftFlowId,
      "new-gm-mode-in-memory-draft-flow-v1.0"
    );
    assert.equal(result.flowResult.capabilityFlags.canStartGameplay, false);
    assert.equal(result.flowResult.capabilityFlags.canInitializeWeekOne, false);
    assert.equal(result.flowResult.capabilityFlags.canPersistGameplayPayload, false);
    assert.equal(result.miniDraftProgress.currentPickIndex, 1);
    assert.equal(result.miniDraftProgress.currentDraftSlot.pickNumber, 2);
    assert.equal(result.miniDraftProgress.startingDraftBudget, 120);
    assert.equal(result.miniDraftProgress.remainingDraftBudget, 102);
    assert.equal(result.miniDraftProgress.budgetSpent, 18);
    assert.equal(result.miniDraftProgress.signedTalentCount, 1);
    assert.equal(result.currentPickSummary.signingTier, "Franchise");
    assert.equal(result.currentPickSummary.signingCost, 18);
    assert.equal(result.currentPickSummary.budgetBeforeSigning, 120);
    assert.equal(result.currentPickSummary.budgetAfterSigning, 102);
    assert.deepEqual(result.miniDraftProgress.selectedBrandReference, {
      hasBrand: true,
      brandId: "raw",
      brandLabel: "Raw",
      localOnly: true,
    });
    assert.deepEqual(result.miniDraftProgress.draftedCandidateIds, [
      "candidate-roman-reigns",
    ]);
    assert.equal(result.miniDraftProgress.miniDraftComplete, false);
  });

  it("does not call the in-memory flow for blocked candidates", () => {
    let flowCallCount = 0;
    const services = {
      createCandidateObjectSet: createNewGMModeDraftPickCandidateObjects,
      createSelectionIntentObject: createNewGMModeDraftSelectionIntentObject,
      runInMemoryDraftFlow(input: Parameters<typeof createNewGMModeInMemoryDraftFlow>[0]) {
        flowCallCount += 1;
        return createNewGMModeInMemoryDraftFlow(input);
      },
    };
    const result = executeInMemoryMakePick({
      selectedCandidate: unavailableCandidate,
      selectedBrand,
      selectedGm,
      miniDraftProgress: createInitialMiniDraftProgress(),
    }, services);

    assert.equal(flowCallCount, 0);
    assert.equal(result.actionStatus, "blocked-unavailable-candidate");
    assert.equal(result.miniDraftProgress, undefined);
    assert.equal(result.capabilityFlags.canAutoDraft, false);
  });

  it("blocks selecting a candidate already drafted during the local page lifetime", () => {
    const firstPick = executeInMemoryMakePick({
      selectedCandidate: validCandidate,
      selectedBrand,
      selectedGm,
      miniDraftProgress: createInitialMiniDraftProgress(),
    });
    const repeatPick = executeInMemoryMakePick({
      selectedCandidate: validCandidate,
      selectedBrand,
      selectedGm,
      miniDraftProgress: firstPick.miniDraftProgress,
    });

    assert.equal(repeatPick.actionStatus, "blocked-candidate-already-drafted");
    assert.deepEqual(repeatPick.blockedReasonIds, ["candidate-already-drafted"]);
    assert.equal(repeatPick.capabilityFlags.canAutoDraft, false);
  });

  it("keeps manual signing open after three picks while budget and candidates remain", () => {
    let flowCallCount = 0;
    const services = {
      createCandidateObjectSet: createNewGMModeDraftPickCandidateObjects,
      createSelectionIntentObject: createNewGMModeDraftSelectionIntentObject,
      runInMemoryDraftFlow(input: Parameters<typeof createNewGMModeInMemoryDraftFlow>[0]) {
        flowCallCount += 1;
        return createNewGMModeInMemoryDraftFlow(input);
      },
    };

    const firstPick = executeInMemoryMakePick({
      selectedCandidate: validCandidate,
      selectedBrand,
      selectedGm,
      miniDraftProgress: createInitialMiniDraftProgress(),
    }, services);
    const secondPick = executeInMemoryMakePick({
      selectedCandidate: secondValidCandidate,
      selectedBrand,
      selectedGm,
      miniDraftProgress: firstPick.miniDraftProgress,
    }, services);
    const thirdPick = executeInMemoryMakePick({
      selectedCandidate: thirdValidCandidate,
      selectedBrand,
      selectedGm,
      miniDraftProgress: secondPick.miniDraftProgress,
    }, services);
    const fourthPick = executeInMemoryMakePick({
      selectedCandidate: fourthValidCandidate,
      selectedBrand,
      selectedGm,
      miniDraftProgress: thirdPick.miniDraftProgress,
    }, services);

    assert.equal(flowCallCount, 4);
    assert.equal(thirdPick.actionStatus, "in-memory-make-pick-succeeded");
    assert.equal(thirdPick.miniDraftProgress.completedPickSummaries.length, 3);
    assert.equal(thirdPick.miniDraftProgress.currentPickIndex, 3);
    assert.equal(thirdPick.miniDraftProgress.miniDraftComplete, false);
    assert.equal(thirdPick.miniDraftProgress.localDraftFinished, false);
    assert.equal(thirdPick.miniDraftProgress.remainingDraftBudget, 91);
    assert.equal(thirdPick.miniDraftProgress.budgetSpent, 29);
    assert.equal(thirdPick.miniDraftProgress.signedTalentCount, 3);
    assert.deepEqual(thirdPick.miniDraftProgress.draftedCandidateIds, [
      "candidate-roman-reigns",
      "candidate-austin-theory",
      "candidate-je-von-evans",
    ]);
    assert.equal(fourthPick.actionStatus, "in-memory-make-pick-succeeded");
    assert.equal(fourthPick.miniDraftProgress.completedPickSummaries.length, 4);
    assert.equal(fourthPick.miniDraftProgress.signedTalentCount, 4);
    assert.equal(fourthPick.miniDraftProgress.remainingDraftBudget, 87);
    assert.equal(fourthPick.capabilityFlags.canCompleteFullDraft, false);
  });

  it("produces local finance-limited draft recap state that stays player-facing and unsaved", () => {
    const firstPick = executeInMemoryMakePick({
      selectedCandidate: validCandidate,
      selectedBrand,
      selectedGm,
      miniDraftProgress: createInitialMiniDraftProgress(),
    });
    const secondPick = executeInMemoryMakePick({
      selectedCandidate: secondValidCandidate,
      selectedBrand,
      selectedGm,
      miniDraftProgress: firstPick.miniDraftProgress,
    });
    const result = executeInMemoryMakePick({
      selectedCandidate: thirdValidCandidate,
      selectedBrand,
      selectedGm,
      miniDraftProgress: secondPick.miniDraftProgress,
    });

    assert.equal(result.localOnly, true);
    assert.equal(result.inMemoryOnly, true);
    assert.equal(result.persisted, false);
    assert.equal(result.projection.projectionKind, "local-finance-limited-draft-recap-projection");
    assert.equal(result.projection.completedInMemory, true);
    assert.equal(result.projection.miniDraftComplete, false);
    assert.equal(result.projection.localDraftFinished, false);
    assert.equal(result.projection.pickCount, 3);
    assert.equal(result.projection.displayLabels.recapStatusLine, "Draft still open");
    assert.equal(
      result.projection.displayLabels.candidateLine,
      "Round 1 / Pick 1: Roman Reigns (Raw, Franchise, Cost 18) | Round 1 / Pick 2: Austin Theory (Raw, Upper Card, Cost 8) | Round 1 / Pick 3: Je'Von Evans (Raw, Prospect, Cost 3)"
    );
    assert.equal(result.projection.displayLabels.budgetLine, "Budget: 91 remaining / 29 spent / reserve 20");
    assert.deepEqual(result.projection.budgetSummary, {
      startingDraftBudget: 120,
      budgetSpent: 29,
      remainingDraftBudget: 91,
      signedTalentCount: 3,
      minimumViableRosterCount: 16,
      minimumRosterTarget: 16,
      minimumRosterViable: false,
      bookingReserveBudget: 20,
      bookingReserveProtected: true,
    });
    assert.equal(result.projection.displayLabels.pickLine, "Draft still open: 3 signed");
    assert.equal(
      result.projection.displayLabels.noteLine,
      "Not saved yet. Week 1, booking, and gameplay start remain locked."
    );
  });

  it("spends local draft budget only through the successful Make Pick path", () => {
    const beforePickFinanceProjection = createNewGMModeDraftFinanceProjection({
      selectedCandidateId: validCandidate.candidateId,
    });
    const pickResult = executeInMemoryMakePick({
      selectedCandidate: validCandidate,
      selectedBrand,
      selectedGm,
      miniDraftProgress: createInitialMiniDraftProgress(),
    });
    const afterPickFinanceProjection = createNewGMModeDraftFinanceProjection({
      selectedCandidateId: secondValidCandidate.candidateId,
      remainingDraftBudgetPreview: pickResult.miniDraftProgress.remainingDraftBudget,
    });

    assert.equal(pickResult.actionStatus, "in-memory-make-pick-succeeded");
    assert.equal(
      beforePickFinanceProjection.remainingDraftBudgetPreview,
      120
    );
    assert.equal(
      afterPickFinanceProjection.remainingDraftBudgetPreview,
      102
    );
    assert.equal(pickResult.miniDraftProgress.remainingDraftBudget, 102);
    assert.equal(pickResult.miniDraftProgress.budgetSpent, 18);
    assert.equal(pickResult.miniDraftProgress.signedTalentCount, 1);
    assert.equal(beforePickFinanceProjection.capabilityFlags.canDeductBudget, false);
    assert.equal(afterPickFinanceProjection.capabilityFlags.canMutateBudget, false);
    assert.equal(collectKeys(pickResult).includes("budgetDeducted"), false);
  });

  it("distinguishes real in-memory recap projection from mock QA preview", () => {
    const html = readPlayableUiFile("index.html");
    const controllerSource = readPlayableUiFile("inMemoryDraftActionController.js");

    assert.match(html, /Mock Draft Recap - no draft executed/);
    assert.match(html, /Preview Recap/);
    assert.match(controllerSource, /Draft Finished Locally/);
    assert.match(controllerSource, /local-finance-limited-draft-recap-projection/);
  });

  it("wires read-only finance projection labels into the draft preview UI", () => {
    const html = readPlayableUiFile("index.html");
    const appSource = readPlayableUiFile("app.js");

    assert.match(html, /Starting Budget: 120/);
    assert.match(html, /Remaining Budget: 120/);
    assert.match(html, /Spent Budget: 0/);
    assert.match(html, /Signed Superstars: 0/);
    assert.match(html, /Minimum Viable Roster: 16/);
    assert.match(html, /Booking Reserve Target: 20/);
    assert.match(html, /Signing Tier: Franchise/);
    assert.match(html, /Signing Cost: 18/);
    assert.match(html, /Budget After Signing: 102/);
    assert.match(html, /updates the budget/);
    assert.match(appSource, /createNewGMModeDraftFinanceProjection/);
    assert.doesNotMatch(appSource, /budgetDeducted|mutateBudget/);
  });

  it("keeps dock visibility correct across draft and dashboard screens", () => {
    assert.equal(shouldShowDock("draft-room"), false);
    assert.equal(shouldShowDock("draft-recap"), false);
    assert.equal(shouldShowDock("brand-dashboard"), true);
  });

  it("does not expose hidden formulas, rolls, or raw engine reads in projection labels", () => {
    const result = executeInMemoryMakePick({
      selectedCandidate: validCandidate,
      selectedBrand,
      selectedGm,
      miniDraftProgress: createInitialMiniDraftProgress(),
    });
    const labelText = Object.values(result.projection.displayLabels).join("\n");
    const forbiddenSnippets = [
      "formula",
      "roll",
      "random",
      "engine",
      "diagnostic",
      "delta",
    ];

    for (const snippet of forbiddenSnippets) {
      assert.equal(labelText.toLowerCase().includes(snippet), false, snippet);
    }
  });

  it("wires Make Pick without storage, network, backend, or Auto Draft calls", () => {
    const changedUiSource = [
      readPlayableUiFile("index.html"),
      readPlayableUiFile("styles.css"),
      readPlayableUiFile("app.js"),
      readPlayableUiFile("screenShellState.js"),
      readPlayableUiFile("draftSelectionIntentAdapter.js"),
      readPlayableUiFile("draftRecapPreviewState.js"),
      readPlayableUiFile("inMemoryDraftActionController.js"),
    ].join("\n");
    const forbiddenSnippets = [
      "fetch",
      "XMLHttpRequest",
      "localStorage",
      "sessionStorage",
      "indexedDB",
      "document.cookie",
      "sqlite",
      "OpenAI",
      "api key",
      ["Math", "random"].join("."),
      "createAutoDraft",
      "AutoDraftService",
    ];

    for (const snippet of forbiddenSnippets) {
      assert.equal(changedUiSource.includes(snippet), false, snippet);
    }
  });

  it("does not create duplicate draft service files", () => {
    const fileNames = readdirSync(join("ui", "playable-new-gm-mode"));
    const forbiddenDuplicateFilePatterns = [
      /DraftPickCreation/i,
      /DraftPickExecution/i,
      /RosterAssignment/i,
      /RosterStateCreation/i,
      /InMemoryDraftFlow/i,
    ];

    for (const fileName of fileNames) {
      assert.equal(
        forbiddenDuplicateFilePatterns.some((pattern) => pattern.test(fileName)),
        false,
        fileName
      );
    }
  });
});

function readPlayableUiFile(fileName: string): string {
  return readFileSync(
    join("ui", "playable-new-gm-mode", fileName),
    "utf8"
  );
}

function collectKeys(source: unknown): string[] {
  if (Array.isArray(source)) {
    return source.flatMap((item) => collectKeys(item));
  }

  if (!source || typeof source !== "object") {
    return [];
  }

  return Object.entries(source).flatMap(([key, value]) => [
    key,
    ...collectKeys(value),
  ]);
}
