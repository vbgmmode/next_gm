import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  createEngineRegistry,
  createProductionEngineRegistry,
  DEFAULT_FAN_REACTION_ENGINE_ID,
  DEFAULT_MATCH_ENGINE_ID,
  DEFAULT_SHOW_ENGINE_ID,
  DEFAULT_SOCIAL_DISCOURSE_ENGINE_ID,
  FAN_REACTION_ENGINE_V0_ID,
  fanReactionEngine,
  getRegisteredFanReactionEngine,
  getRegisteredMatchEngine,
  getRegisteredShowEngine,
  getRegisteredSocialDiscourseEngine,
  MATCH_ENGINE_V0_ID,
  matchEngine,
  runRegisteredFanReactionEngine,
  runRegisteredMatchEngine,
  runRegisteredShowEngine,
  runRegisteredSocialDiscourseEngine,
  SHOW_ENGINE_V0_ID,
  showEngine,
  SOCIAL_DISCOURSE_ENGINE_V0_ID,
  socialDiscourseEngine,
  type FanReactionEngineInput,
  type FanReactionEngineResult,
  type FanReactionSimulationEngine,
  type MatchEngineInput,
  type MatchEngineResult,
  type MatchSimulationEngine,
  type ShowEngineInput,
  type ShowEngineResult,
  type ShowSimulationEngine,
  type SimulationEngineContext,
  type SimulationEngineRunOptions,
  type SocialDiscourseEngineInput,
  type SocialDiscourseEngineResult,
  type SocialDiscourseSimulationEngine
} from "../src/game/engines/index.ts";
import {
  createSampleEngineContext,
  createSampleFanReactionEngineInput,
  createSampleMatchEngineInput,
  createSampleShowEngineInput,
  createSampleSocialDiscourseEngineInput
} from "./fixtures/index.ts";
import {
  assertDebugTraceIsNonPlayerFacing,
  assertEngineResultRespectsOutputBoundary
} from "./helpers/engineOutputBoundaryAssertions.ts";

describe("EngineRegistry", () => {
  it("registers Match Engine v0 and lists registered metadata", () => {
    const registry = createEngineRegistry();

    registry.register(matchEngine);

    assert.deepEqual(registry.listMetadata(), [matchEngine.metadata]);
  });

  it("rejects duplicate engine ids", () => {
    const registry = createEngineRegistry();

    registry.register(matchEngine);

    assert.throws(() => registry.register(matchEngine), /already registered/);
  });

  it("rejects duplicate fan reaction engine ids", () => {
    const registry = createEngineRegistry();

    registry.register(fanReactionEngine);

    assert.throws(() => registry.register(fanReactionEngine), /already registered/);
  });

  it("rejects duplicate social discourse engine ids", () => {
    const registry = createEngineRegistry();

    registry.register(socialDiscourseEngine);

    assert.throws(() => registry.register(socialDiscourseEngine), /already registered/);
  });

  it("rejects duplicate show engine ids", () => {
    const registry = createEngineRegistry();

    registry.register(showEngine);

    assert.throws(() => registry.register(showEngine), /already registered/);
  });

  it("registers all production engine metadata entries", () => {
    const registry = createProductionEngineRegistry();

    assert.deepEqual(registry.listMetadata(), [
      matchEngine.metadata,
      fanReactionEngine.metadata,
      socialDiscourseEngine.metadata,
      showEngine.metadata
    ]);
    assert.deepEqual(
      registry.listMetadata().map((metadata) => metadata.id),
      [
        MATCH_ENGINE_V0_ID,
        FAN_REACTION_ENGINE_V0_ID,
        SOCIAL_DISCOURSE_ENGINE_V0_ID,
        SHOW_ENGINE_V0_ID
      ]
    );
  });

  it("keeps default engine ids aligned with centralized production ids", () => {
    assert.equal(DEFAULT_MATCH_ENGINE_ID, MATCH_ENGINE_V0_ID);
    assert.equal(DEFAULT_SHOW_ENGINE_ID, SHOW_ENGINE_V0_ID);
    assert.equal(DEFAULT_FAN_REACTION_ENGINE_ID, FAN_REACTION_ENGINE_V0_ID);
    assert.equal(DEFAULT_SOCIAL_DISCOURSE_ENGINE_ID, SOCIAL_DISCOURSE_ENGINE_V0_ID);
    assert.equal(matchEngine.metadata.id, MATCH_ENGINE_V0_ID);
    assert.equal(showEngine.metadata.id, SHOW_ENGINE_V0_ID);
    assert.equal(fanReactionEngine.metadata.id, FAN_REACTION_ENGINE_V0_ID);
    assert.equal(socialDiscourseEngine.metadata.id, SOCIAL_DISCOURSE_ENGINE_V0_ID);
  });

  it("retrieves and invokes Match Engine v0 through the SimulationEngine interface", () => {
    const registry = createProductionEngineRegistry();
    const engine = getRegisteredMatchEngine(registry);
    const input = createSampleMatchEngineInput();
    const context = createSampleEngineContext("registry-invocation", 7);

    const result = engine.run(input, context, { debug: true });

    assert.equal(engine.metadata.id, matchEngine.metadata.id);
    assert.equal(result.engineName, "match");
    assert.equal(result.matchId, input.match.id);
    assert.equal(result.debugTrace?.playerFacing, false);
  });

  it("invokes Match Engine v0 through the match pipeline helper", () => {
    const registry = createProductionEngineRegistry();
    const input = createSampleMatchEngineInput();
    const context = createSampleEngineContext("pipeline-invocation", 7);

    const result = runRegisteredMatchEngine(registry, input, context, { debug: true });

    assert.equal(result.engineName, "match");
    assert.equal(result.matchId, input.match.id);
    assert.equal(result.debugTrace?.playerFacing, false);
  });

  it("retrieves and invokes Show Engine v0 through the SimulationEngine interface", () => {
    const registry = createProductionEngineRegistry();
    const engine = getRegisteredShowEngine(registry);
    const input = createSampleShowEngineInput();
    const context = createSampleEngineContext("show-registry-invocation", 7);

    const result = engine.run(input, context, { debug: true });

    assert.equal(engine.metadata.id, showEngine.metadata.id);
    assert.equal(result.engineName, "show");
    assert.equal(result.showId, input.show.id);
    assert.equal(result.hiddenState.completedMatchEngineRuns, 1);
    assert.equal(result.debugTrace?.playerFacing, false);
  });

  it("invokes Show Engine v0 through the show pipeline helper", () => {
    const registry = createProductionEngineRegistry();
    const input = createSampleShowEngineInput();
    const context = createSampleEngineContext("show-pipeline-invocation", 7);

    const result = runRegisteredShowEngine(registry, input, context, { debug: true });

    assert.equal(result.engineName, "show");
    assert.equal(result.showId, input.show.id);
    assert.equal(result.matchResults[0].engineName, "match");
    assert.equal(result.debugTrace?.playerFacing, false);
  });

  it("retrieves and invokes Fan Reaction Engine v0 through the SimulationEngine interface", () => {
    const registry = createProductionEngineRegistry();
    const engine = getRegisteredFanReactionEngine(registry);
    const input = createSampleFanReactionEngineInput();
    const context = createSampleEngineContext("fan-registry-invocation", 7);

    const result = engine.run(input, context, { debug: true });

    assert.equal(engine.metadata.id, fanReactionEngine.metadata.id);
    assert.equal(result.engineName, "fan-reaction");
    assert.equal(result.hiddenState.matchHandoffPresent, true);
    assert.equal(result.debugTrace?.playerFacing, false);
  });

  it("invokes Fan Reaction Engine v0 through the fan reaction pipeline helper", () => {
    const registry = createProductionEngineRegistry();
    const input = createSampleFanReactionEngineInput();
    const context = createSampleEngineContext("fan-pipeline-invocation", 7);

    const result = runRegisteredFanReactionEngine(registry, input, context, { debug: true });

    assert.equal(result.engineName, "fan-reaction");
    assert.deepEqual(result.affectedFanSegmentIds, input.fanSegments.map((segment) => segment.id));
    assert.equal(result.debugTrace?.playerFacing, false);
  });

  it("retrieves and invokes Social Discourse Engine v0 through the SimulationEngine interface", () => {
    const registry = createProductionEngineRegistry();
    const engine = getRegisteredSocialDiscourseEngine(registry);
    const input = createSampleSocialDiscourseEngineInput();
    const context = createSampleEngineContext("social-registry-invocation", 7);

    const result = engine.run(input, context, { debug: true });

    assert.equal(engine.metadata.id, socialDiscourseEngine.metadata.id);
    assert.equal(result.engineName, "social-discourse");
    assert.equal(result.hiddenState.fanReactionHandoffPresent, true);
    assert.equal(result.debugTrace?.playerFacing, false);
  });

  it("invokes Social Discourse Engine v0 through the social discourse pipeline helper", () => {
    const registry = createProductionEngineRegistry();
    const input = createSampleSocialDiscourseEngineInput();
    const context = createSampleEngineContext("social-pipeline-invocation", 7);

    const result = runRegisteredSocialDiscourseEngine(registry, input, context, {
      debug: true
    });

    assert.equal(result.engineName, "social-discourse");
    assert.deepEqual(
      result.updatedNarrativeIds,
      input.existingNarratives.map((narrative) => narrative.id)
    );
    assert.equal(result.debugTrace?.playerFacing, false);
  });

  it("passes input, context, and options to the registered engine run method", () => {
    const registry = createEngineRegistry();
    const input = createSampleMatchEngineInput();
    const context = createSampleEngineContext("pipeline-run-signature", 7);
    const options: SimulationEngineRunOptions = { debug: true };
    let capturedInput: MatchEngineInput | undefined;
    let capturedContext: SimulationEngineContext | undefined;
    let capturedOptions: SimulationEngineRunOptions | undefined;

    const trackingEngine: MatchSimulationEngine = {
      metadata: {
        id: MATCH_ENGINE_V0_ID,
        name: "Tracking Match Engine",
        version: "0.0-test"
      },
      run(runInput, runContext, runOptions) {
        capturedInput = runInput;
        capturedContext = runContext;
        capturedOptions = runOptions;
        return matchEngine.run(runInput, runContext, runOptions);
      }
    };

    registry.register(trackingEngine);

    const result = runRegisteredMatchEngine(registry, input, context, options);

    assert.equal(capturedInput, input);
    assert.equal(capturedContext, context);
    assert.equal(capturedOptions, options);
    assert.equal(result.engineName, "match");
  });

  it("passes input, context, and options to the registered fan engine run method", () => {
    const registry = createEngineRegistry();
    const input = createSampleFanReactionEngineInput();
    const context = createSampleEngineContext("fan-pipeline-run-signature", 7);
    const options: SimulationEngineRunOptions = { debug: true };
    let capturedInput: FanReactionEngineInput | undefined;
    let capturedContext: SimulationEngineContext | undefined;
    let capturedOptions: SimulationEngineRunOptions | undefined;

    const trackingEngine: FanReactionSimulationEngine = {
      metadata: {
        id: FAN_REACTION_ENGINE_V0_ID,
        name: "Tracking Fan Reaction Engine",
        version: "0.0-test"
      },
      run(runInput, runContext, runOptions) {
        capturedInput = runInput;
        capturedContext = runContext;
        capturedOptions = runOptions;
        return fanReactionEngine.run(runInput, runContext, runOptions);
      }
    };

    registry.register(trackingEngine);

    const result = runRegisteredFanReactionEngine(
      registry,
      input,
      context,
      options
    );

    assert.equal(capturedInput, input);
    assert.equal(capturedContext, context);
    assert.equal(capturedOptions, options);
    assert.equal(result.engineName, "fan-reaction");
  });

  it("passes input, context, and options to the registered social engine run method", () => {
    const registry = createEngineRegistry();
    const input = createSampleSocialDiscourseEngineInput();
    const context = createSampleEngineContext("social-pipeline-run-signature", 7);
    const options: SimulationEngineRunOptions = { debug: true };
    let capturedInput: SocialDiscourseEngineInput | undefined;
    let capturedContext: SimulationEngineContext | undefined;
    let capturedOptions: SimulationEngineRunOptions | undefined;

    const trackingEngine: SocialDiscourseSimulationEngine = {
      metadata: {
        id: SOCIAL_DISCOURSE_ENGINE_V0_ID,
        name: "Tracking Social Discourse Engine",
        version: "0.0-test"
      },
      run(runInput, runContext, runOptions) {
        capturedInput = runInput;
        capturedContext = runContext;
        capturedOptions = runOptions;
        return socialDiscourseEngine.run(runInput, runContext, runOptions);
      }
    };

    registry.register(trackingEngine);

    const result = runRegisteredSocialDiscourseEngine(
      registry,
      input,
      context,
      options
    );

    assert.equal(capturedInput, input);
    assert.equal(capturedContext, context);
    assert.equal(capturedOptions, options);
    assert.equal(result.engineName, "social-discourse");
  });

  it("passes input, context, and options to the registered show engine run method", () => {
    const registry = createEngineRegistry();
    const input = createSampleShowEngineInput();
    const context = createSampleEngineContext("show-pipeline-run-signature", 7);
    const options: SimulationEngineRunOptions = { debug: true };
    let capturedInput: ShowEngineInput | undefined;
    let capturedContext: SimulationEngineContext | undefined;
    let capturedOptions: SimulationEngineRunOptions | undefined;

    const trackingEngine: ShowSimulationEngine = {
      metadata: {
        id: SHOW_ENGINE_V0_ID,
        name: "Tracking Show Engine",
        version: "0.0-test"
      },
      run(runInput, runContext, runOptions) {
        capturedInput = runInput;
        capturedContext = runContext;
        capturedOptions = runOptions;
        return showEngine.run(runInput, runContext, runOptions);
      }
    };

    registry.register(trackingEngine);

    const result = runRegisteredShowEngine(
      registry,
      input,
      context,
      options
    );

    assert.equal(capturedInput, input);
    assert.equal(capturedContext, context);
    assert.equal(capturedOptions, options);
    assert.equal(result.engineName, "show");
  });

  it("keeps same seed plus same input deterministic through the registry pipeline", () => {
    const firstRegistry = createProductionEngineRegistry();
    const secondRegistry = createProductionEngineRegistry();
    const input = createSampleMatchEngineInput();

    const firstResult = runRegisteredMatchEngine(
      firstRegistry,
      input,
      createSampleEngineContext("registry-deterministic", 7),
      { debug: true }
    );
    const secondResult = runRegisteredMatchEngine(
      secondRegistry,
      input,
      createSampleEngineContext("registry-deterministic", 7),
      { debug: true }
    );

    assert.deepEqual(firstResult, secondResult);
  });

  it("keeps fan reaction same seed plus same input deterministic through the registry pipeline", () => {
    const firstRegistry = createProductionEngineRegistry();
    const secondRegistry = createProductionEngineRegistry();
    const input = createSampleFanReactionEngineInput();

    const firstResult = runRegisteredFanReactionEngine(
      firstRegistry,
      input,
      createSampleEngineContext("fan-registry-deterministic", 7),
      { debug: true }
    );
    const secondResult = runRegisteredFanReactionEngine(
      secondRegistry,
      input,
      createSampleEngineContext("fan-registry-deterministic", 7),
      { debug: true }
    );

    assert.deepEqual(firstResult, secondResult);
  });

  it("keeps show same seed plus same input deterministic through the registry pipeline", () => {
    const firstRegistry = createProductionEngineRegistry();
    const secondRegistry = createProductionEngineRegistry();
    const input = createSampleShowEngineInput();

    const firstResult = runRegisteredShowEngine(
      firstRegistry,
      input,
      createSampleEngineContext("show-registry-deterministic", 7),
      { debug: true }
    );
    const secondResult = runRegisteredShowEngine(
      secondRegistry,
      input,
      createSampleEngineContext("show-registry-deterministic", 7),
      { debug: true }
    );

    assert.deepEqual(firstResult, secondResult);
  });

  it("keeps social discourse same seed plus same input deterministic through the registry pipeline", () => {
    const firstRegistry = createProductionEngineRegistry();
    const secondRegistry = createProductionEngineRegistry();
    const input = createSampleSocialDiscourseEngineInput();

    const firstResult = runRegisteredSocialDiscourseEngine(
      firstRegistry,
      input,
      createSampleEngineContext("social-registry-deterministic", 7),
      { debug: true }
    );
    const secondResult = runRegisteredSocialDiscourseEngine(
      secondRegistry,
      input,
      createSampleEngineContext("social-registry-deterministic", 7),
      { debug: true }
    );

    assert.deepEqual(firstResult, secondResult);
  });

  it("keeps hidden state separate from player-facing registry pipeline signals", () => {
    const result = runRegisteredMatchEngine(
      createProductionEngineRegistry(),
      createSampleMatchEngineInput(),
      createSampleEngineContext("registry-hidden-boundary", 7)
    );

    assert.ok(Object.values(result.hiddenState).some((value) => typeof value === "number"));
    assertEngineResultRespectsOutputBoundary(result);
  });

  it("keeps debug traces optional and non-player-facing through the registry pipeline", () => {
    const input = createSampleMatchEngineInput();
    const withoutDebug = runRegisteredMatchEngine(
      createProductionEngineRegistry(),
      input,
      { ...createSampleEngineContext("registry-debug", 7), debug: false }
    );
    const withDebug = runRegisteredMatchEngine(
      createProductionEngineRegistry(),
      input,
      createSampleEngineContext("registry-debug", 7),
      { debug: true }
    );

    assert.equal(withoutDebug.debugTrace, undefined);
    assertDebugTraceIsNonPlayerFacing(withDebug.debugTrace);
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
