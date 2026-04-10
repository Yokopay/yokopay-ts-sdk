export const NetworkId = {
  EthereumMainnet: 1,
  BSCMainnet: 56,
  BSCTestnet: 67,
  Sepolia: 11155111,
  TRX: 4,
  TRXShasta: 5,
  All: 0,
} as const;

export type NetworkId = (typeof NetworkId)[keyof typeof NetworkId];

export const AssetId = {
  USDC: 1,
  USDT: 2,
  Native: 3,
  All: 0,
} as const;

export type AssetId = (typeof AssetId)[keyof typeof AssetId];

export const AssetName = {
  USDC: "USDC",
  USDT: "USDT",
  Native: "Native",
  All: "All",
} as const;

export type AssetName = (typeof AssetName)[keyof typeof AssetName];

export const TxStatus = {
  Pending: "pending",
  Confirmed: "confirmed",
  Timeout: "timeout",
} as const;

export type TxStatus = (typeof TxStatus)[keyof typeof TxStatus];

export const WithdrawStatus = {
  UnderReview: "under_review",
  Rejected: "rejected",
  Pending: "pending",
  Processing: "processing",
  Success: "success",
  Confirmed: "confirmed",
  Error: "error",
  Failed: "failed",
} as const;

export type WithdrawStatus =
  (typeof WithdrawStatus)[keyof typeof WithdrawStatus];
