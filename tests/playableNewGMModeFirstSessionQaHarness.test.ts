import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

describe("Playable New GM Mode first-session QA harness", () => {
  it("is exposed as a repeatable package script", () => {
    const packageJson = JSON.parse(readFileSync("package.json", "utf8"));

    assert.equal(
      packageJson.scripts["qa:playable-first-session"],
      "node dev/tools/playable-first-session-qa.js"
    );
    assert.equal(
      packageJson.scripts["qa:playable-first-session:browser"],
      "set PLAYABLE_FIRST_SESSION_QA_MODE=browser&& node dev/tools/playable-first-session-qa.js"
    );
    assert.equal(
      packageJson.scripts["qa:playable-first-session:fallback"],
      "set PLAYABLE_FIRST_SESSION_QA_MODE=fallback&& node dev/tools/playable-first-session-qa.js"
    );
  });

  it("captures the required first-session screens into local artifacts", () => {
    const source = readHarnessSource();

    for (const fileName of [
      "01-title-screen.png",
      "02-setup-basics.png",
      "03-initial-draft.png",
      "04-post-draft-brand-hq.png",
      "05-assign-champions.png",
      "06-create-rivalries.png",
      "07-week-1-hq.png",
      "08-booking.png",
      "09-show-recap.png",
      "10-week-2-hq.png",
    ]) {
      assert.match(source, new RegExp(fileName.replace(".", "\\.")));
    }

    assert.match(source, /test-artifacts/);
    assert.match(source, /playable-first-session/);
  });

  it("covers product rules that have repeatedly regressed", () => {
    const source = readHarnessSource();

    for (const assertionText of [
      "setup exposes starting cash as money",
      "draft screen shows rival brands",
      "player draft pick reduces player budget",
      "post-draft HQ has Assign Champions next action",
      "men's titles only list men's division wrestlers",
      "women's titles only list women's division wrestlers",
      "rivalry dropdowns omit source labels",
      "booking dropdowns omit source labels",
      "booking shows projected show cost",
      "show recap includes finance output",
      "Week 2 HQ has Book Week 2 Show action",
    ]) {
      assert.match(source, new RegExp(escapeRegExp(assertionText)));
    }
  });

  it("covers visual anti-botch checks without becoming a pixel baseline", () => {
    const source = readHarnessSource();

    for (const checkLabel of [
      "active screen marker matches",
      "screen title matches flow step",
      "no horizontal overflow",
      "no full-page vertical scrolling",
      "primary CTA visible",
      "bottom dock clear of primary CTA",
      "no obvious text overflow",
    ]) {
      assert.match(source, new RegExp(escapeRegExp(checkLabel)));
    }
  });

  it("reports browser and fallback mode status clearly", () => {
    const source = readHarnessSource();

    for (const reportField of [
      "browserVisualQa",
      "fallbackQa",
      "screenshotsCaptured",
      "browserFailureReason",
      "Browser visual QA:",
      "Fallback QA:",
    ]) {
      assert.match(source, new RegExp(escapeRegExp(reportField)));
    }

    assert.match(source, /markBrowserSkipped/);
    assert.match(source, /strictBrowserMode/);
    assert.match(source, /process\.exitCode = 1/);
  });

  it("keeps controller fallback product assertions available", () => {
    const source = readHarnessSource();

    for (const fallbackAssertion of [
      "fallback setup exposes starting cash as money",
      "fallback player draft pick reduces player budget",
      "fallback booking shows projected show cost",
      "fallback show recap includes finance output",
      "fallback Week 2 HQ has Book Week 2 Show action",
    ]) {
      assert.match(source, new RegExp(escapeRegExp(fallbackAssertion)));
    }
  });

  it("documents how to run the harness and where artifacts are written", () => {
    const doc = readFileSync(
      join("docs", "playable-first-session-qa-harness.md"),
      "utf8"
    );

    assert.match(doc, /npm run qa:playable-first-session/);
    assert.match(doc, /test-artifacts\/playable-first-session/);
    assert.match(doc, /Screens Covered/);
    assert.match(doc, /Not Covered/);
  });

  it("keeps the harness outside app runtime dependencies", () => {
    const packageJson = JSON.parse(readFileSync("package.json", "utf8"));

    assert.equal(packageJson.dependencies, undefined);
    assert.equal(packageJson.devDependencies?.["@playwright/test"], "^1.60.0");
  });
});

function readHarnessSource(): string {
  return readFileSync(
    join("dev", "tools", "playable-first-session-qa.js"),
    "utf8"
  );
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
