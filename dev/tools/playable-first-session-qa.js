import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import {
  mkdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  createInitialMiniDraftProgress,
  executeAutoFillMinimumRoster,
  executeInMemoryMakePick,
  executeLocalFinishDraft,
  executeRivalBrandDraftPicks,
} from "../../ui/playable-new-gm-mode/inMemoryDraftActionController.js";
import { createLocalGameSetupProjection } from "../../ui/playable-new-gm-mode/localGameSetupController.js";
import {
  completeLocalChampionshipSetup,
  completeLocalRivalrySetup,
  createChampionshipSetupProjection,
  createInitialLocalPostDraftSetupState,
  createRivalrySetupProjection,
  updateLocalChampionshipSelection,
  updateLocalRivalrySlot,
} from "../../ui/playable-new-gm-mode/localPostDraftSetupController.js";
import {
  addLocalWeekOneBookingSegment,
  advanceLocalWeek,
  createInitialLocalWeekOneBookingState,
  createInitialLocalWeeklyLoopState,
  createWeekOneBookingProjection,
  createWeeklyHqProjection,
  runLocalWeeklyShow,
} from "../../ui/playable-new-gm-mode/localWeekOneBookingController.js";

const repoRoot = path.resolve(fileURLToPath(new URL("../..", import.meta.url)));
const artifactRoot = path.join(repoRoot, "test-artifacts", "playable-first-session");
const screenshotDir = path.join(artifactRoot, "screenshots");
const reportPath = path.join(artifactRoot, "report.json");
const chromeProfileDir = path.join(artifactRoot, "chrome-profile");
const previewPort = Number.parseInt(process.env.PLAYABLE_QA_PORT || "3197", 10);
const previewUrl = `http://127.0.0.1:${previewPort}/ui/playable-new-gm-mode/`;

const screens = [
  {
    id: "game-landing",
    slug: "01-title-screen",
    primaryCta: '[data-go-to="contract-signing"]',
  },
  {
    id: "setup-basics",
    slug: "02-setup-basics",
    primaryCta: '[data-go-to="ai-setup"]',
  },
  {
    id: "draft-room",
    slug: "03-initial-draft",
    primaryCta: "[data-make-pick-action]",
  },
  {
    id: "draft-recap",
    slug: "04-post-draft-brand-hq",
    primaryCta: '[data-go-to="championship-setup"]',
  },
  {
    id: "championship-setup",
    slug: "05-assign-champions",
    primaryCta: "#complete-championship-setup",
  },
  {
    id: "rivalry-setup",
    slug: "06-create-rivalries",
    primaryCta: "#complete-rivalry-setup",
  },
  {
    id: "brand-dashboard",
    slug: "07-week-1-hq",
    primaryCta: "#week-one-hq-booking-action",
  },
  {
    id: "week-one-booking",
    slug: "08-booking",
    primaryCta: "#booking-run-show-action",
  },
  {
    id: "show-recap",
    slug: "09-show-recap",
    primaryCta: "#show-recap-advance-week",
  },
  {
    id: "brand-dashboard",
    slug: "10-week-2-hq",
    primaryCta: "#week-one-hq-booking-action",
  },
];

const report = {
  status: "pending",
  previewUrl,
  artifactRoot,
  screenshots: [],
  screensVisited: [],
  productAssertions: [],
  visualAssertions: [],
  skippedChecks: [],
};

const selectedBrand = Object.freeze({
  brandId: "raw",
  brandLabel: "Raw",
});
const selectedGm = Object.freeze({
  gmId: "maren-vale",
  displayName: "Maren Vale",
});

async function main() {
  await prepareArtifacts();
  runControllerProductAssertions();

  const chromePath = findChromePath();
  if (!chromePath) {
    addSkipped(
      "browser-screenshots",
      "Chrome or Edge was not found on this machine."
    );
    finalizeReport();
    return;
  }

  let previewProcess;
  let chromeProcess;
  let cdp;

  try {
    previewProcess = await startPreviewServer();
    const chrome = await startChrome(chromePath);
    chromeProcess = chrome.process;
    cdp = chrome.cdp;
    await openPlayableUi(cdp);
    await driveFirstSession(cdp);
    finalizeReport();
  } finally {
    await cdp?.close();
    chromeProcess?.kill();
    previewProcess?.kill();
  }
}

async function prepareArtifacts() {
  await rm(artifactRoot, { recursive: true, force: true });
  await mkdir(screenshotDir, { recursive: true });
}

function runControllerProductAssertions() {
  const setup = createLocalGameSetupProjection({
    selectedDifficulty: "hard",
    activeBrandCount: 4,
    selectedBrandId: selectedBrand.brandId,
    selectedGm,
  });
  assertProduct(
    "setup exposes selected brand, rivals, difficulty, and starting cash",
    setup.selectedBrandId === "raw" &&
      setup.competingBrands.length === 3 &&
      setup.selectedDifficulty === "hard" &&
      setup.displayLabels.startingBudgetLine === "$10,000,000"
  );

  const initialDraft = createInitialMiniDraftProgress({
    selectedBrand,
    startingDraftBudget: setup.startingBudgetUnits,
  });
  const firstPick = executeInMemoryMakePick({
    selectedCandidate: {
      candidateId: "candidate-roman-reigns",
      name: "Roman Reigns",
      availability: "Available",
    },
    selectedBrand,
    selectedGm,
    miniDraftProgress: initialDraft,
  });
  const afterRivals = executeRivalBrandDraftPicks({
    competingBrands: setup.competingBrands,
    miniDraftProgress: firstPick.miniDraftProgress,
  });
  assertProduct(
    "player pick spends budget while rival picks do not",
    firstPick.miniDraftProgress.remainingDraftBudget === 82 &&
      afterRivals.miniDraftProgress.remainingDraftBudget === 82 &&
      afterRivals.miniDraftProgress.rivalPickSummaries.length === 3
  );

  const autoFill = executeAutoFillMinimumRoster({
    selectedBrand,
    selectedGm,
    miniDraftProgress: afterRivals.miniDraftProgress,
  });
  const finishedDraft = executeLocalFinishDraft({
    selectedBrand,
    selectedGm,
    miniDraftProgress: autoFill.miniDraftProgress,
  });
  const miniDraftProgress = finishedDraft.miniDraftProgress;
  const rosterIds = miniDraftProgress.completedPickSummaries
    .slice(0, 6)
    .map((summary) => summary.candidateId);
  let setupState = createInitialLocalPostDraftSetupState();

  setupState = updateLocalChampionshipSelection({
    setupState,
    slotId: "mensMainChampionId",
    candidateId: rosterIds[0],
  });
  setupState = updateLocalChampionshipSelection({
    setupState,
    slotId: "mensMidcardChampionId",
    candidateId: rosterIds[1],
  });
  setupState = updateLocalChampionshipSelection({
    setupState,
    slotId: "womensMainChampionId",
    candidateId: rosterIds[2],
  });
  setupState = updateLocalChampionshipSelection({
    setupState,
    slotId: "womensMidcardChampionId",
    candidateId: rosterIds[3],
  });
  const championship = completeLocalChampionshipSetup({
    selectedBrand,
    miniDraftProgress,
    setupState,
  });
  const championshipProjection = createChampionshipSetupProjection({
    selectedBrand,
    miniDraftProgress,
    setupState: championship.setupState,
  });
  assertProduct(
    "championship projection filters title options by division",
    championshipProjection.championCards
      .filter((card) => card.requiredDivisionCategory === "men")
      .every((card) =>
        card.eligibleRosterOptions.every((option) => option.divisionCategory !== "women")
      ) &&
      championshipProjection.championCards
        .filter((card) => card.requiredDivisionCategory === "women")
        .every((card) =>
          card.eligibleRosterOptions.every((option) => option.divisionCategory === "women")
        )
  );

  setupState = updateLocalRivalrySlot({
    setupState: championship.setupState,
    slotIndex: 0,
    wrestlerAId: rosterIds[3],
    wrestlerBId: rosterIds[4],
    rivalryType: "Championship",
    intensity: "High",
  });
  const rivalry = completeLocalRivalrySetup({
    selectedBrand,
    miniDraftProgress,
    setupState,
  });
  assertProduct(
    "one valid rivalry unlocks Week 1 HQ state",
    createRivalrySetupProjection({
      selectedBrand,
      miniDraftProgress,
      setupState: rivalry.setupState,
    }).complete
  );

  let bookingState = createInitialLocalWeekOneBookingState();
  const weeklyState = createInitialLocalWeeklyLoopState();
  bookingState = addLocalWeekOneBookingSegment({
    selectedBrand,
    miniDraftProgress,
    setupState: rivalry.setupState,
    bookingState,
    weeklyState,
    segmentInput: {
      segmentType: "self-promo",
      featuredWrestlerId: rosterIds[0],
    },
  }).bookingState;
  bookingState = addLocalWeekOneBookingSegment({
    selectedBrand,
    miniDraftProgress,
    setupState: rivalry.setupState,
    bookingState,
    weeklyState,
    segmentInput: {
      segmentType: "singles-match",
      wrestlerAId: rosterIds[0],
      wrestlerBId: rosterIds[1],
    },
  }).bookingState;
  bookingState = addLocalWeekOneBookingSegment({
    selectedBrand,
    miniDraftProgress,
    setupState: rivalry.setupState,
    bookingState,
    weeklyState,
    segmentInput: {
      segmentType: "main-event-singles-match",
      wrestlerAId: rosterIds[4],
      wrestlerBId: rosterIds[5],
    },
  }).bookingState;
  const bookingProjection = createWeekOneBookingProjection({
    selectedBrand,
    miniDraftProgress,
    setupState: rivalry.setupState,
    bookingState,
    weeklyState,
  });
  const run = runLocalWeeklyShow({
    selectedBrand,
    miniDraftProgress,
    setupState: rivalry.setupState,
    bookingState,
    weeklyState,
  });
  const weekTwo = advanceLocalWeek({ weeklyState: run.weeklyState });
  const weekTwoHq = createWeeklyHqProjection({
    selectedBrand,
    miniDraftProgress,
    setupState: rivalry.setupState,
    weeklyState: weekTwo.weeklyState,
  });
  assertProduct(
    "booking projects costs and recap carries updated budget into Week 2 HQ",
    bookingProjection.bookingFinance.projectedShowCostUnits > 0 &&
      run.recap.financeResult.updatedBudgetUnits === weekTwoHq.remainingBudgetUnits
  );
  assertProduct(
    "match recap has deterministic winners while promos do not",
    run.recap.segmentResults.some((segment) =>
      segment.resultLine.startsWith("Winner:")
    ) &&
      run.recap.segmentResults
        .filter((segment) => segment.inputKind === "promo" || segment.segmentType.includes("promo"))
        .every((segment) => !segment.resultLine.startsWith("Winner:"))
  );
}

async function startPreviewServer() {
  const child = spawn(process.execPath, ["dev/tools/playable-ui-preview-server.js"], {
    cwd: repoRoot,
    env: {
      ...process.env,
      PORT: String(previewPort),
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  child.stdout.on("data", (chunk) => {
    process.stdout.write(chunk);
  });
  child.stderr.on("data", (chunk) => {
    process.stderr.write(chunk);
  });

  await waitForHttp(previewUrl, 12000);
  return child;
}

async function startChrome(chromePath) {
  await rm(chromeProfileDir, { recursive: true, force: true });
  await mkdir(chromeProfileDir, { recursive: true });

  const chromeProcess = spawn(chromePath, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--remote-debugging-port=0",
    `--user-data-dir=${chromeProfileDir}`,
    "--window-size=1366,768",
    "about:blank",
  ], {
    stdio: ["ignore", "ignore", "ignore"],
  });

  const activePortPath = path.join(chromeProfileDir, "DevToolsActivePort");
  const { port } = await waitForDevToolsPort(activePortPath);
  const target = await createChromeTarget(port, "about:blank");
  const cdp = await CdpClient.connect(target.webSocketDebuggerUrl);

  return {
    process: chromeProcess,
    cdp,
  };
}

async function openPlayableUi(cdp) {
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await setViewport(cdp, 1366, 768);
  await cdp.send("Page.navigate", { url: previewUrl });
  await waitForReady(cdp);
}

async function driveFirstSession(cdp) {
  await visitAndCapture(cdp, screens[0]);

  await click(cdp, '[data-go-to="contract-signing"]');
  await click(cdp, '[data-go-to="setup-basics"]');
  await click(cdp, '[data-difficulty="hard"]');
  await click(cdp, '[data-active-brand-count="4"]');
  await assertSetupDom(cdp);
  await visitAndCapture(cdp, screens[1]);

  await click(cdp, '[data-go-to="ai-setup"]');
  await click(cdp, '#ai-setup [data-go-to="choose-gm"]');
  await click(cdp, '#choose-gm [data-go-to="select-brand"]');
  await click(cdp, '[data-brand="raw"]');
  await click(cdp, '#select-brand [data-go-to="draft-room"]');
  await assertDraftBeforePickDom(cdp);
  await visitAndCapture(cdp, screens[2]);

  const beforePickBudget = await text(cdp, "#draft-budget-remaining");
  await click(cdp, "[data-make-pick-action]");
  await wait(250);
  const afterPickBudget = await text(cdp, "#draft-budget-remaining");
  await assertDraftAfterPickDom(cdp, beforePickBudget, afterPickBudget);
  await click(cdp, "[data-auto-fill-minimum-roster]");
  await click(cdp, "[data-finish-local-draft]");
  await assertPostDraftDom(cdp);
  await visitAndCapture(cdp, screens[3]);

  await click(cdp, '#draft-recap [data-go-to="championship-setup"]');
  await setChampionSelections(cdp);
  await assertChampionshipDom(cdp);
  await visitAndCapture(cdp, screens[4]);
  await click(cdp, "#complete-championship-setup");

  await setRivalrySelections(cdp);
  await assertRivalryDom(cdp);
  await visitAndCapture(cdp, screens[5]);
  await click(cdp, "#complete-rivalry-setup");
  await click(cdp, "#rivalry-continue-week-one");
  await assertWeekOneHqDom(cdp);
  await visitAndCapture(cdp, screens[6]);

  await click(cdp, "#week-one-hq-booking-action");
  await bookShow(cdp);
  await assertBookingDom(cdp);
  await visitAndCapture(cdp, screens[7]);

  await click(cdp, "#booking-run-show-action");
  await assertShowRecapDom(cdp);
  await visitAndCapture(cdp, screens[8]);

  await click(cdp, "#show-recap-advance-week");
  await assertWeekTwoHqDom(cdp);
  await visitAndCapture(cdp, screens[9]);
}

async function visitAndCapture(cdp, screen) {
  await waitForActiveScreen(cdp, screen.id);
  await assertVisualChecks(cdp, screen, 1366, 768);
  await captureScreenshot(cdp, screen.slug, 1366, 768);
  await assertVisualChecks(cdp, screen, 1280, 800);
  await setViewport(cdp, 1366, 768);
  report.screensVisited.push(screen.slug);
}

async function assertSetupDom(cdp) {
  const result = await evaluate(cdp, () => {
    const setupText = document.querySelector("#setup-basics")?.innerText || "";
    return {
      hasPlayerBrand: setupText.includes("Player Brand"),
      hasActiveBrands: setupText.includes("Active Brands"),
      hasRivals: setupText.includes("SmackDown") && setupText.includes("NXT"),
      hasDifficulty: setupText.includes("Hard"),
      hasMoney: /\$10,000,000/.test(setupText),
    };
  });

  assertProduct("setup DOM exposes core launch choices", Object.values(result).every(Boolean), result);
}

async function assertDraftBeforePickDom(cdp) {
  const result = await evaluate(cdp, () => ({
    hasRivalBrands:
      (document.querySelector("#draft-competing-brands")?.textContent || "").includes("SmackDown"),
    hasBudget:
      /\$/.test(document.querySelector("#draft-budget-remaining")?.textContent || ""),
    hasRosterCount:
      /0\/16/.test(document.querySelector("#draft-signed-roster-count")?.textContent || ""),
  }));

  assertProduct("draft DOM shows rivals, budget, and roster count", Object.values(result).every(Boolean), result);
}

async function assertDraftAfterPickDom(cdp, beforeBudget, afterBudget) {
  const result = await evaluate(cdp, () => ({
    hasRivalTicker:
      (document.querySelector("#draft-ticker-list")?.textContent || "").includes("signed to"),
    rosterCountChanged:
      !/0\/16/.test(document.querySelector("#draft-signed-roster-count")?.textContent || ""),
  }));

  assertProduct(
    "player pick changes visible budget and rival picks stay visible",
    beforeBudget !== afterBudget && result.hasRivalTicker && result.rosterCountChanged,
    { beforeBudget, afterBudget, ...result }
  );
}

async function assertPostDraftDom(cdp) {
  const result = await evaluate(cdp, () => {
    const recapText = document.querySelector("#draft-recap")?.innerText || "";
    return {
      hasBudget: /Remaining Budget: \$/.test(recapText),
      hasRosterCount: /Signed Superstars: 16/.test(recapText),
      hasNextAction: Boolean(document.querySelector("#post-draft-championship-action")),
    };
  });

  assertProduct("post-draft HQ shows budget, roster count, and Assign Champions", Object.values(result).every(Boolean), result);
}

async function setChampionSelections(cdp) {
  await evaluate(cdp, () => {
    const selectValues = (selector) =>
      [...document.querySelector(selector).options]
        .map((option) => option.value)
        .filter(Boolean);
    const setSelect = (selector, value) => {
      const select = document.querySelector(selector);
      select.value = value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
    };
    const men = selectValues("#champion-mens-main-select");
    const women = selectValues("#champion-womens-main-select");

    setSelect("#champion-mens-main-select", men[0]);
    setSelect("#champion-mens-midcard-select", men[1]);
    setSelect("#champion-womens-main-select", women[0]);
    setSelect("#champion-womens-midcard-select", women[1]);
  });
  await wait(100);
}

async function assertChampionshipDom(cdp) {
  const result = await evaluate(cdp, () => {
    const optionTexts = (selector) =>
      [...document.querySelector(selector).options].map((option) => option.textContent || "");
    const optionRoles = (selector) =>
      [...document.querySelector(selector).options]
        .map((option) => option.value)
        .filter(Boolean)
        .map((candidateId) =>
          document.querySelector(`[data-candidate-id="${candidateId}"]`)?.dataset.talentRole || ""
        );
    const menRoles = [
      ...optionRoles("#champion-mens-main-select"),
      ...optionRoles("#champion-mens-midcard-select"),
    ];
    const womenRoles = [
      ...optionRoles("#champion-womens-main-select"),
      ...optionRoles("#champion-womens-midcard-select"),
    ];
    const allOptionText = [
      ...optionTexts("#champion-mens-main-select"),
      ...optionTexts("#champion-womens-main-select"),
    ].join(" ");

    return {
      menOnly: menRoles.length > 0 && menRoles.every((role) => !role.includes("Women's division")),
      womenOnly: womenRoles.length > 0 && womenRoles.every((role) => role.includes("Women's division")),
      noMetadata: !/Drafted From|Source Pool/.test(allOptionText),
      completeEnabled: !document.querySelector("#complete-championship-setup")?.disabled,
    };
  });

  assertProduct("championship DOM filters divisions and avoids source metadata", Object.values(result).every(Boolean), result);
}

async function setRivalrySelections(cdp) {
  await evaluate(cdp, () => {
    const optionValues = (selector) =>
      [...document.querySelector(selector).options]
        .map((option) => option.value)
        .filter(Boolean);
    const wrestlers = optionValues(".rivalry-wrestler-a");
    const setSelect = (selector, value) => {
      const select = document.querySelector(selector);
      select.value = value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
    };

    setSelect('.rivalry-slot[data-rivalry-slot="0"] .rivalry-wrestler-a', wrestlers[0]);
    setSelect('.rivalry-slot[data-rivalry-slot="0"] .rivalry-wrestler-b', wrestlers[1]);
    setSelect('.rivalry-slot[data-rivalry-slot="0"] .rivalry-type', "Championship");
    setSelect('.rivalry-slot[data-rivalry-slot="0"] .rivalry-intensity', "High");
  });
  await wait(100);
}

async function assertRivalryDom(cdp) {
  const result = await evaluate(cdp, () => {
    const optionText = [
      ...document.querySelectorAll(".rivalry-wrestler-a option, .rivalry-wrestler-b option"),
    ].map((option) => option.textContent || "").join(" ");
    const rivalryTypes = [...document.querySelector(".rivalry-type").options]
      .map((option) => option.textContent || "");

    return {
      noDraftedFrom: !/Drafted From|Source Pool/.test(optionText),
      expandedTypes: rivalryTypes.length > 1 && rivalryTypes.includes("Championship"),
      completeEnabled: !document.querySelector("#complete-rivalry-setup")?.disabled,
    };
  });

  assertProduct("rivalry DOM keeps labels clean and exposes multiple rivalry types", Object.values(result).every(Boolean), result);
}

async function assertWeekOneHqDom(cdp) {
  const result = await evaluate(cdp, () => {
    const hqText = document.querySelector("#brand-dashboard")?.innerText || "";
    return {
      hasBudget: /Remaining \$/.test(hqText),
      hasLastShowPlaceholder: hqText.includes("No show run yet"),
      hasPrimaryAction: /Book Week 1 Show/.test(hqText),
      noEmptyHero: !hqText.includes("undefined") && !hqText.includes("NaN"),
    };
  });

  assertProduct("Week 1 HQ guides toward booking with budget context", Object.values(result).every(Boolean), result);
}

async function bookShow(cdp) {
  await setBookingSegment(cdp, {
    segmentType: "self-promo",
    promoIndex: 0,
  });
  await click(cdp, "#add-week-one-segment");
  await setBookingSegment(cdp, {
    segmentType: "singles-match",
    wrestlerAIndex: 0,
    wrestlerBIndex: 0,
  });
  await click(cdp, "#add-week-one-segment");
  await assertProductMessage(cdp, "Same wrestler cannot face themselves.");
  await setBookingSegment(cdp, {
    segmentType: "singles-match",
    wrestlerAIndex: 0,
    wrestlerBIndex: 1,
  });
  await click(cdp, "#add-week-one-segment");
  await setBookingSegment(cdp, {
    segmentType: "main-event-singles-match",
    wrestlerAIndex: 2,
    wrestlerBIndex: 3,
  });
  await click(cdp, "#add-week-one-segment");
}

async function setBookingSegment(cdp, options) {
  await evaluate(cdp, (input) => {
    const values = (selector) =>
      [...document.querySelector(selector).options]
        .map((option) => option.value)
        .filter(Boolean);
    const setSelect = (selector, value) => {
      const select = document.querySelector(selector);
      select.value = value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
    };
    setSelect("#booking-segment-type", input.segmentType);
    const wrestlerValues = values("#booking-wrestler-a");
    const promoValues = values("#booking-promo-wrestler");
    if (input.segmentType.includes("promo")) {
      setSelect("#booking-promo-wrestler", promoValues[input.promoIndex || 0]);
    } else {
      setSelect("#booking-wrestler-a", wrestlerValues[input.wrestlerAIndex || 0]);
      setSelect("#booking-wrestler-b", wrestlerValues[input.wrestlerBIndex || 1]);
    }
  }, options);
  await wait(100);
}

async function assertProductMessage(cdp, expectedText) {
  const message = await text(cdp, "#booking-builder-message");
  assertProduct(`booking blocks invalid same-person pairing: ${expectedText}`, message.includes(expectedText), { message });
}

async function assertBookingDom(cdp) {
  const result = await evaluate(cdp, () => {
    const segmentTypes = [...document.querySelector("#booking-segment-type").options]
      .map((option) => option.textContent || "");
    const optionText = [
      ...document.querySelectorAll("#booking-wrestler-a option, #booking-promo-wrestler option"),
    ].map((option) => option.textContent || "").join(" ");
    const cardText = document.querySelector("#week-one-show-card-list")?.innerText || "";

    return {
      hasMatchType: segmentTypes.some((value) => value.includes("Singles Match")),
      hasPromoType: segmentTypes.some((value) => value.includes("Promo")),
      cleanDropdowns: !/Drafted From|Source Pool/.test(optionText),
      projectedCost: /\$/.test(document.querySelector("#booking-summary-projected-cost")?.textContent || ""),
      wrestlerReuseAllowed: cardText.split("\n").join(" ").match(/self promo/) && cardText.includes("Singles Match"),
      runEnabled: !document.querySelector("#booking-run-show-action")?.disabled,
    };
  });

  assertProduct("booking DOM supports match/promo card with projected cost", Object.values(result).every(Boolean), result);
}

async function assertShowRecapDom(cdp) {
  const result = await evaluate(cdp, () => {
    const recapText = document.querySelector("#show-recap")?.innerText || "";
    const segmentText = document.querySelector("#show-recap-segments")?.innerText || "";
    return {
      hasWinner: segmentText.includes("Winner:"),
      hasPromoFallout: /promo segment/i.test(segmentText),
      hasFinance:
        recapText.includes("Starting Show Budget") &&
        recapText.includes("Show Costs") &&
        recapText.includes("Ticket Revenue") &&
        recapText.includes("Merch Revenue") &&
        recapText.includes("Updated Budget"),
      hasFanPulse:
        recapText.includes("Fan Response:") &&
        recapText.includes("Social Buzz:"),
      noDebugPlaceholder: !recapText.includes("No major change") && !recapText.includes("undefined"),
    };
  });

  assertProduct("show recap includes winners, promo fallout, finance, and fan/IWC pulse", Object.values(result).every(Boolean), result);
}

async function assertWeekTwoHqDom(cdp) {
  const result = await evaluate(cdp, () => {
    const hqText = document.querySelector("#brand-dashboard")?.innerText || "";
    return {
      weekTwo: hqText.includes("Week 2"),
      updatedBudget: /Remaining \$/.test(hqText),
      lastShow: hqText.includes("Last Show:"),
      financeObjective: hqText.includes("Finance Objective:"),
      primaryAction: hqText.includes("Book Week 2 Show"),
    };
  });

  assertProduct("Week 2 HQ shows updated budget, fallout, objective, and booking CTA", Object.values(result).every(Boolean), result);
}

async function assertVisualChecks(cdp, screen, width, height) {
  await setViewport(cdp, width, height);
  await wait(80);
  const result = await evaluate(cdp, (input) => {
    const active = document.querySelector(".screen.active-screen");
    const cta = document.querySelector(input.primaryCta);
    const dock = document.querySelector(".bottom-nav-dock:not([hidden])");
    const ctaRect = cta?.getBoundingClientRect();
    const dockRect = dock?.getBoundingClientRect();
    const visibleElements = [...active.querySelectorAll("button, strong, span, em, p, h2, h3, dd, dt, label")]
      .filter((element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.visibility !== "hidden" && style.display !== "none" && rect.width > 0 && rect.height > 0;
      });
    const overflowingElements = visibleElements.filter((element) => {
      const rect = element.getBoundingClientRect();
      const parentRect = element.parentElement?.getBoundingClientRect();
      const style = getComputedStyle(element);
      const clipped = style.overflow === "hidden" || style.textOverflow === "ellipsis";
      if (clipped) {
        return false;
      }
      return (
        rect.right > window.innerWidth + 1 ||
        rect.left < -1 ||
        (parentRect && rect.right > parentRect.right + 2)
      );
    });
    const intersectsDock = Boolean(
      ctaRect &&
      dockRect &&
      ctaRect.bottom > dockRect.top &&
      ctaRect.right > dockRect.left &&
      ctaRect.left < dockRect.right
    );

    return {
      screenId: active?.id,
      noVerticalPageScroll: document.documentElement.scrollHeight <= window.innerHeight + 2,
      noHorizontalPageOverflow: document.documentElement.scrollWidth <= window.innerWidth + 2,
      primaryCtaVisible: Boolean(
        ctaRect &&
        ctaRect.width > 0 &&
        ctaRect.height > 0 &&
        ctaRect.bottom <= window.innerHeight + 1 &&
        ctaRect.right <= window.innerWidth + 1
      ),
      noEmptyHero:
        !/undefined|NaN/.test(active?.innerText || "") &&
        !((active?.id === "show-recap" || active?.id === "brand-dashboard") &&
          /Show Grade: --|Best Segment: --/.test(active?.innerText || "")),
      noVisibleTextOverflow: overflowingElements.length === 0,
      bottomDockClear: !intersectsDock,
      overflowingSamples: overflowingElements.slice(0, 3).map((element) => element.textContent?.trim()),
    };
  }, screen);

  const passed =
    result.screenId === screen.id &&
    result.noVerticalPageScroll &&
    result.noHorizontalPageOverflow &&
    result.primaryCtaVisible &&
    result.noEmptyHero &&
    result.noVisibleTextOverflow &&
    result.bottomDockClear;
  assertVisual(`${screen.slug} ${width}x${height}`, passed, result);
}

async function captureScreenshot(cdp, slug, width, height) {
  await setViewport(cdp, width, height);
  await wait(100);
  const result = await cdp.send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: false,
  });
  const filePath = path.join(screenshotDir, `${slug}-${width}x${height}.png`);
  await writeFile(filePath, Buffer.from(result.data, "base64"));
  report.screenshots.push(path.relative(repoRoot, filePath));
}

async function click(cdp, selector) {
  await waitForSelector(cdp, selector);
  const result = await evaluate(cdp, (input) => {
    const element = document.querySelector(input.selector);
    if (!element) {
      return { ok: false, reason: "missing" };
    }
    if (element.disabled) {
      return { ok: false, reason: "disabled", text: element.textContent };
    }
    element.click();
    return { ok: true };
  }, { selector });

  if (!result.ok) {
    throw new Error(`Unable to click ${selector}: ${result.reason} ${result.text || ""}`);
  }
  await wait(150);
}

async function text(cdp, selector) {
  return evaluate(cdp, (input) =>
    document.querySelector(input.selector)?.textContent?.trim() || "",
  { selector });
}

async function waitForActiveScreen(cdp, screenId) {
  await waitFor(cdp, () =>
    document.querySelector(".screen.active-screen")?.id,
  (activeScreenId) => activeScreenId === screenId);
}

async function waitForReady(cdp) {
  await waitFor(cdp, () => document.readyState, (state) => state === "complete");
}

async function waitForSelector(cdp, selector) {
  await waitFor(cdp, (input) => {
    const element = document.querySelector(input.selector);
    return Boolean(element && getComputedStyle(element).display !== "none");
  }, Boolean, { selector });
}

async function waitFor(cdp, expressionFunction, predicate, arg) {
  const timeoutAt = Date.now() + 12000;
  let lastValue;
  while (Date.now() < timeoutAt) {
    lastValue = await evaluate(cdp, expressionFunction, arg);
    if (predicate(lastValue)) {
      return lastValue;
    }
    await wait(100);
  }
  throw new Error(`Timed out waiting for browser condition. Last value: ${JSON.stringify(lastValue)}`);
}

async function setViewport(cdp, width, height) {
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: false,
  });
}

async function evaluate(cdp, fn, arg) {
  const serializedArg = JSON.stringify(arg);
  const expression = `(${fn.toString()})(${serializedArg})`;
  const result = await cdp.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || "Browser evaluation failed");
  }
  return result.result.value;
}

function assertProduct(name, passed, details = {}) {
  report.productAssertions.push({
    name,
    status: passed ? "passed" : "failed",
    details,
  });
  if (!passed) {
    throw new Error(`Product assertion failed: ${name} ${JSON.stringify(details)}`);
  }
}

function assertVisual(name, passed, details = {}) {
  report.visualAssertions.push({
    name,
    status: passed ? "passed" : "failed",
    details,
  });
  if (!passed) {
    throw new Error(`Visual assertion failed: ${name} ${JSON.stringify(details)}`);
  }
}

function addSkipped(name, reason) {
  report.skippedChecks.push({ name, reason });
}

function finalizeReport() {
  report.status = report.productAssertions.some((item) => item.status === "failed") ||
    report.visualAssertions.some((item) => item.status === "failed")
    ? "failed"
    : "passed";
}

async function writeReportAndPrint() {
  await mkdir(artifactRoot, { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`First-session QA: ${report.status}`);
  console.log(`Screens visited: ${report.screensVisited.length}`);
  console.log(`Screenshots written: ${report.screenshots.length}`);
  console.log(`Product assertions: ${summarizeAssertions(report.productAssertions)}`);
  console.log(`Visual checks: ${summarizeAssertions(report.visualAssertions)}`);
  if (report.skippedChecks.length) {
    console.log(`Skipped checks: ${report.skippedChecks.map((item) => `${item.name} (${item.reason})`).join("; ")}`);
  }
  console.log(`Report: ${path.relative(repoRoot, reportPath)}`);
}

function summarizeAssertions(assertions) {
  const passed = assertions.filter((item) => item.status === "passed").length;
  const failed = assertions.filter((item) => item.status === "failed").length;
  return `${passed} passed / ${failed} failed`;
}

function findChromePath() {
  const candidates = [
    process.env.CHROME_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  ].filter(Boolean);

  return candidates.find((candidate) => existsSync(candidate));
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function waitForHttp(url, timeoutMs) {
  const timeoutAt = Date.now() + timeoutMs;

  return new Promise((resolve, reject) => {
    const attempt = () => {
      const request = http.get(url, (response) => {
        response.resume();
        if (response.statusCode && response.statusCode < 500) {
          resolve();
          return;
        }
        retry();
      });
      request.on("error", retry);
    };
    const retry = () => {
      if (Date.now() >= timeoutAt) {
        reject(new Error(`Timed out waiting for ${url}`));
        return;
      }
      setTimeout(attempt, 150);
    };

    attempt();
  });
}

async function waitForDevToolsPort(activePortPath) {
  const timeoutAt = Date.now() + 12000;
  while (Date.now() < timeoutAt) {
    if (existsSync(activePortPath)) {
      const [portLine] = (await readFile(activePortPath, "utf8")).split(/\r?\n/);
      const port = Number.parseInt(portLine, 10);
      if (Number.isInteger(port)) {
        return { port };
      }
    }
    await wait(100);
  }
  throw new Error("Timed out waiting for Chrome DevTools port.");
}

function createChromeTarget(port, url) {
  return httpJson({
    method: "PUT",
    port,
    path: `/json/new?${encodeURIComponent(url)}`,
  });
}

function httpJson({ method = "GET", port, path: requestPath }) {
  return new Promise((resolve, reject) => {
    const request = http.request({
      host: "127.0.0.1",
      port,
      path: requestPath,
      method,
    }, (response) => {
      const chunks = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => {
        try {
          resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
        } catch (error) {
          reject(error);
        }
      });
    });
    request.on("error", reject);
    request.end();
  });
}

class CdpClient {
  constructor(socket) {
    this.socket = socket;
    this.nextId = 1;
    this.pending = new Map();
    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (!message.id || !this.pending.has(message.id)) {
        return;
      }
      const { resolve, reject } = this.pending.get(message.id);
      this.pending.delete(message.id);
      if (message.error) {
        reject(new Error(message.error.message));
      } else {
        resolve(message.result || {});
      }
    });
  }

  static connect(url) {
    return new Promise((resolve, reject) => {
      const socket = new WebSocket(url);
      socket.addEventListener("open", () => resolve(new CdpClient(socket)));
      socket.addEventListener("error", reject);
    });
  }

  send(method, params = {}) {
    const id = this.nextId;
    this.nextId += 1;
    this.socket.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
    });
  }

  close() {
    this.socket.close();
    return wait(50);
  }
}

try {
  await main();
} catch (error) {
  report.status = "failed";
  report.error = error?.stack || String(error);
  process.exitCode = 1;
} finally {
  await writeReportAndPrint();
}
