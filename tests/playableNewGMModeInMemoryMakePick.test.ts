import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  createMakePickReadiness,
  executeInMemoryMakePick,
} from "../ui/playable-new-gm-mode/inMemoryDraftActionController.js";
import { DEFAULT_LOCAL_DRAFT_SLOT } from "../ui/playable-new-gm-mode/draftSelectionIntentAdapter.js";
import { shouldShowDock } from "../ui/playable-new-gm-mode/screenShellState.js";
import {
  createNewGMModeDraftPickCandidateObjects,
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
  candidateId: "candidate-ace-mercer",
  name: "Ace Mercer",
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
    });

    assert.equal(readiness.canMakePick, true);
    assert.equal(readiness.actionStatus, "ready-for-in-memory-make-pick");
    assert.equal(readiness.displayLabels.buttonLabel, "Make Pick");
  });

  it("calls the existing one-shot in-memory draft flow boundary for Make Pick", () => {
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
      draftSlot: DEFAULT_LOCAL_DRAFT_SLOT,
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
      draftSlot: DEFAULT_LOCAL_DRAFT_SLOT,
    }, services);

    assert.equal(flowCallCount, 0);
    assert.equal(result.actionStatus, "blocked-unavailable-candidate");
    assert.equal(result.capabilityFlags.canAutoDraft, false);
  });

  it("produces local in-memory result state that can project Draft Recap safely", () => {
    const result = executeInMemoryMakePick({
      selectedCandidate: validCandidate,
      selectedBrand,
      selectedGm,
      draftSlot: DEFAULT_LOCAL_DRAFT_SLOT,
    });

    assert.equal(result.localOnly, true);
    assert.equal(result.inMemoryOnly, true);
    assert.equal(result.persisted, false);
    assert.equal(result.projection.projectionKind, "real-in-memory-draft-result-projection");
    assert.equal(result.projection.completedInMemory, true);
    assert.equal(result.projection.displayLabels.recapStatusLine, "Real In-Memory Draft Result - not saved");
    assert.equal(result.projection.displayLabels.candidateLine, "Ace Mercer drafted in memory");
    assert.equal(result.projection.displayLabels.pickLine, "Round 1 / Pick 1");
    assert.equal(
      result.projection.displayLabels.noteLine,
      "Local-only result. No save, persistence, Week 1 initialization, booking, or gameplay start occurred."
    );
  });

  it("distinguishes real in-memory recap projection from mock QA preview", () => {
    const html = readPlayableUiFile("index.html");
    const controllerSource = readPlayableUiFile("inMemoryDraftActionController.js");

    assert.match(html, /Mock Draft Recap - no draft executed/);
    assert.match(html, /QA Preview: Mock Draft Recap/);
    assert.match(controllerSource, /Real In-Memory Draft Result - not saved/);
    assert.match(controllerSource, /real-in-memory-draft-result-projection/);
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
      draftSlot: DEFAULT_LOCAL_DRAFT_SLOT,
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
