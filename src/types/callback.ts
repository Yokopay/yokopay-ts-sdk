export interface CallbackData {
  projectUid: string;
  fromAddress: string;
  toAddress: string;
  addressUid: string;
  amount: string;
  floatAmount: string;
  decimal: number;
  txHash: string;
  status: string;
  assetId: number;
  assetName: string;
  networkId: number;
  networkName: string;
  confirmed: boolean;
  confirmedAt: string | null;
  uid: string;
  type: string;
}

export interface CallbackPayload {
  verify_data: CallbackData;
  sig: string;
}
