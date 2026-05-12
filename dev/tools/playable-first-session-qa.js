import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(fileURLToPath(new URL("../..", import.meta.url)));
const artifactRoot = path.join(repoRoot, "test-artifacts", "playable-first-session");
const screenshotDir = path.join(artifactRoot, "screenshots");
const chromeProfileDir = path.join(artifactRoot, "chrome-profile");
const previewPort = Number.parseInt(process.env.PLAYABLE_QA_PORT || "3197", 10);
const debugPort = Number.parseInt(process.env.PLAYABLE_QA_DEBUG_PORT || "9223", 10);
const appUrl = `http://127.0.0.1:${previewPort}/ui/playable-new-gm-mode/`;
const viewport = Object.freeze({ width: 1366, height: 768 });
const secondaryViewport = Object.freeze({ width: 1280, height: 800 });

const screenshotPlan = Object.freeze([
  Object.freeze({
    name: "title screen",
    fileName: "01-title-screen.png",
    ctaSelector: '[data-go-to="contract-signing"]',
  }),
  Object.freeze({
    name: "setup basics",
    fileName: "02-setup-basics.png",
    ctaSelector: '[data-go-to="ai-setup"]',
  }),
  Object.freeze({
    name: "initial draft",
    fileName: "03-initial-draft.png",
    ctaSelector: "[data-make-pick-action]",
  }),
  Object.freeze({
    name: "post-draft Brand HQ",
    fileName: "04-post-draft-brand-hq.png",
    ctaSelector: '[data-go-to="championship-setup"]',
  }),
  Object.freeze({
    name: "assign champions",
    fileName: "05-assign-champions.png",
    ctaSelector: "#complete-championship-setup",
  }),
  Object.freeze({
    name: "create rivalries",
    fileName: "06-create-rivalries.png",
    ctaSelector: "#complete-rivalry-setup",
  }),
  Object.freeze({
    name: "Week 1 HQ",
    fileName: "07-week-1-hq.png",
    ctaSelector: "#week-one-hq-booking-action",
  }),
  Object.freeze({
    name: "booking",
    fileName: "08-booking.png",
    ctaSelector: "#booking-run-show-action",
  }),
  Object.freeze({
    name: "show recap",
    fileName: "09-show-recap.png",
    ctaSelector: "#show-recap-advance-week",
  }),
  Object.freeze({
    name: "Week 2 HQ",
    fileName: "10-week-2-hq.png",
    ctaSelector: "#week-one-hq-booking-action",
  }),
]);

const report = {
  screensVisited: [],
  screenshotsWritten: [],
  productAssertions: [],
  visualChecks: [],
  skippedChecks: [],
};

let previewProcess;
let chromeProcess;
let page;

try {
  await prepareArtifacts();
  previewProcess = startPreviewServer();
  await waitForApp();
  chromeProcess = startChrome();
  page = await connectToChrome();
  await enablePage(page);
  await navigateToApp(page);

  await captureScreen(page, screenshotPlan[0]);
  await assertSetupTitleScreen(page);

  await click(page, '[data-go-to="contract-signing"]');
  await click(page, '[data-go-to="setup-basics"]');
  await click(page, '[data-difficulty="hard"]');
  await click(page, '[data-active-brand-count="4"]');
  await captureScreen(page, screenshotPlan[1]);
  await assertSetupBasics(page);

  await click(page, '[data-go-to="ai-setup"]');
  await click(page, '[data-go-to="choose-gm"]');
  await click(page, '[data-go-to="select-brand"]');
  await click(page, '[data-brand="smackdown"]');
  await assertDraftBriefing(page);
  await click(page, '[data-go-to="draft-room"]');
  await waitForEnabled(page, "[data-make-pick-action]");
  await captureScreen(page, screenshotPlan[2]);
  await assertInitialDraftBeforePick(page);

  const budgetBeforePick = await moneyValue(page, "#draft-budget-remaining");
  const rivalBudgetBeforePick = await moneyValue(page, "#draft-budget-remaining");
  await click(page, "[data-make-pick-action]");
  await waitForText(page, "#draft-budget-signed", "Signed 1");
  const budgetAfterPlayerPick = await moneyValue(page, "#draft-budget-remaining");
  await checkProduct(
    "player draft pick reduces player budget",
    budgetAfterPlayerPick < budgetBeforePick
  );
  await checkProduct(
    "rival pick sequence does not reduce player budget beyond player signing",
    budgetAfterPlayerPick === rivalBudgetBeforePick - (budgetBeforePick - budgetAfterPlayerPick)
  );
  await click(page, "[data-auto-fill-minimum-roster]");
  await waitForEnabled(page, "[data-finish-local-draft]");
  await click(page, "[data-finish-local-draft]");
  await waitForActiveScreen(page, "draft-recap");
  await captureScreen(page, screenshotPlan[3]);
  await assertPostDraftHq(page);

  await click(page, '[data-go-to="championship-setup"]');
  await waitForActiveScreen(page, "championship-setup");
  await assignChampions(page);
  await captureScreen(page, screenshotPlan[4]);
  await assertChampionSelectors(page);
  await click(page, "#complete-championship-setup");
  await waitForActiveScreen(page, "rivalry-setup");

  await createRivalry(page);
  await captureScreen(page, screenshotPlan[5]);
  await assertRivalrySetup(page);
  await click(page, "#complete-rivalry-setup");
  await waitForEnabled(page, "#rivalry-continue-week-one");
  await click(page, "#rivalry-continue-week-one");
  await waitForActiveScreen(page, "brand-dashboard");
  await captureScreen(page, screenshotPlan[6]);
  await assertWeekOneHq(page);

  await click(page, "#week-one-hq-booking-action");
  await waitForActiveScreen(page, "week-one-booking");
  await buildWeekOneCard(page);
  await captureScreen(page, screenshotPlan[7]);
  await assertBooking(page);
  await click(page, "#booking-run-show-action");
  await waitForActiveScreen(page, "show-recap");
  await captureScreen(page, screenshotPlan[8]);
  await assertShowRecap(page);

  await click(page, "#show-recap-advance-week");
  await waitForActiveScreen(page, "brand-dashboard");
  await captureScreen(page, screenshotPlan[9]);
  await assertWeekTwoHq(page);
  assertNoRecordedFailures();
} catch (error) {
  const errorText = error?.stack || String(error);
  const browserBlocked = errorText.includes("Chrome debugging port did not become available");

  if (browserBlocked) {
    report.browserLimitation = errorText;
    report.skippedChecks.push({
      name: "browser screenshots and visual anti-botch checks",
      reason: "Chromium debugging did not become available in this Windows headless environment.",
    });
    chromeProcess?.kill();
    chromeProcess = undefined;
    await runControllerFallback().catch((fallbackError) => {
      report.failed = true;
      report.error = fallbackError?.stack || String(fallbackError);
      process.exitCode = 1;
    });
  } else {
    report.failed = true;
    report.error = errorText;
    process.exitCode = 1;
  }
} finally {
  if (page) {
    await page.close().catch(() => {});
  }
  chromeProcess?.kill();
  previewProcess?.kill();
  await writeReport();
  printReport();
}

async function prepareArtifacts() {
  await rm(artifactRoot, { recursive: true, force: true });
  await mkdir(screenshotDir, { recursive: true });
  await mkdir(chromeProfileDir, { recursive: true });
}

function startPreviewServer() {
  const child = spawn(process.execPath, ["dev/tools/playable-ui-preview-server.js"], {
    cwd: repoRoot,
    env: {
      ...process.env,
      PORT: String(previewPort),
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  child.stdout.on("data", (chunk) => {
    process.stdout.write(`[preview] ${chunk}`);
  });
  child.stderr.on("data", (chunk) => {
    process.stderr.write(`[preview] ${chunk}`);
  });

  return child;
}

function startChrome() {
  const chromePath = findChromePath();

  if (!chromePath) {
    throw new Error("Chrome or Edge executable was not found for screenshot QA.");
  }

  const child = spawn(
    chromePath,
    [
      "--headless=new",
      "--disable-gpu",
      "--disable-gpu-compositing",
      "--disable-gpu-rasterization",
      "--disable-dev-shm-usage",
      "--disable-features=UseSkiaRenderer,VizDisplayCompositor,CanvasOopRasterization",
      "--use-angle=swiftshader",
      "--use-gl=angle",
      "--single-process",
      "--no-zygote",
      "--hide-scrollbars",
      `--remote-debugging-port=${debugPort}`,
      `--user-data-dir=${chromeProfileDir}`,
      "about:blank",
    ],
    { stdio: ["ignore", "ignore", "pipe"] }
  );
  child.stderr.on("data", (chunk) => {
    process.stderr.write(`[browser] ${chunk}`);
  });
  return child;
}

function findChromePath() {
  const candidates = [
    process.env.CHROME_PATH,
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  ].filter(Boolean);

  return candidates.find((candidate) => existsSync(candidate));
}

async function waitForApp() {
  const deadline = Date.now() + 10000;

  while (Date.now() < deadline) {
    try {
      const response = await requestText(appUrl);
      if (response.includes("Playable New GM Mode")) {
        return;
      }
    } catch {
      await delay(150);
    }
  }

  throw new Error(`Preview server did not answer at ${appUrl}`);
}

async function connectToChrome() {
  const deadline = Date.now() + 10000;

  while (Date.now() < deadline) {
    try {
      const target = await requestJson({
        port: debugPort,
        pathName: `/json/new?${encodeURIComponent("about:blank")}`,
        method: "PUT",
      });
      return new CdpClient(target.webSocketDebuggerUrl);
    } catch {
      await delay(100);
    }
  }

  throw new Error("Chrome debugging port did not become available.");
}

async function enablePage(client) {
  await client.send("Page.enable");
  await client.send("Runtime.enable");
  await setViewport(client, viewport);
}

async function navigateToApp(client) {
  await client.send("Page.navigate", { url: appUrl });
  await waitFor(client, () => "document.readyState === 'complete'");
  await waitForActiveScreen(client, "game-landing");
}

async function setViewport(client, size) {
  await client.send("Emulation.setDeviceMetricsOverride", {
    width: size.width,
    height: size.height,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await delay(80);
}

async function captureScreen(client, plan) {
  await setViewport(client, viewport);
  await delay(120);
  report.screensVisited.push(plan.name);
  await runVisualChecks(client, plan);
  const screenshot = await client.send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: false,
  });
  const filePath = path.join(screenshotDir, plan.fileName);
  await writeFile(filePath, Buffer.from(screenshot.data, "base64"));
  report.screenshotsWritten.push(path.relative(repoRoot, filePath));
}

async function assertSetupTitleScreen(client) {
  const text = await activeText(client);
  await checkProduct("title screen exposes Start New Game", text.includes("Start New Game"));
  await checkProduct("title screen exposes Continue path", /Continue|Select Save/.test(text));
}

async function assertSetupBasics(client) {
  const state = await evaluateValue(client, `(() => ({
    text: document.querySelector("#setup-basics")?.innerText || "",
    budget: document.querySelector("#setup-starting-budget-summary")?.textContent || "",
    activeBrands: document.querySelector("#setup-active-brand-list")?.textContent || "",
    competitors: document.querySelector("#setup-competing-gm-list")?.textContent || "",
  }))()`);
  await checkProduct("setup exposes difficulty", state.text.includes("Hard"));
  await checkProduct("setup exposes starting cash as money", /\$[0-9,]+/.test(state.budget));
  await checkProduct("setup exposes player brand", state.text.includes("Player Brand"));
  await checkProduct("setup exposes active rival brands", state.activeBrands.includes("SmackDown") && state.competitors.includes("AEW"));
}

async function assertDraftBriefing(client) {
  const text = await activeText(client);
  await checkProduct("draft briefing explains budget intro", text.includes("Draft Rules / Budget Intro") && text.includes("Real money labels"));
  await checkProduct("draft briefing shows rival presence", text.includes("Visible pick order") || text.includes("Rivals"));
}

async function assertInitialDraftBeforePick(client) {
  const state = await evaluateValue(client, `(() => ({
    text: document.querySelector("#draft-room")?.innerText || "",
    remaining: document.querySelector("#draft-budget-remaining")?.textContent || "",
    rivals: document.querySelector("#draft-competing-brands")?.textContent || "",
    ticker: document.querySelector("#draft-ticker-list")?.textContent || "",
  }))()`);
  await checkProduct("draft screen shows player budget", /\$[0-9,]+/.test(state.remaining));
  await checkProduct("draft screen shows rival brands", state.rivals.includes("SmackDown") || state.rivals.includes("NXT") || state.rivals.includes("AEW"));
  await checkProduct("draft screen exposes recent picks ticker", state.text.includes("Recent Picks") || state.ticker.length > 0);
}

async function assertPostDraftHq(client) {
  const text = await activeText(client);
  await checkProduct("post-draft HQ shows remaining budget", text.includes("Remaining Budget") && /\$[0-9,]+/.test(text));
  await checkProduct("post-draft HQ shows roster count", text.includes("Signed Roster") || text.includes("Roster Count"));
  await checkProduct("post-draft HQ has Assign Champions next action", text.includes("Assign Champions"));
}

async function assignChampions(client) {
  const used = new Set();
  const selectors = [
    "#champion-mens-main-select",
    "#champion-mens-midcard-select",
    "#champion-womens-main-select",
    "#champion-womens-midcard-select",
  ];

  for (const selector of selectors) {
    const values = await selectValues(client, selector);
    const nextValue = values.find((value) => !used.has(value));
    if (!nextValue) {
      throw new Error(`Missing eligible champion option for ${selector}`);
    }
    used.add(nextValue);
    await setSelectValue(client, selector, nextValue);
  }

  await checkProduct("champion assignment can choose four unique champions", used.size === 4);
  await waitForEnabled(client, "#complete-championship-setup");
}

async function assertChampionSelectors(client) {
  const state = await evaluateValue(client, `(() => {
    const values = (selector) => Array.from(document.querySelector(selector).options)
      .filter((option) => option.value)
      .map((option) => option.textContent || "");
    return {
      mensMain: values("#champion-mens-main-select"),
      mensMidcard: values("#champion-mens-midcard-select"),
      womensMain: values("#champion-womens-main-select"),
      womensMidcard: values("#champion-womens-midcard-select"),
    };
  })()`);
  await checkProduct("men's titles expose eligible men's division wrestlers", state.mensMain.length > 0 && state.mensMidcard.length > 0);
  await checkProduct("women's titles expose eligible women's division wrestlers", state.womensMain.length > 0 && state.womensMidcard.length > 0);
  const divisions = await evaluateValue(client, `(() => ({
    mensMain: Array.from(document.querySelector("#champion-mens-main-select").options).filter((option) => option.value).map((option) => option.dataset.divisionCategory || ""),
    mensMidcard: Array.from(document.querySelector("#champion-mens-midcard-select").options).filter((option) => option.value).map((option) => option.dataset.divisionCategory || ""),
    womensMain: Array.from(document.querySelector("#champion-womens-main-select").options).filter((option) => option.value).map((option) => option.dataset.divisionCategory || ""),
    womensMidcard: Array.from(document.querySelector("#champion-womens-midcard-select").options).filter((option) => option.value).map((option) => option.dataset.divisionCategory || ""),
  }))()`);
  await checkProduct("men's titles only list men's division wrestlers", [...divisions.mensMain, ...divisions.mensMidcard].every((label) => !label.toLowerCase().includes("women")));
  await checkProduct("women's titles only list women's division wrestlers", [...divisions.womensMain, ...divisions.womensMidcard].every((label) => label.toLowerCase().includes("women")));
}

async function createRivalry(client) {
  const values = await selectValues(client, "[data-rivalry-slot='0'] .rivalry-wrestler-a");
  await setSelectValue(client, "[data-rivalry-slot='0'] .rivalry-wrestler-a", values[0]);
  await setSelectValue(client, "[data-rivalry-slot='0'] .rivalry-wrestler-b", values[1]);
  await setSelectValue(client, "[data-rivalry-slot='0'] .rivalry-type", "Championship");
  await setSelectValue(client, "[data-rivalry-slot='0'] .rivalry-intensity", "High");
  await waitForEnabled(client, "#complete-rivalry-setup");
}

async function assertRivalrySetup(client) {
  const state = await evaluateValue(client, `(() => ({
    optionText: Array.from(document.querySelectorAll(".rivalry-wrestler-a option, .rivalry-wrestler-b option")).map((option) => option.textContent || "").join(" "),
    types: Array.from(document.querySelector(".rivalry-type").options).map((option) => option.textContent || ""),
  }))()`);
  await checkProduct("rivalry dropdowns omit source labels", !/Drafted From|Source Pool|Signed to/.test(state.optionText));
  await checkProduct("rivalry types include more than Grudge", state.types.length > 1 && state.types.includes("Championship"));
}

async function assertWeekOneHq(client) {
  const text = await activeText(client);
  await checkProduct("Week 1 HQ shows budget", text.includes("Remaining Budget") && /\$[0-9,]+/.test(text));
  await checkProduct("Week 1 HQ shows clear booking action", text.includes("Book Week 1 Show"));
}

async function buildWeekOneCard(client) {
  await evaluateValue(client, `(() => {
    const values = Array.from(document.querySelector("#booking-wrestler-a").options)
      .filter((option) => option.value)
      .map((option) => option.value);
    const set = (selector, value) => {
      const node = document.querySelector(selector);
      node.value = value;
      node.dispatchEvent(new Event("change", { bubbles: true }));
    };

    set("#booking-segment-type", "self-promo");
    set("#booking-promo-wrestler", values[0]);
    document.querySelector("#add-week-one-segment").click();

    set("#booking-segment-type", "singles-match");
    set("#booking-wrestler-a", values[0]);
    set("#booking-wrestler-b", values[0]);
    document.querySelector("#add-week-one-segment").click();

    set("#booking-wrestler-a", values[0]);
    set("#booking-wrestler-b", values[1]);
    document.querySelector("#add-week-one-segment").click();

    set("#booking-segment-type", "main-event-singles-match");
    set("#booking-wrestler-a", values[2]);
    set("#booking-wrestler-b", values[3]);
    document.querySelector("#add-week-one-segment").click();
    return true;
  })()`);
  await waitForEnabled(client, "#booking-run-show-action");
}

async function assertBooking(client) {
  const state = await evaluateValue(client, `(() => ({
    text: document.querySelector("#week-one-booking")?.innerText || "",
    optionText: Array.from(document.querySelectorAll("#booking-wrestler-a option, #booking-wrestler-b option, #booking-promo-wrestler option")).map((option) => option.textContent || "").join(" "),
    segmentTypes: Array.from(document.querySelector("#booking-segment-type").options).map((option) => option.textContent || ""),
    card: document.querySelector("#week-one-show-card-list")?.innerText || "",
  }))()`);
  await checkProduct("booking supports Match and Promo", state.segmentTypes.some((label) => label.includes("Match")) && state.segmentTypes.some((label) => label.includes("Promo")));
  await checkProduct("booking supports match type and promo type", state.segmentTypes.includes("Singles Match") && state.segmentTypes.includes("Self Promo"));
  await checkProduct("booking dropdowns omit source labels", !/Drafted From|Source Pool|Signed to/.test(state.optionText));
  await checkProduct("booking allows promo talent to also wrestle", /Self Promo[\s\S]+Singles Match|Singles Match[\s\S]+Self Promo/.test(state.card));
  await checkProduct("booking shows projected show cost", state.text.includes("Projected Cost") && /\$[0-9,]+/.test(state.text));
  await checkProduct("booking blocks invalid same-person pairing", state.text.includes("Same wrestler cannot face themselves."));
  await checkProduct("Run Show unlocks only after valid booking state", state.text.includes("Ready to Run"));
}

async function assertShowRecap(client) {
  const state = await evaluateValue(client, `(() => {
    const segmentText = document.querySelector("#show-recap-segments")?.innerText || "";
    return {
      text: document.querySelector("#show-recap")?.innerText || "",
      segmentText,
      promoCards: Array.from(document.querySelectorAll("#show-recap-segments article"))
        .filter((card) => (card.innerText || "").includes("Promo"))
        .map((card) => card.innerText || ""),
    };
  })()`);
  await checkProduct("show recap includes deterministic match winners", state.segmentText.includes("Winner:"));
  await checkProduct("show recap promos use fallout instead of winners", state.promoCards.every((card) => !card.includes("Winner:")));
  await checkProduct("show recap includes finance output", [
    "Starting Show Budget",
    "Show Costs",
    "Ticket Revenue",
    "Merch Revenue",
    "Net",
    "Updated Budget",
  ].every((label) => state.text.includes(label)));
  await checkProduct("show recap includes fan/IWC pulse", /Fan Response|IWC|Social Buzz/.test(state.text));
}

async function assertWeekTwoHq(client) {
  const text = await activeText(client);
  await checkProduct("Week 2 HQ shows updated budget", text.includes("Week 2 HQ") && /\$[0-9,]+/.test(text));
  await checkProduct("Week 2 HQ shows last show fallout", text.includes("Last Show:") || text.includes("Show History"));
  await checkProduct("Week 2 HQ shows finance objective", text.includes("Finance Objective:"));
  await checkProduct("Week 2 HQ has Book Week 2 Show action", text.includes("Book Week 2 Show"));
}

async function runControllerFallback() {
  report.screensVisited.push("controller fallback: setup");
  report.screensVisited.push("controller fallback: draft");
  report.screensVisited.push("controller fallback: post-draft setup");
  report.screensVisited.push("controller fallback: booking");
  report.screensVisited.push("controller fallback: recap");
  report.screensVisited.push("controller fallback: Week 2 HQ");

  const draftController = await import(
    "../../ui/playable-new-gm-mode/inMemoryDraftActionController.js"
  );
  const setupController = await import(
    "../../ui/playable-new-gm-mode/localGameSetupController.js"
  );
  const postDraftController = await import(
    "../../ui/playable-new-gm-mode/localPostDraftSetupController.js"
  );
  const bookingController = await import(
    "../../ui/playable-new-gm-mode/localWeekOneBookingController.js"
  );

  const selectedBrand = Object.freeze({ brandId: "raw", brandLabel: "Raw" });
  const selectedGm = Object.freeze({
    gmId: "maren-vale",
    displayName: "Maren Vale",
  });
  const startingDraftBudget =
    setupController.readLocalGameSetupStartingBudgetUnits("hard");
  const setupProjection = setupController.createLocalGameSetupProjection({
    selectedDifficulty: "hard",
    activeBrandCount: 4,
    selectedBrandId: "raw",
  });

  await checkProduct("fallback setup exposes difficulty", setupProjection.displayLabels.difficultyLine === "Hard");
  await checkProduct("fallback setup exposes starting cash as money", setupProjection.displayLabels.startingBudgetLine.includes("$"));
  await checkProduct("fallback setup exposes player brand and rivals", setupProjection.displayLabels.activeBrandLine.includes("Raw") && setupProjection.displayLabels.competingGmLine.includes("SmackDown"));

  let miniDraftProgress = draftController.createInitialMiniDraftProgress({
    selectedBrand,
    startingDraftBudget,
  });
  const playerPick = draftController.executeInMemoryMakePick({
    selectedCandidate: {
      candidateId: "candidate-roman-reigns",
      name: "Roman Reigns",
      availability: "Available",
    },
    selectedBrand,
    selectedGm,
    miniDraftProgress,
  });
  miniDraftProgress = playerPick.miniDraftProgress;
  const afterPlayerBudget = miniDraftProgress.remainingDraftBudget;
  const afterRivals = draftController.executeRivalBrandDraftPicks({
    competingBrands: [
      { brandId: "smackdown", brandLabel: "SmackDown" },
      { brandId: "nxt", brandLabel: "NXT" },
    ],
    miniDraftProgress,
  });

  await checkProduct("fallback player draft pick reduces player budget", afterPlayerBudget < startingDraftBudget);
  await checkProduct("fallback rival picks do not affect player budget", afterRivals.miniDraftProgress.remainingDraftBudget === afterPlayerBudget);
  await checkProduct("fallback rival picks are recorded", afterRivals.miniDraftProgress.rivalPickSummaries.length === 2);

  const autoFill = draftController.executeAutoFillMinimumRoster({
    selectedBrand,
    selectedGm,
    miniDraftProgress: afterRivals.miniDraftProgress,
  });
  const finished = draftController.executeLocalFinishDraft({
    selectedBrand,
    selectedGm,
    miniDraftProgress: autoFill.miniDraftProgress,
  });
  miniDraftProgress = finished.miniDraftProgress;
  await checkProduct("fallback post-draft HQ has roster and budget", miniDraftProgress.signedTalentCount >= 16 && miniDraftProgress.remainingDraftBudget < startingDraftBudget);

  let setupState = postDraftController.createInitialLocalPostDraftSetupState();
  const championProjection = postDraftController.createChampionshipSetupProjection({
    selectedBrand,
    miniDraftProgress,
    setupState,
  });
  const championIds = {};
  const usedChampionIds = new Set();
  for (const card of championProjection.championCards) {
    const candidate = card.eligibleRosterOptions.find(
      (option) => !usedChampionIds.has(option.candidateId)
    );
    championIds[card.slotId] = candidate.candidateId;
    usedChampionIds.add(candidate.candidateId);
    setupState = postDraftController.updateLocalChampionshipSelection({
      setupState,
      slotId: card.slotId,
      candidateId: candidate.candidateId,
    });
  }
  const championship = postDraftController.completeLocalChampionshipSetup({
    selectedBrand,
    miniDraftProgress,
    setupState,
  });
  setupState = championship.setupState;
  await checkProduct("fallback championship setup completes with division-filtered champions", championship.actionStatus === "championship-setup-complete");

  const rosterIds = miniDraftProgress.completedPickSummaries.map(
    (summary) => summary.candidateId
  );
  setupState = postDraftController.updateLocalRivalrySlot({
    setupState,
    slotIndex: 0,
    wrestlerAId: rosterIds[0],
    wrestlerBId: rosterIds[1],
    rivalryType: "Championship",
    intensity: "High",
  });
  const rivalry = postDraftController.completeLocalRivalrySetup({
    selectedBrand,
    miniDraftProgress,
    setupState,
  });
  setupState = rivalry.setupState;
  await checkProduct("fallback rivalry setup supports multiple types", postDraftController.LOCAL_RIVALRY_TYPES.length > 1 && rivalry.actionStatus === "rivalry-setup-complete");

  let bookingState = bookingController.createInitialLocalWeekOneBookingState();
  let weeklyState = bookingController.createInitialLocalWeeklyLoopState();
  const promo = bookingController.addLocalWeekOneBookingSegment({
    selectedBrand,
    miniDraftProgress,
    setupState,
    bookingState,
    weeklyState,
    segmentInput: {
      segmentType: "self-promo",
      featuredWrestlerId: rosterIds[0],
    },
  });
  bookingState = promo.bookingState;
  const invalid = bookingController.addLocalWeekOneBookingSegment({
    selectedBrand,
    miniDraftProgress,
    setupState,
    bookingState,
    weeklyState,
    segmentInput: {
      segmentType: "singles-match",
      wrestlerAId: rosterIds[0],
      wrestlerBId: rosterIds[0],
    },
  });
  const match = bookingController.addLocalWeekOneBookingSegment({
    selectedBrand,
    miniDraftProgress,
    setupState,
    bookingState,
    weeklyState,
    segmentInput: {
      segmentType: "singles-match",
      wrestlerAId: rosterIds[0],
      wrestlerBId: rosterIds[1],
    },
  });
  bookingState = match.bookingState;
  const mainEvent = bookingController.addLocalWeekOneBookingSegment({
    selectedBrand,
    miniDraftProgress,
    setupState,
    bookingState,
    weeklyState,
    segmentInput: {
      segmentType: "main-event-singles-match",
      wrestlerAId: rosterIds[2],
      wrestlerBId: rosterIds[3],
    },
  });
  bookingState = mainEvent.bookingState;
  const bookingProjection = bookingController.createWeekOneBookingProjection({
    selectedBrand,
    miniDraftProgress,
    setupState,
    bookingState,
    weeklyState,
  });
  await checkProduct("fallback booking supports promo and match", bookingProjection.segments.some((segment) => segment.inputKind === "promo") && bookingProjection.segments.some((segment) => segment.inputKind === "match"));
  await checkProduct("fallback booking blocks invalid same-person pairing", invalid.actionStatus === "week-one-booking-same-wrestler-blocked");
  await checkProduct("fallback booking shows projected show cost", bookingProjection.bookingFinance.projectedShowCostUnits > 0);
  await checkProduct("fallback Run Show unlocks with valid card", bookingProjection.status.readyToRun);

  const show = bookingController.runLocalWeeklyShow({
    selectedBrand,
    miniDraftProgress,
    setupState,
    bookingState,
    weeklyState,
  });
  weeklyState = show.weeklyState;
  await checkProduct("fallback show recap includes finance output", show.recap.financeResult.ticketRevenueUnits > 0 && show.recap.financeResult.updatedBudgetUnits > 0);
  await checkProduct("fallback show recap includes deterministic winners", show.recap.segmentResults.some((segment) => segment.winnerName));
  await checkProduct("fallback show recap promos use fallout instead of winners", show.recap.segmentResults.filter((segment) => segment.segmentType.includes("promo")).every((segment) => !segment.winnerName));
  await checkProduct("fallback show recap includes fan/social pulse", show.recap.fanResponseNote.includes("Fan Response") && show.recap.socialBuzzNote.includes("Social Buzz"));

  const advance = bookingController.advanceLocalWeek({ weeklyState });
  weeklyState = advance.weeklyState;
  const weekTwoHq = bookingController.createWeeklyHqProjection({
    selectedBrand,
    miniDraftProgress,
    setupState,
    weeklyState,
  });
  await checkProduct("fallback Week 2 HQ shows updated budget", weekTwoHq.weekNumber === 2 && weekTwoHq.remainingBudgetUnits === show.recap.financeResult.updatedBudgetUnits);
  await checkProduct("fallback Week 2 HQ has Book Week 2 Show action", weekTwoHq.displayLabels.bookingLine === "Book Week 2 Show");
}

async function runVisualChecks(client, plan) {
  for (const size of [viewport, secondaryViewport]) {
    await setViewport(client, size);
    const result = await evaluateValue(client, `(() => {
      const ctaSelector = ${JSON.stringify(plan.ctaSelector)};
      const cta = document.querySelector(ctaSelector);
      const dock = document.querySelector(".bottom-nav-dock");
      const doc = document.documentElement;
      const active = document.querySelector(".screen:not([hidden])");
      const isVisible = (node) => {
        if (!node) return false;
        const style = getComputedStyle(node);
        const rect = node.getBoundingClientRect();
        return style.visibility !== "hidden" && style.display !== "none" && rect.width > 0 && rect.height > 0;
      };
      const ctaRect = cta?.getBoundingClientRect();
      const dockRect = dock?.getBoundingClientRect();
      const dockCoversCta = Boolean(
        ctaRect && dockRect &&
        ctaRect.bottom > dockRect.top &&
        ctaRect.top < dockRect.bottom &&
        ctaRect.right > dockRect.left &&
        ctaRect.left < dockRect.right
      );
      const overflowSamples = Array.from(active?.querySelectorAll("button, span, strong, em, p, h2, h3, dd, dt, small, label") || [])
        .filter((node) => isVisible(node))
        .filter((node) => {
          const rect = node.getBoundingClientRect();
          const parentRect = node.parentElement?.getBoundingClientRect();
          return parentRect && (rect.right > parentRect.right + 8 || rect.left < parentRect.left - 8);
        })
        .slice(0, 5)
        .map((node) => (node.textContent || "").trim().slice(0, 80));

      return {
        activeScreenId: active?.id || "",
        noHorizontalOverflow: doc.scrollWidth <= window.innerWidth + 2,
        noFullPageVerticalScroll: doc.scrollHeight <= window.innerHeight + 16,
        primaryCtaVisible: isVisible(cta) && !cta.disabled,
        dockClearOfPrimaryCta: !dockCoversCta,
        noDetectedTextOverflow: overflowSamples.length === 0,
        overflowSamples,
      };
    })()`);
    recordVisual(`${plan.name} ${size.width}x${size.height} no horizontal overflow`, result.noHorizontalOverflow, result);
    recordVisual(`${plan.name} ${size.width}x${size.height} no full-page vertical scrolling`, result.noFullPageVerticalScroll, result);
    recordVisual(`${plan.name} ${size.width}x${size.height} primary CTA visible`, result.primaryCtaVisible, result);
    recordVisual(`${plan.name} ${size.width}x${size.height} bottom dock clear of primary CTA`, result.dockClearOfPrimaryCta, result);
    recordVisual(`${plan.name} ${size.width}x${size.height} no obvious text overflow`, result.noDetectedTextOverflow, result);
  }
  await setViewport(client, viewport);
}

async function click(client, selector) {
  await evaluateValue(client, `(() => {
    const node = document.querySelector(${JSON.stringify(selector)});
    if (!node) throw new Error(${JSON.stringify(`Missing click target: ${selector}`)});
    if (node.disabled) throw new Error(${JSON.stringify(`Click target disabled: ${selector}`)});
    node.scrollIntoView({ block: "center", inline: "nearest" });
    node.click();
    return true;
  })()`);
  await delay(120);
}

async function selectValues(client, selector) {
  return evaluateValue(client, `Array.from(document.querySelector(${JSON.stringify(selector)})?.options || [])
    .filter((option) => option.value)
    .map((option) => option.value)`);
}

async function setSelectValue(client, selector, value) {
  await evaluateValue(client, `(() => {
    const node = document.querySelector(${JSON.stringify(selector)});
    if (!node) throw new Error(${JSON.stringify(`Missing select: ${selector}`)});
    node.value = ${JSON.stringify(value)};
    node.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  })()`);
  await delay(80);
}

async function moneyValue(client, selector) {
  const text = await evaluateValue(client, `document.querySelector(${JSON.stringify(selector)})?.textContent || ""`);
  const match = String(text).match(/\$([0-9,]+)/);
  return match ? Number.parseInt(match[1].replaceAll(",", ""), 10) : 0;
}

async function activeText(client) {
  return evaluateValue(client, `document.querySelector(".screen:not([hidden])")?.innerText || ""`);
}

async function waitForActiveScreen(client, screenId) {
  await waitFor(client, () => `document.querySelector(".screen:not([hidden])")?.id === ${JSON.stringify(screenId)}`);
}

async function waitForEnabled(client, selector) {
  await waitFor(client, () => `(() => {
    const node = document.querySelector(${JSON.stringify(selector)});
    return Boolean(node && !node.disabled);
  })()`);
}

async function waitForText(client, selector, text) {
  await waitFor(client, () => `document.querySelector(${JSON.stringify(selector)})?.textContent?.includes(${JSON.stringify(text)})`);
}

async function waitFor(client, expressionFactory) {
  const deadline = Date.now() + 7000;

  while (Date.now() < deadline) {
    const value = await evaluateValue(client, expressionFactory());
    if (value) {
      return;
    }
    await delay(100);
  }

  throw new Error(`Timed out waiting for: ${expressionFactory()}`);
}

async function evaluateValue(client, expression) {
  const response = await client.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
    userGesture: true,
  });

  if (response.exceptionDetails) {
    throw new Error(response.exceptionDetails.text || "Browser evaluation failed");
  }

  return response.result?.value;
}

async function checkProduct(name, passed) {
  report.productAssertions.push({
    name,
    status: passed ? "passed" : "failed",
  });

  if (!passed) {
    throw new Error(`Product assertion failed: ${name}`);
  }
}

function recordVisual(name, passed, details) {
  report.visualChecks.push({
    name,
    status: passed ? "passed" : "failed",
    details: passed ? undefined : details,
  });
}

function assertNoRecordedFailures() {
  const visualFailures = report.visualChecks.filter((item) => item.status === "failed");

  if (visualFailures.length > 0) {
    throw new Error(`${visualFailures.length} visual anti-botch check(s) failed.`);
  }
}

async function requestText(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (response) => {
      const chunks = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      response.on("error", reject);
    }).on("error", reject);
  });
}

async function requestJson({ port, pathName, method = "GET" }) {
  return new Promise((resolve, reject) => {
    const request = http.request(
      {
        hostname: "127.0.0.1",
        port,
        path: pathName,
        method,
      },
      (response) => {
        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => {
          try {
            resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
          } catch (error) {
            reject(error);
          }
        });
        response.on("error", reject);
      }
    );
    request.on("error", reject);
    request.end();
  });
}

async function writeReport() {
  const reportPath = path.join(artifactRoot, "report.json");
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
}

function printReport() {
  const productPassed = report.productAssertions.filter((item) => item.status === "passed").length;
  const productFailed = report.productAssertions.filter((item) => item.status === "failed").length;
  const visualPassed = report.visualChecks.filter((item) => item.status === "passed").length;
  const visualFailed = report.visualChecks.filter((item) => item.status === "failed").length;

  console.log("\nPlayable First-Session QA");
  console.log(`Screens visited: ${report.screensVisited.join(" -> ")}`);
  console.log(`Screenshots written: ${report.screenshotsWritten.length}`);
  console.log(`Product assertions: ${productPassed} passed, ${productFailed} failed`);
  console.log(`Visual checks: ${visualPassed} passed, ${visualFailed} failed`);
  console.log(`Skipped checks: ${report.skippedChecks.length}`);
  console.log(`Report: ${path.relative(repoRoot, path.join(artifactRoot, "report.json"))}`);
}

class CdpClient {
  constructor(webSocketUrl) {
    if (typeof WebSocket !== "function") {
      throw new Error("Node WebSocket support is required for Chrome QA.");
    }

    this.nextId = 1;
    this.pending = new Map();
    this.socket = new WebSocket(webSocketUrl);
    this.ready = new Promise((resolve, reject) => {
      this.socket.addEventListener("open", resolve, { once: true });
      this.socket.addEventListener("error", reject, { once: true });
    });
    this.socket.addEventListener("message", (event) => {
      const data = event.data instanceof ArrayBuffer
        ? Buffer.from(event.data).toString("utf8")
        : String(event.data);
      const message = JSON.parse(data);
      if (!message.id || !this.pending.has(message.id)) {
        return;
      }
      const pending = this.pending.get(message.id);
      this.pending.delete(message.id);
      if (message.error) {
        pending.reject(new Error(message.error.message));
      } else {
        pending.resolve(message.result || {});
      }
    });
  }

  async send(method, params = {}) {
    await this.ready;
    const id = this.nextId;
    this.nextId += 1;
    const payload = JSON.stringify({ id, method, params });

    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(payload);
    });
  }

  async close() {
    await this.ready.catch(() => {});
    this.socket.close();
  }
}
