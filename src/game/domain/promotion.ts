import type { EntityId, NumericRating } from "./common.ts";
import type { BackstageState } from "./backstage.ts";
import type { FinancialState } from "./finance.ts";
import type { MarketState } from "./market.ts";

export interface Promotion {
  id: EntityId;
  name: string;
  marketState: MarketState;
  financialState: FinancialState;
  backstageState: BackstageState;
  rosterIds: EntityId[];
  fanTrust: NumericRating;
  brandIdentity: string[];
  momentum: NumericRating;
}
