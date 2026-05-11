import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

describe("Playable New GM Mode save/load UI wiring", () => {
  it("exposes player-facing save and continue controls", () => {
    const html = readFileSync("ui/playable-new-gm-mode/index.html", "utf8");

    assert.match(html, /data-continue-save/);
    assert.match(html, /Continue Last Save/);
    assert.match(html, /data-save-current-game/);
    assert.match(html, /Save Current Session/);
    assert.match(html, /class="[^"]*js-save-status/);
    assert.doesNotMatch(html, /localStorage|sessionStorage|indexedDB/);
  });

  it("builds a gameplay state model before posting to the local save endpoint", () => {
    const appSource = readFileSync("ui/playable-new-gm-mode/app.js", "utf8");

    assert.match(appSource, /createPlayableNewGMModeGameplayStateModel/);
    assert.match(appSource, /function createCurrentGameplayStateModel\(\)/);
    assert.match(appSource, /async function saveCurrentGame\(\)/);
    assert.match(appSource, /async function continueLastSave\(\)/);
    assert.match(appSource, /function applyContinuedGameplayStateModel\(gameplayStateModel\)/);
    assert.match(appSource, /createMiniDraftProgressFromGameplayStateModel/);
    assert.match(appSource, /createPostDraftSetupFromGameplayStateModel/);
    assert.match(appSource, /createWeeklyLoopStateFromGameplayStateModel/);
    assert.match(appSource, /createBookingStateFromGameplayStateModel/);
    assert.match(appSource, /cardReadinessLabel/);
    assert.match(appSource, /createLoadedRecapSegment/);
    assert.match(appSource, /matchRatingLabel/);
    assert.match(appSource, /crowdResponseLine/);
    assert.match(appSource, /momentumSignalLine/);
    assert.match(appSource, /socialBuzzLabel/);
    assert.match(appSource, /socialBuzzNote/);
    assert.match(appSource, /fetch\("\/api\/playable-new-gm-mode\/save"/);
    assert.match(appSource, /gameplayStateModel: createCurrentGameplayStateModel\(\)/);
    assert.match(appSource, /applyContinuedGameplayStateModel\(result\.gameplayStateModel\)/);
    assert.match(appSource, /updateSaveStatus/);
  });

  it("routes save and continue through the preview host API", () => {
    const serverSource = readFileSync(
      "dev/tools/playable-ui-preview-server.js",
      "utf8"
    );

    assert.match(serverSource, /\/api\/playable-new-gm-mode\/save/);
    assert.match(serverSource, /handleSaveApiRequest/);
    assert.match(serverSource, /savePlayableNewGMModeGame/);
    assert.match(serverSource, /continuePlayableNewGMModeGame/);
    assert.match(serverSource, /createPlayableSaveApiStatus/);
  });

  it("does not introduce browser storage, GenAI, randomness, or duplicate draft systems in the UI", () => {
    const changedSource = [
      readFileSync("ui/playable-new-gm-mode/index.html", "utf8"),
      readFileSync("ui/playable-new-gm-mode/app.js", "utf8"),
    ].join("\n");
    const forbiddenSnippets = [
      "localStorage",
      "sessionStorage",
      "indexedDB",
      "XMLHttpRequest",
      ["Open", "AI"].join(""),
      ["api", "key"].join(" "),
      "canUseGenAI: true",
      ["create", "Auto", "Draft"].join(""),
      ["Auto", "Draft", "Service"].join(""),
      "matchEngine.run",
      "showEngine.run",
      "fanReactionEngine.run",
      "socialDiscourseEngine.run",
      ["Math", "random"].join("."),
    ];

    for (const snippet of forbiddenSnippets) {
      assert.equal(changedSource.includes(snippet), false, snippet);
    }
  });
});
