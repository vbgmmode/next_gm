export type NewGMModeDraftPickExecutionBlockedReasonCatalogId =
  | "draft-pick-object-invalid"
  | "draft-pick-status-not-executable"
  | "draft-state-unavailable"
  | "pick-order-invalid"
  | "duplicate-pick-check-unavailable"
  | "roster-assignment-unavailable"
  | "transaction-safety-unavailable"
  | "rollback-unavailable"
  | "persistence-unavailable"
  | "draft-pick-execution-not-implemented";

export interface NewGMModeDraftPickExecutionBlockedReasonCatalogEntry {
  readonly id: NewGMModeDraftPickExecutionBlockedReasonCatalogId;
  readonly slug: NewGMModeDraftPickExecutionBlockedReasonCatalogId;
  readonly staticCatalogOnly: true;
  readonly evaluatedNow: false;
}

export interface NewGMModeDraftPickExecutionBlockedReasonCatalog {
  readonly catalogId: "new-gm-mode-draft-pick-execution-blocked-reason-catalog-v0.1";
  readonly version: "0.1";
  readonly domainObject: true;
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly mutable: false;
  readonly deterministicOrdering: true;
  readonly staticCatalogOnly: true;
  readonly evaluatedNow: false;
  readonly blockedReasonIds: readonly NewGMModeDraftPickExecutionBlockedReasonCatalogId[];
  readonly blockedReasons: readonly NewGMModeDraftPickExecutionBlockedReasonCatalogEntry[];
}

const BLOCKED_REASON_IDS: readonly NewGMModeDraftPickExecutionBlockedReasonCatalogId[] =
  Object.freeze([
    "draft-pick-object-invalid",
    "draft-pick-status-not-executable",
    "draft-state-unavailable",
    "pick-order-invalid",
    "duplicate-pick-check-unavailable",
    "roster-assignment-unavailable",
    "transaction-safety-unavailable",
    "rollback-unavailable",
    "persistence-unavailable",
    "draft-pick-execution-not-implemented"
  ]);

export function createNewGMModeDraftPickExecutionBlockedReasonCatalog(): NewGMModeDraftPickExecutionBlockedReasonCatalog {
  return Object.freeze({
    catalogId:
      "new-gm-mode-draft-pick-execution-blocked-reason-catalog-v0.1",
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
