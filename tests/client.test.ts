import { describe, it, expect, vi, beforeEach } from "vitest";
import { YokoPay, YokoPayError } from "../src/index.js";
import { generateKeys } from "../src/utils/signature.js";

const keys = generateKeys();
const platformKeys = generateKeys();

function createClient() {
  return new YokoPay({
    baseUrl: "https://api.yokopay.com",
    projectId: "TEST123",
    privateKey: keys.privateKey,
    publicKey: keys.publicKey,
    platformPublicKey: platformKeys.publicKey,
  });
}

describe("YokoPay constructor", () => {
  it("throws if required config is missing", () => {
    expect(
      () =>
        new YokoPay({
          projectId: "",
          privateKey: "x",
          publicKey: "x",
          platformPublicKey: "x",
        }),
    ).toThrow("projectId is required");
  });

  it("defaults timeout to 30", () => {
    const client = createClient();
    expect(client).toBeDefined();
  });
});

describe("YokoPay.generateKeys", () => {
  it("returns valid keys", () => {
    const keys = YokoPay.generateKeys();
    expect(keys.privateKey).toMatch(/^0x/);
    expect(keys.publicKey).toMatch(/^0x04/);
    expect(keys.address).toMatch(/^0x[0-9a-f]{40}$/);
  });
});

describe("validation", () => {
  const client = createClient();

  it("generateDepositAddresses rejects count > 100", async () => {
    await expect(
      client.generateDepositAddresses({ count: 101, networkId: 1 }),
    ).rejects.toThrow("count must be less than or equal to 100");
  });

  it("generateDepositAddresses rejects count <= 0", async () => {
    await expect(
      client.generateDepositAddresses({ count: 0, networkId: 1 }),
    ).rejects.toThrow("count is required");
  });

  it("generateDepositAddress rejects missing userUid", async () => {
    await expect(
      client.generateDepositAddress({ userUid: "", networkId: 1 }),
    ).rejects.toThrow("userUid is required");
  });

  it("requestWithdrawal rejects missing uid", async () => {
    await expect(
      client.requestWithdrawal({
        uid: "",
        assetId: 1,
        amount: 100,
        toAddress: "0x123",
        networkId: 1,
      }),
    ).rejects.toThrow("uid is required");
  });
});

describe("API methods send correct requests", () => {
  let client: YokoPay;
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    client = createClient();
    fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ code: 200, data: {} })),
    });
    vi.stubGlobal("fetch", fetchSpy);
  });

  it("generateDepositAddresses sends POST with correct path and body", async () => {
    await client.generateDepositAddresses({ count: 3, networkId: 11155111 });

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, options] = fetchSpy.mock.calls[0];
    expect(url).toBe(
      "https://api.yokopay.com/api/v1/client/project/TEST123/user/generate-deposit-address",
    );
    expect(options.method).toBe("POST");
    const body = JSON.parse(options.body);
    expect(body).toEqual({ count: 3, network_id: 11155111 });
    expect(options.headers["X-Signature"]).toMatch(/^0x/);
  });

  it("getDepositAddress sends GET with correct path", async () => {
    await client.getDepositAddress("user1", 11155111);

    const [url, options] = fetchSpy.mock.calls[0];
    expect(url).toBe(
      "https://api.yokopay.com/api/v1/client/project/TEST123/user/user1/deposit-address/11155111",
    );
    expect(options.method).toBe("GET");
    expect(options.body).toBeUndefined();
    expect(options.headers["X-Signature"]).toMatch(/^0x/);
  });

  it("requestWithdrawal sends POST with snake_case body", async () => {
    await client.requestWithdrawal({
      uid: "w1",
      assetId: 1,
      amount: 100,
      toAddress: "0xabc",
      networkId: 4,
    });

    const [, options] = fetchSpy.mock.calls[0];
    const body = JSON.parse(options.body);
    expect(body).toEqual({
      uid: "w1",
      asset_id: 1,
      amount: 100,
      to_address: "0xabc",
      network_id: 4,
    });
  });

  it("getDeposits sends GET with query params", async () => {
    await client.getDeposits({ page: 2, pageSize: 20 });

    const [url] = fetchSpy.mock.calls[0];
    expect(url).toContain("page=2");
    expect(url).toContain("page_size=20");
  });
});

describe("callback verification", () => {
  it("parseCallbackData verifies and returns data", async () => {
    // We need to sign callback data with the platform key to test this
    const { signRequest } = await import("../src/utils/signature.js");
    const { toSortedJson } = await import("../src/utils/sort-json.js");

    const callbackData = {
      projectUid: "TEST123",
      fromAddress: "0xsender",
      toAddress: "0xreceiver",
      addressUid: "addr1",
      amount: "100000000000000000000",
      floatAmount: "100.0",
      decimal: 18,
      txHash: "0xtxhash",
      status: "confirmed",
      assetId: 1,
      assetName: "USDC",
      networkId: 11155111,
      networkName: "Sepolia",
      confirmed: true,
      confirmedAt: "2025-03-10T10:52:30Z",
      uid: "dep1",
      type: "deposit",
    };

    // Sign with platform private key (simulating what the server does)
    const sortedData = toSortedJson(callbackData);
    const sig = signRequest(sortedData, null, platformKeys.privateKey);

    const client = createClient();
    const result = client.parseCallbackData({
      verify_data: callbackData,
      sig,
    });

    expect(result).toEqual(callbackData);
    expect(result.type).toBe("deposit");
    expect(result.confirmed).toBe(true);
  });

  it("parseCallbackData throws on invalid signature", () => {
    const client = createClient();

    expect(() =>
      client.parseCallbackData({
        verify_data: {
          projectUid: "TEST123",
          fromAddress: "",
          toAddress: "",
          addressUid: "",
          amount: "0",
          floatAmount: "0",
          decimal: 18,
          txHash: "",
          status: "pending",
          assetId: 1,
          assetName: "USDC",
          networkId: 1,
          networkName: "Ethereum",
          confirmed: false,
          confirmedAt: null,
          uid: "x",
          type: "deposit",
        },
        sig: "0x" + "00".repeat(65),
      }),
    ).toThrow("Invalid platform signature");
  });
});
