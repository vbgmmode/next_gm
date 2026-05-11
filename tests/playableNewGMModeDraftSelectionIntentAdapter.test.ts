import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  DEFAULT_LOCAL_DRAFT_SLOT,
  createCandidateDisplayFromDataset,
  createDraftSelectionIntentPreview,
  createEmptyDraftSelectionIntentPreview,
} from "../ui/playable-new-gm-mode/draftSelectionIntentAdapter.js";

const validCandidate = createCandidateDisplayFromDataset({
  candidateId: "candidate-ace-mercer",
  talentName: "Ace Mercer",
  talentRole: "Main Event / Technical / Veteran",
  talentFit: "Men's division, world title and midcard title eligible.",
  availability: "Available",
  talentRead: "Scouting preview. Draft actions remain locked.",
  starPower: "High",
  starPowerValue: "90",
  ringWork: "Elite",
  ringWorkValue: "94",
  promo: "Strong",
  promoValue: "82",
  durability: "Durable",
  durabilityValue: "88",
  risk: "Low",
  riskValue: "28",
  confidence: "Strong",
  confidenceValue: "84",
});

const unavailableCandidate = createCandidateDisplayFromDataset({
  candidateId: "candidate-ivan-north",
  talentName: "Ivan North",
  talentRole: "Upper Card / Promo Specialist / Powerhouse",
  talentFit: "Men's division, currently blocked for draft preview.",
  availability: "Unavailable",
  talentRead: "Marked unavailable in this board preview. Make Pick stays locked.",
  starPower: "Strong",
  starPowerValue: "82",
  ringWork: "Solid",
  ringWorkValue: "70",
  promo: "Elite",
  promoValue: "90",
  durability: "Limited",
  durabilityValue: "72",
  risk: "High",
  riskValue: "72",
  confidence: "Unclear",
  confidenceValue: "48",
});

const selectedBrand = {
  brandId: "raw",
  brandLabel: "Raw",
};

describe("Playable New GM Mode draft selection intent adapter", () => {
  it("creates a ready UI-safe selection intent preview for an available candidate", () => {
    const preview = createDraftSelectionIntentPreview({
      selectedCandidate: validCandidate,
      selectedBrand,
      draftSlot: DEFAULT_LOCAL_DRAFT_SLOT,
    });

    assert.equal(preview.previewKind, "ui-only-draft-selection-intent-preview");
    assert.equal(preview.uiOnly, true);
    assert.equal(preview.presentationOnly, true);
    assert.equal(preview.readyForPreview, true);
    assert.equal(preview.blocked, false);
    assert.equal(preview.status, "ready-preview-selection-intent-locked");
    assert.deepEqual(preview.selectionIntentPreview, {
      candidateReference: {
        uiCandidateId: "candidate-ace-mercer",
        displayName: "Ace Mercer",
      },
      selectingBrandReference: {
        brandId: "raw",
        brandLabel: "Raw",
        placeholderOnly: true,
      },
      draftOrderReference: {
        roundNumber: 1,
        pickNumber: 1,
        roundLabel: "Round 1",
        pickLabel: "Pick 1",
        placeholderOnly: true,
      },
      validationStatus: "ui-preview-only-validation-not-run",
    });
    assert.equal(
      preview.displayLabels.statusLine,
      "Ready for in-memory Make Pick"
    );
  });

  it("creates a blocked preview for an unavailable candidate without creating a pick", () => {
    const preview = createDraftSelectionIntentPreview({
      selectedCandidate: unavailableCandidate,
      selectedBrand,
    });

    assert.equal(preview.readyForPreview, false);
    assert.equal(preview.blocked, true);
    assert.equal(preview.status, "blocked-preview-candidate-unavailable");
    assert.deepEqual(preview.blockedReasonIds, [
      "candidate-unavailable-for-preview",
    ]);
    assert.equal(
      preview.scoutingProjection.pickPreviewStatus,
      "Preview blocked - candidate unavailable"
    );
  });

  it("creates a deterministic blocked empty preview when the candidate is missing", () => {
    const preview = createDraftSelectionIntentPreview({
      selectedBrand,
    });

    assert.equal(preview.status, "blocked-preview-missing-candidate");
    assert.equal(preview.selectionIntentPreview.candidateReference.uiCandidateId, "candidate-not-selected");
    assert.deepEqual(preview.blockedReasonIds, ["candidate-selection-missing"]);
    assert.equal(preview.displayLabels.candidateLine, "No candidate selected");
  });

  it("creates a deterministic blocked preview when the brand is missing", () => {
    const preview = createDraftSelectionIntentPreview({
      selectedCandidate: validCandidate,
    });

    assert.equal(preview.status, "blocked-preview-missing-brand");
    assert.deepEqual(preview.blockedReasonIds, ["brand-selection-missing"]);
    assert.equal(preview.displayLabels.brandLine, "Brand missing");
  });

  it("resets to an empty blocked preview", () => {
    const preview = createEmptyDraftSelectionIntentPreview();

    assert.equal(preview.status, "blocked-preview-missing-candidate");
    assert.equal(preview.readyForPreview, false);
    assert.equal(preview.displayLabels.candidateLine, "No candidate selected");
    assert.equal(
      preview.displayLabels.noteLine,
      "Preview unavailable until the missing display selection is restored."
    );
  });

  it("keeps adapter output display-safe and free of execution result fields", () => {
    const preview = createDraftSelectionIntentPreview({
      selectedCandidate: validCandidate,
      selectedBrand,
    });
    const keys = collectKeys(preview);
    const forbiddenFieldIds = [
      "draftPickId",
      "draftPickObject",
      "draftPickResult",
      "executionResultObject",
      "rosterAssignment",
      "rosterState",
      "savePayload",
      "sqliteConnection",
      "generatedText",
      "genAIClient",
    ];

    for (const fieldId of forbiddenFieldIds) {
      assert.equal(keys.includes(fieldId), false, fieldId);
    }
    assert.deepEqual(Object.keys(preview.scoutingProjection), [
      "name",
      "roleTier",
      "divisionOrRosterFit",
      "availability",
      "starPower",
      "ringWork",
      "promo",
      "durability",
      "risk",
      "scoutConfidence",
      "scoutNote",
      "pickPreviewStatus",
    ]);
  });

  it("keeps Make Pick controlled, Auto Draft locked, and direct Draft Recap locked in the static UI", () => {
    const html = readPlayableUiFile("index.html");

    assert.match(
      html,
      /<button class="panel-button" type="button" data-make-pick-action disabled aria-disabled="true">Make Pick Locked<\/button>/
    );
    assert.match(
      html,
      /<button class="panel-button" type="button" disabled>Auto Draft Locked<\/button>/
    );
    assert.match(
      html,
      /<button class="hero-cta small" type="button" disabled>Draft Recap Locked<\/button>/
    );
  });

  it("does not call forbidden storage, network, or generated-output surfaces from changed UI files", () => {
    const changedUiSource = [
      readPlayableUiFile("index.html"),
      readPlayableUiFile("app.js"),
      readPlayableUiFile("draftSelectionIntentAdapter.js"),
      readPlayableUiFile("draftRecapPreviewState.js"),
      readPlayableUiFile("inMemoryDraftActionController.js"),
      readPlayableUiFile("screenShellState.js"),
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
