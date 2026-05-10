import type { EntityId } from "./common.ts";

export type GameSetupRosterPoolStatus =
  | "unassigned"
  | "pending-placeholder"
  | "placeholder-ready";

export type GameSetupDivisionStatus =
  | "unassigned"
  | "pending-placeholder"
  | "placeholder-ready";

export type GameSetupChampionshipStatus =
  | "unassigned"
  | "pending-placeholder"
  | "placeholder-ready";

export type GameSetupReadinessIssue =
  | "missing-setup-id";

export interface GameSetupEntityReadiness {
  readonly status: "diagnostics-only";
  readonly structurallyReady: boolean;
  readonly issues: readonly GameSetupReadinessIssue[];
  readonly rosterPoolStatus: GameSetupRosterPoolStatus;
  readonly divisionSetupStatus: GameSetupDivisionStatus;
  readonly championshipSetupStatus: GameSetupChampionshipStatus;
  readonly gameplayAffecting: false;
  readonly playerFacing: false;
}

export interface GameSetupEntityShell {
  readonly setupId: EntityId;
  readonly availableBrandIds: readonly EntityId[];
  readonly selectedBrandId?: EntityId;
  readonly managerIds: readonly EntityId[];
  readonly playerManagerId?: EntityId;
  readonly aiManagerIds: readonly EntityId[];
  readonly rosterPoolStatus: GameSetupRosterPoolStatus;
  readonly divisionSetupStatus: GameSetupDivisionStatus;
  readonly championshipSetupStatus: GameSetupChampionshipStatus;
  readonly readiness: GameSetupEntityReadiness;
}

export interface CreateGameSetupEntityShellOptions {
  readonly setupId?: EntityId;
  readonly availableBrandIds?: readonly EntityId[];
  readonly selectedBrandId?: EntityId;
  readonly managerIds?: readonly EntityId[];
  readonly playerManagerId?: EntityId;
  readonly aiManagerIds?: readonly EntityId[];
  readonly rosterPoolStatus?: GameSetupRosterPoolStatus;
  readonly divisionSetupStatus?: GameSetupDivisionStatus;
  readonly championshipSetupStatus?: GameSetupChampionshipStatus;
}

export function createGameSetupEntityShell(
  options: CreateGameSetupEntityShellOptions
): GameSetupEntityShell {
  const setupId = options.setupId?.trim() ?? "";
  const selectedBrandId = options.selectedBrandId?.trim();
  const playerManagerId = options.playerManagerId?.trim();
  const rosterPoolStatus = options.rosterPoolStatus ?? "unassigned";
  const divisionSetupStatus = options.divisionSetupStatus ?? "unassigned";
  const championshipSetupStatus = options.championshipSetupStatus ?? "unassigned";

  return Object.freeze({
    setupId,
    availableBrandIds: freezeTrimmedIds(options.availableBrandIds),
    ...(selectedBrandId ? { selectedBrandId } : {}),
    managerIds: freezeTrimmedIds(options.managerIds),
    ...(playerManagerId ? { playerManagerId } : {}),
    aiManagerIds: freezeTrimmedIds(options.aiManagerIds),
    rosterPoolStatus,
    divisionSetupStatus,
    championshipSetupStatus,
    readiness: createGameSetupEntityReadiness({
      setupId,
      rosterPoolStatus,
      divisionSetupStatus,
      championshipSetupStatus
    })
  });
}

export function createGameSetupEntityReadiness(
  setup: Pick<
    CreateGameSetupEntityShellOptions,
    "setupId" | "rosterPoolStatus" | "divisionSetupStatus" | "championshipSetupStatus"
  >
): GameSetupEntityReadiness {
  const issues: GameSetupReadinessIssue[] = [
    ...(setup.setupId?.trim() ? [] : ["missing-setup-id" as const])
  ];

  return Object.freeze({
    status: "diagnostics-only",
    structurallyReady: issues.length === 0,
    issues: Object.freeze(issues),
    rosterPoolStatus: setup.rosterPoolStatus ?? "unassigned",
    divisionSetupStatus: setup.divisionSetupStatus ?? "unassigned",
    championshipSetupStatus: setup.championshipSetupStatus ?? "unassigned",
    gameplayAffecting: false,
    playerFacing: false
  });
}

function freezeTrimmedIds(ids: readonly EntityId[] = []): readonly EntityId[] {
  return Object.freeze(ids.map((id) => id.trim()).filter(Boolean));
}
