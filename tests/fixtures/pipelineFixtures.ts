import type {
  FanReactionEngineInput,
  FanReactionEngineResult,
  MatchEngineInput,
  MatchEngineResult,
  ShowEngineInput,
  SocialDiscourseEngineInput
} from "../../src/game/engines/index.ts";
import { createFanSocialDiscourseHandoff } from "../../src/game/engines/index.ts";
import {
  sampleFanSegments,
  sampleMatch,
  samplePromotion,
  sampleRivalry,
  sampleShow,
  sampleSocialNarratives,
  sampleTalentProfiles,
  sampleWrestlers
} from "./domainFixtures.ts";
import {
  sampleFanReactionEngineResult,
  sampleMatchEngineResult,
  sampleSocialDiscourseEngineResult
} from "./engineResultFixtures.ts";

export function createSampleMatchEngineInput(): MatchEngineInput {
  return {
    match: sampleMatch,
    show: sampleShow,
    promotion: samplePromotion,
    participants: sampleWrestlers.filter((wrestler) =>
      sampleMatch.participantIds.some((participant) => participant.wrestlerId === wrestler.id)
    ),
    fanSegments: sampleFanSegments,
    rivalry: sampleRivalry
  };
}

export function createParticipantTalentProfiles(
  profiles = sampleTalentProfiles
): NonNullable<MatchEngineInput["participantTalentProfiles"]> {
  return Object.fromEntries(profiles.map((profile) => [profile.wrestlerId, profile]));
}

export function createSampleMatchEngineInputWithTalentProfiles(): MatchEngineInput {
  return {
    ...createSampleMatchEngineInput(),
    participantTalentProfiles: createParticipantTalentProfiles()
  };
}

export function createSampleMatchEngineInputWithPartialTalentProfiles(): MatchEngineInput {
  return {
    ...createSampleMatchEngineInput(),
    participantTalentProfiles: createParticipantTalentProfiles([sampleTalentProfiles[0]])
  };
}

export function createSampleMatchEngineInputWithLowTalentProfiles(): MatchEngineInput {
  return {
    ...createSampleMatchEngineInput(),
    participantTalentProfiles: createParticipantTalentProfiles(
      sampleTalentProfiles
        .filter((profile) =>
          sampleMatch.participantIds.some((participant) => participant.wrestlerId === profile.wrestlerId)
        )
        .map((profile) => ({
          ...profile,
          attributes: {
            ...profile.attributes,
            inRingSkill: 35,
            promoSkill: 35,
            starPower: 35
          },
          condition: {
            ...profile.condition,
            stamina: 35,
            fatigue: 86,
            injuryRisk: 78,
            wearAndTear: 84,
            freshness: 28,
            overexposure: 82
          },
          perception: {
            ...profile.perception,
            casualAppeal: 35,
            hardcoreAppeal: 35,
            crowdConnection: 35
          },
          backstage: {
            ...profile.backstage,
            ego: 84,
            professionalism: 32,
            creativeFrustration: 82,
            backstageInfluence: 76
          }
        }))
    )
  };
}

export function createSampleMatchEngineInputWithFinishIntent(
  finishIntent: NonNullable<MatchEngineInput["finishIntent"]>
): MatchEngineInput {
  return {
    ...createSampleMatchEngineInputWithTalentProfiles(),
    finishIntent
  };
}

export function createSampleShowEngineInput(): ShowEngineInput {
  return {
    show: sampleShow,
    promotion: samplePromotion,
    marketState: samplePromotion.marketState,
    backstageState: samplePromotion.backstageState,
    bookedMatches: [
      {
        id: "booked-main-event",
        matchInput: createSampleMatchEngineInputWithTalentProfiles()
      }
    ]
  };
}

export function createSampleShowEngineInputWithoutMatches(): ShowEngineInput {
  return {
    show: sampleShow,
    promotion: samplePromotion,
    marketState: samplePromotion.marketState,
    backstageState: samplePromotion.backstageState,
    bookedMatches: []
  };
}

export function createSampleShowEngineInputWithMultipleMatches(): ShowEngineInput {
  const openerMatch: MatchEngineInput["match"] = {
    ...sampleMatch,
    id: "match-opener",
    participantIds: [
      { wrestlerId: "wrestler-jade-valor", sideId: "side-face" },
      { wrestlerId: "wrestler-rio-ace", sideId: "side-prospect" }
    ],
    rivalryId: undefined,
    plannedWinnerId: undefined,
    stipulation: "showcase",
    plannedMinutes: 12,
    stakes: "medium"
  };
  const openerInput: MatchEngineInput = {
    ...createSampleMatchEngineInputWithTalentProfiles(),
    match: openerMatch,
    participants: sampleWrestlers.filter((wrestler) =>
      openerMatch.participantIds.some((participant) => participant.wrestlerId === wrestler.id)
    ),
    rivalry: undefined
  };

  return {
    show: sampleShow,
    promotion: samplePromotion,
    marketState: samplePromotion.marketState,
    backstageState: samplePromotion.backstageState,
    bookedMatches: [
      {
        id: "booked-opener",
        matchInput: openerInput
      },
      {
        id: "booked-main-event",
        matchInput: createSampleMatchEngineInputWithTalentProfiles()
      }
    ]
  };
}

export function createSampleFanReactionEngineInput(
  matchResult: MatchEngineResult = sampleMatchEngineResult
): FanReactionEngineInput {
  return {
    promotion: samplePromotion,
    fanSegments: sampleFanSegments,
    relevantWrestlers: sampleWrestlers,
    relevantRivalries: [sampleRivalry],
    priorSocialNarratives: sampleSocialNarratives,
    matchResult
  };
}

export function createSampleSocialDiscourseEngineInput(
  matchResult: MatchEngineResult = sampleMatchEngineResult,
  fanReactionResult: FanReactionEngineResult = sampleFanReactionEngineResult
): SocialDiscourseEngineInput {
  return {
    promotion: samplePromotion,
    relevantWrestlers: sampleWrestlers,
    relevantRivalries: [sampleRivalry],
    existingNarratives: sampleSocialNarratives,
    matchResult,
    fanReactionResult,
    fanReactionShowHandoff: createFanSocialDiscourseHandoff(
      fanReactionResult.hiddenState.showOutputShell
    )
  };
}

export const samplePipelineHandoff = {
  matchInput: createSampleMatchEngineInput(),
  matchResult: sampleMatchEngineResult,
  fanReactionInput: createSampleFanReactionEngineInput(sampleMatchEngineResult),
  fanReactionResult: sampleFanReactionEngineResult,
  socialDiscourseInput: createSampleSocialDiscourseEngineInput(
    sampleMatchEngineResult,
    sampleFanReactionEngineResult
  ),
  socialDiscourseResult: sampleSocialDiscourseEngineResult
} as const;
