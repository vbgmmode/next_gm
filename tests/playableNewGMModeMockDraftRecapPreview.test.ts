import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { createMockDraftRecapPreviewState } from "../ui/playable-new-gm-mode/draftRecapPreviewState.js";
import { shouldShowDock } from "../ui/playable-new-gm-mode/screenShellState.js";

describe("Playable New GM Mode draft recap preview", () => {
  it("creates UI-local presentation-only recap preview state", () => {
    const preview = createMockDraftRecapPreviewState({
      selectedGm: { gmId: "maren-vale", displayName: "Maren Vale" },
      selectedBrand: { brandId: "raw", brandLabel: "Raw" },
      selectedCandidate: {
        candidateId: "candidate-ace-mercer",
        name: "Ace Mercer",
        availability: "Available",
      },
    });

    assert.equal(preview.previewKind, "ui-only-mock-draft-recap-preview");
    assert.equal(preview.uiOnly, true);
    assert.equal(preview.presentationOnly, true);
    assert.equal(preview.mockOnly, true);
    assert.equal(preview.phase, "draft-recap-preview");
    assert.deepEqual(preview.selectedGmReference, {
      hasGm: true,
      gmId: "maren-vale",
      displayName: "Maren Vale",
      placeholderOnly: true,
    });
    assert.equal(preview.selectedBrandReference.brandLabel, "Raw");
    assert.equal(preview.selectedCandidateReference.displayName, "Ace Mercer");
    assert.equal(
      preview.displayLabels.recapStatusLine,
      "Finish Draft to open the recap"
    );
  });

  it("keeps recap preview state free of real draft, roster, persistence, and gameplay fields", () => {
    const preview = createMockDraftRecapPreviewState();
    const keys = collectKeys(preview);
    const forbiddenFieldIds = [
      "draftPickId",
      "draftPickObject",
      "draftPickResult",
      "executionResultObject",
      "rosterAssignment",
      "rosterState",
      "draftCompletionSummary",
      "savePayload",
      "sqliteConnection",
      "generatedText",
      "genAIClient",
      "weekState",
    ];

    for (const fieldId of forbiddenFieldIds) {
      assert.equal(keys.includes(fieldId), false, fieldId);
    }
  });

  it("keeps local draft actions locked and keeps a separate recap preview CTA", () => {
    const html = readPlayableUiFile("index.html");

    assert.match(
      html,
      /<button class="panel-button" type="button" data-make-pick-action disabled aria-disabled="true">Make Pick Locked<\/button>/
    );
    assert.match(
      html,
      /<button class="panel-button" type="button" data-auto-fill-minimum-roster disabled aria-disabled="true">Auto-Fill Locked<\/button>/
    );
    assert.match(
      html,
      /<button class="panel-button" type="button" data-finish-local-draft disabled aria-disabled="true">Finish Locked<\/button>/
    );
    assert.match(
      html,
      /<button class="hero-cta small" type="button" data-local-recap-action disabled aria-disabled="true">Draft Recap Locked<\/button>/
    );
    assert.match(
      html,
      /<button class="ghost-button qa-preview-button" type="button" data-preview-go-to="draft-recap">Preview Recap<\/button>/
    );
  });

  it("wires the preview CTA to Draft Recap and keeps Week 1 HQ reachable from setup", () => {
    const html = readPlayableUiFile("index.html");
    const appSource = readPlayableUiFile("app.js");

    assert.match(appSource, /previewControls = Array\.from\(document\.querySelectorAll\("\[data-preview-go-to\]"\)\)/);
    assert.match(appSource, /createMockDraftRecapPreviewFromUiState/);
    assert.match(appSource, /showSection\(control\.dataset\.previewGoTo\);/);
    assert.match(html, /data-go-to="championship-setup"/);
    assert.match(html, /data-go-to="rivalry-setup"/);
    assert.match(html, /data-go-to="brand-dashboard"/);
  });

  it("labels Draft Recap and Week 1 HQ with player-facing setup copy", () => {
    const html = readPlayableUiFile("index.html");

    assert.match(html, /Post-Draft Brand HQ/);
    assert.match(html, /Command Center Arrival/);
    assert.match(html, /Draft Rules \/ Budget Intro/);
    assert.match(html, /Talent belongs to drafting brand/);
    assert.match(html, /Finish Draft to open the recap/);
    assert.match(html, /Crown your champions, build one rivalry, then book Week 1\./);
    assert.match(html, /Assign Champions/);
    assert.match(html, /Create Rivalries/);
    assert.match(html, /Week 1 HQ/);
    assert.match(html, /Book Week 1 Show|Booking Locked/);
  });

  it("keeps the dock hidden until Brand Dashboard", () => {
    assert.equal(shouldShowDock("draft-room"), false);
    assert.equal(shouldShowDock("draft-recap"), false);
    assert.equal(shouldShowDock("brand-dashboard"), true);
  });

  it("does not add forbidden browser storage or generated-output surfaces to changed UI files", () => {
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
      "XMLHttpRequest",
      "localStorage",
      "sessionStorage",
      "indexedDB",
      "document.cookie",
      "sqlite",
      ["Open", "AI"].join(""),
      ["api", "key"].join(" "),
      ["Math", "random"].join("."),
    ];

    for (const snippet of forbiddenSnippets) {
      assert.equal(changedUiSource.includes(snippet), false, snippet);
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
