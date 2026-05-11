import {
  createPlayableNewGMModeContinueSaveShell,
  createPlayableNewGMModeDurableNewSaveSlotShell,
} from "../../src/game/persistence/index.ts";

export const PLAYABLE_SAVE_API_DATABASE_PATH =
  "data/saves/playable-new-gm-mode.sqlite";
export const PLAYABLE_SAVE_API_DEFAULT_SAVE_ID =
  "playable-new-gm-mode-autosave";

export function createPlayableSaveApiStatus() {
  return Object.freeze({
    status: "available",
    saveId: PLAYABLE_SAVE_API_DEFAULT_SAVE_ID,
    storage: "Controlled SQLite save file",
    browserStorageUsed: false,
    networkScope: "local preview server only",
  });
}

export function savePlayableNewGMModeGame({
  gameplayStateModel,
  saveId = PLAYABLE_SAVE_API_DEFAULT_SAVE_ID,
  databasePath = PLAYABLE_SAVE_API_DATABASE_PATH,
} = {}) {
  const request = createSaveIdentityRequest({ gameplayStateModel, saveId });
  const result = createPlayableNewGMModeDurableNewSaveSlotShell({
    requestedDatabasePath: databasePath,
    request,
    gameplayStateModel,
  });

  return Object.freeze({
    ok: result.executionStatus === "saved",
    status: result.executionStatus,
    saveId: result.requestedSaveId,
    selectedBrandName: result.selectedBrandName,
    currentWeek: result.currentWeek,
    issues: result.issues,
    browserStorageUsed: false,
  });
}

export function continuePlayableNewGMModeGame({
  saveId = PLAYABLE_SAVE_API_DEFAULT_SAVE_ID,
  databasePath = PLAYABLE_SAVE_API_DATABASE_PATH,
} = {}) {
  const result = createPlayableNewGMModeContinueSaveShell({
    requestedDatabasePath: databasePath,
    requestedSaveId: saveId,
  });

  return Object.freeze({
    ok: result.executionStatus === "loaded",
    status: result.executionStatus,
    saveId: result.requestedSaveId,
    gameId: result.gameId,
    selectedBrandName: result.selectedBrandName,
    currentWeek: result.currentWeek,
    issues: result.issues,
    browserStorageUsed: false,
  });
}

function createSaveIdentityRequest({ gameplayStateModel, saveId }) {
  const selectedBrandId = readString(gameplayStateModel?.selectedBrand?.brandId) || "raw";
  const timestamp = "2026-05-11T00:00:00.000Z";

  return {
    saveId: readString(saveId) || PLAYABLE_SAVE_API_DEFAULT_SAVE_ID,
    saveSlotId: "slot-playable-autosave",
    setupId: `setup-${selectedBrandId}`,
    selectedBrandId,
    playerManagerId: "player-gm",
    seedLabel: `playable-${selectedBrandId}`,
    replayId: `replay-${selectedBrandId}`,
    createdAt: timestamp,
    updatedAt: timestamp,
    schemaVersion: "sqlite-save-schema-v0.1",
  };
}

function readString(value) {
  return typeof value === "string" ? value.trim() : "";
}
