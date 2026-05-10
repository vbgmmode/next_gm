export type NewGMModeRosterStateBlockedReasonCatalogId =
  | "assignment-result-object-invalid"
  | "assignment-result-status-not-state-ready"
  | "brand-roster-reference-missing"
  | "wrestler-membership-reference-missing"
  | "roster-capacity-rules-unavailable"
  | "duplicate-membership-rules-unavailable"
  | "division-reference-unavailable"
  | "championship-adjacency-unavailable"
  | "persistence-unavailable"
  | "roster-state-creation-not-implemented";

export interface NewGMModeRosterStateBlockedReasonCatalogEntry {
  readonly id: NewGMModeRosterStateBlockedReasonCatalogId;
  readonly slug: NewGMModeRosterStateBlockedReasonCatalogId;
  readonly staticCatalogOnly: true;
  readonly evaluatedNow: false;
}

export interface NewGMModeRosterStateBlockedReasonCatalog {
  readonly catalogId: "new-gm-mode-roster-state-blocked-reason-catalog-v0.1";
  readonly version: "0.1";
  readonly domainObject: true;
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly mutable: false;
  readonly deterministicOrdering: true;
  readonly staticCatalogOnly: true;
  readonly evaluatedNow: false;
  readonly blockedReasonIds: readonly NewGMModeRosterStateBlockedReasonCatalogId[];
  readonly blockedReasons: readonly NewGMModeRosterStateBlockedReasonCatalogEntry[];
}

const BLOCKED_REASON_IDS: readonly NewGMModeRosterStateBlockedReasonCatalogId[] =
  Object.freeze([
    "assignment-result-object-invalid",
    "assignment-result-status-not-state-ready",
    "brand-roster-reference-missing",
    "wrestler-membership-reference-missing",
    "roster-capacity-rules-unavailable",
    "duplicate-membership-rules-unavailable",
    "division-reference-unavailable",
    "championship-adjacency-unavailable",
    "persistence-unavailable",
    "roster-state-creation-not-implemented"
  ]);

export function createNewGMModeRosterStateBlockedReasonCatalog(): NewGMModeRosterStateBlockedReasonCatalog {
  return Object.freeze({
    catalogId: "new-gm-mode-roster-state-blocked-reason-catalog-v0.1",
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
