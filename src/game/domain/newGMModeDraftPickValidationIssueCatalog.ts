export type NewGMModeDraftPickValidationIssueCatalogId =
  | "candidate-reference-missing"
  | "candidate-not-found"
  | "candidate-ineligible"
  | "selection-intent-invalid"
  | "draft-order-invalid"
  | "brand-context-invalid"
  | "duplicate-pick-blocked"
  | "roster-capacity-blocked"
  | "draft-state-unavailable"
  | "validation-not-implemented";

export interface NewGMModeDraftPickValidationIssueCatalogEntry {
  readonly id: NewGMModeDraftPickValidationIssueCatalogId;
  readonly slug: NewGMModeDraftPickValidationIssueCatalogId;
  readonly futureOnly: true;
  readonly evaluatedNow: false;
}

export interface NewGMModeDraftPickValidationIssueCatalog {
  readonly draftPickValidationIssueCatalogId: "new-gm-mode-draft-pick-validation-issue-catalog-v0.1";
  readonly version: "0.1";
  readonly domainObject: true;
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly mutable: false;
  readonly deterministicOrdering: true;
  readonly staticCatalog: true;
  readonly evaluatedNow: false;
  readonly issueIds: readonly NewGMModeDraftPickValidationIssueCatalogId[];
  readonly issues: readonly NewGMModeDraftPickValidationIssueCatalogEntry[];
}

const ISSUE_IDS: readonly NewGMModeDraftPickValidationIssueCatalogId[] =
  Object.freeze([
    "candidate-reference-missing",
    "candidate-not-found",
    "candidate-ineligible",
    "selection-intent-invalid",
    "draft-order-invalid",
    "brand-context-invalid",
    "duplicate-pick-blocked",
    "roster-capacity-blocked",
    "draft-state-unavailable",
    "validation-not-implemented"
  ]);

export function createNewGMModeDraftPickValidationIssueCatalog(): NewGMModeDraftPickValidationIssueCatalog {
  return Object.freeze({
    draftPickValidationIssueCatalogId:
      "new-gm-mode-draft-pick-validation-issue-catalog-v0.1",
    version: "0.1",
    domainObject: true,
    diagnosticsOnly: true,
    playerFacing: false,
    gameplayAffecting: false,
    mutable: false,
    deterministicOrdering: true,
    staticCatalog: true,
    evaluatedNow: false,
    issueIds: ISSUE_IDS,
    issues: Object.freeze(
      ISSUE_IDS.map((id) =>
        Object.freeze({
          id,
          slug: id,
          futureOnly: true,
          evaluatedNow: false
        })
      )
    )
  });
}
