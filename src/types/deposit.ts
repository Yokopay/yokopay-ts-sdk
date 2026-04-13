import type { ApiResponse } from "./response.js";

export interface GenerateDepositAddressesParams {
  count: number;
  networkId: number;
}

export interface GenerateDepositAddressParams {
  userUid: string;
  networkId: number;
}

export interface GetDepositsParams {
  page?: number;
  pageSize?: number;
}

export interface Address {
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  uid: string;
  networkId: number;
  networkName: string;
  address: string;
  path: number;
  privateKeyEncrypted: string;
  tokenBalances: string | null;
  projectUid: string;
  nonce: number;
  nonceVersion: number;
  isUsing: boolean;
  isTronEnergyPlatformAddress: boolean;
}

export type GenerateDepositAddressesResponse = ApiResponse<{
  addresses: Address[];
  count: number;
}>;

export type CreateDepositAddressResponse = ApiResponse<{
  address: Address;
  count: number;
}>;

export type GetDepositAddressResponse = ApiResponse<{
  address: string;
}>;

export interface DepositRecord {
  amount: string;
  assetId: number;
  assetName: string;
  txStatus: string;
  userAddress: string;
}

export interface DepositSummary {
  amount: string;
  assetId: number;
  assetName: string;
  networkId: number;
  networkName: string;
  recordCount: number;
}

export type GetDepositsResponse = ApiResponse<{
  data: {
    deposits: DepositRecord[];
    summary: DepositSummary[];
  };
  page: number;
  pageSize: number;
  total: number;
}>;
