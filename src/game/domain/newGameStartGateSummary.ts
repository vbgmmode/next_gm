import type {
  GameSetupReadinessStructuralPiece,
  GameSetupReadinessSummaryShell
} from "./gameSetupReadinessSummary.ts";
import type {
  NewGameStartBlockedReason,
  NewGameStartRequestShell,
  NewGameStartResultShell,
  OverallNewGameStartReadiness
} from "./newGameStartContract.ts";

export type NewGameStartGateStructuralPiece =
  | "new-game-start-request"
  | "new-game-start-result"
  | GameSetupReadinessStructuralPiece;

export type NewGameStartGateStatus =
  | "blocked"
  | "structurally-ready";

export type OverallNewGameStartGateReadiness =
  | "blocked"
  | "structurally-ready";

export type NewGameStartGateBlockingReason =
  | "missing-start-request-shell"
  | "missing-start-result-shell"
  | NewGameStartBlockedReason;

export type NewGameStartGateWarningReason =
  | "missing-simulation-replay-id"
  | "setup-readiness-summary-not-provided";

export interface NewGameStartGateSummaryShell {
  readonly status: "diagnostics-only";
  readonly gateStatus: NewGameStartGateStatus;
  readonly startReadiness: OverallNewGameStartReadiness | "missing";
  readonly blockingReasons: readonly NewGameStartGateBlockingReason[];
  readonly warningReasons: readonly NewGameStartGateWarningReason[];
  readonly requiredStructuralPieces: readonly NewGameStartGateStructuralPiece[];
  readonly missingStructuralPieces: readonly NewGameStartGateStructuralPiece[];
  readonly overallGateReadiness: OverallNewGameStartGateReadiness;
  readonly gameplayAffecting: false;
  readonly playerFacing: false;
}

export interface CreateNewGameStartGateSummaryOptions {
  readonly startRequest?: NewGameStartRequestShell;
  readonly startResult?: NewGameStartResultShell;
  readonly setupReadiness?: GameSetupReadinessSummaryShell;
}

export function createNewGameStartGateSummary(
  options: CreateNewGameStartGateSummaryOptions
): NewGameStartGateSummaryShell {
  const blockingReasons = createBlockingReasons(options);
  const warningReasons = createWarningReasons(options);
  const missingStructuralPieces = createMissingStructuralPieces(options);
  const gateStatus = blockingReasons.length === 0 ? "structurally-ready" : "blocked";

  return Object.freeze({
    status: "diagnostics-only",
    gateStatus,
    startReadiness: options.startResult?.overallStartReadiness ?? "missing",
    blockingReasons,
    warningReasons,
    requiredStructuralPieces: REQUIRED_STRUCTURAL_PIECES,
    missingStructuralPieces,
    overallGateReadiness: gateStatus,
    gameplayAffecting: false,
    playerFacing: false
  });
}

const REQUIRED_STRUCTURAL_PIECES: readonly NewGameStartGateStructuralPiece[] = Object.freeze([
  "new-game-start-request",
  "new-game-start-result",
  "game-setup",
  "brands",
  "managers",
  "roster",
  "divisions",
  "championships",
  "draft-readiness"
]);

function createBlockingReasons(
  options: CreateNewGameStartGateSummaryOptions
): readonly NewGameStartGateBlockingReason[] {
  return Object.freeze([
    ...(!options.startRequest ? ["missing-start-request-shell" as const] : []),
    ...(!options.startResult ? ["missing-start-result-shell" as const] : []),
    ...(options.startResult?.startBlockedReasons ?? [])
  ]);
}

function createWarningReasons(
  options: CreateNewGameStartGateSummaryOptions
): readonly NewGameStartGateWarningReason[] {
  return Object.freeze([
    ...(!options.startRequest?.simulationReplayId ? ["missing-simulation-replay-id" as const] : []),
    ...(!options.setupReadiness ? ["setup-readiness-summary-not-provided" as const] : [])
  ]);
}

function createMissingStructuralPieces(
  options: CreateNewGameStartGateSummaryOptions
): readonly NewGameStartGateStructuralPiece[] {
  const pieces = [
    ...(!options.startRequest ? ["new-game-start-request" as const] : []),
    ...(!options.startResult ? ["new-game-start-result" as const] : []),
    ...(options.startResult?.missingStructuralPieces ?? []),
    ...(options.setupReadiness?.missingStructuralPieces ?? [])
  ];

  return Object.freeze([...new Set(pieces)]);
}
