import type { TrendDirection } from "../domain/index.ts";
import { FAN_TUNING } from "../tuning/fanTuning.ts";
import type { SimulationEngineContext } from "./engineContext.ts";
import { FAN_REACTION_ENGINE_V0_ID } from "./engineIds.ts";
import type { EngineSignal, EngineSignalCategory, PlayerFacingSignal } from "./engineSignals.ts";
import { createFanAudienceRead } from "./fanAudienceRead.ts";
import { createFanReactionShowOutputShell } from "./fanReactionShowOutput.ts";
import type {
  FanReactionEngineInput,
  FanReactionEngineResult,
  FanReactionHiddenState,
  FanReactionInputValidationSummary,
  FanReactionSegmentRead
} from "./fanReactionEngine.contracts.ts";
import type { FanReactionSimulationEngine, SimulationEngineRunOptions } from "./simulationEngine.ts";

export const fanReactionEngine: FanReactionSimulationEngine = {
  metadata: {
    id: FAN_REACTION_ENGINE_V0_ID,
    name: "Fan Reaction Engine v0",
    version: "0.6.0"
  },
  run(input, context, options) {
    return runFanReactionEngineV0(input, context, options);
  }
};

function runFanReactionEngineV0(
  input: FanReactionEngineInput,
  context: SimulationEngineContext,
  options?: SimulationEngineRunOptions
): FanReactionEngineResult {
  const reactionRoll = context.random.next();
  const segmentVarianceRoll = context.random.next();
  const tractionRoll = context.random.next();
  const segmentReads = Object.fromEntries(
    input.fanSegments.map((segment) => [
      segment.id,
      classifySegmentRead(segment.kind, segment.companyTrust, segment.metaAwareness, reactionRoll)
    ])
  ) as FanReactionHiddenState["segmentReads"];
  const companyTrustRead = input.promotion.fanTrust;
  const overexposureConcernRead = highest(input.fanSegments.map((segment) => segment.fatigueSensitivity));
  const inputValidationSummary = createInputValidationSummary(input);
  const audienceReadSummary = createFanAudienceRead(input.showInput?.handoff);
  const showOutputShell = createFanReactionShowOutputShell(audienceReadSummary);
  const affectedWrestlerIds =
    input.matchResult?.changedWrestlerIds.length
      ? input.matchResult.changedWrestlerIds
      : input.relevantWrestlers.map((wrestler) => wrestler.id);
  const affectedRivalryIds =
    input.matchResult?.changedRivalryIds.length
      ? input.matchResult.changedRivalryIds
      : input.relevantRivalries.map((rivalry) => rivalry.id);

  const hiddenState: FanReactionHiddenState = {
    reactionRoll,
    segmentVarianceRoll,
    tractionRoll,
    fanSegmentCount: input.fanSegments.length,
    relevantWrestlerCount: input.relevantWrestlers.length,
    relevantRivalryCount: input.relevantRivalries.length,
    priorNarrativeCount: input.priorSocialNarratives.length,
    matchHandoffPresent: input.matchResult !== undefined,
    inputMode: inputValidationSummary.inputMode,
    showHandoffPresent: inputValidationSummary.showHandoffPresent,
    showHandoffValidationPresent: inputValidationSummary.showHandoffValidationPresent,
    showHandoffValidationStatus: inputValidationSummary.showHandoffValidationStatus,
    showHandoffValidationConfidence: inputValidationSummary.showHandoffValidationConfidence,
    showHandoffReadyForFanReaction: inputValidationSummary.showHandoffReadyForFanReaction,
    showHandoffReadyForSocialDiscourse: inputValidationSummary.showHandoffReadyForSocialDiscourse,
    showHandoffMatchCount: inputValidationSummary.showHandoffMatchCount,
    inputValidationSummary,
    audienceReadSummary,
    showOutputShell,
    companyTrustRead,
    overexposureConcernRead,
    segmentReads
  };
  const debugEnabled = options?.debug === true || context.debug === true;

  return {
    engineName: "fan-reaction",
    affectedFanSegmentIds: input.fanSegments.map((segment) => segment.id),
    affectedWrestlerIds,
    affectedRivalryIds,
    hiddenState,
    signals: buildPlayerFacingSignals(input, hiddenState, affectedWrestlerIds, affectedRivalryIds),
    debugTrace: debugEnabled
      ? {
          playerFacing: false,
          engineName: "fan-reaction",
          steps: [
            "Accepted fan reaction input",
            "Read canonical SimulationEngineContext from run()",
            "Used seeded context.random rolls",
            "Read optional match result handoff",
            "Read optional validated show fan/social handoff contract",
            "Prepared hidden audience-read placeholder from show handoff structure",
            "Prepared hidden show-level fan reaction output shell",
            "Returned placeholder hidden state and player-facing signals"
          ],
          hiddenRolls: [reactionRoll, segmentVarianceRoll, tractionRoll],
          notes: [
            "Fan Reaction Engine v0 is a production shell only; no fan scoring formula executed.",
            `Fan reaction input mode: ${inputValidationSummary.inputMode}.`,
            `Show handoff validation status: ${inputValidationSummary.showHandoffValidationStatus}.`,
            `Audience read placeholder: ${audienceReadSummary.status}, ${audienceReadSummary.confidence}.`,
            `Show output shell placeholder: ${showOutputShell.status}, ${showOutputShell.confidence}.`,
            `Context week ${context.week} was used only as runtime context metadata.`
          ]
        }
      : undefined
  };
}

function createInputValidationSummary(
  input: FanReactionEngineInput
): FanReactionInputValidationSummary {
  const matchHandoffPresent = input.matchResult !== undefined;
  const fanSocialHandoff = input.showInput?.handoff?.fanSocialHandoff;
  const fanSocialHandoffValidation = input.showInput?.handoff?.fanSocialHandoffValidation;
  const showHandoffPresent = fanSocialHandoff !== undefined;
  const showHandoffValidationPresent = fanSocialHandoffValidation !== undefined;
  const showId = input.showInput?.showId ?? fanSocialHandoff?.showId;
  const inputMode = inputModeFor(matchHandoffPresent, showHandoffPresent);

  return {
    inputMode,
    matchHandoffPresent,
    showHandoffPresent,
    showHandoffValidationPresent,
    showHandoffValidationStatus:
      fanSocialHandoffValidation?.status ?? (showHandoffPresent ? "unvalidated" : "missing"),
    showHandoffValidationConfidence: fanSocialHandoffValidation?.confidence ?? "unknown",
    showHandoffReadyForFanReaction:
      fanSocialHandoffValidation?.readyForFanReactionOrchestration === true,
    showHandoffReadyForSocialDiscourse:
      fanSocialHandoffValidation?.readyForSocialDiscourseOrchestration === true,
    showHandoffMatchCount: fanSocialHandoff?.matchCount ?? 0,
    showId: showId ?? null
  };
}

function inputModeFor(
  matchHandoffPresent: boolean,
  showHandoffPresent: boolean
): FanReactionInputValidationSummary["inputMode"] {
  if (matchHandoffPresent && showHandoffPresent) {
    return "match-and-show-handoff";
  }

  if (showHandoffPresent) {
    return "show-handoff";
  }

  if (matchHandoffPresent) {
    return "match-only";
  }

  return "no-handoff";
}

function buildPlayerFacingSignals(
  input: FanReactionEngineInput,
  hiddenState: FanReactionHiddenState,
  affectedWrestlerIds: readonly string[],
  affectedRivalryIds: readonly string[]
): readonly EngineSignal[] {
  const promotionSignals: PlayerFacingSignal[] = [
    createSignal(
      "promotion",
      input.promotion.id,
      "crowd",
      hiddenState.companyTrustRead >= FAN_TUNING.baselineCompanyTrust
        ? "crowd was engaged"
        : "audience is cooling",
      hiddenState.companyTrustRead >= FAN_TUNING.baselineCompanyTrust ? "rising" : "falling"
    )
  ];

  if (hasSegmentRead(hiddenState, "interested")) {
    promotionSignals.push(
      createSignal("promotion", input.promotion.id, "crowd", "casual fans interested", "rising")
    );
  }

  if (hasSegmentRead(hiddenState, "skeptical")) {
    promotionSignals.push(
      createSignal("promotion", input.promotion.id, "risk", "hardcore fans skeptical", "volatile")
    );
  }

  if (hiddenState.overexposureConcernRead >= FAN_TUNING.overexposureThreshold) {
    promotionSignals.push(
      createSignal("promotion", input.promotion.id, "risk", "overexposure concern", "falling")
    );
  }

  const rivalryId = affectedRivalryIds[0] ?? input.relevantRivalries[0]?.id;
  const rivalrySignals: EngineSignal[] = rivalryId
    ? [
        {
          subject: "rivalry",
          subjectId: rivalryId,
          signals: [
            createSignal(
              "rivalry",
              rivalryId,
              hiddenState.tractionRoll >= 0.5 ? "momentum" : "crowd",
              hiddenState.tractionRoll >= 0.5
                ? "storyline gained traction"
                : "divisive reaction",
              hiddenState.tractionRoll >= 0.5 ? "rising" : "volatile"
            )
          ]
        }
      ]
    : [];
  const wrestlerId = affectedWrestlerIds[0];
  const wrestlerSignals: EngineSignal[] = wrestlerId
    ? [
        {
          subject: "wrestler",
          subjectId: wrestlerId,
          signals: [
            createSignal(
              "wrestler",
              wrestlerId,
              hiddenState.companyTrustRead < FAN_TUNING.forcedPushSensitivity ? "risk" : "momentum",
              hiddenState.companyTrustRead < FAN_TUNING.forcedPushSensitivity
                ? "push feels forced"
                : "momentum is building",
              hiddenState.companyTrustRead < FAN_TUNING.forcedPushSensitivity ? "volatile" : "rising",
              "low"
            )
          ]
        }
      ]
    : [];

  return [
    {
      subject: "promotion",
      subjectId: input.promotion.id,
      signals: promotionSignals
    },
    ...rivalrySignals,
    ...wrestlerSignals
  ];
}

function createSignal(
  subject: PlayerFacingSignal["subject"],
  subjectId: string,
  category: EngineSignalCategory,
  label: string,
  trend: TrendDirection,
  confidence: PlayerFacingSignal["confidence"] = "medium"
): PlayerFacingSignal {
  return {
    id: `${subjectId}-${label.replaceAll(" ", "-")}`,
    subject,
    subjectId,
    category,
    label,
    confidence,
    trend,
    sourceEngine: "fan-reaction"
  };
}

function classifySegmentRead(
  kind: FanReactionEngineInput["fanSegments"][number]["kind"],
  companyTrust: number,
  metaAwareness: number,
  reactionRoll: number
): FanReactionSegmentRead {
  if ((kind === "hardcore" || kind === "iwc" || metaAwareness >= FAN_TUNING.polarizationThreshold) && reactionRoll < 0.6) {
    return "skeptical";
  }

  if (companyTrust >= FAN_TUNING.baselineCompanyTrust && reactionRoll >= 0.5) {
    return "engaged";
  }

  if (kind === "casual" || kind === "family" || reactionRoll >= 0.35) {
    return "interested";
  }

  return "cooling";
}

function hasSegmentRead(
  hiddenState: FanReactionHiddenState,
  segmentRead: FanReactionSegmentRead
): boolean {
  return Object.values(hiddenState.segmentReads).includes(segmentRead);
}

function highest(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((maximum, value) => Math.max(maximum, value), 0);
}
