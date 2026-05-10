import type { EntityId } from "./common.ts";

export type ChampionshipTypePlaceholder =
  | "unassigned"
  | "world-placeholder"
  | "singles-placeholder"
  | "tag-placeholder"
  | "specialty-placeholder";

export type ChampionshipHolderStatus =
  | "unassigned"
  | "holder-placeholder";

export type ChampionshipReadinessIssue =
  | "missing-championship-id"
  | "missing-display-name";

export interface ChampionshipHolderPlaceholder {
  readonly status: ChampionshipHolderStatus;
  readonly talentId?: EntityId;
  readonly displayName?: string;
}

export interface ChampionshipEntityReadiness {
  readonly status: "diagnostics-only";
  readonly structurallyReady: boolean;
  readonly issues: readonly ChampionshipReadinessIssue[];
  readonly championshipType: ChampionshipTypePlaceholder;
  readonly holderStatus: ChampionshipHolderStatus;
  readonly gameplayAffecting: false;
  readonly playerFacing: false;
}

export interface ChampionshipEntityShell {
  readonly championshipId: EntityId;
  readonly displayName: string;
  readonly brandId?: EntityId;
  readonly divisionId?: EntityId;
  readonly championshipType: ChampionshipTypePlaceholder;
  readonly currentHolder: ChampionshipHolderPlaceholder;
  readonly readiness: ChampionshipEntityReadiness;
}

export interface CreateChampionshipHolderPlaceholderOptions {
  readonly status?: ChampionshipHolderStatus;
  readonly talentId?: EntityId;
  readonly displayName?: string;
}

export interface CreateChampionshipEntityShellOptions {
  readonly championshipId?: EntityId;
  readonly displayName?: string;
  readonly brandId?: EntityId;
  readonly divisionId?: EntityId;
  readonly championshipType?: ChampionshipTypePlaceholder;
  readonly currentHolder?: CreateChampionshipHolderPlaceholderOptions;
}

export function createChampionshipEntityShell(
  options: CreateChampionshipEntityShellOptions
): ChampionshipEntityShell {
  const championshipId = options.championshipId?.trim() ?? "";
  const displayName = options.displayName?.trim() ?? "";
  const brandId = options.brandId?.trim();
  const divisionId = options.divisionId?.trim();
  const championshipType = options.championshipType ?? "unassigned";
  const currentHolder = createChampionshipHolderPlaceholder(options.currentHolder);

  return Object.freeze({
    championshipId,
    displayName,
    ...(brandId ? { brandId } : {}),
    ...(divisionId ? { divisionId } : {}),
    championshipType,
    currentHolder,
    readiness: createChampionshipEntityReadiness({
      championshipId,
      displayName,
      championshipType,
      holderStatus: currentHolder.status
    })
  });
}

export function createChampionshipEntityReadiness(
  entity: Pick<CreateChampionshipEntityShellOptions, "championshipId" | "displayName" | "championshipType"> & {
    readonly holderStatus?: ChampionshipHolderStatus;
  }
): ChampionshipEntityReadiness {
  const issues: ChampionshipReadinessIssue[] = [
    ...(entity.championshipId?.trim() ? [] : ["missing-championship-id" as const]),
    ...(entity.displayName?.trim() ? [] : ["missing-display-name" as const])
  ];

  return Object.freeze({
    status: "diagnostics-only",
    structurallyReady: issues.length === 0,
    issues: Object.freeze(issues),
    championshipType: entity.championshipType ?? "unassigned",
    holderStatus: entity.holderStatus ?? "unassigned",
    gameplayAffecting: false,
    playerFacing: false
  });
}

function createChampionshipHolderPlaceholder(
  options: CreateChampionshipHolderPlaceholderOptions = {}
): ChampionshipHolderPlaceholder {
  const talentId = options.talentId?.trim();
  const displayName = options.displayName?.trim();

  return Object.freeze({
    status: options.status ?? "unassigned",
    ...(talentId ? { talentId } : {}),
    ...(displayName ? { displayName } : {})
  });
}
