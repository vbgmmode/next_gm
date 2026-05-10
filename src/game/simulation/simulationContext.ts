import { RandomService } from "./randomService.ts";

export type SimulationSeed = string | number;

export type SimulationDiagnosticsValue = string | number | boolean | null | undefined;

export interface SimulationReplayMetadata {
  readonly replayId?: string;
  readonly rulesetVersion?: string;
  readonly sourceRunId?: string;
  readonly sequenceLabel?: string;
}

export interface SimulationDiagnosticsMetadata {
  readonly [key: string]: SimulationDiagnosticsValue;
}

export interface SimulationContext {
  readonly seed: SimulationSeed;
  readonly seedLabel: string;
  readonly random: RandomService;
  readonly createRandomService: (seed?: SimulationSeed) => RandomService;
  readonly replay: SimulationReplayMetadata;
  readonly diagnostics: SimulationDiagnosticsMetadata;
}

export interface CreateSimulationContextOptions {
  readonly seed: SimulationSeed;
  readonly seedLabel?: string;
  readonly random?: RandomService;
  readonly createRandomService?: (seed: SimulationSeed) => RandomService;
  readonly replay?: SimulationReplayMetadata;
  readonly diagnostics?: SimulationDiagnosticsMetadata;
}

export function createSimulationContext(options: CreateSimulationContextOptions): SimulationContext {
  const seed = options.seed;
  const createRandomService =
    options.createRandomService ?? ((seed: SimulationSeed) => new RandomService(seed));
  const seedLabel = options.seedLabel ?? String(seed);
  const random = options.random ?? createRandomService(seed);

  return Object.freeze({
    seed,
    seedLabel,
    random,
    createRandomService: (seedOverride: SimulationSeed = seed) => createRandomService(seedOverride),
    replay: Object.freeze({ ...options.replay }),
    diagnostics: Object.freeze({ ...options.diagnostics })
  });
}
