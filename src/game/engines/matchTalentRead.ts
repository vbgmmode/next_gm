import type { EntityId, TalentProfile } from "../domain/index.ts";

export type ParticipantTalentProfileMap = {
  readonly [wrestlerId: EntityId]: TalentProfile | undefined;
};

export type TalentProfileCoverage = "full" | "partial" | "none";

export type TalentProfileReadStatus =
  | "not-provided"
  | "full-coverage"
  | "partial-coverage"
  | "no-coverage";

export type MatchTalentReadBand = "missing" | "low" | "developing" | "solid" | "strong" | "elite";

export interface MatchParticipantTalentRead {
  wrestlerId: EntityId;
  profilePresent: boolean;
  inRingBand: MatchTalentReadBand;
  promoBand: MatchTalentReadBand;
  starPowerBand: MatchTalentReadBand;
  staminaConditionBand: MatchTalentReadBand;
  fatiguePressureBand: MatchTalentReadBand;
  crowdConnectionBand: MatchTalentReadBand;
  backstageRiskBand: MatchTalentReadBand;
  overallReadinessBand: MatchTalentReadBand;
}

export interface MatchTalentReadSummary {
  participantCoverage: TalentProfileCoverage;
  matchedProfileCount: number;
  missingProfileWrestlerIds: readonly EntityId[];
  readStatus: TalentProfileReadStatus;
  participantReads: readonly MatchParticipantTalentRead[];
}

export interface MatchTalentRead {
  summary: MatchTalentReadSummary;
}

export function createMatchTalentRead(
  participantWrestlerIds: readonly EntityId[],
  participantTalentProfiles?: ParticipantTalentProfileMap
): MatchTalentRead {
  const wrestlerIds = unique(participantWrestlerIds);
  const participantReads = wrestlerIds.map((wrestlerId) =>
    createParticipantTalentRead(wrestlerId, participantTalentProfiles?.[wrestlerId])
  );
  const missingProfileWrestlerIds = participantReads
    .filter((read) => !read.profilePresent)
    .map((read) => read.wrestlerId);
  const matchedProfileCount = participantReads.length - missingProfileWrestlerIds.length;
  const participantCoverage = coverageFor(matchedProfileCount, wrestlerIds.length);

  return {
    summary: {
      participantCoverage,
      matchedProfileCount,
      missingProfileWrestlerIds,
      readStatus:
        participantTalentProfiles === undefined
          ? "not-provided"
          : readStatusForCoverage(participantCoverage),
      participantReads
    }
  };
}

function createParticipantTalentRead(
  wrestlerId: EntityId,
  profile: TalentProfile | undefined
): MatchParticipantTalentRead {
  if (profile?.wrestlerId !== wrestlerId) {
    return {
      wrestlerId,
      profilePresent: false,
      inRingBand: "missing",
      promoBand: "missing",
      starPowerBand: "missing",
      staminaConditionBand: "missing",
      fatiguePressureBand: "missing",
      crowdConnectionBand: "missing",
      backstageRiskBand: "missing",
      overallReadinessBand: "missing"
    };
  }

  return {
    wrestlerId,
    profilePresent: true,
    inRingBand: bandRating(profile.attributes.inRingSkill),
    promoBand: bandRating(profile.attributes.promoSkill),
    starPowerBand: bandRating(profile.attributes.starPower),
    staminaConditionBand: bandAverage([
      profile.condition.stamina,
      profile.condition.freshness,
      invertRating(profile.condition.injuryRisk),
      invertRating(profile.condition.wearAndTear)
    ]),
    fatiguePressureBand: bandAverage([
      profile.condition.fatigue,
      profile.condition.wearAndTear,
      profile.condition.overexposure
    ]),
    crowdConnectionBand: bandAverage([
      profile.perception.crowdConnection,
      profile.perception.casualAppeal,
      profile.perception.hardcoreAppeal
    ]),
    backstageRiskBand: bandAverage([
      profile.backstage.ego,
      profile.backstage.creativeFrustration,
      profile.backstage.backstageInfluence,
      invertRating(profile.backstage.professionalism)
    ]),
    overallReadinessBand: bandAverage([
      profile.attributes.inRingSkill,
      profile.attributes.starPower,
      profile.condition.stamina,
      profile.condition.freshness,
      profile.momentum.confidence,
      profile.perception.crowdConnection,
      profile.backstage.professionalism
    ])
  };
}

function bandAverage(values: readonly number[]): MatchTalentReadBand {
  return bandRating(values.reduce((total, value) => total + value, 0) / values.length);
}

function bandRating(value: number): MatchTalentReadBand {
  if (value >= 85) {
    return "elite";
  }

  if (value >= 70) {
    return "strong";
  }

  if (value >= 55) {
    return "solid";
  }

  if (value >= 40) {
    return "developing";
  }

  return "low";
}

function invertRating(value: number): number {
  return 100 - value;
}

function coverageFor(matchedCount: number, participantCount: number): TalentProfileCoverage {
  if (matchedCount === 0 || participantCount === 0) {
    return "none";
  }

  if (matchedCount === participantCount) {
    return "full";
  }

  return "partial";
}

function readStatusForCoverage(coverage: TalentProfileCoverage): TalentProfileReadStatus {
  switch (coverage) {
    case "full":
      return "full-coverage";
    case "partial":
      return "partial-coverage";
    case "none":
      return "no-coverage";
  }
}

function unique<T>(values: readonly T[]): readonly T[] {
  return [...new Set(values)];
}
