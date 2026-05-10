import type {
  SimulationContext,
  SimulationSeed
} from "../simulation/simulationContext.ts";

export type EngineExecutionTraceStatus = "diagnostics-only";

export interface EngineExecutionTraceSeedReference {
  readonly seed?: SimulationSeed;
  readonly seedLabel?: string;
  readonly replayId?: string;
  readonly rulesetVersion?: string;
  readonly sourceRunId?: string;
  readonly sequenceLabel?: string;
}

export interface EngineExecutionStageMarker {
  readonly marker: string;
  readonly label: string;
}

export interface EngineExecutionTrace {
  readonly traceId: string;
  readonly traceLabel: string;
  readonly engineId: string;
  readonly engineVersion?: string;
  readonly seedReference?: EngineExecutionTraceSeedReference;
  readonly stages: readonly EngineExecutionStageMarker[];
  readonly notes: readonly string[];
  readonly status: EngineExecutionTraceStatus;
  readonly gameplayAffecting: false;
  readonly playerFacing: false;
}

export interface CreateEngineExecutionTraceOptions {
  readonly traceId?: string;
  readonly traceLabel?: string;
  readonly engineId: string;
  readonly engineVersion?: string;
  readonly simulationContext?: SimulationContext;
  readonly seedReference?: EngineExecutionTraceSeedReference;
  readonly stages?: readonly (string | Partial<EngineExecutionStageMarker>)[];
  readonly notes?: readonly string[];
}

export function createEngineExecutionTrace(
  options: CreateEngineExecutionTraceOptions
): EngineExecutionTrace {
  const traceLabel = options.traceLabel ?? "engine-execution";
  const engineVersion = options.engineVersion;
  const seedReference = createSeedReference(options);
  const stages = Object.freeze((options.stages ?? []).map(createStageMarker));
  const notes = Object.freeze([...(options.notes ?? [])]);

  return Object.freeze({
    traceId: options.traceId ?? createTraceId(options.engineId, engineVersion, traceLabel),
    traceLabel,
    engineId: options.engineId,
    engineVersion,
    seedReference,
    stages,
    notes,
    status: "diagnostics-only",
    gameplayAffecting: false,
    playerFacing: false
  });
}

function createTraceId(
  engineId: string,
  engineVersion: string | undefined,
  traceLabel: string
): string {
  return `${engineId}:${engineVersion ?? "unversioned"}:${traceLabel}`;
}

function createSeedReference(
  options: CreateEngineExecutionTraceOptions
): EngineExecutionTraceSeedReference | undefined {
  const simulationReference = options.simulationContext
    ? {
        seed: options.simulationContext.seed,
        seedLabel: options.simulationContext.seedLabel,
        replayId: options.simulationContext.replay.replayId,
        rulesetVersion: options.simulationContext.replay.rulesetVersion,
        sourceRunId: options.simulationContext.replay.sourceRunId,
        sequenceLabel: options.simulationContext.replay.sequenceLabel
      }
    : undefined;
  const seedReference = {
    ...simulationReference,
    ...options.seedReference
  };

  if (Object.values(seedReference).every((value) => value === undefined)) {
    return undefined;
  }

  return Object.freeze(seedReference);
}

function createStageMarker(
  stage: string | Partial<EngineExecutionStageMarker>,
  index: number
): EngineExecutionStageMarker {
  if (typeof stage === "string") {
    return Object.freeze({
      marker: `stage-${index + 1}`,
      label: stage
    });
  }

  return Object.freeze({
    marker: stage.marker ?? `stage-${index + 1}`,
    label: stage.label ?? stage.marker ?? `stage-${index + 1}`
  });
}
