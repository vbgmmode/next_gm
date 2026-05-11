const MOCK_RECAP_PREVIEW_KIND = "ui-only-mock-draft-recap-preview";

export function createMockDraftRecapPreviewState({
  selectedGm,
  selectedBrand,
  selectedCandidate,
} = {}) {
  const gm = createGmReference(selectedGm);
  const brand = createBrandReference(selectedBrand);
  const candidate = createCandidateReference(selectedCandidate);

  return Object.freeze({
    previewKind: MOCK_RECAP_PREVIEW_KIND,
    version: "0.1",
    uiOnly: true,
    presentationOnly: true,
    mockOnly: true,
    phase: "qa-preview-post-draft-flow",
    source: "initial-draft-preview-continuation",
    selectedGmReference: gm,
    selectedBrandReference: brand,
    selectedCandidateReference: candidate,
    displayLabels: Object.freeze({
      recapStatusLine: "Mock Draft Recap - no draft executed",
      gmLine: gm.hasGm ? gm.displayName : "GM preview missing",
      brandLine: brand.hasBrand ? `${brand.brandLabel} mock preview` : "Brand preview missing",
      candidateLine: candidate.hasCandidate
        ? `${candidate.displayName} carried forward as preview context`
        : "No candidate carried forward",
      rosterLine: `${brand.brandLabel} mock roster placeholder`,
      dashboardLine: "Week 1 Setup preview - draft and roster creation still locked",
      noteLine:
        "Presentation-only QA path. No pick, roster assignment, roster state, or draft completion summary exists.",
    }),
    blockedCapabilityLabels: Object.freeze([
      "Make Pick remains locked",
      "No draft pick object",
      "No roster assignment object",
      "No roster state object",
      "No real draft completion",
      "No gameplay start",
    ]),
  });
}

function createGmReference(selectedGm) {
  const gmId = readString(selectedGm?.gmId);
  const displayName = readString(selectedGm?.displayName);

  return Object.freeze({
    hasGm: Boolean(gmId),
    gmId: gmId || "gm-not-selected",
    displayName: displayName || "GM preview missing",
    placeholderOnly: true,
  });
}

function createBrandReference(selectedBrand) {
  const brandId = readString(selectedBrand?.brandId);
  const brandLabel = readString(selectedBrand?.brandLabel);

  return Object.freeze({
    hasBrand: Boolean(brandId),
    brandId: brandId || "brand-not-selected",
    brandLabel: brandLabel || "Brand preview missing",
    placeholderOnly: true,
  });
}

function createCandidateReference(selectedCandidate) {
  const candidateId = readString(selectedCandidate?.candidateId);
  const displayName = readString(selectedCandidate?.name);
  const availability = readString(selectedCandidate?.availability);

  return Object.freeze({
    hasCandidate: Boolean(candidateId),
    uiCandidateId: candidateId || "candidate-not-selected",
    displayName: displayName || "No candidate selected",
    availability: availability || "Unavailable",
    placeholderOnly: true,
  });
}

function readString(value) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}
