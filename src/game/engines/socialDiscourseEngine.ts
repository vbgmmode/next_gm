import type { EntityId, TrendDirection } from "../domain/index.ts";
import type { SimulationEngineContext } from "./engineContext.ts";
import { SOCIAL_DISCOURSE_ENGINE_V0_ID } from "./engineIds.ts";
import type { EngineSignal, EngineSignalCategory, PlayerFacingSignal } from "./engineSignals.ts";
import type { FanReactionShowSignalRead } from "./fanReactionShowOutput.ts";
import { createFanSocialDiscourseHandoff } from "./fanSocialDiscourseHandoff.ts";
import type {
  SocialDiscourseEngineInput,
  SocialDiscourseEngineResult,
  SocialDiscourseHiddenState,
  SocialDiscourseOutputShell,
  SocialDiscourseOutputShellCategory,
  SocialDiscourseOutputShellSourceAvailability,
  SocialDiscourseRead,
  SocialDiscourseReadinessBucket,
  SocialDiscourseReadinessBuckets,
  SocialDiscourseShowSignalKey,
  SocialDiscourseShowSignalReadinessFields,
  SocialDiscourseShowSignalReadinessStatus,
  SocialDiscourseShowSignalReadinessSummary
} from "./socialDiscourseEngine.contracts.ts";
import type { SimulationEngineRunOptions, SocialDiscourseSimulationEngine } from "./simulationEngine.ts";

export const socialDiscourseEngine: SocialDiscourseSimulationEngine = {
  metadata: {
    id: SOCIAL_DISCOURSE_ENGINE_V0_ID,
    name: "Social Discourse Engine v0",
    version: "0.5.0"
  },
  run(input, context, options) {
    return runSocialDiscourseEngineV0(input, context, options);
  }
};

function runSocialDiscourseEngineV0(
  input: SocialDiscourseEngineInput,
  context: SimulationEngineContext,
  options?: SimulationEngineRunOptions
): SocialDiscourseEngineResult {
  const discourseRoll = context.random.next();
  const rumorRoll = context.random.next();
  const fragmentationRoll = context.random.next();
  const updatedNarrativeIds = input.existingNarratives.map((narrative) => narrative.id);
  const fanReactionShowHandoff = input.fanReactionShowHandoff ?? createFanSocialDiscourseHandoff();
  const fanReactionShowOutputReadiness = fanReactionShowHandoff.showOutputReadiness;
  const showSignalReadiness = summarizeShowSignalReadiness(fanReactionShowHandoff.showSignals);
  const discourseReadinessBuckets = summarizeDiscourseReadinessBuckets(
    fanReactionShowHandoff,
    showSignalReadiness
  );
  const discourseOutputShell = createDiscourseOutputShell(discourseReadinessBuckets);
  const hiddenState: SocialDiscourseHiddenState = {
    discourseRoll,
    rumorRoll,
    fragmentationRoll,
    existingNarrativeCount: input.existingNarratives.length,
    relevantWrestlerCount: input.relevantWrestlers.length,
    relevantRivalryCount: input.relevantRivalries.length,
    matchHandoffPresent: input.matchResult !== undefined,
    fanReactionHandoffPresent: input.fanReactionResult !== undefined,
    fanReactionShowOutputReadiness,
    showSignalReadiness,
    discourseReadinessBuckets,
    discourseOutputShell,
    discourseRead: classifyDiscourseRead(discourseRoll, rumorRoll, fragmentationRoll),
    updatedNarrativeCount: updatedNarrativeIds.length
  };
  const debugEnabled = options?.debug === true || context.debug === true;

  return {
    engineName: "social-discourse",
    producedNarratives: [],
    updatedNarrativeIds,
    hiddenState,
    signals: buildPlayerFacingSignals(input, hiddenState, updatedNarrativeIds),
    debugTrace: debugEnabled
      ? {
          playerFacing: false,
          engineName: "social-discourse",
          steps: [
            "Accepted social discourse input",
            "Read canonical SimulationEngineContext from run()",
            "Used seeded context.random rolls",
            "Read optional match and fan reaction handoffs",
            "Read optional Fan Reaction to Social Discourse show handoff",
            "Mapped optional show signal readiness for future discourse generation",
            "Mapped hidden discourse readiness buckets for future category shells",
            "Created deterministic hidden discourse output shell containers",
            "Returned placeholder hidden state and player-facing signals"
          ],
          hiddenRolls: [discourseRoll, rumorRoll, fragmentationRoll],
          notes: [
            "Social Discourse Engine v0.5 is a production shell only; no discourse formula executed.",
            "No generated tweets, reports, articles, rumors, or prompt builders were produced."
          ]
        }
      : undefined
  };
}

const expectedShowSignalKeys: readonly SocialDiscourseShowSignalKey[] = [
  "crowdEnergyRead",
  "bookingTrustRead",
  "featuredTalentReceptionRead",
  "showMomentumRead",
  "confidenceRead"
];

function summarizeShowSignalReadiness(showSignals: unknown): SocialDiscourseShowSignalReadinessSummary {
  const fields = Object.fromEntries(
    expectedShowSignalKeys.map((key) => [key, showSignalStatusFor(showSignals, key)])
  ) as SocialDiscourseShowSignalReadinessFields;
  const statuses = Object.values(fields);

  return {
    expectedSignalCount: expectedShowSignalKeys.length,
    presentSignalCount: countStatus(statuses, "present"),
    missingSignalCount: countStatus(statuses, "missing"),
    unusableSignalCount: countStatus(statuses, "unusable"),
    fields
  };
}

function showSignalStatusFor(
  showSignals: unknown,
  key: SocialDiscourseShowSignalKey
): SocialDiscourseShowSignalReadinessStatus {
  if (showSignals === null || showSignals === undefined) {
    return "missing";
  }

  if (typeof showSignals !== "object") {
    return "unusable";
  }

  const value = (showSignals as Partial<Record<SocialDiscourseShowSignalKey, unknown>>)[key];

  if (value === undefined) {
    return "missing";
  }

  return isFanReactionShowSignalRead(value) ? "present" : "unusable";
}

function isFanReactionShowSignalRead(value: unknown): value is FanReactionShowSignalRead {
  return (
    value === "unavailable" ||
    value === "pending" ||
    value === "limited" ||
    value === "neutral" ||
    value === "needs-more-context" ||
    value === "structurally-ready"
  );
}

function countStatus(
  statuses: readonly SocialDiscourseShowSignalReadinessStatus[],
  status: SocialDiscourseShowSignalReadinessStatus
): number {
  return statuses.filter((candidate) => candidate === status).length;
}

function summarizeDiscourseReadinessBuckets(
  handoff: ReturnType<typeof createFanSocialDiscourseHandoff>,
  showSignalReadiness: SocialDiscourseShowSignalReadinessSummary
): SocialDiscourseReadinessBuckets {
  return {
    iwcPulseReadiness: discourseBucketFor(handoff, showSignalReadiness, [
      "crowdEnergyRead",
      "confidenceRead"
    ]),
    mediaNarrativeReadiness: discourseBucketFor(handoff, showSignalReadiness, [
      "bookingTrustRead",
      "showMomentumRead"
    ]),
    lockerRoomBuzzReadiness: discourseBucketFor(handoff, showSignalReadiness, [
      "featuredTalentReceptionRead",
      "confidenceRead"
    ]),
    fanDebateReadiness: discourseBucketFor(handoff, showSignalReadiness, [
      "crowdEnergyRead",
      "bookingTrustRead",
      "featuredTalentReceptionRead"
    ]),
    trendVolatilityReadiness: discourseBucketFor(handoff, showSignalReadiness, [
      "showMomentumRead",
      "confidenceRead"
    ])
  };
}

function discourseBucketFor(
  handoff: ReturnType<typeof createFanSocialDiscourseHandoff>,
  showSignalReadiness: SocialDiscourseShowSignalReadinessSummary,
  requiredSignalKeys: readonly SocialDiscourseShowSignalKey[]
): SocialDiscourseReadinessBucket {
  const outputReadiness = handoff.showOutputReadiness;

  if (!outputReadiness.provided || outputReadiness.shellStatus === null) {
    return "unavailable";
  }

  const requiredStatuses = requiredSignalKeys.map(
    (key) => showSignalReadiness.fields[key]
  );

  if (
    !outputReadiness.structurallyUsable ||
    outputReadiness.inputStatus === "unusable" ||
    requiredStatuses.includes("unusable")
  ) {
    return "blocked";
  }

  if (outputReadiness.shellStatus === "unavailable") {
    return "unavailable";
  }

  if (requiredStatuses.every((status) => status === "missing")) {
    return "pending";
  }

  if (requiredStatuses.includes("missing") || outputReadiness.shellStatus === "partial") {
    return "limited";
  }

  if (!outputReadiness.readyForSocialDiscourseHandoff || outputReadiness.shellStatus === "empty") {
    return "pending";
  }

  if (requiredSignalsAreStructurallyReady(handoff.showSignals, requiredSignalKeys)) {
    return "structurally-ready";
  }

  return "limited";
}

function requiredSignalsAreStructurallyReady(
  showSignals: ReturnType<typeof createFanSocialDiscourseHandoff>["showSignals"],
  requiredSignalKeys: readonly SocialDiscourseShowSignalKey[]
): boolean {
  if (showSignals === null) {
    return false;
  }

  return requiredSignalKeys.every((key) => showSignals[key] === "structurally-ready");
}

function createDiscourseOutputShell(
  buckets: SocialDiscourseReadinessBuckets
): SocialDiscourseOutputShell {
  return {
    sourceEngine: "social-discourse",
    playerFacing: false,
    iwcPulse: createDiscourseOutputShellCategory(buckets.iwcPulseReadiness),
    mediaNarrative: createDiscourseOutputShellCategory(buckets.mediaNarrativeReadiness),
    lockerRoomBuzz: createDiscourseOutputShellCategory(buckets.lockerRoomBuzzReadiness),
    fanDebate: createDiscourseOutputShellCategory(buckets.fanDebateReadiness),
    trendVolatility: createDiscourseOutputShellCategory(buckets.trendVolatilityReadiness)
  };
}

function createDiscourseOutputShellCategory(
  readiness: SocialDiscourseReadinessBucket
): SocialDiscourseOutputShellCategory {
  return {
    status: readiness,
    readiness,
    sourceAvailability: sourceAvailabilityFor(readiness)
  };
}

function sourceAvailabilityFor(
  readiness: SocialDiscourseReadinessBucket
): SocialDiscourseOutputShellSourceAvailability {
  switch (readiness) {
    case "unavailable":
      return "none";
    case "blocked":
      return "blocked";
    case "limited":
      return "limited";
    case "pending":
      return "pending";
    case "structurally-ready":
      return "available";
  }
}

function buildPlayerFacingSignals(
  input: SocialDiscourseEngineInput,
  hiddenState: SocialDiscourseHiddenState,
  updatedNarrativeIds: readonly EntityId[]
): readonly EngineSignal[] {
  const socialSubjectId = updatedNarrativeIds[0] ?? input.promotion.id;
  const socialSignals: PlayerFacingSignal[] = [
    createSignal(
      "social",
      socialSubjectId,
      "social",
      labelForDiscourseRead(hiddenState.discourseRead),
      trendForDiscourseRead(hiddenState.discourseRead)
    )
  ];

  if (hiddenState.rumorRoll >= 0.66) {
    socialSignals.push(createSignal("social", socialSubjectId, "risk", "rumor mill active", "volatile"));
  }

  if (hiddenState.fragmentationRoll >= 0.66) {
    socialSignals.push(
      createSignal("social", socialSubjectId, "social", "discourse is fragmented", "volatile")
    );
  }

  const wrestlerId =
    input.fanReactionResult?.affectedWrestlerIds[0] ?? input.relevantWrestlers[0]?.id;
  const wrestlerSignals: EngineSignal[] = wrestlerId
    ? [
        {
          subject: "wrestler",
          subjectId: wrestlerId,
          signals: [
            createSignal(
              "wrestler",
              wrestlerId,
              hiddenState.discourseRoll >= 0.5 ? "momentum" : "risk",
              hiddenState.discourseRoll >= 0.5
                ? "superstar narrative gaining traction"
                : "booking decision under scrutiny",
              hiddenState.discourseRoll >= 0.5 ? "rising" : "volatile",
              "low"
            )
          ]
        }
      ]
    : [];
  const rivalryId =
    input.fanReactionResult?.affectedRivalryIds[0] ?? input.relevantRivalries[0]?.id;
  const rivalrySignals: EngineSignal[] = rivalryId
    ? [
        {
          subject: "rivalry",
          subjectId: rivalryId,
          signals: [
            createSignal(
              "rivalry",
              rivalryId,
              "social",
              hiddenState.fragmentationRoll >= 0.5
                ? "fans are fantasy-booking alternatives"
                : "viral moment potential",
              hiddenState.fragmentationRoll >= 0.5 ? "volatile" : "rising"
            )
          ]
        }
      ]
    : [];

  return [
    {
      subject: "social",
      subjectId: socialSubjectId,
      signals: socialSignals
    },
    ...wrestlerSignals,
    ...rivalrySignals
  ];
}

function createSignal(
  subject: PlayerFacingSignal["subject"],
  subjectId: EntityId,
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
    sourceEngine: "social-discourse"
  };
}

function classifyDiscourseRead(
  discourseRoll: number,
  rumorRoll: number,
  fragmentationRoll: number
): SocialDiscourseRead {
  if (rumorRoll >= 0.7) {
    return "rumor-active";
  }

  if (fragmentationRoll >= 0.7) {
    return "fragmented";
  }

  if (discourseRoll >= 0.66) {
    return "praise-cycle";
  }

  if (discourseRoll < 0.35) {
    return "pushback";
  }

  return "rising";
}

function labelForDiscourseRead(read: SocialDiscourseRead): string {
  switch (read) {
    case "fragmented":
      return "discourse is fragmented";
    case "praise-cycle":
      return "praise cycle building";
    case "pushback":
      return "pushback forming";
    case "rumor-active":
      return "rumor mill active";
    case "rising":
      return "IWC discourse rising";
  }
}

function trendForDiscourseRead(read: SocialDiscourseRead): TrendDirection {
  switch (read) {
    case "fragmented":
    case "pushback":
    case "rumor-active":
      return "volatile";
    case "praise-cycle":
    case "rising":
      return "rising";
  }
}
