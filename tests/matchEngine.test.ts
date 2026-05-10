import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  MATCH_ENGINE_V0_ID,
  matchEngine,
  type MatchEngineResult,
  type MatchSimulationEngine
} from "../src/game/engines/index.ts";
import {
  createParticipantTalentProfiles,
  createSampleEngineContext,
  createSampleMatchEngineInput,
  createSampleMatchEngineInputWithFinishIntent,
  createSampleMatchEngineInputWithLowTalentProfiles,
  createSampleMatchEngineInputWithPartialTalentProfiles,
  createSampleMatchEngineInputWithTalentProfiles,
  sampleTalentProfiles
} from "./fixtures/index.ts";
import {
  assertDebugTraceIsNonPlayerFacing,
  assertEngineResultRespectsOutputBoundary,
  assertPlayerFacingSignalsDoNotExposeHiddenValues
} from "./helpers/engineOutputBoundaryAssertions.ts";

describe("Match Engine v0.9", () => {
  it("imports cleanly and implements MatchSimulationEngine", () => {
    const engine: MatchSimulationEngine = matchEngine;

    assert.equal(engine, matchEngine);
    assert.equal(typeof engine.run, "function");
  });

  it("exposes stable metadata", () => {
    assert.deepEqual(matchEngine.metadata, {
      id: MATCH_ENGINE_V0_ID,
      name: "Match Engine v0",
      version: "0.9.0"
    });
  });

  it("constructs MatchEngineInput without talent profiles", () => {
    const input = createSampleMatchEngineInput();

    assert.equal(input.participantTalentProfiles, undefined);
    assert.equal(Object.hasOwn(input, "participantTalentProfiles"), false);
  });

  it("constructs MatchEngineInput with talent profiles keyed by wrestlerId", () => {
    const input = createSampleMatchEngineInputWithTalentProfiles();

    assert.ok(input.participantTalentProfiles);
    for (const participant of input.match.participantIds) {
      assert.equal(
        input.participantTalentProfiles[participant.wrestlerId]?.wrestlerId,
        participant.wrestlerId
      );
    }
  });

  it("constructs MatchEngineInput with optional finish intent", () => {
    const input = createSampleMatchEngineInputWithFinishIntent({
      type: "clean",
      protection: "protected",
      controversy: "low"
    });

    assert.equal(input.finishIntent?.type, "clean");
    assert.equal(input.finishIntent?.protection, "protected");
    assert.equal(input.finishIntent?.controversy, "low");
  });

  it("links TalentProfile to match participants by wrestlerId", () => {
    const talentProfiles = createParticipantTalentProfiles(sampleTalentProfiles);

    assert.equal(talentProfiles["wrestler-jade-valor"]?.id, "talent-jade-valor");
    assert.equal(talentProfiles["wrestler-marcus-crowe"]?.id, "talent-marcus-crowe");
    assert.equal(talentProfiles["wrestler-rio-ace"]?.id, "talent-rio-ace");
  });

  it("returns a MatchEngineResult through run(input, context, options)", () => {
    const input = createSampleMatchEngineInput();
    const context = createSampleEngineContext("match-v0-result", 7);
    const result: MatchEngineResult = matchEngine.run(input, context, { debug: true });

    assert.equal(result.engineName, "match");
    assert.equal(result.matchId, input.match.id);
    assert.deepEqual(
      result.changedWrestlerIds,
      input.participants.map((wrestler) => wrestler.id)
    );
    assert.deepEqual(result.changedRivalryIds, [input.rivalry?.id]);
    assert.equal(typeof result.hiddenState.matchRoll, "number");
    assert.ok(result.signals.length > 0);
  });

  it("uses context.random deterministically for the same seed and input", () => {
    const input = createSampleMatchEngineInput();
    const firstResult = matchEngine.run(input, createSampleEngineContext("match-v0-same-seed", 7), {
      debug: true
    });
    const secondResult = matchEngine.run(input, createSampleEngineContext("match-v0-same-seed", 7), {
      debug: true
    });

    assert.deepEqual(firstResult, secondResult);
  });

  it("uses context.random deterministically for the same seed, input, and talent profiles", () => {
    const input = createSampleMatchEngineInputWithTalentProfiles();
    const firstResult = matchEngine.run(
      input,
      createSampleEngineContext("match-v0-talent-same-seed", 7),
      { debug: true }
    );
    const secondResult = matchEngine.run(
      input,
      createSampleEngineContext("match-v0-talent-same-seed", 7),
      { debug: true }
    );

    assert.deepEqual(firstResult, secondResult);
  });

  it("allows different seeds to produce different hidden and debug outcomes", () => {
    const input = createSampleMatchEngineInput();
    const firstResult = matchEngine.run(input, createSampleEngineContext("match-v0-seed-a", 7), {
      debug: true
    });
    const secondResult = matchEngine.run(input, createSampleEngineContext("match-v0-seed-b", 7), {
      debug: true
    });

    assert.notDeepEqual(firstResult.hiddenState, secondResult.hiddenState);
    assert.notDeepEqual(firstResult.debugTrace?.hiddenRolls, secondResult.debugTrace?.hiddenRolls);
  });

  it("does not expose hidden numeric state through player-facing signals", () => {
    const result = matchEngine.run(
      createSampleMatchEngineInput(),
      createSampleEngineContext("match-v0-hidden-boundary", 7)
    );

    assert.ok(Object.values(result.hiddenState).some((value) => typeof value === "number"));
    assertEngineResultRespectsOutputBoundary(result);
  });

  it("reads talent profile coverage only into hidden state and debug trace", () => {
    const fullInput = createSampleMatchEngineInputWithTalentProfiles();
    const partialInput = createSampleMatchEngineInputWithPartialTalentProfiles();
    const fullResult = matchEngine.run(
      fullInput,
      createSampleEngineContext("match-v0-talent-full", 7),
      { debug: true }
    );
    const partialResult = matchEngine.run(
      partialInput,
      createSampleEngineContext("match-v0-talent-partial", 7),
      { debug: true }
    );

    assert.equal(fullResult.hiddenState.talentProfileCoverage, "full");
    assert.equal(fullResult.hiddenState.matchedTalentProfileCount, 2);
    assert.deepEqual(fullResult.hiddenState.missingTalentProfileWrestlerIds, []);
    assert.equal(fullResult.hiddenState.talentProfileReadStatus, "full-coverage");
    assert.equal(fullResult.hiddenState.talentReadSummary.participantCoverage, "full");
    assert.equal(fullResult.hiddenState.matchReadSummary.talentCoverage, "full");
    assert.equal(fullResult.hiddenState.matchReadSummary.readinessRead, "ready");
    assert.equal(fullResult.hiddenState.finishIntentValidation.status, "underspecified");
    assert.equal(fullResult.hiddenState.finishIntentValidation.severity, "low");
    assert.equal(fullResult.hiddenState.resultShell.status, "pending");
    assert.equal(fullResult.hiddenState.resultShell.hasWinner, false);
    assert.equal(fullResult.hiddenState.resultShell.hasFinish, false);
    assert.equal(fullResult.hiddenState.resultShell.hasRating, false);
    assert.equal(fullResult.hiddenState.resultShell.hasConsequences, false);
    assert.equal(fullResult.hiddenState.resultExecutionGate.status, "pending");
    assert.equal(fullResult.hiddenState.resultExecutionGate.canExecuteResult, false);
    assert.equal(fullResult.hiddenState.resultExecutionGate.observedShellStatus, "pending");
    assert.equal(fullResult.hiddenState.resultIntentClassification.classification, "needs-more-context");
    assert.equal(fullResult.hiddenState.resultIntentClassification.sourceAvailability, "pending");
    assert.equal(fullResult.hiddenState.finishReadSummary.finishIntentTypeRead, "unspecified");
    assert.equal(fullResult.hiddenState.finishReadSummary.finishConfidenceRead, "stable");
    assert.equal(fullResult.hiddenState.finishReadSummary.finishRiskRead, "stable");
    assert.equal(fullResult.hiddenState.talentReadSummary.participantReads[0].inRingBand, "strong");
    assert.equal(fullResult.hiddenState.talentReadSummary.participantReads[1].promoBand, "elite");
    assert.equal(partialResult.hiddenState.talentProfileCoverage, "partial");
    assert.equal(partialResult.hiddenState.matchedTalentProfileCount, 1);
    assert.deepEqual(partialResult.hiddenState.missingTalentProfileWrestlerIds, [
      "wrestler-marcus-crowe"
    ]);
    assert.equal(partialResult.hiddenState.talentReadSummary.participantReads[1].profilePresent, false);
    assert.match(partialResult.debugTrace?.notes?.join(" ") ?? "", /partial-coverage/);
    assertPlayerFacingSignalsDoNotExposeHiddenValues(fullResult.signals);
    assert.equal(JSON.stringify(fullResult.signals).includes("talentProfile"), false);
  });

  it("marks absent talent profiles as hidden no-input bands without changing player-facing signals", () => {
    const withoutTalentInput = createSampleMatchEngineInput();
    const withTalentInput = createSampleMatchEngineInputWithTalentProfiles();
    const withoutTalent = matchEngine.run(
      withoutTalentInput,
      createSampleEngineContext("match-v0-talent-output-boundary", 7)
    );
    const withTalent = matchEngine.run(
      withTalentInput,
      createSampleEngineContext("match-v0-talent-output-boundary", 7)
    );

    assert.equal(withoutTalent.hiddenState.talentProfileCoverage, "none");
    assert.equal(withoutTalent.hiddenState.talentProfileReadStatus, "not-provided");
    assert.deepEqual(withoutTalent.hiddenState.missingTalentProfileWrestlerIds, [
      "wrestler-jade-valor",
      "wrestler-marcus-crowe"
    ]);
    assert.ok(
      withoutTalent.hiddenState.talentReadSummary.participantReads.every(
        (participantRead) => participantRead.inRingBand === "missing"
      )
    );
    assert.equal(withoutTalent.hiddenState.finishReadSummary.finishConfidenceRead, "unknown");
    assert.equal(withoutTalent.hiddenState.finishReadSummary.finishProtectionRead, "unknown");
    assert.equal(withoutTalent.hiddenState.finishIntentValidation.status, "underspecified");
    assert.equal(withoutTalent.hiddenState.finishIntentValidation.severity, "moderate");
    assert.equal(withoutTalent.hiddenState.resultShell.status, "pending");
    assert.equal(withoutTalent.hiddenState.resultShell.confidence, "unknown");
    assert.equal(withoutTalent.hiddenState.resultExecutionGate.status, "pending");
    assert.equal(withoutTalent.hiddenState.resultExecutionGate.canExecuteResult, false);
    assert.equal(withoutTalent.hiddenState.resultIntentClassification.classification, "needs-more-context");
    assert.deepEqual(withTalent.signals, withoutTalent.signals);
    assertEngineResultRespectsOutputBoundary(withTalent);
  });

  it("keeps raw TalentProfile numbers out of player-facing match signals", () => {
    const result = matchEngine.run(
      createSampleMatchEngineInputWithTalentProfiles(),
      createSampleEngineContext("match-v0-talent-raw-boundary", 7)
    );
    const serializedSignals = JSON.stringify(result.signals);

    assertPlayerFacingSignalsDoNotExposeHiddenValues(result.signals);
    assert.equal(serializedSignals.includes("inRingBand"), false);
    assert.equal(serializedSignals.includes("finishIntent"), false);
    assert.equal(serializedSignals.includes("finishIntentValidation"), false);
    assert.equal(serializedSignals.includes("finishRead"), false);
    assert.equal(serializedSignals.includes("resultShell"), false);
    assert.equal(serializedSignals.includes("resultExecutionGate"), false);
    assert.equal(serializedSignals.includes("resultIntentClassification"), false);
    assert.equal(serializedSignals.includes("protected-finish-ready"), false);
    assert.equal(serializedSignals.includes("standard-match-ready"), false);
    assert.equal(serializedSignals.includes("canExecuteResult"), false);
    assert.equal(serializedSignals.includes("result-shell-ready"), false);
    assert.equal(serializedSignals.includes("ready_for_execution"), false);
    assert.equal(serializedSignals.includes("blocked"), false);
    assert.equal(serializedSignals.includes("pending"), false);
    assert.equal(serializedSignals.includes("finishProtectionRead"), false);
    assert.equal(serializedSignals.includes("finishRiskRead"), false);
    assert.equal(serializedSignals.includes("finish-intent-unspecified"), false);
    assert.equal(serializedSignals.includes("underspecified"), false);
    assert.equal(serializedSignals.includes("questionable"), false);
    assert.equal(serializedSignals.includes("protected"), false);
    assert.equal(serializedSignals.includes(String(sampleTalentProfiles[0].attributes.inRingSkill)), false);
    assert.equal(serializedSignals.includes(String(sampleTalentProfiles[1].attributes.promoSkill)), false);
  });

  it("lets finish intent influence hidden finish reads only", () => {
    const cleanInput = createSampleMatchEngineInputWithFinishIntent({
      type: "clean",
      protection: "protected",
      controversy: "low"
    });
    const interferenceInput = createSampleMatchEngineInputWithFinishIntent({
      type: "interference",
      protection: "disputed",
      controversy: "high"
    });
    const cleanResult = matchEngine.run(
      cleanInput,
      createSampleEngineContext("match-v0-finish-intent", 7),
      { debug: true }
    );
    const interferenceResult = matchEngine.run(
      interferenceInput,
      createSampleEngineContext("match-v0-finish-intent", 7),
      { debug: true }
    );

    assert.equal(cleanResult.hiddenState.finishReadSummary.finishIntentTypeRead, "clean");
    assert.equal(cleanResult.hiddenState.finishIntentValidation.status, "valid");
    assert.equal(cleanResult.hiddenState.resultShell.status, "ready_for_execution");
    assert.equal(cleanResult.hiddenState.resultExecutionGate.status, "open");
    assert.equal(cleanResult.hiddenState.resultExecutionGate.canExecuteResult, true);
    assert.equal(cleanResult.hiddenState.resultIntentClassification.classification, "protected-finish-ready");
    assert.equal(cleanResult.hiddenState.resultIntentClassification.sourceAvailability, "available");
    assert.equal(cleanResult.hiddenState.finishReadSummary.finishProtectionRead, "protected");
    assert.equal(interferenceResult.hiddenState.finishReadSummary.finishIntentTypeRead, "interference");
    assert.equal(interferenceResult.hiddenState.finishIntentValidation.status, "risky");
    assert.equal(interferenceResult.hiddenState.resultShell.status, "blocked");
    assert.equal(interferenceResult.hiddenState.resultExecutionGate.status, "blocked");
    assert.equal(interferenceResult.hiddenState.resultExecutionGate.canExecuteResult, false);
    assert.equal(interferenceResult.hiddenState.resultIntentClassification.classification, "blocked");
    assert.equal(interferenceResult.hiddenState.resultIntentClassification.sourceAvailability, "blocked");
    assert.equal(interferenceResult.hiddenState.finishReadSummary.finishControversyRead, "volatile");
    assert.notDeepEqual(
      cleanResult.hiddenState.finishReadSummary,
      interferenceResult.hiddenState.finishReadSummary
    );
    assert.deepEqual(cleanResult.signals, interferenceResult.signals);
    assert.equal(Object.hasOwn(cleanResult, "winnerId"), false);
    assert.equal(Object.hasOwn(cleanResult, "result"), false);
    assert.equal(Object.hasOwn(cleanResult, "starRating"), false);
    assert.equal(Object.hasOwn(cleanResult, "finishResult"), false);
    assert.equal(Object.hasOwn(cleanResult, "consequences"), false);
    assert.equal(Object.hasOwn(cleanResult.hiddenState.resultShell, "winnerId"), false);
    assert.equal(Object.hasOwn(cleanResult.hiddenState.resultShell, "loserId"), false);
    assert.equal(Object.hasOwn(cleanResult.hiddenState.resultShell, "rating"), false);
    assert.equal(Object.hasOwn(cleanResult.hiddenState.resultShell, "finishResult"), false);
    assert.equal(Object.hasOwn(cleanResult.hiddenState.resultExecutionGate, "winnerId"), false);
    assert.equal(Object.hasOwn(cleanResult.hiddenState.resultExecutionGate, "loserId"), false);
    assert.equal(Object.hasOwn(cleanResult.hiddenState.resultExecutionGate, "rating"), false);
    assert.equal(Object.hasOwn(cleanResult.hiddenState.resultExecutionGate, "finishResult"), false);
    assert.equal(Object.hasOwn(cleanResult.hiddenState.resultExecutionGate, "consequences"), false);
  });

  it("keeps the result execution gate closed when the result shell is unavailable", () => {
    const unsupportedResult = matchEngine.run(
      createSampleMatchEngineInputWithFinishIntent({ type: "ladder-fall" } as Parameters<
        typeof createSampleMatchEngineInputWithFinishIntent
      >[0]),
      createSampleEngineContext("match-v0-unsupported-finish-intent", 7)
    );

    assert.equal(unsupportedResult.hiddenState.resultShell.status, "unavailable");
    assert.equal(unsupportedResult.hiddenState.resultExecutionGate.status, "closed");
    assert.equal(unsupportedResult.hiddenState.resultExecutionGate.canExecuteResult, false);
    assert.equal(unsupportedResult.hiddenState.resultIntentClassification.classification, "unavailable");
    assert.equal(unsupportedResult.hiddenState.resultIntentClassification.sourceAvailability, "unavailable");
    assert.equal(Object.hasOwn(unsupportedResult, "winnerId"), false);
    assert.equal(Object.hasOwn(unsupportedResult, "result"), false);
    assert.equal(Object.hasOwn(unsupportedResult, "starRating"), false);
    assert.equal(Object.hasOwn(unsupportedResult, "finishResult"), false);
  });

  it("keeps draw and stoppage intent hidden without creating winner or result output", () => {
    const drawResult = matchEngine.run(
      createSampleMatchEngineInputWithFinishIntent({ type: "draw", controversy: "moderate" }),
      createSampleEngineContext("match-v0-draw-intent", 7)
    );
    const stoppageResult = matchEngine.run(
      createSampleMatchEngineInputWithFinishIntent({ type: "stoppage", controversy: "moderate" }),
      createSampleEngineContext("match-v0-stoppage-intent", 7)
    );

    assert.equal(drawResult.hiddenState.finishReadSummary.finishIntentTypeRead, "draw");
    assert.equal(drawResult.hiddenState.finishIntentValidation.status, "questionable");
    assert.equal(drawResult.hiddenState.resultShell.status, "pending");
    assert.equal(drawResult.hiddenState.resultExecutionGate.status, "pending");
    assert.equal(drawResult.hiddenState.resultExecutionGate.canExecuteResult, false);
    assert.equal(drawResult.hiddenState.resultIntentClassification.classification, "limited");
    assert.equal(drawResult.hiddenState.finishReadSummary.finishMomentumRead, "disputed");
    assert.equal(stoppageResult.hiddenState.finishReadSummary.finishIntentTypeRead, "stoppage");
    assert.equal(stoppageResult.hiddenState.finishIntentValidation.status, "risky");
    assert.equal(stoppageResult.hiddenState.resultShell.status, "blocked");
    assert.equal(stoppageResult.hiddenState.resultExecutionGate.status, "blocked");
    assert.equal(stoppageResult.hiddenState.resultExecutionGate.canExecuteResult, false);
    assert.equal(stoppageResult.hiddenState.resultIntentClassification.classification, "blocked");
    assert.equal(stoppageResult.hiddenState.finishReadSummary.finishMomentumRead, "disputed");
    assert.equal(Object.hasOwn(drawResult, "winnerId"), false);
    assert.equal(Object.hasOwn(drawResult, "result"), false);
    assert.equal(Object.hasOwn(stoppageResult, "winnerId"), false);
    assert.equal(Object.hasOwn(stoppageResult, "result"), false);
  });

  it("lets different talent profiles change hidden match read categories only", () => {
    const strongTalent = matchEngine.run(
      createSampleMatchEngineInputWithTalentProfiles(),
      createSampleEngineContext("match-v0-tiny-talent-read", 7),
      { debug: true }
    );
    const weakTalent = matchEngine.run(
      createSampleMatchEngineInputWithLowTalentProfiles(),
      createSampleEngineContext("match-v0-tiny-talent-read", 7),
      { debug: true }
    );

    assert.notDeepEqual(
      weakTalent.hiddenState.matchReadSummary,
      strongTalent.hiddenState.matchReadSummary
    );
    assert.equal(strongTalent.hiddenState.matchReadSummary.readinessRead, "ready");
    assert.equal(weakTalent.hiddenState.matchReadSummary.readinessRead, "poor");
    assert.equal(strongTalent.hiddenState.matchReadSummary.riskPressureRead, "moderate");
    assert.equal(weakTalent.hiddenState.matchReadSummary.riskPressureRead, "elevated");
    assert.equal(strongTalent.hiddenState.finishReadSummary.finishRiskRead, "stable");
    assert.equal(weakTalent.hiddenState.finishReadSummary.finishRiskRead, "volatile");
    assert.equal(strongTalent.hiddenState.resultShell.status, "pending");
    assert.equal(weakTalent.hiddenState.resultShell.status, "blocked");
    assert.equal(strongTalent.hiddenState.resultExecutionGate.status, "pending");
    assert.equal(weakTalent.hiddenState.resultExecutionGate.status, "blocked");
    assert.equal(strongTalent.hiddenState.resultExecutionGate.canExecuteResult, false);
    assert.equal(weakTalent.hiddenState.resultExecutionGate.canExecuteResult, false);
    assert.equal(strongTalent.hiddenState.resultIntentClassification.classification, "needs-more-context");
    assert.equal(weakTalent.hiddenState.resultIntentClassification.classification, "blocked");
    assert.deepEqual(weakTalent.signals, strongTalent.signals);
    assert.equal(Object.hasOwn(strongTalent, "winnerId"), false);
    assert.equal(Object.hasOwn(strongTalent, "starRating"), false);
    assert.equal(Object.hasOwn(strongTalent.hiddenState, "winnerId"), false);
    assert.equal(Object.hasOwn(strongTalent.hiddenState, "starRating"), false);
    assert.equal(Object.hasOwn(strongTalent, "finish"), false);
    assert.equal(Object.hasOwn(strongTalent.hiddenState, "finish"), false);
  });

  it("honors debug requests from context and options, and marks traces non-player-facing", () => {
    const input = createSampleMatchEngineInput();
    const fromContext = matchEngine.run(input, createSampleEngineContext("match-v0-debug", 7));
    const fromOptions = matchEngine.run(input, { ...createSampleEngineContext("match-v0-debug", 7), debug: false }, {
      debug: true
    });

    assertDebugTraceIsNonPlayerFacing(fromContext.debugTrace);
    assertDebugTraceIsNonPlayerFacing(fromOptions.debugTrace);
  });

  it("can omit debug trace when context and options do not request it", () => {
    const context = {
      ...createSampleEngineContext("match-v0-no-debug", 7),
      debug: false
    };
    const result = matchEngine.run(createSampleMatchEngineInput(), context);

    assert.equal(result.debugTrace, undefined);
  });

  it("keeps context out of match engine input objects", () => {
    const input = createSampleMatchEngineInput();

    assert.equal(Object.hasOwn(input, "context"), false);
  });

  it("uses run(input, context) as canonical even if a caller passes an extra runtime context field", () => {
    const baseInput = createSampleMatchEngineInput();
    const inputWithExtraContext = {
      ...baseInput,
      context: createSampleEngineContext("embedded-context-must-not-drive-v0", 99)
    } as typeof baseInput;

    const firstResult = matchEngine.run(
      baseInput,
      createSampleEngineContext("canonical-context-drives-v0", 7),
      { debug: true }
    );
    const secondResult = matchEngine.run(
      inputWithExtraContext,
      createSampleEngineContext("canonical-context-drives-v0", 7),
      { debug: true }
    );

    assert.deepEqual(firstResult, secondResult);
  });

  it("does not use the global random API directly in source or tests", () => {
    const forbidden = "Math" + "." + "random";
    const matches = findTypeScriptFiles(["src", "tests"]).filter((filePath) =>
      readFileSync(filePath, "utf8").includes(forbidden)
    );

    assert.deepEqual(matches, []);
  });
});

function findTypeScriptFiles(relativeDirectories: readonly string[]): string[] {
  return relativeDirectories.flatMap((directory) => walk(directory));
}

function walk(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      return walk(entryPath);
    }

    return entry.isFile() && entry.name.endsWith(".ts") ? [entryPath] : [];
  });
}
