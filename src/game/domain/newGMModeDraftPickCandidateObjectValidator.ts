import {
  NEW_GM_MODE_DRAFT_PICK_CANDIDATE_CAPABILITY_FLAGS,
  type NewGMModeDraftPickCandidateCapabilityFlags,
  createNewGMModeDraftPickCandidateObjects
} from "./newGMModeDraftPickCandidateObject.ts";

export type NewGMModeDraftPickCandidateObjectValidationIssueId =
  | "candidate-set-id-invalid"
  | "candidate-list-missing"
  | "candidate-count-not-stable"
  | "eligible-candidate-count-not-stable"
  | "ineligible-candidate-count-not-stable"
  | "candidate-id-missing"
  | "candidate-id-format-invalid"
  | "candidate-id-duplicate"
  | "source-fixture-reference-missing"
  | "wrestler-identity-reference-missing"
  | "eligibility-status-unknown"
  | "readiness-reason-ids-missing"
  | "readiness-reason-id-unknown"
  | "display-readiness-marker-missing"
  | "display-readiness-marker-unknown"
  | "domain-object-flag-invalid"
  | "diagnostics-only-flag-invalid"
  | "player-facing-flag-invalid"
  | "gameplay-affecting-flag-invalid"
  | "mutable-flag-invalid"
  | "capability-flags-missing"
  | "capability-flag-enabled"
  | "forbidden-field-present";

export interface NewGMModeDraftPickCandidateObjectValidationIssue {
  readonly candidateIndex: number | null;
  readonly candidateId?: string;
  readonly fieldId: string;
  readonly issueId: NewGMModeDraftPickCandidateObjectValidationIssueId;
}

export interface NewGMModeDraftPickCandidateObjectValidatorInput {
  readonly candidateSet?: unknown;
}

export interface NewGMModeDraftPickCandidateObjectValidatorResult {
  readonly validatorId: "new-gm-mode-draft-pick-candidate-object-validator-v0.1";
  readonly version: "0.1";
  readonly domainObject: true;
  readonly diagnosticsOnly: false;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly mutable: false;
  readonly validationOnly: true;
  readonly structurallyValid: boolean;
  readonly candidateSummary: {
    readonly totalCandidateCount: number;
    readonly eligibleCandidateCount: number;
    readonly ineligibleCandidateCount: number;
    readonly expectedTotalCandidateCount: 10;
    readonly expectedEligibleCandidateCount: 9;
    readonly expectedIneligibleCandidateCount: 1;
  };
  readonly issueCount: number;
  readonly issues: readonly NewGMModeDraftPickCandidateObjectValidationIssue[];
  readonly capabilityFlags: NewGMModeDraftPickCandidateCapabilityFlags;
}

const EXPECTED_TOTAL_CANDIDATE_COUNT = 10;
const EXPECTED_ELIGIBLE_CANDIDATE_COUNT = 9;
const EXPECTED_INELIGIBLE_CANDIDATE_COUNT = 1;
const CANDIDATE_ID_PREFIX = "new-gm-mode-draft-pick-candidate:";
const KNOWN_ELIGIBILITY_STATUSES = Object.freeze(["eligible", "ineligible"]);
const KNOWN_READINESS_REASON_IDS = Object.freeze([
  "source-fixture-identity-present",
  "source-fixture-display-ready",
  "source-fixture-draft-eligible",
  "source-fixture-available",
  "source-fixture-not-draft-eligible",
  "source-fixture-not-available"
]);
const KNOWN_DISPLAY_READINESS_MARKERS = Object.freeze([
  "display-ready",
  "display-blocked"
]);
const FORBIDDEN_FIELD_IDS = Object.freeze([
  "selectedWrestler",
  "selectedWrestlerId",
  "selectedWrestlerHandled",
  "draftPickId",
  "draftPick",
  "selectionIntent",
  "draftSelectionIntent",
  "rosterAssignment",
  "rosterState",
  "championshipDivision",
  "match",
  "matchState",
  "show",
  "showState",
  "week",
  "weekState",
  "save",
  "savePayload",
  "sqlite",
  "sqliteConnection",
  "ui",
  "generatedText",
  "genAI",
  "genAIClient"
]);

export function createNewGMModeDraftPickCandidateObjectValidator(
  input: NewGMModeDraftPickCandidateObjectValidatorInput = {}
): NewGMModeDraftPickCandidateObjectValidatorResult {
  const candidateSet =
    input.candidateSet ?? createNewGMModeDraftPickCandidateObjects();
  const candidates = readCandidates(candidateSet);
  const issues: NewGMModeDraftPickCandidateObjectValidationIssue[] = [];

  validateCandidateSet(candidateSet, candidates, issues);
  validateCandidateCounts(candidates, issues);
  validateCandidateIds(candidates, issues);
  candidates.forEach((candidate, candidateIndex) => {
    validateCandidate(candidate, candidateIndex, issues);
  });

  return Object.freeze({
    validatorId: "new-gm-mode-draft-pick-candidate-object-validator-v0.1",
    version: "0.1",
    domainObject: true,
    diagnosticsOnly: false,
    playerFacing: false,
    gameplayAffecting: false,
    mutable: false,
    validationOnly: true,
    structurallyValid: issues.length === 0,
    candidateSummary: Object.freeze({
      totalCandidateCount: candidates.length,
      eligibleCandidateCount: candidates.filter(
        (candidate) =>
          isRecord(candidate) && candidate.eligibilityStatus === "eligible"
      ).length,
      ineligibleCandidateCount: candidates.filter(
        (candidate) =>
          isRecord(candidate) && candidate.eligibilityStatus === "ineligible"
      ).length,
      expectedTotalCandidateCount: EXPECTED_TOTAL_CANDIDATE_COUNT,
      expectedEligibleCandidateCount: EXPECTED_ELIGIBLE_CANDIDATE_COUNT,
      expectedIneligibleCandidateCount: EXPECTED_INELIGIBLE_CANDIDATE_COUNT
    }),
    issueCount: issues.length,
    issues: Object.freeze(issues),
    capabilityFlags: NEW_GM_MODE_DRAFT_PICK_CANDIDATE_CAPABILITY_FLAGS
  });
}

function validateCandidateSet(
  candidateSet: unknown,
  candidates: readonly unknown[],
  issues: NewGMModeDraftPickCandidateObjectValidationIssue[]
): void {
  if (!isRecord(candidateSet)) {
    issues.push(
      createIssue(null, undefined, "candidateSet", "candidate-set-id-invalid")
    );
    issues.push(
      createIssue(null, undefined, "candidates", "candidate-list-missing")
    );
    return;
  }

  if (
    candidateSet.draftPickCandidateObjectSetId !==
    "new-gm-mode-draft-pick-candidate-object-set-v0.1"
  ) {
    issues.push(
      createIssue(
        null,
        undefined,
        "draftPickCandidateObjectSetId",
        "candidate-set-id-invalid"
      )
    );
  }

  if (!Array.isArray(candidateSet.candidates)) {
    issues.push(
      createIssue(null, undefined, "candidates", "candidate-list-missing")
    );
  }

  validateDomainFlags(candidateSet, null, undefined, issues);
  validateCapabilityFlags(candidateSet.capabilityFlags, null, undefined, issues);
  validateForbiddenFields(candidateSet, null, undefined, issues);
  void candidates;
}

function validateCandidateCounts(
  candidates: readonly unknown[],
  issues: NewGMModeDraftPickCandidateObjectValidationIssue[]
): void {
  const eligibleCandidateCount = candidates.filter(
    (candidate) =>
      isRecord(candidate) && candidate.eligibilityStatus === "eligible"
  ).length;
  const ineligibleCandidateCount = candidates.filter(
    (candidate) =>
      isRecord(candidate) && candidate.eligibilityStatus === "ineligible"
  ).length;

  if (candidates.length !== EXPECTED_TOTAL_CANDIDATE_COUNT) {
    issues.push(
      createIssue(null, undefined, "candidates", "candidate-count-not-stable")
    );
  }

  if (eligibleCandidateCount !== EXPECTED_ELIGIBLE_CANDIDATE_COUNT) {
    issues.push(
      createIssue(
        null,
        undefined,
        "candidateSummary.eligibleCandidateCount",
        "eligible-candidate-count-not-stable"
      )
    );
  }

  if (ineligibleCandidateCount !== EXPECTED_INELIGIBLE_CANDIDATE_COUNT) {
    issues.push(
      createIssue(
        null,
        undefined,
        "candidateSummary.ineligibleCandidateCount",
        "ineligible-candidate-count-not-stable"
      )
    );
  }
}

function validateCandidateIds(
  candidates: readonly unknown[],
  issues: NewGMModeDraftPickCandidateObjectValidationIssue[]
): void {
  const candidateIdsSeen = new Set<string>();

  candidates.forEach((candidate, candidateIndex) => {
    const candidateId = readCandidateId(candidate);

    if (!candidateId) {
      issues.push(
        createIssue(candidateIndex, undefined, "candidateId", "candidate-id-missing")
      );
      return;
    }

    if (!candidateId.startsWith(CANDIDATE_ID_PREFIX)) {
      issues.push(
        createIssue(
          candidateIndex,
          candidateId,
          "candidateId",
          "candidate-id-format-invalid"
        )
      );
    }

    if (candidateIdsSeen.has(candidateId)) {
      issues.push(
        createIssue(
          candidateIndex,
          candidateId,
          "candidateId",
          "candidate-id-duplicate"
        )
      );
    } else {
      candidateIdsSeen.add(candidateId);
    }
  });
}

function validateCandidate(
  candidate: unknown,
  candidateIndex: number,
  issues: NewGMModeDraftPickCandidateObjectValidationIssue[]
): void {
  const candidateId = readCandidateId(candidate);

  if (!isRecord(candidate)) {
    issues.push(
      createIssue(candidateIndex, undefined, "candidate", "candidate-id-missing")
    );
    return;
  }

  validateSourceFixtureReference(candidate, candidateIndex, candidateId, issues);
  validateWrestlerIdentityReference(candidate, candidateIndex, candidateId, issues);
  validateEligibilityStatus(candidate, candidateIndex, candidateId, issues);
  validateReadinessReasonIds(candidate, candidateIndex, candidateId, issues);
  validateDisplayReadinessMarker(candidate, candidateIndex, candidateId, issues);
  validateDomainFlags(candidate, candidateIndex, candidateId, issues);
  validateCapabilityFlags(
    candidate.capabilityFlags,
    candidateIndex,
    candidateId,
    issues
  );
  validateForbiddenFields(candidate, candidateIndex, candidateId, issues);
}

function validateSourceFixtureReference(
  candidate: Record<string, unknown>,
  candidateIndex: number,
  candidateId: string | undefined,
  issues: NewGMModeDraftPickCandidateObjectValidationIssue[]
): void {
  const reference = candidate.sourceFixtureReference;

  if (
    !isRecord(reference) ||
    !readString(reference, "fixtureId") ||
    !readString(reference, "fixtureSlug") ||
    typeof reference.fixtureIndex !== "number"
  ) {
    issues.push(
      createIssue(
        candidateIndex,
        candidateId,
        "sourceFixtureReference",
        "source-fixture-reference-missing"
      )
    );
  }
}

function validateWrestlerIdentityReference(
  candidate: Record<string, unknown>,
  candidateIndex: number,
  candidateId: string | undefined,
  issues: NewGMModeDraftPickCandidateObjectValidationIssue[]
): void {
  const reference = candidate.wrestlerIdentityReference;

  if (
    !isRecord(reference) ||
    !readString(reference, "wrestlerId") ||
    !readString(reference, "slug")
  ) {
    issues.push(
      createIssue(
        candidateIndex,
        candidateId,
        "wrestlerIdentityReference",
        "wrestler-identity-reference-missing"
      )
    );
  }
}

function validateEligibilityStatus(
  candidate: Record<string, unknown>,
  candidateIndex: number,
  candidateId: string | undefined,
  issues: NewGMModeDraftPickCandidateObjectValidationIssue[]
): void {
  if (
    typeof candidate.eligibilityStatus !== "string" ||
    !KNOWN_ELIGIBILITY_STATUSES.includes(candidate.eligibilityStatus)
  ) {
    issues.push(
      createIssue(
        candidateIndex,
        candidateId,
        "eligibilityStatus",
        "eligibility-status-unknown"
      )
    );
  }
}

function validateReadinessReasonIds(
  candidate: Record<string, unknown>,
  candidateIndex: number,
  candidateId: string | undefined,
  issues: NewGMModeDraftPickCandidateObjectValidationIssue[]
): void {
  const reasonIds = candidate.readinessReasonIds;

  if (!Array.isArray(reasonIds) || reasonIds.length === 0) {
    issues.push(
      createIssue(
        candidateIndex,
        candidateId,
        "readinessReasonIds",
        "readiness-reason-ids-missing"
      )
    );
    return;
  }

  if (
    reasonIds.some(
      (reasonId) =>
        typeof reasonId !== "string" ||
        !KNOWN_READINESS_REASON_IDS.includes(reasonId)
    )
  ) {
    issues.push(
      createIssue(
        candidateIndex,
        candidateId,
        "readinessReasonIds",
        "readiness-reason-id-unknown"
      )
    );
  }
}

function validateDisplayReadinessMarker(
  candidate: Record<string, unknown>,
  candidateIndex: number,
  candidateId: string | undefined,
  issues: NewGMModeDraftPickCandidateObjectValidationIssue[]
): void {
  if (typeof candidate.displayReadinessMarker !== "string") {
    issues.push(
      createIssue(
        candidateIndex,
        candidateId,
        "displayReadinessMarker",
        "display-readiness-marker-missing"
      )
    );
    return;
  }

  if (
    !KNOWN_DISPLAY_READINESS_MARKERS.includes(
      candidate.displayReadinessMarker
    )
  ) {
    issues.push(
      createIssue(
        candidateIndex,
        candidateId,
        "displayReadinessMarker",
        "display-readiness-marker-unknown"
      )
    );
  }
}

function validateDomainFlags(
  source: Record<string, unknown>,
  candidateIndex: number | null,
  candidateId: string | undefined,
  issues: NewGMModeDraftPickCandidateObjectValidationIssue[]
): void {
  if (source.domainObject !== true) {
    issues.push(
      createIssue(candidateIndex, candidateId, "domainObject", "domain-object-flag-invalid")
    );
  }

  if (source.diagnosticsOnly !== false) {
    issues.push(
      createIssue(candidateIndex, candidateId, "diagnosticsOnly", "diagnostics-only-flag-invalid")
    );
  }

  if (source.playerFacing !== false) {
    issues.push(
      createIssue(candidateIndex, candidateId, "playerFacing", "player-facing-flag-invalid")
    );
  }

  if (source.gameplayAffecting !== false) {
    issues.push(
      createIssue(candidateIndex, candidateId, "gameplayAffecting", "gameplay-affecting-flag-invalid")
    );
  }

  if (source.mutable !== false) {
    issues.push(
      createIssue(candidateIndex, candidateId, "mutable", "mutable-flag-invalid")
    );
  }
}

function validateCapabilityFlags(
  capabilityFlags: unknown,
  candidateIndex: number | null,
  candidateId: string | undefined,
  issues: NewGMModeDraftPickCandidateObjectValidationIssue[]
): void {
  if (!isRecord(capabilityFlags)) {
    issues.push(
      createIssue(candidateIndex, candidateId, "capabilityFlags", "capability-flags-missing")
    );
    return;
  }

  Object.keys(NEW_GM_MODE_DRAFT_PICK_CANDIDATE_CAPABILITY_FLAGS).forEach(
    (flagId) => {
      if (capabilityFlags[flagId] !== false) {
        issues.push(
          createIssue(
            candidateIndex,
            candidateId,
            `capabilityFlags.${flagId}`,
            "capability-flag-enabled"
          )
        );
      }
    }
  );
}

function validateForbiddenFields(
  source: Record<string, unknown>,
  candidateIndex: number | null,
  candidateId: string | undefined,
  issues: NewGMModeDraftPickCandidateObjectValidationIssue[]
): void {
  FORBIDDEN_FIELD_IDS.forEach((fieldId) => {
    if (Object.hasOwn(source, fieldId)) {
      issues.push(
        createIssue(candidateIndex, candidateId, fieldId, "forbidden-field-present")
      );
    }
  });
}

function readCandidates(candidateSet: unknown): readonly unknown[] {
  return isRecord(candidateSet) && Array.isArray(candidateSet.candidates)
    ? candidateSet.candidates
    : Object.freeze([]);
}

function readCandidateId(candidate: unknown): string | undefined {
  return isRecord(candidate) ? readString(candidate, "candidateId") : undefined;
}

function createIssue(
  candidateIndex: number | null,
  candidateId: string | undefined,
  fieldId: string,
  issueId: NewGMModeDraftPickCandidateObjectValidationIssueId
): NewGMModeDraftPickCandidateObjectValidationIssue {
  return Object.freeze({
    candidateIndex,
    ...(candidateId ? { candidateId } : {}),
    fieldId,
    issueId
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(
  source: Record<string, unknown>,
  key: string
): string | undefined {
  const value = source[key];

  return typeof value === "string" && value.length > 0 ? value : undefined;
}
