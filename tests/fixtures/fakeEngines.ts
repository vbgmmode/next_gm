import type {
  FanReactionSimulationEngine,
  MatchSimulationEngine,
  SocialDiscourseSimulationEngine
} from "../../src/game/engines/index.ts";

export const fakeMatchEngine: MatchSimulationEngine = {
  metadata: {
    id: "fake-match-engine",
    name: "Fake Match Engine",
    version: "0.0-test"
  },
  run(input, context, options) {
    const fixtureRoll = context.random.next();

    return {
      engineName: "match",
      matchId: input.match.id,
      changedWrestlerIds: input.participants.map((wrestler) => wrestler.id),
      changedRivalryIds: input.rivalry ? [input.rivalry.id] : [],
      hiddenState: {
        fixtureRoll,
        matchRoll: fixtureRoll,
        injuryRiskRoll: fixtureRoll,
        momentumRoll: fixtureRoll,
        participantCount: input.participants.length,
        plannedMinutes: input.match.plannedMinutes,
        skillBalanceGap: 0,
        chemistryEstimate: 50,
        crowdEngagementRead: 50,
        fatiguePressure: Object.fromEntries(input.participants.map((wrestler) => [wrestler.id, 0]))
      },
      signals: [
        {
          subject: "match",
          subjectId: input.match.id,
          signals: [
            {
              id: "fake-match-signal",
              subject: "match",
              subjectId: input.match.id,
              category: "crowd",
              label: "fixture match signal",
              confidence: "medium",
              trend: "stable",
              sourceEngine: "match"
            }
          ]
        }
      ],
      debugTrace: options?.debug
        ? {
            playerFacing: false,
            engineName: "match",
            steps: ["Accepted match input", "Used seeded fixture roll", "Returned structured match result"],
            hiddenRolls: [fixtureRoll],
            notes: ["Test-only fake engine; no match simulation formula executed."]
          }
        : undefined
    };
  }
};

export const fakeFanReactionEngine: FanReactionSimulationEngine = {
  metadata: {
    id: "fake-fan-reaction-engine",
    name: "Fake Fan Reaction Engine",
    version: "0.0-test"
  },
  run(input, context, options) {
    const fixtureRoll = context.random.next();

    return {
      engineName: "fan-reaction",
      affectedFanSegmentIds: input.fanSegments.map((segment) => segment.id),
      affectedWrestlerIds: input.relevantWrestlers.map((wrestler) => wrestler.id),
      affectedRivalryIds: input.relevantRivalries.map((rivalry) => rivalry.id),
      hiddenState: {
        fixtureRoll,
        receivedMatchId: input.matchResult?.matchId ?? null,
        fanSegmentCount: input.fanSegments.length
      },
      signals: [
        {
          subject: "rivalry",
          subjectId: input.relevantRivalries[0]?.id,
          signals: [
            {
              id: "fake-fan-reaction-signal",
              subject: "rivalry",
              subjectId: input.relevantRivalries[0]?.id,
              category: "crowd",
              label: "fixture fan reaction signal",
              confidence: "medium",
              trend: "stable",
              sourceEngine: "fan-reaction"
            }
          ]
        }
      ],
      debugTrace: options?.debug
        ? {
            playerFacing: false,
            engineName: "fan-reaction",
            steps: ["Accepted fan reaction input", "Read match result handoff", "Returned structured fan result"],
            hiddenRolls: [fixtureRoll],
            notes: ["Test-only fake engine; no fan scoring formula executed."]
          }
        : undefined
    };
  }
};

export const fakeSocialDiscourseEngine: SocialDiscourseSimulationEngine = {
  metadata: {
    id: "fake-social-discourse-engine",
    name: "Fake Social Discourse Engine",
    version: "0.0-test"
  },
  run(input, context, options) {
    const fixtureRoll = context.random.next();

    return {
      engineName: "social-discourse",
      producedNarratives: [],
      updatedNarrativeIds: input.existingNarratives.map((narrative) => narrative.id),
      hiddenState: {
        fixtureRoll,
        receivedMatchId: input.matchResult?.matchId ?? null,
        receivedFanSegmentCount: input.fanReactionResult?.affectedFanSegmentIds.length ?? 0,
        discourseRoll: fixtureRoll,
        rumorRoll: fixtureRoll,
        fragmentationRoll: fixtureRoll,
        existingNarrativeCount: input.existingNarratives.length,
        relevantWrestlerCount: input.relevantWrestlers.length,
        relevantRivalryCount: input.relevantRivalries.length,
        matchHandoffPresent: input.matchResult !== undefined,
        fanReactionHandoffPresent: input.fanReactionResult !== undefined,
        discourseRead: "rising",
        updatedNarrativeCount: input.existingNarratives.length
      },
      signals: [
        {
          subject: "social",
          subjectId: input.existingNarratives[0]?.id,
          signals: [
            {
              id: "fake-social-discourse-signal",
              subject: "social",
              subjectId: input.existingNarratives[0]?.id,
              category: "social",
              label: "fixture social discourse signal",
              confidence: "low",
              trend: "stable",
              sourceEngine: "social-discourse"
            }
          ]
        }
      ],
      debugTrace: options?.debug
        ? {
            playerFacing: false,
            engineName: "social-discourse",
            steps: [
              "Accepted social discourse input",
              "Read fan reaction handoff",
              "Returned structured social result"
            ],
            hiddenRolls: [fixtureRoll],
            notes: ["Test-only fake engine; no social discourse formula or generated text executed."]
          }
        : undefined
    };
  }
};
