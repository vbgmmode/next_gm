export type NewGMModeDraftCompletionBlockedReasonCatalogId =
  | "roster-state-object-invalid"
  | "roster-state-status-not-completable"
  | "roster-completeness-unavailable"
  | "brand-roster-minimum-unavailable"
  | "duplicate-membership-check-unavailable"
  | "championship-division-setup-unavailable"
  | "save-identity-unavailable"
  | "persistence-unavailable"
  | "gameplay-start-unavailable"
  | "draft-completion-not-implemented";

export interface NewGMModeDraftCompletionBlockedReasonCatalogEntry {
  readonly id: NewGMModeDraftCompletionBlockedReasonCatalogId;
  readonly slug: NewGMModeDraftCompletionBlockedReasonCatalogId;
  readonly staticCatalogOnly: true;
  readonly evaluatedNow: false;
}

export interface NewGMModeDraftCompletionBlockedReasonCatalog {
  readonly catalogId: "new-gm-mode-draft-completion-blocked-reason-catalog-v0.1";
  readonly version: "0.1";
  readonly domainObject: true;
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly mutable: false;
  readonly deterministicOrdering: true;
  readonly staticCatalogOnly: true;
  readonly evaluatedNow: false;
  readonly blockedReasonIds: readonly NewGMModeDraftCompletionBlockedReasonCatalogId[];
  readonly blockedReasons: readonly NewGMModeDraftCompletionBlockedReasonCatalogEntry[];
}

const BLOCKED_REASON_IDS: readonly NewGMModeDraftCompletionBlockedReasonCatalogId[] =
  Object.freeze([
    "roster-state-object-invalid",
    "roster-state-status-not-completable",
    "roster-completeness-unavailable",
    "brand-roster-minimum-unavailable",
    "duplicate-membership-check-unavailable",
    "championship-division-setup-unavailable",
    "save-identity-unavailable",
    "persistence-unavailable",
    "gameplay-start-unavailable",
    "draft-completion-not-implemented"
  ]);

export function createNewGMModeDraftCompletionBlockedReasonCatalog(): NewGMModeDraftCompletionBlockedReasonCatalog {
  return Object.freeze({
    catalogId: "new-gm-mode-draft-completion-blocked-reason-catalog-v0.1",
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
