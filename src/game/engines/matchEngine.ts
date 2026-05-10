import type { TrendDirection } from "../domain/index.ts";
import { MATCH_TUNING } from "../tuning/matchTuning.ts";
import type { SimulationEngineContext } from "./engineContext.ts";
import { MATCH_ENGINE_V0_ID } from "./engineIds.ts";
import type { EngineSignal, EngineSignalCategory, PlayerFacingSignal } from "./engineSignals.ts";
import type {
  MatchEngineInput,
  MatchEngineResult,
  MatchHiddenState
} from "./matchEngine.contracts.ts";
import { validateMatchFinishIntent } from "./matchFinishIntentValidation.ts";
import { createMatchFinishReadSummary } from "./matchFinishRead.ts";
import { createMatchReadSummary } from "./matchRead.ts";
import { createMatchResultExecutionGate } from "./matchResultExecutionGate.ts";
import { classifyMatchResultIntent } from "./matchResultIntentClassification.ts";
import { createMatchResultShell } from "./matchResultShell.ts";
import { createMatchTalentRead } from "./matchTalentRead.ts";
import type { MatchSimulationEngine, SimulationEngineRunOptions } from "./simulationEngine.ts";

export const matchEngine: MatchSimulationEngine = {
  metadata: {
    id: MATCH_ENGINE_V0_ID,
    name: "Match Engine v0",
    version: "0.9.0"
  },
  run(input, context, options) {
    return runMatchEngineV0(input, context, options);
  }
};

function runMatchEngineV0(
  input: MatchEngineInput,
  context: SimulationEngineContext,
  options?: SimulationEngineRunOptions
): MatchEngineResult {
  const matchRoll = context.random.next();
  const injuryRiskRoll = context.random.next();
  const momentumRoll = context.random.next();

  const plannedMinutes = clamp(
    input.match.plannedMinutes,
    MATCH_TUNING.minimumMatchMinutes,
    MATCH_TUNING.maximumMatchMinutes
  );
  const skillBalanceGap = calculateSkillBalanceGap(input);
  const chemistryEstimate = clamp(
    MATCH_TUNING.baselineChemistry +
      (input.rivalry ? (input.rivalry.clarity + input.rivalry.freshness - 100) / 4 : 0) -
      skillBalanceGap / 3 +
      matchRoll * 10,
    0,
    100
  );
  const crowdEngagementRead = clamp(
    average(input.fanSegments.map((segment) => segment.storyPreference)) * 0.25 +
      average(input.participants.map((wrestler) => wrestler.popularity)) * 0.35 +
      (input.rivalry?.heat ?? MATCH_TUNING.baselineChemistry) * 0.25 +
      stakeModifier(input.match.stakes) +
      matchRoll * 10,
    0,
    100
  );
  const fatiguePressure = Object.fromEntries(
    input.participants.map((wrestler) => [
      wrestler.id,
      clamp(plannedMinutes - wrestler.stamina / 4 + (1 - injuryRiskRoll) * 10, 0, 100)
    ])
  );
  const talentRead = createMatchTalentRead(
    input.match.participantIds.map((participant) => participant.wrestlerId),
    input.participantTalentProfiles
  );
  const talentReadSummary = talentRead.summary;
  const matchReadSummary = createMatchReadSummary({
    talentReadSummary,
    skillBalanceGap,
    chemistryEstimate,
    crowdEngagementRead
  });
  const finishIntentValidation = validateMatchFinishIntent({
    finishIntent: input.finishIntent,
    matchReadSummary,
    talentReadSummary,
    participantCount: input.match.participantIds.length,
    plannedMinutes,
    stipulation: input.match.stipulation
  });
  const finishReadSummary = createMatchFinishReadSummary({
    matchReadSummary,
    talentReadSummary,
    participantCount: input.match.participantIds.length,
    plannedMinutes,
    finishIntent: input.finishIntent,
    finishIntentValidation
  });
  const resultShell = createMatchResultShell({
    matchReadSummary,
    finishReadSummary,
    finishIntentValidation,
    talentReadSummary
  });
  const resultExecutionGate = createMatchResultExecutionGate(resultShell);
  const resultIntentClassification = classifyMatchResultIntent({
    finishReadSummary,
    finishIntentValidation,
    resultShell,
    resultExecutionGate
  });

  const hiddenState: MatchHiddenState = {
    matchRoll,
    injuryRiskRoll,
    momentumRoll,
    plannedMinutes,
    participantCount: input.participants.length,
    skillBalanceGap,
    chemistryEstimate,
    crowdEngagementRead,
    fatiguePressure,
    talentProfileCoverage: talentReadSummary.participantCoverage,
    matchedTalentProfileCount: talentReadSummary.matchedProfileCount,
    missingTalentProfileWrestlerIds: talentReadSummary.missingProfileWrestlerIds,
    talentProfileReadStatus: talentReadSummary.readStatus,
    talentReadSummary,
    matchReadSummary,
    finishReadSummary,
    finishIntentValidation,
    resultShell,
    resultExecutionGate,
    resultIntentClassification
  };

  const signals = buildPlayerFacingSignals(input, hiddenState);
  const debugEnabled = options?.debug === true || context.debug === true;

  return {
    engineName: "match",
    matchId: input.match.id,
    changedWrestlerIds: input.participants.map((wrestler) => wrestler.id),
    changedRivalryIds: input.rivalry ? [input.rivalry.id] : input.match.rivalryId ? [input.match.rivalryId] : [],
    hiddenState,
    signals,
    debugTrace: debugEnabled
      ? {
          playerFacing: false,
          engineName: "match",
          steps: [
            "Accepted match input",
            "Read canonical SimulationEngineContext from run()",
            "Used seeded context.random rolls",
            "Read optional TalentProfile bands without applying match formulas",
            "Prepared tiny hidden match read from normalized talent bands",
            "Validated optional finish intent without blocking match execution",
            "Prepared hidden finish read placeholder from optional finish intent without calculating a finish",
            "Prepared hidden result shell without result payloads",
            "Prepared hidden result execution gate without executing a result",
            "Classified hidden result intent readiness without executing a finish",
            "Returned placeholder hidden state and player-facing signals"
          ],
          hiddenRolls: [matchRoll, injuryRiskRoll, momentumRoll],
          notes: [
            "Match Engine v0 is a production shell only; no winner or star-rating formula executed.",
            `TalentProfile read status: ${talentReadSummary.readStatus}.`,
            `TalentProfile coverage: ${talentReadSummary.participantCoverage}.`,
            `Missing TalentProfile wrestlerIds: ${talentReadSummary.missingProfileWrestlerIds.join(", ") || "none"}.`,
            `Hidden match read: ${matchReadSummary.competitivenessRead}, ${matchReadSummary.crowdPotentialRead}, ${matchReadSummary.readinessRead}.`,
            `Hidden finish intent validation: ${finishIntentValidation.status}, ${finishIntentValidation.severity}.`,
            `Hidden finish read: ${finishReadSummary.finishIntentTypeRead}, ${finishReadSummary.finishProtectionRead}, ${finishReadSummary.finishRiskRead}, ${finishReadSummary.finishConfidenceRead}.`,
            `Hidden result shell: ${resultShell.status}, ${resultShell.readiness}, ${resultShell.confidence}.`,
            `Hidden result execution gate: ${resultExecutionGate.status}, ${resultExecutionGate.canExecuteResult ? "eligible" : "ineligible"}.`,
            `Hidden result intent classification: ${resultIntentClassification.classification}.`
          ]
        }
      : undefined
  };
}

function buildPlayerFacingSignals(
  input: MatchEngineInput,
  hiddenState: MatchHiddenState
): readonly EngineSignal[] {
  const matchSignals: PlayerFacingSignal[] = [
    createSignal(
      input.match.id,
      "crowd",
      hiddenState.skillBalanceGap > 28 ? "one-sided" : "competitive",
      hiddenState.skillBalanceGap > 28 ? "stable" : "volatile"
    ),
    createSignal(
      input.match.id,
      "crowd",
      hiddenState.crowdEngagementRead >= 58 ? "crowd was engaged" : "flat reaction",
      hiddenState.crowdEngagementRead >= 58 ? "rising" : "falling"
    )
  ];

  if (hiddenState.chemistryEstimate < 42) {
    matchSignals.push(createSignal(input.match.id, "risk", "chemistry concern", "falling"));
  }

  if (hiddenState.momentumRoll >= 0.72 || input.match.stakes === "major") {
    matchSignals.push(createSignal(input.match.id, "momentum", "momentum shift", "rising"));
  }

  if (hiddenState.crowdEngagementRead >= 72 && hiddenState.matchRoll >= 0.55) {
    matchSignals.push(createSignal(input.match.id, "crowd", "overdelivered", "rising", "low"));
  }

  const wrestlerSignals = input.participants
    .filter((wrestler) => hiddenState.fatiguePressure[wrestler.id] >= MATCH_TUNING.fatiguePenaltyStart)
    .map((wrestler) => ({
      subject: "wrestler" as const,
      subjectId: wrestler.id,
      signals: [
        {
          id: `${input.match.id}-${wrestler.id}-injury-scare`,
          subject: "wrestler" as const,
          subjectId: wrestler.id,
          category: "physical" as const,
          label: "injury scare",
          confidence: "low" as const,
          trend: "volatile" as const,
          sourceEngine: "match" as const
        }
      ]
    }));

  return [
    {
      subject: "match",
      subjectId: input.match.id,
      signals: matchSignals
    },
    ...wrestlerSignals
  ];
}

function createSignal(
  matchId: string,
  category: EngineSignalCategory,
  label: string,
  trend: TrendDirection,
  confidence: PlayerFacingSignal["confidence"] = "medium"
): PlayerFacingSignal {
  return {
    id: `${matchId}-${label.replaceAll(" ", "-")}`,
    subject: "match",
    subjectId: matchId,
    category,
    label,
    confidence,
    trend,
    sourceEngine: "match"
  };
}

function calculateSkillBalanceGap(input: MatchEngineInput): number {
  const sideRatings = new Map<string, number[]>();

  for (const participant of input.match.participantIds) {
    const wrestler = input.participants.find((candidate) => candidate.id === participant.wrestlerId);

    if (!wrestler) {
      continue;
    }

    const ratings = sideRatings.get(participant.sideId) ?? [];
    ratings.push((wrestler.inRingSkill + wrestler.credibility + wrestler.momentum) / 3);
    sideRatings.set(participant.sideId, ratings);
  }

  const averages = [...sideRatings.values()].map(average);

  if (averages.length < 2) {
    return 0;
  }

  return Math.max(...averages) - Math.min(...averages);
}

function stakeModifier(stakes: MatchEngineInput["match"]["stakes"]): number {
  switch (stakes) {
    case "major":
      return 14;
    case "high":
      return 10;
    case "medium":
      return 5;
    case "low":
      return 0;
  }
}

function average(values: readonly number[]): number {
  if (values.length === 0) {
    return MATCH_TUNING.baselineChemistry;
  }

  return values.reduce((total, value) => total + value, 0) / values.length;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
