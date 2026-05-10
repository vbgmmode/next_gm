import type { EntityId } from "./common.ts";

export type BrandThemePlaceholder =
  | "unassigned"
  | "sports-forward-placeholder"
  | "entertainment-placeholder"
  | "hybrid-placeholder";

export type BrandWeeklyShowStatus =
  | "unassigned"
  | "weekly-show-placeholder";

export type BrandManagerStatus =
  | "unassigned"
  | "manager-placeholder";

export type BrandRosterAssignmentReadiness =
  | "unassigned"
  | "pending-placeholder"
  | "placeholder-ready";

export type BrandReadinessIssue =
  | "missing-brand-id"
  | "missing-display-name";

export interface BrandWeeklyShowPlaceholder {
  readonly status: BrandWeeklyShowStatus;
  readonly showId?: EntityId;
  readonly displayName?: string;
}

export interface BrandManagerPlaceholder {
  readonly status: BrandManagerStatus;
  readonly managerId?: EntityId;
  readonly displayName?: string;
}

export interface BrandEntityReadiness {
  readonly status: "diagnostics-only";
  readonly structurallyReady: boolean;
  readonly issues: readonly BrandReadinessIssue[];
  readonly rosterAssignmentReadiness: BrandRosterAssignmentReadiness;
  readonly gameplayAffecting: false;
  readonly playerFacing: false;
}

export interface BrandEntityShell {
  readonly brandId: EntityId;
  readonly displayName: string;
  readonly brandTheme: BrandThemePlaceholder;
  readonly weeklyShow: BrandWeeklyShowPlaceholder;
  readonly manager: BrandManagerPlaceholder;
  readonly readiness: BrandEntityReadiness;
}

export interface CreateBrandWeeklyShowPlaceholderOptions {
  readonly status?: BrandWeeklyShowStatus;
  readonly showId?: EntityId;
  readonly displayName?: string;
}

export interface CreateBrandManagerPlaceholderOptions {
  readonly status?: BrandManagerStatus;
  readonly managerId?: EntityId;
  readonly displayName?: string;
}

export interface CreateBrandEntityShellOptions {
  readonly brandId?: EntityId;
  readonly displayName?: string;
  readonly brandTheme?: BrandThemePlaceholder;
  readonly weeklyShow?: CreateBrandWeeklyShowPlaceholderOptions;
  readonly manager?: CreateBrandManagerPlaceholderOptions;
  readonly rosterAssignmentReadiness?: BrandRosterAssignmentReadiness;
}

export function createBrandEntityShell(
  options: CreateBrandEntityShellOptions
): BrandEntityShell {
  const brandId = options.brandId?.trim() ?? "";
  const displayName = options.displayName?.trim() ?? "";
  const rosterAssignmentReadiness = options.rosterAssignmentReadiness ?? "unassigned";

  return Object.freeze({
    brandId,
    displayName,
    brandTheme: options.brandTheme ?? "unassigned",
    weeklyShow: createBrandWeeklyShowPlaceholder(options.weeklyShow),
    manager: createBrandManagerPlaceholder(options.manager),
    readiness: createBrandEntityReadiness({
      brandId,
      displayName,
      rosterAssignmentReadiness
    })
  });
}

export function createBrandEntityReadiness(
  entity: Pick<CreateBrandEntityShellOptions, "brandId" | "displayName" | "rosterAssignmentReadiness">
): BrandEntityReadiness {
  const issues: BrandReadinessIssue[] = [
    ...(entity.brandId?.trim() ? [] : ["missing-brand-id" as const]),
    ...(entity.displayName?.trim() ? [] : ["missing-display-name" as const])
  ];

  return Object.freeze({
    status: "diagnostics-only",
    structurallyReady: issues.length === 0,
    issues: Object.freeze(issues),
    rosterAssignmentReadiness: entity.rosterAssignmentReadiness ?? "unassigned",
    gameplayAffecting: false,
    playerFacing: false
  });
}

function createBrandWeeklyShowPlaceholder(
  options: CreateBrandWeeklyShowPlaceholderOptions = {}
): BrandWeeklyShowPlaceholder {
  const showId = options.showId?.trim();
  const displayName = options.displayName?.trim();

  return Object.freeze({
    status: options.status ?? "unassigned",
    ...(showId ? { showId } : {}),
    ...(displayName ? { displayName } : {})
  });
}

function createBrandManagerPlaceholder(
  options: CreateBrandManagerPlaceholderOptions = {}
): BrandManagerPlaceholder {
  const managerId = options.managerId?.trim();
  const displayName = options.displayName?.trim();

  return Object.freeze({
    status: options.status ?? "unassigned",
    ...(managerId ? { managerId } : {}),
    ...(displayName ? { displayName } : {})
  });
}
