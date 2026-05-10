export type NewGMModeSetupRequiredInput =
  | "selected-promotion-or-brand"
  | "selected-manager-identity"
  | "difficulty-mode"
  | "draft-requirement"
  | "starting-calendar-week-state"
  | "roster-setup-requirement"
  | "championship-division-setup-requirement"
  | "save-identity-prerequisite";

export type NewGMModeSetupReadiness =
  | "blocked"
  | "requirements-described-only";

export type NewGMModeSetupBlockedReason =
  | "setup-contract-describes-requirements-only"
  | "gameplay-start-not-implemented"
  | "draft-execution-not-implemented"
  | "roster-assignment-not-implemented"
  | "championship-assignment-not-implemented"
  | "division-construction-not-implemented"
  | "calendar-advancement-not-implemented"
  | "weekly-loop-not-implemented"
  | "match-simulation-not-connected-to-setup"
  | "business-fan-social-systems-not-connected-to-setup"
  | "gameplay-payload-persistence-not-implemented"
  | "ui-wiring-not-implemented";

export interface NewGMModeSetupContractShell {
  readonly status: "diagnostics-only";
  readonly setupContractId: "new-gm-mode-setup-contract-v0.1";
  readonly setupReadiness: NewGMModeSetupReadiness;
  readonly requiredFutureSetupInputs: readonly NewGMModeSetupRequiredInput[];
  readonly setupReadinessSummary: {
    readonly requiredInputCount: number;
    readonly describedOnly: true;
    readonly playableStartReady: false;
  };
  readonly saveIdentityCreateAvailable: true;
  readonly saveIdentityReadAvailable: true;
  readonly saveIdentityListAvailable: true;
  readonly saveIdentityDeleteAvailable: false;
  readonly saveIdentityUpdateAvailable: false;
  readonly setupRequirementDescriptionAvailable: true;
  readonly gameplayStartAvailable: false;
  readonly draftExecutionAvailable: false;
  readonly weeklyLoopAvailable: false;
  readonly gameplayPayloadPersistenceAvailable: false;
  readonly uiWiringAvailable: false;
  readonly durableSaveIdentityPrerequisiteDescribed: true;
  readonly saveCreated: false;
  readonly sqliteWritten: false;
  readonly sqliteDatabaseOpened: false;
  readonly draftLogicExecuted: false;
  readonly rostersCreated: false;
  readonly championshipsCreated: false;
  readonly divisionsCreated: false;
  readonly matchCardsCreated: false;
  readonly gameplayStarted: false;
  readonly weekAdvanced: false;
  readonly matchSimulationExecuted: false;
  readonly businessSystemsRun: false;
  readonly fanSocialOutputCreated: false;
  readonly generatedTextCreated: false;
  readonly genAIUsed: false;
  readonly gameplayAffecting: false;
  readonly diagnosticsOnly: true;
  readonly playerFacing: false;
  readonly blockedReasons: readonly NewGMModeSetupBlockedReason[];
}

const REQUIRED_FUTURE_SETUP_INPUTS: readonly NewGMModeSetupRequiredInput[] =
  Object.freeze([
    "selected-promotion-or-brand",
    "selected-manager-identity",
    "difficulty-mode",
    "draft-requirement",
    "starting-calendar-week-state",
    "roster-setup-requirement",
    "championship-division-setup-requirement",
    "save-identity-prerequisite"
  ]);

const BLOCKED_REASONS: readonly NewGMModeSetupBlockedReason[] =
  Object.freeze([
    "setup-contract-describes-requirements-only",
    "gameplay-start-not-implemented",
    "draft-execution-not-implemented",
    "roster-assignment-not-implemented",
    "championship-assignment-not-implemented",
    "division-construction-not-implemented",
    "calendar-advancement-not-implemented",
    "weekly-loop-not-implemented",
    "match-simulation-not-connected-to-setup",
    "business-fan-social-systems-not-connected-to-setup",
    "gameplay-payload-persistence-not-implemented",
    "ui-wiring-not-implemented"
  ]);

export function createNewGMModeSetupContractShell(): NewGMModeSetupContractShell {
  return Object.freeze({
    status: "diagnostics-only",
    setupContractId: "new-gm-mode-setup-contract-v0.1",
    setupReadiness: "requirements-described-only",
    requiredFutureSetupInputs: REQUIRED_FUTURE_SETUP_INPUTS,
    setupReadinessSummary: Object.freeze({
      requiredInputCount: REQUIRED_FUTURE_SETUP_INPUTS.length,
      describedOnly: true,
      playableStartReady: false
    }),
    saveIdentityCreateAvailable: true,
    saveIdentityReadAvailable: true,
    saveIdentityListAvailable: true,
    saveIdentityDeleteAvailable: false,
    saveIdentityUpdateAvailable: false,
    setupRequirementDescriptionAvailable: true,
    gameplayStartAvailable: false,
    draftExecutionAvailable: false,
    weeklyLoopAvailable: false,
    gameplayPayloadPersistenceAvailable: false,
    uiWiringAvailable: false,
    durableSaveIdentityPrerequisiteDescribed: true,
    saveCreated: false,
    sqliteWritten: false,
    sqliteDatabaseOpened: false,
    draftLogicExecuted: false,
    rostersCreated: false,
    championshipsCreated: false,
    divisionsCreated: false,
    matchCardsCreated: false,
    gameplayStarted: false,
    weekAdvanced: false,
    matchSimulationExecuted: false,
    businessSystemsRun: false,
    fanSocialOutputCreated: false,
    generatedTextCreated: false,
    genAIUsed: false,
    gameplayAffecting: false,
    diagnosticsOnly: true,
    playerFacing: false,
    blockedReasons: BLOCKED_REASONS
  });
}
