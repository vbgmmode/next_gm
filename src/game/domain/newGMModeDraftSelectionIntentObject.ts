import {
  type NewGMModeDraftSelectionIntentCapabilityFlags,
  NEW_GM_MODE_DRAFT_SELECTION_INTENT_CAPABILITY_FLAGS
} from "./newGMModeDraftSelectionIntentContractShell.ts";

export type NewGMModeDraftSelectionIntentStatus =
  "selection-intent-created-validation-unavailable";

export interface NewGMModeDraftSelectionIntentObjectInput {
  readonly candidateObjectId: string;
  readonly sourceFixtureId: string;
  readonly sourceWrestlerId: string;
  readonly selectingBrandId: string;
  readonly draftRound: number;
  readonly draftPickNumber: number;
}

export interface NewGMModeDraftSelectionIntentObject {
  readonly draftSelectionIntentObjectId: string;
  readonly version: "0.1";
  readonly domainObject: true;
  readonly diagnosticsOnly: false;
  readonly playerFacing: false;
  readonly gameplayAffecting: false;
  readonly mutable: false;
  readonly validationStatus: NewGMModeDraftSelectionIntentStatus;
  readonly sourceCandidateReference: {
    readonly candidateObjectId: string;
  };
  readonly sourceFixtureReference: {
    readonly sourceFixtureId: string;
  };
  readonly sourceWrestlerReference: {
    readonly sourceWrestlerId: string;
  };
  readonly selectingBrandReference: {
    readonly selectingBrandId: string;
    readonly placeholderOnly: true;
  };
  readonly draftOrderReference: {
    readonly draftRound: number;
    readonly draftPickNumber: number;
    readonly placeholderOnly: true;
  };
  readonly capabilityFlags: NewGMModeDraftSelectionIntentCapabilityFlags;
}

export function createNewGMModeDraftSelectionIntentObject(
  input: NewGMModeDraftSelectionIntentObjectInput
): NewGMModeDraftSelectionIntentObject {
  return Object.freeze({
    draftSelectionIntentObjectId: createDraftSelectionIntentObjectId(input),
    version: "0.1",
    domainObject: true,
    diagnosticsOnly: false,
    playerFacing: false,
    gameplayAffecting: false,
    mutable: false,
    validationStatus: "selection-intent-created-validation-unavailable",
    sourceCandidateReference: Object.freeze({
      candidateObjectId: input.candidateObjectId
    }),
    sourceFixtureReference: Object.freeze({
      sourceFixtureId: input.sourceFixtureId
    }),
    sourceWrestlerReference: Object.freeze({
      sourceWrestlerId: input.sourceWrestlerId
    }),
    selectingBrandReference: Object.freeze({
      selectingBrandId: input.selectingBrandId,
      placeholderOnly: true
    }),
    draftOrderReference: Object.freeze({
      draftRound: input.draftRound,
      draftPickNumber: input.draftPickNumber,
      placeholderOnly: true
    }),
    capabilityFlags: NEW_GM_MODE_DRAFT_SELECTION_INTENT_CAPABILITY_FLAGS
  });
}

function createDraftSelectionIntentObjectId(
  input: NewGMModeDraftSelectionIntentObjectInput
): string {
  return [
    "new-gm-mode-draft-selection-intent",
    normalizeIdPart(input.candidateObjectId),
    normalizeIdPart(input.sourceFixtureId),
    normalizeIdPart(input.sourceWrestlerId),
    normalizeIdPart(input.selectingBrandId),
    `round-${normalizeIdPart(String(input.draftRound))}`,
    `pick-${normalizeIdPart(String(input.draftPickNumber))}`
  ].join(":");
}

function normalizeIdPart(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(
    /^-|-$/g,
    ""
  );
}
