import type { EntityId } from "./common.ts";

export type DraftOrderStatusPlaceholder =
  | "unassigned"
  | "pending-placeholder"
  | "placeholder-ready";

export type DraftOrderCurrentTurnStatus =
  | "unassigned"
  | "turn-placeholder";

export type DraftOrderReadinessIssue =
  | "missing-draft-order-id";

export interface DraftOrderCurrentTurnPlaceholder {
  readonly status: DraftOrderCurrentTurnStatus;
  readonly brandId?: EntityId;
  readonly roundNumber?: number;
  readonly turnIndex?: number;
}

export interface DraftOrderEntityReadiness {
  readonly status: "diagnostics-only";
  readonly structurallyReady: boolean;
  readonly issues: readonly DraftOrderReadinessIssue[];
  readonly draftOrderStatus: DraftOrderStatusPlaceholder;
  readonly currentTurnStatus: DraftOrderCurrentTurnStatus;
  readonly gameplayAffecting: false;
  readonly playerFacing: false;
}

export interface DraftOrderEntityShell {
  readonly draftOrderId: EntityId;
  readonly setupId?: EntityId;
  readonly draftPoolId?: EntityId;
  readonly roundCount: number;
  readonly brandTurnOrderIds: readonly EntityId[];
  readonly currentTurn: DraftOrderCurrentTurnPlaceholder;
  readonly draftOrderStatus: DraftOrderStatusPlaceholder;
  readonly readiness: DraftOrderEntityReadiness;
}

export interface CreateDraftOrderCurrentTurnOptions {
  readonly status?: DraftOrderCurrentTurnStatus;
  readonly brandId?: EntityId;
  readonly roundNumber?: number;
  readonly turnIndex?: number;
}

export interface CreateDraftOrderEntityShellOptions {
  readonly draftOrderId?: EntityId;
  readonly setupId?: EntityId;
  readonly draftPoolId?: EntityId;
  readonly roundCount?: number;
  readonly brandTurnOrderIds?: readonly EntityId[];
  readonly currentTurn?: CreateDraftOrderCurrentTurnOptions;
  readonly draftOrderStatus?: DraftOrderStatusPlaceholder;
}

export function createDraftOrderEntityShell(
  options: CreateDraftOrderEntityShellOptions
): DraftOrderEntityShell {
  const draftOrderId = options.draftOrderId?.trim() ?? "";
  const setupId = options.setupId?.trim();
  const draftPoolId = options.draftPoolId?.trim();
  const currentTurn = createDraftOrderCurrentTurnPlaceholder(options.currentTurn);
  const draftOrderStatus = options.draftOrderStatus ?? "unassigned";

  return Object.freeze({
    draftOrderId,
    ...(setupId ? { setupId } : {}),
    ...(draftPoolId ? { draftPoolId } : {}),
    roundCount: normalizeNonNegativeInteger(options.roundCount),
    brandTurnOrderIds: freezeTrimmedIds(options.brandTurnOrderIds),
    currentTurn,
    draftOrderStatus,
    readiness: createDraftOrderEntityReadiness({
      draftOrderId,
      draftOrderStatus,
      currentTurnStatus: currentTurn.status
    })
  });
}

export function createDraftOrderEntityReadiness(
  draftOrder: Pick<CreateDraftOrderEntityShellOptions, "draftOrderId" | "draftOrderStatus"> & {
    readonly currentTurnStatus?: DraftOrderCurrentTurnStatus;
  }
): DraftOrderEntityReadiness {
  const issues: DraftOrderReadinessIssue[] = [
    ...(draftOrder.draftOrderId?.trim() ? [] : ["missing-draft-order-id" as const])
  ];

  return Object.freeze({
    status: "diagnostics-only",
    structurallyReady: issues.length === 0,
    issues: Object.freeze(issues),
    draftOrderStatus: draftOrder.draftOrderStatus ?? "unassigned",
    currentTurnStatus: draftOrder.currentTurnStatus ?? "unassigned",
    gameplayAffecting: false,
    playerFacing: false
  });
}

function createDraftOrderCurrentTurnPlaceholder(
  options: CreateDraftOrderCurrentTurnOptions = {}
): DraftOrderCurrentTurnPlaceholder {
  const brandId = options.brandId?.trim();

  return Object.freeze({
    status: options.status ?? "unassigned",
    ...(brandId ? { brandId } : {}),
    ...(options.roundNumber === undefined ? {} : { roundNumber: normalizeNonNegativeInteger(options.roundNumber) }),
    ...(options.turnIndex === undefined ? {} : { turnIndex: normalizeNonNegativeInteger(options.turnIndex) })
  });
}

function freezeTrimmedIds(ids: readonly EntityId[] = []): readonly EntityId[] {
  return Object.freeze(ids.map((id) => id.trim()).filter(Boolean));
}

function normalizeNonNegativeInteger(value = 0): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.trunc(value));
}
