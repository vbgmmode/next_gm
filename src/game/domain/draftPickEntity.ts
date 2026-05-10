import type { EntityId } from "./common.ts";

export type DraftPickStatusPlaceholder =
  | "unassigned"
  | "pending-placeholder"
  | "selected-placeholder";

export type DraftPickReadinessIssue =
  | "missing-draft-pick-id";

export interface DraftPickEntityReadiness {
  readonly status: "diagnostics-only";
  readonly structurallyReady: boolean;
  readonly issues: readonly DraftPickReadinessIssue[];
  readonly pickStatus: DraftPickStatusPlaceholder;
  readonly gameplayAffecting: false;
  readonly playerFacing: false;
}

export interface DraftPickEntityShell {
  readonly draftPickId: EntityId;
  readonly draftOrderId?: EntityId;
  readonly draftPoolId?: EntityId;
  readonly setupId?: EntityId;
  readonly roundNumber: number;
  readonly pickNumber: number;
  readonly brandId?: EntityId;
  readonly managerId?: EntityId;
  readonly selectedTalentId?: EntityId;
  readonly pickStatus: DraftPickStatusPlaceholder;
  readonly readiness: DraftPickEntityReadiness;
}

export interface CreateDraftPickEntityShellOptions {
  readonly draftPickId?: EntityId;
  readonly draftOrderId?: EntityId;
  readonly draftPoolId?: EntityId;
  readonly setupId?: EntityId;
  readonly roundNumber?: number;
  readonly pickNumber?: number;
  readonly brandId?: EntityId;
  readonly managerId?: EntityId;
  readonly selectedTalentId?: EntityId;
  readonly pickStatus?: DraftPickStatusPlaceholder;
}

export function createDraftPickEntityShell(
  options: CreateDraftPickEntityShellOptions
): DraftPickEntityShell {
  const draftPickId = options.draftPickId?.trim() ?? "";
  const draftOrderId = options.draftOrderId?.trim();
  const draftPoolId = options.draftPoolId?.trim();
  const setupId = options.setupId?.trim();
  const brandId = options.brandId?.trim();
  const managerId = options.managerId?.trim();
  const selectedTalentId = options.selectedTalentId?.trim();
  const pickStatus = options.pickStatus ?? "unassigned";

  return Object.freeze({
    draftPickId,
    ...(draftOrderId ? { draftOrderId } : {}),
    ...(draftPoolId ? { draftPoolId } : {}),
    ...(setupId ? { setupId } : {}),
    roundNumber: normalizeNonNegativeInteger(options.roundNumber),
    pickNumber: normalizeNonNegativeInteger(options.pickNumber),
    ...(brandId ? { brandId } : {}),
    ...(managerId ? { managerId } : {}),
    ...(selectedTalentId ? { selectedTalentId } : {}),
    pickStatus,
    readiness: createDraftPickEntityReadiness({
      draftPickId,
      pickStatus
    })
  });
}

export function createDraftPickEntityReadiness(
  draftPick: Pick<CreateDraftPickEntityShellOptions, "draftPickId" | "pickStatus">
): DraftPickEntityReadiness {
  const issues: DraftPickReadinessIssue[] = [
    ...(draftPick.draftPickId?.trim() ? [] : ["missing-draft-pick-id" as const])
  ];

  return Object.freeze({
    status: "diagnostics-only",
    structurallyReady: issues.length === 0,
    issues: Object.freeze(issues),
    pickStatus: draftPick.pickStatus ?? "unassigned",
    gameplayAffecting: false,
    playerFacing: false
  });
}

function normalizeNonNegativeInteger(value = 0): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.trunc(value));
}
