import type { RandomService } from "../simulation/randomService.ts";
import {
  createSimulationContext,
  type CreateSimulationContextOptions,
  type SimulationContext,
  type SimulationSeed
} from "../simulation/simulationContext.ts";

export interface SimulationEngineContext {
  readonly random: RandomService;
  readonly seed: SimulationSeed;
  readonly week: number;
  readonly debug?: boolean;
  readonly simulation?: SimulationContext;
}

export interface SimulationEngineContextOptions {
  readonly week: number;
  readonly debug?: boolean;
}

export interface CreateSimulationEngineContextOptions extends CreateSimulationContextOptions {
  readonly week: number;
  readonly debug?: boolean;
}

export function createSimulationEngineContext(
  options: CreateSimulationEngineContextOptions
): SimulationEngineContext {
  const simulationContext = createSimulationContext(options);

  return createSimulationEngineContextFromSimulationContext(simulationContext, {
    week: options.week,
    debug: options.debug
  });
}

export function createSimulationEngineContextFromSimulationContext(
  simulationContext: SimulationContext,
  options: SimulationEngineContextOptions
): SimulationEngineContext {
  return Object.freeze({
    random: simulationContext.random,
    seed: simulationContext.seed,
    week: options.week,
    debug: options.debug,
    simulation: simulationContext
  });
}
