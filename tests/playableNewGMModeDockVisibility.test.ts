import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  PRE_GAME_SCREEN_IDS,
  resolveActiveDockSection,
  shouldShowDock,
} from "../ui/playable-new-gm-mode/screenShellState.js";
import {
  DEFAULT_LOCAL_DRAFT_SLOT,
  createCandidateDisplayFromDataset,
  createDraftSelectionIntentPreview,
} from "../ui/playable-new-gm-mode/draftSelectionIntentAdapter.js";

const sectionNavMap = {
  "game-landing": undefined,
  "save-selection": undefined,
  "settings-screen": "settings",
  "contract-signing": undefined,
  "setup-basics": undefined,
  "ai-setup": undefined,
  "choose-gm": undefined,
  "select-brand": undefined,
  "draft-room": "booking",
  "draft-recap": "roster",
  "brand-dashboard": "dashboard",
};

describe("Playable New GM Mode dock visibility", () => {
  it("hides the dock on first-load Game Landing markup", () => {
    const html = readPlayableUiFile("index.html");

    assert.match(html, /<body class="brand-raw is-dock-hidden">/);
    assert.match(
      html,
      /<nav class="bottom-nav-dock dock-collapsed" aria-label="Playable New GM Mode primary dock" aria-hidden="true" hidden>/
    );
    assert.equal(shouldShowDock("game-landing"), false);
  });

  it("hides the dock during pre-game setup and draft onboarding screens", () => {
    const expectedHiddenScreens = [
      "game-landing",
      "save-selection",
      "settings-screen",
      "contract-signing",
      "choose-gm",
      "select-brand",
      "draft-room",
      "draft-recap",
    ];

    for (const screenId of expectedHiddenScreens) {
      assert.equal(PRE_GAME_SCREEN_IDS.includes(screenId), true, screenId);
      assert.equal(shouldShowDock(screenId), false, screenId);
      assert.equal(
        resolveActiveDockSection({ screenId, sectionNavMap }),
        undefined,
        screenId
      );
    }
  });

  it("shows the dock on Brand Dashboard and supports game-shell Settings context", () => {
    assert.equal(shouldShowDock("brand-dashboard"), true);
    assert.equal(
      resolveActiveDockSection({
        screenId: "brand-dashboard",
        sectionNavMap,
      }),
      "dashboard"
    );
    assert.equal(
      shouldShowDock("settings-screen", { navigationContext: "game-shell" }),
      true
    );
    assert.equal(
      resolveActiveDockSection({
        screenId: "settings-screen",
        preferredNavSection: "settings",
        sectionNavMap,
        navigationContext: "game-shell",
      }),
      "settings"
    );
  });

  it("keeps Initial Draft and Draft Recap out of global dock navigation", () => {
    const html = readPlayableUiFile("index.html");
    const dockMarkup = html.slice(
      html.indexOf("<nav class=\"bottom-nav-dock"),
      html.indexOf("</nav>") + "</nav>".length
    );

    assert.equal(dockMarkup.includes('data-nav-target="draft-room"'), false);
    assert.equal(dockMarkup.includes('data-nav-target="draft-recap"'), false);
    assert.match(dockMarkup, /data-nav-section="booking"/);
    assert.match(dockMarkup, /data-nav-section="roster"/);
    assert.match(dockMarkup, /data-nav-section="scouting"/);
  });

  it("clears dock active state and focusability while hidden", () => {
    const source = readPlayableUiFile("app.js");

    assert.match(
      source,
      /const activeNavSection = resolveActiveDockSection\(\{/
    );
    assert.match(source, /navDock\.hidden = !dockVisible;/);
    assert.match(source, /item\.tabIndex = dockVisible \? 0 : -1;/);
    assert.match(source, /item\.removeAttribute\("aria-current"\);/);
  });

  it("keeps local draft actions locked and preserves draft intent preview behavior", () => {
    const html = readPlayableUiFile("index.html");
    const preview = createDraftSelectionIntentPreview({
      selectedCandidate: createCandidateDisplayFromDataset({
        candidateId: "candidate-ace-mercer",
        talentName: "Ace Mercer",
        talentRole: "Main Event / Technical / Veteran",
        talentFit: "Men's division, world title and midcard title eligible.",
        availability: "Available",
        talentRead: "Scouting preview. Draft actions remain locked.",
      }),
      selectedBrand: { brandId: "raw", brandLabel: "Raw" },
      draftSlot: DEFAULT_LOCAL_DRAFT_SLOT,
    });

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
    assert.equal(preview.status, "ready-preview-selection-intent-locked");
    assert.equal(preview.displayLabels.statusLine, "Ready to make pick");
  });

  it("does not add forbidden browser storage or generated-output surfaces to changed UI shell files", () => {
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
