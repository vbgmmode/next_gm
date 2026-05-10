import type { MatchTalentReadBand, MatchTalentReadSummary } from "./matchTalentRead.ts";

export type MatchReadBand = "missing" | "low" | "developing" | "solid" | "strong" | "elite";

export type MatchCompetitivenessRead = "even" | "slight-edge" | "clear-edge" | "mismatch";

export type MatchCrowdPotentialRead = "cold" | "modest" | "solid" | "hot" | "special";

export type MatchReadinessRead = "poor" | "uneven" | "ready" | "strong";

export type MatchRiskRead = "low" | "moderate" | "elevated";

export type MatchChemistryRead = "concern" | "neutral" | "promising";

export interface MatchReadSummary {
  talentCoverage: MatchTalentReadSummary["participantCoverage"];
  competitivenessRead: MatchCompetitivenessRead;
  crowdPotentialRead: MatchCrowdPotentialRead;
  readinessRead: MatchReadinessRead;
  riskPressureRead: MatchRiskRead;
  chemistryRead: MatchChemistryRead;
  strongestReadinessBand: MatchReadBand;
  weakestReadinessBand: MatchReadBand;
}

export interface MatchReadInput {
  talentReadSummary: MatchTalentReadSummary;
  skillBalanceGap: number;
  chemistryEstimate: number;
  crowdEngagementRead: number;
}

export function createMatchReadSummary(input: MatchReadInput): MatchReadSummary {
  const presentReads = input.talentReadSummary.participantReads.filter(
    (participantRead) => participantRead.profilePresent
  );
  const readinessBands = presentReads.map((participantRead) =>
    readBandValue(participantRead.overallReadinessBand)
  );
  const crowdBands = presentReads.map((participantRead) =>
    readBandValue(participantRead.crowdConnectionBand)
  );
  const riskBands = presentReads.map((participantRead) =>
    readBandValue(participantRead.backstageRiskBand) +
    readBandValue(participantRead.fatiguePressureBand)
  );
  const strongestReadinessValue = readinessBands.length ? Math.max(...readinessBands) : 0;
  const weakestReadinessValue = readinessBands.length ? Math.min(...readinessBands) : 0;
  const readinessSpread = strongestReadinessValue - weakestReadinessValue;
  const averageReadiness = average(readinessBands);
  const averageCrowdConnection = average(crowdBands);
  const averageRiskPressure = average(riskBands);
  const talentCoveragePenalty = input.talentReadSummary.participantCoverage === "full" ? 0 : 1;

  return {
    talentCoverage: input.talentReadSummary.participantCoverage,
    competitivenessRead: competitivenessReadFor(
      input.skillBalanceGap,
      readinessSpread,
      talentCoveragePenalty
    ),
    crowdPotentialRead: crowdPotentialReadFor(input.crowdEngagementRead, averageCrowdConnection),
    readinessRead: readinessReadFor(averageReadiness, input.talentReadSummary.participantCoverage),
    riskPressureRead: riskPressureReadFor(averageRiskPressure),
    chemistryRead: chemistryReadFor(input.chemistryEstimate, averageReadiness),
    strongestReadinessBand: bandForValue(strongestReadinessValue),
    weakestReadinessBand: bandForValue(weakestReadinessValue)
  };
}

function competitivenessReadFor(
  skillBalanceGap: number,
  readinessSpread: number,
  talentCoveragePenalty: number
): MatchCompetitivenessRead {
  const edgePressure = skillBalanceGap / 14 + readinessSpread + talentCoveragePenalty;

  if (edgePressure >= 5) {
    return "mismatch";
  }

  if (edgePressure >= 3) {
    return "clear-edge";
  }

  if (edgePressure >= 1.5) {
    return "slight-edge";
  }

  return "even";
}

function crowdPotentialReadFor(
  crowdEngagementRead: number,
  averageCrowdConnection: number
): MatchCrowdPotentialRead {
  const crowdPotential = crowdEngagementRead / 25 + averageCrowdConnection;

  if (crowdPotential >= 7) {
    return "special";
  }

  if (crowdPotential >= 5.5) {
    return "hot";
  }

  if (crowdPotential >= 4) {
    return "solid";
  }

  if (crowdPotential >= 2.5) {
    return "modest";
  }

  return "cold";
}

function readinessReadFor(
  averageReadiness: number,
  talentCoverage: MatchTalentReadSummary["participantCoverage"]
): MatchReadinessRead {
  if (talentCoverage === "none") {
    return "uneven";
  }

  if (averageReadiness >= 4) {
    return "strong";
  }

  if (averageReadiness >= 3) {
    return "ready";
  }

  if (averageReadiness >= 2) {
    return "uneven";
  }

  return "poor";
}

function riskPressureReadFor(averageRiskPressure: number): MatchRiskRead {
  if (averageRiskPressure >= 6) {
    return "elevated";
  }

  if (averageRiskPressure >= 3) {
    return "moderate";
  }

  return "low";
}

function chemistryReadFor(chemistryEstimate: number, averageReadiness: number): MatchChemistryRead {
  const chemistryPotential = chemistryEstimate / 25 + averageReadiness;

  if (chemistryPotential >= 6) {
    return "promising";
  }

  if (chemistryPotential >= 4) {
    return "neutral";
  }

  return "concern";
}

function readBandValue(band: MatchTalentReadBand): number {
  switch (band) {
    case "elite":
      return 5;
    case "strong":
      return 4;
    case "solid":
      return 3;
    case "developing":
      return 2;
    case "low":
      return 1;
    case "missing":
      return 0;
  }
}

function bandForValue(value: number): MatchReadBand {
  switch (value) {
    case 5:
      return "elite";
    case 4:
      return "strong";
    case 3:
      return "solid";
    case 2:
      return "developing";
    case 1:
      return "low";
    default:
      return "missing";
  }
}

function average(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((total, value) => total + value, 0) / values.length;
}
