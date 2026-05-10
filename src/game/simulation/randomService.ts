export interface WeightedChoice<T> {
  item: T;
  weight: number;
}

export class RandomService {
  private state: number;

  constructor(seed: string | number) {
    this.state = normalizeSeed(seed);
  }

  next(): number {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let value = this.state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  }

  chance(probability: number): boolean {
    if (probability <= 0) {
      return false;
    }

    if (probability >= 1) {
      return true;
    }

    return this.next() < probability;
  }

  integer(min: number, max: number): number {
    if (!Number.isInteger(min) || !Number.isInteger(max)) {
      throw new Error("RandomService.integer requires integer bounds.");
    }

    if (max < min) {
      throw new Error("RandomService.integer requires max to be greater than or equal to min.");
    }

    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  weightedChoice<T>(choices: readonly WeightedChoice<T>[]): T {
    if (choices.length === 0) {
      throw new Error("RandomService.weightedChoice requires at least one choice.");
    }

    const totalWeight = choices.reduce((total, choice) => {
      if (choice.weight < 0) {
        throw new Error("RandomService.weightedChoice does not accept negative weights.");
      }

      return total + choice.weight;
    }, 0);

    if (totalWeight <= 0) {
      throw new Error("RandomService.weightedChoice requires a positive total weight.");
    }

    const roll = this.next() * totalWeight;
    let cursor = 0;

    for (const choice of choices) {
      cursor += choice.weight;

      if (roll < cursor) {
        return choice.item;
      }
    }

    return choices[choices.length - 1].item;
  }
}

function normalizeSeed(seed: string | number): number {
  if (typeof seed === "number") {
    return seed >>> 0;
  }

  let hash = 2166136261;

  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}
