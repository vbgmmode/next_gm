import type { EntityId } from "./common.ts";

export type DraftSessionStatusPlaceholder =
  | "unassigned"
  | "pending-placeholder"
  | "active-placeholder"
  | "complete-placeholder";

export type DraftSessionCurrentTurnStatus =
  | "unassigned"
  | "turn-placeholder";

export type DraftSessionReadinessIssue =
  | "missing-draft-session-id";

export interface DraftSessionCurrentTurnPlaceholder {
  readonly status: DraftSessionCurrentTurnStatus;
  readonly draftPickId?: EntityId;
  readonly brandId?: EntityId;
  readonly managerId?: EntityId;
}

export interface DraftSessionEntityReadiness {
  readonly status: "diagnostics-only";
  readonly structurallyReady: boolean;
  readonly issues: readonly DraftSessionReadinessIssue[];
  readonly sessionStatus: DraftSessionStatusPlaceholder;
  readonly currentTurnStatus: DraftSessionCurrentTurnStatus;
  readonly gameplayAffecting: false;
  readonly playerFacing: false;
}

export interface DraftSessionEntityShell {
  readonly draftSessionId: EntityId;
  readonly setupId?: EntityId;
  readonly draftPoolId?: EntityId;
  readonly draftOrderId?: EntityId;
  readonly draftPickIds: readonly EntityId[];
  readonly sessionStatus: DraftSessionStatusPlaceholder;
  readonly currentTurn: DraftSessionCurrentTurnPlaceholder;
  readonly readiness: DraftSessionEntityReadiness;
}

export interface CreateDraftSessionCurrentTurnOptions {
  readonly status?: DraftSessionCurrentTurnStatus;
  readonly draftPickId?: EntityId;
  readonly brandId?: EntityId;
  readonly managerId?: EntityId;
}

export interface CreateDraftSessionEntityShellOptions {
  readonly draftSessionId?: EntityId;
  readonly setupId?: EntityId;
  readonly draftPoolId?: EntityId;
  readonly draftOrderId?: EntityId;
  readonly draftPickIds?: readonly EntityId[];
  readonly sessionStatus?: DraftSessionStatusPlaceholder;
  readonly currentTurn?: CreateDraftSessionCurrentTurnOptions;
}

export function createDraftSessionEntityShell(
  options: CreateDraftSessionEntityShellOptions
): DraftSessionEntityShell {
  const draftSessionId = options.draftSessionId?.trim() ?? "";
  const setupId = options.setupId?.trim();
  const draftPoolId = options.draftPoolId?.trim();
  const draftOrderId = options.draftOrderId?.trim();
  const sessionStatus = options.sessionStatus ?? "unassigned";
  const currentTurn = createDraftSessionCurrentTurnPlaceholder(options.currentTurn);

  return Object.freeze({
    draftSessionId,
    ...(setupId ? { setupId } : {}),
    ...(draftPoolId ? { draftPoolId } : {}),
    ...(draftOrderId ? { draftOrderId } : {}),
    draftPickIds: freezeTrimmedIds(options.draftPickIds),
    sessionStatus,
    currentTurn,
    readiness: createDraftSessionEntityReadiness({
      draftSessionId,
      sessionStatus,
      currentTurnStatus: currentTurn.status
    })
  });
}

export function createDraftSessionEntityReadiness(
  draftSession: Pick<CreateDraftSessionEntityShellOptions, "draftSessionId" | "sessionStatus"> & {
    readonly currentTurnStatus?: DraftSessionCurrentTurnStatus;
  }
): DraftSessionEntityReadiness {
  const issues: DraftSessionReadinessIssue[] = [
    ...(draftSession.draftSessionId?.trim() ? [] : ["missing-draft-session-id" as const])
  ];

  return Object.freeze({
    status: "diagnostics-only",
    structurallyReady: issues.length === 0,
    issues: Object.freeze(issues),
    sessionStatus: draftSession.sessionStatus ?? "unassigned",
    currentTurnStatus: draftSession.currentTurnStatus ?? "unassigned",
    gameplayAffecting: false,
    playerFacing: false
  });
}

function createDraftSessionCurrentTurnPlaceholder(
  options: CreateDraftSessionCurrentTurnOptions = {}
): DraftSessionCurrentTurnPlaceholder {
  const draftPickId = options.draftPickId?.trim();
  const brandId = options.brandId?.trim();
  const managerId = options.managerId?.trim();

  return Object.freeze({
    status: options.status ?? "unassigned",
    ...(draftPickId ? { draftPickId } : {}),
    ...(brandId ? { brandId } : {}),
    ...(managerId ? { managerId } : {})
  });
}

function freezeTrimmedIds(ids: readonly EntityId[] = []): readonly EntityId[] {
  return Object.freeze(ids.map((id) => id.trim()).filter(Boolean));
}
