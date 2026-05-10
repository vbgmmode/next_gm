import type { EntityId } from "./common.ts";

export type ManagerControlledBrandStatus =
  | "unassigned"
  | "brand-placeholder";

export type ManagerControlTypePlaceholder =
  | "unassigned"
  | "player-placeholder"
  | "ai-placeholder";

export type ManagerPersonaStylePlaceholder =
  | "unassigned"
  | "balanced-placeholder"
  | "story-focused-placeholder"
  | "sports-forward-placeholder"
  | "analytical-placeholder";

export type ManagerReadinessIssue =
  | "missing-manager-id"
  | "missing-display-name";

export interface ManagerEntityReadiness {
  readonly status: "diagnostics-only";
  readonly structurallyReady: boolean;
  readonly issues: readonly ManagerReadinessIssue[];
  readonly controlledBrandStatus: ManagerControlledBrandStatus;
  readonly controlType: ManagerControlTypePlaceholder;
  readonly gameplayAffecting: false;
  readonly playerFacing: false;
}

export interface ManagerEntityShell {
  readonly managerId: EntityId;
  readonly displayName: string;
  readonly controlledBrandId?: EntityId;
  readonly controlledBrandStatus: ManagerControlledBrandStatus;
  readonly controlType: ManagerControlTypePlaceholder;
  readonly personaStyle: ManagerPersonaStylePlaceholder;
  readonly readiness: ManagerEntityReadiness;
}

export interface CreateManagerEntityShellOptions {
  readonly managerId?: EntityId;
  readonly displayName?: string;
  readonly controlledBrandId?: EntityId;
  readonly controlledBrandStatus?: ManagerControlledBrandStatus;
  readonly controlType?: ManagerControlTypePlaceholder;
  readonly personaStyle?: ManagerPersonaStylePlaceholder;
}

export function createManagerEntityShell(
  options: CreateManagerEntityShellOptions
): ManagerEntityShell {
  const managerId = options.managerId?.trim() ?? "";
  const displayName = options.displayName?.trim() ?? "";
  const controlledBrandId = options.controlledBrandId?.trim();
  const controlledBrandStatus = options.controlledBrandStatus ?? (
    controlledBrandId ? "brand-placeholder" : "unassigned"
  );
  const controlType = options.controlType ?? "unassigned";

  return Object.freeze({
    managerId,
    displayName,
    ...(controlledBrandId ? { controlledBrandId } : {}),
    controlledBrandStatus,
    controlType,
    personaStyle: options.personaStyle ?? "unassigned",
    readiness: createManagerEntityReadiness({
      managerId,
      displayName,
      controlledBrandStatus,
      controlType
    })
  });
}

export function createManagerEntityReadiness(
  entity: Pick<
    CreateManagerEntityShellOptions,
    "managerId" | "displayName" | "controlledBrandStatus" | "controlType"
  >
): ManagerEntityReadiness {
  const issues: ManagerReadinessIssue[] = [
    ...(entity.managerId?.trim() ? [] : ["missing-manager-id" as const]),
    ...(entity.displayName?.trim() ? [] : ["missing-display-name" as const])
  ];

  return Object.freeze({
    status: "diagnostics-only",
    structurallyReady: issues.length === 0,
    issues: Object.freeze(issues),
    controlledBrandStatus: entity.controlledBrandStatus ?? "unassigned",
    controlType: entity.controlType ?? "unassigned",
    gameplayAffecting: false,
    playerFacing: false
  });
}
