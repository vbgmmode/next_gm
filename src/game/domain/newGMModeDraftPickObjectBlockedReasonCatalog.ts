export type NewGMModeDraftPickObjectBlockedReasonCatalogId =
  | "validation-result-object-invalid"
  | "validation-result-status-not-approved"
  | "candidate-reference-missing"
  | "selection-intent-reference-missing"
  | "draft-order-reference-missing"
  | "brand-context-reference-missing"
  | "draft-state-unavailable"
  | "duplicate-pick-check-unavailable"
  | "roster-assignment-unavailable"
  | "draft-pick-creation-not-implemented";

export interface NewGMModeDraftPickObjectBlockedReasonCatalogEntry {
  readonly id: NewGMModeDraftPickObjectBlockedReasonCatalogId;
  readonly slug: NewGMModeDraftPickObjectBlockedReasonCatalogId;
  readonly staticCatalogOnly: true;
  readonly evaluatedNow: false;
}

export interface NewGMModeDraftPickObjectBlockedReasonCatalog {
  readonly catalogId: "new-gm-mode-draft-pick-object-blocked-reason-catalog-v0.1";
  readonly version: "0.1";
  readonly domainObject: true;
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly mutable: false;
  readonly deterministicOrdering: true;
  readonly staticCatalogOnly: true;
  readonly evaluatedNow: false;
  readonly blockedReasonIds: readonly NewGMModeDraftPickObjectBlockedReasonCatalogId[];
  readonly blockedReasons: readonly NewGMModeDraftPickObjectBlockedReasonCatalogEntry[];
}

const BLOCKED_REASON_IDS: readonly NewGMModeDraftPickObjectBlockedReasonCatalogId[] =
  Object.freeze([
    "validation-result-object-invalid",
    "validation-result-status-not-approved",
    "candidate-reference-missing",
    "selection-intent-reference-missing",
    "draft-order-reference-missing",
    "brand-context-reference-missing",
    "draft-state-unavailable",
    "duplicate-pick-check-unavailable",
    "roster-assignment-unavailable",
    "draft-pick-creation-not-implemented"
  ]);

export function createNewGMModeDraftPickObjectBlockedReasonCatalog(): NewGMModeDraftPickObjectBlockedReasonCatalog {
  return Object.freeze({
    catalogId: "new-gm-mode-draft-pick-object-blocked-reason-catalog-v0.1",
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
