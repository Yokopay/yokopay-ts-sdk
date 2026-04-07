import type { YokoPayConfig } from "./types/config.js";
import type {
  GenerateDepositAddressesParams,
  GenerateDepositAddressesResponse,
  GenerateDepositAddressParams,
  CreateDepositAddressResponse,
  GetDepositAddressResponse,
  GetDepositsParams,
  GetDepositsResponse,
} from "./types/deposit.js";
import type {
  RequestWithdrawalParams,
  RequestWithdrawalResponse,
  GetWithdrawalsParams,
  GetWithdrawalsResponse,
} from "./types/withdrawal.js";
import type { CallbackData, CallbackPayload } from "./types/callback.js";
import {
  signRequest,
  verifySignature,
  generateKeys,
  type Keys,
} from "./utils/signature.js";
import { toSortedJson } from "./utils/sort-json.js";
import { request } from "./utils/request.js";
import { toCamelCase } from "./utils/transform.js";
import { YokoPayError } from "./errors/index.js";

export class YokoPay {
  private readonly config: Required<YokoPayConfig>;

  constructor(config: YokoPayConfig) {
    if (!config.projectId) throw new YokoPayError("projectId is required", 0);
    if (!config.privateKey) throw new YokoPayError("privateKey is required", 0);
    if (!config.publicKey) throw new YokoPayError("publicKey is required", 0);
    if (!config.platformPublicKey)
      throw new YokoPayError("platformPublicKey is required", 0);

    this.config = {
      ...config,
      baseUrl: config.baseUrl ?? "https://api.yokopay.com",
      timeout: config.timeout ?? 30,
    };
  }

  private get timeoutMs(): number {
    return this.config.timeout * 1000;
  }

  private sign(path: string, body: Record<string, unknown> | null): string {
    return signRequest(path, body, this.config.privateKey);
  }

  private async post<T>(
    path: string,
    body: Record<string, unknown>,
  ): Promise<T> {
    const signature = this.sign(path, body);
    return request<T>({
      baseUrl: this.config.baseUrl,
      method: "POST",
      path,
      body,
      headers: {
        "X-Signature": signature,
      },
      timeout: this.timeoutMs,
    });
  }

  private async get<T>(
    path: string,
    params?: Record<string, string>,
  ): Promise<T> {
    const signature = this.sign(path, null);
    return request<T>({
      baseUrl: this.config.baseUrl,
      method: "GET",
      path,
      params,
      headers: {
        "X-Signature": signature,
      },
      timeout: this.timeoutMs,
    });
  }

  async generateDepositAddresses(
    params: GenerateDepositAddressesParams,
  ): Promise<GenerateDepositAddressesResponse> {
    if (!params.networkId)
      throw new YokoPayError("networkId is required", 0);
    if (!params.count || params.count <= 0)
      throw new YokoPayError("count is required and must be greater than 0", 0);
    if (params.count > 100)
      throw new YokoPayError("count must be less than or equal to 100", 0);

    const path = `/api/v1/client/project/${this.config.projectId}/user/generate-deposit-address`;
    const body = {
      count: params.count,
      network_id: params.networkId,
    };

    const raw = await this.post<Record<string, unknown>>(path, body);
    return toCamelCase<GenerateDepositAddressesResponse>(raw);
  }

  async generateDepositAddress(
    params: GenerateDepositAddressParams,
  ): Promise<CreateDepositAddressResponse> {
    if (!params.userUid)
      throw new YokoPayError("userUid is required", 0);
    if (!params.networkId)
      throw new YokoPayError("networkId is required", 0);

    const path = `/api/v1/client/project/${this.config.projectId}/user/generate-deposit-address`;
    const body = {
      user_uid: params.userUid,
      network_id: params.networkId,
    };

    const raw = await this.post<Record<string, unknown>>(path, body);
    return toCamelCase<CreateDepositAddressResponse>(raw);
  }

  async getDepositAddress(
    uid: string,
    networkId: number,
  ): Promise<GetDepositAddressResponse> {
    if (!uid) throw new YokoPayError("uid is required", 0);
    if (!networkId) throw new YokoPayError("networkId is required", 0);

    const path = `/api/v1/client/project/${this.config.projectId}/user/${uid}/deposit-address/${networkId}`;
    const raw = await this.get<Record<string, unknown>>(path);
    return toCamelCase<GetDepositAddressResponse>(raw);
  }

  async getDeposits(params?: GetDepositsParams): Promise<GetDepositsResponse> {
    const path = `/api/v1/client/project/${this.config.projectId}/user/deposits`;
    const queryParams: Record<string, string> = {};
    if (params?.page) queryParams["page"] = String(params.page);
    if (params?.pageSize) queryParams["page_size"] = String(params.pageSize);

    const raw = await this.get<Record<string, unknown>>(path, queryParams);
    return toCamelCase<GetDepositsResponse>(raw);
  }

  async getWithdrawals(
    params?: GetWithdrawalsParams,
  ): Promise<GetWithdrawalsResponse> {
    const path = `/api/v1/client/project/${this.config.projectId}/user/withdrawals`;
    const queryParams: Record<string, string> = {};
    if (params?.page) queryParams["page"] = String(params.page);
    if (params?.pageSize) queryParams["page_size"] = String(params.pageSize);

    const raw = await this.get<Record<string, unknown>>(path, queryParams);
    return toCamelCase<GetWithdrawalsResponse>(raw);
  }

  async requestWithdrawal(
    params: RequestWithdrawalParams,
  ): Promise<RequestWithdrawalResponse> {
    if (!params.uid) throw new YokoPayError("uid is required", 0);
    if (!params.assetId) throw new YokoPayError("assetId is required", 0);
    if (params.amount == null) throw new YokoPayError("amount is required", 0);
    if (!params.toAddress)
      throw new YokoPayError("toAddress is required", 0);
    if (!params.networkId)
      throw new YokoPayError("networkId is required", 0);

    const path = `/api/v1/client/project/${this.config.projectId}/withdraw`;
    const body = {
      uid: params.uid,
      asset_id: params.assetId,
      amount: params.amount,
      to_address: params.toAddress,
      network_id: params.networkId,
    };

    const raw = await this.post<Record<string, unknown>>(path, body);
    return toCamelCase<RequestWithdrawalResponse>(raw);
  }

  parseCallbackData(payload: CallbackPayload): CallbackData {
    const isValid = this.verifyPlatformSignature(
      payload.verify_data,
      payload.sig,
    );
    if (!isValid) {
      throw new YokoPayError("Invalid platform signature", 0);
    }
    return payload.verify_data;
  }

  verifyPlatformSignature(data: unknown, sig: string): boolean {
    const sortedData = toSortedJson(data);
    return verifySignature(this.config.platformPublicKey, sig, sortedData);
  }

  static generateKeys(): Keys {
    return generateKeys();
  }
}
