import type { SimulationContext } from "../simulation/simulationContext.ts";
import type { EntityId } from "./common.ts";
import type {
  NewGameStartRequestShell
} from "./newGameStartContract.ts";
import type {
  NewGameStartGateBlockingReason,
  NewGameStartGateStructuralPiece,
  NewGameStartGateSummaryShell,
  NewGameStartGateWarningReason,
  OverallNewGameStartGateReadiness
} from "./newGameStartGateSummary.ts";

export type SaveProgressionStatusPlaceholder =
  | "not-started-placeholder"
  | "blocked-placeholder"
  | "ready-placeholder";

export type SavePersistenceStatusPlaceholder =
  | "not-wired-placeholder"
  | "pending-placeholder"
  | "unavailable-placeholder";

export type SaveProgressionContractIssue =
  | "missing-save-contract-id";

export type SaveProgressionStartRequestReferenceStatus =
  | "missing"
  | "provided";

export interface SaveProgressionContractReadiness {
  readonly status: "diagnostics-only";
  readonly structurallyReady: boolean;
  readonly issues: readonly SaveProgressionContractIssue[];
  readonly progressionStatus: SaveProgressionStatusPlaceholder;
  readonly persistenceStatus: SavePersistenceStatusPlaceholder;
  readonly gateReadiness: OverallNewGameStartGateReadiness | "missing";
  readonly startRequestReferenceStatus: SaveProgressionStartRequestReferenceStatus;
  readonly gameplayAffecting: false;
  readonly playerFacing: false;
}

export interface SaveProgressionGateReferenceSummary {
  readonly status: "diagnostics-only";
  readonly gateReadiness: OverallNewGameStartGateReadiness | "missing";
  readonly blockingReasons: readonly NewGameStartGateBlockingReason[];
  readonly warningReasons: readonly NewGameStartGateWarningReason[];
  readonly missingStructuralPieces: readonly NewGameStartGateStructuralPiece[];
  readonly gameplayAffecting: false;
  readonly playerFacing: false;
}

export interface SaveProgressionStartRequestReferenceSummary {
  readonly status: "diagnostics-only";
  readonly referenceStatus: SaveProgressionStartRequestReferenceStatus;
  readonly setupId?: EntityId;
  readonly selectedBrandId?: EntityId;
  readonly playerManagerId?: EntityId;
  readonly replayId?: string;
  readonly seedLabel?: string;
  readonly gameplayAffecting: false;
  readonly playerFacing: false;
}

export interface SaveProgressionContractShell {
  readonly status: "diagnostics-only";
  readonly saveContractId: EntityId;
  readonly requestedSaveSlotId?: EntityId;
  readonly setupId?: EntityId;
  readonly selectedBrandId?: EntityId;
  readonly playerManagerId?: EntityId;
  readonly replayId?: string;
  readonly seedLabel?: string;
  readonly progressionStatus: SaveProgressionStatusPlaceholder;
  readonly persistenceStatus: SavePersistenceStatusPlaceholder;
  readonly gateReference: SaveProgressionGateReferenceSummary;
  readonly startRequestReference: SaveProgressionStartRequestReferenceSummary;
  readonly readiness: SaveProgressionContractReadiness;
  readonly gameplayAffecting: false;
  readonly playerFacing: false;
}

export interface CreateSaveProgressionContractShellOptions {
  readonly saveContractId?: EntityId;
  readonly requestedSaveSlotId?: EntityId;
  readonly setupId?: EntityId;
  readonly selectedBrandId?: EntityId;
  readonly playerManagerId?: EntityId;
  readonly replayId?: string;
  readonly seedLabel?: string;
  readonly progressionStatus?: SaveProgressionStatusPlaceholder;
  readonly persistenceStatus?: SavePersistenceStatusPlaceholder;
  readonly startGateSummary?: NewGameStartGateSummaryShell;
  readonly startRequest?: NewGameStartRequestShell;
  readonly simulationContext?: SimulationContext;
}

export function createSaveProgressionContractShell(
  options: CreateSaveProgressionContractShellOptions
): SaveProgressionContractShell {
  const saveContractId = options.saveContractId?.trim() ?? "";
  const requestedSaveSlotId = trimOptionalId(options.requestedSaveSlotId);
  const setupId = trimOptionalId(options.setupId ?? options.startRequest?.setupId);
  const selectedBrandId = trimOptionalId(
    options.selectedBrandId ?? options.startRequest?.selectedBrandId
  );
  const playerManagerId = trimOptionalId(
    options.playerManagerId ?? options.startRequest?.playerManagerId
  );
  const replayId = trimOptionalString(
    options.replayId
      ?? options.simulationContext?.replay.replayId
      ?? options.startRequest?.simulationReplayId
  );
  const seedLabel = trimOptionalString(
    options.seedLabel
      ?? options.simulationContext?.seedLabel
      ?? options.startRequest?.simulationSeedLabel
  );
  const progressionStatus = options.progressionStatus ?? "not-started-placeholder";
  const persistenceStatus = options.persistenceStatus ?? "not-wired-placeholder";

  return Object.freeze({
    status: "diagnostics-only",
    saveContractId,
    ...(requestedSaveSlotId ? { requestedSaveSlotId } : {}),
    ...(setupId ? { setupId } : {}),
    ...(selectedBrandId ? { selectedBrandId } : {}),
    ...(playerManagerId ? { playerManagerId } : {}),
    ...(replayId ? { replayId } : {}),
    ...(seedLabel ? { seedLabel } : {}),
    progressionStatus,
    persistenceStatus,
    gateReference: createGateReferenceSummary(options.startGateSummary),
    startRequestReference: createStartRequestReferenceSummary({
      startRequest: options.startRequest,
      setupId,
      selectedBrandId,
      playerManagerId,
      replayId,
      seedLabel
    }),
    readiness: createSaveProgressionContractReadiness({
      saveContractId,
      progressionStatus,
      persistenceStatus,
      startGateSummary: options.startGateSummary,
      startRequest: options.startRequest
    }),
    gameplayAffecting: false,
    playerFacing: false
  });
}

function createSaveProgressionContractReadiness(options: {
  readonly saveContractId: EntityId;
  readonly progressionStatus: SaveProgressionStatusPlaceholder;
  readonly persistenceStatus: SavePersistenceStatusPlaceholder;
  readonly startGateSummary?: NewGameStartGateSummaryShell;
  readonly startRequest?: NewGameStartRequestShell;
}): SaveProgressionContractReadiness {
  const issues: SaveProgressionContractIssue[] = [
    ...(options.saveContractId ? [] : ["missing-save-contract-id" as const])
  ];

  return Object.freeze({
    status: "diagnostics-only",
    structurallyReady: issues.length === 0,
    issues: Object.freeze(issues),
    progressionStatus: options.progressionStatus,
    persistenceStatus: options.persistenceStatus,
    gateReadiness: options.startGateSummary?.overallGateReadiness ?? "missing",
    startRequestReferenceStatus: options.startRequest ? "provided" : "missing",
    gameplayAffecting: false,
    playerFacing: false
  });
}

function createGateReferenceSummary(
  startGateSummary: NewGameStartGateSummaryShell | undefined
): SaveProgressionGateReferenceSummary {
  return Object.freeze({
    status: "diagnostics-only",
    gateReadiness: startGateSummary?.overallGateReadiness ?? "missing",
    blockingReasons: Object.freeze([...(startGateSummary?.blockingReasons ?? [])]),
    warningReasons: Object.freeze([...(startGateSummary?.warningReasons ?? [])]),
    missingStructuralPieces: Object.freeze([...(startGateSummary?.missingStructuralPieces ?? [])]),
    gameplayAffecting: false,
    playerFacing: false
  });
}

function createStartRequestReferenceSummary(options: {
  readonly startRequest?: NewGameStartRequestShell;
  readonly setupId?: EntityId;
  readonly selectedBrandId?: EntityId;
  readonly playerManagerId?: EntityId;
  readonly replayId?: string;
  readonly seedLabel?: string;
}): SaveProgressionStartRequestReferenceSummary {
  return Object.freeze({
    status: "diagnostics-only",
    referenceStatus: options.startRequest ? "provided" : "missing",
    ...(options.setupId ? { setupId: options.setupId } : {}),
    ...(options.selectedBrandId ? { selectedBrandId: options.selectedBrandId } : {}),
    ...(options.playerManagerId ? { playerManagerId: options.playerManagerId } : {}),
    ...(options.replayId ? { replayId: options.replayId } : {}),
    ...(options.seedLabel ? { seedLabel: options.seedLabel } : {}),
    gameplayAffecting: false,
    playerFacing: false
  });
}

function trimOptionalId(id: EntityId | undefined): EntityId | undefined {
  const trimmed = id?.trim();

  return trimmed ? trimmed : undefined;
}

function trimOptionalString(value: string | undefined): string | undefined {
  const trimmed = value?.trim();

  return trimmed ? trimmed : undefined;
}
