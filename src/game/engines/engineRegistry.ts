import type { SimulationEngineResult } from "./engineSignals.ts";
import type {
  SimulationEngine,
  SimulationEngineMetadata
} from "./simulationEngine.ts";

type RegisteredSimulationEngine = SimulationEngine<unknown, SimulationEngineResult>;

export class EngineRegistry {
  private readonly engines = new Map<string, RegisteredSimulationEngine>();

  register<TInput, TResult extends SimulationEngineResult>(
    engine: SimulationEngine<TInput, TResult>
  ): void {
    const { id } = engine.metadata;

    if (this.engines.has(id)) {
      throw new Error(`Simulation engine with id "${id}" is already registered.`);
    }

    this.engines.set(id, engine as RegisteredSimulationEngine);
  }

  get<TInput, TResult extends SimulationEngineResult>(
    engineId: string
  ): SimulationEngine<TInput, TResult> | undefined {
    return this.engines.get(engineId) as SimulationEngine<TInput, TResult> | undefined;
  }

  getRequired<TInput, TResult extends SimulationEngineResult>(
    engineId: string
  ): SimulationEngine<TInput, TResult> {
    const engine = this.get<TInput, TResult>(engineId);

    if (!engine) {
      throw new Error(`Simulation engine with id "${engineId}" is not registered.`);
    }

    return engine;
  }

  listMetadata(): readonly SimulationEngineMetadata[] {
    return [...this.engines.values()].map((engine) => ({ ...engine.metadata }));
  }
}

export function createEngineRegistry(): EngineRegistry {
  return new EngineRegistry();
}
