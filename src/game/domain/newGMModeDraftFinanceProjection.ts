import {
  createNewGMModeDraftPickCandidateObjects,
  type NewGMModeDraftPickCandidateObject,
  type NewGMModeDraftPickCandidateObjectSet
} from "./newGMModeDraftPickCandidateObject.ts";
import { createNewGMModeStaticWrestlerFixtureCatalogShell } from "./newGMModeStaticWrestlerFixtureCatalogShell.ts";

export type NewGMModeDraftFinanceProjectionTier =
  | "Franchise"
  | "Main Event"
  | "Upper Card"
  | "Mid Card"
  | "Prospect"
  | "Specialist";

export type NewGMModeDraftFinanceProjectionAffordabilityStatus =
  | "affordable"
  | "expensive-but-affordable"
  | "not-affordable"
  | "locked-pending-rules"
  | "already-drafted-signed";

export interface NewGMModeDraftFinanceProjectionCandidate {
  readonly candidateObjectId: string;
  readonly sourceFixtureId: string;
  readonly sourceWrestlerId: string;
  readonly fixtureSlug: string;
  readonly displayName: string;
  readonly projectedSigningTier: NewGMModeDraftFinanceProjectionTier;
  readonly projectedSigningCost: number;
  readonly startingDraftBudget: 100;
  readonly remainingDraftBudgetPreview: number;
  readonly budgetPreviewAfterSigning: number;
  readonly affordabilityStatus: NewGMModeDraftFinanceProjectionAffordabilityStatus;
  readonly readOnly: true;
  readonly placeholderOnly: true;
  readonly budgetMutated: false;
  readonly persisted: false;
  readonly playerFacingSafeDisplay: true;
  readonly hiddenFormulaExposedToPlayer: false;
  readonly rawEngineValuesExposedToPlayer: false;
  readonly backendDiagnosticsExposedToPlayer: false;
  readonly displayLabels: {
    readonly tierLine: string;
    readonly costLine: string;
    readonly afterSigningLine: string;
    readonly affordabilityLine: string;
    readonly noteLine: string;
  };
}

export interface NewGMModeDraftFinanceProjection {
  readonly projectionId: "new-gm-mode-draft-finance-projection-v0.1";
  readonly version: "0.1";
  readonly projectionKind: "finance-aware-draft-read-only-projection";
  readonly domainObject: true;
  readonly diagnosticsOnly: false;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly mutable: false;
  readonly localOnly: true;
  readonly inMemoryOnly: true;
  readonly readOnly: true;
  readonly persisted: false;
  readonly deterministicOrdering: true;
  readonly placeholderTuning: {
    readonly tuningId: "finance-aware-draft-v0.1-placeholder-tuning";
    readonly placeholderOnly: true;
    readonly finalEconomyBalance: false;
    readonly startingDraftBudget: 100;
    readonly minimumRosterTarget: 16;
    readonly tierCosts: Readonly<Record<NewGMModeDraftFinanceProjectionTier, number>>;
  };
  readonly rosterAffordabilityPrinciple: {
    readonly minimumRosterTarget: 16;
    readonly startingDraftBudget: 100;
    readonly baselineViableTier: "Mid Card";
    readonly baselineCostPerSigning: 5;
    readonly baselineRosterCostPreview: 80;
    readonly canMeetMinimumRosterTargetWithMixedLowerMidTiers: true;
    readonly displayLabel: "Starting budget supports at least 16 superstars when the player mixes lower and mid tiers wisely.";
  };
  readonly remainingDraftBudgetPreview: number;
  readonly selectedCandidateProjection: NewGMModeDraftFinanceProjectionCandidate | undefined;
  readonly candidateProjections: readonly NewGMModeDraftFinanceProjectionCandidate[];
  readonly capabilityFlags: {
    readonly canProjectFinanceDisplay: true;
    readonly canMutateBudget: false;
    readonly canDeductBudget: false;
    readonly canPersistGameplayPayload: false;
    readonly canUseBrowserStorage: false;
    readonly canCallBackend: false;
    readonly canWriteDatabase: false;
    readonly canStartGameplay: false;
    readonly canInitializeWeekOne: false;
    readonly canCreateGeneratedText: false;
    readonly canUseGenAI: false;
  };
  readonly displayLabels: {
    readonly startingBudgetLine: "Starting Budget: 100";
    readonly remainingBudgetLine: string;
    readonly financePreviewOnlyLine: "Finance preview only. Budget spend is not active yet.";
  };
}

export interface NewGMModeDraftFinanceProjectionInput {
  readonly candidateObjectSet?: NewGMModeDraftPickCandidateObjectSet;
  readonly selectedCandidateId?: string;
  readonly remainingDraftBudgetPreview?: number;
  readonly alreadyDraftedCandidateIds?: readonly string[];
}

export const NEW_GM_MODE_DRAFT_FINANCE_STARTING_BUDGET_PLACEHOLDER = 100;
export const NEW_GM_MODE_DRAFT_FINANCE_MINIMUM_ROSTER_TARGET_PLACEHOLDER = 16;

export const NEW_GM_MODE_DRAFT_FINANCE_PLACEHOLDER_TIER_COSTS: Readonly<
  Record<NewGMModeDraftFinanceProjectionTier, number>
> = Object.freeze({
  Franchise: 18,
  "Main Event": 12,
  "Upper Card": 8,
  "Mid Card": 5,
  Prospect: 3,
  Specialist: 4
});

const PLACEHOLDER_TIER_BY_WRESTLER_ID: Readonly<
  Record<string, NewGMModeDraftFinanceProjectionTier>
> = Object.freeze({
  "fixture-wrestler-001-ace-mercer": "Franchise",
  "fixture-wrestler-002-bruno-vale": "Upper Card",
  "fixture-wrestler-003-cassian-ryde": "Prospect",
  "fixture-wrestler-004-dante-cross": "Specialist",
  "fixture-wrestler-005-elena-voss": "Main Event",
  "fixture-wrestler-006-fiona-hale": "Upper Card",
  "fixture-wrestler-007-gia-stone": "Prospect",
  "fixture-wrestler-008-hana-reyes": "Mid Card",
  "fixture-wrestler-009-ivan-north": "Upper Card",
  "fixture-wrestler-010-jules-kade": "Prospect"
});

export function createNewGMModeDraftFinanceProjection(
  input: NewGMModeDraftFinanceProjectionInput = {}
): NewGMModeDraftFinanceProjection {
  const candidateObjectSet =
    input.candidateObjectSet ?? createNewGMModeDraftPickCandidateObjects();
  const remainingDraftBudgetPreview = readFiniteNumber(
    input.remainingDraftBudgetPreview,
    NEW_GM_MODE_DRAFT_FINANCE_STARTING_BUDGET_PLACEHOLDER
  );
  const alreadyDraftedCandidateIds = Object.freeze([
    ...(input.alreadyDraftedCandidateIds ?? [])
  ]);
  const candidateProjections = candidateObjectSet.candidates.map((candidate) =>
    createCandidateProjection({
      candidate,
      remainingDraftBudgetPreview,
      alreadyDraftedCandidateIds
    })
  );
  const selectedCandidateId = readString(input.selectedCandidateId);
  const selectedCandidateProjection = selectedCandidateId
    ? candidateProjections.find((candidate) =>
        candidateMatchesSelectedId(candidate, selectedCandidateId)
      )
    : undefined;

  return Object.freeze({
    projectionId: "new-gm-mode-draft-finance-projection-v0.1",
    version: "0.1",
    projectionKind: "finance-aware-draft-read-only-projection",
    domainObject: true,
    diagnosticsOnly: false,
    playerFacing: false,
    gameplayAffecting: false,
    mutable: false,
    localOnly: true,
    inMemoryOnly: true,
    readOnly: true,
    persisted: false,
    deterministicOrdering: true,
    placeholderTuning: Object.freeze({
      tuningId: "finance-aware-draft-v0.1-placeholder-tuning",
      placeholderOnly: true,
      finalEconomyBalance: false,
      startingDraftBudget: NEW_GM_MODE_DRAFT_FINANCE_STARTING_BUDGET_PLACEHOLDER,
      minimumRosterTarget:
        NEW_GM_MODE_DRAFT_FINANCE_MINIMUM_ROSTER_TARGET_PLACEHOLDER,
      tierCosts: NEW_GM_MODE_DRAFT_FINANCE_PLACEHOLDER_TIER_COSTS
    }),
    rosterAffordabilityPrinciple: Object.freeze({
      minimumRosterTarget:
        NEW_GM_MODE_DRAFT_FINANCE_MINIMUM_ROSTER_TARGET_PLACEHOLDER,
      startingDraftBudget: NEW_GM_MODE_DRAFT_FINANCE_STARTING_BUDGET_PLACEHOLDER,
      baselineViableTier: "Mid Card",
      baselineCostPerSigning:
        NEW_GM_MODE_DRAFT_FINANCE_PLACEHOLDER_TIER_COSTS["Mid Card"],
      baselineRosterCostPreview:
        NEW_GM_MODE_DRAFT_FINANCE_PLACEHOLDER_TIER_COSTS["Mid Card"] *
        NEW_GM_MODE_DRAFT_FINANCE_MINIMUM_ROSTER_TARGET_PLACEHOLDER,
      canMeetMinimumRosterTargetWithMixedLowerMidTiers: true,
      displayLabel:
        "Starting budget supports at least 16 superstars when the player mixes lower and mid tiers wisely."
    }),
    remainingDraftBudgetPreview,
    selectedCandidateProjection,
    candidateProjections: Object.freeze(candidateProjections),
    capabilityFlags: Object.freeze({
      canProjectFinanceDisplay: true,
      canMutateBudget: false,
      canDeductBudget: false,
      canPersistGameplayPayload: false,
      canUseBrowserStorage: false,
      canCallBackend: false,
      canWriteDatabase: false,
      canStartGameplay: false,
      canInitializeWeekOne: false,
      canCreateGeneratedText: false,
      canUseGenAI: false
    }),
    displayLabels: Object.freeze({
      startingBudgetLine: "Starting Budget: 100",
      remainingBudgetLine: `Remaining Budget Preview: ${remainingDraftBudgetPreview}`,
      financePreviewOnlyLine:
        "Finance preview only. Budget spend is not active yet."
    })
  });
}

function createCandidateProjection(input: {
  readonly candidate: NewGMModeDraftPickCandidateObject;
  readonly remainingDraftBudgetPreview: number;
  readonly alreadyDraftedCandidateIds: readonly string[];
}): NewGMModeDraftFinanceProjectionCandidate {
  const fixtureCatalog = createNewGMModeStaticWrestlerFixtureCatalogShell();
  const fixture =
    fixtureCatalog.fixtures[input.candidate.sourceFixtureReference.fixtureIndex];
  const tier =
    PLACEHOLDER_TIER_BY_WRESTLER_ID[
      input.candidate.wrestlerIdentityReference.wrestlerId
    ] ?? "Mid Card";
  const projectedSigningCost =
    NEW_GM_MODE_DRAFT_FINANCE_PLACEHOLDER_TIER_COSTS[tier];
  const alreadyDrafted = input.alreadyDraftedCandidateIds.some(
    (candidateId) =>
      candidateId === input.candidate.candidateId ||
      candidateId === createUiCandidateId(input.candidate)
  );
  const affordabilityStatus = createAffordabilityStatus({
    cost: projectedSigningCost,
    remainingDraftBudgetPreview: input.remainingDraftBudgetPreview,
    alreadyDrafted
  });
  const budgetPreviewAfterSigning =
    input.remainingDraftBudgetPreview - projectedSigningCost;

  return Object.freeze({
    candidateObjectId: input.candidate.candidateId,
    sourceFixtureId: input.candidate.sourceFixtureReference.fixtureId,
    sourceWrestlerId: input.candidate.wrestlerIdentityReference.wrestlerId,
    fixtureSlug: input.candidate.sourceFixtureReference.fixtureSlug,
    displayName: fixture?.displayName ?? input.candidate.wrestlerIdentityReference.slug,
    projectedSigningTier: tier,
    projectedSigningCost,
    startingDraftBudget: NEW_GM_MODE_DRAFT_FINANCE_STARTING_BUDGET_PLACEHOLDER,
    remainingDraftBudgetPreview: input.remainingDraftBudgetPreview,
    budgetPreviewAfterSigning,
    affordabilityStatus,
    readOnly: true,
    placeholderOnly: true,
    budgetMutated: false,
    persisted: false,
    playerFacingSafeDisplay: true,
    hiddenFormulaExposedToPlayer: false,
    rawEngineValuesExposedToPlayer: false,
    backendDiagnosticsExposedToPlayer: false,
    displayLabels: Object.freeze({
      tierLine: `Projected Cost Tier: ${tier}`,
      costLine: `Projected Signing Cost: ${projectedSigningCost}`,
      afterSigningLine: `Budget Preview After Signing: ${budgetPreviewAfterSigning}`,
      affordabilityLine: formatAffordabilityStatus(affordabilityStatus),
      noteLine: "Finance preview only. Budget spend is not active yet."
    })
  });
}

function createAffordabilityStatus(input: {
  readonly cost: number;
  readonly remainingDraftBudgetPreview: number;
  readonly alreadyDrafted: boolean;
}): NewGMModeDraftFinanceProjectionAffordabilityStatus {
  if (input.alreadyDrafted) {
    return "already-drafted-signed";
  }

  if (input.remainingDraftBudgetPreview < input.cost) {
    return "not-affordable";
  }

  if (input.cost >= NEW_GM_MODE_DRAFT_FINANCE_PLACEHOLDER_TIER_COSTS["Main Event"]) {
    return "expensive-but-affordable";
  }

  return "affordable";
}

function formatAffordabilityStatus(
  status: NewGMModeDraftFinanceProjectionAffordabilityStatus
): string {
  if (status === "expensive-but-affordable") {
    return "Expensive but affordable in preview";
  }

  if (status === "not-affordable") {
    return "Not affordable in preview";
  }

  if (status === "already-drafted-signed") {
    return "Already drafted in this local preview";
  }

  if (status === "locked-pending-rules") {
    return "Locked pending finance rules";
  }

  return "Affordable in preview";
}

function candidateMatchesSelectedId(
  candidate: NewGMModeDraftFinanceProjectionCandidate,
  selectedCandidateId: string
): boolean {
  return (
    selectedCandidateId === candidate.candidateObjectId ||
    selectedCandidateId === candidate.sourceFixtureId ||
    selectedCandidateId === candidate.sourceWrestlerId ||
    selectedCandidateId === createUiCandidateIdFromSlug(candidate.fixtureSlug)
  );
}

function createUiCandidateId(candidate: NewGMModeDraftPickCandidateObject): string {
  return createUiCandidateIdFromSlug(candidate.sourceFixtureReference.fixtureSlug);
}

function createUiCandidateIdFromSlug(slug: string): string {
  return `candidate-${slug.replace(/^fixture-wrestler-\d+-/, "")}`;
}

function readFiniteNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}
