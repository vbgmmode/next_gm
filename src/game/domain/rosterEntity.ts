import type { EntityId } from "./common.ts";

export type RosterEntityBrandStatus =
  | "unassigned"
  | "brand-placeholder"
  | "inactive-placeholder";

export type RosterDivisionEligibility =
  | "open"
  | "singles-placeholder"
  | "tag-placeholder"
  | "trios-placeholder";

export type RosterRolePlaceholder =
  | "in-ring-placeholder"
  | "manager-placeholder"
  | "non-wrestling-placeholder";

export type RosterAlignmentPlaceholder =
  | "face-placeholder"
  | "heel-placeholder"
  | "tweener-placeholder"
  | "unassigned";

export type RosterReadinessIssue =
  | "missing-talent-id"
  | "missing-display-name";

export interface RosterEntityReadiness {
  readonly status: "diagnostics-only";
  readonly structurallyReady: boolean;
  readonly issues: readonly RosterReadinessIssue[];
  readonly gameplayAffecting: false;
  readonly playerFacing: false;
}

export interface RosterEntityShell {
  readonly talentId: EntityId;
  readonly displayName: string;
  readonly brandId?: EntityId;
  readonly brandStatus: RosterEntityBrandStatus;
  readonly divisionEligibility: readonly RosterDivisionEligibility[];
  readonly role: RosterRolePlaceholder;
  readonly alignment: RosterAlignmentPlaceholder;
  readonly readiness: RosterEntityReadiness;
}

export interface CreateRosterEntityShellOptions {
  readonly talentId?: EntityId;
  readonly displayName?: string;
  readonly brandId?: EntityId;
  readonly brandStatus?: RosterEntityBrandStatus;
  readonly divisionEligibility?: readonly RosterDivisionEligibility[];
  readonly role?: RosterRolePlaceholder;
  readonly alignment?: RosterAlignmentPlaceholder;
}

export function createRosterEntityShell(
  options: CreateRosterEntityShellOptions
): RosterEntityShell {
  const talentId = options.talentId?.trim() ?? "";
  const displayName = options.displayName?.trim() ?? "";

  return Object.freeze({
    talentId,
    displayName,
    brandId: options.brandId,
    brandStatus: options.brandStatus ?? "unassigned",
    divisionEligibility: Object.freeze([...(options.divisionEligibility ?? ["open"])]),
    role: options.role ?? "in-ring-placeholder",
    alignment: options.alignment ?? "unassigned",
    readiness: createRosterEntityReadiness({ talentId, displayName })
  });
}

export function createRosterEntityReadiness(
  entity: Pick<CreateRosterEntityShellOptions, "talentId" | "displayName">
): RosterEntityReadiness {
  const issues: RosterReadinessIssue[] = [
    ...(entity.talentId?.trim() ? [] : ["missing-talent-id" as const]),
    ...(entity.displayName?.trim() ? [] : ["missing-display-name" as const])
  ];

  return Object.freeze({
    status: "diagnostics-only",
    structurallyReady: issues.length === 0,
    issues: Object.freeze(issues),
    gameplayAffecting: false,
    playerFacing: false
  });
}
