import type { MatchResultShell, MatchResultShellStatus } from "./matchResultShell.ts";

export type MatchResultExecutionGateStatus = "closed" | "open" | "blocked" | "pending";

export type MatchResultExecutionGateSeverity = "none" | "low" | "moderate" | "high";

export type MatchResultExecutionGateReason =
  | "result-shell-ready"
  | "result-shell-blocked"
  | "result-shell-pending"
  | "result-shell-unavailable";

export interface MatchResultExecutionGate {
  status: MatchResultExecutionGateStatus;
  severity: MatchResultExecutionGateSeverity;
  reasons: readonly MatchResultExecutionGateReason[];
  requiredShellStatus: "ready_for_execution";
  observedShellStatus: MatchResultShellStatus;
  canExecuteResult: boolean;
}

export function createMatchResultExecutionGate(
  resultShell: MatchResultShell
): MatchResultExecutionGate {
  switch (resultShell.status) {
    case "ready_for_execution":
      return createGate("open", "none", "result-shell-ready", resultShell.status, true);
    case "blocked":
      return createGate("blocked", "high", "result-shell-blocked", resultShell.status, false);
    case "pending":
      return createGate("pending", "moderate", "result-shell-pending", resultShell.status, false);
    case "unavailable":
      return createGate("closed", "high", "result-shell-unavailable", resultShell.status, false);
  }
}

function createGate(
  status: MatchResultExecutionGateStatus,
  severity: MatchResultExecutionGateSeverity,
  reason: MatchResultExecutionGateReason,
  observedShellStatus: MatchResultShellStatus,
  canExecuteResult: boolean
): MatchResultExecutionGate {
  return {
    status,
    severity,
    reasons: [reason],
    requiredShellStatus: "ready_for_execution",
    observedShellStatus,
    canExecuteResult
  };
}
