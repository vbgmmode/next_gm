import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { createMockDraftRecapPreviewState } from "../ui/playable-new-gm-mode/draftRecapPreviewState.js";
import { shouldShowDock } from "../ui/playable-new-gm-mode/screenShellState.js";

describe("Playable New GM Mode mock draft recap preview", () => {
  it("creates UI-local presentation-only mock recap state", () => {
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
    assert.equal(preview.phase, "qa-preview-post-draft-flow");
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
      "Mock Draft Recap - no draft executed"
    );
  });

  it("keeps mock recap state free of real draft, roster, persistence, and gameplay fields", () => {
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

  it("keeps local draft actions locked and keeps a separate mock continuation CTA", () => {
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
      /<button class="ghost-button qa-preview-button" type="button" data-preview-go-to="draft-recap">QA Preview: Mock Draft Recap<\/button>/
    );
  });

  it("wires the preview CTA to Draft Recap and keeps Brand Dashboard reachable from recap", () => {
    const html = readPlayableUiFile("index.html");
    const appSource = readPlayableUiFile("app.js");

    assert.match(appSource, /previewControls = Array\.from\(document\.querySelectorAll\("\[data-preview-go-to\]"\)\)/);
    assert.match(appSource, /createMockDraftRecapPreviewFromUiState/);
    assert.match(appSource, /showSection\(control\.dataset\.previewGoTo\);/);
    assert.match(
      html,
      /<button class="hero-cta small" type="button" data-go-to="brand-dashboard">Continue to Brand Dashboard Preview<\/button>/
    );
  });

  it("labels mock Draft Recap and Brand Dashboard as preview-only shell surfaces", () => {
    const html = readPlayableUiFile("index.html");

    assert.match(html, /Mock Post-Draft Preview/);
    assert.match(html, /Mock Draft Recap - no draft executed/);
    assert.match(html, /No pick, roster assignment, roster state, or draft completion summary exists\./);
    assert.match(html, /Week 1 Setup preview - draft and roster creation still locked/);
  });

  it("keeps the dock hidden until Brand Dashboard", () => {
    assert.equal(shouldShowDock("draft-room"), false);
    assert.equal(shouldShowDock("draft-recap"), false);
    assert.equal(shouldShowDock("brand-dashboard"), true);
  });

  it("does not add forbidden storage, network, or generated-output surfaces to changed UI files", () => {
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
