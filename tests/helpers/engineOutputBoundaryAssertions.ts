import assert from "node:assert/strict";

import type {
  EngineDebugTrace,
  EngineSignal,
  PlayerFacingSignal,
  SimulationEngineResult
} from "../../src/game/engines/index.ts";

const forbiddenPlayerFacingKeys = [
  "value",
  "hiddenValue",
  "score",
  "rating",
  "rawScore",
  "metric",
  "metrics",
  "internal",
  "internalValue",
  "numericValue"
] as const;

export function assertEngineResultRespectsOutputBoundary(
  result: SimulationEngineResult
): void {
  assert.ok(Object.keys(result.hiddenState).length > 0);
  assert.notEqual(result.hiddenState, result.signals);
  assertPlayerFacingSignalsDoNotExposeHiddenValues(result.signals);
  assertDebugTraceIsNonPlayerFacing(result.debugTrace);
}

export function assertPlayerFacingSignalsDoNotExposeHiddenValues(
  signalGroups: readonly EngineSignal[]
): void {
  for (const signalGroup of signalGroups) {
    for (const signal of signalGroup.signals) {
      assertNoRawNumericSignalFields(signal);
      assert.doesNotMatch(signal.label, /\d/);
    }
  }
}

export function assertNoRawNumericSignalFields(signal: PlayerFacingSignal): void {
  assertNoForbiddenKeysOrNumericLeaves(signal, "player-facing signal");
}

export function assertDebugTraceIsNonPlayerFacing(
  debugTrace: EngineDebugTrace | undefined
): void {
  if (debugTrace === undefined) {
    return;
  }

  assert.equal(debugTrace.playerFacing, false);
}

function assertNoForbiddenKeysOrNumericLeaves(value: unknown, path: string): void {
  if (typeof value === "number") {
    assert.fail(`${path} must not expose raw numeric values.`);
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      assertNoForbiddenKeysOrNumericLeaves(item, `${path}[${index}]`);
    });

    return;
  }

  if (value !== null && typeof value === "object") {
    for (const key of Object.keys(value)) {
      assert.equal(
        forbiddenPlayerFacingKeys.includes(key as (typeof forbiddenPlayerFacingKeys)[number]),
        false,
        `${path} must not expose raw/internal field "${key}".`
      );
      assertNoForbiddenKeysOrNumericLeaves(
        (value as Record<string, unknown>)[key],
        `${path}.${key}`
      );
    }
  }
}
