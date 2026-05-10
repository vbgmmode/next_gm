import type { EntityId } from "../domain/index.ts";
import type { BookedShowMatch, ShowEngineInput } from "./showEngine.contracts.ts";

export type ShowExecutionOrderStatus = "empty" | "ordered" | "inferred" | "partial" | "invalid";

export type ShowExecutionOrderConfidenceBand = "unknown" | "low" | "moderate" | "strong";

export type ShowExecutionOrderIssue =
  | "no-booked-matches"
  | "array-order-inferred"
  | "explicit-order-present"
  | "partial-explicit-order"
  | "duplicate-order-indexes"
  | "missing-match-ids"
  | "missing-booked-match-ids";

export interface ShowExecutionOrderEntry {
  bookedMatchId: EntityId;
  matchId: EntityId;
  position: number;
  isOpener: boolean;
  isMainEvent: boolean;
}

export interface ShowExecutionOrderPlan {
  status: ShowExecutionOrderStatus;
  confidence: ShowExecutionOrderConfidenceBand;
  orderedMatchIds: readonly EntityId[];
  openerMatchId?: EntityId;
  mainEventMatchId?: EntityId;
  issues: readonly ShowExecutionOrderIssue[];
  entries: readonly ShowExecutionOrderEntry[];
}

interface IndexedBookedShowMatch {
  bookedMatch: BookedShowMatch;
  originalIndex: number;
}

export function createShowExecutionOrder(input: ShowEngineInput): ShowExecutionOrderPlan {
  if (input.bookedMatches.length === 0) {
    return {
      status: "empty",
      confidence: "unknown",
      orderedMatchIds: [],
      issues: ["no-booked-matches"],
      entries: []
    };
  }

  const indexedMatches = input.bookedMatches.map((bookedMatch, originalIndex) => ({
    bookedMatch,
    originalIndex
  }));
  const orderedMatches = orderBookedMatches(indexedMatches);
  const issues = collectIssues(input.bookedMatches);
  const executableEntries = orderedMatches.filter(
    ({ bookedMatch }) => bookedMatch.matchInput.match.id.length > 0
  );
  const openerMatchId = executableEntries[0]?.bookedMatch.matchInput.match.id;
  const mainEventMatchId =
    executableEntries.length > 0
      ? executableEntries[executableEntries.length - 1].bookedMatch.matchInput.match.id
      : undefined;
  const entries = orderedMatches.map(({ bookedMatch }, index) => ({
    bookedMatchId: bookedMatch.id,
    matchId: bookedMatch.matchInput.match.id,
    position: index + 1,
    isOpener:
      openerMatchId !== undefined && bookedMatch.matchInput.match.id === openerMatchId,
    isMainEvent:
      mainEventMatchId !== undefined && bookedMatch.matchInput.match.id === mainEventMatchId
  }));

  return {
    status: statusFor(input.bookedMatches, issues),
    confidence: confidenceFor(input.bookedMatches, issues),
    orderedMatchIds: entries.map((entry) => entry.matchId),
    openerMatchId,
    mainEventMatchId,
    issues,
    entries
  };
}

export function getBookedMatchesInExecutionOrder(
  input: ShowEngineInput,
  executionOrder: ShowExecutionOrderPlan
): readonly BookedShowMatch[] {
  const remainingMatches = [...input.bookedMatches];

  return executionOrder.entries.flatMap((entry) => {
    const matchIndex = remainingMatches.findIndex(
      (bookedMatch) =>
        bookedMatch.id === entry.bookedMatchId &&
        bookedMatch.matchInput.match.id === entry.matchId
    );

    if (matchIndex === -1) {
      return [];
    }

    const [bookedMatch] = remainingMatches.splice(matchIndex, 1);
    return [bookedMatch];
  });
}

function orderBookedMatches(
  indexedMatches: readonly IndexedBookedShowMatch[]
): readonly IndexedBookedShowMatch[] {
  const hasExplicitOrder = indexedMatches.some(
    ({ bookedMatch }) => bookedMatch.orderIndex !== undefined
  );

  if (!hasExplicitOrder) {
    return [...indexedMatches];
  }

  return [...indexedMatches].sort((left, right) => {
    const leftOrder = left.bookedMatch.orderIndex ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = right.bookedMatch.orderIndex ?? Number.MAX_SAFE_INTEGER;

    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    return left.originalIndex - right.originalIndex;
  });
}

function collectIssues(bookedMatches: readonly BookedShowMatch[]): ShowExecutionOrderIssue[] {
  const issues = new Set<ShowExecutionOrderIssue>();
  const explicitOrderIndexes = bookedMatches
    .map((bookedMatch) => bookedMatch.orderIndex)
    .filter((orderIndex): orderIndex is number => orderIndex !== undefined);

  if (explicitOrderIndexes.length > 0) {
    issues.add("explicit-order-present");
  } else {
    issues.add("array-order-inferred");
  }

  if (explicitOrderIndexes.length > 0 && explicitOrderIndexes.length < bookedMatches.length) {
    issues.add("partial-explicit-order");
  }

  if (explicitOrderIndexes.some((orderIndex, index) => explicitOrderIndexes.indexOf(orderIndex) !== index)) {
    issues.add("duplicate-order-indexes");
  }

  if (bookedMatches.some((bookedMatch) => bookedMatch.matchInput.match.id.length === 0)) {
    issues.add("missing-match-ids");
  }

  if (bookedMatches.some((bookedMatch) => bookedMatch.id.length === 0)) {
    issues.add("missing-booked-match-ids");
  }

  return [...issues];
}

function statusFor(
  bookedMatches: readonly BookedShowMatch[],
  issues: readonly ShowExecutionOrderIssue[]
): ShowExecutionOrderStatus {
  if (bookedMatches.length === 0) {
    return "empty";
  }

  if (issues.includes("missing-match-ids") || issues.includes("missing-booked-match-ids")) {
    return "invalid";
  }

  if (
    issues.includes("partial-explicit-order") ||
    issues.includes("duplicate-order-indexes")
  ) {
    return "partial";
  }

  if (issues.includes("explicit-order-present")) {
    return "ordered";
  }

  return "inferred";
}

function confidenceFor(
  bookedMatches: readonly BookedShowMatch[],
  issues: readonly ShowExecutionOrderIssue[]
): ShowExecutionOrderConfidenceBand {
  if (bookedMatches.length === 0) {
    return "unknown";
  }

  if (issues.includes("missing-match-ids") || issues.includes("missing-booked-match-ids")) {
    return "low";
  }

  if (
    issues.includes("partial-explicit-order") ||
    issues.includes("duplicate-order-indexes")
  ) {
    return "moderate";
  }

  return "strong";
}
