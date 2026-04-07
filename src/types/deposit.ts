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
  tokenBalances: string | null;
  projectUid: string;
  nonce: number;
}

export interface GenerateDepositAddressesResponse {
  code: number;
  status: string;
  message: string;
  data: {
    addresses: Address[];
  };
}

export interface CreateDepositAddressResponse {
  message: string;
  address: string;
  uid: string;
}

export interface GetDepositAddressResponse {
  message: string;
  address: string;
  uid: string;
}

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

export interface GetDepositsResponse {
  code: number;
  data: {
    deposits: DepositRecord[];
    summary: DepositSummary[];
  };
  page: number;
  pageSize: number;
  total: number;
}
