import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  SOCIAL_DISCOURSE_ENGINE_V0_ID,
  socialDiscourseEngine,
  type SocialDiscourseEngineResult,
  type SocialDiscourseSimulationEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleSocialDiscourseEngineInput,
  samplePipelineHandoff
} from "./fixtures/index.ts";
import {
  assertDebugTraceIsNonPlayerFacing,
  assertEngineResultRespectsOutputBoundary
} from "./helpers/engineOutputBoundaryAssertions.ts";

describe("Social Discourse Engine v0", () => {
  it("imports cleanly and implements SocialDiscourseSimulationEngine", () => {
    const engine: SocialDiscourseSimulationEngine = socialDiscourseEngine;

    assert.equal(engine, socialDiscourseEngine);
    assert.equal(typeof engine.run, "function");
  });

  it("exposes stable metadata", () => {
    assert.deepEqual(socialDiscourseEngine.metadata, {
      id: SOCIAL_DISCOURSE_ENGINE_V0_ID,
      name: "Social Discourse Engine v0",
      version: "0.5.0"
    });
  });

  it("returns a SocialDiscourseEngineResult through run(input, context, options)", () => {
    const input = createSampleSocialDiscourseEngineInput();
    const context = createSampleEngineContext("social-v0-result", 7);
    const result: SocialDiscourseEngineResult = socialDiscourseEngine.run(input, context, {
      debug: true
    });

    assert.equal(result.engineName, "social-discourse");
    assert.deepEqual(
      result.updatedNarrativeIds,
      input.existingNarratives.map((narrative) => narrative.id)
    );
    assert.deepEqual(result.producedNarratives, []);
    assert.equal(typeof result.hiddenState.discourseRoll, "number");
    assert.equal(result.hiddenState.fanReactionHandoffPresent, true);
    assert.deepEqual(result.hiddenState.fanReactionShowOutputReadiness, {
      provided: true,
      structurallyUsable: true,
      inputStatus: "usable",
      shellStatus: "ready",
      readyForSocialDiscourseHandoff: true,
      issueCount: 0,
      matchCount: 1,
      showId: "show-week-7"
    });
    assert.deepEqual(result.hiddenState.showSignalReadiness, {
      expectedSignalCount: 5,
      presentSignalCount: 5,
      missingSignalCount: 0,
      unusableSignalCount: 0,
      fields: {
        crowdEnergyRead: "present",
        bookingTrustRead: "present",
        featuredTalentReceptionRead: "present",
        showMomentumRead: "present",
        confidenceRead: "present"
      }
    });
    assert.deepEqual(result.hiddenState.discourseReadinessBuckets, {
      iwcPulseReadiness: "structurally-ready",
      mediaNarrativeReadiness: "structurally-ready",
      lockerRoomBuzzReadiness: "structurally-ready",
      fanDebateReadiness: "structurally-ready",
      trendVolatilityReadiness: "structurally-ready"
    });
    assert.deepEqual(
      result.hiddenState.discourseOutputShell,
      expectedDiscourseOutputShell("structurally-ready", "available")
    );
    assert.ok(result.signals.length > 0);
  });

  it("uses context.random deterministically for the same seed and input", () => {
    const input = createSampleSocialDiscourseEngineInput();
    const firstResult = socialDiscourseEngine.run(
      input,
      createSampleEngineContext("social-v0-same-seed", 7),
      { debug: true }
    );
    const secondResult = socialDiscourseEngine.run(
      input,
      createSampleEngineContext("social-v0-same-seed", 7),
      { debug: true }
    );

    assert.deepEqual(firstResult, secondResult);
  });

  it("allows different seeds to produce different hidden and debug outcomes", () => {
    const input = createSampleSocialDiscourseEngineInput();
    const firstResult = socialDiscourseEngine.run(
      input,
      createSampleEngineContext("social-v0-seed-a", 7),
      { debug: true }
    );
    const secondResult = socialDiscourseEngine.run(
      input,
      createSampleEngineContext("social-v0-seed-b", 7),
      { debug: true }
    );

    assert.notDeepEqual(firstResult.hiddenState, secondResult.hiddenState);
    assert.notDeepEqual(firstResult.debugTrace?.hiddenRolls, secondResult.debugTrace?.hiddenRolls);
  });

  it("does not expose hidden numeric state through player-facing signals", () => {
    const result = socialDiscourseEngine.run(
      createSampleSocialDiscourseEngineInput(),
      createSampleEngineContext("social-v0-hidden-boundary", 7)
    );

    assert.ok(Object.values(result.hiddenState).some((value) => typeof value === "number"));
    assertEngineResultRespectsOutputBoundary(result);
  });

  it("keeps debug traces optional and non-player-facing", () => {
    const input = createSampleSocialDiscourseEngineInput();
    const withoutDebug = socialDiscourseEngine.run(input, {
      ...createSampleEngineContext("social-v0-debug", 7),
      debug: false
    });
    const withDebug = socialDiscourseEngine.run(
      input,
      createSampleEngineContext("social-v0-debug", 7),
      { debug: true }
    );

    assert.equal(withoutDebug.debugTrace, undefined);
    assertDebugTraceIsNonPlayerFacing(withDebug.debugTrace);
    assert.equal(withDebug.debugTrace?.engineName, "social-discourse");
  });

  it("can consume the existing fan-to-social fixture handoff", () => {
    const input = samplePipelineHandoff.socialDiscourseInput;
    const result = socialDiscourseEngine.run(
      input,
      createSampleEngineContext("social-v0-fixture-handoff", 7),
      { debug: true }
    );

    assert.equal(input.fanReactionResult, samplePipelineHandoff.fanReactionResult);
    assert.equal(input.fanReactionShowHandoff?.sourceEngine, "fan-reaction");
    assert.equal(input.fanReactionShowHandoff?.playerFacing, false);
    assert.equal(result.hiddenState.fanReactionHandoffPresent, true);
    assert.equal(result.hiddenState.fanReactionShowOutputReadiness.inputStatus, "usable");
    assert.equal(result.hiddenState.fanReactionShowOutputReadiness.shellStatus, "ready");
    assert.equal(result.hiddenState.showSignalReadiness.presentSignalCount, 5);
    assert.equal(
      result.hiddenState.fanReactionShowOutputReadiness.readyForSocialDiscourseHandoff,
      true
    );
    assert.deepEqual(
      result.updatedNarrativeIds,
      samplePipelineHandoff.socialDiscourseInput.existingNarratives.map(
        (narrative) => narrative.id
      )
    );
  });

  it("keeps the fan show-output contract optional and hidden-only", () => {
    const input = createSampleSocialDiscourseEngineInput();
    const { fanReactionShowHandoff, ...inputWithoutShowHandoff } = input;
    const withShell = socialDiscourseEngine.run(
      input,
      createSampleEngineContext("social-v0-optional-show-output", 7)
    );
    const withoutShell = socialDiscourseEngine.run(
      inputWithoutShowHandoff,
      createSampleEngineContext("social-v0-optional-show-output", 7)
    );

    assert.ok(fanReactionShowHandoff);
    assert.deepEqual(withoutShell.hiddenState.fanReactionShowOutputReadiness, {
      provided: false,
      structurallyUsable: false,
      inputStatus: "missing",
      shellStatus: null,
      readyForSocialDiscourseHandoff: false,
      issueCount: 0,
      matchCount: null,
      showId: null
    });
    assert.deepEqual(withoutShell.hiddenState.showSignalReadiness, {
      expectedSignalCount: 5,
      presentSignalCount: 0,
      missingSignalCount: 5,
      unusableSignalCount: 0,
      fields: {
        crowdEnergyRead: "missing",
        bookingTrustRead: "missing",
        featuredTalentReceptionRead: "missing",
        showMomentumRead: "missing",
        confidenceRead: "missing"
      }
    });
    assert.deepEqual(withoutShell.hiddenState.discourseReadinessBuckets, {
      iwcPulseReadiness: "unavailable",
      mediaNarrativeReadiness: "unavailable",
      lockerRoomBuzzReadiness: "unavailable",
      fanDebateReadiness: "unavailable",
      trendVolatilityReadiness: "unavailable"
    });
    assert.deepEqual(
      withoutShell.hiddenState.discourseOutputShell,
      expectedDiscourseOutputShell("unavailable", "none")
    );
    assert.deepEqual(withShell.signals, withoutShell.signals);
    assert.deepEqual(withShell.producedNarratives, withoutShell.producedNarratives);
    assert.deepEqual(withShell.updatedNarrativeIds, withoutShell.updatedNarrativeIds);
  });

  it("maps partial show signals into hidden discourse readiness buckets without changing public output", () => {
    const input = createSampleSocialDiscourseEngineInput();
    const partialInput = {
      ...input,
      fanReactionShowHandoff: {
        ...input.fanReactionShowHandoff,
        showOutputReadiness: {
          ...input.fanReactionShowHandoff?.showOutputReadiness,
          shellStatus: "partial",
          readyForSocialDiscourseHandoff: false,
          issueCount: 1
        },
        showSignals: {
          crowdEnergyRead: "limited",
          bookingTrustRead: "needs-more-context",
          featuredTalentReceptionRead: "limited",
          showMomentumRead: "pending",
          confidenceRead: "limited"
        }
      }
    };
    const validResult = socialDiscourseEngine.run(
      input,
      createSampleEngineContext("social-v0-partial-discourse-buckets", 7)
    );
    const partialResult = socialDiscourseEngine.run(
      partialInput,
      createSampleEngineContext("social-v0-partial-discourse-buckets", 7)
    );

    assert.deepEqual(partialResult.hiddenState.showSignalReadiness, {
      expectedSignalCount: 5,
      presentSignalCount: 5,
      missingSignalCount: 0,
      unusableSignalCount: 0,
      fields: {
        crowdEnergyRead: "present",
        bookingTrustRead: "present",
        featuredTalentReceptionRead: "present",
        showMomentumRead: "present",
        confidenceRead: "present"
      }
    });
    assert.deepEqual(partialResult.hiddenState.discourseReadinessBuckets, {
      iwcPulseReadiness: "limited",
      mediaNarrativeReadiness: "limited",
      lockerRoomBuzzReadiness: "limited",
      fanDebateReadiness: "limited",
      trendVolatilityReadiness: "limited"
    });
    assert.deepEqual(
      partialResult.hiddenState.discourseOutputShell,
      expectedDiscourseOutputShell("limited", "limited")
    );
    assert.deepEqual(validResult.signals, partialResult.signals);
    assert.deepEqual(validResult.producedNarratives, partialResult.producedNarratives);
    assert.deepEqual(validResult.updatedNarrativeIds, partialResult.updatedNarrativeIds);
  });

  it("maps malformed show signals into hidden readiness without changing public output", () => {
    const input = createSampleSocialDiscourseEngineInput();
    const malformedInput = {
      ...input,
      fanReactionShowHandoff: {
        ...input.fanReactionShowHandoff,
        showSignals: {
          crowdEnergyRead: "neutral",
          bookingTrustRead: "loud",
          featuredTalentReceptionRead: undefined,
          showMomentumRead: "limited",
          confidenceRead: 1
        }
      }
    };
    const validResult = socialDiscourseEngine.run(
      input,
      createSampleEngineContext("social-v0-malformed-show-signals", 7)
    );
    const malformedResult = socialDiscourseEngine.run(
      malformedInput,
      createSampleEngineContext("social-v0-malformed-show-signals", 7)
    );

    assert.deepEqual(malformedResult.hiddenState.showSignalReadiness, {
      expectedSignalCount: 5,
      presentSignalCount: 2,
      missingSignalCount: 1,
      unusableSignalCount: 2,
      fields: {
        crowdEnergyRead: "present",
        bookingTrustRead: "unusable",
        featuredTalentReceptionRead: "missing",
        showMomentumRead: "present",
        confidenceRead: "unusable"
      }
    });
    assert.deepEqual(malformedResult.hiddenState.discourseReadinessBuckets, {
      iwcPulseReadiness: "blocked",
      mediaNarrativeReadiness: "blocked",
      lockerRoomBuzzReadiness: "blocked",
      fanDebateReadiness: "blocked",
      trendVolatilityReadiness: "blocked"
    });
    assert.deepEqual(
      malformedResult.hiddenState.discourseOutputShell,
      expectedDiscourseOutputShell("blocked", "blocked")
    );
    assert.deepEqual(validResult.signals, malformedResult.signals);
    assert.deepEqual(validResult.producedNarratives, malformedResult.producedNarratives);
    assert.deepEqual(validResult.updatedNarrativeIds, malformedResult.updatedNarrativeIds);
  });

  it("keeps hidden discourse readiness buckets pending when show signals are absent", () => {
    const input = createSampleSocialDiscourseEngineInput();
    const absentSignalsInput = {
      ...input,
      fanReactionShowHandoff: {
        ...input.fanReactionShowHandoff,
        showSignals: null
      }
    };
    const result = socialDiscourseEngine.run(
      absentSignalsInput,
      createSampleEngineContext("social-v0-absent-discourse-signals", 7)
    );

    assert.deepEqual(result.hiddenState.showSignalReadiness, {
      expectedSignalCount: 5,
      presentSignalCount: 0,
      missingSignalCount: 5,
      unusableSignalCount: 0,
      fields: {
        crowdEnergyRead: "missing",
        bookingTrustRead: "missing",
        featuredTalentReceptionRead: "missing",
        showMomentumRead: "missing",
        confidenceRead: "missing"
      }
    });
    assert.deepEqual(result.hiddenState.discourseReadinessBuckets, {
      iwcPulseReadiness: "pending",
      mediaNarrativeReadiness: "pending",
      lockerRoomBuzzReadiness: "pending",
      fanDebateReadiness: "pending",
      trendVolatilityReadiness: "pending"
    });
    assert.deepEqual(
      result.hiddenState.discourseOutputShell,
      expectedDiscourseOutputShell("pending", "pending")
    );
  });

  it("does not generate prose artifacts in the v0 shell", () => {
    const result = socialDiscourseEngine.run(
      createSampleSocialDiscourseEngineInput(),
      createSampleEngineContext("social-v0-no-generated-prose", 7)
    );

    assert.deepEqual(result.producedNarratives, []);
    assert.equal(JSON.stringify(result.hiddenState.discourseOutputShell).includes("generatedText"), false);
    assert.equal(JSON.stringify(result.hiddenState.discourseOutputShell).includes("body"), false);
    assert.equal(JSON.stringify(result.hiddenState.discourseOutputShell).includes("content"), false);
  });

  it("does not use the global random API directly in source or tests", () => {
    const forbidden = "Math" + "." + "random";
    const matches = findTypeScriptFiles(["src", "tests"]).filter((filePath) =>
      readFileSync(filePath, "utf8").includes(forbidden)
    );

    assert.deepEqual(matches, []);
  });
});

function expectedDiscourseOutputShell(
  readiness: "unavailable" | "blocked" | "limited" | "pending" | "structurally-ready",
  sourceAvailability: "none" | "blocked" | "limited" | "pending" | "available"
) {
  const category = {
    status: readiness,
    readiness,
    sourceAvailability
  };

  return {
    sourceEngine: "social-discourse",
    playerFacing: false,
    iwcPulse: category,
    mediaNarrative: category,
    lockerRoomBuzz: category,
    fanDebate: category,
    trendVolatility: category
  };
}

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
