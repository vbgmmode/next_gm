import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  createNewGMModeDraftPickCandidateObjects,
  createPlayableNewGMModeDraftReadOnlyIntegrationBoundary
} from "../src/game/domain/index.ts";
import {
  createProductionEngineRegistry,
  matchEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleMatchEngineInput
} from "./fixtures/index.ts";

const UNTOUCHED_PLAYABLE_DRAFT_INTEGRATION_DATABASE =
  "data/saves/__playable-new-gm-mode-draft-read-only-boundary-should-not-exist.sqlite";

describe("Playable New GM Mode Draft Read-Only Integration Boundary v0.1", () => {
  it("projects existing Real Draft System candidate objects into a stable read-only draft room snapshot", () => {
    const boundary = createPlayableNewGMModeDraftReadOnlyIntegrationBoundary();

    assert.equal(
      boundary.playableDraftReadOnlyIntegrationBoundaryId,
      "playable-new-gm-mode-draft-read-only-integration-boundary-v0.1"
    );
    assert.equal(
      boundary.integrationPhase,
      "read-only-draft-display-ready-execution-blocked"
    );
    assert.deepEqual(boundary.draftRoomSnapshot.candidateCounts, {
      total: 10,
      eligible: 9,
      ineligible: 1
    });
    assert.equal(boundary.draftRoomSnapshot.candidates.length, 10);
    assert.equal(
      boundary.initialDraftProjection.projectionSource,
      "real-draft-system-v1-read-only-boundary"
    );
    assert.equal(boundary.initialDraftProjection.candidateBoard.length, 10);
    assert.deepEqual(
      boundary.initialDraftProjection.candidateBoard.map(
        (candidate) => candidate.boardRankLabel
      ),
      ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10"]
    );
    assert.deepEqual(
      boundary.draftRoomSnapshot.candidates.map((candidate) => candidate.displayName),
      [
        "Ace Mercer",
        "Bruno Vale",
        "Cassian Ryde",
        "Dante Cross",
        "Elena Voss",
        "Fiona Hale",
        "Gia Stone",
        "Hana Reyes",
        "Ivan North",
        "Jules Kade"
      ]
    );
    assert.equal(Object.isFrozen(boundary), true);
    assert.equal(Object.isFrozen(boundary.draftRoomSnapshot.candidates), true);
    assert.equal(Object.isFrozen(boundary.initialDraftProjection.actionLocks), true);
  });

  it("reuses the canonical candidate object set and readiness summary instead of creating a duplicate draft path", () => {
    const candidateObjectSet = createNewGMModeDraftPickCandidateObjects();
    const boundary = createPlayableNewGMModeDraftReadOnlyIntegrationBoundary({
      candidateObjectSet
    });

    assert.deepEqual(
      boundary.draftRoomSnapshot.candidates.map((candidate) => candidate.candidateObjectId),
      candidateObjectSet.candidates.map((candidate) => candidate.candidateId)
    );
    assert.equal(
      boundary.sourceDraftSystemReferences.candidateObjectSetId,
      "new-gm-mode-draft-pick-candidate-object-set-v0.1"
    );
    assert.equal(
      boundary.sourceDraftSystemReferences.candidateReadinessSummaryId,
      "new-gm-mode-draft-pick-candidate-readiness-summary-v0.1"
    );
    assert.equal(
      boundary.sourceDraftSystemReferences.executionFlowAvailableButNotCalled,
      "new-gm-mode-in-memory-draft-flow-v1.0"
    );
  });

  it("projects player-safe candidate labels without exposing fixture marker strings", () => {
    const boundary = createPlayableNewGMModeDraftReadOnlyIntegrationBoundary();
    const firstCandidate = boundary.initialDraftProjection.candidateBoard[0];

    assert.equal(firstCandidate.displayName, "Ace Mercer");
    assert.equal(firstCandidate.primaryRoleLabel, "Main Event");
    assert.equal(firstCandidate.divisionSummaryLabel, "Mens Division");
    assert.deepEqual(firstCandidate.scoutingSignals, {
      starPowerLabel: "High",
      ringWorkLabel: "Elite",
      durabilityLabel: "Durable",
      promoLabel: "Strong",
      tagFitLabel: "Flexible"
    });
    assert.equal(
      Object.values(firstCandidate.scoutingSignals).some((value) =>
        value.startsWith("fixture-")
      ),
      false
    );
  });

  it("keeps execution, pick creation, selection submission, roster state, gameplay start, persistence, backend calls, and generated output blocked", () => {
    const boundary = createPlayableNewGMModeDraftReadOnlyIntegrationBoundary();

    assert.deepEqual(boundary.capabilityFlags, {
      canReadCandidateObjects: true,
      canProjectDraftRoomDisplay: true,
      canCreateDraftPick: false,
      canExecuteDraftPick: false,
      canCreateSelectionIntent: false,
      canSubmitSelectionIntent: false,
      canAssignRoster: false,
      canMutateRoster: false,
      canCompleteDraft: false,
      canCreateRosterState: false,
      canPersistGameplayPayload: false,
      canUseBrowserStorage: false,
      canCallBackend: false,
      canWriteDatabase: false,
      canStartGameplay: false,
      canInitializeWeekOne: false,
      canCreateGeneratedText: false,
      canUseGenAI: false
    });
    assert.deepEqual(boundary.blockedCapabilityFlags, {
      pickExecutionBlocked: true,
      pickCreationBlocked: true,
      selectionIntentSubmissionBlocked: true,
      rosterAssignmentBlocked: true,
      rosterMutationBlocked: true,
      draftCompletionBlocked: true,
      persistenceBlocked: true,
      backendCallsBlocked: true,
      genAIBlocked: true
    });
    assert.deepEqual(boundary.initialDraftProjection.actionLocks, [
      {
        actionId: "make-pick",
        label: "Make Pick",
        enabled: false,
        locked: true,
        lockReason: "selection-intent-submission-not-approved",
        displayLabel: "Make Pick Locked"
      },
      {
        actionId: "auto-draft",
        label: "Auto Draft",
        enabled: false,
        locked: true,
        lockReason: "automated-draft-execution-not-approved",
        displayLabel: "Auto Draft Locked"
      }
    ]);
    assert.equal(
      boundary.initialDraftProjection.statusPanel.nextApprovedStepLabel,
      "Selection intent preview"
    );
    assert.equal(boundary.gameplayAffecting, false);
    assert.equal(boundary.candidateReadinessSummary.capabilityFlags.canExecuteDraftPick, false);
    assert.equal(boundary.candidateReadinessSummary.capabilityFlags.canStartGameplay, false);
  });

  it("does not add storage, network, generated output, gameplay-start, Week 1, or duplicate draft service code", () => {
    const boundary = createPlayableNewGMModeDraftReadOnlyIntegrationBoundary();
    const forbiddenEntropyCall = ["Math", "random"].join(".");
    const source = readFileSync(
      join(
        "src",
        "game",
        "domain",
        "playableNewGMModeDraftReadOnlyIntegrationBoundary.ts"
      ),
      "utf8"
    );
    const forbiddenSnippets = [
      "fetch(",
      "XMLHttpRequest",
      "localStorage",
      "sessionStorage",
      "indexedDB",
      forbiddenEntropyCall,
      "INSERT INTO",
      "UPDATE ",
      "DELETE ",
      "generated text",
      "playableNewGMModeDraftService",
      "duplicateDraftService"
    ];

    for (const snippet of forbiddenSnippets) {
      assert.equal(source.includes(snippet), false, snippet);
    }
    assert.equal(existsSync(UNTOUCHED_PLAYABLE_DRAFT_INTEGRATION_DATABASE), false);
    assert.equal(collectKeys(boundary).includes("executionResultObject"), false);
    assert.equal(collectKeys(boundary).includes("rosterStateObject"), false);
  });

  it("exports the read-only integration boundary from the domain barrel", () => {
    assert.equal(
      typeof createPlayableNewGMModeDraftReadOnlyIntegrationBoundary,
      "function"
    );
  });

  it("keeps existing engine behavior, engine IDs, and metadata unchanged", () => {
    const input = createSampleMatchEngineInput();
    const contextSeed = "playable-new-gm-mode-draft-read-only-boundary";
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const firstMetadata = createProductionEngineRegistry().listMetadata();

    createPlayableNewGMModeDraftReadOnlyIntegrationBoundary();

    const secondResult = matchEngine.run(
      input,
      createSampleEngineContext(contextSeed, 7)
    );
    const secondMetadata = createProductionEngineRegistry().listMetadata();

    assert.deepEqual(secondResult, firstResult);
    assert.deepEqual(secondMetadata, firstMetadata);
  });
});

function collectKeys(source: unknown): string[] {
  if (Array.isArray(source)) {
    return source.flatMap((item) => collectKeys(item));
  }

  if (!source || typeof source !== "object") {
    return [];
  }

  return Object.entries(source).flatMap(([key, value]) => [
    key,
    ...collectKeys(value)
  ]);
}
