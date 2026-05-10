import type { EntityId } from "./common.ts";

export type DraftPoolStatusPlaceholder =
  | "unassigned"
  | "pending-placeholder"
  | "placeholder-ready";

export type DraftPoolReadinessIssue =
  | "missing-draft-pool-id";

export interface DraftPoolEntityReadiness {
  readonly status: "diagnostics-only";
  readonly structurallyReady: boolean;
  readonly issues: readonly DraftPoolReadinessIssue[];
  readonly draftPoolStatus: DraftPoolStatusPlaceholder;
  readonly gameplayAffecting: false;
  readonly playerFacing: false;
}

export interface DraftPoolEntityShell {
  readonly draftPoolId: EntityId;
  readonly setupId?: EntityId;
  readonly availableTalentIds: readonly EntityId[];
  readonly unavailableTalentIds: readonly EntityId[];
  readonly reservedTalentIds: readonly EntityId[];
  readonly draftPoolStatus: DraftPoolStatusPlaceholder;
  readonly readiness: DraftPoolEntityReadiness;
}

export interface CreateDraftPoolEntityShellOptions {
  readonly draftPoolId?: EntityId;
  readonly setupId?: EntityId;
  readonly availableTalentIds?: readonly EntityId[];
  readonly unavailableTalentIds?: readonly EntityId[];
  readonly reservedTalentIds?: readonly EntityId[];
  readonly draftPoolStatus?: DraftPoolStatusPlaceholder;
}

export function createDraftPoolEntityShell(
  options: CreateDraftPoolEntityShellOptions
): DraftPoolEntityShell {
  const draftPoolId = options.draftPoolId?.trim() ?? "";
  const setupId = options.setupId?.trim();
  const draftPoolStatus = options.draftPoolStatus ?? "unassigned";

  return Object.freeze({
    draftPoolId,
    ...(setupId ? { setupId } : {}),
    availableTalentIds: freezeTrimmedIds(options.availableTalentIds),
    unavailableTalentIds: freezeTrimmedIds(options.unavailableTalentIds),
    reservedTalentIds: freezeTrimmedIds(options.reservedTalentIds),
    draftPoolStatus,
    readiness: createDraftPoolEntityReadiness({
      draftPoolId,
      draftPoolStatus
    })
  });
}

export function createDraftPoolEntityReadiness(
  draftPool: Pick<CreateDraftPoolEntityShellOptions, "draftPoolId" | "draftPoolStatus">
): DraftPoolEntityReadiness {
  const issues: DraftPoolReadinessIssue[] = [
    ...(draftPool.draftPoolId?.trim() ? [] : ["missing-draft-pool-id" as const])
  ];

  return Object.freeze({
    status: "diagnostics-only",
    structurallyReady: issues.length === 0,
    issues: Object.freeze(issues),
    draftPoolStatus: draftPool.draftPoolStatus ?? "unassigned",
    gameplayAffecting: false,
    playerFacing: false
  });
}

function freezeTrimmedIds(ids: readonly EntityId[] = []): readonly EntityId[] {
  return Object.freeze(ids.map((id) => id.trim()).filter(Boolean));
}
