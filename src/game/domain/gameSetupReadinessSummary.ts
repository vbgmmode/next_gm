import type { BrandEntityShell } from "./brandEntity.ts";
import type { ChampionshipEntityShell } from "./championshipEntity.ts";
import type { DivisionEntityShell } from "./divisionEntity.ts";
import type { DraftReadinessSummaryShell } from "./draftReadinessSummary.ts";
import type { GameSetupEntityShell } from "./gameSetupEntity.ts";
import type { ManagerEntityShell } from "./managerEntity.ts";
import type { RosterEntityShell } from "./rosterEntity.ts";
import type { EntityId } from "./common.ts";

export type GameSetupReadinessStructuralPiece =
  | "game-setup"
  | "brands"
  | "managers"
  | "roster"
  | "divisions"
  | "championships"
  | "draft-readiness";

export type GameSetupReadinessState =
  | "missing"
  | "structural-issues"
  | "structurally-ready";

export type OverallGameSetupReadiness =
  | "missing-structural-pieces"
  | "structural-issues"
  | "structurally-ready";

export interface GameSetupReadinessComponentSummary {
  readonly status: "diagnostics-only";
  readonly readiness: GameSetupReadinessState;
  readonly structurallyReady: boolean;
  readonly shellIds: readonly EntityId[];
  readonly issues: readonly string[];
  readonly gameplayAffecting: false;
  readonly playerFacing: false;
}

export interface GameSetupReadinessSummaryShell {
  readonly status: "diagnostics-only";
  readonly setupReadiness: GameSetupReadinessComponentSummary;
  readonly brandReadiness: GameSetupReadinessComponentSummary;
  readonly managerReadiness: GameSetupReadinessComponentSummary;
  readonly rosterReadiness: GameSetupReadinessComponentSummary;
  readonly divisionReadiness: GameSetupReadinessComponentSummary;
  readonly championshipReadiness: GameSetupReadinessComponentSummary;
  readonly draftReadiness: GameSetupReadinessComponentSummary;
  readonly missingStructuralPieces: readonly GameSetupReadinessStructuralPiece[];
  readonly overallSetupReadiness: OverallGameSetupReadiness;
  readonly gameplayAffecting: false;
  readonly playerFacing: false;
}

export interface CreateGameSetupReadinessSummaryOptions {
  readonly setup?: GameSetupEntityShell;
  readonly brands?: readonly BrandEntityShell[];
  readonly managers?: readonly ManagerEntityShell[];
  readonly roster?: readonly RosterEntityShell[];
  readonly divisions?: readonly DivisionEntityShell[];
  readonly championships?: readonly ChampionshipEntityShell[];
  readonly draftReadiness?: DraftReadinessSummaryShell;
}

export function createGameSetupReadinessSummary(
  options: CreateGameSetupReadinessSummaryOptions
): GameSetupReadinessSummaryShell {
  const setupReadiness = summarizeSingleShell(
    options.setup,
    "missing-game-setup-shell",
    (setup) => setup.setupId
  );
  const brandReadiness = summarizeShellCollection(
    options.brands,
    "missing-brand-shells",
    (brand) => brand.brandId
  );
  const managerReadiness = summarizeShellCollection(
    options.managers,
    "missing-manager-shells",
    (manager) => manager.managerId
  );
  const rosterReadiness = summarizeShellCollection(
    options.roster,
    "missing-roster-shells",
    (rosterEntity) => rosterEntity.talentId
  );
  const divisionReadiness = summarizeShellCollection(
    options.divisions,
    "missing-division-shells",
    (division) => division.divisionId
  );
  const championshipReadiness = summarizeShellCollection(
    options.championships,
    "missing-championship-shells",
    (championship) => championship.championshipId
  );
  const draftReadiness = summarizeDraftReadiness(options.draftReadiness);
  const missingStructuralPieces = Object.freeze([
    ...(setupReadiness.readiness === "missing" ? ["game-setup" as const] : []),
    ...(brandReadiness.readiness === "missing" ? ["brands" as const] : []),
    ...(managerReadiness.readiness === "missing" ? ["managers" as const] : []),
    ...(rosterReadiness.readiness === "missing" ? ["roster" as const] : []),
    ...(divisionReadiness.readiness === "missing" ? ["divisions" as const] : []),
    ...(championshipReadiness.readiness === "missing" ? ["championships" as const] : []),
    ...(draftReadiness.readiness === "missing" ? ["draft-readiness" as const] : [])
  ]);
  const componentReadiness = [
    setupReadiness,
    brandReadiness,
    managerReadiness,
    rosterReadiness,
    divisionReadiness,
    championshipReadiness,
    draftReadiness
  ];

  return Object.freeze({
    status: "diagnostics-only",
    setupReadiness,
    brandReadiness,
    managerReadiness,
    rosterReadiness,
    divisionReadiness,
    championshipReadiness,
    draftReadiness,
    missingStructuralPieces,
    overallSetupReadiness: createOverallSetupReadiness(
      missingStructuralPieces,
      componentReadiness
    ),
    gameplayAffecting: false,
    playerFacing: false
  });
}

function summarizeSingleShell<TShell extends ReadinessShell>(
  shell: TShell | undefined,
  missingIssue: string,
  getShellId: (shell: TShell) => EntityId
): GameSetupReadinessComponentSummary {
  if (!shell) {
    return createComponentSummary("missing", [], [missingIssue]);
  }

  return createComponentSummary(
    shell.readiness.structurallyReady ? "structurally-ready" : "structural-issues",
    freezeShellIds([getShellId(shell)]),
    shell.readiness.issues
  );
}

function summarizeShellCollection<TShell extends ReadinessShell>(
  shells: readonly TShell[] | undefined,
  missingIssue: string,
  getShellId: (shell: TShell) => EntityId
): GameSetupReadinessComponentSummary {
  if (!shells || shells.length === 0) {
    return createComponentSummary("missing", [], [missingIssue]);
  }

  const issues = shells.flatMap((shell) => shell.readiness.issues);

  return createComponentSummary(
    issues.length === 0 ? "structurally-ready" : "structural-issues",
    freezeShellIds(shells.map(getShellId)),
    issues
  );
}

function summarizeDraftReadiness(
  draftReadiness: DraftReadinessSummaryShell | undefined
): GameSetupReadinessComponentSummary {
  if (!draftReadiness) {
    return createComponentSummary("missing", [], ["missing-draft-readiness-summary-shell"]);
  }

  return createComponentSummary(
    draftReadiness.overallDraftReadiness === "structurally-ready"
      ? "structurally-ready"
      : "structural-issues",
    [],
    [
      ...draftReadiness.draftPoolReadiness.issues,
      ...draftReadiness.draftOrderReadiness.issues,
      ...draftReadiness.draftPickReadiness.issues,
      ...draftReadiness.draftSessionReadiness.issues
    ]
  );
}

function createComponentSummary(
  readiness: GameSetupReadinessState,
  shellIds: readonly EntityId[],
  issues: readonly string[]
): GameSetupReadinessComponentSummary {
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

function createOverallSetupReadiness(
  missingStructuralPieces: readonly GameSetupReadinessStructuralPiece[],
  componentReadiness: readonly GameSetupReadinessComponentSummary[]
): OverallGameSetupReadiness {
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

interface ReadinessShell {
  readonly readiness: {
    readonly structurallyReady: boolean;
    readonly issues: readonly string[];
  };
}
