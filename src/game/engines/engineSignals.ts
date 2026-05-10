import type { EntityId, TrendDirection } from "../domain/index.ts";

export type EngineName = "match" | "fan-reaction" | "social-discourse" | "show";

export type EngineSignalSubject =
  | "wrestler"
  | "show"
  | "match"
  | "rivalry"
  | "promotion"
  | "market"
  | "backstage"
  | "social";

export type EngineSignalCategory =
  | "physical"
  | "crowd"
  | "social"
  | "financial"
  | "backstage"
  | "momentum"
  | "risk"
  | "trust";

export type HiddenEngineValue =
  | number
  | string
  | boolean
  | null
  | readonly HiddenEngineValue[]
  | { readonly [key: string]: HiddenEngineValue };

export interface HiddenEngineState {
  readonly [stableKey: string]: HiddenEngineValue;
}

export interface PlayerFacingSignal {
  id: EntityId;
  subject: EngineSignalSubject;
  subjectId?: EntityId;
  category: EngineSignalCategory;
  label: string;
  confidence: "low" | "medium" | "high";
  trend?: TrendDirection;
  sourceEngine: EngineName;
}

export interface EngineSignal {
  subject: EngineSignalSubject;
  subjectId?: EntityId;
  signals: readonly PlayerFacingSignal[];
}

export interface EngineDebugTrace {
  playerFacing: false;
  engineName: EngineName;
  steps: readonly string[];
  hiddenRolls?: readonly number[];
  notes?: readonly string[];
}

export interface SimulationEngineResult {
  engineName: EngineName;
  hiddenState: HiddenEngineState;
  signals: readonly EngineSignal[];
  debugTrace?: EngineDebugTrace;
}
