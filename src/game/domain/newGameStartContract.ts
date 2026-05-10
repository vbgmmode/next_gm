import type { SimulationContext } from "../simulation/simulationContext.ts";
import type { EntityId } from "./common.ts";
import type { GameSetupEntityShell } from "./gameSetupEntity.ts";
import type {
  GameSetupReadinessStructuralPiece,
  GameSetupReadinessSummaryShell,
  OverallGameSetupReadiness
} from "./gameSetupReadinessSummary.ts";

export type NewGameStartRequestStatus =
  | "blocked"
  | "structurally-ready";

export type OverallNewGameStartReadiness =
  | "blocked"
  | "structurally-ready";

export type NewGameStartBlockedReason =
  | "missing-game-setup-shell"
  | "missing-setup-readiness-summary"
  | "setup-readiness-not-structurally-ready"
  | "missing-simulation-context"
  | "missing-selected-brand-id"
  | "missing-player-manager-id"
  | "missing-draft-session-id";

export interface NewGameStartRequestShell {
  readonly status: "diagnostics-only";
  readonly setupId?: EntityId;
  readonly selectedBrandId?: EntityId;
  readonly playerManagerId?: EntityId;
  readonly draftSessionId?: EntityId;
  readonly simulationSeedLabel?: string;
  readonly simulationReplayId?: string;
  readonly gameplayAffecting: false;
  readonly playerFacing: false;
}

export interface NewGameStartResultShell {
  readonly status: "diagnostics-only";
  readonly request: NewGameStartRequestShell;
  readonly startRequestStatus: NewGameStartRequestStatus;
  readonly setupReadiness: OverallGameSetupReadiness | "missing";
  readonly missingStructuralPieces: readonly GameSetupReadinessStructuralPiece[];
  readonly startBlockedReasons: readonly NewGameStartBlockedReason[];
  readonly overallStartReadiness: OverallNewGameStartReadiness;
  readonly gameplayAffecting: false;
  readonly playerFacing: false;
}

export interface CreateNewGameStartContractShellOptions {
  readonly setup?: GameSetupEntityShell;
  readonly setupReadiness?: GameSetupReadinessSummaryShell;
  readonly simulationContext?: SimulationContext;
  readonly selectedBrandId?: EntityId;
  readonly playerManagerId?: EntityId;
  readonly draftSessionId?: EntityId;
}

export function createNewGameStartContractShell(
  options: CreateNewGameStartContractShellOptions
): NewGameStartResultShell {
  const selectedBrandId = trimOptionalId(options.selectedBrandId ?? options.setup?.selectedBrandId);
  const playerManagerId = trimOptionalId(options.playerManagerId ?? options.setup?.playerManagerId);
  const draftSessionId = trimOptionalId(options.draftSessionId);
  const setupId = trimOptionalId(options.setup?.setupId);
  const missingStructuralPieces = Object.freeze([
    ...(!options.setup ? ["game-setup" as const] : []),
    ...(options.setupReadiness?.missingStructuralPieces ?? [])
  ]);
  const startBlockedReasons = createStartBlockedReasons({
    hasSetup: Boolean(options.setup),
    setupReadiness: options.setupReadiness,
    hasSimulationContext: Boolean(options.simulationContext),
    hasSelectedBrandId: Boolean(selectedBrandId),
    hasPlayerManagerId: Boolean(playerManagerId),
    hasDraftSessionId: Boolean(draftSessionId)
  });
  const startRequestStatus = startBlockedReasons.length === 0
    ? "structurally-ready"
    : "blocked";

  return Object.freeze({
    status: "diagnostics-only",
    request: createNewGameStartRequestShell({
      setupId,
      selectedBrandId,
      playerManagerId,
      draftSessionId,
      simulationContext: options.simulationContext
    }),
    startRequestStatus,
    setupReadiness: options.setupReadiness?.overallSetupReadiness ?? "missing",
    missingStructuralPieces,
    startBlockedReasons,
    overallStartReadiness: startRequestStatus,
    gameplayAffecting: false,
    playerFacing: false
  });
}

function createNewGameStartRequestShell(options: {
  readonly setupId?: EntityId;
  readonly selectedBrandId?: EntityId;
  readonly playerManagerId?: EntityId;
  readonly draftSessionId?: EntityId;
  readonly simulationContext?: SimulationContext;
}): NewGameStartRequestShell {
  return Object.freeze({
    status: "diagnostics-only",
    ...(options.setupId ? { setupId: options.setupId } : {}),
    ...(options.selectedBrandId ? { selectedBrandId: options.selectedBrandId } : {}),
    ...(options.playerManagerId ? { playerManagerId: options.playerManagerId } : {}),
    ...(options.draftSessionId ? { draftSessionId: options.draftSessionId } : {}),
    ...(options.simulationContext ? { simulationSeedLabel: options.simulationContext.seedLabel } : {}),
    ...(options.simulationContext?.replay.replayId
      ? { simulationReplayId: options.simulationContext.replay.replayId }
      : {}),
    gameplayAffecting: false,
    playerFacing: false
  });
}

function createStartBlockedReasons(options: {
  readonly hasSetup: boolean;
  readonly setupReadiness?: GameSetupReadinessSummaryShell;
  readonly hasSimulationContext: boolean;
  readonly hasSelectedBrandId: boolean;
  readonly hasPlayerManagerId: boolean;
  readonly hasDraftSessionId: boolean;
}): readonly NewGameStartBlockedReason[] {
  return Object.freeze([
    ...(!options.hasSetup ? ["missing-game-setup-shell" as const] : []),
    ...(!options.setupReadiness ? ["missing-setup-readiness-summary" as const] : []),
    ...(options.setupReadiness && options.setupReadiness.overallSetupReadiness !== "structurally-ready"
      ? ["setup-readiness-not-structurally-ready" as const]
      : []),
    ...(!options.hasSimulationContext ? ["missing-simulation-context" as const] : []),
    ...(!options.hasSelectedBrandId ? ["missing-selected-brand-id" as const] : []),
    ...(!options.hasPlayerManagerId ? ["missing-player-manager-id" as const] : []),
    ...(!options.hasDraftSessionId ? ["missing-draft-session-id" as const] : [])
  ]);
}

function trimOptionalId(id: EntityId | undefined): EntityId | undefined {
  const trimmed = id?.trim();

  return trimmed ? trimmed : undefined;
}
