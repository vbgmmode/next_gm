import type {
  ReplayDebugOrchestration,
  ReplayDebugReadinessSummary
} from "./replayDebugOrchestration.ts";

export type ReplayDebugCommandIntent =
  | "summarize-replay-readiness"
  | "list-trace-markers"
  | "validate-debug-context";

export type ReplayDebugCommandStatus = "diagnostics-only";

export interface ReplayDebugTraceMarkerSummary {
  readonly traceId: string;
  readonly traceLabel: string;
  readonly markers: readonly string[];
}

export interface ReplayDebugContextValidationSummary {
  readonly valid: boolean;
  readonly issues: readonly string[];
}

export interface ReplayDebugCommandSummary {
  readonly commandId: string;
  readonly commandLabel: string;
  readonly intent: ReplayDebugCommandIntent;
  readonly orchestrationId?: string;
  readonly readiness?: ReplayDebugReadinessSummary;
  readonly traceMarkers?: readonly ReplayDebugTraceMarkerSummary[];
  readonly validation?: ReplayDebugContextValidationSummary;
  readonly status: ReplayDebugCommandStatus;
  readonly gameplayAffecting: false;
  readonly playerFacing: false;
}

export interface CreateReplayDebugCommandSummaryOptions {
  readonly commandId?: string;
  readonly commandLabel?: string;
  readonly intent: ReplayDebugCommandIntent;
  readonly orchestration?: ReplayDebugOrchestration;
}

export function createReplayDebugCommandSummary(
  options: CreateReplayDebugCommandSummaryOptions
): ReplayDebugCommandSummary {
  const commandLabel = options.commandLabel ?? options.intent;
  const orchestration = options.orchestration;

  return Object.freeze({
    commandId:
      options.commandId ?? createCommandId(commandLabel, options.intent, orchestration?.orchestrationId),
    commandLabel,
    intent: options.intent,
    orchestrationId: orchestration?.orchestrationId,
    readiness: options.intent === "summarize-replay-readiness" ? orchestration?.readiness : undefined,
    traceMarkers: options.intent === "list-trace-markers"
      ? Object.freeze(
          (orchestration?.traces ?? []).map((trace) =>
            Object.freeze({
              traceId: trace.traceId,
              traceLabel: trace.traceLabel,
              markers: Object.freeze(trace.stages.map((stage) => stage.marker))
            })
          )
        )
      : undefined,
    validation: options.intent === "validate-debug-context"
      ? createValidationSummary(orchestration)
      : undefined,
    status: "diagnostics-only",
    gameplayAffecting: false,
    playerFacing: false
  });
}

function createCommandId(
  commandLabel: string,
  intent: ReplayDebugCommandIntent,
  orchestrationId: string | undefined
): string {
  return `${intent}:${commandLabel}:${orchestrationId ?? "no-orchestration"}`;
}

function createValidationSummary(
  orchestration: ReplayDebugOrchestration | undefined
): ReplayDebugContextValidationSummary {
  if (orchestration === undefined) {
    return Object.freeze({
      valid: false,
      issues: Object.freeze(["missing-orchestration"])
    });
  }

  const issues = [
    ...(orchestration.playerFacing === false ? [] : ["orchestration-player-facing"]),
    ...(orchestration.gameplayAffecting === false ? [] : ["orchestration-gameplay-affecting"]),
    ...orchestration.readiness.missing
  ];

  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues)
  });
}
