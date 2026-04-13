import type { ApiResponse } from "./response.js";

export interface ConsolidationBalance {
  address: string;
  networkId: number;
  networkName: string;
  tokenId: number;
  tokenName: string;
  balance: string;
  balanceFloat: string;
  decimal: number;
}

export type GetConsolidationBalancesResponse = ApiResponse<ConsolidationBalance[]>;
