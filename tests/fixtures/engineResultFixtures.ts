import type {
  FanReactionEngineResult,
  MatchEngineResult,
  SocialDiscourseEngineResult
} from "../../src/game/engines/index.ts";
import { sampleSocialNarratives } from "./domainFixtures.ts";

export const sampleMatchEngineResult: MatchEngineResult = {
  engineName: "match",
  matchId: "match-main-event",
  changedWrestlerIds: ["wrestler-jade-valor", "wrestler-marcus-crowe"],
  changedRivalryIds: ["rivalry-valor-crowe"],
  hiddenState: {
    performanceQuality: 76,
    finishAcceptance: 63,
    fatiguePressure: {
      "wrestler-jade-valor": 39,
      "wrestler-marcus-crowe": 52
    },
    matchRoll: 0.4123,
    injuryRiskRoll: 0.7781,
    momentumRoll: 0.5332,
    plannedMinutes: 18,
    participantCount: 2,
    skillBalanceGap: 4,
    chemistryEstimate: 67,
    crowdEngagementRead: 76,
    talentProfileCoverage: "none",
    matchedTalentProfileCount: 0,
    missingTalentProfileWrestlerIds: ["wrestler-jade-valor", "wrestler-marcus-crowe"],
    talentProfileReadStatus: "not-provided",
    talentReadSummary: {
      participantCoverage: "none",
      matchedProfileCount: 0,
      missingProfileWrestlerIds: ["wrestler-jade-valor", "wrestler-marcus-crowe"],
      readStatus: "not-provided",
      participantReads: [
        {
          wrestlerId: "wrestler-jade-valor",
          profilePresent: false,
          inRingBand: "missing",
          promoBand: "missing",
          starPowerBand: "missing",
          staminaConditionBand: "missing",
          fatiguePressureBand: "missing",
          crowdConnectionBand: "missing",
          backstageRiskBand: "missing",
          overallReadinessBand: "missing"
        },
        {
          wrestlerId: "wrestler-marcus-crowe",
          profilePresent: false,
          inRingBand: "missing",
          promoBand: "missing",
          starPowerBand: "missing",
          staminaConditionBand: "missing",
          fatiguePressureBand: "missing",
          crowdConnectionBand: "missing",
          backstageRiskBand: "missing",
          overallReadinessBand: "missing"
        }
      ]
    },
    matchReadSummary: {
      talentCoverage: "none",
      competitivenessRead: "slight-edge",
      crowdPotentialRead: "solid",
      readinessRead: "uneven",
      riskPressureRead: "low",
      chemistryRead: "neutral",
      strongestReadinessBand: "missing",
      weakestReadinessBand: "missing"
    },
    finishIntentValidation: {
      status: "underspecified",
      severity: "moderate",
      reasons: ["finish-intent-unspecified", "missing-talent-coverage"],
      confidenceBand: "unknown"
    },
    finishReadSummary: {
      finishIntentTypeRead: "unspecified",
      finishProtectionRead: "unknown",
      finishRiskRead: "stable",
      finishControversyRead: "stable",
      finishMomentumRead: "stable",
      finishConfidenceRead: "unknown"
    },
    resultShell: {
      status: "pending",
      readiness: "moderate",
      confidence: "unknown",
      reasons: [
        "finish-intent-underspecified",
        "missing-talent-coverage",
        "finish-read-stable"
      ],
      hasWinner: false,
      hasFinish: false,
      hasRating: false,
      hasConsequences: false
    },
    resultExecutionGate: {
      status: "pending",
      severity: "moderate",
      reasons: ["result-shell-pending"],
      requiredShellStatus: "ready_for_execution",
      observedShellStatus: "pending",
      canExecuteResult: false
    },
    resultIntentClassification: {
      classification: "needs-more-context",
      sourceAvailability: "pending",
      resultShellStatus: "pending",
      resultExecutionGateStatus: "pending",
      finishIntentValidationStatus: "underspecified",
      finishIntentTypeRead: "unspecified"
    }
  },
  signals: [
    {
      subject: "match",
      subjectId: "match-main-event",
      signals: [
        {
          id: "signal-main-event-crowd",
          subject: "match",
          subjectId: "match-main-event",
          category: "crowd",
          label: "heating up",
          confidence: "medium",
          trend: "rising",
          sourceEngine: "match"
        }
      ]
    },
    {
      subject: "wrestler",
      subjectId: "wrestler-marcus-crowe",
      signals: [
        {
          id: "signal-crowe-physical",
          subject: "wrestler",
          subjectId: "wrestler-marcus-crowe",
          category: "physical",
          label: "showing wear",
          confidence: "medium",
          trend: "stable",
          sourceEngine: "match"
        }
      ]
    }
  ],
  debugTrace: {
    playerFacing: false,
    engineName: "match",
    steps: ["Loaded contract fixture input", "Prepared sample hidden state", "Prepared sample signals"],
    hiddenRolls: [0.4123, 0.7781],
    notes: ["Fixture only; no match formula executed."]
  }
};

export const sampleFanReactionEngineResult: FanReactionEngineResult = {
  engineName: "fan-reaction",
  affectedFanSegmentIds: ["segment-casual", "segment-iwc"],
  affectedWrestlerIds: ["wrestler-jade-valor", "wrestler-marcus-crowe"],
  affectedRivalryIds: ["rivalry-valor-crowe"],
  hiddenState: {
    pushAcceptance: 57,
    polarization: 44,
    segmentReads: {
      "segment-casual": "warming",
      "segment-iwc": "skeptical"
    },
    showOutputShell: {
      status: "ready",
      confidence: "moderate",
      issues: [],
      showId: "show-week-7",
      matchCount: 1,
      overallCrowdSignal: "engaged",
      audienceSegmentSignals: [
        {
          segmentKey: "live_crowd",
          signalBand: "engaged",
          confidence: "moderate",
          source: "audience-read-placeholder"
        },
        {
          segmentKey: "casual_fans",
          signalBand: "engaged",
          confidence: "moderate",
          source: "audience-read-placeholder"
        },
        {
          segmentKey: "hardcore_fans",
          signalBand: "engaged",
          confidence: "moderate",
          source: "audience-read-placeholder"
        },
        {
          segmentKey: "iwc",
          signalBand: "engaged",
          confidence: "moderate",
          source: "audience-read-placeholder"
        },
        {
          segmentKey: "tv_audience",
          signalBand: "engaged",
          confidence: "moderate",
          source: "audience-read-placeholder"
        }
      ],
      crowdEnergyRead: "structurally-ready",
      bookingTrustRead: "structurally-ready",
      featuredTalentReceptionRead: "structurally-ready",
      showMomentumRead: "structurally-ready",
      confidenceRead: "structurally-ready",
      backlashRiskShell: "quiet",
      momentumSignalShell: "engaged",
      discourseReadinessShell: "engaged",
      readyForSocialDiscourseHandoff: true
    }
  },
  signals: [
    {
      subject: "rivalry",
      subjectId: "rivalry-valor-crowe",
      signals: [
        {
          id: "signal-rivalry-crowd-read",
          subject: "rivalry",
          subjectId: "rivalry-valor-crowe",
          category: "crowd",
          label: "split but engaged",
          confidence: "medium",
          trend: "volatile",
          sourceEngine: "fan-reaction"
        }
      ]
    }
  ]
};

export const sampleSocialDiscourseEngineResult: SocialDiscourseEngineResult = {
  engineName: "social-discourse",
  producedNarratives: [
    {
      ...sampleSocialNarratives[0],
      id: "narrative-crowe-valor-finish",
      topic: "The contender final is being debated as a momentum test",
      relatedWrestlerIds: ["wrestler-jade-valor", "wrestler-marcus-crowe"],
      spread: 63,
      volatility: 57,
      trend: "rising"
    }
  ],
  updatedNarrativeIds: ["narrative-valor-push"],
  hiddenState: {
    discourseRoll: 0.63,
    rumorRoll: 0.24,
    fragmentationRoll: 0.57,
    existingNarrativeCount: 1,
    relevantWrestlerCount: 3,
    relevantRivalryCount: 1,
    matchHandoffPresent: true,
    fanReactionHandoffPresent: true,
    fanReactionShowOutputReadiness: {
      provided: true,
      structurallyUsable: true,
      inputStatus: "usable",
      shellStatus: "ready",
      readyForSocialDiscourseHandoff: true,
      issueCount: 0,
      matchCount: 1,
      showId: "show-week-7"
    },
    showSignalReadiness: {
      expectedSignalCount: 5,
      presentSignalCount: 5,
      missingSignalCount: 0,
      unusableSignalCount: 0,
      fields: {
        crowdEnergyRead: "present",
        bookingTrustRead: "present",
        featuredTalentReceptionRead: "present",
        showMomentumRead: "present",
        confidenceRead: "present"
      }
    },
    discourseReadinessBuckets: {
      iwcPulseReadiness: "structurally-ready",
      mediaNarrativeReadiness: "structurally-ready",
      lockerRoomBuzzReadiness: "structurally-ready",
      fanDebateReadiness: "structurally-ready",
      trendVolatilityReadiness: "structurally-ready"
    },
    discourseOutputShell: {
      sourceEngine: "social-discourse",
      playerFacing: false,
      iwcPulse: {
        status: "structurally-ready",
        readiness: "structurally-ready",
        sourceAvailability: "available"
      },
      mediaNarrative: {
        status: "structurally-ready",
        readiness: "structurally-ready",
        sourceAvailability: "available"
      },
      lockerRoomBuzz: {
        status: "structurally-ready",
        readiness: "structurally-ready",
        sourceAvailability: "available"
      },
      fanDebate: {
        status: "structurally-ready",
        readiness: "structurally-ready",
        sourceAvailability: "available"
      },
      trendVolatility: {
        status: "structurally-ready",
        readiness: "structurally-ready",
        sourceAvailability: "available"
      }
    },
    discourseRead: "rising",
    updatedNarrativeCount: 1,
    discourseSpread: 63,
    backlashRisk: 31,
    rumorCredibility: 24
  },
  signals: [
    {
      subject: "social",
      subjectId: "narrative-crowe-valor-finish",
      signals: [
        {
          id: "signal-social-debate",
          subject: "social",
          subjectId: "narrative-crowe-valor-finish",
          category: "social",
          label: "noticeable chatter",
          confidence: "low",
          trend: "rising",
          sourceEngine: "social-discourse"
        }
      ]
    }
  ]
};
