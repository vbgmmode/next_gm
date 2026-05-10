import type { EntityId } from "./common.ts";

export type DivisionEligibilityPlaceholder =
  | "open"
  | "singles-placeholder"
  | "tag-placeholder"
  | "trios-placeholder"
  | "specialty-placeholder";

export type DivisionChampionshipAssociationStatus =
  | "unassigned"
  | "championship-placeholder";

export type DivisionReadinessIssue =
  | "missing-division-id"
  | "missing-display-name";

export interface DivisionChampionshipAssociationPlaceholder {
  readonly status: DivisionChampionshipAssociationStatus;
  readonly championshipId?: EntityId;
  readonly displayName?: string;
}

export interface DivisionEntityReadiness {
  readonly status: "diagnostics-only";
  readonly structurallyReady: boolean;
  readonly issues: readonly DivisionReadinessIssue[];
  readonly eligibility: DivisionEligibilityPlaceholder;
  readonly championshipAssociationStatus: DivisionChampionshipAssociationStatus;
  readonly gameplayAffecting: false;
  readonly playerFacing: false;
}

export interface DivisionEntityShell {
  readonly divisionId: EntityId;
  readonly displayName: string;
  readonly brandId?: EntityId;
  readonly eligibility: DivisionEligibilityPlaceholder;
  readonly championshipAssociation: DivisionChampionshipAssociationPlaceholder;
  readonly readiness: DivisionEntityReadiness;
}

export interface CreateDivisionChampionshipAssociationOptions {
  readonly status?: DivisionChampionshipAssociationStatus;
  readonly championshipId?: EntityId;
  readonly displayName?: string;
}

export interface CreateDivisionEntityShellOptions {
  readonly divisionId?: EntityId;
  readonly displayName?: string;
  readonly brandId?: EntityId;
  readonly eligibility?: DivisionEligibilityPlaceholder;
  readonly championshipAssociation?: CreateDivisionChampionshipAssociationOptions;
}

export function createDivisionEntityShell(
  options: CreateDivisionEntityShellOptions
): DivisionEntityShell {
  const divisionId = options.divisionId?.trim() ?? "";
  const displayName = options.displayName?.trim() ?? "";
  const brandId = options.brandId?.trim();
  const eligibility = options.eligibility ?? "open";
  const championshipAssociation = createDivisionChampionshipAssociationPlaceholder(
    options.championshipAssociation
  );

  return Object.freeze({
    divisionId,
    displayName,
    ...(brandId ? { brandId } : {}),
    eligibility,
    championshipAssociation,
    readiness: createDivisionEntityReadiness({
      divisionId,
      displayName,
      eligibility,
      championshipAssociationStatus: championshipAssociation.status
    })
  });
}

export function createDivisionEntityReadiness(
  entity: Pick<CreateDivisionEntityShellOptions, "divisionId" | "displayName" | "eligibility"> & {
    readonly championshipAssociationStatus?: DivisionChampionshipAssociationStatus;
  }
): DivisionEntityReadiness {
  const issues: DivisionReadinessIssue[] = [
    ...(entity.divisionId?.trim() ? [] : ["missing-division-id" as const]),
    ...(entity.displayName?.trim() ? [] : ["missing-display-name" as const])
  ];

  return Object.freeze({
    status: "diagnostics-only",
    structurallyReady: issues.length === 0,
    issues: Object.freeze(issues),
    eligibility: entity.eligibility ?? "open",
    championshipAssociationStatus: entity.championshipAssociationStatus ?? "unassigned",
    gameplayAffecting: false,
    playerFacing: false
  });
}

function createDivisionChampionshipAssociationPlaceholder(
  options: CreateDivisionChampionshipAssociationOptions = {}
): DivisionChampionshipAssociationPlaceholder {
  const championshipId = options.championshipId?.trim();
  const displayName = options.displayName?.trim();

  return Object.freeze({
    status: options.status ?? "unassigned",
    ...(championshipId ? { championshipId } : {}),
    ...(displayName ? { displayName } : {})
  });
}
