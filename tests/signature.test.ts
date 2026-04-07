import { describe, it, expect } from "vitest";
import {
  signRequest,
  verifySignature,
  generateKeys,
} from "../src/utils/signature.js";
import { toSortedJson } from "../src/utils/sort-json.js";

describe("signature", () => {
  it("sign and verify roundtrip with POST body", () => {
    const keys = generateKeys();
    const path = "/api/v1/client/project/ABC123/withdraw";
    const body = {
      amount: 100,
      asset_id: 1,
      network_id: 4,
      to_address: "0x693735a9595fa92d826FB64E493d1c15B49A7fdE",
      uid: "w1",
    };

    const signature = signRequest(path, body, keys.privateKey);

    expect(signature).toMatch(/^0x[0-9a-f]{130}$/);

    const message = path + toSortedJson(body);
    const isValid = verifySignature(keys.publicKey, signature, message);
    expect(isValid).toBe(true);
  });

  it("sign and verify roundtrip with GET (no body)", () => {
    const keys = generateKeys();
    const path = "/api/v1/client/project/ABC123/user/test/deposit-address/11155111";

    const signature = signRequest(path, null, keys.privateKey);
    const isValid = verifySignature(keys.publicKey, signature, path);
    expect(isValid).toBe(true);
  });

  it("verification fails with wrong public key", () => {
    const keys1 = generateKeys();
    const keys2 = generateKeys();
    const path = "/test";

    const signature = signRequest(path, null, keys1.privateKey);
    const isValid = verifySignature(keys2.publicKey, signature, path);
    expect(isValid).toBe(false);
  });

  it("verification fails with tampered message", () => {
    const keys = generateKeys();
    const path = "/test";

    const signature = signRequest(path, null, keys.privateKey);
    const isValid = verifySignature(keys.publicKey, signature, "/tampered");
    expect(isValid).toBe(false);
  });
});

describe("generateKeys", () => {
  it("produces valid key format", () => {
    const keys = generateKeys();

    expect(keys.privateKey).toMatch(/^0x[0-9a-f]{64}$/);
    // Uncompressed public key: 65 bytes = 130 hex chars
    expect(keys.publicKey).toMatch(/^0x04[0-9a-f]{128}$/);
    expect(keys.address).toMatch(/^0x[0-9a-f]{40}$/);
  });

  it("generates unique keys each time", () => {
    const keys1 = generateKeys();
    const keys2 = generateKeys();
    expect(keys1.privateKey).not.toBe(keys2.privateKey);
  });
});
