import type { SignalSummary } from "../domain/index.ts";

export type SignalKind = "fatigue" | "momentum" | "discourse" | "financial" | "backstage";

export interface SignalBand {
  max: number;
  label: string;
}

const SIGNAL_BANDS: Record<SignalKind, readonly SignalBand[]> = {
  fatigue: [
    { max: 20, label: "fresh" },
    { max: 45, label: "showing wear" },
    { max: 70, label: "visibly tired" },
    { max: 100, label: "running on fumes" }
  ],
  momentum: [
    { max: 25, label: "cold" },
    { max: 50, label: "steady" },
    { max: 75, label: "heating up" },
    { max: 100, label: "surging" }
  ],
  discourse: [
    { max: 25, label: "quiet" },
    { max: 50, label: "noticeable chatter" },
    { max: 75, label: "loud conversation" },
    { max: 100, label: "dominating discourse" }
  ],
  financial: [
    { max: 25, label: "comfortable" },
    { max: 50, label: "watchful" },
    { max: 75, label: "tightening" },
    { max: 100, label: "under pressure" }
  ],
  backstage: [
    { max: 25, label: "settled" },
    { max: 50, label: "manageable tension" },
    { max: 75, label: "politically charged" },
    { max: 100, label: "volatile room" }
  ]
};

export function interpretSignal(kind: SignalKind, hiddenValue: number): SignalSummary {
  const normalizedValue = clampToSignalRange(hiddenValue);
  const band = SIGNAL_BANDS[kind].find((candidate) => normalizedValue <= candidate.max);

  return {
    label: band?.label ?? SIGNAL_BANDS[kind][SIGNAL_BANDS[kind].length - 1].label,
    confidence: confidenceForValue(normalizedValue)
  };
}

export function interpretSignals(values: Partial<Record<SignalKind, number>>): Partial<Record<SignalKind, SignalSummary>> {
  const signals: Partial<Record<SignalKind, SignalSummary>> = {};

  for (const [kind, value] of Object.entries(values) as [SignalKind, number][]) {
    signals[kind] = interpretSignal(kind, value);
  }

  return signals;
}

function clampToSignalRange(value: number): number {
  if (Number.isNaN(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, value));
}

function confidenceForValue(value: number): SignalSummary["confidence"] {
  if (value <= 10 || value >= 90) {
    return "high";
  }

  if (value >= 40 && value <= 60) {
    return "low";
  }

  return "medium";
}
