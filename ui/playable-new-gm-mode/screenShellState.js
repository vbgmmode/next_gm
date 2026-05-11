export const PRE_GAME_SCREEN_IDS = Object.freeze([
  "game-landing",
  "save-selection",
  "settings-screen",
  "contract-signing",
  "setup-basics",
  "ai-setup",
  "choose-gm",
  "select-brand",
  "draft-room",
  "draft-recap",
]);

export const GAME_SHELL_SCREEN_IDS = Object.freeze([
  "brand-dashboard",
  "week-one-booking",
]);

export const GAME_SHELL_CONTEXT_SCREEN_IDS = Object.freeze([
  "settings-screen",
]);

export function shouldShowDock(screenId, { navigationContext } = {}) {
  if (
    navigationContext === "game-shell" &&
    GAME_SHELL_CONTEXT_SCREEN_IDS.includes(screenId)
  ) {
    return true;
  }

  return GAME_SHELL_SCREEN_IDS.includes(screenId);
}

export function resolveActiveDockSection({
  screenId,
  preferredNavSection,
  sectionNavMap,
  navigationContext,
} = {}) {
  if (!shouldShowDock(screenId, { navigationContext })) {
    return undefined;
  }

  return preferredNavSection || sectionNavMap?.[screenId];
}
