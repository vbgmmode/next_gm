import type { SimulationContext, SimulationSeed } from "../simulation/simulationContext.ts";
import type { EngineExecutionTrace } from "./engineExecutionTrace.ts";
import type { SimulationEngineContext } from "./engineContext.ts";

export type ReplayDebugOrchestrationStatus = "diagnostics-only";

export interface ReplayDebugSeedReference {
  readonly seed?: SimulationSeed;
  readonly seedLabel?: string;
  readonly replayId?: string;
  readonly rulesetVersion?: string;
  readonly sourceRunId?: string;
  readonly sequenceLabel?: string;
}

export interface ReplayDebugEngineContextReference {
  readonly seed: SimulationSeed;
  readonly week: number;
  readonly debug?: boolean;
  readonly hasSharedSimulationContext: boolean;
}

export interface ReplayDebugReadinessSummary {
  readonly simulationContextPresent: boolean;
  readonly engineContextPresent: boolean;
  readonly traceCount: number;
  readonly readyForReplayDebug: boolean;
  readonly missing: readonly string[];
}

export interface ReplayDebugOrchestration {
  readonly orchestrationId: string;
  readonly orchestrationLabel: string;
  readonly seedReference?: ReplayDebugSeedReference;
  readonly engineContextReference?: ReplayDebugEngineContextReference;
  readonly traces: readonly EngineExecutionTrace[];
  readonly readiness: ReplayDebugReadinessSummary;
  readonly status: ReplayDebugOrchestrationStatus;
  readonly gameplayAffecting: false;
  readonly playerFacing: false;
}

export interface CreateReplayDebugOrchestrationOptions {
  readonly orchestrationId?: string;
  readonly orchestrationLabel?: string;
  readonly simulationContext?: SimulationContext;
  readonly engineContext?: SimulationEngineContext;
  readonly traces?: readonly EngineExecutionTrace[];
}

export function createReplayDebugOrchestration(
  options: CreateReplayDebugOrchestrationOptions
): ReplayDebugOrchestration {
  const orchestrationLabel = options.orchestrationLabel ?? "replay-debug";
  const traces = Object.freeze([...(options.traces ?? [])]);
  const seedReference = createSeedReference(options.simulationContext, options.engineContext);
  const engineContextReference = options.engineContext
    ? Object.freeze({
        seed: options.engineContext.seed,
        week: options.engineContext.week,
        debug: options.engineContext.debug,
        hasSharedSimulationContext: options.engineContext.simulation !== undefined
      })
    : undefined;
  const readiness = createReadinessSummary(options.simulationContext, options.engineContext, traces);

  return Object.freeze({
    orchestrationId:
      options.orchestrationId ?? createOrchestrationId(orchestrationLabel, seedReference, traces),
    orchestrationLabel,
    seedReference,
    engineContextReference,
    traces,
    readiness,
    status: "diagnostics-only",
    gameplayAffecting: false,
    playerFacing: false
  });
}

function createSeedReference(
  simulationContext: SimulationContext | undefined,
  engineContext: SimulationEngineContext | undefined
): ReplayDebugSeedReference | undefined {
  const sharedContext = simulationContext ?? engineContext?.simulation;
  const seedReference = sharedContext
    ? {
        seed: sharedContext.seed,
        seedLabel: sharedContext.seedLabel,
        replayId: sharedContext.replay.replayId,
        rulesetVersion: sharedContext.replay.rulesetVersion,
        sourceRunId: sharedContext.replay.sourceRunId,
        sequenceLabel: sharedContext.replay.sequenceLabel
      }
    : engineContext
      ? {
          seed: engineContext.seed,
          seedLabel: String(engineContext.seed)
        }
      : undefined;

  return seedReference ? Object.freeze(seedReference) : undefined;
}

function createReadinessSummary(
  simulationContext: SimulationContext | undefined,
  engineContext: SimulationEngineContext | undefined,
  traces: readonly EngineExecutionTrace[]
): ReplayDebugReadinessSummary {
  const simulationContextPresent = simulationContext !== undefined || engineContext?.simulation !== undefined;
  const engineContextPresent = engineContext !== undefined;
  const missing = [
    ...(simulationContextPresent ? [] : ["simulation-context"]),
    ...(engineContextPresent ? [] : ["engine-context"]),
    ...(traces.length > 0 ? [] : ["engine-execution-trace"])
  ];

  return Object.freeze({
    simulationContextPresent,
    engineContextPresent,
    traceCount: traces.length,
    readyForReplayDebug: missing.length === 0,
    missing: Object.freeze(missing)
  });
}

function createOrchestrationId(
  orchestrationLabel: string,
  seedReference: ReplayDebugSeedReference | undefined,
  traces: readonly EngineExecutionTrace[]
): string {
  const seedLabel = seedReference?.seedLabel ?? "unseeded";
  const traceLabel = traces.map((trace) => trace.traceId).join("+") || "no-trace";

  return `${orchestrationLabel}:${seedLabel}:${traceLabel}`;
}
