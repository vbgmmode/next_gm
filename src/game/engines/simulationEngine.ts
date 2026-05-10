import type { SimulationEngineContext } from "./engineContext.ts";
import type { SimulationEngineResult } from "./engineSignals.ts";
import type {
  FanReactionEngineInput,
  FanReactionEngineResult
} from "./fanReactionEngine.contracts.ts";
import type {
  MatchEngineInput,
  MatchEngineResult
} from "./matchEngine.contracts.ts";
import type {
  ShowEngineInput,
  ShowEngineResult
} from "./showEngine.contracts.ts";
import type {
  SocialDiscourseEngineInput,
  SocialDiscourseEngineResult
} from "./socialDiscourseEngine.contracts.ts";

export interface SimulationEngineMetadata {
  id: string;
  name: string;
  version?: string;
}

export interface SimulationEngineRunOptions {
  debug?: boolean;
}

export interface SimulationEngine<TInput, TResult extends SimulationEngineResult> {
  metadata: SimulationEngineMetadata;
  run(input: TInput, context: SimulationEngineContext, options?: SimulationEngineRunOptions): TResult;
}

export type MatchSimulationEngine = SimulationEngine<MatchEngineInput, MatchEngineResult>;

export type ShowSimulationEngine = SimulationEngine<ShowEngineInput, ShowEngineResult>;

export type FanReactionSimulationEngine = SimulationEngine<
  FanReactionEngineInput,
  FanReactionEngineResult
>;

export type SocialDiscourseSimulationEngine = SimulationEngine<
  SocialDiscourseEngineInput,
  SocialDiscourseEngineResult
>;
