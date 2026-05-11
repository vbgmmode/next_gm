const ADAPTER_ID = "playable-new-gm-mode-draft-selection-intent-preview-adapter-v0.1";
const PREVIEW_KIND = "ui-only-draft-selection-intent-preview";

export const DEFAULT_LOCAL_DRAFT_SLOT = Object.freeze({
  roundNumber: 1,
  pickNumber: 1,
  roundLabel: "Round 1",
  pickLabel: "Pick 1",
  placeholderOnly: true,
});

export const DRAFT_SELECTION_INTENT_PREVIEW_STATUS = Object.freeze({
  READY: "ready-preview-selection-intent-locked",
  CANDIDATE_UNAVAILABLE: "blocked-preview-candidate-unavailable",
  MISSING_CANDIDATE: "blocked-preview-missing-candidate",
  MISSING_BRAND: "blocked-preview-missing-brand",
});

// UI-local presentation adapter only. It mirrors the domain selection-intent
// references at a display-safe level; the domain remains the source of truth.
// Phase 3 hands this preview off to a separate Make Pick controller. This
// adapter still does not create draft picks or roster state by itself.
export function createDraftSelectionIntentPreview({
  selectedCandidate,
  selectedBrand,
  draftSlot = DEFAULT_LOCAL_DRAFT_SLOT,
} = {}) {
  const status = resolveStatus(selectedCandidate, selectedBrand);
  const blockedReasonIds = createBlockedReasonIds(status);
  const statusLabel = createStatusLabel(status);
  const candidate = createCandidatePreview(selectedCandidate);
  const brand = createBrandPreview(selectedBrand);
  const slot = createDraftSlotPreview(draftSlot);

  return Object.freeze({
    adapterId: ADAPTER_ID,
    version: "0.1",
    previewKind: PREVIEW_KIND,
    uiOnly: true,
    presentationOnly: true,
    domainAlignedConcepts: Object.freeze({
      selectionIntentObject: "newGMModeDraftSelectionIntentObject",
      candidateReference: "sourceCandidateReference",
      selectingBrandReference: "selectingBrandReference",
      draftOrderReference: "draftOrderReference",
      validationReadiness: "newGMModeDraftSelectionIntentReadinessSummary",
    }),
    status,
    statusLabel,
    readyForPreview: status === DRAFT_SELECTION_INTENT_PREVIEW_STATUS.READY,
    blocked: status !== DRAFT_SELECTION_INTENT_PREVIEW_STATUS.READY,
    blockedReasonIds: Object.freeze(blockedReasonIds),
    selectionIntentPreview: Object.freeze({
      candidateReference: Object.freeze({
        uiCandidateId: candidate.uiCandidateId,
        displayName: candidate.name,
      }),
      selectingBrandReference: Object.freeze({
        brandId: brand.brandId,
        brandLabel: brand.brandLabel,
        placeholderOnly: true,
      }),
      draftOrderReference: Object.freeze({
        roundNumber: slot.roundNumber,
        pickNumber: slot.pickNumber,
        roundLabel: slot.roundLabel,
        pickLabel: slot.pickLabel,
        placeholderOnly: true,
      }),
      validationStatus: "ui-preview-only-validation-not-run",
    }),
    scoutingProjection: Object.freeze({
      name: candidate.name,
      roleTier: candidate.roleTier,
      divisionOrRosterFit: candidate.divisionOrRosterFit,
      availability: candidate.availability,
      starPower: candidate.starPower,
      ringWork: candidate.ringWork,
      promo: candidate.promo,
      durability: candidate.durability,
      risk: candidate.risk,
      scoutConfidence: candidate.scoutConfidence,
      scoutNote: candidate.scoutNote,
      pickPreviewStatus: statusLabel,
    }),
    displayLabels: Object.freeze({
      candidateLine: candidate.hasCandidate
        ? `${candidate.name} selected`
        : "No candidate selected",
      brandLine: brand.hasBrand
        ? `${brand.brandLabel} on the clock`
        : "Brand missing",
      pickLine: `${slot.roundLabel} / ${slot.pickLabel}`,
      statusLine: statusLabel,
      noteLine: createNoteLine(status),
    }),
    lockedActionLabels: Object.freeze([
      "Make Pick controlled by Phase 3A action",
      "Auto Draft locked",
      "Direct Draft Recap locked",
    ]),
    blockedCapabilityLabels: Object.freeze([
      "No pick created",
      "No roster assigned",
      "No draft completion",
      "No gameplay started",
    ]),
  });
}

export function createEmptyDraftSelectionIntentPreview() {
  return createDraftSelectionIntentPreview();
}

export function createCandidateDisplayFromDataset(dataset = {}) {
  return Object.freeze({
    candidateId: readString(dataset.candidateId),
    name: readString(dataset.talentName),
    roleTier: readString(dataset.talentRole),
    divisionOrRosterFit: readString(dataset.talentFit),
    availability: readString(dataset.availability) || "Unavailable",
    scoutNote: readString(dataset.talentRead),
    starPower: createDisplayMeter(dataset.starPower, dataset.starPowerValue),
    ringWork: createDisplayMeter(dataset.ringWork, dataset.ringWorkValue),
    promo: createDisplayMeter(dataset.promo, dataset.promoValue),
    durability: createDisplayMeter(dataset.durability, dataset.durabilityValue),
    risk: createDisplayMeter(dataset.risk, dataset.riskValue),
    scoutConfidence: createDisplayMeter(
      dataset.confidence,
      dataset.confidenceValue
    ),
  });
}

function resolveStatus(selectedCandidate, selectedBrand) {
  if (!selectedCandidate || !readString(selectedCandidate.candidateId)) {
    return DRAFT_SELECTION_INTENT_PREVIEW_STATUS.MISSING_CANDIDATE;
  }

  if (!selectedBrand || !readString(selectedBrand.brandId)) {
    return DRAFT_SELECTION_INTENT_PREVIEW_STATUS.MISSING_BRAND;
  }

  if (selectedCandidate.availability !== "Available") {
    return DRAFT_SELECTION_INTENT_PREVIEW_STATUS.CANDIDATE_UNAVAILABLE;
  }

  return DRAFT_SELECTION_INTENT_PREVIEW_STATUS.READY;
}

function createBlockedReasonIds(status) {
  if (status === DRAFT_SELECTION_INTENT_PREVIEW_STATUS.READY) {
    return ["pick-action-still-locked"];
  }

  if (status === DRAFT_SELECTION_INTENT_PREVIEW_STATUS.MISSING_CANDIDATE) {
    return ["candidate-selection-missing"];
  }

  if (status === DRAFT_SELECTION_INTENT_PREVIEW_STATUS.MISSING_BRAND) {
    return ["brand-selection-missing"];
  }

  return ["candidate-unavailable-for-preview"];
}

function createStatusLabel(status) {
  if (status === DRAFT_SELECTION_INTENT_PREVIEW_STATUS.READY) {
    return "Ready to make pick";
  }

  if (status === DRAFT_SELECTION_INTENT_PREVIEW_STATUS.MISSING_CANDIDATE) {
    return "Preview empty - select a candidate";
  }

  if (status === DRAFT_SELECTION_INTENT_PREVIEW_STATUS.MISSING_BRAND) {
    return "Preview blocked - brand missing";
  }

  return "Preview blocked - candidate unavailable";
}

function createNoteLine(status) {
  if (status === DRAFT_SELECTION_INTENT_PREVIEW_STATUS.READY) {
    return "Make Pick signs this wrestler to your draft roster.";
  }

  if (status === DRAFT_SELECTION_INTENT_PREVIEW_STATUS.CANDIDATE_UNAVAILABLE) {
    return "Unavailable candidate preview only. No pick is created.";
  }

  return "Preview unavailable until the missing display selection is restored.";
}

function createCandidatePreview(selectedCandidate) {
  const hasCandidate = Boolean(
    selectedCandidate && readString(selectedCandidate.candidateId)
  );

  return Object.freeze({
    hasCandidate,
    uiCandidateId: hasCandidate
      ? selectedCandidate.candidateId
      : "candidate-not-selected",
    name: readString(selectedCandidate?.name) || "No candidate selected",
    roleTier: readString(selectedCandidate?.roleTier) || "Role TBD",
    divisionOrRosterFit:
      readString(selectedCandidate?.divisionOrRosterFit) || "Roster fit TBD",
    availability: readString(selectedCandidate?.availability) || "Unavailable",
    scoutNote:
      readString(selectedCandidate?.scoutNote) ||
      "Select a candidate to preview scouting.",
    starPower: createDisplayMeterFromCandidate(selectedCandidate, "starPower"),
    ringWork: createDisplayMeterFromCandidate(selectedCandidate, "ringWork"),
    promo: createDisplayMeterFromCandidate(selectedCandidate, "promo"),
    durability: createDisplayMeterFromCandidate(selectedCandidate, "durability"),
    risk: createDisplayMeterFromCandidate(selectedCandidate, "risk"),
    scoutConfidence: createDisplayMeterFromCandidate(
      selectedCandidate,
      "scoutConfidence"
    ),
  });
}

function createBrandPreview(selectedBrand) {
  const brandId = readString(selectedBrand?.brandId);
  const brandLabel = readString(selectedBrand?.brandLabel);

  return Object.freeze({
    hasBrand: Boolean(brandId),
    brandId: brandId || "brand-not-selected",
    brandLabel: brandLabel || "Brand missing",
  });
}

function createDraftSlotPreview(draftSlot) {
  const roundNumber = readPositiveNumber(draftSlot?.roundNumber, 1);
  const pickNumber = readPositiveNumber(draftSlot?.pickNumber, 1);

  return Object.freeze({
    roundNumber,
    pickNumber,
    roundLabel: readString(draftSlot?.roundLabel) || `Round ${roundNumber}`,
    pickLabel: readString(draftSlot?.pickLabel) || `Pick ${pickNumber}`,
    placeholderOnly: true,
  });
}

function createDisplayMeterFromCandidate(selectedCandidate, fieldId) {
  const value = selectedCandidate?.[fieldId];

  if (!value || typeof value !== "object") {
    return createDisplayMeter();
  }

  return createDisplayMeter(value.label, value.meterValue);
}

function createDisplayMeter(label = "Unknown", meterValue) {
  return Object.freeze({
    label: readString(label) || "Unknown",
    meterValue: normalizeMeterValue(meterValue),
  });
}

function normalizeMeterValue(value) {
  const numberValue =
    typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);

  if (!Number.isFinite(numberValue)) {
    return "0";
  }

  return String(Math.min(100, Math.max(0, numberValue)));
}

function readPositiveNumber(value, fallback) {
  const numericValue =
    typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);

  return Number.isFinite(numericValue) && numericValue > 0
    ? numericValue
    : fallback;
}

function readString(value) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}
