import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  createInitialMiniDraftProgress,
  createPostDraftRosterHubProjection,
  executeAutoFillMinimumRoster,
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
const manualCandidate = Object.freeze({
  candidateId: "candidate-roman-reigns",
  name: "Roman Reigns",
  availability: "Available",
});

describe("Playable New GM Mode post-draft roster screen", () => {
  it("keeps the roster hub locked before Finish Draft", () => {
    const projection = createPostDraftRosterHubProjection({
      selectedBrand,
      miniDraftProgress: createInitialMiniDraftProgress({ selectedBrand }),
    });

    assert.equal(projection.locked, true);
    assert.equal(projection.localDraftFinished, false);
    assert.equal(
      projection.displayLabels.statusLine,
      "Finish the draft to view your roster."
    );
    assert.deepEqual(projection.signedTalent, []);
    assert.equal(projection.summary.signedTalentCount, 0);
    assert.equal(projection.summary.localOnly, true);
    assert.equal(projection.summary.persisted, false);
  });

  it("displays manual and auto-filled signed talent after Finish Draft", () => {
    const manualPick = executeInMemoryMakePick({
      selectedCandidate: manualCandidate,
      selectedBrand,
      selectedGm,
      miniDraftProgress: createInitialMiniDraftProgress({ selectedBrand }),
    });
    const autoFill = executeAutoFillMinimumRoster({
      selectedBrand,
      selectedGm,
      miniDraftProgress: manualPick.miniDraftProgress,
    });
    const finished = executeLocalFinishDraft({
      selectedBrand,
      selectedGm,
      miniDraftProgress: autoFill.miniDraftProgress,
    });
    const projection = createPostDraftRosterHubProjection({
      selectedBrand,
      miniDraftProgress: finished.miniDraftProgress,
    });
    const manualSigning = projection.signedTalent.find(
      (talent) => talent.displayName === "Roman Reigns"
    );
    const autoFilledSigning = projection.signedTalent.find(
      (talent) => talent.pickSource === "Auto-Filled"
    );

    assert.equal(finished.actionStatus, "local-draft-finished");
    assert.equal(projection.locked, false);
    assert.equal(projection.signedTalent.length, 16);
    assert.equal(manualSigning?.pickSource, "Manual");
    assert.equal(manualSigning?.signingTier, "Franchise");
    assert.equal(manualSigning?.signingCost, 18);
    assert.equal(manualSigning?.activeBrandLabel, "Raw");
    assert.equal(manualSigning?.signedToBrandLine, "Signed to Raw");
    assert.match(manualSigning?.draftedFromLine || "", /Drafted From (Raw|SmackDown|NXT|AEW)/);
    assert.match(manualSigning?.sourceRosterPool || "", /Raw|SmackDown|NXT|AEW/);
    assert.equal(manualSigning?.signedStatus, "Signed");
    assert.equal(autoFilledSigning?.pickSource, "Auto-Filled");
    assert.equal(autoFilledSigning?.activeBrandLabel, "Raw");
    assert.equal(autoFilledSigning?.signedToBrandLine, "Signed to Raw");
    assert.match(autoFilledSigning?.draftedFromLine || "", /Drafted From (Raw|SmackDown|NXT|AEW)/);
    assert.match(
      autoFilledSigning?.sourceRosterPool || "",
      /Raw|SmackDown|NXT|AEW/
    );
    assert.equal(autoFilledSigning?.signedStatus, "Signed");
  });

  it("shows roster summary budget, viability, reserve, and local-only status", () => {
    const autoFill = executeAutoFillMinimumRoster({
      selectedBrand,
      selectedGm,
      miniDraftProgress: createInitialMiniDraftProgress({ selectedBrand }),
    });
    const finished = executeLocalFinishDraft({
      selectedBrand,
      selectedGm,
      miniDraftProgress: autoFill.miniDraftProgress,
    });
    const projection = createPostDraftRosterHubProjection({
      selectedBrand,
      miniDraftProgress: finished.miniDraftProgress,
    });

    assert.equal(projection.summary.signedTalentCount, 16);
    assert.equal(projection.summary.minimumViableRosterCount, 16);
    assert.equal(projection.summary.minimumRosterViable, true);
    assert.equal(projection.summary.startingDraftBudget, 120);
    assert.equal(projection.summary.budgetSpent, 48);
    assert.equal(projection.summary.remainingDraftBudget, 72);
    assert.equal(projection.summary.bookingReserveBudget, 20);
    assert.equal(projection.summary.bookingReserveProtected, true);
    assert.equal(
      projection.displayLabels.bookingReserveStatusLine,
      "Booking reserve protected"
    );
    assert.equal(
      projection.displayLabels.localOnlyLine,
      "Local Draft Only / Not Saved Yet"
    );
    assert.equal(projection.displayLabels.weekOneLockedLine, "Week 1 Locked");
  });

  it("keeps championship, rivalry, Week 1, and save setup cards locked display-only", () => {
    const projection = createPostDraftRosterHubProjection({
      selectedBrand,
      miniDraftProgress: createInitialMiniDraftProgress({ selectedBrand }),
    });

    assert.deepEqual(
      projection.lockedSetupCards.map((card) => ({
        label: card.label,
        status: card.status,
        locked: card.locked,
        displayOnly: card.displayOnly,
      })),
      [
        {
          label: "Championship Setup",
          status: "Setup Locked",
          locked: true,
          displayOnly: true,
        },
        {
          label: "Rivalry Setup",
          status: "Setup Locked",
          locked: true,
          displayOnly: true,
        },
        {
          label: "Week 1 HQ",
          status: "Week 1 Locked",
          locked: true,
          displayOnly: true,
        },
        {
          label: "Save",
          status: "Not Saved Yet",
          locked: true,
          displayOnly: true,
        },
      ]
    );
  });

  it("wires the roster hub UI without exposing backend diagnostics or raw IDs", () => {
    const html = readPlayableUiFile("index.html");
    const appSource = readPlayableUiFile("app.js");

    assert.match(html, /id="draft-recap"/);
    assert.match(html, /Draft Recap/);
    assert.match(html, /draft-recap-roster-list/);
    assert.match(html, /id="roster-hub"/);
    assert.match(html, /Finish the draft to view your roster\./);
    assert.match(html, /post-draft-roster-list/);
    assert.match(html, /Championship Setup/);
    assert.match(html, /Rivalry Setup/);
    assert.match(html, /Week 1 HQ/);
    assert.match(html, />Save<\/strong>/);
    assert.match(appSource, /createPostDraftRosterHubProjection/);
    assert.match(appSource, /updateDraftRecapCommandSurface/);
    assert.doesNotMatch(html, /candidateId|fixtureId|validation object|diagnostic/i);
  });

  it("does not add browser storage, generated text, or engine calls", () => {
    const changedSource = [
      readPlayableUiFile("index.html"),
      readPlayableUiFile("styles.css"),
      readPlayableUiFile("app.js"),
      readPlayableUiFile("inMemoryDraftActionController.js"),
    ].join("\n");
    const forbiddenSnippets = [
      "XMLHttpRequest",
      "localStorage",
      "sessionStorage",
      "indexedDB",
      "document.cookie",
      "INSERT INTO",
      "UPDATE ",
      "DELETE ",
      "sqlite",
      "savePayloadCreated",
      "gameplayPayloadCreated",
      "generatedTextCreated: true",
      "canUseGenAI: true",
      "createAutoDraft",
      "AutoDraftService",
      "match-engine-v0",
      "show-engine-v0",
      "fan-reaction-engine-v0",
      "social-discourse-engine-v0",
    ];

    for (const snippet of forbiddenSnippets) {
      assert.equal(changedSource.includes(snippet), false, snippet);
    }
  });
});

function readPlayableUiFile(fileName: string): string {
  return readFileSync(
    join("ui", "playable-new-gm-mode", fileName),
    "utf8"
  );
}
