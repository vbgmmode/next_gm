import type { EntityId } from "./common.ts";
import type { DraftOrderEntityShell } from "./draftOrderEntity.ts";
import type { DraftPickEntityShell } from "./draftPickEntity.ts";
import type { DraftPoolEntityShell } from "./draftPoolEntity.ts";
import type { DraftSessionEntityShell } from "./draftSessionEntity.ts";

export type DraftReadinessStructuralPiece =
  | "draft-pool"
  | "draft-order"
  | "draft-picks"
  | "draft-session";

export type DraftReadinessState =
  | "missing"
  | "structural-issues"
  | "structurally-ready";

export type OverallDraftReadiness =
  | "missing-structural-pieces"
  | "structural-issues"
  | "structurally-ready";

export interface DraftReadinessComponentSummary {
  readonly status: "diagnostics-only";
  readonly readiness: DraftReadinessState;
  readonly structurallyReady: boolean;
  readonly shellIds: readonly EntityId[];
  readonly issues: readonly string[];
  readonly gameplayAffecting: false;
  readonly playerFacing: false;
}

export interface DraftReadinessSummaryShell {
  readonly status: "diagnostics-only";
  readonly draftPoolReadiness: DraftReadinessComponentSummary;
  readonly draftOrderReadiness: DraftReadinessComponentSummary;
  readonly draftPickReadiness: DraftReadinessComponentSummary;
  readonly draftSessionReadiness: DraftReadinessComponentSummary;
  readonly missingStructuralPieces: readonly DraftReadinessStructuralPiece[];
  readonly overallDraftReadiness: OverallDraftReadiness;
  readonly gameplayAffecting: false;
  readonly playerFacing: false;
}

export interface CreateDraftReadinessSummaryOptions {
  readonly draftPool?: DraftPoolEntityShell;
  readonly draftOrder?: DraftOrderEntityShell;
  readonly draftPicks?: readonly DraftPickEntityShell[];
  readonly draftSession?: DraftSessionEntityShell;
}

export function createDraftReadinessSummary(
  options: CreateDraftReadinessSummaryOptions
): DraftReadinessSummaryShell {
  const draftPoolReadiness = summarizeSingleShell(
    options.draftPool,
    "missing-draft-pool-shell",
    (draftPool) => draftPool.draftPoolId
  );
  const draftOrderReadiness = summarizeSingleShell(
    options.draftOrder,
    "missing-draft-order-shell",
    (draftOrder) => draftOrder.draftOrderId
  );
  const draftPickReadiness = summarizeDraftPicks(options.draftPicks);
  const draftSessionReadiness = summarizeSingleShell(
    options.draftSession,
    "missing-draft-session-shell",
    (draftSession) => draftSession.draftSessionId
  );
  const missingStructuralPieces = Object.freeze([
    ...(draftPoolReadiness.readiness === "missing" ? ["draft-pool" as const] : []),
    ...(draftOrderReadiness.readiness === "missing" ? ["draft-order" as const] : []),
    ...(draftPickReadiness.readiness === "missing" ? ["draft-picks" as const] : []),
    ...(draftSessionReadiness.readiness === "missing" ? ["draft-session" as const] : [])
  ]);
  const componentReadiness = [
    draftPoolReadiness,
    draftOrderReadiness,
    draftPickReadiness,
    draftSessionReadiness
  ];

  return Object.freeze({
    status: "diagnostics-only",
    draftPoolReadiness,
    draftOrderReadiness,
    draftPickReadiness,
    draftSessionReadiness,
    missingStructuralPieces,
    overallDraftReadiness: createOverallDraftReadiness(missingStructuralPieces, componentReadiness),
    gameplayAffecting: false,
    playerFacing: false
  });
}

function summarizeSingleShell<TShell extends {
  readonly readiness: {
    readonly structurallyReady: boolean;
    readonly issues: readonly string[];
  };
}>(
  shell: TShell | undefined,
  missingIssue: string,
  getShellId: (shell: TShell) => EntityId
): DraftReadinessComponentSummary {
  if (!shell) {
    return createComponentSummary("missing", [], [missingIssue]);
  }

  return createComponentSummary(
    shell.readiness.structurallyReady ? "structurally-ready" : "structural-issues",
    freezeShellIds([getShellId(shell)]),
    shell.readiness.issues
  );
}

function summarizeDraftPicks(
  draftPicks: readonly DraftPickEntityShell[] | undefined
): DraftReadinessComponentSummary {
  if (!draftPicks || draftPicks.length === 0) {
    return createComponentSummary("missing", [], ["missing-draft-pick-shells"]);
  }

  const issues = draftPicks.flatMap((draftPick) => draftPick.readiness.issues);

  return createComponentSummary(
    issues.length === 0 ? "structurally-ready" : "structural-issues",
    freezeShellIds(draftPicks.map((draftPick) => draftPick.draftPickId)),
    issues
  );
}

function createComponentSummary(
  readiness: DraftReadinessState,
  shellIds: readonly EntityId[],
  issues: readonly string[]
): DraftReadinessComponentSummary {
  return Object.freeze({
    status: "diagnostics-only",
    readiness,
    structurallyReady: readiness === "structurally-ready",
    shellIds: freezeShellIds(shellIds),
    issues: Object.freeze([...issues]),
    gameplayAffecting: false,
    playerFacing: false
  });
}

function createOverallDraftReadiness(
  missingStructuralPieces: readonly DraftReadinessStructuralPiece[],
  componentReadiness: readonly DraftReadinessComponentSummary[]
): OverallDraftReadiness {
  if (missingStructuralPieces.length > 0) {
    return "missing-structural-pieces";
  }

  return componentReadiness.some((readiness) => readiness.readiness === "structural-issues")
    ? "structural-issues"
    : "structurally-ready";
}

function freezeShellIds(shellIds: readonly EntityId[]): readonly EntityId[] {
  return Object.freeze(shellIds.map((shellId) => shellId.trim()).filter(Boolean));
}
