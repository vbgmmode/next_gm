import type {
  BackstageState,
  FanSegment,
  FinancialState,
  MarketState,
  Match,
  Promotion,
  Rivalry,
  Show,
  SimulationEngineContext,
  SocialNarrative,
  TalentProfile,
  Wrestler
} from "../../src/game/domain/index.ts";
import { RandomService } from "../../src/game/simulation/randomService.ts";

export const sampleMarketState: MarketState = {
  id: "market-mid-atlantic",
  name: "Mid-Atlantic",
  totalAudience: 1200000,
  marketShare: 48,
  growth: 6,
  competitionIntensity: 62,
  mediaAttention: 54,
  ticketDemand: 58
};

export const sampleBackstageState: BackstageState = {
  morale: 61,
  cohesion: 56,
  politics: 42,
  leakRisk: 28,
  injuryConcern: 34,
  creativeConfidence: 64
};

export const sampleFinancialState: FinancialState = {
  cashOnHand: 2450000,
  weeklyRevenue: 380000,
  weeklyExpenses: 315000,
  payrollCost: 170000,
  productionCost: 90000,
  marketingSpend: 35000,
  profitabilityTrend: 8,
  budgetPressure: 46
};

export const samplePromotion: Promotion = {
  id: "promotion-apex",
  name: "Apex Wrestling",
  marketState: sampleMarketState,
  financialState: sampleFinancialState,
  backstageState: sampleBackstageState,
  rosterIds: ["wrestler-jade-valor", "wrestler-marcus-crowe", "wrestler-rio-ace"],
  fanTrust: 57,
  brandIdentity: ["sports-forward", "character-driven", "young-roster"],
  momentum: 53
};

export const sampleWrestlers: readonly Wrestler[] = [
  {
    id: "wrestler-jade-valor",
    name: "Jade Valor",
    age: 29,
    alignment: "face",
    promotionId: samplePromotion.id,
    popularity: 72,
    credibility: 68,
    inRingSkill: 81,
    promoSkill: 69,
    stamina: 74,
    health: 88,
    morale: 63,
    momentum: 71,
    contractCostPerWeek: 28000,
    traits: ["resilient", "main-event-upside"]
  },
  {
    id: "wrestler-marcus-crowe",
    name: "Marcus Crowe",
    age: 36,
    alignment: "heel",
    promotionId: samplePromotion.id,
    popularity: 69,
    credibility: 76,
    inRingSkill: 73,
    promoSkill: 84,
    stamina: 66,
    health: 79,
    morale: 54,
    momentum: 58,
    contractCostPerWeek: 32000,
    traits: ["political", "elite-promo"]
  },
  {
    id: "wrestler-rio-ace",
    name: "Rio Ace",
    age: 24,
    alignment: "tweener",
    promotionId: samplePromotion.id,
    popularity: 49,
    credibility: 44,
    inRingSkill: 77,
    promoSkill: 51,
    stamina: 86,
    health: 91,
    morale: 70,
    momentum: 62,
    contractCostPerWeek: 12000,
    traits: ["prospect", "high-risk-style"]
  }
];

export const sampleFanSegments: readonly FanSegment[] = [
  {
    id: "segment-casual",
    kind: "casual",
    name: "Casual TV Audience",
    marketShare: 42,
    companyTrust: 55,
    noveltyPreference: 54,
    workratePreference: 38,
    storyPreference: 67,
    metaAwareness: 29,
    toleranceForForcedPushes: 51,
    fatigueSensitivity: 47
  },
  {
    id: "segment-iwc",
    kind: "iwc",
    name: "Online Hardcore Fans",
    marketShare: 18,
    companyTrust: 48,
    noveltyPreference: 71,
    workratePreference: 82,
    storyPreference: 59,
    metaAwareness: 91,
    toleranceForForcedPushes: 24,
    fatigueSensitivity: 73
  }
];

export const sampleMatch: Match = {
  id: "match-main-event",
  showId: "show-week-7",
  participantIds: [
    { wrestlerId: "wrestler-jade-valor", sideId: "side-face" },
    { wrestlerId: "wrestler-marcus-crowe", sideId: "side-heel" }
  ],
  rivalryId: "rivalry-valor-crowe",
  stipulation: "contender final",
  plannedWinnerId: "wrestler-jade-valor",
  plannedMinutes: 18,
  stakes: "high"
};

export const sampleShow: Show = {
  id: "show-week-7",
  promotionId: samplePromotion.id,
  name: "Apex Friday Fight",
  week: 7,
  marketId: sampleMarketState.id,
  venueName: "Harbor Civic Center",
  segmentIds: ["segment-opening-promo", "segment-main-event"],
  segments: [
    {
      id: "segment-opening-promo",
      type: "promo",
      involvedWrestlerIds: ["wrestler-jade-valor", "wrestler-marcus-crowe"],
      rivalryId: "rivalry-valor-crowe",
      plannedMinutes: 8
    },
    {
      id: "segment-main-event",
      type: "match",
      matchId: sampleMatch.id,
      involvedWrestlerIds: ["wrestler-jade-valor", "wrestler-marcus-crowe"],
      rivalryId: "rivalry-valor-crowe",
      plannedMinutes: sampleMatch.plannedMinutes
    }
  ],
  budgetAllocated: 125000
};

export const sampleRivalry: Rivalry = {
  id: "rivalry-valor-crowe",
  promotionId: samplePromotion.id,
  participantIds: ["wrestler-jade-valor", "wrestler-marcus-crowe"],
  title: "Valor vs Crowe",
  heat: 67,
  clarity: 61,
  freshness: 74,
  polarization: 38,
  beats: [
    {
      id: "beat-crowe-cheapshot",
      week: 6,
      type: "backstage",
      participantIds: ["wrestler-jade-valor", "wrestler-marcus-crowe"],
      summarySignal: "Crowe's ambush gave the feud sharper stakes."
    }
  ]
};

export const sampleSocialNarratives: readonly SocialNarrative[] = [
  {
    id: "narrative-valor-push",
    topic: "Jade Valor's climb is gaining attention",
    relatedPromotionId: samplePromotion.id,
    relatedWrestlerIds: ["wrestler-jade-valor"],
    relatedRivalryId: sampleRivalry.id,
    sentiment: 58,
    volatility: 46,
    spread: 51,
    credibility: 64,
    trend: "rising"
  }
];

export const sampleTalentProfiles: readonly TalentProfile[] = [
  {
    id: "talent-jade-valor",
    wrestlerId: "wrestler-jade-valor",
    attributes: {
      inRingSkill: 82,
      promoSkill: 70,
      charisma: 78,
      starPower: 74,
      athleticism: 86,
      psychology: 72,
      selling: 76,
      toughness: 80,
      consistency: 77,
      safety: 75,
      creativity: 73,
      marketability: 79
    },
    condition: {
      stamina: 76,
      fatigue: 24,
      injuryRisk: 22,
      wearAndTear: 28,
      freshness: 71,
      overexposure: 34
    },
    momentum: {
      momentum: 74,
      confidence: 72,
      recentProtection: 69,
      recentLossPressure: 18,
      pushMomentum: 76,
      coolingRisk: 24
    },
    perception: {
      casualAppeal: 73,
      hardcoreAppeal: 68,
      promoConnection: 70,
      crowdConnection: 78,
      credibility: 71,
      polarizingEffect: 32,
      forcedPushRisk: 26
    },
    backstage: {
      morale: 68,
      ego: 42,
      professionalism: 82,
      creativeFrustration: 24,
      backstageInfluence: 41,
      lockerRoomReputation: 74
    },
    scoutingReport: {
      wrestlerId: "wrestler-jade-valor",
      signals: [
        {
          id: "scout-jade-elite-upside",
          wrestlerId: "wrestler-jade-valor",
          category: "ability",
          label: "elite upside",
          confidence: "medium",
          trend: "rising"
        },
        {
          id: "scout-jade-heating-up",
          wrestlerId: "wrestler-jade-valor",
          category: "momentum",
          label: "heating up",
          confidence: "high",
          trend: "rising"
        },
        {
          id: "scout-jade-crowd-connection",
          wrestlerId: "wrestler-jade-valor",
          category: "perception",
          label: "strong crowd connection",
          confidence: "medium",
          trend: "rising"
        }
      ]
    }
  },
  {
    id: "talent-marcus-crowe",
    wrestlerId: "wrestler-marcus-crowe",
    attributes: {
      inRingSkill: 74,
      promoSkill: 86,
      charisma: 84,
      starPower: 76,
      athleticism: 65,
      psychology: 83,
      selling: 72,
      toughness: 78,
      consistency: 70,
      safety: 68,
      creativity: 79,
      marketability: 73
    },
    condition: {
      stamina: 64,
      fatigue: 43,
      injuryRisk: 36,
      wearAndTear: 52,
      freshness: 46,
      overexposure: 58
    },
    momentum: {
      momentum: 60,
      confidence: 66,
      recentProtection: 56,
      recentLossPressure: 38,
      pushMomentum: 54,
      coolingRisk: 41
    },
    perception: {
      casualAppeal: 67,
      hardcoreAppeal: 71,
      promoConnection: 85,
      crowdConnection: 70,
      credibility: 78,
      polarizingEffect: 57,
      forcedPushRisk: 39
    },
    backstage: {
      morale: 55,
      ego: 72,
      professionalism: 61,
      creativeFrustration: 48,
      backstageInfluence: 69,
      lockerRoomReputation: 52
    },
    scoutingReport: {
      wrestlerId: "wrestler-marcus-crowe",
      signals: [
        {
          id: "scout-crowe-reliable-worker",
          wrestlerId: "wrestler-marcus-crowe",
          category: "ability",
          label: "reliable worker",
          confidence: "high",
          trend: "stable"
        },
        {
          id: "scout-crowe-major-presence",
          wrestlerId: "wrestler-marcus-crowe",
          category: "perception",
          label: "major star presence",
          confidence: "medium",
          trend: "stable"
        },
        {
          id: "scout-crowe-locker-room-concern",
          wrestlerId: "wrestler-marcus-crowe",
          category: "backstage",
          label: "locker room concern",
          confidence: "low",
          trend: "volatile"
        }
      ]
    }
  },
  {
    id: "talent-rio-ace",
    wrestlerId: "wrestler-rio-ace",
    attributes: {
      inRingSkill: 78,
      promoSkill: 52,
      charisma: 60,
      starPower: 55,
      athleticism: 88,
      psychology: 58,
      selling: 69,
      toughness: 71,
      consistency: 54,
      safety: 58,
      creativity: 76,
      marketability: 62
    },
    condition: {
      stamina: 87,
      fatigue: 19,
      injuryRisk: 31,
      wearAndTear: 22,
      freshness: 82,
      overexposure: 18
    },
    momentum: {
      momentum: 63,
      confidence: 57,
      recentProtection: 48,
      recentLossPressure: 28,
      pushMomentum: 61,
      coolingRisk: 30
    },
    perception: {
      casualAppeal: 51,
      hardcoreAppeal: 74,
      promoConnection: 47,
      crowdConnection: 60,
      credibility: 46,
      polarizingEffect: 48,
      forcedPushRisk: 42
    },
    backstage: {
      morale: 72,
      ego: 31,
      professionalism: 69,
      creativeFrustration: 29,
      backstageInfluence: 22,
      lockerRoomReputation: 66
    },
    scoutingReport: {
      wrestlerId: "wrestler-rio-ace",
      signals: [
        {
          id: "scout-rio-protected-prospect",
          wrestlerId: "wrestler-rio-ace",
          category: "momentum",
          label: "protected prospect",
          confidence: "medium",
          trend: "rising"
        },
        {
          id: "scout-rio-inconsistent",
          wrestlerId: "wrestler-rio-ace",
          category: "ability",
          label: "inconsistent",
          confidence: "medium",
          trend: "volatile"
        },
        {
          id: "scout-rio-promo-liability",
          wrestlerId: "wrestler-rio-ace",
          category: "risk",
          label: "promo liability",
          confidence: "low",
          trend: "stable"
        }
      ]
    }
  }
];

export function createSampleEngineContext(
  seed: string | number = "pipeline-fixture-week-7",
  week = 7
): SimulationEngineContext {
  return {
    random: new RandomService(seed),
    seed,
    week,
    debug: true
  };
}
