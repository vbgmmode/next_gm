import assert from "node:assert/strict";
import { describe, it } from "node:test";

import * as engineContracts from "../src/game/engines/index.ts";
import type {
  EngineDebugTrace,
  FanReactionEngineResult,
  MatchEngineResult,
  PlayerFacingSignal,
  SimulationEngineContext,
  SocialDiscourseEngineResult
} from "../src/game/engines/index.ts";
import { RandomService } from "../src/game/simulation/randomService.ts";
import {
  assertDebugTraceIsNonPlayerFacing,
  assertNoRawNumericSignalFields
} from "./helpers/engineOutputBoundaryAssertions.ts";

describe("engine contracts", () => {
  it("can import the public engine contract module", () => {
    assert.ok(engineContracts);
  });

  it("constructs a shared engine context with seeded randomness", () => {
    const context: SimulationEngineContext = {
      random: new RandomService("contract-test"),
      seed: "contract-test",
      week: 1,
      debug: true
    };

    assert.equal(context.week, 1);
    assert.equal(typeof context.random.next(), "number");
  });

  it("constructs sample structured engine results", () => {
    const matchResult: MatchEngineResult = {
      engineName: "match",
      matchId: "match-1",
      changedWrestlerIds: ["wrestler-1", "wrestler-2"],
      changedRivalryIds: ["rivalry-1"],
      hiddenState: {
        performanceQuality: 78,
        finishAcceptance: 64,
        matchRoll: 0.25,
        injuryRiskRoll: 0.35,
        momentumRoll: 0.45,
        plannedMinutes: 14,
        participantCount: 2,
        skillBalanceGap: 8,
        chemistryEstimate: 62,
        crowdEngagementRead: 71,
        fatiguePressure: {
          "wrestler-1": 28,
          "wrestler-2": 34
        }
      },
      signals: [
        {
          subject: "match",
          subjectId: "match-1",
          signals: [
            {
              id: "signal-match-crowd",
              subject: "match",
              subjectId: "match-1",
              category: "crowd",
              label: "heating up",
              confidence: "medium",
              trend: "rising",
              sourceEngine: "match"
            }
          ]
        }
      ]
    };

    const fanResult: FanReactionEngineResult = {
      engineName: "fan-reaction",
      affectedFanSegmentIds: ["segment-iwc"],
      affectedWrestlerIds: ["wrestler-1"],
      affectedRivalryIds: ["rivalry-1"],
      hiddenState: {
        pushAcceptance: 52,
        polarization: 71
      },
      signals: [
        {
          subject: "rivalry",
          subjectId: "rivalry-1",
          signals: [
            {
              id: "signal-rivalry-polarized",
              subject: "rivalry",
              subjectId: "rivalry-1",
              category: "crowd",
              label: "split reaction",
              confidence: "medium",
              trend: "volatile",
              sourceEngine: "fan-reaction"
            }
          ]
        }
      ]
    };

    const socialResult: SocialDiscourseEngineResult = {
      engineName: "social-discourse",
      producedNarratives: [],
      updatedNarrativeIds: ["narrative-1"],
      hiddenState: {
        discourseRoll: 0.66,
        rumorRoll: 0.34,
        fragmentationRoll: 0.45,
        existingNarrativeCount: 1,
        relevantWrestlerCount: 1,
        relevantRivalryCount: 0,
        matchHandoffPresent: true,
        fanReactionHandoffPresent: true,
        fanReactionShowOutputReadiness: {
          provided: false,
          structurallyUsable: false,
          inputStatus: "missing",
          shellStatus: null,
          readyForSocialDiscourseHandoff: false,
          issueCount: 0,
          matchCount: null,
          showId: null
        },
        showSignalReadiness: {
          expectedSignalCount: 5,
          presentSignalCount: 0,
          missingSignalCount: 5,
          unusableSignalCount: 0,
          fields: {
            crowdEnergyRead: "missing",
            bookingTrustRead: "missing",
            featuredTalentReceptionRead: "missing",
            showMomentumRead: "missing",
            confidenceRead: "missing"
          }
        },
        discourseReadinessBuckets: {
          iwcPulseReadiness: "unavailable",
          mediaNarrativeReadiness: "unavailable",
          lockerRoomBuzzReadiness: "unavailable",
          fanDebateReadiness: "unavailable",
          trendVolatilityReadiness: "unavailable"
        },
        discourseOutputShell: {
          sourceEngine: "social-discourse",
          playerFacing: false,
          iwcPulse: {
            status: "unavailable",
            readiness: "unavailable",
            sourceAvailability: "none"
          },
          mediaNarrative: {
            status: "unavailable",
            readiness: "unavailable",
            sourceAvailability: "none"
          },
          lockerRoomBuzz: {
            status: "unavailable",
            readiness: "unavailable",
            sourceAvailability: "none"
          },
          fanDebate: {
            status: "unavailable",
            readiness: "unavailable",
            sourceAvailability: "none"
          },
          trendVolatility: {
            status: "unavailable",
            readiness: "unavailable",
            sourceAvailability: "none"
          }
        },
        discourseRead: "rising",
        updatedNarrativeCount: 1,
        discourseSpread: 66,
        rumorCredibility: 34
      },
      signals: [
        {
          subject: "social",
          subjectId: "narrative-1",
          signals: [
            {
              id: "signal-social-chatter",
              subject: "social",
              subjectId: "narrative-1",
              category: "social",
              label: "loud conversation",
              confidence: "low",
              trend: "rising",
              sourceEngine: "social-discourse"
            }
          ]
        }
      ]
    };

    assert.equal(matchResult.engineName, "match");
    assert.equal(fanResult.engineName, "fan-reaction");
    assert.equal(socialResult.engineName, "social-discourse");
  });

  it("keeps player-facing signals free of hidden numeric values", () => {
    const signal: PlayerFacingSignal = {
      id: "signal-no-number",
      subject: "wrestler",
      subjectId: "wrestler-main-event",
      category: "physical",
      label: "showing wear",
      confidence: "high",
      trend: "stable",
      sourceEngine: "match"
    };

    assertNoRawNumericSignalFields(signal);
  });

  it("marks debug traces as optional and non-player-facing", () => {
    const resultWithoutDebug: MatchEngineResult = {
      engineName: "match",
      matchId: "match-no-debug",
      changedWrestlerIds: [],
      changedRivalryIds: [],
      hiddenState: {
        performanceQuality: 50,
        matchRoll: 0.25,
        injuryRiskRoll: 0.35,
        momentumRoll: 0.45,
        plannedMinutes: 10,
        participantCount: 0,
        skillBalanceGap: 0,
        chemistryEstimate: 50,
        crowdEngagementRead: 50,
        fatiguePressure: {}
      },
      signals: []
    };
    const debugTrace: EngineDebugTrace = {
      playerFacing: false,
      engineName: "match",
      steps: ["Read seeded input", "Prepared hidden metrics"],
      hiddenRolls: [0.25]
    };
    const resultWithDebug: MatchEngineResult = {
      ...resultWithoutDebug,
      debugTrace
    };

    assert.equal(resultWithoutDebug.debugTrace, undefined);
    assertDebugTraceIsNonPlayerFacing(resultWithDebug.debugTrace);
  });
});
