import type {
  MatchFinishControversyIntent,
  MatchFinishIntent,
  MatchFinishIntentType,
  MatchFinishProtectionIntent
} from "./matchFinishIntent.ts";
import { normalizeMatchFinishIntent } from "./matchFinishIntent.ts";
import type { MatchFinishIntentValidationSummary } from "./matchFinishIntentValidation.ts";
import type { MatchReadSummary } from "./matchRead.ts";
import type { MatchTalentReadSummary } from "./matchTalentRead.ts";

export type MatchFinishReadBand =
  | "unknown"
  | "stable"
  | "protected"
  | "risky"
  | "disputed"
  | "volatile";

export type MatchFinishProtectionRead = MatchFinishReadBand;
export type MatchFinishRiskRead = MatchFinishReadBand;
export type MatchFinishControversyRead = MatchFinishReadBand;
export type MatchFinishMomentumRead = MatchFinishReadBand;
export type MatchFinishConfidenceRead = MatchFinishReadBand;

export interface MatchFinishReadSummary {
  finishIntentTypeRead: MatchFinishIntentType;
  finishProtectionRead: MatchFinishProtectionRead;
  finishRiskRead: MatchFinishRiskRead;
  finishControversyRead: MatchFinishControversyRead;
  finishMomentumRead: MatchFinishMomentumRead;
  finishConfidenceRead: MatchFinishConfidenceRead;
}

export interface MatchFinishReadInput {
  matchReadSummary: MatchReadSummary;
  talentReadSummary: MatchTalentReadSummary;
  participantCount: number;
  plannedMinutes: number;
  finishIntent?: MatchFinishIntent;
  finishIntentValidation?: MatchFinishIntentValidationSummary;
}

export function createMatchFinishReadSummary(
  input: MatchFinishReadInput
): MatchFinishReadSummary {
  const finishIntent = normalizeMatchFinishIntent(input.finishIntent);
  const confidenceRead = finishConfidenceReadFor(
    input.talentReadSummary,
    finishIntent.type,
    input.finishIntentValidation
  );
  const riskRead = finishRiskReadFor(
    input.matchReadSummary,
    input.participantCount,
    input.plannedMinutes,
    finishIntent.type,
    finishIntent.protection,
    finishIntent.controversy,
    input.finishIntentValidation
  );
  const controversyRead = finishControversyReadFor(
    input.matchReadSummary,
    input.participantCount,
    riskRead,
    finishIntent.type,
    finishIntent.controversy,
    input.finishIntentValidation
  );

  return {
    finishIntentTypeRead: finishIntent.type,
    finishProtectionRead: finishProtectionReadFor(
      input.matchReadSummary,
      confidenceRead,
      riskRead,
      finishIntent.type,
      finishIntent.protection
    ),
    finishRiskRead: riskRead,
    finishControversyRead: controversyRead,
    finishMomentumRead: finishMomentumReadFor(input.matchReadSummary, riskRead, finishIntent.type),
    finishConfidenceRead: confidenceRead
  };
}

function finishConfidenceReadFor(
  talentReadSummary: MatchTalentReadSummary,
  finishIntentType: MatchFinishIntentType,
  validationSummary: MatchFinishIntentValidationSummary | undefined
): MatchFinishConfidenceRead {
  if (validationSummary?.status === "unsupported") {
    return "unknown";
  }

  if (validationSummary?.status === "underspecified") {
    return validationSummary.confidenceBand === "unknown" ? "unknown" : "stable";
  }

  if (finishIntentType === "unspecified") {
    return talentReadSummary.participantCoverage === "none" ? "unknown" : "stable";
  }

  switch (talentReadSummary.participantCoverage) {
    case "full":
      return "protected";
    case "partial":
      return "stable";
    case "none":
      return "unknown";
  }
}

function finishRiskReadFor(
  matchReadSummary: MatchReadSummary,
  participantCount: number,
  plannedMinutes: number,
  finishIntentType: MatchFinishIntentType,
  protectionIntent: MatchFinishProtectionIntent,
  controversyIntent: MatchFinishControversyIntent,
  validationSummary: MatchFinishIntentValidationSummary | undefined
): MatchFinishRiskRead {
  const hasCrowdedFinish = participantCount >= 3;
  const hasLongMatchPressure = plannedMinutes >= 20;
  const hasRiskyIntent =
    finishIntentType === "dirty" ||
    finishIntentType === "interference" ||
    finishIntentType === "non_finish" ||
    finishIntentType === "draw" ||
    finishIntentType === "stoppage" ||
    protectionIntent === "exposed" ||
    controversyIntent === "high";

  if (validationSummary?.status === "unsupported") {
    return "volatile";
  }

  if (validationSummary?.status === "risky" && (hasCrowdedFinish || hasLongMatchPressure)) {
    return "volatile";
  }

  if (
    (matchReadSummary.riskPressureRead === "elevated" || hasRiskyIntent) &&
    (hasCrowdedFinish || hasLongMatchPressure || matchReadSummary.readinessRead === "poor")
  ) {
    return "volatile";
  }

  if (
    matchReadSummary.riskPressureRead === "elevated" ||
    matchReadSummary.readinessRead === "poor" ||
    matchReadSummary.chemistryRead === "concern" ||
    hasRiskyIntent ||
    validationSummary?.status === "risky"
  ) {
    return "risky";
  }

  if (hasCrowdedFinish && matchReadSummary.competitivenessRead !== "even") {
    return "risky";
  }

  return "stable";
}

function finishControversyReadFor(
  matchReadSummary: MatchReadSummary,
  participantCount: number,
  riskRead: MatchFinishRiskRead,
  finishIntentType: MatchFinishIntentType,
  controversyIntent: MatchFinishControversyIntent,
  validationSummary: MatchFinishIntentValidationSummary | undefined
): MatchFinishControversyRead {
  if (
    riskRead === "volatile" ||
    controversyIntent === "high" ||
    validationSummary?.status === "unsupported"
  ) {
    return "volatile";
  }

  if (
    finishIntentType === "interference" ||
    finishIntentType === "non_finish" ||
    finishIntentType === "draw" ||
    finishIntentType === "stoppage" ||
    controversyIntent === "moderate" ||
    validationSummary?.status === "risky"
  ) {
    return "disputed";
  }

  if (
    matchReadSummary.competitivenessRead === "mismatch" ||
    (participantCount >= 3 && matchReadSummary.competitivenessRead === "clear-edge")
  ) {
    return "disputed";
  }

  if (participantCount >= 3 || riskRead === "risky") {
    return "risky";
  }

  return "stable";
}

function finishProtectionReadFor(
  matchReadSummary: MatchReadSummary,
  confidenceRead: MatchFinishConfidenceRead,
  riskRead: MatchFinishRiskRead,
  finishIntentType: MatchFinishIntentType,
  protectionIntent: MatchFinishProtectionIntent
): MatchFinishProtectionRead {
  if (confidenceRead === "unknown") {
    return "unknown";
  }

  if (riskRead === "volatile") {
    return "volatile";
  }

  if (protectionIntent === "protected" && riskRead === "stable") {
    return "protected";
  }

  if (
    protectionIntent === "exposed" ||
    protectionIntent === "disputed" ||
    finishIntentType === "dirty" ||
    finishIntentType === "interference" ||
    finishIntentType === "non_finish"
  ) {
    return "disputed";
  }

  if (riskRead === "risky" || matchReadSummary.chemistryRead === "concern") {
    return "risky";
  }

  if (
    matchReadSummary.competitivenessRead === "clear-edge" ||
    matchReadSummary.competitivenessRead === "mismatch" ||
    matchReadSummary.readinessRead === "strong"
  ) {
    return "protected";
  }

  return "stable";
}

function finishMomentumReadFor(
  matchReadSummary: MatchReadSummary,
  riskRead: MatchFinishRiskRead,
  finishIntentType: MatchFinishIntentType
): MatchFinishMomentumRead {
  if (riskRead === "volatile") {
    return "volatile";
  }

  if (finishIntentType === "draw" || finishIntentType === "stoppage") {
    return "disputed";
  }

  if (riskRead === "risky" || matchReadSummary.readinessRead === "poor") {
    return "risky";
  }

  if (
    (matchReadSummary.crowdPotentialRead === "hot" ||
      matchReadSummary.crowdPotentialRead === "special") &&
    matchReadSummary.chemistryRead === "promising"
  ) {
    return "protected";
  }

  return "stable";
}
