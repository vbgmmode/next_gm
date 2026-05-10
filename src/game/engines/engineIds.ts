import type {
  FanReactionSimulationEngine,
  MatchSimulationEngine,
  ShowSimulationEngine,
  SocialDiscourseSimulationEngine
} from "./simulationEngine.ts";

export const MATCH_ENGINE_V0_ID = "match-engine-v0";
export const SHOW_ENGINE_V0_ID = "show-engine-v0";
export const FAN_REACTION_ENGINE_V0_ID = "fan-reaction-engine-v0";
export const SOCIAL_DISCOURSE_ENGINE_V0_ID = "social-discourse-engine-v0";

export type ProductionEngineId =
  | typeof MATCH_ENGINE_V0_ID
  | typeof SHOW_ENGINE_V0_ID
  | typeof FAN_REACTION_ENGINE_V0_ID
  | typeof SOCIAL_DISCOURSE_ENGINE_V0_ID;

export interface ProductionEngineMap {
  [MATCH_ENGINE_V0_ID]: MatchSimulationEngine;
  [SHOW_ENGINE_V0_ID]: ShowSimulationEngine;
  [FAN_REACTION_ENGINE_V0_ID]: FanReactionSimulationEngine;
  [SOCIAL_DISCOURSE_ENGINE_V0_ID]: SocialDiscourseSimulationEngine;
}

export type ProductionEngineForId<TId extends ProductionEngineId> = ProductionEngineMap[TId];
