export type NewGMModeDraftPickRosterAssignmentBlockedReasonCatalogId =
  | "execution-result-object-invalid"
  | "execution-result-status-not-assignable"
  | "candidate-reference-missing"
  | "wrestler-reference-missing"
  | "brand-reference-missing"
  | "roster-capacity-unavailable"
  | "duplicate-roster-membership-check-unavailable"
  | "division-championship-adjacency-unavailable"
  | "roster-state-unavailable"
  | "roster-assignment-not-implemented";

export interface NewGMModeDraftPickRosterAssignmentBlockedReasonCatalogEntry {
  readonly id: NewGMModeDraftPickRosterAssignmentBlockedReasonCatalogId;
  readonly slug: NewGMModeDraftPickRosterAssignmentBlockedReasonCatalogId;
  readonly staticCatalogOnly: true;
  readonly evaluatedNow: false;
}

export interface NewGMModeDraftPickRosterAssignmentBlockedReasonCatalog {
  readonly catalogId: "new-gm-mode-draft-pick-roster-assignment-blocked-reason-catalog-v0.1";
  readonly version: "0.1";
  readonly domainObject: true;
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly mutable: false;
  readonly deterministicOrdering: true;
  readonly staticCatalogOnly: true;
  readonly evaluatedNow: false;
  readonly blockedReasonIds: readonly NewGMModeDraftPickRosterAssignmentBlockedReasonCatalogId[];
  readonly blockedReasons: readonly NewGMModeDraftPickRosterAssignmentBlockedReasonCatalogEntry[];
}

const BLOCKED_REASON_IDS: readonly NewGMModeDraftPickRosterAssignmentBlockedReasonCatalogId[] =
  Object.freeze([
    "execution-result-object-invalid",
    "execution-result-status-not-assignable",
    "candidate-reference-missing",
    "wrestler-reference-missing",
    "brand-reference-missing",
    "roster-capacity-unavailable",
    "duplicate-roster-membership-check-unavailable",
    "division-championship-adjacency-unavailable",
    "roster-state-unavailable",
    "roster-assignment-not-implemented"
  ]);

export function createNewGMModeDraftPickRosterAssignmentBlockedReasonCatalog(): NewGMModeDraftPickRosterAssignmentBlockedReasonCatalog {
  return Object.freeze({
    catalogId:
      "new-gm-mode-draft-pick-roster-assignment-blocked-reason-catalog-v0.1",
    version: "0.1",
    domainObject: true,
    diagnosticsOnly: true,
    playerFacing: false,
    gameplayAffecting: false,
    mutable: false,
    deterministicOrdering: true,
    staticCatalogOnly: true,
    evaluatedNow: false,
    blockedReasonIds: BLOCKED_REASON_IDS,
    blockedReasons: Object.freeze(
      BLOCKED_REASON_IDS.map((id) =>
        Object.freeze({
          id,
          slug: id,
          staticCatalogOnly: true,
          evaluatedNow: false
        })
      )
    )
  });
}
