export type MatchFinishIntentType =
  | "unspecified"
  | "clean"
  | "dirty"
  | "interference"
  | "non_finish"
  | "draw"
  | "stoppage";

export type MatchFinishProtectionIntent =
  | "unspecified"
  | "protected"
  | "exposed"
  | "disputed";

export type MatchFinishControversyIntent =
  | "unspecified"
  | "low"
  | "moderate"
  | "high";

export interface MatchFinishIntent {
  type: MatchFinishIntentType;
  protection?: MatchFinishProtectionIntent;
  controversy?: MatchFinishControversyIntent;
}

export const DEFAULT_MATCH_FINISH_INTENT: MatchFinishIntent = {
  type: "unspecified",
  protection: "unspecified",
  controversy: "unspecified"
};

export function normalizeMatchFinishIntent(
  finishIntent: MatchFinishIntent | undefined
): Required<MatchFinishIntent> {
  return {
    type: finishIntent?.type ?? DEFAULT_MATCH_FINISH_INTENT.type,
    protection: finishIntent?.protection ?? DEFAULT_MATCH_FINISH_INTENT.protection,
    controversy: finishIntent?.controversy ?? DEFAULT_MATCH_FINISH_INTENT.controversy
  };
}
