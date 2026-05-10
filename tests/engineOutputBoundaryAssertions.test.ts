import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type {
  EngineDebugTrace,
  PlayerFacingSignal
} from "../src/game/engines/index.ts";
import {
  assertDebugTraceIsNonPlayerFacing,
  assertNoRawNumericSignalFields
} from "./helpers/engineOutputBoundaryAssertions.ts";

describe("engine output boundary assertions", () => {
  it("passes safe player-facing signals", () => {
    assertNoRawNumericSignalFields(createSafeSignal());
  });

  it("fails a signal containing score", () => {
    assert.throws(
      () => assertNoRawNumericSignalFields({ ...createSafeSignal(), score: "hidden" } as PlayerFacingSignal),
      /score/
    );
  });

  it("fails a signal containing value", () => {
    assert.throws(
      () => assertNoRawNumericSignalFields({ ...createSafeSignal(), value: "hidden" } as PlayerFacingSignal),
      /value/
    );
  });

  it("fails a signal containing a numeric raw field", () => {
    assert.throws(
      () => assertNoRawNumericSignalFields({ ...createSafeSignal(), rawRead: 72 } as PlayerFacingSignal),
      /numeric/
    );
  });

  it("passes absent debug trace", () => {
    assertDebugTraceIsNonPlayerFacing(undefined);
  });

  it("passes debug trace with playerFacing false", () => {
    assertDebugTraceIsNonPlayerFacing({
      playerFacing: false,
      engineName: "match",
      steps: ["Prepared hidden metrics"],
      hiddenRolls: [0.25]
    });
  });

  it("fails debug trace with playerFacing true", () => {
    assert.throws(
      () =>
        assertDebugTraceIsNonPlayerFacing({
          playerFacing: true,
          engineName: "match",
          steps: []
        } as unknown as EngineDebugTrace),
      /false/
    );
  });
});

function createSafeSignal(): PlayerFacingSignal {
  return {
    id: "signal-safe",
    subject: "match",
    subjectId: "match-main-event",
    category: "crowd",
    label: "crowd was engaged",
    confidence: "medium",
    trend: "rising",
    sourceEngine: "match"
  };
}
