import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  classifyMatchResultIntent,
  type MatchResultIntentClassificationInput
} from "../src/game/engines/index.ts";

describe("Match Result Intent Classification", () => {
  it("marks missing finish intent context as needs-more-context", () => {
    const summary = classifyMatchResultIntent(
      createClassificationInput({
        validationStatus: "underspecified",
        finishIntentTypeRead: "unspecified",
        resultShellStatus: "pending",
        resultExecutionGateStatus: "pending"
      })
    );

    assert.equal(summary.classification, "needs-more-context");
    assert.equal(summary.sourceAvailability, "pending");
  });

  it("marks unsupported or invalid finish intent structure as unavailable", () => {
    const summary = classifyMatchResultIntent(
      createClassificationInput({
        validationStatus: "unsupported",
        finishIntentTypeRead: "unspecified",
        resultShellStatus: "unavailable",
        resultExecutionGateStatus: "closed"
      })
    );

    assert.equal(summary.classification, "unavailable");
    assert.equal(summary.sourceAvailability, "unavailable");
  });

  it("marks questionable pending finish paths as limited", () => {
    const summary = classifyMatchResultIntent(
      createClassificationInput({
        validationStatus: "questionable",
        finishIntentTypeRead: "dirty",
        resultShellStatus: "pending",
        resultExecutionGateStatus: "pending"
      })
    );

    assert.equal(summary.classification, "limited");
    assert.equal(summary.sourceAvailability, "limited");
  });

  it("marks valid open finish paths as standard-match-ready", () => {
    const summary = classifyMatchResultIntent(
      createClassificationInput({
        validationStatus: "valid",
        finishIntentTypeRead: "clean",
        finishProtectionRead: "stable",
        resultShellStatus: "ready_for_execution",
        resultExecutionGateStatus: "open"
      })
    );

    assert.equal(summary.classification, "standard-match-ready");
    assert.equal(summary.sourceAvailability, "available");
  });

  it("marks valid protected open finish paths as protected-finish-ready", () => {
    const summary = classifyMatchResultIntent(
      createClassificationInput({
        validationStatus: "valid",
        finishIntentTypeRead: "clean",
        finishProtectionRead: "protected",
        resultShellStatus: "ready_for_execution",
        resultExecutionGateStatus: "open"
      })
    );

    assert.equal(summary.classification, "protected-finish-ready");
    assert.equal(summary.sourceAvailability, "available");
  });
});

type ClassificationInputOptions = {
  validationStatus: MatchResultIntentClassificationInput["finishIntentValidation"]["status"];
  finishIntentTypeRead: MatchResultIntentClassificationInput["finishReadSummary"]["finishIntentTypeRead"];
  finishProtectionRead?: MatchResultIntentClassificationInput["finishReadSummary"]["finishProtectionRead"];
  resultShellStatus: MatchResultIntentClassificationInput["resultShell"]["status"];
  resultExecutionGateStatus: MatchResultIntentClassificationInput["resultExecutionGate"]["status"];
};

function createClassificationInput(
  options: ClassificationInputOptions
): MatchResultIntentClassificationInput {
  return {
    finishReadSummary: {
      finishIntentTypeRead: options.finishIntentTypeRead,
      finishProtectionRead: options.finishProtectionRead ?? "stable",
      finishRiskRead: "stable",
      finishControversyRead: "stable",
      finishMomentumRead: "stable",
      finishConfidenceRead: "stable"
    },
    finishIntentValidation: {
      status: options.validationStatus,
      severity: options.validationStatus === "valid" ? "none" : "moderate",
      reasons: [
        options.validationStatus === "valid" ? "finish-intent-supported" : "finish-intent-unspecified"
      ],
      confidenceBand: options.validationStatus === "valid" ? "high" : "low"
    },
    resultShell: {
      status: options.resultShellStatus,
      readiness: options.resultShellStatus === "ready_for_execution" ? "high" : "moderate",
      confidence: options.resultShellStatus === "ready_for_execution" ? "high" : "moderate",
      reasons: [
        options.resultShellStatus === "ready_for_execution"
          ? "finish-intent-valid"
          : "finish-intent-underspecified"
      ],
      hasWinner: false,
      hasFinish: false,
      hasRating: false,
      hasConsequences: false
    },
    resultExecutionGate: {
      status: options.resultExecutionGateStatus,
      severity: options.resultExecutionGateStatus === "open" ? "none" : "moderate",
      reasons: [
        options.resultExecutionGateStatus === "open"
          ? "result-shell-ready"
          : "result-shell-pending"
      ],
      requiredShellStatus: "ready_for_execution",
      observedShellStatus: options.resultShellStatus,
      canExecuteResult: options.resultExecutionGateStatus === "open"
    }
  };
}
