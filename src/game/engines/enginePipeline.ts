import type { SimulationEngineContext } from "./engineContext.ts";
import { EngineRegistry } from "./engineRegistry.ts";
import {
  createEnginePipelineStructuralSummary
} from "./enginePipelineStructuralSummary.ts";
import type { EnginePipelineStructuralSummary } from "./enginePipelineStructuralSummary.ts";
import { fanReactionEngine } from "./fanReactionEngine.ts";
import type {
  FanReactionEngineInput,
  FanReactionEngineResult
} from "./fanReactionEngine.contracts.ts";
import {
  FAN_REACTION_ENGINE_V0_ID,
  MATCH_ENGINE_V0_ID,
  SHOW_ENGINE_V0_ID,
  SOCIAL_DISCOURSE_ENGINE_V0_ID
} from "./engineIds.ts";
import type { ProductionEngineForId } from "./engineIds.ts";
import { createFanSocialDiscourseHandoff } from "./fanSocialDiscourseHandoff.ts";
import { matchEngine } from "./matchEngine.ts";
import type {
  MatchEngineInput,
  MatchEngineResult
} from "./matchEngine.contracts.ts";
import type {
  SimulationEngineRunOptions
} from "./simulationEngine.ts";
import { showEngine } from "./showEngine.ts";
import type {
  ShowEngineInput,
  ShowEngineResult
} from "./showEngine.contracts.ts";
import { socialDiscourseEngine } from "./socialDiscourseEngine.ts";
import type {
  SocialDiscourseEngineInput,
  SocialDiscourseEngineResult
} from "./socialDiscourseEngine.contracts.ts";

export const DEFAULT_MATCH_ENGINE_ID = MATCH_ENGINE_V0_ID;
export const DEFAULT_SHOW_ENGINE_ID = SHOW_ENGINE_V0_ID;
export const DEFAULT_FAN_REACTION_ENGINE_ID = FAN_REACTION_ENGINE_V0_ID;
export const DEFAULT_SOCIAL_DISCOURSE_ENGINE_ID = SOCIAL_DISCOURSE_ENGINE_V0_ID;

export interface MatchFanSocialSmokeResult {
  matchResult: MatchEngineResult;
  fanReactionResult: FanReactionEngineResult;
  socialDiscourseResult: SocialDiscourseEngineResult;
  pipelineStructuralSummary: EnginePipelineStructuralSummary;
}

export interface ShowFanReactionSmokeResult {
  showResult: ShowEngineResult;
  fanReactionResult: FanReactionEngineResult;
  pipelineStructuralSummary: EnginePipelineStructuralSummary;
}

export function createProductionEngineRegistry(): EngineRegistry {
  const registry = new EngineRegistry();
  registry.register(matchEngine);
  registry.register(fanReactionEngine);
  registry.register(socialDiscourseEngine);
  registry.register(showEngine);
  return registry;
}

export function runRegisteredMatchEngine(
  registry: EngineRegistry,
  input: MatchEngineInput,
  context: SimulationEngineContext,
  options?: SimulationEngineRunOptions
): MatchEngineResult {
  const engine = getRegisteredMatchEngine(registry);

  return engine.run(input, context, options);
}

export function runRegisteredShowEngine(
  registry: EngineRegistry,
  input: ShowEngineInput,
  context: SimulationEngineContext,
  options?: SimulationEngineRunOptions
): ShowEngineResult {
  const engine = getRegisteredShowEngine(registry);

  return engine.run(input, context, options);
}

// Smoke-only show handoff proof. This must not call Social Discourse, persist saves, or create fan outcomes.
export function runShowFanReactionSmokePipeline(
  registry: EngineRegistry,
  input: ShowEngineInput,
  context: SimulationEngineContext,
  options?: SimulationEngineRunOptions
): ShowFanReactionSmokeResult {
  const showResult = runRegisteredShowEngine(registry, input, context, options);
  const fanReactionInput: FanReactionEngineInput = {
    promotion: promotionForShowFanReaction(input),
    fanSegments: fanSegmentsForShowFanReaction(input),
    relevantWrestlers: relevantWrestlersForShowFanReaction(input),
    relevantRivalries: relevantRivalriesForShowFanReaction(input),
    priorSocialNarratives: [],
    showInput: {
      showId: input.show.id,
      handoff: {
        fanSocialHandoff: showResult.hiddenState.fanSocialHandoff,
        fanSocialHandoffValidation: showResult.hiddenState.fanSocialHandoffValidation
      }
    }
  };
  const fanReactionResult = runRegisteredFanReactionEngine(
    registry,
    fanReactionInput,
    context,
    options
  );

  return {
    showResult,
    fanReactionResult,
    pipelineStructuralSummary: createEnginePipelineStructuralSummary({
      showResult,
      fanReactionResult
    })
  };
}

// Smoke-only handoff proof. This must not advance time, mutate state, persist saves, or make booking decisions.
export function runMatchFanSocialSmokePipeline(
  registry: EngineRegistry,
  input: MatchEngineInput,
  context: SimulationEngineContext,
  options?: SimulationEngineRunOptions
): MatchFanSocialSmokeResult {
  const matchResult = runRegisteredMatchEngine(registry, input, context, options);
  const relevantRivalries = input.rivalry ? [input.rivalry] : [];
  const fanReactionInput: FanReactionEngineInput = {
    promotion: input.promotion,
    fanSegments: input.fanSegments,
    relevantWrestlers: input.participants,
    relevantRivalries,
    priorSocialNarratives: [],
    matchResult
  };
  const fanReactionResult = runRegisteredFanReactionEngine(
    registry,
    fanReactionInput,
    context,
    options
  );
  const fanReactionShowHandoff = createFanSocialDiscourseHandoff(
    fanReactionResult.hiddenState.showOutputShell
  );
  const socialDiscourseInput: SocialDiscourseEngineInput = {
    promotion: input.promotion,
    relevantWrestlers: input.participants,
    relevantRivalries,
    existingNarratives: [],
    matchResult,
    fanReactionResult,
    fanReactionShowHandoff
  };
  const socialDiscourseResult = runRegisteredSocialDiscourseEngine(
    registry,
    socialDiscourseInput,
    context,
    options
  );

  return {
    matchResult,
    fanReactionResult,
    socialDiscourseResult,
    pipelineStructuralSummary: createEnginePipelineStructuralSummary({
      matchResult,
      fanReactionResult,
      fanSocialDiscourseHandoff: fanReactionShowHandoff,
      socialDiscourseResult
    })
  };
}

function promotionForShowFanReaction(
  input: ShowEngineInput
): FanReactionEngineInput["promotion"] {
  const matchPromotion = input.bookedMatches[0]?.matchInput.promotion;

  if (input.promotion !== undefined) {
    return input.promotion;
  }

  if (matchPromotion !== undefined) {
    return matchPromotion;
  }

  throw new Error("Show -> Fan Reaction smoke pipeline requires promotion context.");
}

function fanSegmentsForShowFanReaction(
  input: ShowEngineInput
): FanReactionEngineInput["fanSegments"] {
  const fanSegmentsById = new Map<string, FanReactionEngineInput["fanSegments"][number]>();

  for (const bookedMatch of input.bookedMatches) {
    for (const fanSegment of bookedMatch.matchInput.fanSegments) {
      fanSegmentsById.set(fanSegment.id, fanSegment);
    }
  }

  return [...fanSegmentsById.values()];
}

function relevantWrestlersForShowFanReaction(
  input: ShowEngineInput
): FanReactionEngineInput["relevantWrestlers"] {
  const wrestlersById = new Map<string, FanReactionEngineInput["relevantWrestlers"][number]>();

  for (const bookedMatch of input.bookedMatches) {
    for (const wrestler of bookedMatch.matchInput.participants) {
      wrestlersById.set(wrestler.id, wrestler);
    }
  }

  return [...wrestlersById.values()];
}

function relevantRivalriesForShowFanReaction(
  input: ShowEngineInput
): FanReactionEngineInput["relevantRivalries"] {
  const rivalriesById = new Map<string, FanReactionEngineInput["relevantRivalries"][number]>();

  for (const bookedMatch of input.bookedMatches) {
    const rivalry = bookedMatch.matchInput.rivalry;

    if (rivalry !== undefined) {
      rivalriesById.set(rivalry.id, rivalry);
    }
  }

  return [...rivalriesById.values()];
}

export function runRegisteredFanReactionEngine(
  registry: EngineRegistry,
  input: FanReactionEngineInput,
  context: SimulationEngineContext,
  options?: SimulationEngineRunOptions
): FanReactionEngineResult {
  const engine = getRegisteredFanReactionEngine(registry);

  return engine.run(input, context, options);
}

export function runRegisteredSocialDiscourseEngine(
  registry: EngineRegistry,
  input: SocialDiscourseEngineInput,
  context: SimulationEngineContext,
  options?: SimulationEngineRunOptions
): SocialDiscourseEngineResult {
  const engine = getRegisteredSocialDiscourseEngine(registry);

  return engine.run(input, context, options);
}

export function getRegisteredMatchEngine(
  registry: EngineRegistry
): ProductionEngineForId<typeof MATCH_ENGINE_V0_ID> {
  return registry.getRequired<MatchEngineInput, MatchEngineResult>(
    MATCH_ENGINE_V0_ID
  ) as ProductionEngineForId<typeof MATCH_ENGINE_V0_ID>;
}

export function getRegisteredShowEngine(
  registry: EngineRegistry
): ProductionEngineForId<typeof SHOW_ENGINE_V0_ID> {
  return registry.getRequired<ShowEngineInput, ShowEngineResult>(
    SHOW_ENGINE_V0_ID
  ) as ProductionEngineForId<typeof SHOW_ENGINE_V0_ID>;
}

export function getRegisteredFanReactionEngine(
  registry: EngineRegistry
): ProductionEngineForId<typeof FAN_REACTION_ENGINE_V0_ID> {
  return registry.getRequired<FanReactionEngineInput, FanReactionEngineResult>(
    FAN_REACTION_ENGINE_V0_ID
  ) as ProductionEngineForId<typeof FAN_REACTION_ENGINE_V0_ID>;
}

export function getRegisteredSocialDiscourseEngine(
  registry: EngineRegistry
): ProductionEngineForId<typeof SOCIAL_DISCOURSE_ENGINE_V0_ID> {
  return registry.getRequired<SocialDiscourseEngineInput, SocialDiscourseEngineResult>(
    SOCIAL_DISCOURSE_ENGINE_V0_ID
  ) as ProductionEngineForId<typeof SOCIAL_DISCOURSE_ENGINE_V0_ID>;
}
