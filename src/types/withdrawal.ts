import type { ApiResponse } from "./response.js";

export interface RequestWithdrawalParams {
  uid: string;
  assetId: number;
  amount: number;
  toAddress: string;
  networkId: number;
}

export interface GetWithdrawalsParams {
  page?: number;
  pageSize?: number;
}

export interface WithdrawalRecord {
  amount: string;
  assetId: number;
  assetName: string;
  withdrawStatus: string;
}

export interface WithdrawalSummary {
  amount: string;
  assetId: number;
  assetName: string;
  networkId: number;
  networkName: string;
  recordCount: number;
}

export type RequestWithdrawalResponse = ApiResponse<{
  requestUid: string;
  status: string;
}>;

export type GetWithdrawalsResponse = ApiResponse<{
  data: {
    withdraws: WithdrawalRecord[];
    summary: WithdrawalSummary[];
  };
  page: number;
  pageSize: number;
  total: number;
}>;
